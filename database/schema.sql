-- ═══════════════════════════════════════
-- SCHEMA COMPLETO - FLORES E-COMMERCE
-- Para PostgreSQL 16
-- ═══════════════════════════════════════

-- 1. CATEGORÍAS
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  parent_id   INT REFERENCES categories(id),
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTOS
CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) UNIQUE NOT NULL,
  description     TEXT,
  short_desc      TEXT,
  category_id     INT REFERENCES categories(id),
  gender          VARCHAR(20) CHECK (gender IN ('mujer','hombre','unisex','niño')),
  brand           VARCHAR(100) DEFAULT 'Flores',
  base_price      DECIMAL(10,2) NOT NULL,
  compare_price   DECIMAL(10,2),          -- precio tachado (oferta)
  is_featured     BOOLEAN DEFAULT false,
  is_new          BOOLEAN DEFAULT true,
  is_active       BOOLEAN DEFAULT true,
  tags            TEXT[],
  meta_title      VARCHAR(255),
  meta_desc       TEXT,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. IMÁGENES DE PRODUCTO
CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    VARCHAR(255),
  sort_order  INT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false
);

-- 4. VARIANTES (Talla/Color)
CREATE TABLE product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id) ON DELETE CASCADE,
  size        VARCHAR(20),            -- ej: '38', '39', 'Único'
  color       VARCHAR(50),
  color_hex   VARCHAR(7),             -- ej: '#000000'
  sku         VARCHAR(100) UNIQUE,
  price       DECIMAL(10,2),          -- sobreescribe base_price si no es null
  is_active   BOOLEAN DEFAULT true
);

-- 5. INVENTARIO
CREATE TABLE inventory (
  id              SERIAL PRIMARY KEY,
  variant_id      INT REFERENCES product_variants(id) ON DELETE CASCADE UNIQUE,
  stock_quantity  INT NOT NULL DEFAULT 0,
  low_stock_alert INT DEFAULT 3,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MOVIMIENTOS DE INVENTARIO
CREATE TABLE inventory_movements (
  id           SERIAL PRIMARY KEY,
  variant_id   INT REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity     INT NOT NULL,           -- positivo = entrada, negativo = salida
  reason       VARCHAR(50) CHECK (reason IN ('compra','venta','ajuste','devolucion')),
  note         TEXT,
  created_by   INT,                    -- referencia a admin_users (se crea abajo)
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PEDIDOS (Para control interno, las ventas entran por aquí)
CREATE TABLE orders (
  id              SERIAL PRIMARY KEY,
  order_number    VARCHAR(20) UNIQUE NOT NULL,  -- ej: FLORES-0001
  customer_name   VARCHAR(255) NOT NULL,
  customer_phone  VARCHAR(30),
  customer_email  VARCHAR(255),
  delivery_type   VARCHAR(20) CHECK (delivery_type IN ('envio','retiro')),
  address         TEXT,
  city            VARCHAR(100),
  note            TEXT,
  status          VARCHAR(30) DEFAULT 'pendiente'
                  CHECK (status IN ('pendiente','confirmado','enviado','entregado','cancelado')),
  subtotal        DECIMAL(10,2),
  shipping_cost   DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2),
  payment_method  VARCHAR(50),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ITEMS DEL PEDIDO
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT REFERENCES orders(id) ON DELETE CASCADE,
  variant_id  INT REFERENCES product_variants(id),
  product_name VARCHAR(255),
  variant_desc VARCHAR(100),
  quantity    INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2)
);

-- 9. CMS: BANNERS
CREATE TABLE cms_banners (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255),
  subtitle    TEXT,
  image_url   TEXT NOT NULL,
  image_mobile_url TEXT,
  link_url    TEXT,
  link_text   VARCHAR(100),
  position    INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CMS: ANNOUNCEMENT BAR
CREATE TABLE cms_announcement (
  id          SERIAL PRIMARY KEY,
  text        TEXT NOT NULL,
  link_url    TEXT,
  bg_color    VARCHAR(7) DEFAULT '#000000',
  text_color  VARCHAR(7) DEFAULT '#FFFFFF',
  is_active   BOOLEAN DEFAULT true
);

-- 11. USUARIOS ADMIN
CREATE TABLE admin_users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(100) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('superadmin','admin')),
  is_active       BOOLEAN DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════
-- DATOS INICIALES (SEEDS)
-- ═══════════════════════════════════════

-- Categorías base
INSERT INTO categories (name, slug, sort_order) VALUES 
('Botas', 'botas', 1),
('Zapatos', 'zapatos', 2),
('Zapatillas', 'zapatillas', 3),
('Zapatillas Deportivas', 'zapatillas-deportivas', 4),
('Tacos', 'tacos', 5);

-- Anuncio por defecto
INSERT INTO cms_announcement (text, bg_color, text_color, is_active) VALUES 
('MARCA TENDENCIA CON FLORES - ENVÍOS A TODO EL PAÍS', '#E5C400', '#000000', true);

-- Usuario admin inicial (pass: admin123 -> Hasheado con bcrypt coste 10)
-- IMPORTANTE: Cambiar la contraseña después en producción
INSERT INTO admin_users (username, email, password_hash, role) VALUES 
('admin', 'admin@flores.com', '$2b$10$CkMXsrN9cRcrDNBYVb9kp.4.Pwa.CLqhpfWY9TngvVWMpMjCKzbla', 'superadmin');
