/// Uma avaliação que um cliente deixou para um prestador.
class Avaliacao {
  final String nomeCliente;
  final int estrelas; // de 1 a 5
  final String comentario;
  final DateTime data;

  const Avaliacao({
    required this.nomeCliente,
    required this.estrelas,
    required this.comentario,
    required this.data,
  });
}
