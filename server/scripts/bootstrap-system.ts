
import { PrismaClient, TenantType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function bootstrapSystem() {
  console.log('🚀 Bootstrapping System Tenant...');

  // 1. Check for existing System Tenant
  const existingSystem = await prisma.tenant.findFirst({
    where: { isSystem: true },
  });

  if (existingSystem) {
    console.log(`✅ System Tenant already exists: ${existingSystem.name} (${existingSystem.id})`);
    return;
  }

  // 2. Create System Tenant
  console.log('⚙️ Creating System Tenant (PROVIDER)...');
  const systemTenant = await prisma.tenant.create({
    data: {
      name: 'Smart ERP Provider (System)',
      slug: 'system-provider',
      type: TenantType.PROVIDER,
      isSystem: true,
      status: 'ACTIVE',
      email: 'admin@smarterp.az',
      website: 'https://smarterp.az',
    },
  });

  console.log(`✅ Created System Tenant: ${systemTenant.id}`);

  // 3. Create Super Admin for System Tenant
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Admin123!', salt);

  const adminEmail = 'superadmin@smarterp.az';
  
  // Check if user exists (maybe from old migration)
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingUser) {
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        fullName: 'System Super Admin',
        tenantId: systemTenant.id,
        // We'll assign specific permissions later via Role
      },
    });
    console.log(`✅ Created System Admin User: ${adminUser.email}`);
  } else {
    // Determine if we need to link it
    console.log(`⚠️ System Admin User ${adminEmail} already exists. Linking to System Tenant...`);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { tenantId: systemTenant.id },
    });
  }

  // 4. Create Ledger if needed (implicitly created by business logic, but we can init empty)
  // No explicit ledger table init needed as it's a transaction log.

  console.log('🎉 System Bootstrap Complete!');
}

bootstrapSystem()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
