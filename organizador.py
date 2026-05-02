import os
import shutil
import time
import subprocess

# --- CONFIGURAÇÕES ---
# O script agora assume que está DENTRO da pasta 'Projeto jojo'
PASTA_DOWNLOADS = os.path.expanduser("~/Downloads")
PASTA_PROJETO = os.getcwd()

# --- REGRAS (FÍSICA, QUÍMICA E OUTROS) ---
REGRAS = {
   # FÍSICA - Prof. Fabio (Dividido por Períodos)
    "F_FA_1P": "Estudos/Fisica/2 ANO M/Fabio/1P",
    "F_FA_2P": "Estudos/Fisica/2 ANO M/Fabio/2P",
    "F_FA_3P": "Estudos/Fisica/2 ANO M/Fabio/3P",
    "F_FA_4P": "Estudos/Fisica/2 ANO M/Fabio/4P",
    
    # FÍSICA - Prof ro
    "F_RO_1P": "Estudos/Fisica/2 ANO M/Rocris/1P",
    "F_RO_2P": "Estudos/Fisica/2 ANO M/Rocris/2P",
    "F_RO_3P": "Estudos/Fisica/2 ANO M/Rocris/3P",
    "F_RO_4P": "Estudos/Fisica/2 ANO M/Rocris/4P",

    #FISICA - PROF PADUA
    "F_PA_1P": "Estudos/Fisica/2 ANO M/Padua/1P",
    "F_PA_2P": "Estudos/Fisica/2 ANO M/Padua/2P",
    "F_PA_3P": "Estudos/Fisica/2 ANO M/Padua/3P",
    "F_PA_4P": "Estudos/Fisica/2 ANO M/Padua/4P",

    #Quimica - prof Renato
    "Q_RE_1P": "Estudos/Quimica/2 ANO M/Renato/1P",
    "Q_RE_2P": "Estudos/Quimica/2 ANO M/Renato/2P",
    "Q_RE_3P": "Estudos/Quimica/2 ANO M/Renato/3P",
    "Q_RE_4P": "Estudos/Quimica/2 ANO M/Renato/4P",
    
    #Quimica - prof Garbriel
    "Q_GA_1P": "Estudos/Quimica/2 ANO M/Gabriel/1P",
    "Q_GA_2P": "Estudos/Quimica/2 ANO M/Gabriel/2P",
    "Q_GA_3P": "Estudos/Quimica/2 ANO M/Gabriel/3P",
    "Q_GA_4P": "Estudos/Quimica/2 ANO M/Gabriel/4P",
    
    #Quimica - prof Thati
    "Q_TA_1P": "Estudos/Quimica/2 ANO M/Thati/1P",
    "Q_TA_2P": "Estudos/Quimica/2 ANO M/Thati/2P",
    "Q_TA_3P": "Estudos/Quimica/2 ANO M/Thati/3P",
    "Q_TA_4P": "Estudos/Quimica/2 ANO M/Thati/4P",
    
    #Biologia - prof crot
    "B_CR_1P": "Estudos/Biologia/2 ANO M/Croti/1P",
    "B_CR_2P": "Estudos/Biologia/2 ANO M/Croti/2P",
    "B_CR_3P": "Estudos/Biologia/2 ANO M/Croti/3P",
    "B_CR_4P": "Estudos/Biologia/2 ANO M/Croti/4P",

    #Biologia - prof murilo
    "B_MU_1P": "Estudos/Biologia/2 ANO M/Murilo/1P",
    "B_MU_2P": "Estudos/Biologia/2 ANO M/Murilo/2P",
    "B_MU_3P": "Estudos/Biologia/2 ANO M/Murilo/3P",
    "B_MU_4P": "Estudos/Biologia/2 ANO M/Murilo/4P",

    #Historia - prof Luciano
    "HIS_LU_1P": "Estudos/Historia/2 ANO M/Luciano/1P",
    "HIS_LU_2P": "Estudos/Historia/2 ANO M/Luciano/2P",
    "HIS_LU_3P": "Estudos/Historia/2 ANO M/Luciano/3P",
    "HIS_LU_4P": "Estudos/Historia/2 ANO M/Luciano/4P",

    #Historia - prof Celcio
    "HIS_CE_1P": "Estudos/Historia/2 ANO M/Celcio/1P",
    "HIS_CE_2P": "Estudos/Historia/2 ANO M/Celcio/2P",
    "HIS_CE_3P": "Estudos/Historia/2 ANO M/Celcio/3P",
    "HIS_CE_4P": "Estudos/Historia/2 ANO M/Celcio/4P",

    #Geografia - prof alex
    "GEO_AL_1P": "Estudos/Geografia/2 ANO M/Alex/1P",
    "GEO_AL_2P": "Estudos/Geografia/2 ANO M/Alex/2P",
    "GEO_AL_3P": "Estudos/Geografia/2 ANO M/Alex/3P",
    "GEO_AL_4P": "Estudos/Geografia/2 ANO M/Alex/4P",

    #Geografia - prof Bruno
    "GEO_BU_1P": "Estudos/Geografia/2 ANO M/Bruno/1P",
    "GEO_BU_2P": "Estudos/Geografia/2 ANO M/Bruno/2P",
    "GEO_BU_3P": "Estudos/Geografia/2 ANO M/Bruno/3P",
    "GEO_BU_4P": "Estudos/Geografia/2 ANO M/Bruno/4P",

    #Filosofia 
    "FIL_1P": "Estudos/Filosofia/2 ANO M/1P",
    "FIL_2P": "Estudos/Filosofia/2 ANO M/2P",
    "FIL_3P": "Estudos/Filosofia/2 ANO M/3P",
    "FIL_4P": "Estudos/Filosofia/2 ANO M/4P",

    #Sociologia
    "SOC_1P": "Estudos/Sociologia/2 ANO M/1P",
    "SOC_2P": "Estudos/Sociologia/2 ANO M/2P",
    "SOC_3P": "Estudos/Sociologia/2 ANO M/3P",
    "SOC_4P": "Estudos/Sociologia/2 ANO M/4P",

    #Redaçao
    "RED_1P": "Estudos/Redacao/2 ANO M/1P",
    "RED_2P": "Estudos/Redacao/2 ANO M/2P",
    "RED_3P": "Estudos/Redacao/2 ANO M/3P",
    "RED_4P": "Estudos/Redacao/2 ANO M/4P",

    #Ingles
    "ING_1P": "Estudos/Ingles/2 ANO M/1P",
    "ING_2P": "Estudos/Ingles/2 ANO M/2P",
    "ING_3P": "Estudos/Ingles/2 ANO M/3P",
    "ING_4P": "Estudos/Ingles/2 ANO M/4P",

    #Matematica - prof larissa
    "MAT_LA_1P": "Estudos/Matematica/2 ANO M/Larissa/1P",
    "MAT_LA_2P": "Estudos/Matematica/2 ANO M/Larissa/2P",
    "MAT_LA_3P": "Estudos/Matematica/2 ANO M/Larissa/3P",
    "MAT_LA_4P": "Estudos/Matematica/2 ANO M/Larissa/4P",

    #Matemtica - prof Fagundes
    "MAT_FA_1P": "Estudos/Matematica/2 ANO M/Fagundes/1P",
    "MAT_FA_2P": "Estudos/Matematica/2 ANO M/Fagundes/2P",
    "MAT_FA_3P": "Estudos/Matematica/2 ANO M/Fagundes/3P",
    "MAT_FA_4P": "Estudos/Matematica/2 ANO M/Fagundes/4P",

    #matematica - prof Walter
    "MAT_WA_1P": "Estudos/Matematica/2 ANO M/Walter/1P",
    "MAT_WA_2P": "Estudos/Matematica/2 ANO M/Walter/2P",
    "MAT_WA_3P": "Estudos/Matematica/2 ANO M/Walter/3P",
    "MAT_WA_4P": "Estudos/Matematica/2 ANO M/Walter/4P",

    #Portugues - prof ivan
    "POR_IV_1P": "Estudos/Portugues/2 ANO M/Ivan/1P",
    "POR_IV_2P": "Estudos/Portugues/2 ANO M/Ivan/2P",
    "POR_IV_3P": "Estudos/Portugues/2 ANO M/Ivan/3P",
    "POR_IV_4P": "Estudos/Portugues/2 ANO M/Ivan/4P",

    #Portugues - prof Odete
    "POR_OD_1P": "Estudos/Portugues/2 ANO M/Odete/1P",
    "POR_OD_2P": "Estudos/Portugues/2 ANO M/Odete/2P",
    "POR_OD_3P": "Estudos/Portugues/2 ANO M/Odete/3P",
    "POR_OD_4P": "Estudos/Portugues/2 ANO M/Odete/4P",
    
    # PASTAS GERAIS
    "VEST_": "Estudos/Vestibulares",
}

def organizar_automatico():
    print(f"🚀 Robô Turbo Ativado em: {PASTA_PROJETO}")
    
    while True:
        try:
            for arquivo in os.listdir(PASTA_DOWNLOADS):
                nome_upper = arquivo.upper()
                
                for prefixo, subpasta in REGRAS.items():
                    if nome_upper.startswith(prefixo):
                        origem = os.path.join(PASTA_DOWNLOADS, arquivo)
                        destino_dir = os.path.join(PASTA_PROJETO, subpasta)
                        
                        # 1. Move o arquivo
                        os.makedirs(destino_dir, exist_ok=True)
                        shutil.move(origem, os.path.join(destino_dir, arquivo))
                        print(f"\n✅ {arquivo} movido!")

                        # 2. O "3" AUTOMÁTICO
                        print("⚙️ Atualizando dados.txt automaticamente...")
                        # Enviamos '3', apertamos Enter (\n), enviamos 'Estudos' e apertamos Enter de novo
                        input_data = "3\nEstudos\n4\n" 
                        subprocess.run("gerenciador.exe", input=input_data, text=True, shell=True)

                        # 3. ENVIO PARA O GITHUB
                        print("📤 Subindo para o site...")
                        subprocess.run("git add .", shell=True)
                        subprocess.run(f'git commit -m "Auto-update: {arquivo}"', shell=True)
                        
                        # Tenta mandar para o GitHub
                        result = subprocess.run("git push origin master", shell=True)
                        if result.returncode != 0:
                            subprocess.run("git push origin master", shell=True)
                        
                        print("✨ TUDO PRONTO! Sem precisar digitar nada.")
            
            time.sleep(5)
        except Exception as e:
            print(f"⚠️ Erro: {e}")
            time.sleep(5)

if __name__ == "__main__":
    organizar_automatico()