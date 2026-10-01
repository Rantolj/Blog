import { NextRequest } from "next/server";

const ADMIN_HEADER = "x-admin-token";

export function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, "").trim();
}

export function verifyAdminToken(request: NextRequest): boolean {
  const headerToken = request.headers.get(ADMIN_HEADER);
  const envToken = process.env.ADMIN_TOKEN;
  return !!envToken && !!headerToken && headerToken === envToken;
}
