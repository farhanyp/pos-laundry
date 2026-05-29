import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/jwt";
import { Role } from "@/types/enums";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    let callerRoles: Role[] = [];
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      if (decoded && decoded.roles) {
        callerRoles = decoded.roles as Role[];
      }
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    const isSuperAdmin = callerRoles.includes(Role.SUPERADMIN);

    if (role === Role.SUPERADMIN && !isSuperAdmin) {
      return NextResponse.json({ error: "Hanya Superadmin yang dapat memberikan role Superadmin" }, { status: 403 });
    }

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Get role id
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("role_name", role)
      .single();

    let roleId = roleData?.id;

    if (!roleId) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Delete existing roles
    await supabase.from("user_roles").delete().eq("user_id", id);

    // Insert new role
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: id, role_id: roleId });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Role updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
