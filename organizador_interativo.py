import os
import shutil
import time
import subprocess

PASTA_DOWNLOADS = os.path.expanduser("~/Downloads")
PASTA_PROJETO = os.getcwd()
PASTA_ESTUDOS = os.path.join(PASTA_PROJETO, "Estudos")

EXTENSOES_PERMITIDAS = (
    ".pdf", ".docx", ".doc", ".pptx", ".ppt",
    ".xlsx", ".xls", ".png", ".jpg", ".jpeg"
)

MATERIAS = {
    "1": ("Fisica", ["Fabio", "Rocris", "Padua"]),
    "2": ("Quimica", ["Renato", "Gabriel", "Thati"]),
    "3": ("Biologia", ["Croti", "Murilo"]),
    "4": ("Matematica", ["Larissa", "Fagundes", "Walter"]),
    "5": ("Historia", ["Luciano", "Celcio"]),
    "6": ("Geografia", ["Alex", "Bruno"]),
    "7": ("Portugues", ["Ivan", "Odete"]),
    "8": ("Ingles", []),
    "9": ("Redacao", []),
    "10": ("Filosofia", []),
    "11": ("Sociologia", []),
    "12": ("Vestibulares", []),
}

PERIODOS = {
    "1": "1P",
    "2": "2P",
    "3": "3P",
    "4": "4P"
}


def limpar_tela():
    os.system("cls" if os.name == "nt" else "clear")


def esperar_arquivo_liberar(caminho):
    tamanho_anterior = -1

    for _ in range(10):
        if not os.path.exists(caminho):
            return False

        tamanho_atual = os.path.getsize(caminho)

        if tamanho_atual == tamanho_anterior:
            return True

        tamanho_anterior = tamanho_atual
        time.sleep(1)

    return True


def escolher_opcao(titulo, opcoes):
    print("\n" + titulo)

    for chave, valor in opcoes.items():
        if isinstance(valor, tuple):
            print(f"{chave} - {valor[0]}")
        else:
            print(f"{chave} - {valor}")

    while True:
        escolha = input("Escolha: ").strip()

        if escolha in opcoes:
            return escolha

        print("Opção inválida. Tente novamente.")


def escolher_destino():
    materia_id = escolher_opcao("📚 Escolha a matéria:", MATERIAS)
    materia, professores = MATERIAS[materia_id]

    professor = ""

    if professores:
        prof_opcoes = {str(i + 1): p for i, p in enumerate(professores)}
        prof_id = escolher_opcao("👨‍🏫 Escolha o professor:", prof_opcoes)
        professor = prof_opcoes[prof_id]

    periodo_id = escolher_opcao("🗓️ Escolha o período:", PERIODOS)
    periodo = PERIODOS[periodo_id]

    if professores:
        destino = os.path.join(PASTA_ESTUDOS, materia, "2_ano_m", professor, periodo)
    elif materia == "Vestibulares":
        destino = os.path.join(PASTA_ESTUDOS, materia)
    elif materia == "Biologia":
        destino = os.path.join(PASTA_ESTUDOS, materia, professor, periodo)
    else:
        destino = os.path.join(PASTA_ESTUDOS, materia, "2 ANO M", periodo)

    return destino


def gerar_dados_txt():
    caminho_dados = os.path.join(PASTA_PROJETO, "dados.txt")

    linhas = []

    for raiz, pastas, arquivos in os.walk(PASTA_ESTUDOS):
        for arquivo in arquivos:
            caminho_completo = os.path.join(raiz, arquivo)
            caminho_relativo = os.path.relpath(caminho_completo, PASTA_ESTUDOS)
            caminho_relativo = caminho_relativo.replace("\\", "/")
            linhas.append(caminho_relativo)

    linhas.sort()

    with open(caminho_dados, "w", encoding="utf-8") as f:
        for linha in linhas:
            f.write(linha + "\n")

    print("✅ dados.txt atualizado.")


def enviar_github(nome_arquivo):
    print("📤 Enviando para o GitHub...")

    try:
        subprocess.run("git add .", shell=True, check=True)

        resultado = subprocess.run(
            f'git commit -m "Auto: {nome_arquivo}"',
            shell=True,
            text=True,
            capture_output=True
        )

        if resultado.returncode != 0:
            print("ℹ️ Nada novo para commit ou commit não necessário.")
        else:
            print("✅ Commit criado.")

        subprocess.run("git push origin master", shell=True, check=True)
        print("✨ Site atualizado com sucesso!")

    except subprocess.CalledProcessError as erro:
        print("⚠️ Erro no Git.")
        print(erro)


def mover_arquivo(arquivo):
    origem = os.path.join(PASTA_DOWNLOADS, arquivo)

    if not esperar_arquivo_liberar(origem):
        return

    limpar_tela()

    print("📥 Novo arquivo encontrado:")
    print(arquivo)

    destino_dir = escolher_destino()
    os.makedirs(destino_dir, exist_ok=True)

    destino = os.path.join(destino_dir, arquivo)

    if os.path.exists(destino):
        nome, ext = os.path.splitext(arquivo)
        destino = os.path.join(destino_dir, f"{nome}_{int(time.time())}{ext}")

    shutil.move(origem, destino)

    print(f"\n✅ Arquivo movido para:")
    print(destino)

    gerar_dados_txt()
    enviar_github(os.path.basename(destino))


def monitorar():
    print(f"🤖 StudyFlow Organizador ativado")
    print(f"📂 Monitorando: {PASTA_DOWNLOADS}")
    print(f"📁 Projeto: {PASTA_PROJETO}")
    print("Pressione Ctrl+C para parar.\n")

    vistos = set(os.listdir(PASTA_DOWNLOADS))

    while True:
        try:
            atuais = set(os.listdir(PASTA_DOWNLOADS))
            novos = atuais - vistos

            for arquivo in novos:
                if arquivo.endswith(".crdownload") or arquivo.endswith(".tmp"):
                    continue

                if not arquivo.lower().endswith(EXTENSOES_PERMITIDAS):
                    continue

                mover_arquivo(arquivo)

            vistos = set(os.listdir(PASTA_DOWNLOADS))
            time.sleep(3)

        except KeyboardInterrupt:
            print("\n🛑 Organizador encerrado.")
            break

        except Exception as e:
            print(f"⚠️ Erro: {e}")
            time.sleep(3)


if __name__ == "__main__":
    monitorar()