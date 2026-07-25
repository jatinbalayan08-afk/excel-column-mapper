import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??  //global memory mein check karo ki prime already bana hua hai?
  new PrismaClient({   // New Prisma Client jo Database ko us krega
    adapter: new PrismaPg({   //Connection PostgreSQL Adapter ke through hoga.
      connectionString,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;  //Agar project Development mode me chal raha hai to Prisma Client ko Global Memory me save kar do.
}