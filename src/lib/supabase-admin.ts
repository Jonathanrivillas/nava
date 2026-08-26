import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la service_role key: solo debe importarse desde código de servidor
// (Server Actions, Route Handlers). El import "server-only" hace fallar el build
// si algo intenta incluir este archivo en un bundle de cliente.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const PRODUCTOS_BUCKET = "productos";
