import fs from "fs/promises";
import path from "path";

export const GET = async () => {
  try {
    const lawsDir = path.join(process.cwd(), "src", "content", "leyes");
    
    // Asegurar que la carpeta existe
    try {
      await fs.access(lawsDir);
    } catch {
      await fs.mkdir(lawsDir, { recursive: true });
    }

    const files = await fs.readdir(lawsDir);
    const mdFiles = await Promise.all(
      files
        .filter(f => f.endsWith(".md"))
        .map(async (file) => {
          const stats = await fs.stat(path.join(lawsDir, file));
          return {
            name: file,
            size: stats.size,
            date: stats.mtime
          };
        })
    );

    return new Response(JSON.stringify({ files: mdFiles }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error listando leyes:", error);
    return new Response(JSON.stringify({ error: "Error al leer la biblioteca." }), { status: 500 });
  }
};
