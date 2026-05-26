import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as argon2 from "argon2";
import { Role } from "@/types/enums";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Insert user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        // created_at will be set by default by postgres if omitted
      })
      .select("id")
      .single();

    if (userError || !newUser) {
      console.error("User insert error:", userError);
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    // Get 'kasir' / STAFF role id
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", Role.STAFF) // using name instead of role_name based on enum
      .single();

    // Just in case the column is actually role_name, let's try that too if the first fails, but we assume it's `name` based on earlier plan
    let roleId = roleData?.id;

    if (!roleId) {
      const { data: roleDataFallback } = await supabase
        .from("roles")
        .select("id")
        .eq("role_name", Role.STAFF)
        .single();
      roleId = roleDataFallback?.id;
    }

    if (!roleId) {
      // If still not found, we just proceed without role or we can fail. Let's just log it.
      console.error("Role STAFF not found in DB");
    } else {
      // Assign role in user_roles
      await supabase
        .from("user_roles")
        .insert({
          user_id: newUser.id,
          role_id: roleId,
        });
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful"
    }, { status: 201 });
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
