import { GoogleGenAI } from "@google/genai";
import { Pretext } from "../../utils/pretext.js";
import fs from "fs/promises";
import path from "path";

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const rawPrompt = body.prompt;

    if (!rawPrompt) {
      return new Response(JSON.stringify({ error: "No se proporcionó un prompt." }), { status: 400 });
    }

    // 1. Cargar Conocimiento Legal
    let legalKnowledge = "";
    try {
      const lawsDir = path.join(process.cwd(), "src", "content", "leyes");
      const files = await fs.readdir(lawsDir);
      const mdFiles = files.filter(f => f.endsWith(".md"));
      
      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(lawsDir, file), "utf-8");
        const cleaned = Pretext.cleanMarkdown(content).substring(0, 300000);
        legalKnowledge += `\n--- FUENTE: ${file} ---\n${cleaned}\n`;
      }
    } catch (err) {
      console.error("[RAG Error]", err.message);
    }

    // 2. Nueva Inicialización de GoogleGenAI
    const apiKey = import.meta.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    // 3. Preparar el Prompt Final
    const finalPrompt = `INSTRUCCIONES: Eres Temis, un asistente jurídico experto en Venezuela. 
    Responde basándote en la siguiente BASE DE CONOCIMIENTO LEGAL. 
    Cita siempre la FUENTE o el artículo. Responde siempre en español.

    BASE DE CONOCIMIENTO LEGAL:
    ${legalKnowledge}

    PREGUNTA DEL USUARIO:
    ${rawPrompt}`;

    console.log(`[Gemini 2.0] Procesando consulta...`);
    
    // 4. Generar Contenido con el nuevo SDK
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    });

    return new Response(JSON.stringify({ 
      text: response.text,
      tokensApprox: Pretext.estimateTokens(legalKnowledge) + Pretext.estimateTokens(response.text)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[Fatal Error]", error);
    return new Response(JSON.stringify({ 
      error: "Error al procesar la consulta.",
      details: error.message 
    }), { status: 500 });
  }
};
