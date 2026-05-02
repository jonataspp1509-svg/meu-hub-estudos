#include <iostream>

using namespace std;

double calcular(double n1, double n2, char op) {
    double res = 0;

    switch (op) {
        case '+':
            res = n1 + n2;
            break;
        case '-':
            res = n1 - n2;
            break;
        case '*':
            res = n1 * n2;
            break;
        case '/':
            if (n2 != 0) {
                res = n1 / n2;
            } else {
                cout << "Erro: Divisao por zero!" << endl;
                return 0; // Retorna 0 em caso de erro
            }
            break;
        default:
            cout << "Operador invalido!" << endl;
            return 0;
    }
    return res; // Devolve o valor para quem chamou a função
}

int main() {
    double num1, num2;
    char operador;

    cout << "Calculadora Modular" << endl;
    cout << "Digite o primeiro numero: ";
    cin >> num1;
    cout << "Digite o operador (+, -, *, /): ";
    cin >> operador;
    cout << "Digite o segundo numero: ";
    cin >> num2;

    
    double resultado = calcular(num1, num2, operador);

    cout << "Resultado final: " << resultado << endl;

    return 0;
}