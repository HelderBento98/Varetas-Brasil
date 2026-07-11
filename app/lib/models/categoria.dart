import 'package:flutter/material.dart';

/// Uma categoria de serviço (ex: Pedreiro, Eletricista, Jardineiro).
class Categoria {
  final String id;
  final String nome;
  final IconData icone;

  const Categoria({
    required this.id,
    required this.nome,
    required this.icone,
  });
}
