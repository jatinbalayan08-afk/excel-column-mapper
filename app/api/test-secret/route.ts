import { NextResponse } from "next/server";
import { getDatabaseSecret } from "@/lib/secrets";

export async function GET() {
  const secret = await getDatabaseSecret();

  return NextResponse.json(secret);
}