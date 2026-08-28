-- ==========================================
-- SEED PART 2: PRODUCTOS (30 productos)
-- ==========================================

INSERT INTO products (name, slug, description, short_desc, category_id, gender, brand, base_price, compare_price, is_featured, is_new, is_active, tags) VALUES

-- BOTAS (category_id=1)
('Bota Chelsea Noir', 'bota-chelsea-noir', 'Bota Chelsea de cuero genuino con elásticos laterales. Perfecta para el día a día con un look sofisticado.', 'Cuero genuino, suela antideslizante', 1, 'mujer', 'Flores', 450.00, 680.00, true, true, true, ARRAY['liquidacion','tendencia','cuero']),
('Bota Militar Rugged', 'bota-militar-rugged', 'Bota estilo militar con cordones y puntera reforzada. Durabilidad y estilo en un solo calzado.', 'Estilo militar, puntera reforzada', 1, 'hombre', 'Flores', 490.00, 720.00, true, false, true, ARRAY['liquidacion','militar','duradero']),
('Bota Over The Knee', 'bota-over-the-knee', 'Bota alta hasta la rodilla en cuero sintético. El accesorio de moda de la temporada.', 'Cuero sintético, cierre lateral', 1, 'mujer', 'Flores', 580.00, 850.00, false, true, true, ARRAY['tendencia','alta','moda']),
('Bota Vaquera Classic', 'bota-vaquera-classic', 'Bota vaquera en cuero café con bordados tradicionales. Auténtico estilo western.', 'Cuero café, bordados artesanales', 1, 'unisex', 'Flores', 620.00, 920.00, false, false, true, ARRAY['western','clasico','artesanal']),
('Bota Tobillera Mini', 'bota-tobillera-mini', 'Bota tobillera minimalista con hebilla lateral. Versátil y cómoda para cualquier outfit.', 'Diseño minimalista, hebilla dorada', 1, 'mujer', 'Flores', 380.00, 560.00, false, true, true, ARRAY['minimalista','versatil']),

-- ZAPATILLAS (category_id=2)
('Sneaker Urban White', 'sneaker-urban-white', 'Zapatilla urbana de cuero blanco con suela chunky. El modelo más vendido de la temporada.', 'Cuero blanco, suela gruesa', 2, 'unisex', 'Flores', 320.00, 490.00, true, true, true, ARRAY['tendencia','blanco','urban']),
('Sneaker Old School Negro', 'sneaker-old-school-negro', 'Zapatilla retro en cuero negro con detalles en contraste. Estilo noventero que regresó con fuerza.', 'Estilo retro, cuero negro', 2, 'hombre', 'Flores', 280.00, 420.00, false, false, true, ARRAY['retro','negro','clasico']),
('Sneaker Platform', 'sneaker-platform', 'Zapatilla con plataforma elevada, mezcla de cuero y mesh. Tendencia streetwear del momento.', 'Plataforma 5cm, mesh transpirable', 2, 'mujer', 'Flores', 350.00, 520.00, true, true, true, ARRAY['platform','streetwear','tendencia']),
('Sneaker Runner Pro', 'sneaker-runner-pro', 'Zapatilla running de alto rendimiento con tecnología de amortiguación avanzada.', 'Amortiguación premium, transpirable', 2, 'hombre', 'Flores', 420.00, 630.00, false, true, true, ARRAY['running','deporte','pro']),
('Sneaker Pastel Mujer', 'sneaker-pastel-mujer', 'Zapatilla en tonos pastel para mujer. Suave, cómoda y muy femenina.', 'Colores pastel, suela blanca', 2, 'mujer', 'Flores', 290.00, 440.00, false, true, true, ARRAY['pastel','femenino','comodo']),

-- TACOS (category_id=3)
('Stiletto Dorado', 'stiletto-dorado', 'Stiletto de aguja en cuero dorado. La pieza más elegante de la colección para eventos especiales.', 'Cuero dorado, tacón 10cm', 3, 'mujer', 'Flores', 580.00, 850.00, true, false, true, ARRAY['elegante','dorado','evento']),
('Taco Block Heel Nude', 'taco-block-heel-nude', 'Taco cuadrado en color nude. Cómodo, estable y elegante para todo el día.', 'Taco cuadrado 7cm, color nude', 3, 'mujer', 'Flores', 420.00, 630.00, false, true, true, ARRAY['nude','comodo','oficina']),
('Mule Destalonado Negro', 'mule-destalonado-negro', 'Mule con taco kitten heel en cuero negro. Minimalismo y elegancia en un solo diseño.', 'Kitten heel, cuero negro', 3, 'mujer', 'Flores', 460.00, 690.00, false, true, true, ARRAY['mule','minimalista','negro']),
('Sandalia Taco Rattan', 'sandalia-taco-rattan', 'Sandalia de verano con taco trenzado de rattan y tiras de cuero. Perfecta para la playa y ciudad.', 'Taco rattan, tiras cuero', 3, 'mujer', 'Flores', 380.00, 570.00, false, false, true, ARRAY['verano','rattan','playa']),

-- LOAFERS (category_id=4)
('Loafer Cuero Café', 'loafer-cuero-cafe', 'Mocasín clásico en cuero café con suela de cuero. Elegancia atemporal para el hombre moderno.', 'Cuero genuino café, suela cuero', 4, 'hombre', 'Flores', 520.00, 780.00, true, false, true, ARRAY['clasico','cuero','elegante']),
('Loafer Borla Negro', 'loafer-borla-negro', 'Loafer con borla decorativa en cuero negro. El clásico de los clásicos, renovado.', 'Borla decorativa, cuero negro', 4, 'hombre', 'Flores', 480.00, 720.00, false, false, true, ARRAY['clasico','borla','formal']),
('Mocasin Plataforma', 'mocasin-plataforma', 'Mocasín con plataforma para mujer en cuero sintético bicolor. Tendencia de temporada.', 'Plataforma 4cm, bicolor', 4, 'mujer', 'Flores', 390.00, 580.00, false, true, true, ARRAY['plataforma','tendencia','bicolor']),
('Loafer Penny Classic', 'loafer-penny-classic', 'El penny loafer original en cuero marrón claro. Estilo universitario y atemporal.', 'Penny loafer, cuero marrón', 4, 'unisex', 'Flores', 440.00, 660.00, false, false, true, ARRAY['universitario','clasico','marron']),

-- SANDALIAS (category_id=5)
('Sandalia Desert Sand', 'sandalia-desert-sand', 'Sandalia plana estilo desert en cuero crudo. Comodidad absoluta para días largos.', 'Cuero crudo, diseño minimalista', 5, 'mujer', 'Flores', 280.00, 420.00, false, true, true, ARRAY['plana','minimalista','verano']),
('Sandalia Gladiadora', 'sandalia-gladiadora', 'Sandalia estilo gladiadora con tiras cruzadas hasta la rodilla. Atrevida y fashion.', 'Tiras cruzadas, diseño gladiadora', 5, 'mujer', 'Flores', 320.00, 480.00, false, true, true, ARRAY['gladiadora','atrevido','fashion']),
('Sandalia Slide Luxury', 'sandalia-slide-luxury', 'Sandalia tipo slide con hebilla dorada. Simple, lujosa y muy cómoda.', 'Hebilla dorada, diseño slide', 5, 'mujer', 'Flores', 260.00, 390.00, false, false, true, ARRAY['slide','lujo','comodo']),
('Sandalia Hombre Clasica', 'sandalia-hombre-clasica', 'Sandalia clásica para hombre en cuero marrón con cierre de velcro. Comodidad garantizada.', 'Cuero marrón, velcro ajustable', 5, 'hombre', 'Flores', 220.00, 330.00, false, false, true, ARRAY['hombre','clasico','comodo']),

-- DEPORTIVOS (category_id=6)
('Running Elite X', 'running-elite-x', 'Zapatilla running de competición con tecnología de retorno de energía. Para atletas serios.', 'Retorno de energía, peso ultra ligero', 6, 'hombre', 'Flores', 680.00, 980.00, true, true, true, ARRAY['running','elite','competicion']),
('Training Cross Mujer', 'training-cross-mujer', 'Zapatilla de entrenamiento cruzado para mujer. Estabilidad y flexibilidad para cualquier ejercicio.', 'Crosstraining, estabilidad lateral', 6, 'mujer', 'Flores', 420.00, 630.00, false, true, true, ARRAY['training','crossfit','mujer']),
('Basketball High Top', 'basketball-high-top', 'Zapatilla de basketball estilo high top con soporte de tobillo reforzado.', 'High top, soporte tobillo', 6, 'hombre', 'Flores', 560.00, 840.00, false, false, true, ARRAY['basketball','hightop','deporte']),
('Walking Comfort Plus', 'walking-comfort-plus', 'Zapatilla de caminata con plantilla ergonómica y amortiguación extra. Perfecta para el día a día activo.', 'Plantilla ergonómica, amortiguación', 6, 'unisex', 'Flores', 380.00, 570.00, false, false, true, ARRAY['walking','comodo','ergonomico']),
('Tenis Indoor Pro', 'tenis-indoor-pro', 'Zapatilla para tenis en pista cubierta. Control, velocidad y tracción en cada paso.', 'Pista cubierta, tracción lateral', 6, 'unisex', 'Flores', 480.00, 720.00, false, true, true, ARRAY['tenis','indoor','pro']),

-- NIÑOS
('Sneaker Kids Fun', 'sneaker-kids-fun', 'Zapatilla colorida para niños con cierre velcro. Fácil de poner y quitar.', 'Velcro, colores vibrantes', 2, 'niño', 'Flores', 180.00, 270.00, false, true, true, ARRAY['ninos','velcro','colorido']),
('Bota Kids Winter', 'bota-kids-winter', 'Bota infantil abrigada para el invierno con forro polar interior.', 'Forro polar, impermeable', 1, 'niño', 'Flores', 220.00, 330.00, false, false, true, ARRAY['ninos','invierno','abrigado']),
('Sandalia Kids Playa', 'sandalia-kids-playa', 'Sandalia de goma para niños. Resistente al agua y muy cómoda.', 'Goma resistente, antideslizante', 5, 'niño', 'Flores', 120.00, 180.00, false, true, true, ARRAY['ninos','playa','goma']);
