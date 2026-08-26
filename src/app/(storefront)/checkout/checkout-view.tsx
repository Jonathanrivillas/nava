"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { crearPedido } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrecio } from "@/lib/format";
import { TruckIcon, CheckCircleIcon } from "@/components/storefront/icons";

const METODOS_PAGO = [
  {
    value: "CONTRA_ENTREGA" as const,
    titulo: "Pago contra entrega",
    detalle: "Paga en efectivo cuando recibas tu pedido",
  },
  {
    value: "TRANSFERENCIA" as const,
    titulo: "Transferencia bancaria",
    detalle: "Te enviamos los datos por WhatsApp",
  },
];

export function CheckoutView() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [metodoPago, setMetodoPago] = useState<"CONTRA_ENTREGA" | "TRANSFERENCIA">("CONTRA_ENTREGA");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
        <h1 className="mb-3 font-display text-3xl">No tienes productos en el carrito</h1>
        <p className="mb-6 text-muted-foreground">Agrega productos antes de continuar al pago.</p>
        <Link href="/catalogo">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setEnviando(true);

    const formData = new FormData(e.currentTarget);

    const resultado = await crearPedido({
      nombreContacto: String(formData.get("nombreContacto") ?? ""),
      telefonoContacto: String(formData.get("telefonoContacto") ?? ""),
      emailContacto: String(formData.get("emailContacto") ?? ""),
      direccionEnvio: String(formData.get("direccionEnvio") ?? ""),
      ciudad: String(formData.get("ciudad") ?? ""),
      referencia: String(formData.get("referencia") ?? ""),
      metodoPago,
      items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
    });

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    clear();
    router.push(`/pedido/${resultado.pedidoId}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <h1 className="mb-8 font-display text-4xl">Finalizar compra</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex w-fit rounded-lg bg-muted p-1">
            <div className="rounded-md bg-card px-5 py-2.5 text-sm font-semibold shadow-sm">
              Comprar como invitado
            </div>
            <div
              className="cursor-not-allowed rounded-md px-5 py-2.5 text-sm font-semibold text-muted-foreground"
              title="Disponible próximamente"
            >
              Iniciar sesión
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Datos de contacto</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombreContacto">Nombre completo</Label>
                <Input id="nombreContacto" name="nombreContacto" placeholder="María Pérez" required />
                {fieldErrors.nombreContacto && (
                  <p className="text-xs text-destructive">{fieldErrors.nombreContacto}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="telefonoContacto">Teléfono (WhatsApp)</Label>
                <Input id="telefonoContacto" name="telefonoContacto" placeholder="300 000 0000" required />
                {fieldErrors.telefonoContacto && (
                  <p className="text-xs text-destructive">{fieldErrors.telefonoContacto}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emailContacto">
                Correo electrónico <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="emailContacto" name="emailContacto" type="email" placeholder="tucorreo@ejemplo.com" />
              {fieldErrors.emailContacto && (
                <p className="text-xs text-destructive">{fieldErrors.emailContacto}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Dirección de envío</h3>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="direccionEnvio">Dirección</Label>
              <Input id="direccionEnvio" name="direccionEnvio" placeholder="Calle 10 # 5-20, Apto 301" required />
              {fieldErrors.direccionEnvio && (
                <p className="text-xs text-destructive">{fieldErrors.direccionEnvio}</p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input id="ciudad" name="ciudad" placeholder="Bogotá" required />
                {fieldErrors.ciudad && <p className="text-xs text-destructive">{fieldErrors.ciudad}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="referencia">
                  Referencia / barrio <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Input id="referencia" name="referencia" placeholder="Cerca al parque" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Método de pago</h3>
            <RadioGroup
              value={metodoPago}
              onValueChange={(v) => setMetodoPago(v as "CONTRA_ENTREGA" | "TRANSFERENCIA")}
              className="flex flex-col gap-3"
            >
              {METODOS_PAGO.map((m) => (
                <Label
                  key={m.value}
                  htmlFor={m.value}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 ${
                    metodoPago === m.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={m.value} id={m.value} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{m.titulo}</div>
                    <div className="text-xs text-muted-foreground">{m.detalle}</div>
                  </div>
                </Label>
              ))}

              <div className="flex cursor-not-allowed items-center gap-3.5 rounded-xl border border-border p-4 opacity-50">
                <RadioGroupItem value="PASARELA_ONLINE" id="PASARELA_ONLINE" disabled />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Pasarela en línea</div>
                  <div className="text-xs text-muted-foreground">Tarjeta, PSE o Nequi — próximamente</div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" disabled={enviando} className="h-13 text-[15px]">
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        </div>

        <div className="w-full lg:w-96 lg:shrink-0">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tu pedido</h3>
              <Link href="/carrito" className="text-sm font-semibold text-primary">
                Editar
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.productoId} className="flex items-center gap-3 text-[13px]">
                  <div className="flex-1">
                    {item.nombre} <span className="text-muted-foreground">× {item.cantidad}</span>
                  </div>
                  <div className="font-semibold">{formatPrecio(item.cantidad * item.precioUnitario)}</div>
                </div>
              ))}
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm text-foreground/80">
                <span>Subtotal</span>
                <span>{formatPrecio(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Envío</span>
                <span>Por confirmar</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total estimado</span>
                <span>{formatPrecio(subtotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-muted px-3.5 py-3">
              <TruckIcon width={16} height={16} className="text-primary" />
              <span className="text-[13px]">Te confirmamos el envío por WhatsApp</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <CheckCircleIcon width={14} height={14} />
              <span className="text-[12px]">Compra 100% segura</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
