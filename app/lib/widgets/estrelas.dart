import 'package:flutter/material.dart';

import '../theme/tema.dart';

/// Mostra uma nota em estrelas (só leitura), com meia estrela quando precisa.
///
/// Ex: `Estrelas(nota: 4.5)`
class Estrelas extends StatelessWidget {
  final double nota;
  final double tamanho;

  const Estrelas({super.key, required this.nota, this.tamanho = 18});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        IconData icone;
        if (nota >= i + 1) {
          icone = Icons.star; // estrela cheia
        } else if (nota >= i + 0.5) {
          icone = Icons.star_half; // meia estrela
        } else {
          icone = Icons.star_border; // vazia
        }
        return Icon(icone, color: Tema.ambar, size: tamanho);
      }),
    );
  }
}

/// Estrelas em que o usuário TOCA para dar uma nota de 1 a 5.
///
/// Avisa a tela pai pelo `onSelecionar` sempre que o valor muda.
class EstrelasSeletor extends StatelessWidget {
  final int valor;
  final ValueChanged<int> onSelecionar;
  final double tamanho;

  const EstrelasSeletor({
    super.key,
    required this.valor,
    required this.onSelecionar,
    this.tamanho = 44,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (i) {
        final n = i + 1;
        return IconButton(
          onPressed: () => onSelecionar(n),
          icon: Icon(
            n <= valor ? Icons.star : Icons.star_border,
            color: Tema.ambar,
            size: tamanho,
          ),
        );
      }),
    );
  }
}
