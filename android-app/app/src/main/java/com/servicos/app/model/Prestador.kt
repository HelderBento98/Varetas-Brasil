package com.servicos.app.model

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.snapshots.SnapshotStateList

/**
 * Um prestador de serviço cadastrado no app.
 *
 * A lista [avaliacoes] é uma SnapshotStateList: quando um cliente adiciona
 * uma avaliação nova, as telas que mostram esse prestador se atualizam sozinhas.
 */
class Prestador(
    val id: String,
    val nome: String,
    val categoriaId: String,
    val especialidade: String,
    val cidade: String,
    val sobre: String,
    val verificado: Boolean = false,
    val catalogo: List<String> = emptyList(),
    avaliacoesIniciais: List<Avaliacao> = emptyList(),
) {
    val avaliacoes: SnapshotStateList<Avaliacao> =
        mutableStateListOf<Avaliacao>().apply { addAll(avaliacoesIniciais) }

    val totalAvaliacoes: Int
        get() = avaliacoes.size

    /** Média das estrelas (0.0 se ainda não tem avaliações). */
    val mediaEstrelas: Double
        get() = if (avaliacoes.isEmpty()) 0.0
        else avaliacoes.sumOf { it.estrelas }.toDouble() / avaliacoes.size

    /** Primeira letra do nome, usada no avatar quando não há foto. */
    val inicial: String
        get() = nome.firstOrNull()?.uppercase() ?: "?"
}
