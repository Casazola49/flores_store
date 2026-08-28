-- ==========================================
-- SEED PART 1: LIMPIEZA Y CATEGORIAS
-- Ejecutar primero este archivo
-- ==========================================

-- Limpiar datos existentes (orden inverso por foreign keys)
TRUNCATE inventory_movements, inventory, order_items, orders, product_variants, product_images, products, categories, cms_banners, cms_announcement RESTART IDENTITY CASCADE;

-- Categorías
INSERT INTO categories (name, slug, description, image_url, sort_order, is_active) VALUES
('Botas', 'botas', 'Botas para todas las ocasiones', 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=600', 1, true),
('Zapatillas', 'zapatillas', 'Zapatillas urbanas y deportivas', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', 2, true),
('Tacos', 'tacos', 'Tacones elegantes para mujer', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600', 3, true),
('Loafers', 'loafers', 'Mocasines y loafers clásicos', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600', 4, true),
('Sandalias', 'sandalias', 'Sandalias para el verano', 'https://images.unsplash.com/photo-1562273103-91206777044a?q=80&w=600', 5, true),
('Deportivos', 'deportivos', 'Calzado deportivo de alto rendimiento', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600', 6, true);

-- CMS Announcement
INSERT INTO cms_announcement (text, link_url, bg_color, text_color, is_active) VALUES
('🔥 LIQUIDACIÓN FINAL — Envío GRATIS en pedidos +Bs. 300 — Oferta termina a medianoche', '/productos?sale=true', '#9B1C1C', '#FFFFFF', true);

-- CMS Banners
INSERT INTO cms_banners (title, subtitle, image_url, link_url, link_text, position, is_active) VALUES
('Hot Drops', 'Lo más nuevo de la temporada', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600', '/productos?is_new=true', 'Ver Drops', 1, true),
('Última Liquidación', 'Hasta 50% OFF en últimas tallas', 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=1600', '/productos?sale=true', 'Ver Liquidación', 2, true);
