import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FAKE_USER_ID = "user-123"; 

export async function GET() {
  try {
    const files = await prisma.savedFile.findMany({
      where: {
        userId: FAKE_USER_ID,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fileName: true,
        createdAt: true,  
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch files." },
      { status: 500 }
    );
  }
}