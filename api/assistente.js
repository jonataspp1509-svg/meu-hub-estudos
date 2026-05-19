export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ resposta: "Método não permitido" });
  }

  const { tipo, texto } = req.body;

  if (!texto) {
    return res.status(400).json({ resposta: "Texto vazio." });
  }

  return res.status(200).json({
    resposta: `Você escolheu: ${tipo}\n\nTexto recebido:\n${texto}`
  });
}