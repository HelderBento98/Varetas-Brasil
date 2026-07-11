package com.servicos.app.model

import androidx.compose.ui.graphics.vector.ImageVector

/** Uma categoria de serviço (ex: Pedreiro, Eletricista, Jardineiro). */
data class Categoria(
    val id: String,
    val nome: String,
    val icone: ImageVector,
)
