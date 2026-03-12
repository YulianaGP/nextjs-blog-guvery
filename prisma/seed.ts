import { PrismaClient, PostStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Categorías ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "guias-de-compra" },
      update: {},
      create: {
        name: "Guías de Compra",
        slug: "guias-de-compra",
        description: "Guías paso a paso para comprar productos desde USA",
        color: "#E86C2C",
      },
    }),
    prisma.category.upsert({
      where: { slug: "amazon" },
      update: {},
      create: {
        name: "Amazon",
        slug: "amazon",
        description: "Todo sobre compras en Amazon USA desde Perú",
        color: "#FF9900",
      },
    }),
    prisma.category.upsert({
      where: { slug: "importaciones" },
      update: {},
      create: {
        name: "Importaciones",
        slug: "importaciones",
        description: "Información sobre impuestos y procesos de importación",
        color: "#3B82F6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "electronica" },
      update: {},
      create: {
        name: "Electrónica",
        slug: "electronica",
        description: "Gadgets y tecnología desde USA a Perú",
        color: "#8B5CF6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "ropa" },
      update: {},
      create: {
        name: "Ropa y Moda",
        slug: "ropa",
        description: "Ropa, calzado y accesorios de moda desde USA",
        color: "#EC4899",
      },
    }),
  ]);

  console.log(`✅ ${categories.length} categorías creadas`);

  // ── Usuario admin ────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@guvery.com" },
    update: {},
    create: {
      name: "Admin Guvery",
      email: "admin@guvery.com",
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Usuario admin creado: ${adminUser.email}`);

  // ── Tags ────────────────────────────────────────────────────────────────────
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "amazon" },
      update: {},
      create: { name: "Amazon", slug: "amazon" },
    }),
    prisma.tag.upsert({
      where: { slug: "importacion" },
      update: {},
      create: { name: "Importación", slug: "importacion" },
    }),
    prisma.tag.upsert({
      where: { slug: "compras-usa" },
      update: {},
      create: { name: "Compras USA", slug: "compras-usa" },
    }),
    prisma.tag.upsert({
      where: { slug: "guvery" },
      update: {},
      create: { name: "Guvery", slug: "guvery" },
    }),
  ]);

  console.log(`✅ ${tags.length} tags creados`);

  // ── Posts de ejemplo ─────────────────────────────────────────────────────────
  const guiasCategory = categories[0]!;
  const amazonCategory = categories[1]!;
  const importacionesCategory = categories[2]!;

  const posts = await Promise.all([
    prisma.post.upsert({
      where: { slug: "como-comprar-en-amazon-desde-peru" },
      update: {},
      create: {
        title: "Cómo comprar en Amazon desde Perú: Guía completa 2026",
        slug: "como-comprar-en-amazon-desde-peru",
        excerpt:
          "Aprende paso a paso cómo comprar cualquier producto en Amazon USA y recibirlo en Perú usando el servicio de viajeros de Guvery.",
        content: `<h2>¿Por qué comprar en Amazon desde Perú?</h2>
<p>Amazon ofrece millones de productos que no están disponibles en Perú o que cuestan el doble. Con Guvery, puedes acceder a todo ese catálogo sin complicaciones.</p>
<h2>Paso 1: Crea tu cuenta en Amazon</h2>
<p>Ingresa a amazon.com y crea una cuenta gratuita. Solo necesitas un correo electrónico.</p>
<h2>Paso 2: Encuentra el producto</h2>
<p>Busca el producto que deseas. Verifica que el vendedor sea Amazon o tenga buenas calificaciones.</p>
<h2>Paso 3: Publica tu pedido en Guvery</h2>
<p>Crea un pedido en guvery.com con el link del producto y un viajero te lo traerá directamente a Perú.</p>`,
        status: PostStatus.PUBLISHED,
        featured: true,
        readingTime: 8,
        publishedAt: new Date("2026-01-15"),
        authorId: adminUser.id,
        categoryId: guiasCategory.id,
        tags: { connect: [{ slug: "amazon" }, { slug: "guvery" }] },
        metaTitle:
          "Cómo comprar en Amazon desde Perú 2026 — Guía paso a paso | Guvery Blog",
        metaDescription:
          "Aprende a comprar en Amazon USA y recibir tus productos en Perú. Guía completa actualizada con Guvery.",
      },
    }),
    prisma.post.upsert({
      where: { slug: "impuestos-importacion-peru-2026" },
      update: {},
      create: {
        title: "¿Cuánto pago de impuestos al importar productos a Perú?",
        slug: "impuestos-importacion-peru-2026",
        excerpt:
          "Todo lo que necesitas saber sobre aranceles, límites de exoneración y cómo calcular el costo real de importar un producto desde USA.",
        content: `<h2>Límite de exoneración</h2>
<p>En Perú, los envíos por courier con valor declarado menor a $200 USD están exonerados de aranceles.</p>
<h2>¿Qué pasa si supera los $200?</h2>
<p>Deberás pagar IGV (18%) y aranceles adicionales que varían según el tipo de producto.</p>
<h2>Cómo calcularlo</h2>
<p>Usa la calculadora de SUNAT para estimar el costo exacto antes de hacer tu compra.</p>`,
        status: PostStatus.PUBLISHED,
        featured: false,
        readingTime: 6,
        publishedAt: new Date("2026-01-22"),
        authorId: adminUser.id,
        categoryId: importacionesCategory.id,
        tags: {
          connect: [{ slug: "importacion" }, { slug: "compras-usa" }],
        },
      },
    }),
    prisma.post.upsert({
      where: { slug: "mejores-productos-amazon-peru" },
      update: {},
      create: {
        title: "Los 10 productos más populares que peruanos compran en Amazon",
        slug: "mejores-productos-amazon-peru",
        excerpt:
          "Electrónica, ropa, suplementos y más. Descubre qué productos vale la pena traer desde USA y cuáles conviene comprar localmente.",
        content: `<h2>1. Electrónica y gadgets</h2>
<p>iPhones, laptops, audífonos AirPods. El precio puede ser 30-40% menor que en tiendas peruanas.</p>
<h2>2. Suplementos y vitaminas</h2>
<p>Proteínas, creatina, vitaminas. Amazon tiene marcas premium que no llegan a Perú.</p>
<h2>3. Ropa y calzado</h2>
<p>Nike, Adidas, Lululemon. Modelos exclusivos y tallas difíciles de encontrar en Lima.</p>`,
        status: PostStatus.PUBLISHED,
        featured: true,
        readingTime: 5,
        publishedAt: new Date("2026-02-03"),
        authorId: adminUser.id,
        categoryId: amazonCategory.id,
        tags: { connect: [{ slug: "amazon" }, { slug: "compras-usa" }] },
      },
    }),
    // Post en borrador para probar el admin
    prisma.post.upsert({
      where: { slug: "guia-ebay-desde-peru-borrador" },
      update: {},
      create: {
        title: "Cómo comprar en eBay desde Perú [BORRADOR]",
        slug: "guia-ebay-desde-peru-borrador",
        excerpt: "Guía sobre cómo usar eBay para comprar desde Perú.",
        content: "<p>Contenido en construcción...</p>",
        status: PostStatus.DRAFT,
        featured: false,
        authorId: adminUser.id,
        categoryId: guiasCategory.id,
      },
    }),
  ]);

  console.log(`✅ ${posts.length} posts creados`);

  // ── Suscriptores de ejemplo ──────────────────────────────────────────────────
  await Promise.all([
    prisma.subscriber.upsert({
      where: { email: "usuario1@example.com" },
      update: {},
      create: {
        email: "usuario1@example.com",
        name: "María García",
        status: "CONFIRMED",
        confirmedAt: new Date("2026-01-20"),
        source: "blog-footer",
      },
    }),
    prisma.subscriber.upsert({
      where: { email: "usuario2@example.com" },
      update: {},
      create: {
        email: "usuario2@example.com",
        name: "Carlos Ramos",
        status: "CONFIRMED",
        confirmedAt: new Date("2026-01-25"),
        source: "post-inline",
      },
    }),
    prisma.subscriber.upsert({
      where: { email: "usuario3@example.com" },
      update: {},
      create: {
        email: "usuario3@example.com",
        status: "PENDING",
        source: "sidebar",
      },
    }),
  ]);

  console.log("✅ Suscriptores de ejemplo creados");
  console.log("\n🎉 Seed completado exitosamente");
  console.log("─────────────────────────────────");
  console.log("Admin: admin@guvery.com / admin123");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
