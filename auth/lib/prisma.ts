import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({
  connectionString,
  pool: { max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 },
});
const prisma = new PrismaClient({ adapter });

export { prisma };
