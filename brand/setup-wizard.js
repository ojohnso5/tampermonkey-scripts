#!/usr/bin/env node
/**
 * Justice Society of Activism — YouTube Studio Setup Wizard
 *
 * Validates your brand package, generates a personalized checklist,
 * and automates what can be automated (userscript install, asset validation).
 *
 * Usage:
 *   node brand/setup-wizard.js              # interactive checklist
 *   node brand/setup-wizard.js --validate   # just check assets
 *   node brand/setup-wizard.js --userscript # install the userscript
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS = [
  { name: 'Profile picture', file: 'brand/out/avatar-800.png', size: '800x800', maxKB: 4000, required: true },
  { name: 'Channel banner', file: 'brand/out/banner-2560x1440.png', size: '2560x1440', maxKB: 6000, required: true },
  { name: 'Video watermark', file: 'brand/out/channel-watermark-150.png', size: '150x150', maxKB: 1024, required: true },
  { name: 'Thumbnail (EXPOSED)', file: 'brand/out/thumb-exposed-1280x720.png', size: '1280x720', maxKB: 2048, required: false },
  { name: 'Thumbnail (WHO PROFITS)', file: 'brand/out/thumb-who-profits-1280x720.png', size: '1280x720', maxKB: 2048, required: false },
  { name: 'Thumbnail (FOLLOW THE MONEY)', file: 'brand/out/thumb-follow-the-money-1280x720.png', size: '1280x720', maxKB: 2048, required: false },
  { name: 'Thumbnail (THEY LIED)', file: 'brand/out/thumb-they-lied-1280x720.png', size: '1280x720', maxKB: 2048, required: false },
  { name: 'Thumbnail (WATCH THIS)', file: 'brand/out/thumb-watch-this-1280x720.png', size: '1280x720', maxKB: 2048, required: false },
  { name: 'Thumbnail (ACCOUNTABILITY NOW)', file: 'brand/out/thumb-accountability-now-1280x720.png', size: '1280x720', maxKB: 2048, required: false },
  { name: 'Intro animation', file: 'brand/out/intro-1920x1080.mp4', size: '1920x1080', maxKB: 50000, required: false },
  { name: 'Lower-third (episode)', file: 'brand/out/lower-third-episode-1920x240.png', size: '1920x240', maxKB: 2048, required: false },
  { name: 'Lower-third (live)', file: 'brand/out/lower-third-live-1920x240.png', size: '1920x240', maxKB: 2048, required: false },
  { name: 'End screen', file: 'brand/out/end-screen-1920x1080.png', size: '1920x1080', maxKB: 5000, required: false },
];

const STUDIO_LINKS = {
  branding: 'https://studio.youtube.com/channel/UCxuSW9Si0AGLCk_tM6b1SQA/customization/branding',
  basicInfo: 'https://studio.youtube.com/channel/UCxuSW9Si0AGLCk_tM6b1SQA/basic',
  content: 'https://studio.youtube.com/channel/UCxuSW9Si0AGLCk_tM6b1SQA/videos',
};

const CHANNEL_DESCRIPTION = `Justice Society of Activism is an independent, member-funded reporting studio. We follow the paper trail — court filings, budget records, FOIA releases — and turn it into stories people can act on. No billionaire owners, no PR clients, no rage-bait. If it can't be sourced, we don't air it.

New documentary every Thursday.

Support the work: https://justicesociety.org/give
Public records database: https://data.justicesociety.org
Press inquiries: press@justicesociety.org`;

function validateAssets() {
  console.log('\n🔍 Validating brand assets...\n');
  let allValid = true;
  const results = [];

  for (const asset of ASSETS) {
    const filePath = path.join(process.cwd(), asset.file);
    const exists = fs.existsSync(filePath);
    
    if (!exists) {
      results.push({ ...asset, status: 'MISSING', valid: false });
      if (asset.required) allValid = false;
      continue;
    }

    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    const overLimit = sizeKB > asset.maxKB;

    results.push({
      ...asset,
      status: overLimit ? 'OVER LIMIT' : 'OK',
      sizeKB,
      valid: !overLimit
    });

    if (overLimit && asset.required) allValid = false;
  }

  for (const r of results) {
    const icon = r.valid ? '✅' : r.status === 'MISSING' ? '❌' : '⚠️';
    console.log(`${icon} ${r.name.padEnd(30)} ${r.status.padEnd(12)} ${r.sizeKB ? r.sizeKB + 'KB' : ''} (limit: ${r.maxKB}KB)`);
  }

  console.log(allValid ? '\n✅ All required assets are valid.' : '\n❌ Some required assets are missing or over the size limit.');
  return allValid;
}

function generateChecklist() {
  console.log('\n📋 YouTube Studio Setup Checklist\n');
  console.log('Copy this checklist and check off each item as you complete it:\n');

  const steps = [
    { section: 'Channel Art', items: [
      { task: 'Upload profile picture', link: STUDIO_LINKS.branding, file: 'brand/out/avatar-800.png' },
      { task: 'Upload channel banner', link: STUDIO_LINKS.branding, file: 'brand/out/banner-2560x1440.png' },
    ]},
    { section: 'Basic Info', items: [
      { task: 'Set channel name to "Justice Society of Activism"', link: STUDIO_LINKS.basicInfo },
      { task: 'Set handle to @JusticeSocietyofActivism', link: STUDIO_LINKS.basicInfo },
      { task: 'Paste channel description (see below)', link: STUDIO_LINKS.basicInfo },
    ]},
    { section: 'Video Watermark', items: [
      { task: 'Upload watermark (150x150)', link: STUDIO_LINKS.branding, file: 'brand/out/channel-watermark-150.png' },
      { task: 'Set display time: 0:15 to End', link: STUDIO_LINKS.branding },
    ]},
    { section: 'Userscript (optional)', items: [
      { task: 'Install Tampermonkey extension', link: 'https://www.tampermonkey.net/' },
      { task: 'Install JSA Studio script', link: 'https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/justice-society-studio.user.js' },
      { task: 'Visit your channel and click "Channel setup"', link: 'https://www.youtube.com/@JusticeSocietyofActivism' },
      { task: 'Toggle "Apply brand to channel page" ON', link: 'https://www.youtube.com/@JusticeSocietyofActivism' },
    ]},
  ];

  for (const section of steps) {
    console.log(`\n## ${section.section}\n`);
    for (const item of section.items) {
      console.log(`- [ ] ${item.task}`);
      if (item.link) console.log(`    Link: ${item.link}`);
      if (item.file) console.log(`    File: ${item.file}`);
    }
  }

  console.log('\n\n## Channel Description (copy-paste this)\n');
  console.log('```');
  console.log(CHANNEL_DESCRIPTION);
  console.log('```');
}

function installUserscript() {
  const scriptUrl = 'https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/justice-society-studio.user.js';
  const installUrl = `https://www.tampermonkey.net/installscript.php?userjs=${encodeURIComponent(scriptUrl)}`;
  
  console.log('\n🔧 Installing JSA Studio userscript...\n');
  console.log('Opening Tampermonkey install page in your browser...');
  console.log('Click "Install" when prompted.\n');
  
  try {
    // Try to open the browser
    const platform = process.platform;
    let cmd;
    if (platform === 'darwin') cmd = 'open';
    else if (platform === 'win32') cmd = 'start';
    else cmd = 'xdg-open';
    
    execSync(`${cmd} "${installUrl}"`);
    console.log('✅ Browser opened. Click "Install" in the Tampermonkey popup.\n');
  } catch (e) {
    console.log('⚠️  Could not open browser automatically.\n');
    console.log('Copy this URL and paste it into your browser:\n');
    console.log(installUrl);
    console.log('\nThen click "Install" in the Tampermonkey popup.\n');
  }
}

function openStudio() {
  console.log('\n🎬 Opening YouTube Studio...\n');
  
  const pages = [
    { name: 'Branding', url: STUDIO_LINKS.branding },
    { name: 'Basic Info', url: STUDIO_LINKS.basicInfo },
  ];

  for (const page of pages) {
    console.log(`Opening ${page.name}...`);
    try {
      const platform = process.platform;
      let cmd;
      if (platform === 'darwin') cmd = 'open';
      else if (platform === 'win32') cmd = 'start';
      else cmd = 'xdg-open';
      
      execSync(`${cmd} "${page.url}"`);
    } catch (e) {
      console.log(`  ⚠️  Could not open automatically. Visit: ${page.url}`);
    }
  }

  console.log('\n✅ Studio pages opened. Follow the checklist above.\n');
}

// Main
const args = process.argv.slice(2);

if (args.includes('--validate')) {
  validateAssets();
  process.exit(0);
}

if (args.includes('--userscript')) {
  installUserscript();
  process.exit(0);
}

if (args.includes('--open')) {
  openStudio();
  process.exit(0);
}

// Default: interactive wizard
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Justice Society of Activism — YouTube Studio Setup Wizard       ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

validateAssets();
generateChecklist();

console.log('\n\n💡 Quick commands:');
console.log('   node brand/setup-wizard.js --validate    # Re-check assets');
console.log('   node brand/setup-wizard.js --userscript  # Install userscript');
console.log('   node brand/setup-wizard.js --open        # Open Studio pages');
console.log('   node brand/setup-wizard.js --rebuild     # Regenerate all assets');
console.log('\n');

// Interactive prompt
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
  console.log('\nWhat would you like to do?');
  console.log('  1. Open YouTube Studio pages');
  console.log('  2. Install userscript');
  console.log('  3. Rebuild all assets');
  console.log('  4. Exit');
  
  const choice = await ask('\nYour choice (1-4): ');
  
  if (choice === '1') {
    openStudio();
  } else if (choice === '2') {
    installUserscript();
  } else if (choice === '3') {
    console.log('\n🔨 Rebuilding assets...');
    try {
      execSync('node brand/build.js --png', { stdio: 'inherit' });
      console.log('\n✅ Assets rebuilt.');
    } catch (e) {
      console.error('\n❌ Build failed:', e.message);
    }
  } else {
    console.log('\n👋 Good luck with your channel!');
  }
  
  rl.close();
})();
