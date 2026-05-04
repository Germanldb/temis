import { supabase } from "../../../db/supabase";

export const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    // Intentar iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Si el login es exitoso, guardamos la sesión en una cookie segura (Solo servidor)
    const session = data.session;
    cookies.set("sb-access-token", session.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: session.expires_in
    });
    
    cookies.set("sb-refresh-token", session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: session.expires_in
    });

    return new Response(JSON.stringify({ message: "Login exitoso" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error en API de Login:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
