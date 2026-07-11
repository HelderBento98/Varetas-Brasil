package com.servicos.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val EsquemaCores = lightColorScheme(
    primary = Verde,
    onPrimary = Color.White,
    secondary = VerdeEscuro,
    background = Fundo,
    surface = Color.White,
)

/// Envolve o app inteiro com as cores e a tipografia definidas.
@Composable
fun ServicosTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = EsquemaCores,
        typography = Typography(),
        content = content,
    )
}
