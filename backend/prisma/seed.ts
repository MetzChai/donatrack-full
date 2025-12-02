import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // wipe existing (use carefully)
  await prisma.donation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      fullName: "Admin User",
      email: "admin@example.com",
      password: await hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      fullName: "Normal User",
      email: "user@example.com",
      password: await hashPassword("user123"),
      role: "USER",
    },
  });

  await prisma.campaign.create({
    data: {
      title: "Help Orphanage Children",
      description: "Providing food and shelter for orphanage kids",
      goalAmount: 5000,
      collected: 1200,
      imageUrl: null,
      userId: admin.id,
    },
  });

  await prisma.campaign.create({
    data: {
      title: "Plant Trees Initiative",
      description: "Planting 1000 trees to fight climate change",
      goalAmount: 8000,
      collected: 3000,
      imageUrl: null,
      userId: admin.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
