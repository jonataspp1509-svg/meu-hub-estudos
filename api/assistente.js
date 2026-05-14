export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { tipo, texto } = req.body;

    const prompt = `
Você é o Assistente StudyFlow, uma IA escolar.
Ajude o aluno de forma clara, simples e passo a passo.

Tipo de tarefa: ${tipo}

Conteúdo do aluno:
${texto}
`;

    const resposta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const dados = await resposta.json();

    res.status(200).json({
      resposta: dados.output_text || "Não consegui gerar resposta."
    });

  } catch (erro) {
    res.status(500).json({
      resposta: "Erro ao chamar a IA."
    });
  }
}