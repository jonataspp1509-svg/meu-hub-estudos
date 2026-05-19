export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ resposta: "Use POST" });
  }

  const { tipo, texto } = req.body;

  return res.status(200).json({
    resposta: "Funcionou!\nTipo: " + tipo + "\nTexto: " + texto
  });
}