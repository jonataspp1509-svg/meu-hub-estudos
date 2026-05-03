import os
import unicodedata
import re

# 🔧 LIMPA NOMES
def limpar_nome(nome):
    nome = unicodedata.normalize('NFKD', nome)
    nome = nome.encode('ASCII', 'ignore').decode('ASCII')
    nome = nome.lower()
    nome = nome.replace(' ', '_')
    nome = re.sub(r'[^a-z0-9._/-]', '', nome)
    nome = re.sub(r'_+', '_', nome)
    return nome

# 🔄 RENOMEIA TUDO
def renomear_tudo(base):
    for raiz, dirs, files in os.walk(base, topdown=False):

        # arquivos
        for nome in files:
            antigo = os.path.join(raiz, nome)
            novo_nome = limpar_nome(nome)
            novo = os.path.join(raiz, novo_nome)

            if antigo != novo:
                print(f"Arquivo: {antigo} -> {novo}")
                os.rename(antigo, novo)

        # pastas
        for nome in dirs:
            antigo = os.path.join(raiz, nome)
            novo_nome = limpar_nome(nome)
            novo = os.path.join(raiz, novo_nome)

            if antigo != novo:
                print(f"Pasta: {antigo} -> {novo}")
                os.rename(antigo, novo)

# 📄 GERA dados.txt
def gerar_dados(base, arquivo_saida):
    lista = []

    for raiz, dirs, files in os.walk(base):
        for file in files:
            caminho = os.path.join(raiz, file)

            # transforma em caminho relativo
            rel = os.path.relpath(caminho, base)

            # padroniza barra
            rel = rel.replace("\\", "/")

            lista.append(rel)

    with open(arquivo_saida, "w", encoding="utf-8") as f:
        for item in sorted(lista):
            f.write(item + "\n")

    print("\n✅ dados.txt gerado com sucesso!")

# 🚀 EXECUÇÃO
base = r"C:\Users\DELL\Downloads\GitHub\meu-hub-estudos\Estudos"
saida = r"C:\Users\DELL\Downloads\GitHub\meu-hub-estudos\dados.txt"

print("🔄 Renomeando arquivos e pastas...\n")
renomear_tudo(base)

print("\n📄 Gerando dados.txt...\n")
gerar_dados(base, saida)