import 'package:flutter/material.dart';

import '../models/categoria.dart';
import '../models/prestador.dart';
import '../models/avaliacao.dart';

/// Dados de EXEMPLO (mock), guardados só na memória do app.
///
/// Serve para desenvolver e testar as telas sem precisar de um servidor.
/// Mais pra frente isso será substituído por um back-end de verdade
/// (Firebase, Supabase ou uma API própria).
class DadosMock {
  /// Categorias de serviço exibidas na tela inicial.
  static const List<Categoria> categorias = [
    Categoria(id: 'pedreiro', nome: 'Pedreiro', icone: Icons.construction),
    Categoria(id: 'eletricista', nome: 'Eletricista', icone: Icons.electrical_services),
    Categoria(id: 'encanador', nome: 'Encanador', icone: Icons.plumbing),
    Categoria(id: 'pintor', nome: 'Pintor', icone: Icons.format_paint),
    Categoria(id: 'marceneiro', nome: 'Marceneiro', icone: Icons.carpenter),
    Categoria(id: 'jardineiro', nome: 'Jardineiro', icone: Icons.grass),
    Categoria(id: 'refrigeracao', nome: 'Refrigeração', icone: Icons.ac_unit),
    Categoria(id: 'diarista', nome: 'Diarista', icone: Icons.cleaning_services),
    Categoria(id: 'chaveiro', nome: 'Chaveiro', icone: Icons.vpn_key),
    Categoria(id: 'mudanca', nome: 'Mudança', icone: Icons.local_shipping),
  ];

  /// Prestadores de exemplo. A lista é `final` (não const) porque as
  /// avaliações podem crescer enquanto o app roda.
  static final List<Prestador> prestadores = [
    Prestador(
      id: 'p1',
      nome: 'Carlos Andrade',
      categoriaId: 'eletricista',
      especialidade: 'Instalações elétricas residenciais e comerciais',
      cidade: 'São Paulo, SP',
      sobre:
          'Eletricista há 15 anos. Atendo emergências, troca de fiação, '
          'instalação de chuveiros, tomadas e quadros de luz. Orçamento gratuito.',
      verificado: true,
      avaliacoes: [
        Avaliacao(
          nomeCliente: 'Marina',
          estrelas: 5,
          comentario: 'Serviço impecável e muito pontual. Recomendo!',
          data: DateTime(2026, 6, 20),
        ),
        Avaliacao(
          nomeCliente: 'Roberto',
          estrelas: 5,
          comentario: 'Resolveu um curto que ninguém achava. Profissional!',
          data: DateTime(2026, 5, 12),
        ),
        Avaliacao(
          nomeCliente: 'Ana Paula',
          estrelas: 4,
          comentario: 'Bom trabalho, só atrasou um pouquinho.',
          data: DateTime(2026, 4, 3),
        ),
      ],
    ),
    Prestador(
      id: 'p2',
      nome: 'José Marceneiro',
      categoriaId: 'marceneiro',
      especialidade: 'Móveis planejados sob medida',
      cidade: 'Campinas, SP',
      sobre:
          'Faço armários, estantes, cozinhas planejadas e restauração de '
          'móveis antigos. Trabalho com MDF e madeira maciça.',
      verificado: true,
      avaliacoes: [
        Avaliacao(
          nomeCliente: 'Fernanda',
          estrelas: 5,
          comentario: 'Meu closet ficou perfeito, acabamento de primeira.',
          data: DateTime(2026, 6, 1),
        ),
        Avaliacao(
          nomeCliente: 'Lucas',
          estrelas: 5,
          comentario: 'Caprichoso e caprichoso. Valeu cada centavo.',
          data: DateTime(2026, 3, 18),
        ),
      ],
    ),
    Prestador(
      id: 'p3',
      nome: 'Dona Cida',
      categoriaId: 'diarista',
      especialidade: 'Limpeza residencial e pós-obra',
      cidade: 'São Paulo, SP',
      sobre:
          'Diarista experiente, caprichosa e de confiança. Faço faxina '
          'pesada, limpeza pós-obra e organização de armários.',
      avaliacoes: [
        Avaliacao(
          nomeCliente: 'Patrícia',
          estrelas: 5,
          comentario: 'Deixou a casa brilhando! Super atenciosa.',
          data: DateTime(2026, 6, 28),
        ),
      ],
    ),
    Prestador(
      id: 'p4',
      nome: 'Antônio Pintor',
      categoriaId: 'pintor',
      especialidade: 'Pintura residencial e textura',
      cidade: 'Guarulhos, SP',
      sobre:
          'Pintura interna e externa, textura, grafiato e pequenos reparos. '
          'Uso tinta de qualidade e protejo todos os móveis.',
      avaliacoes: [
        Avaliacao(
          nomeCliente: 'Diego',
          estrelas: 4,
          comentario: 'Ficou muito bom, ambiente limpo no fim.',
          data: DateTime(2026, 5, 22),
        ),
        Avaliacao(
          nomeCliente: 'Juliana',
          estrelas: 3,
          comentario: 'Bom, mas precisei chamar de novo pra retoque.',
          data: DateTime(2026, 2, 9),
        ),
      ],
    ),
    Prestador(
      id: 'p5',
      nome: 'Seu Manuel',
      categoriaId: 'pedreiro',
      especialidade: 'Reformas, alvenaria e assentamento',
      cidade: 'Osasco, SP',
      sobre:
          'Pedreiro com 20 anos de estrada. Reformas em geral, assentamento '
          'de piso e azulejo, muros e pequenas construções.',
      verificado: true,
      avaliacoes: [
        Avaliacao(
          nomeCliente: 'Ricardo',
          estrelas: 5,
          comentario: 'Trabalho limpo e caprichado, prazo cumprido.',
          data: DateTime(2026, 6, 15),
        ),
      ],
    ),
    Prestador(
      id: 'p6',
      nome: 'Paulo Refrigeração',
      categoriaId: 'refrigeracao',
      especialidade: 'Instalação e manutenção de ar-condicionado',
      cidade: 'São Paulo, SP',
      sobre:
          'Instalação, limpeza e conserto de ar-condicionado split e janela. '
          'Atendimento rápido e garantia no serviço.',
      avaliacoes: [],
    ),
  ];

  /// Retorna os prestadores de uma categoria, dos mais bem avaliados
  /// para os menos avaliados.
  static List<Prestador> prestadoresDaCategoria(String categoriaId) {
    final lista = prestadores
        .where((p) => p.categoriaId == categoriaId)
        .toList();
    lista.sort((a, b) => b.mediaEstrelas.compareTo(a.mediaEstrelas));
    return lista;
  }

  /// Nome de uma categoria a partir do seu id (para exibir em títulos).
  static String nomeCategoria(String categoriaId) {
    return categorias
        .firstWhere(
          (c) => c.id == categoriaId,
          orElse: () => const Categoria(
            id: '',
            nome: 'Serviço',
            icone: Icons.handyman,
          ),
        )
        .nome;
  }
}
