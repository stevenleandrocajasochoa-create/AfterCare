import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req, res) => res.json({ app: "AFTERCARE AI", status: "ok" }));

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 500) return res.status(400).json({ error: "Mensaje vacío o demasiado largo." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "El servidor no tiene configurada una clave de IA." });
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions: "Eres Aftercare, un asistente amable de bienestar general. Responde en español, con empatía y de forma breve. No diagnostiques ni prescribas tratamientos. No promuevas dietas restrictivas, pérdida de peso, ejercicio excesivo ni vergüenza corporal. Recomienda apoyo de un adulto de confianza o profesional cuando corresponda. No afirmes ser médico. En una emergencia, indica contactar los servicios de emergencia locales.",
        input: message,
        max_output_tokens: 220
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("AI provider error:", data);
      return res.status(502).json({ error: "El servicio de IA no respondió correctamente." });
    }
    const reply = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n").trim();
    if (!reply) return res.status(502).json({ error: "La IA devolvió una respuesta vacía." });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo completar la solicitud." });
  }
});

app.listen(PORT, () => console.log(`AFTERCARE server running on port ${PORT}`));
