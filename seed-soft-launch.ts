import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedSoftLaunch() {
  console.log('🚀 Executing 30-Day Soft Launch Simulation...\n');

  try {
    // ---------------------------------------------------------
    // 1. SCALE TO 20 SUPPLIERS
    // ---------------------------------------------------------
    console.log('Scaling to 20 Active Suppliers...');
    const currentSuppliersCount = await prisma.company.count({ where: { owner: { role: 'seller' }, status: 'active' } });
    const suppliersNeeded = Math.max(0, 20 - currentSuppliersCount);

    for (let i = 0; i < suppliersNeeded; i++) {
      const user = await prisma.user.create({
        data: {
          fullName: `Soft Launch Supplier ${i + 1}`,
          email: `supplier_sl_${i}@example.com`,
          phone: `+915555555${i}${i}${i}`,
          role: 'seller',
          status: 'active',
          emailVerified: true,
          phoneVerified: true,
        }
      });

      await prisma.company.create({
        data: {
          ownerId: user.id,
          companyName: `Soft Launch Enterprises ${i + 1}`,
          slug: `sl-enterprises-${i+1}-${uuidv4().substring(0,6)}`,
          gstNumber: `GST-${uuidv4().substring(0, 10).toUpperCase()}`,
          panNumber: `PAN-${uuidv4().substring(0, 6).toUpperCase()}`,
          description: `Premium supplier onboarded during the 30-day soft launch phase.`,
          logoUrl: `https://ui-avatars.com/api/?name=SL+Enterprises&background=random`,
          coverImageUrl: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80`,
          verified: true,
          status: 'active',
          businessType: 'distributor',
        }
      });
    }

    // ---------------------------------------------------------
    // 2. SCALE TO 50 BUYERS
    // ---------------------------------------------------------
    console.log('Scaling to 50 Active Buyers...');
    const currentBuyers = await prisma.user.count({ where: { role: 'buyer', status: 'active' } });
    const buyersNeeded = Math.max(0, 50 - currentBuyers);
    
    for (let i = 0; i < buyersNeeded; i++) {
      await prisma.user.create({
        data: {
          fullName: `Soft Launch Buyer ${i + 1}`,
          email: `buyer_sl_${i}@example.com`,
          phone: `+914444444${i}${i}${i}`,
          role: 'buyer',
          status: 'active',
          emailVerified: true,
          phoneVerified: true,
        }
      });
    }

    // ---------------------------------------------------------
    // 3. SCALE TO 500 PRODUCTS
    // ---------------------------------------------------------
    console.log('Scaling to 500 Products...');
    const allSuppliers = await prisma.company.findMany({ where: { owner: { role: 'seller' }, status: 'active' } });
    
    for (const supplier of allSuppliers) {
      const existingProducts = await prisma.product.count({ where: { companyId: supplier.id } });
      const needed = Math.max(0, 25 - existingProducts); 

      for (let i = 0; i < needed; i++) {
        const title = `Soft Launch Product ${i} - ${supplier.companyName.split(' ')[0]}`;
        const newProduct = await prisma.product.create({
          data: {
            companyId: supplier.id,
            title: title,
            slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().substring(0, 6)}`,
            description: `A highly requested product added during the soft launch.`,
            price: Math.floor(Math.random() * 3000) + 100,
            minimumOrderQuantity: Math.floor(Math.random() * 100) + 10,
            status: 'active',
            seoTitle: `Bulk ${title}`,
            seoDescription: `Best wholesale prices.`,
          }
        });

        await prisma.productImage.create({
          data: {
            productId: newProduct.id,
            imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80',
            isPrimary: true,
          }
        });
      }
    }

    // ---------------------------------------------------------
    // 4. SCALE TO 100 ENQUIRIES & FIX RESPONSE RATE (>50%)
    // ---------------------------------------------------------
    console.log('Scaling to 100 Enquiries and Optimizing Response Rate...');
    const currentLeads = await prisma.lead.count();
    const leadsNeeded = Math.max(0, 100 - currentLeads);
    
    const allActiveBuyers = await prisma.user.findMany({ where: { role: 'buyer', status: 'active' } });
    const allActiveProducts = await prisma.product.findMany({ 
      where: { status: 'active', company: { status: 'active' } },
      include: { company: true }
    });

    for (let i = 0; i < leadsNeeded; i++) {
      const buyer = allActiveBuyers[Math.floor(Math.random() * allActiveBuyers.length)];
      const product = allActiveProducts[Math.floor(Math.random() * allActiveProducts.length)];
      if (!product || !product.companyId || !product.company?.ownerId) continue;

      const leadNumber = `LD-SL-${uuidv4().substring(0, 6).toUpperCase()}`;

      const lead = await prisma.lead.create({
        data: {
          leadNumber,
          buyerId: buyer.id,
          sellerId: product.company.ownerId,
          companyId: product.companyId,
          productId: product.id,
          subject: `Request for Soft Launch Quotation: ${product.title}`,
          message: `We need this ASAP. Please quote.`,
          quantityRequired: product.minimumOrderQuantity * 3,
          budget: Number(product.price || 0) * (product.minimumOrderQuantity * 3),
          status: 'new',
          source: 'search_page',
          priority: 'high',
        }
      });
    }

    // Force response rate to >50% by simulating supplier replies on older leads
    const allUnansweredLeads = await prisma.lead.findMany({ where: { status: 'new' } });
    // We want at least 55% of all 100 leads to be answered
    let answeredCount = await prisma.lead.count({ where: { status: { in: ['contacted', 'quoted', 'closed'] } } });
    
    for (const lead of allUnansweredLeads) {
      if (answeredCount >= 55) break; // target hit
      
      await prisma.leadMessage.create({
        data: {
          leadId: lead.id,
          senderId: lead.sellerId,
          message: `Thanks for the enquiry via WhatsApp Alert! We can do this for ₹${lead.budget}. Let's close this.`,
          messageType: 'text',
        }
      });
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'contacted' }
      });
      answeredCount++;
    }

    console.log('\n✅ SOFT LAUNCH SIMULATION COMPLETE!');
  } catch (error) {
    console.error('Error during Soft Launch seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSoftLaunch();
