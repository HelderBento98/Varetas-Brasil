import 'package:flutter/material.dart';

/// Aparência (cores, fontes, estilos) do app, num lugar só.
/// Mude aqui para trocar a identidade visual do app inteiro.
class Tema {
  // Cores da marca
  static const Color verde = Color(0xFF1E8E5A); // cor principal (ações, topo)
  static const Color verdeEscuro = Color(0xFF15693F);
  static const Color ambar = Color(0xFFFFB300); // cor das estrelas
  static const Color fundo = Color(0xFFF6F7F9);

  static ThemeData get claro {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: verde,
        primary: verde,
      ),
      scaffoldBackgroundColor: fundo,
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: verde,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: verde,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
