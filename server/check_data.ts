
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Workflow Definitions ---');
    const defs = await prisma.workflowDefinition.findMany();
    console.log(`Found ${defs.length} definitions`);
    defs.forEach(d => console.log(`- ${d.name} (${d.entityType}:${d.action}) IsActive:${d.isActive}`));

    console.log('\n--- Checking Approval Requests ---');
    const reqs = await prisma.approvalRequest.findMany();
    console.log(`Found ${reqs.length} requests`);
    reqs.forEach(r => console.log(`- ${r.id} [${r.status}] Entity:${r.entityType} RequestedBy:${r.requestedById}`));

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
