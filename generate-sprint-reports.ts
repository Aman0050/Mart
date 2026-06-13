import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function generateReports() {
  console.log('Generating Phase 1-4 Reports...\n');

  // ---------------------------------------------------------
  // PHASE 1: SUPPLIER ACTIVATION REPORT
  // ---------------------------------------------------------
  const suppliers = await prisma.company.findMany({
    where: { owner: { role: 'seller' } },
    include: { products: true, documents: true, owner: true }
  });

  let supplierReport = `# PHASE 1: SUPPLIER ACTIVATION REPORT\n\n`;
  supplierReport += `| Company Name | Status | Products Uploaded | Docs Uploaded | Profile Complete | Meets Criteria |\n`;
  supplierReport += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  let activeSupplierCount = 0;

  for (const supplier of suppliers) {
    const productsCount = supplier.products.length;
    const docsCount = supplier.documents.length;
    
    // Simple profile completion check
    let completionScore = 0;
    if (supplier.companyName) completionScore += 20;
    if (supplier.description) completionScore += 20;
    if (supplier.logoUrl) completionScore += 20;
    if (supplier.coverImageUrl) completionScore += 10;
    if (supplier.gstNumber || supplier.panNumber) completionScore += 30;

    const meetsCriteria = (productsCount >= 10 && completionScore >= 90) ? '✅ YES' : '❌ NO';
    if (meetsCriteria === '✅ YES') activeSupplierCount++;

    supplierReport += `| ${supplier.companyName} | ${supplier.status} | ${productsCount} | ${docsCount} | ${completionScore}% | ${meetsCriteria} |\n`;
  }

  // ---------------------------------------------------------
  // PHASE 3: PRODUCT POPULATION REPORT
  // ---------------------------------------------------------
  const products = await prisma.product.findMany({
    include: { images: true, company: true }
  });

  let productReport = `# PHASE 3: PRODUCT POPULATION REPORT\n\n`;
  productReport += `**Total Products:** ${products.length}\n**Target:** 50\n\n`;
  productReport += `### Product Audit (Missing Data)\n`;
  productReport += `| Product Name | Company | Missing Images | Missing Price | Missing MOQ | SEO Ready |\n`;
  productReport += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const product of products) {
    const missingImages = product.images.length === 0 ? '❌ YES' : '✅ NO';
    const missingPrice = (!product.price || Number(product.price) === 0) ? '❌ YES' : '✅ NO';
    const missingMOQ = !product.minimumOrderQuantity ? '❌ YES' : '✅ NO';
    const seoReady = (product.slug && product.seoTitle && product.seoDescription) ? '✅ YES' : '❌ NO';

    productReport += `| ${product.title} | ${product.company?.companyName || 'Unknown'} | ${missingImages} | ${missingPrice} | ${missingMOQ} | ${seoReady} |\n`;
  }

  // Write reports to artifacts directory so user can see them
  const baseDir = process.env.APPDATA ? `${process.env.APPDATA}/.gemini/antigravity/brain/3ecc35ff-fc0d-498d-868d-38209d0d92e0/scratch` : './scratch';
  
  // Since we don't have access to the exact APPDATA path easily in this script without complex logic, 
  // I will just write them to the root and then I (the AI) will read them or they can be seen here.
  // Actually, I'll just print them to console so the AI can capture them and format them nicely into a markdown artifact.
  
  console.log(supplierReport);
  console.log('\n=========================================\n');
  console.log(productReport);

  await prisma.$disconnect();
}

generateReports();
