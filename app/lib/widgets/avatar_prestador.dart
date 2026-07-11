import 'package:flutter/material.dart';

import '../models/prestador.dart';
import '../theme/tema.dart';

/// Foto do prestador. Se não tiver foto, mostra um círculo com a inicial.
class AvatarPrestador extends StatelessWidget {
  final Prestador prestador;
  final double raio;

  const AvatarPrestador({super.key, required this.prestador, this.raio = 28});

  @override
  Widget build(BuildContext context) {
    final temFoto = prestador.fotoUrl != null && prestador.fotoUrl!.isNotEmpty;

    return CircleAvatar(
      radius: raio,
      backgroundColor: Tema.verde.withOpacity(0.15),
      backgroundImage: temFoto ? NetworkImage(prestador.fotoUrl!) : null,
      child: temFoto
          ? null
          : Text(
              prestador.inicial,
              style: TextStyle(
                fontSize: raio * 0.8,
                fontWeight: FontWeight.bold,
                color: Tema.verdeEscuro,
              ),
            ),
    );
  }
}
