import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
    },
  });

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users:read' },
      update: {},
      create: { name: 'users:read', description: 'Read users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users:write' },
      update: {},
      create: { name: 'users:write', description: 'Create/update users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users:delete' },
      update: {},
      create: { name: 'users:delete', description: 'Delete users' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:read' },
      update: {},
      create: { name: 'roles:read', description: 'Read roles' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:write' },
      update: {},
      create: { name: 'roles:write', description: 'Create/update roles' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:delete' },
      update: {},
      create: { name: 'roles:delete', description: 'Delete roles' },
    }),
  ]);

  // Assign all permissions to admin role
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  // Assign admin role to user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin email: admin@example.com');
  console.log('🔑 Admin password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
