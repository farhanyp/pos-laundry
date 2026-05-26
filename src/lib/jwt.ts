import { SignJWT, jwtVerify } from "jose";
import { TokenPayload } from "@/types/auth";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // For development fallback if secret isn't set, though it's recommended to set it in .env
    return new TextEncoder().encode("default_development_secret_key_123!");
  }
  return new TextEncoder().encode(secret);
};

export const signAccessToken = async (payload: TokenPayload) => {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
};

export const signRefreshToken = async (payload: { userId: string }) => {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
};
