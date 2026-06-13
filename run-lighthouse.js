const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouseAudit() {
  console.log('Starting Lighthouse Audit...');
  const { default: lighthouse } = await import('lighthouse');
  
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };
  
  const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/products',
  ];

  let report = `# NEXMARTO LIGHTHOUSE AUDIT REPORT\n\n`;

  for (const url of urls) {
    console.log(`Auditing ${url}...`);
    const runnerResult = await lighthouse(url, options);

    report += `## Audit for: ${url}\n`;
    report += `- **Performance:** ${Math.round(runnerResult.lhr.categories.performance.score * 100)}\n`;
    report += `- **Accessibility:** ${Math.round(runnerResult.lhr.categories.accessibility.score * 100)}\n`;
    report += `- **Best Practices:** ${Math.round(runnerResult.lhr.categories['best-practices'].score * 100)}\n`;
    report += `- **SEO:** ${Math.round(runnerResult.lhr.categories.seo.score * 100)}\n\n`;
    
    // Key metrics
    const metrics = runnerResult.lhr.audits;
    report += `### Key Metrics\n`;
    report += `- **First Contentful Paint (FCP):** ${metrics['first-contentful-paint'].displayValue}\n`;
    report += `- **Largest Contentful Paint (LCP):** ${metrics['largest-contentful-paint'].displayValue}\n`;
    report += `- **Total Blocking Time (TBT):** ${metrics['total-blocking-time'].displayValue}\n`;
    report += `- **Cumulative Layout Shift (CLS):** ${metrics['cumulative-layout-shift'].displayValue}\n`;
    report += `- **Speed Index:** ${metrics['speed-index'].displayValue}\n\n`;
  }

  try {
    await chrome.kill();
  } catch (e) {
    console.warn("Could not kill chrome cleanly:", e.message);
  }

  fs.writeFileSync('./performance_audit_report.md', report);
  console.log('Audit complete. Report generated.');
}

runLighthouseAudit();
