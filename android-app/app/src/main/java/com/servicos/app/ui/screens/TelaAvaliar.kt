@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.servicos.app.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.servicos.app.data.DadosMock
import com.servicos.app.model.Avaliacao
import com.servicos.app.ui.components.EstrelasSeletor
import com.servicos.app.ui.theme.Verde
import kotlinx.coroutines.launch

/**
 * Tela onde o cliente dá uma nota de 1 a 5 e escreve um comentário.
 * Ao enviar, a avaliação é adicionada ao prestador e voltamos para o perfil.
 */
@Composable
fun TelaAvaliar(
    prestadorId: String,
    onVoltar: () -> Unit,
    onEnviado: () -> Unit,
) {
    val prestador = DadosMock.prestadorPorId(prestadorId) ?: return

    var estrelas by remember { mutableIntStateOf(0) }
    var nome by remember { mutableStateOf("") }
    var comentario by remember { mutableStateOf("") }

    val snackbar = remember { SnackbarHostState() }
    val escopo = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Avaliar serviço") },
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
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
        ) {
            Text(
                text = "Como foi o serviço de ${prestador.nome}?",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.size(16.dp))

            EstrelasSeletor(valor = estrelas, onSelecionar = { estrelas = it })
            Spacer(Modifier.size(24.dp))

            OutlinedTextField(
                value = nome,
                onValueChange = { nome = it },
                label = { Text("Seu nome (opcional)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.size(16.dp))

            OutlinedTextField(
                value = comentario,
                onValueChange = { comentario = it },
                label = { Text("Conte como foi (opcional)") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.size(24.dp))

            Button(
                onClick = {
                    if (estrelas == 0) {
                        escopo.launch { snackbar.showMessage("Escolha de 1 a 5 estrelas") }
                    } else {
                        prestador.avaliacoes.add(
                            0,
                            Avaliacao(
                                nomeCliente = nome.trim().ifEmpty { "Anônimo" },
                                estrelas = estrelas,
                                comentario = comentario.trim(),
                            ),
                        )
                        onEnviado()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Verde),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Enviar avaliação", modifier = Modifier.padding(vertical = 4.dp))
            }
        }
    }
}

/** Pequeno atalho para mostrar uma mensagem na barra inferior. */
private suspend fun SnackbarHostState.showMessage(texto: String) {
    showSnackbar(texto)
}
