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

AREAS = {
    "1": "1AnoM",
    "2": "2AnoM",
    "3": "vestibulares"
}

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
}

PERIODOS = {
    "1": "1p",
    "2": "2p",
    "3": "3p",
    "4": "4p"
}


def limpar_tela():
    os.system("cls" if os.name == "nt" else "clear")


def pegar_pasta_existente(pasta_pai, nome_desejado):
    if not os.path.exists(pasta_pai):
        return os.path.join(pasta_pai, nome_desejado)

    nome_normalizado = nome_desejado.strip().lower()

    for item in os.listdir(pasta_pai):
        caminho_item = os.path.join(pasta_pai, item)

        if os.path.isdir(caminho_item) and item.strip().lower() == nome_normalizado:
            return caminho_item

    return os.path.join(pasta_pai, nome_desejado)


def montar_caminho(*partes):
    caminho = partes[0]

    for parte in partes[1:]:
        caminho = pegar_pasta_existente(caminho, parte)

    return caminho


def esperar_item_liberar(caminho):
    if os.path.isdir(caminho):
        return True

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


def criar_pasta_com_subpastas(caminho_base):
    while True:
        nome = input("Nome da nova pasta: ").strip()

        if not nome:
            print("Nome inválido.")
            continue

        caminho_base = os.path.join(caminho_base, nome)
        os.makedirs(caminho_base, exist_ok=True)

        print(f"Pasta criada/selecionada: {caminho_base}")

        criar_mais = input("Quer criar uma subpasta dentro dela? (s/n): ").strip().lower()

        if criar_mais == "s":
            continue

        return caminho_base


def escolher_subpasta_final(destino_base):
    while True:
        os.makedirs(destino_base, exist_ok=True)

        subpastas = [
            p for p in os.listdir(destino_base)
            if os.path.isdir(os.path.join(destino_base, p))
        ]

        subpastas.sort(key=lambda x: x.lower())

        print("\nOnde você quer colocar o arquivo/pasta?")
        print(f"Pasta atual: {destino_base}")
        print("0 - Colocar direto nesta pasta")
        print("N - Criar nova pasta dentro desta pasta")

        for i, pasta in enumerate(subpastas, start=1):
            print(f"{i} - {pasta}")

        escolha = input("Escolha: ").strip().lower()

        if escolha == "0":
            return destino_base

        if escolha == "n":
            return criar_pasta_com_subpastas(destino_base)

        if escolha.isdigit():
            indice = int(escolha)

            if 1 <= indice <= len(subpastas):
                pasta_escolhida = os.path.join(destino_base, subpastas[indice - 1])

                while True:
                    print(f"\nPasta selecionada: {pasta_escolhida}")
                    print("1 - Colocar direto dentro desta pasta")
                    print("2 - Entrar nela e ver subpastas")
                    print("3 - Criar subpasta dentro dela")
                    print("4 - Voltar")

                    acao = input("Escolha: ").strip()

                    if acao == "1":
                        return pasta_escolhida

                    if acao == "2":
                        destino_base = pasta_escolhida
                        break

                    if acao == "3":
                        return criar_pasta_com_subpastas(pasta_escolhida)

                    if acao == "4":
                        break

                    print("Opção inválida.")

                continue

        print("Opção inválida.")


def escolher_destino():
    area_id = escolher_opcao("Escolha onde vai colocar:", AREAS)
    area = AREAS[area_id]

    if area == "vestibulares":
        destino = montar_caminho(PASTA_ESTUDOS, "vestibulares")
        return escolher_subpasta_final(destino)

    materia_id = escolher_opcao("Escolha a matéria:", MATERIAS)
    materia, professores = MATERIAS[materia_id]

    professor = ""

    if professores:
        prof_opcoes = {str(i + 1): p for i, p in enumerate(professores)}
        prof_id = escolher_opcao("Escolha o professor:", prof_opcoes)
        professor = prof_opcoes[prof_id]

    periodo_id = escolher_opcao("Escolha o período:", PERIODOS)
    periodo = PERIODOS[periodo_id]

    if professores:
        destino = montar_caminho(PASTA_ESTUDOS, area, materia, professor, periodo)
    else:
        destino = montar_caminho(PASTA_ESTUDOS, area, materia, periodo)

    return escolher_subpasta_final(destino)


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

    print("dados.txt atualizado.")


def gerar_atualizacoes(caminho_item):
    caminho_atualizacoes = os.path.join(PASTA_PROJETO, "atualizacoes.txt")

    linhas_novas = []

    if os.path.isdir(caminho_item):
        for raiz, pastas, arquivos in os.walk(caminho_item):
            for arquivo in arquivos:
                completo = os.path.join(raiz, arquivo)
                rel = os.path.relpath(completo, PASTA_ESTUDOS).replace("\\", "/")
                linhas_novas.append(rel)
    else:
        rel = os.path.relpath(caminho_item, PASTA_ESTUDOS).replace("\\", "/")
        linhas_novas.append(rel)

    linhas_antigas = []

    if os.path.exists(caminho_atualizacoes):
        with open(caminho_atualizacoes, "r", encoding="utf-8") as f:
            linhas_antigas = [linha.strip() for linha in f.readlines() if linha.strip()]

    todas = []

    for linha in linhas_novas + linhas_antigas:
        if linha not in todas:
            todas.append(linha)

    todas = todas[:20]

    with open(caminho_atualizacoes, "w", encoding="utf-8") as f:
        for linha in todas:
            f.write(linha + "\n")

    print("atualizacoes.txt atualizado.")


def enviar_github(nome_item):
    print("Enviando para o GitHub...")

    try:
        subprocess.run("git add .", shell=True, check=True)

        resultado = subprocess.run(
            f'git commit -m "Auto: {nome_item}"',
            shell=True,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="ignore"
        )

        if resultado.returncode != 0:
            print("Nada novo para commit ou commit não necessário.")
        else:
            print("Commit criado.")

        subprocess.run("git push origin master", shell=True, check=True)
        print("Site atualizado com sucesso!")

    except subprocess.CalledProcessError as erro:
        print("Erro no Git.")
        print(erro)
        print("\nDica:")
        print("git pull origin master --rebase")
        print("git push origin master")


def mover_item(nome_item):
    origem = os.path.join(PASTA_DOWNLOADS, nome_item)

    if not esperar_item_liberar(origem):
        return

    limpar_tela()

    tipo = "pasta" if os.path.isdir(origem) else "arquivo"

    print(f"Novo(a) {tipo} encontrado(a):")
    print(nome_item)

    destino_dir = escolher_destino()
    os.makedirs(destino_dir, exist_ok=True)

    destino = os.path.join(destino_dir, nome_item)

    if os.path.exists(destino):
        nome, ext = os.path.splitext(nome_item)
        destino = os.path.join(destino_dir, f"{nome}_{int(time.time())}{ext}")

    shutil.move(origem, destino)

    print("\nMovido para:")
    print(destino)

    gerar_dados_txt()
    gerar_atualizacoes(destino)
    enviar_github(os.path.basename(destino))


def item_valido(nome_item):
    caminho = os.path.join(PASTA_DOWNLOADS, nome_item)

    if nome_item.startswith("."):
        return False

    if nome_item.endswith(".crdownload") or nome_item.endswith(".tmp"):
        return False

    if os.path.isdir(caminho):
        return True

    return nome_item.lower().endswith(EXTENSOES_PERMITIDAS)


def monitorar():
    print("StudyFlow Organizador ativado")
    print(f"Monitorando: {PASTA_DOWNLOADS}")
    print(f"Projeto: {PASTA_PROJETO}")
    print("Pressione Ctrl+C para parar.\n")

    vistos = set(os.listdir(PASTA_DOWNLOADS))

    while True:
        try:
            atuais = set(os.listdir(PASTA_DOWNLOADS))
            novos = atuais - vistos

            for item in novos:
                if not item_valido(item):
                    continue

                mover_item(item)

            vistos = set(os.listdir(PASTA_DOWNLOADS))
            time.sleep(3)

        except KeyboardInterrupt:
            print("\nOrganizador encerrado.")
            break

        except Exception as e:
            print(f"Erro: {e}")
            time.sleep(3)


if __name__ == "__main__":
    monitorar()