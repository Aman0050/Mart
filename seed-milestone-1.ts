import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedMilestone1() {
  console.log('🚀 Starting Milestone 1 Seeding / Simulation...\n');

  try {
    // ---------------------------------------------------------
    // 1. ACTIVATE SUPPLIERS (Phase 1)
    // ---------------------------------------------------------
    console.log('Activating 5 Suppliers...');
    
    // Find the 5 active suppliers
    const suppliers = await prisma.company.findMany({
      where: { owner: { role: 'seller' }, status: 'active' },
      take: 5,
    });

    for (const supplier of suppliers) {
      await prisma.company.update({
        where: { id: supplier.id },
        data: {
          gstNumber: `GST-${uuidv4().substring(0, 10).toUpperCase()}`,
          panNumber: `PAN-${uuidv4().substring(0, 6).toUpperCase()}`,
          description: `Leading manufacturer and distributor of high-quality products for the ${supplier.companyName} industry. We pride ourselves on fast shipping and excellent B2B service.`,
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(supplier.companyName)}&background=random`,
          coverImageUrl: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80`,
          verified: true,
        }
      });

      // ---------------------------------------------------------
      // 2. POPULATE PRODUCTS (Phase 3)
      // ---------------------------------------------------------
      // Find how many products they have
      const existingProducts = await prisma.product.findMany({ where: { companyId: supplier.id } });
      let productCount = existingProducts.length;

      // Fix existing products missing data
      for (const p of existingProducts) {
        await prisma.product.update({
          where: { id: p.id },
          data: {
            price: p.price || Math.floor(Math.random() * 500) + 50,
            minimumOrderQuantity: p.minimumOrderQuantity || 10,
            slug: p.slug || `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().substring(0, 6)}`,
            seoTitle: `Buy ${p.title} at Wholesale Prices`,
            seoDescription: `Get the best B2B prices for ${p.title}. Minimum order quantity applies.`,
          }
        });

        // Add an image if missing
        const imgCount = await prisma.productImage.count({ where: { productId: p.id } });
        if (imgCount === 0) {
          await prisma.productImage.create({
            data: {
              productId: p.id,
              imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80',
              isPrimary: true,
            }
          });
        }
      }

      // Add more products until they have exactly 10
      while (productCount < 10) {
        productCount++;
        const title = `Premium B2B Item ${productCount} for ${supplier.companyName.split(' ')[0]}`;
        const newProduct = await prisma.product.create({
          data: {
            companyId: supplier.id,
            title: title,
            slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().substring(0, 6)}`,
            description: `This is a high-grade product suitable for industrial and commercial use.`,
            price: Math.floor(Math.random() * 1000) + 100,
            minimumOrderQuantity: Math.floor(Math.random() * 40) + 10,
            status: 'active',
            seoTitle: `Buy ${title} at Wholesale`,
            seoDescription: `Best B2B prices for ${title}. Bulk discounts available.`,
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
    // 3. CREATE MOCK BUYERS (Phase 2)
    // ---------------------------------------------------------
    console.log('Creating 10 Active Buyers...');
    const buyerIds: string[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const email = `buyer${i}@example.com`;
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            fullName: `Test Buyer ${i}`,
            email: email,
            phone: `+91987654321${i % 10}`,
            role: 'buyer',
            status: 'active',
            emailVerified: true,
            phoneVerified: true,
          }
        });
      }
      buyerIds.push(user.id);
    }

    // ---------------------------------------------------------
    // 4. GENERATE ENQUIRIES/LEADS (Phase 4)
    // ---------------------------------------------------------
    console.log('Generating 20 Enquiries/Leads...');
    const allActiveProducts = await prisma.product.findMany({ 
      where: { status: 'active', company: { status: 'active' } },
      include: { company: true }
    });

    // Create 20 leads
    for (let i = 1; i <= 20; i++) {
      const buyerId = buyerIds[Math.floor(Math.random() * buyerIds.length)];
      const product = allActiveProducts[Math.floor(Math.random() * allActiveProducts.length)];
      
      if (!product || !product.companyId || !product.company?.ownerId) continue;

      const leadNumber = `LD-${new Date().getFullYear()}${new Date().getMonth() + 1}-${uuidv4().substring(0, 6).toUpperCase()}`;

      // Create Lead
      const lead = await prisma.lead.create({
        data: {
          leadNumber,
          buyerId: buyerId,
          sellerId: product.company.ownerId,
          companyId: product.companyId,
          productId: product.id,
          subject: `Enquiry for ${product.title}`,
          message: `Hello, we are interested in bulk purchasing ${product.title}. Please provide your best quote.`,
          quantityRequired: product.minimumOrderQuantity * 2,
          budget: Number(product.price || 0) * (product.minimumOrderQuantity * 2),
          status: 'new',
          source: 'product_page',
          priority: 'medium',
        }
      });

      // Create Notification for Supplier
      await prisma.notification.create({
        data: {
          userId: product.company.ownerId,
          title: 'New Lead Received',
          description: `You have a new enquiry for ${product.title}`,
          type: 'lead_created',
        }
      });
      
      // Simulate Supplier Response for 25% of leads to prove "Lead Status Updated" flow
      if (i % 4 === 0) {
        await prisma.leadMessage.create({
          data: {
            leadId: lead.id,
            senderId: product.company.ownerId,
            message: `Hi there, thanks for reaching out. We can definitely fulfill this order.`,
            messageType: 'text',
          }
        });
        
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: 'contacted' }
        });
      }
    }

    console.log('\n✅ MILESTONE 1 SEEDING COMPLETE!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMilestone1();
