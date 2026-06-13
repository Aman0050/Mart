const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:4000/api/v1';

const state = {
  admins: [],
  suppliers: [],
  buyers: [],
  companies: [],
  products: [],
  enquiries: [],
  leads: []
};

const logs = [];

function log(msg) {
  console.log(msg);
  logs.push(`[${new Date().toISOString()}] ${msg}`);
}

async function run() {
  try {
    log('--- PHASE 1: END-TO-END MARKETPLACE VALIDATION ---');
    
    // 1. Create Admins (Register as buyers, then we'd normally promote via DB)
    for(let i=1; i<=3; i++) {
      const email = `admin${i}_e2e_${Date.now()}@nexmarto.com`;
      const phone = `9` + Math.floor(100000000 + Math.random() * 900000000).toString();
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: `Admin User ${i}`,
        email,
        phone,
        password: 'Password123!',
        role: 'buyer'
      });
      state.admins.push({ email, token: res.data.data.accessToken, id: res.data.data.user.id });
      log(`Created Admin ${i} (Registered as buyer)`);
    }

    // 2. Create Suppliers
    for(let i=1; i<=5; i++) {
      const email = `supplier${i}_e2e_${Date.now()}@nexmarto.com`;
      const phone = `8` + Math.floor(100000000 + Math.random() * 900000000).toString();
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: `Supplier User ${i}`,
        email,
        phone,
        password: 'Password123!',
        role: 'seller'
      });
      state.suppliers.push({ email, token: res.data.data.accessToken, id: res.data.data.user.id });
      log(`Created Supplier ${i}`);
    }

    // 3. Create Buyers
    for(let i=1; i<=5; i++) {
      const email = `buyer${i}_e2e_${Date.now()}@nexmarto.com`;
      const phone = `7` + Math.floor(100000000 + Math.random() * 900000000).toString();
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: `Buyer User ${i}`,
        email,
        phone,
        password: 'Password123!',
        role: 'buyer'
      });
      state.buyers.push({ email, token: res.data.data.accessToken, id: res.data.data.user.id });
      log(`Created Buyer ${i}`);
    }

    // 4. Create Companies for Suppliers
    for(let i=0; i<state.suppliers.length; i++) {
      const supplier = state.suppliers[i];
      const res = await axios.post(`${API_URL}/companies`, {
        companyName: `Global E2E Mfg ${i}`,
        slug: `global-e2e-mfg-${Date.now()}-${i}`,
        businessType: 'manufacturer',
        description: 'Leading manufacturer of E2E testing materials.',
      }, {
        headers: { Authorization: `Bearer ${supplier.token}` }
      });
      state.companies.push({ id: res.data.data.id, supplierId: supplier.id });
      log(`Created Company for Supplier ${i+1}`);
    }

    // 5. Upload Products
    for(let i=0; i<state.suppliers.length; i++) {
      const supplier = state.suppliers[i];
      const company = state.companies[i];
      
      for(let p=1; p<=2; p++) {
        const res = await axios.post(`${API_URL}/products`, {
          title: `Industrial E2E Widget ${i}-${p}`,
          price: 500 * p,
          minimumOrderQuantity: 10 * p,
          shortDescription: 'High quality industrial widget.',
          description: 'High quality industrial widget for testing purposes.',
        }, {
          headers: { Authorization: `Bearer ${supplier.token}` }
        });
        state.products.push(res.data.data);
        log(`Created Product ${p} for Supplier ${i+1}`);
      }
    }

    // 6. Buyers Search and Send Enquiries (Leads)
    for(let i=0; i<state.buyers.length; i++) {
      const buyer = state.buyers[i];
      const targetProduct = state.products[i % state.products.length];
      
      const res = await axios.post(`${API_URL}/leads`, {
        productId: targetProduct.id,
        subject: `Enquiry about ${targetProduct.title}`,
        message: `I am interested in ordering your ${targetProduct.title} in bulk. Please provide a quote.`,
        quantityRequired: 100
      }, {
        headers: { Authorization: `Bearer ${buyer.token}` }
      });
      state.enquiries.push(res.data.data);
      log(`Buyer ${i+1} sent lead for product ${targetProduct.title}`);
    }

    // 7. Suppliers respond to Enquiries (Leads)
    for(let i=0; i<state.suppliers.length; i++) {
      const supplier = state.suppliers[i];
      const company = state.companies[i];
      
      // Fetch leads for this company
      const leadsRes = await axios.get(`${API_URL}/leads/seller`, {
        headers: { Authorization: `Bearer ${supplier.token}` }
      });
      
      const leads = leadsRes.data.data.data; // paginate returns { data: [...], meta: ... }
      if (leads && leads.length > 0) {
        const lead = leads[0];
        // Reply
        await axios.post(`${API_URL}/leads/${lead.id}/messages`, {
          message: 'Thank you for your interest. We can offer a 10% discount for 100 units.'
        }, {
          headers: { Authorization: `Bearer ${supplier.token}` }
        });
        
        // Update Status
        await axios.patch(`${API_URL}/leads/${lead.id}/status`, {
          status: 'contacted'
        }, {
          headers: { Authorization: `Bearer ${supplier.token}` }
        });
        log(`Supplier ${i+1} responded to lead ${lead.id} and updated status.`);
      }
    }

    log('--- E2E MARKETPLACE VALIDATION COMPLETED SUCCESSFULLY ---');
    fs.writeFileSync('e2e_validation_report.md', `# End-to-End Validation Report\n\n## Summary\nAll critical paths executed successfully.\n\n## Metrics\n- Admins Created: ${state.admins.length}\n- Suppliers Created: ${state.suppliers.length}\n- Buyers Created: ${state.buyers.length}\n- Companies Created: ${state.companies.length}\n- Products Uploaded: ${state.products.length}\n- Enquiries Sent: ${state.enquiries.length}\n\n## Execution Log\n\`\`\`\n${logs.join('\n')}\n\`\`\`\n`);
    console.log('Report generated: e2e_validation_report.md');
  } catch (error) {
    log(`ERROR: ${error.message}`);
    if (error.response) {
      log(`Details: ${JSON.stringify(error.response.data)}`);
    }
    fs.writeFileSync('e2e_validation_report.md', `# End-to-End Validation Report\n\n## FAILED\n\n\`\`\`\n${logs.join('\n')}\n\`\`\`\n`);
  }
}

run();
