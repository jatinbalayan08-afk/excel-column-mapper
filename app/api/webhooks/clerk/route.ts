import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request);
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address ?? "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ");

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail,
          name: fullName || null,
        },
        create: {
          clerkId: id,
          email: primaryEmail,
          name: fullName || null,
        },
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response("Webhook verification failed", { status: 400 });
  }
}