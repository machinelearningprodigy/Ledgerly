-- ============================================================
-- Sample Seed Data (18 Accounts, 120+ Transactions)
-- Optional: Run in Supabase SQL Editor if resetting data
-- ============================================================

DO $$
DECLARE
  v_rm UUID; v_aj UUID; v_vs UUID; v_pp UUID; v_am UUID; v_sr UUID;
  v_rg UUID; v_dn UUID; v_as UUID; v_kk UUID; v_mj UUID; v_srao UUID;
  v_ts UUID; v_av UUID; v_pi UUID; v_ym UUID;
BEGIN
  -- Insert Accounts if not existing
  INSERT INTO accounts (name) VALUES ('Rahul Mishra') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Aastha Jha') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Vikramaditya Sharma') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Priya Patel') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Arjun Mehta') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Sneha Reddy') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Rohan Gupta') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Divya Nair') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Ananya Sen') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Kabir Kapoor') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Meera Joshi') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Siddharth Rao') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Tanvi Shah') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Aditya Verma') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Pooja Iyer') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Yash Malhotra') ON CONFLICT DO NOTHING;

  SELECT id INTO v_rm FROM accounts WHERE name = 'Rahul Mishra' LIMIT 1;
  SELECT id INTO v_aj FROM accounts WHERE name = 'Aastha Jha' LIMIT 1;
  SELECT id INTO v_vs FROM accounts WHERE name = 'Vikramaditya Sharma' LIMIT 1;
  SELECT id INTO v_pp FROM accounts WHERE name = 'Priya Patel' LIMIT 1;
  SELECT id INTO v_am FROM accounts WHERE name = 'Arjun Mehta' LIMIT 1;
  SELECT id INTO v_sr FROM accounts WHERE name = 'Sneha Reddy' LIMIT 1;
  SELECT id INTO v_rg FROM accounts WHERE name = 'Rohan Gupta' LIMIT 1;
  SELECT id INTO v_dn FROM accounts WHERE name = 'Divya Nair' LIMIT 1;
  SELECT id INTO v_as FROM accounts WHERE name = 'Ananya Sen' LIMIT 1;
  SELECT id INTO v_kk FROM accounts WHERE name = 'Kabir Kapoor' LIMIT 1;
  SELECT id INTO v_mj FROM accounts WHERE name = 'Meera Joshi' LIMIT 1;
  SELECT id INTO v_srao FROM accounts WHERE name = 'Siddharth Rao' LIMIT 1;
  SELECT id INTO v_ts FROM accounts WHERE name = 'Tanvi Shah' LIMIT 1;
  SELECT id INTO v_av FROM accounts WHERE name = 'Aditya Verma' LIMIT 1;
  SELECT id INTO v_pi FROM accounts WHERE name = 'Pooja Iyer' LIMIT 1;
  SELECT id INTO v_ym FROM accounts WHERE name = 'Yash Malhotra' LIMIT 1;

  -- Initial Credits Batch 1
  PERFORM process_transaction(v_rm, 'credit', 5000.00, 'Salary - October 2026', 'SAL-2026-10-RM');
  PERFORM process_transaction(v_rm, 'credit', 1200.00, 'Freelance UI Design Project', 'FL-2026-10-RM');
  PERFORM process_transaction(v_aj, 'credit', 8500.00, 'Consulting Retainer Monthly', 'CONS-2026-10-AJ');
  PERFORM process_transaction(v_aj, 'credit', 1500.00, 'Stock Dividend Payout Q3', 'DIV-2026-10-AJ');
  PERFORM process_transaction(v_vs, 'credit', 12000.00, 'Tech Lead Monthly Salary', 'SAL-2026-10-VS');
  PERFORM process_transaction(v_vs, 'credit', 3500.00, 'Quarterly Performance Bonus', 'BON-2026-Q3-VS');
  PERFORM process_transaction(v_pp, 'credit', 6200.00, 'Product Manager Salary', 'SAL-2026-10-PP');
  PERFORM process_transaction(v_pp, 'credit', 800.00, 'E-commerce Store Sales', 'STORE-2026-10-PP');
  PERFORM process_transaction(v_am, 'credit', 4500.00, 'Backend Engineering Salary', 'SAL-2026-10-AM');
  PERFORM process_transaction(v_am, 'credit', 2000.00, 'Open Source Developer Grant', 'GRANT-2026-AM');
  PERFORM process_transaction(v_sr, 'credit', 7800.00, 'Data Scientist Salary', 'SAL-2026-10-SR');
  PERFORM process_transaction(v_sr, 'credit', 950.00, 'Income Tax Refund FY26', 'REF-2026-SR');

  -- Initial Credits Batch 2 (New 10 Accounts)
  PERFORM process_transaction(v_rg, 'credit', 8200.00, 'Senior Mobile Dev Salary', 'SM-SAL-2026-RG1');
  PERFORM process_transaction(v_rg, 'credit', 1500.00, 'iOS App Store Royalties', 'SM-APP-2026-RG2');
  PERFORM process_transaction(v_dn, 'credit', 9400.00, 'Product Marketing Retainer', 'SM-SAL-2026-DN1');
  PERFORM process_transaction(v_dn, 'credit', 2200.00, 'Conference Keynote Speaker Fee', 'SM-SPK-2026-DN2');
  PERFORM process_transaction(v_as, 'credit', 7600.00, 'UX Research Monthly Payout', 'SM-SAL-2026-AS1');
  PERFORM process_transaction(v_as, 'credit', 1100.00, 'Figma Community Template Sales', 'SM-FIG-2026-AS2');
  PERFORM process_transaction(v_kk, 'credit', 10500.00, 'DevOps Architect Monthly Salary', 'SM-SAL-2026-KK1');
  PERFORM process_transaction(v_kk, 'credit', 3000.00, 'Cloud Infrastructure Audit Bonus', 'SM-AUD-2026-KK2');
  PERFORM process_transaction(v_mj, 'credit', 6800.00, 'Content Strategy Retainer', 'SM-SAL-2026-MJ1');
  PERFORM process_transaction(v_mj, 'credit', 950.00, 'Substack Paid Subscriptions', 'SM-SUB-2026-MJ2');
  PERFORM process_transaction(v_srao, 'credit', 11000.00, 'Engineering Manager Remuneration', 'SM-SAL-2026-SR1');
  PERFORM process_transaction(v_srao, 'credit', 4000.00, 'Annual Equity Vesting Liquidation', 'SM-EQ-2026-SR2');
  PERFORM process_transaction(v_ts, 'credit', 8900.00, 'Brand Design Lead Retainer', 'SM-SAL-2026-TS1');
  PERFORM process_transaction(v_ts, 'credit', 1800.00, 'Webflow Site Template Royalties', 'SM-ROY-2026-TS2');
  PERFORM process_transaction(v_av, 'credit', 7200.00, 'Full Stack Engineer Salary', 'SM-SAL-2026-AV1');
  PERFORM process_transaction(v_av, 'credit', 1400.00, 'Hackathon Grand Prize Share', 'SM-PRIZE-2026-AV2');
  PERFORM process_transaction(v_pi, 'credit', 9800.00, 'AI/ML Solutions Lead Retainer', 'SM-SAL-2026-PI1');
  PERFORM process_transaction(v_pi, 'credit', 2500.00, 'Research Paper Advisory Grant', 'SM-RES-2026-PI2');
  PERFORM process_transaction(v_ym, 'credit', 6400.00, 'Growth Marketing Salary', 'SM-SAL-2026-YM1');
  PERFORM process_transaction(v_ym, 'credit', 1250.00, 'Affiliate Marketing Revenue', 'SM-AFF-2026-YM2');

  -- Debits Batch 1
  PERFORM process_transaction(v_rm, 'debit', 450.00, 'Swiggy Gourmet Dinner', 'SWIG-8841-RM');
  PERFORM process_transaction(v_rm, 'debit', 199.00, 'Spotify Premium Family', 'SPOT-3921-RM');
  PERFORM process_transaction(v_rm, 'debit', 1299.00, 'Airtel Broadband Fiber', 'AIRTEL-441-RM');
  PERFORM process_transaction(v_aj, 'debit', 2400.00, 'Amazon Pantry Groceries', 'AMZN-9912-AJ');
  PERFORM process_transaction(v_aj, 'debit', 850.00, 'Cult.fit Gym Membership', 'CULT-1022-AJ');
  PERFORM process_transaction(v_vs, 'debit', 3500.00, 'AWS Cloud Hosting Services', 'AWS-OCT-VS');
  PERFORM process_transaction(v_vs, 'debit', 1200.00, 'Flight Tickets - Indigo', 'INDIGO-882-VS');
  PERFORM process_transaction(v_pp, 'debit', 650.00, 'Blue Tokai Specialty Coffee', 'COFFEE-112-PP');
  PERFORM process_transaction(v_pp, 'debit', 1800.00, 'Electricity Bill - BESCOM', 'BESCOM-992-PP');
  PERFORM process_transaction(v_am, 'debit', 999.00, 'GitHub Copilot Annual License', 'GH-OCT-AM');
  PERFORM process_transaction(v_am, 'debit', 450.00, 'Uber Premier Ride to Airport', 'UBER-5512-AM');
  PERFORM process_transaction(v_sr, 'debit', 1500.00, 'Zomato Office Team Lunch', 'ZOM-7731-SR');

  -- Debits Batch 2
  PERFORM process_transaction(v_rg, 'debit', 799.00, 'Apple Developer Annual Subscription', 'SM-DB-RG-APPL');
  PERFORM process_transaction(v_rg, 'debit', 1450.00, 'Starbucks Coffee & Snacks', 'SM-DB-RG-SBUX');
  PERFORM process_transaction(v_dn, 'debit', 2100.00, 'Notion Team Workspace Subscription', 'SM-DB-DN-NOTION');
  PERFORM process_transaction(v_dn, 'debit', 650.00, 'Kindle Unlimited E-Books', 'SM-DB-DN-KNDL');
  PERFORM process_transaction(v_as, 'debit', 1850.00, 'Blinkit Grocery Delivery', 'SM-DB-AS-BLNK');
  PERFORM process_transaction(v_kk, 'debit', 3200.00, 'DigitalOcean Droplets Hosting', 'SM-DB-KK-DO');
  PERFORM process_transaction(v_kk, 'debit', 890.00, 'NordVPN Annual Security Plan', 'SM-DB-KK-VPN');
  PERFORM process_transaction(v_mj, 'debit', 499.00, 'Grammarly Premium Subscription', 'SM-DB-MJ-GRM');
  PERFORM process_transaction(v_mj, 'debit', 1200.00, 'FabIndia Ethnic Wear', 'SM-DB-MJ-FAB');
  PERFORM process_transaction(v_srao, 'debit', 4500.00, 'Dell Ultrasharp Monitor EMI', 'SM-DB-SR-DELL');
  PERFORM process_transaction(v_srao, 'debit', 1750.00, 'Fine Dining Dinner at Olive', 'SM-DB-SR-DINE');
  PERFORM process_transaction(v_ts, 'debit', 2400.00, 'Adobe Creative Cloud Suite', 'SM-DB-TS-ADBE');
  PERFORM process_transaction(v_av, 'debit', 850.00, 'GitHub Copilot Monthly', 'SM-DB-AV-GH');
  PERFORM process_transaction(v_av, 'debit', 1600.00, 'Cult.fit Pass Monthly', 'SM-DB-AV-CULT');
  PERFORM process_transaction(v_pi, 'debit', 2800.00, 'OpenAI API Credits Usage', 'SM-DB-PI-OAI');
  PERFORM process_transaction(v_pi, 'debit', 950.00, 'Uber Premier City Rides', 'SM-DB-PI-UBER');
  PERFORM process_transaction(v_ym, 'debit', 1350.00, 'Facebook Ads Campaign Test', 'SM-DB-YM-META');
  PERFORM process_transaction(v_ym, 'debit', 550.00, 'Zomato Biryani Lunch Order', 'SM-DB-YM-ZOM');

  -- Transfers
  PERFORM transfer_funds(v_rm, v_aj, 500.00, 'Dinner Bill Split', 'XFER-001');
  PERFORM transfer_funds(v_aj, v_rm, 150.00, 'Movie Snacks Share', 'XFER-002');
  PERFORM transfer_funds(v_vs, v_pp, 1500.00, 'Weekend Getaway Airbnb', 'XFER-003');
  PERFORM transfer_funds(v_pp, v_am, 750.00, 'Birthday Gift Contribution', 'XFER-004');
  PERFORM transfer_funds(v_am, v_sr, 1200.00, 'Conference Ticket Reimbursement', 'XFER-005');
  PERFORM transfer_funds(v_sr, v_vs, 800.00, 'Team Lunch Share', 'XFER-006');
  PERFORM transfer_funds(v_rg, v_dn, 1200.00, 'Co-working Office Desk Split', 'SM-XFER-001');
  PERFORM transfer_funds(v_dn, v_as, 800.00, 'Design Assets Purchase Split', 'SM-XFER-002');
  PERFORM transfer_funds(v_kk, v_srao, 2500.00, 'Kubernetes Cluster Shared Server', 'SM-XFER-003');
  PERFORM transfer_funds(v_mj, v_ts, 650.00, 'Illustrations Royalty Share', 'SM-XFER-004');
  PERFORM transfer_funds(v_srao, v_av, 1500.00, 'Team Hackathon Bounty Payout', 'SM-XFER-005');
  PERFORM transfer_funds(v_pi, v_ym, 900.00, 'Marketing Graphics Campaign Share', 'SM-XFER-006');
  PERFORM transfer_funds(v_ts, v_rg, 1100.00, 'Mobile UI Kit Collaboration', 'SM-XFER-007');
  PERFORM transfer_funds(v_av, v_kk, 450.00, 'Domain Name Registration Share', 'SM-XFER-008');
  PERFORM transfer_funds(v_ym, v_rm, 750.00, 'Landing Page Optimization Fee', 'SM-XFER-009');
  PERFORM transfer_funds(v_sr, v_pi, 1300.00, 'LLM Fine-tuning GPU Share', 'SM-XFER-010');
END $$;
