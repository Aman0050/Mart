import { PrismaClient, UserRole } from '@prisma/client';
require('dotenv').config();


const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return '$2b$10$EPfA2.N5d3.vY2G5Yq.C4OgTjR3U52c6QGzY96zYfH.tDkPzO9q8W'; // bcrypt hash for password123
}

function genPhone(prefix: string, i: number) {
  return `${prefix}${i.toString().padStart(5, '0')}`;
}

async function main() {
  console.log('Starting PAT Seeding Script...');
  const passwordHash = await hashPassword('password123');

  // --- 1. ADMIN ACCOUNTS ---
  console.log('Seeding Admins...');
  const adminSuper = await prisma.user.upsert({
    where: { email: 'admin@nexmarto.com' },
    update: {},
    create: { email: 'admin@nexmarto.com', phone: '+919999900001', passwordHash, fullName: 'Super Admin', role: 'super_admin' },
  });

  const adminOps = await prisma.user.upsert({
    where: { email: 'operations@nexmarto.com' },
    update: {},
    create: { email: 'operations@nexmarto.com', phone: '+919999900002', passwordHash, fullName: 'Operations Manager', role: 'operations_admin' },
  });

  const adminMod = await prisma.user.upsert({
    where: { email: 'moderator@nexmarto.com' },
    update: {},
    create: { email: 'moderator@nexmarto.com', phone: '+919999900003', passwordHash, fullName: 'Content Moderator', role: 'admin' },
  });

  // --- CATEGORY ---
  const cat = await prisma.category.upsert({
    where: { slug: 'industrial-cables' },
    update: {},
    create: { name: 'Industrial Cables', slug: 'industrial-cables' }
  });

  // --- 2. SUPPLIER ACCOUNTS ---
  console.log('Seeding Suppliers...');
  const suppliersData = [
    { email: 'supplier1@nexmarto.com', name: 'Supplier 1', companyName: 'ABC Electricals Pvt Ltd', slug: 'abc-electricals-pvt-ltd', industry: 'Electrical Equipment' },
    { email: 'supplier2@nexmarto.com', name: 'Supplier 2', companyName: 'BuildMax Construction Supplies', slug: 'buildmax-construction-supplies', industry: 'Construction' },
    { email: 'supplier3@nexmarto.com', name: 'Supplier 3', companyName: 'AgroTech Industries', slug: 'agrotech-industries', industry: 'Agriculture' },
    { email: 'supplier4@nexmarto.com', name: 'Supplier 4', companyName: 'Precision Engineering Works', slug: 'precision-engineering-works', industry: 'Industrial Machinery' },
    { email: 'supplier5@nexmarto.com', name: 'Supplier 5', companyName: 'TechWorld IT Solutions', slug: 'techworld-it-solutions', industry: 'IT Hardware' },
  ];

  const suppliers = [];
  let sIndex = 1;
  for (const s of suppliersData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, phone: genPhone('+9198000', sIndex), passwordHash, fullName: s.name, role: 'seller' },
    });
    
    // Create company
    const company = await prisma.company.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        ownerId: user.id,
        companyName: s.companyName,
        slug: s.slug,
        status: 'active',
        businessType: 'manufacturer',
        yearEstablished: 2020,
      }
    });

    suppliers.push({ user, company });
    sIndex++;
  }

  // --- 3. BUYER ACCOUNTS ---
  console.log('Seeding Buyers...');
  const buyersData = [
    { email: 'buyer1@nexmarto.com', name: 'Buyer 1' },
    { email: 'buyer2@nexmarto.com', name: 'Buyer 2' },
    { email: 'buyer3@nexmarto.com', name: 'Buyer 3' },
    { email: 'buyer4@nexmarto.com', name: 'Buyer 4' },
    { email: 'buyer5@nexmarto.com', name: 'Buyer 5' },
  ];

  const buyers = [];
  let bIndex = 1;
  for (const b of buyersData) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: { email: b.email, phone: genPhone('+9188000', bIndex), passwordHash, fullName: b.name, role: 'buyer' },
    });
    buyers.push(user);
    bIndex++;
  }

  // --- SCENARIO 1: Buyer 1 Enquiry for Supplier 1 ---
  console.log('Executing Scenario 1: Buyer 1 Enquiry...');
  const prod1 = await prisma.product.upsert({
    where: { slug: 'industrial-cable-x1' },
    update: {},
    create: {
      companyId: suppliers[0].company.id,
      categoryId: cat.id,
      title: 'Industrial Cable X1',
      slug: 'industrial-cable-x1',
      price: 1500,
      status: 'active',
    }
  });

  const lead1 = await prisma.lead.create({
    data: {
      leadNumber: 'LD-1001',
      companyId: suppliers[0].company.id,
      sellerId: suppliers[0].user.id,
      buyerId: buyers[0].id,
      productId: prod1.id,
      subject: 'Enquiry for Industrial Cable X1',
      message: 'Need 1000 meters for new factory setup.',
      status: 'new',
      source: 'product_page'
    }
  });

  await prisma.lead.update({
    where: { id: lead1.id },
    data: { status: 'contacted' }
  });

  // --- SCENARIO 2: RFQ ---
  console.log('Executing Scenario 2: RFQ & Quotation...');
  const rfq1 = await prisma.rfq.create({
    data: {
      buyerId: buyers[1].id,
      categoryId: cat.id,
      title: 'Require Cement Bags in Bulk',
      description: 'Require 500 bags of Portland Cement',
      quantity: 500,
      unit: 'bag',
      budget: 300,
      status: 'open',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.rfqResponse.create({
    data: {
      rfqId: rfq1.id,
      supplierId: suppliers[1].company.id,
      sellerId: suppliers[1].user.id,
      quotedPrice: 290,
      message: 'We can deliver within 2 days.',
      status: 'accepted'
    }
  });

  // --- SCENARIO 3 & 4: Products Moderation ---
  console.log('Executing Scenarios 3 & 4: Products Moderation...');
  await prisma.product.upsert({
    where: { slug: 'low-quality-product' },
    update: {},
    create: {
      companyId: suppliers[3].company.id,
      categoryId: cat.id,
      title: 'Low Quality Product',
      slug: 'low-quality-product',
      price: 10,
      status: 'rejected',
    }
  });

  console.log('PAT Seeding Complete! All 13 test accounts and 5 scenarios generated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
