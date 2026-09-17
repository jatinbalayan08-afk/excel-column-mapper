import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = await prisma.savedFile.findMany({
      where: {
        userId: userId,
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