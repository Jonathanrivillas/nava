import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "./src/lib/prisma";

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const passwordHash = await bcrypt.hash("clave12345", 10);

  await prisma.user.upsert({
    where: { email: "qa-admin@nava.local" },
    update: { passwordHash, rol: "ADMIN_SOCIO" },
    create: { nombre: "QA Admin", email: "qa-admin@nava.local", passwordHash, rol: "ADMIN_SOCIO" },
  });

  const cliente = await prisma.user.upsert({
    where: { email: "qa-cliente@nava.local" },
    update: { passwordHash, rol: "CLIENTE" },
    create: { nombre: "QA Cliente", email: "qa-cliente@nava.local", passwordHash, rol: "CLIENTE" },
  });

  const producto = await prisma.producto.findFirstOrThrow({ where: { slug: "rubor-en-polvo" } });

  const pedidoExistente = await prisma.pedido.findFirst({ where: { userId: cliente.id } });
  if (!pedidoExistente) {
    await prisma.pedido.create({
      data: {
        userId: cliente.id,
        nombreContacto: "QA Cliente",
        telefonoContacto: "3000000000",
        esInvitado: false,
        estado: "PENDIENTE",
        subtotal: 28000,
        costoEnvio: 0,
        total: 28000,
        direccionEnvio: "Calle falsa 123",
        metodoPago: "CONTRA_ENTREGA",
        items: { create: [{ productoId: producto.id, cantidad: 1, precioUnitario: 28000 }] },
      },
    });
  }

  // Subir imagen real y asignarla a un producto para probar el bug del catalogo
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  const path = `productos/qa-catalogo-${Date.now()}.png`;
  await supabaseAdmin.storage.from("productos").upload(path, bytes, { contentType: "image/png" });
  const { data } = supabaseAdmin.storage.from("productos").getPublicUrl(path);

  const productoImg = await prisma.producto.findFirstOrThrow({ where: { slug: "base-liquida-fit-me" } });
  await prisma.producto.update({ where: { id: productoImg.id }, data: { imagenPrincipal: data.publicUrl } });

  console.log("IMG_URL=" + data.publicUrl);
  console.log("IMG_PATH=" + path);
  console.log("PRODUCTO_SLUG=" + productoImg.slug);
}

main().finally(() => prisma.$disconnect());
