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
          images: [{ url: "https://images.unsplash.com/photo-1562273103-91206777044a?q=80&w=800", is_primary: true }],
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

    console.log("✅ Database successfully seeded!");
    return { message: "Seeding completado con éxito." };
  },
});
