import 'package:flutter/material.dart';

import '../data/dados_mock.dart';
import '../models/categoria.dart';
import '../models/prestador.dart';
import '../theme/tema.dart';
import '../widgets/prestador_card.dart';
import 'tela_categoria.dart';
import 'tela_prestador.dart';

/// Tela de abertura: saudação, busca, grade de categorias e destaques.
class TelaInicial extends StatelessWidget {
  const TelaInicial({super.key});

  @override
  Widget build(BuildContext context) {
    // Destaques = prestadores mais bem avaliados no geral.
    final destaques = [...DadosMock.prestadores]
      ..sort((a, b) => b.mediaEstrelas.compareTo(a.mediaEstrelas));

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Topo verde com título e barra de busca
          SliverAppBar(
            pinned: true,
            expandedHeight: 130,
            backgroundColor: Tema.verde,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding:
                  const EdgeInsets.only(left: 16, bottom: 16, right: 16),
              title: const Text(
                'O que você precisa hoje?',
                style: TextStyle(fontSize: 16),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _BarraBusca(),
            ),
          ),

          // Título da seção de categorias
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Text('Categorias',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),

          // Grade de categorias
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            sliver: SliverGrid(
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                mainAxisSpacing: 4,
                crossAxisSpacing: 4,
                childAspectRatio: 0.85,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, i) => _CategoriaBotao(
                  categoria: DadosMock.categorias[i],
                ),
                childCount: DadosMock.categorias.length,
              ),
            ),
          ),

          // Título da seção de destaques
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 16, 16, 4),
              child: Text('Bem avaliados',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),

          // Lista de destaques
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                final Prestador p = destaques[i];
                return PrestadorCard(
                  prestador: p,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => TelaPrestador(prestador: p),
                    ),
                  ),
                );
              },
              childCount: destaques.length,
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

/// Barra de busca (ainda visual — a busca real entra numa próxima etapa).
class _BarraBusca extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: InputDecoration(
        hintText: 'Buscar serviço ou profissional...',
        prefixIcon: const Icon(Icons.search),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(vertical: 0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
      ),
      onSubmitted: (_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Busca entra na próxima etapa 🙂')),
        );
      },
    );
  }
}

/// Um ícone de categoria clicável na grade.
class _CategoriaBotao extends StatelessWidget {
  final Categoria categoria;

  const _CategoriaBotao({required this.categoria});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => TelaCategoria(categoria: categoria),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(categoria.icone, color: Tema.verde, size: 26),
          ),
          const SizedBox(height: 4),
          Text(
            categoria.nome,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
