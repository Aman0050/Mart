import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateDailyReport() {
  console.log('=============================================');
  console.log(' NEXMARTO CLOSED BETA - DAILY OPERATIONS DASH');
  console.log(' Date:', new Date().toISOString().split('T')[0]);
  console.log('=============================================');

  try {
    // 1. Users & Companies
    const totalUsers = await prisma.user.count();
    const totalCompanies = await prisma.company.count();
    const activeSuppliers = await prisma.company.count({ where: { owner: { role: 'seller' }, status: 'active' } });
    const activeBuyers = await prisma.company.count({ where: { owner: { role: 'buyer' }, status: 'active' } });

    console.log(`\n👥 REGISTRATIONS`);
    console.log(`- Total Users:      ${totalUsers}`);
    console.log(`- Total Companies:  ${totalCompanies}`);
    console.log(`- Active Suppliers: ${activeSuppliers}`);
    console.log(`- Active Buyers:    ${activeBuyers}`);

    // 2. Products
    const totalProducts = await prisma.product.count();
    // Wait, products images: is there an 'images' field? No, it's a relation 'images'. We can check products without images.
    const productsMissingImages = (await prisma.product.findMany({ include: { images: true } })).filter(p => p.images.length === 0).length;
    const productsMissingPrice = await prisma.product.count({ where: { OR: [{ price: null }, { price: 0 }] } });

    console.log(`\n📦 PRODUCTS`);
    console.log(`- Total Uploaded:           ${totalProducts}`);
    console.log(`- Missing Images:           ${productsMissingImages}`);
    console.log(`- Missing Price:            ${productsMissingPrice}`);

    // 3. Leads & RFQs
    const totalLeads = await prisma.lead.count();
    const totalRFQs = await prisma.rfq.count();

    console.log(`\n🎯 LEADS & ENQUIRIES`);
    console.log(`- Total Enquiries (Leads):  ${totalLeads}`);
    console.log(`- Total RFQs Created:       ${totalRFQs}`);

    console.log('\n=============================================');
    console.log('End of Report');
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateDailyReport();
