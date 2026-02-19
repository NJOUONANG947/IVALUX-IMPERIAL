-- Add e-commerce fields to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
