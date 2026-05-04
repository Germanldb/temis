import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

export const POST = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get("pdf");

    if (!file) {
      return new Response(JSON.stringify({ error: "No se subió ningún archivo." }), { status: 400 });
    }

    // 1. Rutas
    const fileName = file.name.replace(/\s+/g, "_");
    const rawPath = path.join(process.cwd(), "raw_laws", fileName);
    const mdName = fileName.replace(".pdf", ".md");
    const outputPath = path.join(process.cwd(), "src", "content", "leyes", mdName);

    // 2. Guardar el PDF temporalmente
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(rawPath, buffer);

    // 3. Ejecutar el script de Python
    const scriptPath = path.join(process.cwd(), "scripts", "pdf_to_md.py");
    const pythonCommand = `python "${scriptPath}" "${rawPath}" "${outputPath}"`;

    return new Promise((resolve) => {
      exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error ejecución: ${error.message}`);
          resolve(new Response(JSON.stringify({ error: "Error al procesar el PDF con Python." }), { status: 500 }));
          return;
        }
        
        console.log(`Python Output: ${stdout}`);
        resolve(new Response(JSON.stringify({ 
          message: "Archivo procesado con éxito",
          file: mdName 
        }), { status: 200 }));
      });
    });

  } catch (error) {
    console.error("Error en API process-law:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor." }), { status: 500 });
  }
};
