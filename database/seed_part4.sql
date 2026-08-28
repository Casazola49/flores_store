-- ==========================================
-- SEED PART 4: PEDIDOS DE EJEMPLO
-- Para demostrar el panel de gestión CMS
-- ==========================================

-- Pedidos de ejemplo con distintos estados
INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, delivery_type, address, city, note, status, subtotal, shipping_cost, total, payment_method) VALUES
('FLORES-0001', 'María Valentina Cruz', '+591 70012345', 'maria@gmail.com', 'envio', 'Av. Banzer km 5, Urb. Los Jardines, Casa 12', 'Santa Cruz', 'Entregar en horario de mañana', 'entregado', 450.00, 30.00, 480.00, 'QR'),
('FLORES-0002', 'Carlos Alberto Mendoza', '+591 76543210', 'carlos.m@hotmail.com', 'envio', 'Calle Sucre #345, Zona Central', 'Cochabamba', '', 'enviado', 640.00, 50.00, 690.00, 'Transferencia'),
('FLORES-0003', 'Ana Patricia Flores', '+591 69876543', NULL, 'retiro', NULL, 'Santa Cruz', 'Recoger el sábado por la tarde', 'confirmado', 320.00, 0.00, 320.00, 'Efectivo'),
('FLORES-0004', 'Diego Ramírez Vaca', '+591 72345678', 'diego.r@gmail.com', 'envio', 'Av. Hernando Siles, Edif. Torres del Sur, Dpto 4B', 'La Paz', 'Número de referencia: Edificio color beige', 'pendiente', 900.00, 60.00, 960.00, 'Tigo Money'),
('FLORES-0005', 'Lucía Fernanda Quispe', '+591 71234567', NULL, 'envio', 'Calle Oruro #89, Barrio Petrolero', 'Santa Cruz', '', 'confirmado', 580.00, 30.00, 610.00, 'QR'),
('FLORES-0006', 'Jorge Eduardo Balcázar', '+591 77890123', 'jorge.b@outlook.com', 'retiro', NULL, 'Santa Cruz', '', 'entregado', 480.00, 0.00, 480.00, 'Efectivo'),
('FLORES-0007', 'Sofía Alejandra Torres', '+591 65432109', NULL, 'envio', 'Av. Circunvalación Este, Villa 1ero de Mayo', 'Santa Cruz', 'Dejar en portería si no estoy', 'pendiente', 760.00, 30.00, 790.00, 'QR'),
('FLORES-0008', 'Roberto Ibáñez Pereira', '+591 68901234', 'roberto.ip@gmail.com', 'envio', 'Calle Potosí #123, Centro', 'Oruro', '', 'cancelado', 350.00, 50.00, 400.00, 'Transferencia'),
('FLORES-0009', 'Valentina Soliz Arana', '+591 74567890', NULL, 'retiro', NULL, 'Santa Cruz', '', 'confirmado', 420.00, 0.00, 420.00, 'QR'),
('FLORES-0010', 'Marco Antonio Gutierrez', '+591 79012345', 'marco.g@gmail.com', 'envio', 'Av. Santos Dumont, Barrio Las Palmas, Casa 5', 'Santa Cruz', 'Llamar antes de llegar', 'enviado', 680.00, 30.00, 710.00, 'Tigo Money');

-- Order items (asociados al primer pedido como ejemplo)
INSERT INTO order_items (order_id, variant_id, product_name, variant_desc, quantity, unit_price, subtotal)
SELECT
  1,
  pv.id,
  p.name,
  'Talla 38 — Negro',
  1,
  p.base_price,
  p.base_price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.slug = 'bota-chelsea-noir' AND pv.size = '38'
LIMIT 1;

-- ==========================================
-- RESUMEN FINAL
-- ==========================================
SELECT 'SEED COMPLETADO' AS estado;
SELECT COUNT(*) AS categorias FROM categories;
SELECT COUNT(*) AS productos FROM products;
SELECT COUNT(*) AS imagenes FROM product_images;
SELECT COUNT(*) AS variantes FROM product_variants;
SELECT COUNT(*) AS inventario FROM inventory;
SELECT COUNT(*) AS pedidos FROM orders;
