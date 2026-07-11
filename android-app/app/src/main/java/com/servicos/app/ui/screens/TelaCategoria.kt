@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.servicos.app.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.SearchOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.servicos.app.data.DadosMock
import com.servicos.app.ui.components.PrestadorCard
import com.servicos.app.ui.theme.Verde

/** Lista os prestadores de uma categoria, do melhor avaliado ao pior. */
@Composable
fun TelaCategoria(
    categoriaId: String,
    onVoltar: () -> Unit,
    onPrestador: (String) -> Unit,
) {
    val categoria = DadosMock.categoriaPorId(categoriaId)
    val prestadores = DadosMock.prestadoresDaCategoria(categoriaId)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(categoria?.nome ?: "Serviços") },
                navigationIcon = {
                    IconButton(onClick = onVoltar) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Verde,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                ),
            )
        },
    ) { padding ->
        if (prestadores.isEmpty()) {
            VazioAinda(
                nomeCategoria = categoria?.nome ?: "serviço",
                modifier = Modifier.padding(padding),
            )
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = PaddingValues(vertical = 8.dp),
            ) {
                items(prestadores, key = { it.id }) { prestador ->
                    PrestadorCard(
                        prestador = prestador,
                        onClick = { onPrestador(prestador.id) },
                    )
                }
            }
        }
    }
}

/** Mensagem amigável quando ainda não há prestadores na categoria. */
@Composable
private fun VazioAinda(nomeCategoria: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center,
    ) {
        Icon(
            Icons.Filled.SearchOff,
            contentDescription = null,
            tint = Color.LightGray,
            modifier = Modifier.size(64.dp),
        )
        Text(
            text = "Ainda não temos profissionais de $nomeCategoria por aqui.",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 16.dp),
        )
    }
}
