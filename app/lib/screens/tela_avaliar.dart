import 'package:flutter/material.dart';

import '../models/avaliacao.dart';
import '../widgets/estrelas.dart';

/// Tela onde o cliente dá uma nota de 1 a 5 e escreve um comentário.
///
/// Ao enviar, devolve um objeto [Avaliacao] para a tela anterior.
class TelaAvaliar extends StatefulWidget {
  final String nomePrestador;

  const TelaAvaliar({super.key, required this.nomePrestador});

  @override
  State<TelaAvaliar> createState() => _TelaAvaliarState();
}

class _TelaAvaliarState extends State<TelaAvaliar> {
  int _estrelas = 0;
  final _comentarioCtrl = TextEditingController();
  final _nomeCtrl = TextEditingController();

  @override
  void dispose() {
    _comentarioCtrl.dispose();
    _nomeCtrl.dispose();
    super.dispose();
  }

  void _enviar() {
    if (_estrelas == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Escolha de 1 a 5 estrelas')),
      );
      return;
    }
    final nome = _nomeCtrl.text.trim();
    final avaliacao = Avaliacao(
      nomeCliente: nome.isEmpty ? 'Anônimo' : nome,
      estrelas: _estrelas,
      comentario: _comentarioCtrl.text.trim(),
      data: DateTime.now(),
    );
    Navigator.of(context).pop(avaliacao);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Avaliar serviço')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Como foi o serviço de ${widget.nomePrestador}?',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          EstrelasSeletor(
            valor: _estrelas,
            onSelecionar: (n) => setState(() => _estrelas = n),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _nomeCtrl,
            decoration: const InputDecoration(
              labelText: 'Seu nome (opcional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _comentarioCtrl,
            minLines: 3,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Conte como foi (opcional)',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _enviar,
            child: const Text('Enviar avaliação'),
          ),
        ],
      ),
    );
  }
}
