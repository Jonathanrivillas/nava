# Nava

Ecommerce y gestión de ventas de maquillaje (marcas reconocidas, inventario propio + dropshipping).

## Stack

Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · PostgreSQL (Supabase) · Prisma 7

## Getting started

```bash
npm install
cp .env.example .env   # completa DATABASE_URL y DIRECT_URL con tus valores de Supabase
npx prisma migrate dev # aplica el schema a la base de datos
npx prisma db seed     # carga datos de prueba (distribuidores, marcas, categorías, productos)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Base de datos

El modelo de datos completo vive en [prisma/schema.prisma](prisma/schema.prisma) (14 entidades: usuarios,
distribuidores, marcas, categorías, productos, imágenes, ofertas, banners, pedidos, ítems de pedido,
compras a distribuidor, movimientos de inventario y fidelidad).

Prisma 7 separa la conexión en dos variables de entorno:
- `DATABASE_URL` — pooler en modo transacción (usado por la app en runtime).
- `DIRECT_URL` — pooler en modo sesión (usado por `prisma migrate` / `prisma db seed`), configurado en [prisma7.config.ts](prisma7.config.ts).

## Datos de prueba (seed)

[prisma/seed.ts](prisma/seed.ts) crea 2 distribuidores, 4 marcas, 3 categorías y 5 productos de ejemplo
(mezcla de tipo `PROPIO` y `DROPSHIPPING`). Son datos ficticios marcados como "(prueba)" — la idea es que el
catálogo real (distribuidores, marcas y productos confirmados) se cargue reemplazando este mismo archivo o
vía el panel administrativo una vez esté construido, sin cambiar la forma de los datos.

## Roles

`User.rol` tiene dos valores: `CLIENTE` y `ADMIN_SOCIO`. Los 4 socios del negocio comparten el rol
`ADMIN_SOCIO` con acceso completo al panel administrativo — no hay permisos diferenciados entre ellos por
ahora. Si más adelante se necesita restringir a alguno, se puede introducir un modelo de permisos granular
sin romper lo existente.
