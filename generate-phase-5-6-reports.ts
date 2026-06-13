import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateReports() {
  console.log('Generating Phase 5 & 6 Reports...\n');

  try {
    // ---------------------------------------------------------
    // PHASE 6: DAILY FOUNDER DASHBOARD
    // ---------------------------------------------------------
    const totalUsers = await prisma.user.count();
    const activeSuppliers = await prisma.company.count({ where: { owner: { role: 'seller' }, status: 'active' } });
    const activeBuyers = await prisma.user.count({ where: { role: 'buyer', status: 'active' } });
    const totalProducts = await prisma.product.count();
    const totalLeads = await prisma.lead.count();
    const totalFeedbacks = await prisma.feedback.count();

    let dashboard = `# PHASE 6: DAILY FOUNDER DASHBOARD\n\n`;
    dashboard += `| Metric | Count |\n`;
    dashboard += `| :--- | :--- |\n`;
    dashboard += `| Total Registrations | ${totalUsers} |\n`;
    dashboard += `| Active Suppliers | ${activeSuppliers} |\n`;
    dashboard += `| Active Buyers | ${activeBuyers} |\n`;
    dashboard += `| Products Uploaded | ${totalProducts} |\n`;
    dashboard += `| Total Enquiries (Leads) | ${totalLeads} |\n`;
    dashboard += `| Feedback Submissions | ${totalFeedbacks} |\n`;

    // ---------------------------------------------------------
    // PHASE 5: FEEDBACK COLLECTION REPORT
    // ---------------------------------------------------------
    const feedbacks = await prisma.feedback.findMany();
    
    let totalScore = 0;
    let promoterCount = 0;
    let detractorCount = 0;
    
    let feedbackReport = `\n\n# PHASE 5: FEEDBACK COLLECTION REPORT\n\n`;

    if (feedbacks.length > 0) {
      feedbacks.forEach(f => {
        totalScore += f.rating;
        if (f.rating >= 9) promoterCount++;
        if (f.rating <= 6) detractorCount++;
      });
      
      const avgScore = (totalScore / feedbacks.length).toFixed(1);
      const nps = Math.round(((promoterCount / feedbacks.length) - (detractorCount / feedbacks.length)) * 100);

      feedbackReport += `**Average Satisfaction Score:** ${avgScore} / 10\n`;
      feedbackReport += `**NPS Score:** ${nps}\n\n`;
      
      feedbackReport += `### Recent Feedback\n`;
      feedbacks.slice(0, 5).forEach(f => {
        feedbackReport += `- **${f.role} (Rating: ${f.rating}/10)**: "${f.message}"\n`;
      });
    } else {
      feedbackReport += `No feedback collected yet.\n`;
    }

    console.log(dashboard);
    console.log(feedbackReport);

  } catch (error) {
    console.error('Error generating reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateReports();
