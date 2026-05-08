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
    "1": ("fisica", ["fabio", "rocris", "padua"]),
    "2": ("quimica", ["renato", "gabriel", "thati"]),
    "3": ("biologia", ["croti", "murilo"]),
    "4": ("matematica", ["larissa", "fagundes", "walter"]),
    "5": ("historia", ["luciano", "celcio"]),
    "6": ("geografia", ["alex", "bruno"]),
    "7": ("portugues", ["ivan", "odete"]),
    "8": ("ingles", []),
    "9": ("redacao", []),
    "10": ("filosofia", []),
    "11": ("sociologia", []),
    "12": ("vestibulares", []),
}

PERIODOS = {
    "1": "1p",
    "2": "2p",
    "3": "3p",
    "4": "4p"
}

# Matérias que NÃO usam a pasta 2_ano_m antes dos professores.
# Biologia fica assim: Estudos/biologia/croti/1p
SEM_SERIE = ["biologia"]


def limpar_tela():
    os.system("cls" if os.name == "nt" else "clear")


def pegar_pasta_existente(pasta_pai, nome_desejado):
    """
    Evita criar pasta duplicada por diferença de maiúscula/minúscula.
    Exemplo: se já existe 'Biologia', ele usa essa pasta mesmo que o código peça 'biologia'.
    """
    if not os.path.exists(pasta_pai):
        return os.path.join(pasta_pai, nome_desejado)

    nome_normalizado = nome_desejado.strip().lower()

    for item in os.listdir(pasta_pai):
        caminho_item = os.path.join(pasta_pai, item)

        if os.path.isdir(caminho_item) and item.strip().lower() == nome_normalizado:
            return caminho_item

    return os.path.join(pasta_pai, nome_desejado)


def montar_caminho(*partes):
    """
    Monta o caminho sempre reaproveitando pastas já existentes.
    """
    caminho = partes[0]

    for parte in partes[1:]:
        caminho = pegar_pasta_existente(caminho, parte)

    return caminho


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

def escolher_subpasta_final(destino_base):
    while True:
        os.makedirs(destino_base, exist_ok=True)

        subpastas = [
            p for p in os.listdir(destino_base)
            if os.path.isdir(os.path.join(destino_base, p))
        ]

        print("\n📂 Onde você quer colocar o arquivo?")
        print("0 - Colocar direto nesta pasta")

        for i, pasta in enumerate(subpastas, start=1):
            print(f"{i} - {pasta}")

        print("N - Criar nova pasta")

        escolha = input("Escolha: ").strip().lower()

        if escolha == "0":
            return destino_base

        if escolha == "n":
            nova = input("Nome da nova pasta: ").strip()
            if nova:
                destino_base = os.path.join(destino_base, nova)
                os.makedirs(destino_base, exist_ok=True)
                return destino_base

        if escolha.isdigit():
            indice = int(escolha)

            if 1 <= indice <= len(subpastas):
                destino_base = os.path.join(destino_base, subpastas[indice - 1])

                continuar = input("Entrar nessa pasta e ver subpastas? (s/n): ").strip().lower()

                if continuar == "s":
                    continue

                return destino_base

        print("Opção inválida.")


def escolher_destino():
    materia_id = escolher_opcao("📚 Escolha a matéria:", MATERIAS)
    materia, professores = MATERIAS[materia_id]

    professor = ""

    if professores:
        prof_opcoes = {str(i + 1): p for i, p in enumerate(professores)}
        prof_id = escolher_opcao("👨‍🏫 Escolha o professor:", prof_opcoes)
        professor = prof_opcoes[prof_id]

    periodo = ""

    if materia != "vestibulares":
        periodo_id = escolher_opcao("🗓️ Escolha o período:", PERIODOS)
        periodo = PERIODOS[periodo_id]

    if professores:
        if materia in SEM_SERIE:
            # Exemplo: Estudos/biologia/croti/1p
            destino = montar_caminho(PASTA_ESTUDOS, materia, professor, periodo)
        else:
            # Exemplo: Estudos/quimica/2_ano_m/renato/1p
            destino = montar_caminho(PASTA_ESTUDOS, materia, "2_ano_m", professor, periodo)

    elif materia == "vestibulares":
        # Exemplo: Estudos/vestibulares
        destino = montar_caminho(PASTA_ESTUDOS, materia)

    else:
        # Exemplo: Estudos/filosofia/2_ano_m/1p
        destino = montar_caminho(PASTA_ESTUDOS, materia, "2_ano_m", periodo)

    destino = escolher_subpasta_final(destino)
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


def gerar_atualizacoes(caminho_arquivo):
    """
    Cria/atualiza o arquivo atualizacoes.txt com os últimos arquivos adicionados.
    O site pode ler esse arquivo para mostrar a aba 'Atualizações recentes'.
    """
    caminho_atualizacoes = os.path.join(PASTA_PROJETO, "atualizacoes.txt")

    caminho_relativo = os.path.relpath(caminho_arquivo, PASTA_ESTUDOS)
    caminho_relativo = caminho_relativo.replace("\\", "/")

    linhas = []

    if os.path.exists(caminho_atualizacoes):
        with open(caminho_atualizacoes, "r", encoding="utf-8") as f:
            linhas = [linha.strip() for linha in f.readlines() if linha.strip()]

    linhas = [linha for linha in linhas if linha != caminho_relativo]
    linhas.insert(0, caminho_relativo)
    linhas = linhas[:20]

    with open(caminho_atualizacoes, "w", encoding="utf-8") as f:
        for linha in linhas:
            f.write(linha + "\n")

    print("✨ atualizacoes.txt atualizado.")


def enviar_github(nome_arquivo):
    print("📤 Enviando para o GitHub...")

    try:
        subprocess.run("git add .", shell=True, check=True)

        resultado = subprocess.run(
            f'git commit -m "Auto: {nome_arquivo}"',
            shell=True,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="ignore"
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
        print("\nDica: se o GitHub rejeitar o push, rode:")
        print("git pull origin master --rebase")
        print("git push origin master")


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
    gerar_atualizacoes(destino)
    enviar_github(os.path.basename(destino))


def monitorar():
    print("🤖 StudyFlow Organizador ativado")
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
