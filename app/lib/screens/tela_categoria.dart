import 'package:flutter/material.dart';

import '../data/dados_mock.dart';
import '../models/categoria.dart';
import '../widgets/prestador_card.dart';
import 'tela_prestador.dart';

/// Lista os prestadores de uma categoria, do melhor avaliado ao pior.
class TelaCategoria extends StatelessWidget {
  final Categoria categoria;

  const TelaCategoria({super.key, required this.categoria});

  @override
  Widget build(BuildContext context) {
    final prestadores = DadosMock.prestadoresDaCategoria(categoria.id);

    return Scaffold(
      appBar: AppBar(title: Text(categoria.nome)),
      body: prestadores.isEmpty
          ? _VazioAinda(nomeCategoria: categoria.nome)
          : ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: prestadores.length,
              itemBuilder: (context, i) {
                final p = prestadores[i];
                return PrestadorCard(
                  prestador: p,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => TelaPrestador(prestador: p),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

/// Mensagem amigável quando ainda não há prestadores na categoria.
class _VazioAinda extends StatelessWidget {
  final String nomeCategoria;

  const _VazioAinda({required this.nomeCategoria});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Ainda não temos profissionais de $nomeCategoria por aqui.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }
}
