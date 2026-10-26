-- ============================================================
-- Sample Seed Data (8 Accounts, 42 Transactions)
-- Optional: Run in Supabase SQL Editor if resetting data
-- ============================================================

-- Accounts are created with initial balance 0, then funded via process_transaction / transfer_funds.
-- To run this manually via SQL:
DO $$
DECLARE
  v_rm UUID;
  v_aj UUID;
  v_vs UUID;
  v_pp UUID;
  v_am UUID;
  v_sr UUID;
BEGIN
  -- Insert Accounts if not existing
  INSERT INTO accounts (name) VALUES ('Rahul Mishra') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Aastha Jha') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Vikramaditya Sharma') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Priya Patel') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Arjun Mehta') ON CONFLICT DO NOTHING;
  INSERT INTO accounts (name) VALUES ('Sneha Reddy') ON CONFLICT DO NOTHING;

  SELECT id INTO v_rm FROM accounts WHERE name = 'Rahul Mishra' LIMIT 1;
  SELECT id INTO v_aj FROM accounts WHERE name = 'Aastha Jha' LIMIT 1;
  SELECT id INTO v_vs FROM accounts WHERE name = 'Vikramaditya Sharma' LIMIT 1;
  SELECT id INTO v_pp FROM accounts WHERE name = 'Priya Patel' LIMIT 1;
  SELECT id INTO v_am FROM accounts WHERE name = 'Arjun Mehta' LIMIT 1;
  SELECT id INTO v_sr FROM accounts WHERE name = 'Sneha Reddy' LIMIT 1;

  -- Add Initial Credits
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

  -- Add Debits
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

  -- Add Transfers
  PERFORM transfer_funds(v_rm, v_aj, 500.00, 'Dinner Bill Split', 'XFER-001');
  PERFORM transfer_funds(v_aj, v_rm, 150.00, 'Movie Snacks Share', 'XFER-002');
  PERFORM transfer_funds(v_vs, v_pp, 1500.00, 'Weekend Getaway Airbnb', 'XFER-003');
  PERFORM transfer_funds(v_pp, v_am, 750.00, 'Birthday Gift Contribution', 'XFER-004');
  PERFORM transfer_funds(v_am, v_sr, 1200.00, 'Conference Ticket Reimbursement', 'XFER-005');
  PERFORM transfer_funds(v_sr, v_vs, 800.00, 'Team Lunch Share', 'XFER-006');
END $$;
