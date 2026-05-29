import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/jwt";
import { Role } from "@/types/enums";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    // Verify JWT signature of the refresh token
    const decoded = await verifyToken(refreshToken);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid refresh token signature" }, { status: 401 });
    }

    const userId = decoded.userId as string;

    // Verify against database
    const { data: dbToken, error: tokenError } = await supabase
      .from("refresh_tokens")
      .select("id, is_revoked, expires_at")
      .eq("token", refreshToken)
      .eq("user_id", userId)
      .single();

    if (tokenError || !dbToken) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    if (dbToken.is_revoked) {
      // Token reuse detected - should ideally revoke all tokens for this user for security
      await supabase.from("refresh_tokens").update({ is_revoked: true }).eq("user_id", userId);
      return NextResponse.json({ error: "Token has been revoked. Please log in again." }, { status: 401 });
    }

    if (new Date(dbToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
    }

    // Fetch user and roles
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, created_at")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role:roles(role_name)")
      .eq("user_id", userId);

    let roles: Role[] = [Role.STAFF];
    if (!rolesError && userRoles && userRoles.length > 0) {
      const extracted = userRoles.map((ur: any) => ur.role?.role_name as Role).filter(Boolean);
      if (extracted.length > 0) roles = extracted;
    }

    // Generate new tokens
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    const newRefreshToken = await signRefreshToken({
      userId: user.id,
    });

    // Revoke old token and insert new one
    await supabase.from("refresh_tokens").update({ is_revoked: true }).eq("id", dbToken.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertError } = await supabase
      .from("refresh_tokens")
      .insert({
        user_id: user.id,
        token: newRefreshToken,
        expires_at: expiresAt.toISOString(),
        is_revoked: false,
      });

    if (insertError) {
      return NextResponse.json({ error: "Error rotating token" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
        created_at: user.created_at,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
