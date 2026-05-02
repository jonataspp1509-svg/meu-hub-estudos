#include <iostream>
#include <fstream>
#include <string>
#include <filesystem>

using namespace std;
namespace fs = std::filesystem;

void listarEGerarIndice() {
    string nomePasta;
    cout << "\nDigite a pasta principal (ex: Fotos de fisica): ";
    cin.ignore();
    getline(cin, nomePasta);

    if (fs::exists(nomePasta) && fs::is_directory(nomePasta)) {
        ofstream arquivoSite("dados.txt");
        arquivoSite << "Pasta:" << nomePasta << "\n";

        cout << "Lendo estrutura de pastas..." << endl;

        for (const auto& item : fs::recursive_directory_iterator(nomePasta)) {
        // 1. Pega o caminho relativo
        string caminhoRelativo = fs::relative(item.path(), nomePasta).string();
    
            // 2. MÁGICA: Troca todas as barras '\' por '/' para o site entender
            for (auto& c : caminhoRelativo) {
                if (c == '\\') c = '/';
            }
            
            if (fs::is_directory(item.path())) {
                arquivoSite << "[DIR]" << caminhoRelativo << "\n";
            } else {
                arquivoSite << caminhoRelativo << "\n";
            }
        }
        arquivoSite.close();
        cout << "\n[SUCESSO] dados.txt gerado com todas as subpastas!" << endl;
    } else {
        cout << "\n[ERRO] Pasta nao encontrada!" << endl;
    }
}

int main() {
    int opcao;
    while (true) {
        cout << "\n1. Listar arquivos\n2. Criar Pasta\n3. Gerar Dados para Site\n4. Sair\nEscolha: ";
        cin >> opcao;
        if (opcao == 3) listarEGerarIndice();
        else if (opcao == 4) break;
    }
    return 0;
}