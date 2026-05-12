import os
import shutil

BASE = "Estudos"

PASTA_2ANO = os.path.join(BASE, "2AnoM")
PASTA_1ANO = os.path.join(BASE, "1AnoM")

os.makedirs(PASTA_2ANO, exist_ok=True)
os.makedirs(PASTA_1ANO, exist_ok=True)

for materia in os.listdir(BASE):

    caminho_materia = os.path.join(BASE, materia)

    if not os.path.isdir(caminho_materia):
        continue

    # NÃO mexe em vestibulares
    if materia.lower() == "vestibulares":
        continue

    # NÃO mexe nas novas pastas
    if materia in ["2AnoM", "1AnoM"]:
        continue

    destino_materia = os.path.join(PASTA_2ANO, materia)
    os.makedirs(destino_materia, exist_ok=True)

    # CASO tenha pasta 2_ano_m
    pasta_serie = os.path.join(caminho_materia, "2_ano_m")

    if os.path.exists(pasta_serie):

        for item in os.listdir(pasta_serie):

            origem = os.path.join(pasta_serie, item)
            destino = os.path.join(destino_materia, item)

            print(f"Movendo: {origem}")
            shutil.move(origem, destino)

        shutil.rmtree(pasta_serie)

    else:
        # BIOLOGIA E OUTRAS SEM 2_ano_m
        for item in os.listdir(caminho_materia):

            origem = os.path.join(caminho_materia, item)
            destino = os.path.join(destino_materia, item)

            if os.path.exists(destino):
                continue

            print(f"Movendo: {origem}")
            shutil.move(origem, destino)

print("\n✅ Organização concluída!")