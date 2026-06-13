import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedMilestone2() {
  console.log('🚀 Starting Milestone 2 Seeding & Phase 5 Feedback Collection...\n');

  try {
    // ---------------------------------------------------------
    // 1. SCALE SUPPLIERS TO 10
    // ---------------------------------------------------------
    console.log('Scaling to 10 Active Suppliers...');
    
    // Check how many we need
    const currentSuppliersCount = await prisma.company.count({ where: { owner: { role: 'seller' }, status: 'active' } });
    const suppliersNeeded = Math.max(0, 10 - currentSuppliersCount);

    const newSupplierIds: string[] = [];
    for (let i = 0; i < suppliersNeeded; i++) {
      // Create user
      const user = await prisma.user.create({
        data: {
          fullName: `Supplier Owner ${i + 1}`,
          email: `supplier_m2_${i}@example.com`,
          phone: `+918888888${i}${i}${i}`,
          role: 'seller',
          status: 'active',
          emailVerified: true,
          phoneVerified: true,
        }
      });

      // Create company
      const comp = await prisma.company.create({
        data: {
          ownerId: user.id,
          companyName: `Global Industry Corp ${i + 1}`,
          slug: `global-industry-${i+1}-${uuidv4().substring(0,6)}`,
          gstNumber: `GST-${uuidv4().substring(0, 10).toUpperCase()}`,
          panNumber: `PAN-${uuidv4().substring(0, 6).toUpperCase()}`,
          description: `Leading B2B manufacturer added in Milestone 2. We specialize in bulk exports.`,
          logoUrl: `https://ui-avatars.com/api/?name=Global+Industry&background=random`,
          coverImageUrl: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80`,
          verified: true,
          status: 'active',
          businessType: 'manufacturer',
        }
      });
      newSupplierIds.push(comp.id);
    }

    // ---------------------------------------------------------
    // 2. SCALE PRODUCTS TO 200
    // ---------------------------------------------------------
    console.log('Scaling to 200 Products...');
    const allSuppliers = await prisma.company.findMany({
      where: { owner: { role: 'seller' }, status: 'active' },
    });

    for (const supplier of allSuppliers) {
      const existingProducts = await prisma.product.count({ where: { companyId: supplier.id } });
      let needed = 20 - existingProducts; // Ensure average 20 products per supplier = 200 total

      for (let i = 0; i < needed; i++) {
        const title = `Industrial Component V${i} - ${supplier.companyName.split(' ')[0]}`;
        const newProduct = await prisma.product.create({
          data: {
            companyId: supplier.id,
            title: title,
            slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().substring(0, 6)}`,
            description: `High-quality industrial component. Bulk available.`,
            price: Math.floor(Math.random() * 2000) + 150,
            minimumOrderQuantity: Math.floor(Math.random() * 50) + 20,
            status: 'active',
            seoTitle: `Buy ${title} in Bulk`,
            seoDescription: `Get the best wholesale prices for ${title}.`,
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
    // 3. SCALE BUYERS TO 20
    // ---------------------------------------------------------
    console.log('Scaling to 20 Active Buyers...');
    const currentBuyers = await prisma.user.count({ where: { role: 'buyer', status: 'active' } });
    const buyersNeeded = Math.max(0, 20 - currentBuyers);
    
    for (let i = 0; i < buyersNeeded; i++) {
      await prisma.user.create({
        data: {
          fullName: `Procurement Manager ${i + 1}`,
          email: `procurement_m2_${i}@example.com`,
          phone: `+917777777${i}${i}${i}`,
          role: 'buyer',
          status: 'active',
          emailVerified: true,
          phoneVerified: true,
        }
      });
    }

    // ---------------------------------------------------------
    // 4. SCALE ENQUIRIES TO 50
    // ---------------------------------------------------------
    console.log('Scaling to 50 Enquiries/Leads...');
    const currentLeads = await prisma.lead.count();
    const leadsNeeded = Math.max(0, 50 - currentLeads);
    
    const allActiveBuyers = await prisma.user.findMany({ where: { role: 'buyer', status: 'active' } });
    const allActiveProducts = await prisma.product.findMany({ 
      where: { status: 'active', company: { status: 'active' } },
      include: { company: true }
    });

    for (let i = 0; i < leadsNeeded; i++) {
      const buyer = allActiveBuyers[Math.floor(Math.random() * allActiveBuyers.length)];
      const product = allActiveProducts[Math.floor(Math.random() * allActiveProducts.length)];
      
      if (!product || !product.companyId || !product.company?.ownerId) continue;

      const leadNumber = `LD-${new Date().getFullYear()}${new Date().getMonth() + 1}-M2-${uuidv4().substring(0, 4).toUpperCase()}`;

      await prisma.lead.create({
        data: {
          leadNumber,
          buyerId: buyer.id,
          sellerId: product.company.ownerId,
          companyId: product.companyId,
          productId: product.id,
          subject: `Request for Quotation: ${product.title}`,
          message: `We need a large quantity of ${product.title}. Please send wholesale pricing sheet.`,
          quantityRequired: product.minimumOrderQuantity * 5,
          budget: Number(product.price || 0) * (product.minimumOrderQuantity * 5),
          status: 'new',
          source: 'search_page',
          priority: 'high',
        }
      });
    }

    // ---------------------------------------------------------
    // 5. PHASE 5: FEEDBACK COLLECTION SIMULATION
    // ---------------------------------------------------------
    console.log('Simulating Feedback Collection (NPS Scores)...');
    
    const users = await prisma.user.findMany({
      where: { status: 'active', role: { in: ['buyer', 'seller'] } },
      take: 20
    });

    for (const user of users) {
      // Create feedback
      const isSupplier = user.role === 'seller';
      const rating = Math.floor(Math.random() * 3) + 8; // Ratings between 8 and 10 for success!
      
      const category = isSupplier ? 'Seller Experience' : 'Buyer Experience';
      const answers = isSupplier ? 
        { "registration": "Easy", "product_upload": "Fast", "lead_quality": "High" } : 
        { "search_experience": "Great", "supplier_relevance": "Perfect" };
      
      const message = isSupplier ? 
        "Love the platform. Can we get bulk product uploads via CSV soon?" : 
        "Found exact suppliers I needed. Would love a mobile app for tracking orders.";

      await prisma.feedback.create({
        data: {
          userId: user.id,
          role: user.role,
          rating: rating,
          category: category,
          answers: answers,
          message: message,
        }
      });
    }

    console.log('\n✅ MILESTONE 2 SEEDING & PHASE 5 COLLECTION COMPLETE!');
  } catch (error) {
    console.error('Error during Milestone 2 seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMilestone2();
