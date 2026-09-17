import { prisma } from "../config/prisma";
import { PrismaClient, PlanFeatureKey, PlanInterval, PlanType, Currency } from "../generated/prisma/client";

const defaultPlans = [
  {
    slug: "free",
    name: "Free",
    description: "Everything you need to get started.",
    type: PlanType.FREE,
    isPopular: false,
    currency: Currency.INR,

    prices: [
      {
        interval: PlanInterval.MONTHLY,
        amount: 0,
      },
      {
        interval: PlanInterval.YEARLY,
        amount: 0,
      },
    ],

    features: [
      {
        key: PlanFeatureKey.STORAGE,
        label: "500 MB storage",
        limit: 500,
        unit: "MB",
        sortOrder: 1,
      },
      {
        key: PlanFeatureKey.MEMBERS,
        label: "Up to 3 members",
        limit: 3,
        unit: "members",
        sortOrder: 2,
      },
      {
        key: PlanFeatureKey.PROJECTS,
        label: "Up to 2 projects",
        limit: 2,
        unit: "projects",
        sortOrder: 3,
      },
    ],
  },

  {
    slug: "prime",
    name: "Prime",
    description: "More capacity for your workspaces.",
    type: PlanType.PAID,
    isPopular: true,
    currency: Currency.INR,

    prices: [
      {
        interval: PlanInterval.MONTHLY,
        amount: 50000, // ₹500
      },
      {
        interval: PlanInterval.YEARLY,
        amount: 500000, // ₹5,000
      },
    ],

    features: [
      {
        key: PlanFeatureKey.STORAGE,
        label: "10 GB storage",
        limit: 10,
        unit: "GB",
        sortOrder: 1,
      },
      {
        key: PlanFeatureKey.MEMBERS,
        label: "Up to 10 members",
        limit: 10,
        unit: "members",
        sortOrder: 2,
      },
      {
        key: PlanFeatureKey.PROJECTS,
        label: "Up to 10 projects",
        limit: 10,
        unit: "projects",
        sortOrder: 3,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  for (const planData of defaultPlans) {
    const { prices, features, ...plan } = planData;

    const createdPlan = await prisma.plan.upsert({
      where: {
        slug: plan.slug,
      },

      update: {
        name: plan.name,
        description: plan.description,
        type: plan.type,
        isPopular: plan.isPopular,
        isActive: true,
        currency: plan.currency,
      },

      create: {
        ...plan,
      },
    });

    /*
     * Prices
     *
     * Delete existing prices so the seed stays
     * synchronized with the default configuration.
     */
    await prisma.planPrice.deleteMany({
      where: {
        planId: createdPlan.id,
      },
    });

    await prisma.planPrice.createMany({
      data: prices.map((price) => ({
        ...price,
        planId: createdPlan.id,
      })),
    });

    /*
     * Features
     *
     * Delete existing features so changes to the
     * default feature configuration are reflected.
     */
    await prisma.planFeature.deleteMany({
      where: {
        planId: createdPlan.id,
      },
    });

    await prisma.planFeature.createMany({
      data: features.map((feature) => ({
        ...feature,
        planId: createdPlan.id,
      })),
    });

    console.log(`✅ Seeded plan: ${createdPlan.name}`);
  }

  console.log("🌱 Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Database seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
