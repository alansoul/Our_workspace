import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const university = await prisma.university.upsert({
    where: { shortCode: 'IIITNR' },
    update: {},
    create: {
      name: 'Dr. Shyama Prasad Mukherjee IIIT Naya Raipur',
      shortCode: 'IIITNR',
      emailDomain: 'iiitnr.edu.in',
      isActive: true,
    },
  });

  console.log('✅ University seeded successfully:', university);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });