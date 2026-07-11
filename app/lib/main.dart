import 'package:flutter/material.dart';

import 'screens/tela_inicial.dart';
import 'theme/tema.dart';

void main() {
  runApp(const ServicosApp());
}

/// Aplicativo que conecta prestadores de serviço e clientes.
class ServicosApp extends StatelessWidget {
  const ServicosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Serviços',
      debugShowCheckedModeBanner: false,
      theme: Tema.claro,
      home: const TelaInicial(),
    );
  }
}
