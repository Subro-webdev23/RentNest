import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

async function main() {
  const hashedPassword = await bcrypt.hash("123456789", SALT_ROUNDS);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@rentnest.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@rentnest.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Landlord user
  const landlord = await prisma.user.upsert({
    where: { email: "landlord@rentnest.com" },
    update: {},
    create: {
      name: "Karim Landlord",
      email: "landlord@rentnest.com",
      password: hashedPassword,
      role: "LANDLORD",
      status: "ACTIVE",
    },
  });

  // Tenant user
  const tenant = await prisma.user.upsert({
    where: { email: "tenant@rentnest.com" },
    update: {},
    create: {
      name: "Rahim Tenant",
      email: "tenant@rentnest.com",
      password: hashedPassword,
      role: "TENANT",
      status: "ACTIVE",
    },
  });

  // Category
  const category = await prisma.category.upsert({
    where: { name: "Apartment" },
    update: {},
    create: { name: "Apartment" },
  });

  console.log("✅ Seed completed:");
  console.log({
    admin: { id: admin.id, email: admin.email },
    landlord: { id: landlord.id, email: landlord.email },
    tenant: { id: tenant.id, email: tenant.email },
    category: { id: category.id, name: category.name },
  });
  console.log("password: 123456789");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });