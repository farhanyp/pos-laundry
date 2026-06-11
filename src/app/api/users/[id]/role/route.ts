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
    const isOwner = callerRoles.includes(Role.OWNER);

    // Block if neither superadmin nor owner
    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json({ error: "Akses Ditolak: Hanya Superadmin atau Owner yang dapat mengubah role" }, { status: 403 });
    }

    // Owner cannot assign superadmin
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

    if (roleError) {
      console.error("Supabase role fetch error:", roleError, "role:", role);
      if (roleError.code !== "PGRST116") {
        return NextResponse.json({ error: roleError.message }, { status: 500 });
      }
    }

    let roleId = roleData?.id;

    if (!roleId) {
      console.error("Role not found for role_name:", role);
      return NextResponse.json({ error: `Role not found: ${role}` }, { status: 404 });
    }

    // Delete existing roles
    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", id);
    if (deleteError) {
      console.error("Delete existing roles error:", deleteError);
      return NextResponse.json({ error: "Failed to delete existing roles" }, { status: 500 });
    }

    // Insert new role
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: id, role_id: roleId });

    if (insertError) {
      console.error("Insert new role error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Role updated successfully" });
  } catch (error: any) {
    console.error("Unexpected error in role update:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
