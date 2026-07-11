@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.servicos.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.servicos.app.data.DadosMock
import com.servicos.app.model.Categoria
import com.servicos.app.ui.components.PrestadorCard
import com.servicos.app.ui.theme.Verde

/** Tela de abertura: busca, grade de categorias e prestadores bem avaliados. */
@Composable
fun TelaInicial(
    onCategoria: (String) -> Unit,
    onPrestador: (String) -> Unit,
) {
    val destaques = DadosMock.destaques()

    Column {
        TopAppBar(
            title = { Text("O que você precisa hoje?") },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = Verde,
                titleContentColor = Color.White,
            ),
        )

        LazyColumn(contentPadding = PaddingValues(bottom = 24.dp)) {
            // Barra de busca (ainda visual)
            item {
                OutlinedTextField(
                    value = "",
                    onValueChange = {},
                    readOnly = true,
                    placeholder = { Text("Buscar serviço ou profissional...") },
                    leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                )
            }

            item { TituloSecao("Categorias") }

            // Grade de categorias em linhas de 4
            item {
                Column(modifier = Modifier.padding(horizontal = 12.dp)) {
                    DadosMock.categorias.chunked(4).forEach { linha ->
                        Row(modifier = Modifier.fillMaxWidth()) {
                            linha.forEach { categoria ->
                                Box(modifier = Modifier.weight(1f)) {
                                    CategoriaBotao(
                                        categoria = categoria,
                                        onClick = { onCategoria(categoria.id) },
                                    )
                                }
                            }
                            // completa a última linha para manter o alinhamento
                            repeat(4 - linha.size) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            item { TituloSecao("Bem avaliados") }

            items(destaques, key = { it.id }) { prestador ->
                PrestadorCard(
                    prestador = prestador,
                    onClick = { onPrestador(prestador.id) },
                )
            }
        }
    }
}

@Composable
private fun TituloSecao(texto: String) {
    Text(
        text = texto,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 4.dp),
    )
}

/** Um ícone de categoria clicável na grade. */
@Composable
private fun CategoriaBotao(categoria: Categoria, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .padding(4.dp)
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
            .padding(4.dp),
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.size(56.dp),
        ) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                Icon(categoria.icone, contentDescription = null, tint = Verde, modifier = Modifier.size(26.dp))
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(
            text = categoria.nome,
            style = MaterialTheme.typography.labelSmall,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
