import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@treening.ee";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";

  const adminExists = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        passwordHash,
      },
    });
  }

  if ((await prisma.category.count()) === 0) {
    await prisma.category.createMany({
      data: [
        { categoryName: "Yoga" },
        { categoryName: "Strength" },
        { categoryName: "Cardio" },
      ],
    });
  }

  if ((await prisma.trainer.count()) === 0) {
    await prisma.trainer.createMany({
      data: [
        {
          trainerName: "Anna Saar",
          bio: "Certified yoga trainer with focus on beginner classes.",
        },
        {
          trainerName: "Mark Tamm",
          bio: "Strength coach for home and gym training programs.",
        },
      ],
    });
  }

  if ((await prisma.subscriptionPlan.count()) === 0) {
    await prisma.subscriptionPlan.createMany({
      data: [
        {
          planName: "1 Month",
          price: 19.99,
          durationMonths: 1,
        },
        {
          planName: "3 Months",
          price: 49.99,
          durationMonths: 3,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
