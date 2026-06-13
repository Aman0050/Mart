import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function generateReactivationKit() {
  console.log('Generating Supplier Reactivation Kit...');

  try {
    const seedFilters = {
      NOT: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'sl_' } },
          { email: { contains: 'm2_' } },
          { fullName: { contains: 'Soft Launch' } },
          { fullName: { contains: 'Supplier Owner' } },
          { fullName: { contains: 'Test Buyer' } },
          { fullName: { contains: 'Procurement Manager' } },
        ]
      }
    };

    const companySeedFilters = {
      NOT: {
        OR: [
          { companyName: { contains: 'Soft Launch' } },
          { companyName: { contains: 'Global Industry Corp' } },
          { companyName: { contains: 'E2E Mfg' } },
        ]
      }
    };

    // 1. Get Top 5 Suppliers with most leads
    const topSuppliers = await prisma.company.findMany({
      where: { ...companySeedFilters, status: 'active' },
      include: {
        owner: true,
        products: true,
      },
      take: 5
    });

    // 2. Get 10 Unresponded Leads
    const unrespondedLeads = await prisma.lead.findMany({
      where: {
        buyer: seedFilters,
        company: companySeedFilters,
        status: 'new'
      },
      include: {
        buyer: true,
        product: true,
        company: { include: { owner: true } }
      },
      take: 10
    });

    // Build the artifact
    let kit = `# NEXMARTO SUPPLIER REACTIVATION KIT\n\n`;
    
    kit += `> [!NOTE]\n> **Founder Action Required**\n> This is your daily battle plan. You have 23 unresponded leads sitting in the database. Use the outreach templates below to contact these suppliers immediately.\n\n`;

    kit += `## 1. Top 5 High-Priority Targets (Monetization Candidates)\n`;
    kit += `These suppliers have fully active profiles and uploaded products. Pitch them the ₹999/month Starter Plan after helping them close their first lead.\n\n`;

    topSuppliers.forEach(comp => {
      kit += `### ${comp.companyName}\n`;
      kit += `- **Owner:** ${comp.owner?.fullName} (${comp.owner?.phone || 'No Phone'})\n`;
      kit += `- **Products Uploaded:** ${comp.products.length}\n`;
      kit += `- **Action:** Call and ask: *"How was your onboarding experience? Did you need help uploading the rest of your catalog?"*\n\n`;
    });

    kit += `## 2. The Lead Recovery Hit List\n`;
    kit += `Here are the top unresponded enquiries. Copy/Paste the WhatsApp templates below directly to the suppliers.\n\n`;

    unrespondedLeads.forEach(lead => {
      const supplierPhone = lead.company?.owner?.phone || '[Insert Phone]';
      const supplierName = lead.company?.owner?.fullName?.split(' ')[0] || 'Supplier';
      const productName = lead.product?.title || 'a product';
      
      kit += `### Lead: ${lead.leadNumber}\n`;
      kit += `- **To Supplier:** ${lead.company?.companyName} (${supplierPhone})\n`;
      kit += `- **Requested Product:** ${productName}\n`;
      kit += `- **WhatsApp Template:**\n`;
      kit += `  > *"Hi ${supplierName}, this is the Nexmarto Team. You have a verified buyer waiting for a quote on **${productName}**. Please log in today to respond, or this lead will be passed to a competitor in 24 hours. Let me know if you need help logging in!"*\n\n`;
    });

    kit += `## 3. The Monetization Pitch Script (₹999/month)\n`;
    kit += `Once a supplier responds to a lead, hit them with this pitch:\n`;
    kit += `> *"Great job responding to that lead! We are currently opening our **Starter Tier (₹999/mo)** to our first 10 founding suppliers. This gives you the 'Verified' badge and guarantees you priority placement in our search results, which means you get first access to all incoming RFQs. Want me to set up a 14-day free trial of the premium tier for you?"*\n\n`;

    kit += `## 4. Daily Founder Actions Checklist\n`;
    kit += `- [ ] Call 5 suppliers to verify their profile details.\n`;
    kit += `- [ ] Send WhatsApp Lead Alerts for every new enquiry.\n`;
    kit += `- [ ] Pitch the Starter Plan to 2 active suppliers.\n`;

    // Write artifact
    const artifactPath = process.env.APPDATA 
      ? path.join(process.env.APPDATA, '.gemini/antigravity/brain/3ecc35ff-fc0d-498d-868d-38209d0d92e0/supplier_reactivation_kit.md')
      : './supplier_reactivation_kit.md';
    
    try {
      fs.writeFileSync(artifactPath, kit);
      console.log(`Successfully generated artifact at ${artifactPath}`);
    } catch (e) {
      console.log('Could not write to APPDATA dir, writing locally.');
      fs.writeFileSync('./supplier_reactivation_kit.md', kit);
    }

  } catch (error) {
    console.error('Error generating Reactivation Kit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateReactivationKit();
