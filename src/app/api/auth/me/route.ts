import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();

  if (!session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
