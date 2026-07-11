import 'package:flutter/material.dart';

import '../models/avaliacao.dart';
import '../models/prestador.dart';
import '../theme/tema.dart';
import '../widgets/avatar_prestador.dart';
import '../widgets/estrelas.dart';
import 'tela_avaliar.dart';

/// Perfil completo do prestador: reputação, sobre, catálogo e avaliações.
///
/// É Stateful porque a lista de avaliações pode mudar quando o cliente
/// deixa uma nova avaliação.
class TelaPrestador extends StatefulWidget {
  final Prestador prestador;

  const TelaPrestador({super.key, required this.prestador});

  @override
  State<TelaPrestador> createState() => _TelaPrestadorState();
}

class _TelaPrestadorState extends State<TelaPrestador> {
  Prestador get p => widget.prestador;

  /// Abre a tela de avaliar e, se o cliente enviar, adiciona à lista.
  Future<void> _avaliar() async {
    final nova = await Navigator.of(context).push<Avaliacao>(
      MaterialPageRoute(
        builder: (_) => TelaAvaliar(nomePrestador: p.nome),
      ),
    );
    if (nova != null) {
      setState(() => p.avaliacoes.insert(0, nova));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Obrigado pela avaliação! ⭐')),
        );
      }
    }
  }

  void _contratar() {
    // Numa próxima etapa: abrir chat interno ou WhatsApp.
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Solicitação enviada para ${p.nome} (em breve)')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final semAvaliacao = p.totalAvaliacoes == 0;

    return Scaffold(
      appBar: AppBar(title: Text(p.nome)),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          // ----- Cabeçalho com foto, nome, nota -----
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                AvatarPrestador(prestador: p, raio: 44),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      p.nome,
                      style: const TextStyle(
                          fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    if (p.verificado) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.verified, color: Tema.verde, size: 20),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  p.especialidade,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[700]),
                ),
                const SizedBox(height: 8),
                if (semAvaliacao)
                  Text('Sem avaliações ainda',
                      style: TextStyle(color: Colors.grey[600]))
                else
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Estrelas(nota: p.mediaEstrelas, tamanho: 22),
                      const SizedBox(width: 8),
                      Text(
                        '${p.mediaEstrelas.toStringAsFixed(1)} · '
                        '${p.totalAvaliacoes} avaliações',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.grey[500]),
                    const SizedBox(width: 2),
                    Text(p.cidade,
                        style: TextStyle(color: Colors.grey[600])),
                  ],
                ),
              ],
            ),
          ),

          // ----- Sobre -----
          _Secao(
            titulo: 'Sobre',
            child: Text(p.sobre, style: const TextStyle(height: 1.4)),
          ),

          // ----- Catálogo de trabalhos -----
          _Secao(
            titulo: 'Trabalhos realizados',
            child: p.catalogo.isEmpty
                ? Text('Este profissional ainda não adicionou fotos.',
                    style: TextStyle(color: Colors.grey[600]))
                : SizedBox(
                    height: 110,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: p.catalogo.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (_, i) => ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          p.catalogo[i],
                          width: 140,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
          ),

          // ----- Avaliações -----
          _Secao(
            titulo: 'Avaliações',
            child: semAvaliacao
                ? Text('Seja o primeiro a avaliar!',
                    style: TextStyle(color: Colors.grey[600]))
                : Column(
                    children: p.avaliacoes
                        .map((a) => _AvaliacaoItem(avaliacao: a))
                        .toList(),
                  ),
          ),
        ],
      ),

      // ----- Botões de ação fixos embaixo -----
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _avaliar,
                  icon: const Icon(Icons.star_outline),
                  label: const Text('Avaliar'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                    foregroundColor: Tema.verde,
                    side: const BorderSide(color: Tema.verde),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _contratar,
                  icon: const Icon(Icons.chat_bubble_outline),
                  label: const Text('Contratar'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Bloco de conteúdo com um título, separado por um cartão branco.
class _Secao extends StatelessWidget {
  final String titulo;
  final Widget child;

  const _Secao({required this.titulo, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(titulo,
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}

/// Uma avaliação exibida na lista (nome, estrelas, comentário).
class _AvaliacaoItem extends StatelessWidget {
  final Avaliacao avaliacao;

  const _AvaliacaoItem({required this.avaliacao});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(avaliacao.nomeCliente,
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              const Spacer(),
              Estrelas(nota: avaliacao.estrelas.toDouble(), tamanho: 15),
            ],
          ),
          if (avaliacao.comentario.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(avaliacao.comentario,
                style: TextStyle(color: Colors.grey[800], height: 1.3)),
          ],
        ],
      ),
    );
  }
}
