import os

pasta = r"C:\Users\DELL\Downloads\Projeto jojo\Estudos"

for raiz, dirs, files in os.walk(pasta):
    print("Pasta encontrada:", raiz)