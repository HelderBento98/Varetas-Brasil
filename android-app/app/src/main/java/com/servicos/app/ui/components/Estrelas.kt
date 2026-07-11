package com.servicos.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material.icons.filled.StarHalf
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.servicos.app.ui.theme.Ambar

/** Mostra uma nota em estrelas (só leitura), com meia estrela quando precisa. */
@Composable
fun Estrelas(nota: Double, tamanho: Dp = 18.dp) {
    Row {
        for (i in 0 until 5) {
            val icone = when {
                nota >= i + 1 -> Icons.Filled.Star
                nota >= i + 0.5 -> Icons.Filled.StarHalf
                else -> Icons.Filled.StarBorder
            }
            Icon(
                imageVector = icone,
                contentDescription = null,
                tint = Ambar,
                modifier = Modifier.size(tamanho),
            )
        }
    }
}

/**
 * Estrelas em que o usuário TOCA para dar uma nota de 1 a 5.
 * Avisa a tela pai pelo [onSelecionar] sempre que o valor muda.
 */
@Composable
fun EstrelasSeletor(
    valor: Int,
    onSelecionar: (Int) -> Unit,
    tamanho: Dp = 44.dp,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
    ) {
        for (n in 1..5) {
            IconButton(onClick = { onSelecionar(n) }) {
                Icon(
                    imageVector = if (n <= valor) Icons.Filled.Star else Icons.Filled.StarBorder,
                    contentDescription = "$n estrelas",
                    tint = Ambar,
                    modifier = Modifier.size(tamanho),
                )
            }
        }
    }
}
