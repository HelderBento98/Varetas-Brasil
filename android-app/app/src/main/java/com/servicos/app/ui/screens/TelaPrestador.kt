@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.servicos.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.StarOutline
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.servicos.app.data.DadosMock
import com.servicos.app.model.Avaliacao
import com.servicos.app.model.Prestador
import com.servicos.app.ui.components.AvatarPrestador
import com.servicos.app.ui.components.Estrelas
import com.servicos.app.ui.theme.Verde

/** Perfil completo do prestador: reputação, sobre, catálogo e avaliações. */
@Composable
fun TelaPrestador(
    prestadorId: String,
    onVoltar: () -> Unit,
    onAvaliar: () -> Unit,
) {
    val prestador = DadosMock.prestadorPorId(prestadorId) ?: return
    val semAvaliacao = prestador.totalAvaliacoes == 0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(prestador.nome) },
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
        bottomBar = { BarraAcoes(prestador = prestador, onAvaliar = onAvaliar) },
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            // ----- Cabeçalho -----
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    AvatarPrestador(prestador = prestador, tamanho = 88.dp)
                    Spacer(Modifier.size(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = prestador.nome,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                        )
                        if (prestador.verificado) {
                            Spacer(Modifier.width(6.dp))
                            Icon(Icons.Filled.Verified, contentDescription = "Verificado", tint = Verde)
                        }
                    }
                    Text(
                        text = prestador.especialidade,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.size(8.dp))
                    if (semAvaliacao) {
                        Text("Sem avaliações ainda", color = Color.Gray)
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Estrelas(nota = prestador.mediaEstrelas, tamanho = 22.dp)
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = "%.1f · %d avaliações".format(
                                    prestador.mediaEstrelas,
                                    prestador.totalAvaliacoes,
                                ),
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                    }
                    Spacer(Modifier.size(6.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.LocationOn, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(2.dp))
                        Text(prestador.cidade, color = Color.Gray)
                    }
                }
            }

            // ----- Sobre -----
            item {
                Secao(titulo = "Sobre") {
                    Text(prestador.sobre, style = MaterialTheme.typography.bodyMedium)
                }
            }

            // ----- Catálogo -----
            item {
                Secao(titulo = "Trabalhos realizados") {
                    Text(
                        text = "Este profissional ainda não adicionou fotos.",
                        color = Color.Gray,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }

            // ----- Avaliações -----
            item {
                Secao(titulo = "Avaliações") {
                    if (semAvaliacao) {
                        Text("Seja o primeiro a avaliar!", color = Color.Gray)
                    } else {
                        Column {
                            prestador.avaliacoes.forEach { AvaliacaoItem(it) }
                        }
                    }
                }
            }
        }
    }
}

/** Barra fixa embaixo com os botões Avaliar e Contratar. */
@Composable
private fun BarraAcoes(prestador: Prestador, onAvaliar: () -> Unit) {
    Row(
        modifier = Modifier
            .background(Color.White)
            .fillMaxWidth()
            .padding(12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        OutlinedButton(
            onClick = onAvaliar,
            modifier = Modifier.weight(1f),
        ) {
            Icon(Icons.Filled.StarOutline, contentDescription = null)
            Spacer(Modifier.width(6.dp))
            Text("Avaliar")
        }
        Button(
            onClick = { /* Em breve: chat interno ou WhatsApp */ },
            colors = ButtonDefaults.buttonColors(containerColor = Verde),
            modifier = Modifier.weight(1f),
        ) {
            Icon(Icons.Filled.ChatBubbleOutline, contentDescription = null)
            Spacer(Modifier.width(6.dp))
            Text("Contratar")
        }
    }
}

/** Bloco de conteúdo com título, sobre um fundo branco. */
@Composable
private fun Secao(titulo: String, conteudo: @Composable () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 10.dp)
            .background(Color.White)
            .padding(16.dp),
    ) {
        Text(titulo, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.size(10.dp))
        conteudo()
    }
}

/** Uma avaliação exibida na lista (nome, estrelas, comentário). */
@Composable
private fun AvaliacaoItem(avaliacao: Avaliacao) {
    Column(modifier = Modifier.padding(bottom = 14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(avaliacao.nomeCliente, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.weight(1f))
            Estrelas(nota = avaliacao.estrelas.toDouble(), tamanho = 15.dp)
        }
        if (avaliacao.comentario.isNotEmpty()) {
            Spacer(Modifier.size(4.dp))
            Text(avaliacao.comentario, color = Color.DarkGray, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
