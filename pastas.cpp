#include <iostream>
#include <filesystem> // Biblioteca para manipular arquivos e pastas
#include <string>

// Criamos um "apelido" para não ter que digitar std::filesystem toda hora
namespace fs = std::filesystem;
using namespace std;

int main() {
    string nomeMateria;

    cout << "=== ORGANIZADOR DE ESTUDOS ===" << endl;
    cout << "Digite o nome da materia (ex: Historia, Fotos de Aula): ";
    
    // getline lê a linha inteira, incluindo espaços
    getline(cin, nomeMateria);

    // Verificamos se a pasta já existe antes de tentar criar
    if (fs::exists(nomeMateria)) {
        cout << "Aviso: Uma pasta com o nome '" << nomeMateria << "' ja existe!" << endl;
    } 
    else {
        // O comando que realmente cria a pasta no seu computador
        if (fs::create_directory(nomeMateria)) {
            cout << "Sucesso! Pasta '" << nomeMateria << "' criada com exito." << endl;
        } else {
            cout << "Erro critico: Nao foi possivel criar a pasta." << endl;
        }
    }

    return 0;
}