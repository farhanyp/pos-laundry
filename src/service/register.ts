export type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterUserData) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "Gagal mendaftar");
  }

  return responseData;
}
