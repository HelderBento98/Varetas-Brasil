import 'package:flutter/material.dart';

import '../models/prestador.dart';
import '../theme/tema.dart';
import 'avatar_prestador.dart';
import 'estrelas.dart';

/// Cartão que resume um prestador numa lista (foto, nome, nota, cidade).
class PrestadorCard extends StatelessWidget {
  final Prestador prestador;
  final VoidCallback onTap;

  const PrestadorCard({
    super.key,
    required this.prestador,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final semAvaliacao = prestador.totalAvaliacoes == 0;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AvatarPrestador(prestador: prestador, raio: 30),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            prestador.nome,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (prestador.verificado) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.verified,
                              size: 16, color: Tema.verde),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      prestador.especialidade,
                      style: TextStyle(color: Colors.grey[700], fontSize: 13),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (semAvaliacao)
                          Text(
                            'Novo no app',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                              fontStyle: FontStyle.italic,
                            ),
                          )
                        else ...[
                          Estrelas(nota: prestador.mediaEstrelas, tamanho: 15),
                          const SizedBox(width: 6),
                          Text(
                            '${prestador.mediaEstrelas.toStringAsFixed(1)} '
                            '(${prestador.totalAvaliacoes})',
                            style: TextStyle(
                              color: Colors.grey[700],
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on,
                            size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 2),
                        Text(
                          prestador.cidade,
                          style:
                              TextStyle(color: Colors.grey[600], fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }
}
