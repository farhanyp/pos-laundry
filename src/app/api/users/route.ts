import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/jwt";
import { Role } from "@/types/enums";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
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

    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, email, created_at,
        user_roles (
          roles (
            role_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let users = data.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.created_at,
      roles: u.user_roles?.map((ur: any) => ur.roles?.role_name).filter(Boolean) || [],
    }));

    const isSuperAdmin = callerRoles.includes(Role.SUPERADMIN);
    if (!isSuperAdmin) {
      users = users.filter((u: any) => !u.roles.includes(Role.SUPERADMIN));
    }

    return NextResponse.json({ data: users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
