import 'avaliacao.dart';

/// Um prestador de serviço cadastrado no app.
class Prestador {
  final String id;
  final String nome;
  final String categoriaId;
  final String especialidade; // ex: "Instalações elétricas residenciais"
  final String cidade;
  final String sobre; // descrição livre do profissional
  final String? fotoUrl; // foto de perfil (null = usa avatar com inicial)
  final bool verificado; // selo de identidade verificada

  /// Fotos de trabalhos anteriores (o "catálogo" do profissional).
  final List<String> catalogo;

  /// Avaliações recebidas. A lista pode crescer quando o cliente avalia.
  final List<Avaliacao> avaliacoes;

  Prestador({
    required this.id,
    required this.nome,
    required this.categoriaId,
    required this.especialidade,
    required this.cidade,
    required this.sobre,
    this.fotoUrl,
    this.verificado = false,
    List<String>? catalogo,
    List<Avaliacao>? avaliacoes,
  })  : catalogo = catalogo ?? [],
        avaliacoes = avaliacoes ?? [];

  /// Média das estrelas (0 se ainda não tem avaliações).
  double get mediaEstrelas {
    if (avaliacoes.isEmpty) return 0;
    final soma = avaliacoes.fold<int>(0, (t, a) => t + a.estrelas);
    return soma / avaliacoes.length;
  }

  /// Quantidade de avaliações recebidas.
  int get totalAvaliacoes => avaliacoes.length;

  /// Primeira letra do nome, usada no avatar quando não há foto.
  String get inicial => nome.isNotEmpty ? nome[0].toUpperCase() : '?';
}
