-- =====================================================
-- IVALUX IMPERIAL - Complete Product Catalog
-- Source: https://ivaluximperial.com/ (prices & categories exact)
-- Run after: schema.sql
-- =====================================================

-- Add columns if they don't exist (required before INSERT)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

-- Clear existing products (optional - uncomment to start fresh)
-- DELETE FROM public.products;

INSERT INTO public.products (name, description, countries_available, image_url, price, category)
VALUES
  -- IVALUX COSMETICS (Skincare, Body Care)
  ('American Blend Wig – Premium Collection', 'Perruque synthétique premium au volume glamour. Aspect naturel, prête à porter.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png', 109, 'Ivalux Hair'),
  ('Booster Puissance Blancheur – Activateur Éclaircissant Ultra-Concentré pour Lait Corporel', 'Concentré éclaircissant ultra-puissant pour intensifier l''action blanchissante des laits corporels.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png?v=1770527071', 62, 'Ivalux Cosmetics'),
  ('Café BANGALUX', 'Premium coffee blend from the Ivalux Impérial collection.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG_4088.jpg?v=1759043094', 62, 'Ivalux Dietetics'),
  ('Chantilly Éclat Blanc – Beurre Corporel Éclaircissant, Nourrissant & Illuminateur', 'Beurre corporel éclaircissant, nourrissant et illuminateur pour une peau lisse et lumineuse.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 38, 'Ivalux Cosmetics'),
  ('Création de Marque Cosmétique – Service Professionnel | Ivalux Impérial', 'Service professionnel de création de marque cosmétique.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/87DF7609-5A54-4924-B44D-C1C74C723737.png?v=1769395663', 237, 'Services'),
  ('Crème Visage Blanche Injection – Gamme Blanche | Ivalux Impérial', 'Crème visage ultra-blanchissante de la gamme Blanche. Traitement facial professionnel.', ARRAY['CA','US','FR','BE'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1268.png?v=1769265336', 95, 'Ivalux Cosmetics'),
  ('Crème Visage Maya Métisse – Ivalux Impérial', 'Crème visage Maya Métisse pour un teint équilibré et lumineux.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1317.png?v=1769394712', 85, 'Ivalux Cosmetics'),
  ('Gamme Blanche Injection – Ultra Blanchissante | Ivalux Impérial', 'Gamme complète ultra-blanchissante White Injection. Collection professionnelle.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1268.png?v=1769265336', 425, 'Ivalux Cosmetics'),
  ('Gamme CARTERONE (Mini)', 'Gamme Carterone en format mini. Set de soins complet.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1268.png?v=1769265336', 123, 'Ivalux Cosmetics'),
  ('Gel Douche Blanche Injection – Gamme Blanche | Ivalux Impérial', 'Gel douche éclaircissant de la gamme Blanche.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1268.png?v=1769265336', 85, 'Ivalux Cosmetics'),
  ('Gel Douche Maya Métisse – Ivalux Impérial', 'Gel douche Maya Métisse pour un nettoyage en douceur.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1317.png?v=1769394712', 76, 'Ivalux Cosmetics'),
  ('Gélules Super Bombasse – Booster Fessier & Formes', 'Gélules booster pour les formes. Formule naturelle.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG_4088.jpg?v=1759043094', 95, 'Ivalux Dietetics'),
  ('Gluta Américain – Gamme Ultra Éclaircissante | Ivalux Impérial Petit format', 'Gluta Américain format compact. Gamme ultra-éclaircissante.', ARRAY['CA','US'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/86B75FF3-6B27-4BE0-867E-0A903C643E77.png?v=1770526720', 189, 'Ivalux Cosmetics'),
  ('Huile Soleil – Huile Éclaircissante, Ultra-Hydratante & Illuminatrice Corps', 'Huile corporelle éclaircissante, hydratante et illuminateur.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/97E0D60C-D059-4C0E-BEFA-64219BEA9C51.png?v=1770526851', 48, 'Ivalux Cosmetics'),
  ('Ivalux Impérial – Royal Waves Bob', 'Perruque bob ondulée royale. Style chic et sophistiqué.', ARRAY['CA','US','FR','BE','CH'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 350, 'Ivalux Hair'),
  ('La Mousse Lumière – Mousse Nettoyante Éclaircissante & Illuminatrice Visage', 'Mousse nettoyante visage éclaircissante et illuminateur.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 38, 'Ivalux Cosmetics'),
  ('Lait Corporel Blanche Injection – Gamme Blanche | Ivalux Impérial', 'Lait corporel blanchissant de la gamme Blanche.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1268.png?v=1769265336', 123, 'Ivalux Cosmetics'),
  ('Lait Corporel Maya Métisse – Ivalux Impérial', 'Lait corporel Maya Métisse pour une peau douce et lumineuse.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1317.png?v=1769394712', 104, 'Ivalux Cosmetics'),
  ('Lala Blanche – Savon Éclaircissant 24h Chrono | Peau plus Claire, Lisse et Lumineuse', 'Savon éclaircissant 24h. Peau plus claire, lisse et lumineuse.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 57, 'Ivalux Cosmetics'),
  ('Lotion Mamie – Lotion Réparatrice Intense pour Brûlures et Irritations Cosmétiques', 'Lotion réparatrice pour brûlures et irritations cosmétiques.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/04BE3E8C-A34E-4060-97B2-859C6A6EB626.png?v=1770526577', 57, 'Ivalux Cosmetics'),
  ('Molato Blancheur + 7 Jours – Savon Rose Blanchissant & Éclaircissant Puissant', 'Savon rose blanchissant et éclaircissant. Formule 7 jours.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 95, 'Ivalux Cosmetics'),
  ('Molato Royal – Savon Blanchissant, Illuminateur & Unifiant Premium', 'Savon premium blanchissant, illuminateur et unifiant.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png?v=1770527071', 62, 'Ivalux Cosmetics'),
  ('Perruque Champagne Glow – Longueurs Rosées Glamour 22"', 'Perruque 22" longueurs rosées glamour. Look champagne.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 728, 'Ivalux Hair'),
  ('Perruque Diva Curl – Volume Glamour, Boucles Luxe', 'Perruque Diva Curl. Volume glamour, boucles luxe.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 425, 'Ivalux Hair'),
  ('Perruque Hazel Bob – Blond Luxe Signature', 'Perruque Hazel Bob. Blond luxe signature.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 400, 'Ivalux Hair'),
  ('Perruque Impératrice wave – Longueurs Royales & Boucles Signature', 'Perruque Impératrice wave. Longueurs royales, boucles signature.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 720, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Chic Bob Frange', 'Perruque Chic Bob avec frange.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 0, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Diva Royal Volume', 'Perruque Diva Royal Volume. Style volumineux.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 750, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Lady Bob', 'Perruque Lady Bob. Élégance classique.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 370, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Olive Brown Waves', 'Perruque Olive Brown Waves. Ondulations naturelles.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 700, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Pixie black', 'Perruque Pixie black. Coupe courte moderne.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 300, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Pixie Suprême Élégance', 'Perruque Pixie Suprême Élégance.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 300, 'Ivalux Hair'),
  ('Perruque Ivalux Imperial – Queen Wakanda', 'Perruque Queen Wakanda. Style royal.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 380, 'Ivalux Hair'),
  ('Perruque Luxury Black – Layered Luxury Black', 'Perruque Luxury Black. Couches noir luxe.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 680, 'Ivalux Hair'),
  ('Perruque Or Royal - Gold Glow Luxury', 'Perruque Or Royal. Gold Glow Luxury.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 750, 'Ivalux Hair'),
  ('Perruque Silk Caramel – Volume Chocolat Luxueux', 'Perruque Silk Caramel. Volume chocolat luxueux.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 450, 'Ivalux Hair'),
  ('Perruque Silk queen – Silk Volume Bob', 'Perruque Silk queen. Silk Volume Bob.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1918.jpg?v=1771110863', 450, 'Ivalux Hair'),
  ('Représentation Spaghetti Yoryette USA', 'Devenez Représentante Officielle aux USA. Opportunité commerciale.', ARRAY['US'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/7633B32E-02EF-4E1D-820A-FD899BF69A9B.png?v=1771216736', 1700, 'Ivalux Dietetics'),
  ('REPRÉSENTATION SPAGUETTI YORYETTE EUROPE', 'Devenez Représentante Officielle en Europe. Opportunité commerciale.', ARRAY['FR','BE','CH'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/296E628C-C84B-42DB-839B-76F11A074100.png?v=1771216190', 1700, 'Ivalux Dietetics'),
  ('Rosé Blancheur – Gommage Éclaircissant & Illuminateur aux Véritables Pétales de Rose', 'Gommage éclaircissant aux pétales de rose.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 40, 'Ivalux Cosmetics'),
  ('Rouge à lèvres Ivalux', 'Rouge à lèvres Ivalux. Teintes luxe.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 25, 'Ivalux Makeup'),
  ('Royal Or 24 Carats – Gel Corps Éclaircissant, Illuminant & Anti-Âge aux Particules d''Or 24K', 'Gel corps éclaircissant aux particules d''or 24K. Effet anti-âge.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/97E0D60C-D059-4C0E-BEFA-64219BEA9C51.png?v=1770526851', 80, 'Ivalux Cosmetics'),
  ('Savon Blanche Injection – Gamme Blanche | Ivalux Impérial', 'Savon Blanche Injection de la gamme Blanche.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png?v=1770526309', 80, 'Ivalux Cosmetics'),
  ('Savon Corporel Maya Métisse – Ivalux Impérial', 'Savon corporel Maya Métisse.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG-1317.png?v=1769394712', 70, 'Ivalux Cosmetics'),
  ('Sérum Correcteur Métisse – Sérum Visage Blanchissant, Correcteur & Unifiant', 'Sérum visage blanchissant, correcteur et unifiant.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/86B75FF3-6B27-4BE0-867E-0A903C643E77.png?v=1770526720', 50, 'Ivalux Cosmetics'),
  ('Thé Minceur', 'Thé minceur Ivalux Imperial.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG_4088.jpg?v=1759043094', 95, 'Ivalux Dietetics'),
  ('Thé Minceur SPAGUETTI YORYETTE', 'Thé minceur Spaghetti Yoryette. Produit premium.', ARRAY['CA','US','FR'], 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/IMG_4088.jpg?v=1759043094', 95, 'Ivalux Dietetics')
;
