"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarEstadoPedido } from "@/app/admin/pedidos/actions";
import { ESTADOS, type Estado, ESTADO_LABEL, ESTADO_BADGE_CLASS } from "@/lib/pedidos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EstadoPedidoSelect({ id, estado }: { id: string; estado: Estado }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [valor, setValor] = useState<Estado>(estado);

  function onChange(nuevo: string | null) {
    if (!nuevo || nuevo === valor) return;
    const anterior = valor;
    setValor(nuevo as Estado);
    startTransition(async () => {
      try {
        await actualizarEstadoPedido(id, nuevo as Estado);
        router.refresh();
      } catch {
        setValor(anterior);
      }
    });
  }

  const items = ESTADOS.map((e) => ({ value: e, label: ESTADO_LABEL[e] }));

  return (
    <Select items={items} value={valor} onValueChange={onChange}>
      <SelectTrigger
        disabled={pending}
        className={`h-8 w-[160px] border-none text-[12px] font-semibold ${ESTADO_BADGE_CLASS[valor]}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ESTADOS.map((e) => (
          <SelectItem key={e} value={e}>
            {ESTADO_LABEL[e]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
