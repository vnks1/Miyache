import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar usuário admin padrão
  const adminEmail = 'admin@miyache.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'admin',
      },
    });

    console.log('✅ Admin user created:', {
      email: admin.email,
      role: admin.role,
      password: adminPassword,
    });
  }

  // Criar usuário editor de exemplo
  const editorEmail = 'editor@miyache.com';
  const editorPassword = 'editor123';

  const existingEditor = await prisma.user.findUnique({
    where: { email: editorEmail },
  });

  if (!existingEditor) {
    const passwordHash = await bcrypt.hash(editorPassword, 10);
    
    const editor = await prisma.user.create({
      data: {
        email: editorEmail,
        passwordHash,
        role: 'editor',
      },
    });

    console.log('✅ Editor user created:', {
      email: editor.email,
      role: editor.role,
      password: editorPassword,
    });
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
