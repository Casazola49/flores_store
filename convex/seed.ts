import { mutation } from "./_generated/server";
import bcrypt from "bcryptjs";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Running incremental seeding...");

    // 1. Insertar Administrador si no existe
    const existingAdmins = await ctx.db.query("admin_users").collect();
    if (existingAdmins.length === 0) {
      console.log("Seeding admin...");
      const passwordHash = bcrypt.hashSync("wilstermann1949*", 10);
      await ctx.db.insert("admin_users", {
        username: "flores",
        password_hash: passwordHash,
        role: "superadmin",
        is_active: true,
      });
    }

    // 2. Insertar Categorías Base si no existen
    const existingCats = await ctx.db.query("categories").collect();
    if (existingCats.length === 0) {
      console.log("Seeding categories...");
      const categories = [
        { name: "Botas", slug: "botas", sort_order: 1, is_active: true },
        { name: "Zapatos", slug: "zapatos", sort_order: 2, is_active: true },
        { name: "Zapatillas", slug: "zapatillas", sort_order: 3, is_active: true },
        { name: "Zapatillas Deportivas", slug: "zapatillas-deportivas", sort_order: 4, is_active: true },
        { name: "Tacos", slug: "tacos", sort_order: 5, is_active: true },
      ];
      for (const cat of categories) {
        await ctx.db.insert("categories", cat);
      }
    }

    // 3. Insertar Configuraciones Generales (cms_sections) si no existen
    const existingSections = await ctx.db.query("cms_sections").collect();
    if (existingSections.length === 0) {
      console.log("Seeding cms settings...");
      const settings = [
        { key: "whatsapp_number", title: "Número de WhatsApp", content: "59176932485" },
        { key: "social_instagram", title: "Instagram Link", content: "https://instagram.com/flores.studio" },
        { key: "social_tiktok", title: "TikTok Link", content: "https://tiktok.com/@flores.studio" },
        { key: "social_facebook", title: "Facebook Link", content: "https://facebook.com/flores.studio" },
        { key: "announcement_text", title: "Texto de la Barra de Anuncios", content: "MARCA TENDENCIA CON FLORES - ENVÍOS A TODO EL PAÍS" },
        { key: "announcement_bg", title: "Color de Fondo Anuncio", content: "#E5C400" },
        { key: "announcement_text_color", title: "Color de Texto Anuncio", content: "#000000" },
        { key: "announcement_active", title: "Barra Activa", content: "true" },
        { key: "hero_title", title: "Título Hero", content: "Cultura\nExclusiva\nEn Cada Paso" },
        { key: "hero_subtitle", title: "Subtítulo Hero", content: "Curaduría de marcas globales a precios de liquidación. Stock limitado — Los mejores modelos se agotan en minutos." },
        { key: "hero_video_url", title: "Video de Fondo Hero", content: "" },
        { key: "countdown_end_hour", title: "Hora Fin Oferta (0-23)", content: "24" },
        { key: "vip_vault_title", title: "Título de la Bóveda VIP", content: "Bóveda\nPrivada" },
        { key: "vip_vault_subtitle", title: "Subtítulo de la Bóveda VIP", content: "Piezas seleccionadas que no están disponibles en el catálogo público. Solo para coleccionistas." },
        { key: "vip_vault_video_url", title: "Video de Fondo Bóveda VIP", content: "" }
      ];
      for (const set of settings) {
        await ctx.db.insert("cms_sections", set);
      }
    }

    // 4. Insertar Banners si no existen
    const existingBanners = await ctx.db.query("cms_banners").collect();
    if (existingBanners.length === 0) {
      console.log("Seeding banners...");
      await ctx.db.insert("cms_banners", {
        title: "Cultura\nExclusiva\nEn Cada Paso",
        subtitle: "Curaduría de marcas globales a precios de liquidación. Stock limitado — Los mejores modelos se agotan en minutos.",
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1800",
        link_url: "/productos?is_new=true",
        link_text: "Reclamar Mi Par",
        position: 0,
        is_active: true,
      });
    }

    // 5. Insertar Productos y Variantes si no existen
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length === 0) {
      console.log("Seeding products...");
      const mockProductsToInsert = [
        {
          name: "Bota Chelsea Noir",
          slug: "bota-chelsea-noir",
          description: "Bota Chelsea de cuero genuino con elásticos laterales. Perfecta para el día a día con un look sofisticado.",
          short_desc: "Cuero genuino, suela antideslizante",
          category_slug: "botas",
          gender: "mujer",
          brand: "Flores",
          base_price: 450,
          compare_price: 680,
          is_featured: true,
          is_new: true,
          is_active: true,
          tags: ["liquidacion", "tendencia", "cuero", "exclusivo"],
          sort_order: 1,
          images: [{ url: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v1", size: "35", color: "Negro", sku: "bota-chelsea-noir-35", stock: 5, is_active: true },
            { id: "v2", size: "36", color: "Negro", sku: "bota-chelsea-noir-36", stock: 8, is_active: true },
            { id: "v3", size: "37", color: "Negro", sku: "bota-chelsea-noir-37", stock: 12, is_active: true },
            { id: "v4", size: "38", color: "Negro", sku: "bota-chelsea-noir-38", stock: 2, is_active: true },
            { id: "v5", size: "39", color: "Negro", sku: "bota-chelsea-noir-39", stock: 1, is_active: true },
            { id: "v6", size: "40", color: "Negro", sku: "bota-chelsea-noir-40", stock: 4, is_active: true },
          ]
        },
        {
          name: "Bota Militar Rugged",
          slug: "bota-militar-rugged",
          description: "Bota estilo militar con cordones y puntera reforzada. Durabilidad y estilo en un solo calzado.",
          short_desc: "Estilo militar, puntera reforzada",
          category_slug: "botas",
          gender: "hombre",
          brand: "Flores",
          base_price: 490,
          compare_price: 720,
          is_featured: true,
          is_new: false,
          is_active: true,
          tags: ["liquidacion", "militar", "duradero"],
          sort_order: 2,
          images: [{ url: "https://images.unsplash.com/photo-1520639889410-d042466df810?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v7", size: "39", color: "Negro", sku: "bota-rugged-39", stock: 3, is_active: true },
            { id: "v8", size: "40", color: "Negro", sku: "bota-rugged-40", stock: 6, is_active: true },
            { id: "v9", size: "41", color: "Negro", sku: "bota-rugged-41", stock: 9, is_active: true },
            { id: "v10", size: "42", color: "Negro", sku: "bota-rugged-42", stock: 10, is_active: true },
          ]
        },
        {
          name: "Sneaker Urban White",
          slug: "sneaker-urban-white",
          description: "Zapatilla urbana de cuero blanco con suela chunky. El modelo más vendido de la temporada.",
          short_desc: "Cuero blanco, suela gruesa",
          category_slug: "zapatillas",
          gender: "unisex",
          brand: "Flores",
          base_price: 320,
          compare_price: 490,
          is_featured: true,
          is_new: true,
          is_active: true,
          tags: ["tendencia", "blanco", "urban"],
          sort_order: 3,
          images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v11", size: "38", color: "Blanco", sku: "urban-white-38", stock: 14, is_active: true },
            { id: "v12", size: "39", color: "Blanco", sku: "urban-white-39", stock: 4, is_active: true },
            { id: "v13", size: "40", color: "Blanco", sku: "urban-white-40", stock: 15, is_active: true },
            { id: "v14", size: "41", color: "Blanco", sku: "urban-white-41", stock: 1, is_active: true },
          ]
        },
        {
          name: "Stiletto Dorado",
          slug: "stiletto-dorado",
          description: "Stiletto de aguja en cuero dorado. La pieza más elegante de la colección para eventos especiales.",
          short_desc: "Cuero dorado, tacón 10cm",
          category_slug: "tacos",
          gender: "mujer",
          brand: "Flores",
          base_price: 580,
          compare_price: 850,
          is_featured: true,
          is_new: false,
          is_active: true,
          tags: ["elegante", "dorado", "evento", "exclusivo"],
          sort_order: 4,
          images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v15", size: "36", color: "Dorado", sku: "stiletto-gold-36", stock: 2, is_active: true },
            { id: "v16", size: "37", color: "Dorado", sku: "stiletto-gold-37", stock: 3, is_active: true },
            { id: "v17", size: "38", color: "Dorado", sku: "stiletto-gold-38", stock: 1, is_active: true },
          ]
        },
        {
          name: "Loafer Cuero Café",
          slug: "loafer-cuero-cafe",
          description: "Mocasín clásico en cuero café con suela de cuero. Elegancia atemporal para el hombre moderno.",
          short_desc: "Cuero genuino café, suela cuero",
          category_slug: "zapatos",
          gender: "hombre",
          brand: "Flores",
          base_price: 520,
          compare_price: 780,
          is_featured: true,
          is_new: false,
          is_active: true,
          tags: ["clasico", "cuero", "elegante", "exclusivo"],
          sort_order: 5,
          images: [{ url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v18", size: "40", color: "Café", sku: "loafer-cafe-40", stock: 4, is_active: true },
            { id: "v19", size: "41", color: "Café", sku: "loafer-cafe-41", stock: 6, is_active: true },
            { id: "v20", size: "42", color: "Café", sku: "loafer-cafe-42", stock: 3, is_active: true },
          ]
        },
        {
          name: "Sandalia Desert Sand",
          slug: "sandalia-desert-sand",
          description: "Sandalia plana estilo desert en cuero crudo. Comodidad absoluta para días largos.",
          short_desc: "Cuero crudo, diseño minimalista",
          category_slug: "tacos",
          gender: "mujer",
          brand: "Flores",
          base_price: 280,
          compare_price: 420,
          is_featured: false,
          is_new: true,
          is_active: true,
          tags: ["plana", "minimalista", "verano"],
          sort_order: 6,
          images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v21", size: "36", color: "Nude", sku: "desert-sand-36", stock: 5, is_active: true },
            { id: "v22", size: "37", color: "Nude", sku: "desert-sand-37", stock: 7, is_active: true },
          ]
        },
        {
          name: "Running Elite X",
          slug: "running-elite-x",
          description: "Zapatilla running de competición con tecnología de retorno de energía. Para atletas serios.",
          short_desc: "Retorno de energía, peso ultra ligero",
          category_slug: "zapatillas-deportivas",
          gender: "hombre",
          brand: "Flores",
          base_price: 680,
          compare_price: 980,
          is_featured: true,
          is_new: true,
          is_active: true,
          tags: ["running", "elite", "competicion", "exclusivo"],
          sort_order: 7,
          images: [{ url: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800", is_primary: true }],
          variants: [
            { id: "v23", size: "40", color: "Negro/Rojo", sku: "running-elite-40", stock: 3, is_active: true },
            { id: "v24", size: "41", color: "Negro/Rojo", sku: "running-elite-41", stock: 4, is_active: true },
            { id: "v25", size: "42", color: "Negro/Rojo", sku: "running-elite-42", stock: 2, is_active: true },
          ]
        }
      ];

      for (const prod of mockProductsToInsert) {
        await ctx.db.insert("products", prod);
      }
    }

    // 5b. Catálogo extendido — idempotente por slug (13 productos, variantes v26+).
    // Re-ejecutar seed:run agrega los que falten sin duplicar.
    const existingSlugs = new Set((await ctx.db.query("products").collect()).map((p) => p.slug));
    const extendedCatalog = [
      {
        name: "Bota Chelsea Marrón",
        slug: "bota-chelsea-marron",
        description: "Bota chelsea en cuero marrón con elásticos laterales y suela de goma.",
        short_desc: "Cuero marrón, elástico lateral",
        category_slug: "botas",
        gender: "mujer",
        brand: "Flores",
        base_price: 340,
        compare_price: 520,
        is_featured: true,
        is_new: true,
        is_active: true,
        tags: ["tendencia", "chelsea", "cuero"],
        sort_order: 8,
        images: [{ url: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v26", size: "36", color: "Marrón", sku: "chelsea-marron-36", stock: 5, is_active: true },
          { id: "v27", size: "37", color: "Marrón", sku: "chelsea-marron-37", stock: 8, is_active: true },
          { id: "v28", size: "38", color: "Marrón", sku: "chelsea-marron-38", stock: 3, is_active: true },
        ],
      },
      {
        name: "Botín Cuero Negro",
        slug: "botin-cuero-negro",
        description: "Botín de cuero negro con taco firme. Ideal para el día y la noche.",
        short_desc: "Cuero negro, taco firme",
        category_slug: "botas",
        gender: "mujer",
        brand: "Flores",
        base_price: 380,
        is_featured: false,
        is_new: true,
        is_active: true,
        tags: ["botin", "negro", "cuero"],
        sort_order: 9,
        images: [{ url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v29", size: "36", color: "Negro", sku: "botin-negro-36", stock: 4, is_active: true },
          { id: "v30", size: "37", color: "Negro", sku: "botin-negro-37", stock: 6, is_active: true },
          { id: "v31", size: "38", color: "Negro", sku: "botin-negro-38", stock: 2, is_active: true },
        ],
      },
      {
        name: "Botas Senderismo Pro",
        slug: "botas-senderismo-pro",
        description: "Bota de senderismo impermeable, ideal para exteriores y trekking.",
        short_desc: "Impermeable, suela agarre",
        category_slug: "botas",
        gender: "hombre",
        brand: "Flores",
        base_price: 420,
        compare_price: 590,
        is_featured: false,
        is_new: false,
        is_active: true,
        tags: ["senderismo", "trekking", "outdoor"],
        sort_order: 10,
        images: [{ url: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v32", size: "40", color: "Marrón", sku: "senderismo-40", stock: 3, is_active: true },
          { id: "v33", size: "41", color: "Marrón", sku: "senderismo-41", stock: 5, is_active: true },
          { id: "v34", size: "42", color: "Marrón", sku: "senderismo-42", stock: 2, is_active: true },
        ],
      },
      {
        name: "Oxford Cuero Clásico",
        slug: "oxford-cuero-clasico",
        description: "Zapato oxford de cuero pulido, elegancia atemporal para eventos.",
        short_desc: "Cuero pulido, horma clásica",
        category_slug: "zapatos",
        gender: "hombre",
        brand: "Flores",
        base_price: 480,
        compare_price: 690,
        is_featured: true,
        is_new: false,
        is_active: true,
        tags: ["oxford", "formal", "cuero"],
        sort_order: 11,
        images: [{ url: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v35", size: "40", color: "Negro", sku: "oxford-40", stock: 4, is_active: true },
          { id: "v36", size: "41", color: "Negro", sku: "oxford-41", stock: 6, is_active: true },
          { id: "v37", size: "42", color: "Negro", sku: "oxford-42", stock: 2, is_active: true },
        ],
      },
      {
        name: "Zapato Derby Café",
        slug: "zapato-derby-cafe",
        description: "Derby de cuero café con cordones, casual-elegante para la oficina.",
        short_desc: "Cuero café, cordones",
        category_slug: "zapatos",
        gender: "hombre",
        brand: "Flores",
        base_price: 360,
        compare_price: 510,
        is_featured: false,
        is_new: true,
        is_active: true,
        tags: ["derby", "cuero", "oficina"],
        sort_order: 12,
        images: [{ url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v38", size: "40", color: "Café", sku: "derby-cafe-40", stock: 7, is_active: true },
          { id: "v39", size: "41", color: "Café", sku: "derby-cafe-41", stock: 5, is_active: true },
        ],
      },
      {
        name: "Mocasín Sin Cordones",
        slug: "mocasin-sin-cordones",
        description: "Mocasín casual sin cordones, comodidad para todo el día.",
        short_desc: "Sin cordones, casual",
        category_slug: "zapatos",
        gender: "hombre",
        brand: "Flores",
        base_price: 300,
        is_featured: false,
        is_new: false,
        is_active: true,
        tags: ["mocasin", "casual"],
        sort_order: 13,
        images: [{ url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v40", size: "39", color: "Negro", sku: "mocasin-39", stock: 6, is_active: true },
          { id: "v41", size: "40", color: "Negro", sku: "mocasin-40", stock: 4, is_active: true },
        ],
      },
      {
        name: "Sneaker Retro Blanco",
        slug: "sneaker-retro-blanco",
        description: "Sneaker retro blanco con detalles en tono hueso, estilo urbano.",
        short_desc: "Retro, blanco hueso",
        category_slug: "zapatillas",
        gender: "unisex",
        brand: "Flores",
        base_price: 310,
        compare_price: 460,
        is_featured: true,
        is_new: true,
        is_active: true,
        tags: ["retro", "blanco", "urbano"],
        sort_order: 14,
        images: [{ url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v42", size: "38", color: "Blanco", sku: "retro-blanco-38", stock: 9, is_active: true },
          { id: "v43", size: "39", color: "Blanco", sku: "retro-blanco-39", stock: 6, is_active: true },
          { id: "v44", size: "40", color: "Blanco", sku: "retro-blanco-40", stock: 3, is_active: true },
        ],
      },
      {
        name: "Sneaker Minimal Gris",
        slug: "sneaker-minimal-gris",
        description: "Sneaker minimalista en gris suave, combina con todo.",
        short_desc: "Minimal, gris",
        category_slug: "zapatillas",
        gender: "mujer",
        brand: "Flores",
        base_price: 290,
        is_featured: false,
        is_new: true,
        is_active: true,
        tags: ["minimal", "gris"],
        sort_order: 15,
        images: [{ url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v45", size: "36", color: "Gris", sku: "minimal-gris-36", stock: 5, is_active: true },
          { id: "v46", size: "37", color: "Gris", sku: "minimal-gris-37", stock: 8, is_active: true },
        ],
      },
      {
        name: "Runner Diario Negro",
        slug: "runner-diario-negro",
        description: "Zapatilla runner negra para entrenamiento diario.",
        short_desc: "Running, ligera",
        category_slug: "zapatillas-deportivas",
        gender: "hombre",
        brand: "Flores",
        base_price: 350,
        compare_price: 480,
        is_featured: false,
        is_new: false,
        is_active: true,
        tags: ["running", "diario"],
        sort_order: 16,
        images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v47", size: "40", color: "Negro", sku: "runner-negro-40", stock: 4, is_active: true },
          { id: "v48", size: "41", color: "Negro", sku: "runner-negro-41", stock: 6, is_active: true },
        ],
      },
      {
        name: "Cross Training Rojo",
        slug: "cross-training-rojo",
        description: "Zapatilla de cross training con base estable, para alto rendimiento.",
        short_desc: "Cross, estable",
        category_slug: "zapatillas-deportivas",
        gender: "hombre",
        brand: "Flores",
        base_price: 390,
        compare_price: 540,
        is_featured: true,
        is_new: true,
        is_active: true,
        tags: ["cross", "rojo", "training"],
        sort_order: 17,
        images: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v49", size: "40", color: "Rojo", sku: "cross-rojo-40", stock: 3, is_active: true },
          { id: "v50", size: "41", color: "Rojo", sku: "cross-rojo-41", stock: 5, is_active: true },
          { id: "v51", size: "42", color: "Rojo", sku: "cross-rojo-42", stock: 2, is_active: true },
        ],
      },
      {
        name: "Baila Salsa Negro",
        slug: "baila-salsa-negro",
        description: "Zapato de baile de salsa con suela flexible y taco medio.",
        short_desc: "Baile, taco medio",
        category_slug: "tacos",
        gender: "mujer",
        brand: "Flores",
        base_price: 330,
        is_featured: false,
        is_new: true,
        is_active: true,
        tags: ["baile", "salsa", "negro"],
        sort_order: 18,
        images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v52", size: "36", color: "Negro", sku: "salsa-36", stock: 4, is_active: true },
          { id: "v53", size: "37", color: "Negro", sku: "salsa-37", stock: 5, is_active: true },
        ],
      },
      {
        name: "Taco Aguja Vino",
        slug: "taco-aguja-vino",
        description: "Taco aguja en tono vino profundo, para ocasiones especiales.",
        short_desc: "Aguja, vino",
        category_slug: "tacos",
        gender: "mujer",
        brand: "Flores",
        base_price: 360,
        compare_price: 520,
        is_featured: true,
        is_new: true,
        is_active: true,
        tags: ["aguja", "vino", "evento"],
        sort_order: 19,
        images: [{ url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v54", size: "36", color: "Vino", sku: "aguja-vino-36", stock: 2, is_active: true },
          { id: "v55", size: "37", color: "Vino", sku: "aguja-vino-37", stock: 3, is_active: true },
          { id: "v56", size: "38", color: "Vino", sku: "aguja-vino-38", stock: 1, is_active: true },
        ],
      },
      {
        name: "Sandalia Tacon Ancho",
        slug: "sandalia-tacon-ancho",
        description: "Sandalia con taco ancho y correas, cómoda y elegante para el verano.",
        short_desc: "Taco ancho, correas",
        category_slug: "tacos",
        gender: "mujer",
        brand: "Flores",
        base_price: 280,
        compare_price: 400,
        is_featured: false,
        is_new: false,
        is_active: true,
        tags: ["sandalia", "verano", "taco"],
        sort_order: 20,
        images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800", is_primary: true }],
        variants: [
          { id: "v57", size: "36", color: "Nude", sku: "tacon-nude-36", stock: 6, is_active: true },
          { id: "v58", size: "37", color: "Nude", sku: "tacon-nude-37", stock: 4, is_active: true },
        ],
      },
    ];

    let added = 0;
    for (const prod of extendedCatalog) {
      if (existingSlugs.has(prod.slug)) continue;
      await ctx.db.insert("products", prod);
      existingSlugs.add(prod.slug);
      added += 1;
    }
    console.log(`Extended catalog: ${added} productos nuevos (total ${existingSlugs.size}).`);

    console.log("✅ Database successfully seeded!");
    return { message: "Seeding completado con éxito." };
  },
});
