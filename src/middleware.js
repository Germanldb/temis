import { defineMiddleware } from "astro:middleware";
import { supabase } from "./db/supabase";

/**
 * Middleware para control de IP (Rate Limit) y autenticación.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { url, clientAddress, locals, cookies, redirect } = context;

  // 1. Protección de la ruta /chat (Solo usuarios autenticados)
  if (url.pathname.startsWith('/chat')) {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
      return redirect("/login");
    }

    // Verificar si el token es válido con Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    if (error) {
      // Token inválido o expirado, limpiar cookies y redirigir
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      return redirect("/login");
    }

    // Almacenamos el usuario en locals para usarlo en los componentes si es necesario
    locals.user = data.user;
  }

  // 2. Control de IP para el endpoint de chat (Invitados)
  if (url.pathname.startsWith('/api/chat')) {
    const ip = clientAddress;
    locals.userIp = ip;

    // Si el usuario está autenticado, no aplicamos límite de IP (se aplicará límite de créditos luego)
    const accessToken = cookies.get("sb-access-token");
    if (accessToken) return next();

    // Consultar uso por IP en Supabase
    const { data, error } = await supabase
      .from('uso_por_ip')
      .select('ultima_consulta, conteo')
      .eq('ip', ip)
      .single();

    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0]; // YYYY-MM-DD

    if (data) {
      const fechaUltima = new Date(data.ultima_consulta).toISOString().split('T')[0];
      
      if (fechaUltima === hoy) {
        return new Response(JSON.stringify({ 
          error: "Has agotado tu consulta gratuita diaria. Regístrate o inicia sesión para continuar consultando a Temis." 
        }), { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Si es un nuevo día, actualizamos la fecha y reiniciamos o sumamos conteo
      await supabase
        .from('uso_por_ip')
        .update({ ultima_consulta: ahora.toISOString(), conteo: data.conteo + 1 })
        .eq('ip', ip);
    } else {
      // Primera vez que esta IP consulta
      await supabase
        .from('uso_por_ip')
        .insert({ ip, ultima_consulta: ahora.toISOString(), conteo: 1 });
    }
  }

  return next();
});
