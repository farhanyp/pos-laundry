import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const { error } = await supabase
      .from("refresh_tokens")
      .update({ is_revoked: true })
      .eq("token", refreshToken);

    if (error) {
      console.error("Error revoking token:", error);
      return NextResponse.json({ error: "Failed to revoke token" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
