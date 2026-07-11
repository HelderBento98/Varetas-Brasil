package com.servicos.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.servicos.app.model.Prestador
import com.servicos.app.ui.theme.Verde
import com.servicos.app.ui.theme.VerdeEscuro

/**
 * Avatar do prestador. Como ainda não temos fotos reais, mostra um círculo
 * verde com a inicial do nome. (Depois dá para carregar a foto de verdade.)
 */
@Composable
fun AvatarPrestador(prestador: Prestador, tamanho: Dp = 56.dp) {
    Box(
        modifier = Modifier
            .size(tamanho)
            .clip(CircleShape)
            .background(Verde.copy(alpha = 0.15f)),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = prestador.inicial,
            fontSize = (tamanho.value * 0.4f).sp,
            fontWeight = FontWeight.Bold,
            color = VerdeEscuro,
        )
    }
}
