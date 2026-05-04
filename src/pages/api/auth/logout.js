export const POST = async ({ cookies, redirect }) => {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  
  return new Response(JSON.stringify({ message: "Sesión cerrada" }), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
