package com.servicos.app.model

/** Uma avaliação que um cliente deixou para um prestador. */
data class Avaliacao(
    val nomeCliente: String,
    val estrelas: Int, // de 1 a 5
    val comentario: String,
)
