-- ==========================================
-- SEED PART 3: IMAGENES, VARIANTES E INVENTARIO
-- ==========================================

-- IMÁGENES (una principal por producto usando Unsplash)
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT p.id,
  CASE p.slug
    WHEN 'bota-chelsea-noir'      THEN 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=800'
    WHEN 'bota-militar-rugged'    THEN 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800'
    WHEN 'bota-over-the-knee'     THEN 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800'
    WHEN 'bota-vaquera-classic'   THEN 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=800'
    WHEN 'bota-tobillera-mini'    THEN 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800'
    WHEN 'sneaker-urban-white'    THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800'
    WHEN 'sneaker-old-school-negro' THEN 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800'
    WHEN 'sneaker-platform'       THEN 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=800'
    WHEN 'sneaker-runner-pro'     THEN 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    WHEN 'sneaker-pastel-mujer'   THEN 'https://images.unsplash.com/photo-1515347648415-0f53bbca466d?q=80&w=800'
    WHEN 'stiletto-dorado'        THEN 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800'
    WHEN 'taco-block-heel-nude'   THEN 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=80&w=800'
    WHEN 'mule-destalonado-negro' THEN 'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?q=80&w=800'
    WHEN 'sandalia-taco-rattan'   THEN 'https://images.unsplash.com/photo-1562273103-91206777044a?q=80&w=800'
    WHEN 'loafer-cuero-cafe'      THEN 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800'
    WHEN 'loafer-borla-negro'     THEN 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800'
    WHEN 'mocasin-plataforma'     THEN 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=800'
    WHEN 'loafer-penny-classic'   THEN 'https://images.unsplash.com/photo-1582897085656-c636d006a246?q=80&w=800'
    WHEN 'sandalia-desert-sand'   THEN 'https://images.unsplash.com/photo-1562273103-91206777044a?q=80&w=800'
    WHEN 'sandalia-gladiadora'    THEN 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?q=80&w=800'
    WHEN 'sandalia-slide-luxury'  THEN 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=800'
    WHEN 'sandalia-hombre-clasica' THEN 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800'
    WHEN 'running-elite-x'        THEN 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800'
    WHEN 'training-cross-mujer'   THEN 'https://images.unsplash.com/photo-1605408499391-6368c628ef42?q=80&w=800'
    WHEN 'basketball-high-top'    THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800'
    WHEN 'walking-comfort-plus'   THEN 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    WHEN 'tenis-indoor-pro'       THEN 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=800'
    WHEN 'sneaker-kids-fun'       THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800'
    WHEN 'bota-kids-winter'       THEN 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=800'
    WHEN 'sandalia-kids-playa'    THEN 'https://images.unsplash.com/photo-1562273103-91206777044a?q=80&w=800'
    ELSE 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800'
  END,
  p.name, 0, true
FROM products p;

-- VARIANTES (tallas para calzado boliviano: 35-44)
-- Botas mujer: 35-40
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id,
  s.size,
  'Negro',
  '#000000',
  p.slug || '-negro-' || s.size,
  true
FROM products p
CROSS JOIN (VALUES ('35'),('36'),('37'),('38'),('39'),('40')) AS s(size)
WHERE p.gender IN ('mujer') AND p.category_id = 1;

-- Botas hombre: 39-45
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Negro', '#000000', p.slug || '-negro-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('39'),('40'),('41'),('42'),('43'),('44')) AS s(size)
WHERE p.gender IN ('hombre') AND p.category_id = 1;

-- Zapatillas unisex/mujer: 35-42
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Blanco', '#FFFFFF', p.slug || '-blanco-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('35'),('36'),('37'),('38'),('39'),('40'),('41'),('42')) AS s(size)
WHERE p.category_id = 2 AND p.gender != 'niño';

-- Tacos mujer: 35-40
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Negro', '#000000', p.slug || '-negro-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('35'),('36'),('37'),('38'),('39'),('40')) AS s(size)
WHERE p.category_id = 3;

-- Loafers: 35-43
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Café', '#8B4513', p.slug || '-cafe-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('36'),('37'),('38'),('39'),('40'),('41'),('42'),('43')) AS s(size)
WHERE p.category_id = 4;

-- Sandalias: 35-41
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Natural', '#D2B48C', p.slug || '-natural-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('35'),('36'),('37'),('38'),('39'),('40'),('41')) AS s(size)
WHERE p.category_id = 5 AND p.gender != 'niño';

-- Deportivos: 37-44
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Negro/Rojo', '#000000', p.slug || '-negro-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('37'),('38'),('39'),('40'),('41'),('42'),('43'),('44')) AS s(size)
WHERE p.category_id = 6;

-- Niños: 28-35
INSERT INTO product_variants (product_id, size, color, color_hex, sku, is_active)
SELECT p.id, s.size, 'Multicolor', '#FF6B6B', p.slug || '-multi-' || s.size, true
FROM products p
CROSS JOIN (VALUES ('28'),('29'),('30'),('31'),('32'),('33'),('34'),('35')) AS s(size)
WHERE p.gender = 'niño';

-- INVENTARIO (stock variado para simular escasez)
INSERT INTO inventory (variant_id, stock_quantity, low_stock_alert)
SELECT
  pv.id,
  CASE
    WHEN RANDOM() < 0.15 THEN FLOOR(RANDOM() * 2 + 1)::INT   -- 15%: stock crítico 1-2
    WHEN RANDOM() < 0.35 THEN FLOOR(RANDOM() * 3 + 3)::INT   -- 20%: bajo stock 3-5
    ELSE FLOOR(RANDOM() * 20 + 6)::INT                        -- 65%: stock normal 6-25
  END,
  3
FROM product_variants pv
ON CONFLICT (variant_id) DO NOTHING;
