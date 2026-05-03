import os
import unicodedata
import re

def limpar_nome(nome):
    # Remove acentos
    nome = unicodedata.normalize('NFKD', nome)
    nome = nome.encode('ASCII', 'ignore').decode('ASCII')

    # Minúsculo
    nome = nome.lower()

    # Substitui espaços por _
    nome = nome.replace(' ', '_')

    # Remove caracteres inválidos
    nome = re.sub(r'[^a-z0-9._-]', '', nome)

    # Remove múltiplos _
    nome = re.sub(r'_+', '_', nome)

    return nome

def renomear_pasta(caminho_base):
    
    print("Rodando script...")

    for raiz, dirs, files in os.walk(caminho_base, topdown=False):

        print("Entrou na pasta:", raiz)

        # Renomeia arquivos
        for nome in files:
            caminho_antigo = os.path.join(raiz, nome)
            novo_nome = limpar_nome(nome)
            caminho_novo = os.path.join(raiz, novo_nome)

            if caminho_antigo != caminho_novo:
                print(f"Arquivo: {caminho_antigo} -> {caminho_novo}")
                os.rename(caminho_antigo, caminho_novo)

        # Renomeia pastas
        for nome in dirs:
            caminho_antigo = os.path.join(raiz, nome)
            novo_nome = limpar_nome(nome)
            caminho_novo = os.path.join(raiz, novo_nome)

            if caminho_antigo != caminho_novo:
                print(f"Pasta: {caminho_antigo} -> {caminho_novo}")
                os.rename(caminho_antigo, caminho_novo)

# 🔧 COLOQUE AQUI O CAMINHO DA SUA PASTA
pasta = r"C:\Users\DELL\Downloads\Projeto jojo\Estudos"

renomear_pasta(pasta)