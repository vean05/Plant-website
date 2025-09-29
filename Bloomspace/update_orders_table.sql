-- Update orders table to fix payment method values and add payment details
USE bloomspace_db;

-- First, let's check current payment_method values
SELECT DISTINCT payment_method FROM orders;

-- Update existing payment_method values to match frontend
UPDATE orders SET payment_method = 'credit_card' WHERE payment_method = 'card';
UPDATE orders SET payment_method = 'bank_transfer' WHERE payment_method = 'bank';
UPDATE orders SET payment_method = 'e_wallet' WHERE payment_method = 'ewallet';
-- 'cod' should already match

-- Add payment_details column to store detailed payment information
ALTER TABLE orders ADD COLUMN payment_details JSON NULL AFTER payment_method;

-- Update the ENUM values to match frontend
ALTER TABLE orders MODIFY COLUMN payment_method ENUM('card', 'bank', 'ewallet', 'cod') NOT NULL;

-- Verify the changes
DESCRIBE orders;
