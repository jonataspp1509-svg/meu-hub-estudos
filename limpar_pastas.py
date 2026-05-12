import os

BASE = "Estudos"

for raiz, pastas, arquivos in os.walk(BASE, topdown=False):
    if raiz in [
        os.path.join(BASE, "1AnoM"),
        os.path.join(BASE, "2AnoM"),
        os.path.join(BASE, "vestibulares")
    ]:
        continue

    try:
        if not os.listdir(raiz):
            os.rmdir(raiz)
            print("Apagada pasta vazia:", raiz)
    except Exception as e:
        print("Erro:", raiz, e)

print("✅ Pastas vazias removidas.")