import { createClient } from "@/lib/supabase/client";

export type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterUserData) {
  const supabase = createClient();

  // 1. Sign Up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  if (authError) {
    throw new Error(`Gagal mendaftar: ${authError.message}`);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("Gagal mendapatkan data user setelah pendaftaran.");
  }

  // 2. Insert into users table
  const { error: userError } = await supabase
    .from("users")
    .insert({
      id: userId,
      name: data.name,
      email: data.email,
    });

  if (userError) {
    console.error("User insert error:", userError);
    throw new Error("Terjadi kesalahan saat menyimpan profil pengguna.");
  }

  // 3. Get 'kasir' role id
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("role_name", "kasir")
    .single();

  if (roleError || !roleData) {
    console.error("Role fetch error:", roleError);
    throw new Error("Gagal menemukan role kasir di sistem.");
  }

  // 4. Assign role in user_roles
  const { error: assignRoleError } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: roleData.id,
    });

  if (assignRoleError) {
    console.error("Role assign error:", assignRoleError);
    throw new Error("Gagal menetapkan role pada akun Anda.");
  }

  return authData;
}
