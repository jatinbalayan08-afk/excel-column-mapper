import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mappings = body.mappings;

    await prisma.mapping.createMany({
      data: mappings,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save mappings",
      },
      {
        status: 500,
      }
    );
  }
}