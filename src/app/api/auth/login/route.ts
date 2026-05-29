import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as argon2 from "argon2";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { Role } from "@/types/enums";

// We use standard supabase client for admin operations here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Fallback to anon key if service role is not available
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Fetch user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, password, created_at")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password with argon2
    try {
      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Error verifying password" }, { status: 500 });
    }

    // Fetch roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select(`
        role:roles(role_name)
      `)
      .eq("user_id", user.id);

    let roles: Role[] = [Role.STAFF];
    if (!rolesError && userRoles && userRoles.length > 0) {
      const extracted = userRoles
        .map((ur: any) => ur.role?.role_name as Role)
        .filter(Boolean);
      if (extracted.length > 0) roles = extracted;
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { error: insertError } = await supabase
      .from("refresh_tokens")
      .insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt.toISOString(),
        is_revoked: false,
      });

    if (insertError) {
      console.error("Error storing refresh token", insertError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
