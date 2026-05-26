export async function logoutUser(refreshToken: string): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "Gagal melakukan logout dari server.");
  }
}
