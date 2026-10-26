// scripts/seed-more.js
// Seeds 10 additional accounts and 50+ additional transactions

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedMore() {
  console.log('🚀 Seeding 10 more accounts and 50+ transactions...');

  // 1. 10 New Account Names
  const newAccountNames = [
    'Rohan Gupta',
    'Divya Nair',
    'Ananya Sen',
    'Kabir Kapoor',
    'Meera Joshi',
    'Siddharth Rao',
    'Tanvi Shah',
    'Aditya Verma',
    'Pooja Iyer',
    'Yash Malhotra',
  ];

  const accounts = {};

  // Fetch or create new accounts
  for (const name of newAccountNames) {
    const { data: existing } = await supabase
      .from('accounts')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      console.log(`✓ Account already exists: ${name} (${existing.id})`);
      accounts[name] = existing;
    } else {
      const { data: created, error } = await supabase
        .from('accounts')
        .insert({ name })
        .select()
        .single();

      if (error) {
        console.error(`Failed to create account ${name}:`, error.message);
        continue;
      }
      console.log(`+ Created account: ${name} (${created.id})`);
      accounts[name] = created;
    }
  }

  // Also fetch existing accounts so we can do cross-account transfers
  const { data: allDbAccounts } = await supabase.from('accounts').select('*');
  for (const acc of allDbAccounts || []) {
    accounts[acc.name] = acc;
  }

  let transactionCount = 0;

  // 2. Credits (24 transactions: 2 per new account + 4 to existing accounts)
  const credits = [
    // Rohan Gupta
    { user: 'Rohan Gupta', amount: 8200.00, desc: 'Senior Mobile Dev Salary', ref: 'SM-SAL-2026-RG1' },
    { user: 'Rohan Gupta', amount: 1500.00, desc: 'iOS App Store Royalties', ref: 'SM-APP-2026-RG2' },
    // Divya Nair
    { user: 'Divya Nair', amount: 9400.00, desc: 'Product Marketing Retainer', ref: 'SM-SAL-2026-DN1' },
    { user: 'Divya Nair', amount: 2200.00, desc: 'Conference Keynote Speaker Fee', ref: 'SM-SPK-2026-DN2' },
    // Ananya Sen
    { user: 'Ananya Sen', amount: 7600.00, desc: 'UX Research Monthly Payout', ref: 'SM-SAL-2026-AS1' },
    { user: 'Ananya Sen', amount: 1100.00, desc: 'Figma Community Template Sales', ref: 'SM-FIG-2026-AS2' },
    // Kabir Kapoor
    { user: 'Kabir Kapoor', amount: 10500.00, desc: 'DevOps Architect Monthly Salary', ref: 'SM-SAL-2026-KK1' },
    { user: 'Kabir Kapoor', amount: 3000.00, desc: 'Cloud Infrastructure Audit Bonus', ref: 'SM-AUD-2026-KK2' },
    // Meera Joshi
    { user: 'Meera Joshi', amount: 6800.00, desc: 'Content Strategy Retainer', ref: 'SM-SAL-2026-MJ1' },
    { user: 'Meera Joshi', amount: 950.00, desc: 'Substack Paid Subscriptions', ref: 'SM-SUB-2026-MJ2' },
    // Siddharth Rao
    { user: 'Siddharth Rao', amount: 11000.00, desc: 'Engineering Manager Remuneration', ref: 'SM-SAL-2026-SR1' },
    { user: 'Siddharth Rao', amount: 4000.00, desc: 'Annual Equity Vesting Liquidation', ref: 'SM-EQ-2026-SR2' },
    // Tanvi Shah
    { user: 'Tanvi Shah', amount: 8900.00, desc: 'Brand Design Lead Retainer', ref: 'SM-SAL-2026-TS1' },
    { user: 'Tanvi Shah', amount: 1800.00, desc: 'Webflow Site Template Royalties', ref: 'SM-ROY-2026-TS2' },
    // Aditya Verma
    { user: 'Aditya Verma', amount: 7200.00, desc: 'Full Stack Engineer Salary', ref: 'SM-SAL-2026-AV1' },
    { user: 'Aditya Verma', amount: 1400.00, desc: 'Hackathon Grand Prize Share', ref: 'SM-PRIZE-2026-AV2' },
    // Pooja Iyer
    { user: 'Pooja Iyer', amount: 9800.00, desc: 'AI/ML Solutions Lead Retainer', ref: 'SM-SAL-2026-PI1' },
    { user: 'Pooja Iyer', amount: 2500.00, desc: 'Research Paper Advisory Grant', ref: 'SM-RES-2026-PI2' },
    // Yash Malhotra
    { user: 'Yash Malhotra', amount: 6400.00, desc: 'Growth Marketing Salary', ref: 'SM-SAL-2026-YM1' },
    { user: 'Yash Malhotra', amount: 1250.00, desc: 'Affiliate Marketing Revenue', ref: 'SM-AFF-2026-YM2' },
    // Existing accounts extra credits
    { user: 'Rahul Mishra', amount: 2800.00, desc: 'Freelance Mobile App Milestone', ref: 'SM-CR-RM-EXTRA' },
    { user: 'Aastha Jha', amount: 3200.00, desc: 'Design System Audit Advisory', ref: 'SM-CR-AJ-EXTRA' },
    { user: 'Vikramaditya Sharma', amount: 5000.00, desc: 'Advisory Board Stipend Q4', ref: 'SM-CR-VS-EXTRA' },
    { user: 'Priya Patel', amount: 2100.00, desc: 'Product Strategy Mentorship', ref: 'SM-CR-PP-EXTRA' },
  ];

  console.log(`\n💳 Processing ${credits.length} credits...`);
  for (const c of credits) {
    const acct = accounts[c.user];
    if (!acct) {
      console.warn(`Account not found for credit: ${c.user}`);
      continue;
    }
    const { data, error } = await supabase.rpc('process_transaction', {
      p_account_id: acct.id,
      p_type: 'credit',
      p_amount: c.amount,
      p_description: c.desc,
      p_reference_id: c.ref,
    });
    if (error) {
      console.error(`Error crediting ${c.user}:`, error.message);
    } else {
      transactionCount++;
      console.log(`[+Credit ${transactionCount}] ₹${c.amount} -> ${c.user} (${c.desc})`);
    }
  }

  // 3. Debits (18 transactions)
  const debits = [
    { user: 'Rohan Gupta', amount: 799.00, desc: 'Apple Developer Annual Subscription', ref: 'SM-DB-RG-APPL' },
    { user: 'Rohan Gupta', amount: 1450.00, desc: 'Starbucks Coffee & Snacks', ref: 'SM-DB-RG-SBUX' },
    { user: 'Divya Nair', amount: 2100.00, desc: 'Notion Team Workspace Subscription', ref: 'SM-DB-DN-NOTION' },
    { user: 'Divya Nair', amount: 650.00, desc: 'Kindle Unlimited E-Books', ref: 'SM-DB-DN-KNDL' },
    { user: 'Ananya Sen', amount: 1850.00, desc: 'Blinkit Grocery Delivery', ref: 'SM-DB-AS-BLNK' },
    { user: 'Kabir Kapoor', amount: 3200.00, desc: 'DigitalOcean Droplets Hosting', ref: 'SM-DB-KK-DO' },
    { user: 'Kabir Kapoor', amount: 890.00, desc: 'NordVPN Annual Security Plan', ref: 'SM-DB-KK-VPN' },
    { user: 'Meera Joshi', amount: 499.00, desc: 'Grammarly Premium Subscription', ref: 'SM-DB-MJ-GRM' },
    { user: 'Meera Joshi', amount: 1200.00, desc: 'FabIndia Ethnic Wear', ref: 'SM-DB-MJ-FAB' },
    { user: 'Siddharth Rao', amount: 4500.00, desc: 'Dell Ultrasharp Monitor EMI', ref: 'SM-DB-SR-DELL' },
    { user: 'Siddharth Rao', amount: 1750.00, desc: 'Fine Dining Dinner at Olive', ref: 'SM-DB-SR-DINE' },
    { user: 'Tanvi Shah', amount: 2400.00, desc: 'Adobe Creative Cloud Suite', ref: 'SM-DB-TS-ADBE' },
    { user: 'Aditya Verma', amount: 850.00, desc: 'GitHub Copilot Monthly', ref: 'SM-DB-AV-GH' },
    { user: 'Aditya Verma', amount: 1600.00, desc: 'Cult.fit Pass Monthly', ref: 'SM-DB-AV-CULT' },
    { user: 'Pooja Iyer', amount: 2800.00, desc: 'OpenAI API Credits Usage', ref: 'SM-DB-PI-OAI' },
    { user: 'Pooja Iyer', amount: 950.00, desc: 'Uber Premier City Rides', ref: 'SM-DB-PI-UBER' },
    { user: 'Yash Malhotra', amount: 1350.00, desc: 'Facebook Ads Campaign Test', ref: 'SM-DB-YM-META' },
    { user: 'Yash Malhotra', amount: 550.00, desc: 'Zomato Biryani Lunch Order', ref: 'SM-DB-YM-ZOM' },
  ];

  console.log(`\n💸 Processing ${debits.length} debits...`);
  for (const d of debits) {
    const acct = accounts[d.user];
    if (!acct) {
      console.warn(`Account not found for debit: ${d.user}`);
      continue;
    }
    const { data, error } = await supabase.rpc('process_transaction', {
      p_account_id: acct.id,
      p_type: 'debit',
      p_amount: d.amount,
      p_description: d.desc,
      p_reference_id: d.ref,
    });
    if (error) {
      console.error(`Error debiting ${d.user}:`, error.message);
    } else {
      transactionCount++;
      console.log(`[-Debit ${transactionCount}] ₹${d.amount} <- ${d.user} (${d.desc})`);
    }
  }

  // 4. Transfers (10 transfers = 20 ledger transactions)
  const transfers = [
    { from: 'Rohan Gupta', to: 'Divya Nair', amount: 1200.00, desc: 'Co-working Office Desk Split', ref: 'SM-XFER-001' },
    { from: 'Divya Nair', to: 'Ananya Sen', amount: 800.00, desc: 'Design Assets Purchase Split', ref: 'SM-XFER-002' },
    { from: 'Kabir Kapoor', to: 'Siddharth Rao', amount: 2500.00, desc: 'Kubernetes Cluster Shared Server', ref: 'SM-XFER-003' },
    { from: 'Meera Joshi', to: 'Tanvi Shah', amount: 650.00, desc: 'Illustrations Royalty Share', ref: 'SM-XFER-004' },
    { from: 'Siddharth Rao', to: 'Aditya Verma', amount: 1500.00, desc: 'Team Hackathon Bounty Payout', ref: 'SM-XFER-005' },
    { from: 'Pooja Iyer', to: 'Yash Malhotra', amount: 900.00, desc: 'Marketing Graphics Campaign Share', ref: 'SM-XFER-006' },
    { from: 'Tanvi Shah', to: 'Rohan Gupta', amount: 1100.00, desc: 'Mobile UI Kit Collaboration', ref: 'SM-XFER-007' },
    { from: 'Aditya Verma', to: 'Kabir Kapoor', amount: 450.00, desc: 'Domain Name Registration Share', ref: 'SM-XFER-008' },
    { from: 'Yash Malhotra', to: 'Rahul Mishra', amount: 750.00, desc: 'Landing Page Optimization Fee', ref: 'SM-XFER-009' },
    { from: 'Sneha Reddy', to: 'Pooja Iyer', amount: 1300.00, desc: 'LLM Fine-tuning GPU Share', ref: 'SM-XFER-010' },
  ];

  console.log(`\n🔄 Processing ${transfers.length} transfers (creates ${transfers.length * 2} ledger transactions)...`);
  for (const t of transfers) {
    const fromAcct = accounts[t.from];
    const toAcct = accounts[t.to];

    if (!fromAcct || !toAcct) {
      console.warn(`Cannot transfer: missing account ${t.from} or ${t.to}`);
      continue;
    }

    const { data, error } = await supabase.rpc('transfer_funds', {
      p_from_account_id: fromAcct.id,
      p_to_account_id: toAcct.id,
      p_amount: t.amount,
      p_description: t.desc,
      p_reference_id: t.ref,
    });

    if (error) {
      console.error(`Error transfer ${t.from} -> ${t.to}:`, error.message);
    } else {
      transactionCount += 2;
      console.log(`[⇄ Transfer ${transactionCount - 1}&${transactionCount}] ₹${t.amount} ${t.from} -> ${t.to} (${t.desc})`);
    }
  }

  // 5. Final database totals
  const { count: finalAccounts } = await supabase.from('accounts').select('*', { count: 'exact', head: true });
  const { count: finalTransactions } = await supabase.from('transactions').select('*', { count: 'exact', head: true });

  console.log('\n=======================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`📊 Total Accounts in DB: ${finalAccounts}`);
  console.log(`📊 Total Transactions in DB: ${finalTransactions}`);
  console.log(`➕ Added this run: ${newAccountNames.length} accounts, ${transactionCount} transactions`);
  console.log('=======================================');
}

seedMore().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
