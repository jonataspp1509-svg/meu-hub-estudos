import os

BASE = "Estudos"

linhas = []

for raiz, pastas, arquivos in os.walk(BASE):
    for arquivo in arquivos:
        caminho = os.path.join(raiz, arquivo)
        relativo = os.path.relpath(caminho, BASE)
        relativo = relativo.replace("\\", "/")
        linhas.append(relativo)

linhas.sort()

with open("dados.txt", "w", encoding="utf-8") as f:
    for linha in linhas:
        f.write(linha + "\n")

print("✅ dados.txt atualizado com a estrutura nova.")