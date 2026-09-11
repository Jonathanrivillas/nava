import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Datos de prueba: distribuidores, marcas, categorías y productos ficticios,
// pensados para reemplazarse por los reales sin cambiar la forma de los datos.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const distribuidorMaquillajePro = await prisma.distribuidor.create({
    data: {
      nombre: "Distribuidora Maquillaje Pro (prueba)",
      contacto: "310 000 0001",
      direccion: "Cra 10 #20-30, Bogotá",
      notas: "Distribuidor de prueba para dropshipping — reemplazar por el real.",
    },
  });

  const distribuidoraBellezaTotal = await prisma.distribuidor.create({
    data: {
      nombre: "Belleza Total S.A.S. (prueba)",
      contacto: "310 000 0002",
      direccion: "Cl 45 #12-08, Medellín",
      notas: "Distribuidor de prueba para dropshipping — reemplazar por el real.",
    },
  });

  const [maybelline, loreal, mac, essence] = await Promise.all([
    prisma.marca.create({ data: { nombre: "Maybelline" } }),
    prisma.marca.create({ data: { nombre: "L'Oréal" } }),
    prisma.marca.create({ data: { nombre: "MAC" } }),
    prisma.marca.create({ data: { nombre: "essence" } }),
  ]);

  const categoriaMaquillaje = await prisma.categoria.create({
    data: { nombre: "Maquillaje" },
  });

  const [rostro, ojos, labios] = await Promise.all([
    prisma.categoria.create({
      data: { nombre: "Rostro", categoriaPadreId: categoriaMaquillaje.id },
    }),
    prisma.categoria.create({
      data: { nombre: "Ojos", categoriaPadreId: categoriaMaquillaje.id },
    }),
    prisma.categoria.create({
      data: { nombre: "Labios", categoriaPadreId: categoriaMaquillaje.id },
    }),
  ]);

  await prisma.producto.createMany({
    data: [
      {
        slug: "base-liquida-fit-me",
        nombre: "Base líquida Fit Me (prueba)",
        marcaId: maybelline.id,
        categoriaId: rostro.id,
        descripcion: "Base líquida de cobertura media, acabado natural.",
        precioVenta: 65000,
        precioCompra: 38000,
        tipo: "PROPIO",
        stock: 15,
      },
      {
        slug: "mascara-lash-sensational",
        nombre: "Máscara de pestañas Lash Sensational (prueba)",
        marcaId: maybelline.id,
        categoriaId: ojos.id,
        descripcion: "Máscara voluminizadora con cepillo en abanico.",
        precioVenta: 48000,
        precioCompra: 27000,
        tipo: "PROPIO",
        stock: 20,
      },
      {
        slug: "labial-rouge-signature",
        nombre: "Labial Rouge Signature (prueba)",
        marcaId: loreal.id,
        categoriaId: labios.id,
        descripcion: "Labial líquido mate de larga duración.",
        precioVenta: 52000,
        precioCompra: 30000,
        tipo: "DROPSHIPPING",
        distribuidorId: distribuidorMaquillajePro.id,
        stock: 0,
      },
      {
        slug: "paleta-sombras-nude",
        nombre: "Paleta de sombras Nude (prueba)",
        marcaId: mac.id,
        categoriaId: ojos.id,
        descripcion: "Paleta de 9 tonos neutros mate y shimmer.",
        precioVenta: 130000,
        precioCompra: 82000,
        tipo: "DROPSHIPPING",
        distribuidorId: distribuidoraBellezaTotal.id,
        stock: 0,
      },
      {
        slug: "rubor-en-polvo",
        nombre: "Rubor en polvo (prueba)",
        marcaId: essence.id,
        categoriaId: rostro.id,
        descripcion: "Rubor compacto de acabado satinado.",
        precioVenta: 28000,
        precioCompra: 15000,
        tipo: "PROPIO",
        stock: 30,
      },
    ],
  });

  console.log("Seed de prueba insertado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
