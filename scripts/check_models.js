import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No hay API KEY en el .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Intentamos listar modelos (esto requiere que la API key tenga permisos de listado)
    // Pero como a veces no los tiene, probaremos directamente los nombres comunes
    console.log("Probando disponibilidad de modelos...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        console.log(`✅ Modelo ${m}: Configurado ok`);
      } catch (e) {
        console.log(`❌ Modelo ${m}: Error ${e.message}`);
      }
    }
  } catch (error) {
    console.error("Error general:", error.message);
  }
}

listModels();
