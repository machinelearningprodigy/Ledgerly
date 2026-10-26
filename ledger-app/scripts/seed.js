const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file directly
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
  console.error('Missing Supabase URL or SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🌱 Starting database seed to:', supabaseUrl);

  // 1. Target Accounts
  const accountNames = [
    'Rahul Mishra',
    'Aastha Jha',
    'Vikramaditya Sharma',
    'Priya Patel',
    'Arjun Mehta',
    'Sneha Reddy',
  ];

  const accounts = {};

  for (const name of accountNames) {
    const { data: existing } = await supabase
      .from('accounts')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      console.log(`✓ Account exists: ${name} (${existing.id})`);
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

  // 2. Credits (12 items)
  const initialCredits = [
    { user: 'Rahul Mishra', amount: 5000.00, desc: 'Salary - October 2026', ref: 'SAL-2026-10-RM' },
    { user: 'Rahul Mishra', amount: 1200.00, desc: 'Freelance UI Design Project', ref: 'FL-2026-10-RM' },
    { user: 'Aastha Jha', amount: 8500.00, desc: 'Consulting Retainer Monthly', ref: 'CONS-2026-10-AJ' },
    { user: 'Aastha Jha', amount: 1500.00, desc: 'Stock Dividend Payout Q3', ref: 'DIV-2026-10-AJ' },
    { user: 'Vikramaditya Sharma', amount: 12000.00, desc: 'Tech Lead Monthly Salary', ref: 'SAL-2026-10-VS' },
    { user: 'Vikramaditya Sharma', amount: 3500.00, desc: 'Quarterly Performance Bonus', ref: 'BON-2026-Q3-VS' },
    { user: 'Priya Patel', amount: 6200.00, desc: 'Product Manager Salary', ref: 'SAL-2026-10-PP' },
    { user: 'Priya Patel', amount: 800.00, desc: 'E-commerce Store Sales', ref: 'STORE-2026-10-PP' },
    { user: 'Arjun Mehta', amount: 4500.00, desc: 'Backend Engineering Salary', ref: 'SAL-2026-10-AM' },
    { user: 'Arjun Mehta', amount: 2000.00, desc: 'Open Source Developer Grant', ref: 'GRANT-2026-AM' },
    { user: 'Sneha Reddy', amount: 7800.00, desc: 'Data Scientist Salary', ref: 'SAL-2026-10-SR' },
    { user: 'Sneha Reddy', amount: 950.00, desc: 'Income Tax Refund FY26', ref: 'REF-2026-SR' },
  ];

  console.log('\n💳 Adding Credit Transactions...');
  for (const c of initialCredits) {
    const acct = accounts[c.user];
    if (!acct) continue;

    const { data, error } = await supabase.rpc('process_transaction', {
      p_account_id: acct.id,
      p_type: 'credit',
      p_amount: c.amount,
      p_description: c.desc,
      p_reference_id: c.ref,
    });

    if (error) {
      console.warn(`Credit note for ${c.ref}:`, error.message);
    } else {
      console.log(`✓ Credit ₹${c.amount} -> ${c.user} (${c.desc}) [duplicate: ${data ? data.duplicate : false}]`);
    }
  }

  // 3. Debits (12 items)
  const debits = [
    { user: 'Rahul Mishra', amount: 450.00, desc: 'Swiggy Gourmet Dinner', ref: 'SWIG-8841-RM' },
    { user: 'Rahul Mishra', amount: 199.00, desc: 'Spotify Premium Family', ref: 'SPOT-3921-RM' },
    { user: 'Rahul Mishra', amount: 1299.00, desc: 'Airtel Broadband Fiber', ref: 'AIRTEL-441-RM' },
    { user: 'Aastha Jha', amount: 2400.00, desc: 'Amazon Pantry Groceries', ref: 'AMZN-9912-AJ' },
    { user: 'Aastha Jha', amount: 850.00, desc: 'Cult.fit Gym Membership', ref: 'CULT-1022-AJ' },
    { user: 'Vikramaditya Sharma', amount: 3500.00, desc: 'AWS Cloud Hosting Services', ref: 'AWS-OCT-VS' },
    { user: 'Vikramaditya Sharma', amount: 1200.00, desc: 'Flight Tickets - Indigo', ref: 'INDIGO-882-VS' },
    { user: 'Priya Patel', amount: 650.00, desc: 'Blue Tokai Specialty Coffee', ref: 'COFFEE-112-PP' },
    { user: 'Priya Patel', amount: 1800.00, desc: 'Electricity Bill - BESCOM', ref: 'BESCOM-992-PP' },
    { user: 'Arjun Mehta', amount: 999.00, desc: 'GitHub Copilot Annual License', ref: 'GH-OCT-AM' },
    { user: 'Arjun Mehta', amount: 450.00, desc: 'Uber Premier Ride to Airport', ref: 'UBER-5512-AM' },
    { user: 'Sneha Reddy', amount: 1500.00, desc: 'Zomato Office Team Lunch', ref: 'ZOM-7731-SR' },
  ];

  console.log('\n💸 Adding Debit Transactions...');
  for (const d of debits) {
    const acct = accounts[d.user];
    if (!acct) continue;

    const { data, error } = await supabase.rpc('process_transaction', {
      p_account_id: acct.id,
      p_type: 'debit',
      p_amount: d.amount,
      p_description: d.desc,
      p_reference_id: d.ref,
    });

    if (error) {
      console.warn(`Debit note for ${d.ref}:`, error.message);
    } else {
      console.log(`✓ Debit ₹${d.amount} <- ${d.user} (${d.desc}) [duplicate: ${data ? data.duplicate : false}]`);
    }
  }

  // 4. Transfers (6 transfers = 12 ledger transactions)
  const transfers = [
    { from: 'Rahul Mishra', to: 'Aastha Jha', amount: 500.00, desc: 'Dinner Bill Split', ref: 'XFER-001' },
    { from: 'Aastha Jha', to: 'Rahul Mishra', amount: 150.00, desc: 'Movie Snacks Share', ref: 'XFER-002' },
    { from: 'Vikramaditya Sharma', to: 'Priya Patel', amount: 1500.00, desc: 'Weekend Getaway Airbnb', ref: 'XFER-003' },
    { from: 'Priya Patel', to: 'Arjun Mehta', amount: 750.00, desc: 'Birthday Gift Contribution', ref: 'XFER-004' },
    { from: 'Arjun Mehta', to: 'Sneha Reddy', amount: 1200.00, desc: 'Conference Ticket Reimbursement', ref: 'XFER-005' },
    { from: 'Sneha Reddy', to: 'Vikramaditya Sharma', amount: 800.00, desc: 'Team Lunch Share', ref: 'XFER-006' },
  ];

  console.log('\n🔄 Performing Atomic Transfers...');
  for (const t of transfers) {
    const fromAcct = accounts[t.from];
    const toAcct = accounts[t.to];
    if (!fromAcct || !toAcct) continue;

    const { data, error } = await supabase.rpc('transfer_funds', {
      p_from_account_id: fromAcct.id,
      p_to_account_id: toAcct.id,
      p_amount: t.amount,
      p_description: t.desc,
      p_reference_id: t.ref,
    });

    if (error) {
      console.warn(`Transfer note for ${t.ref}:`, error.message);
    } else {
      console.log(`✓ Transfer ₹${t.amount}: ${t.from} -> ${t.to} (${t.desc}) [duplicate: ${data ? data.duplicate : false}]`);
    }
  }

  // 5. Fetch Summary
  const { data: finalAccounts } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
  const { count: totalTxns } = await supabase.from('transactions').select('*', { count: 'exact', head: true });

  console.log('\n=============================================');
  console.log(`✅ Seed Complete!`);
  console.log(`📊 Total Accounts: ${finalAccounts ? finalAccounts.length : 0}`);
  console.log(`💳 Total Transactions: ${totalTxns || 0}`);
  console.log('=============================================');
  if (finalAccounts) {
    for (const a of finalAccounts) {
      console.log(`  • ${a.name.padEnd(24)} Balance: ₹${Number(a.balance).toFixed(2).padStart(10)}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
