import { createClient } from "@/lib/supabase/client";

export type LoginUserData = {
  email: string;
  password: string;
};

export async function loginUser({ email, password }: LoginUserData) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Gagal masuk: Email atau password salah.");
  }

  return data;
}
