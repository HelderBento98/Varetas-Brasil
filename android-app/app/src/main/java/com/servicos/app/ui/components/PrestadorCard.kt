@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.servicos.app.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.servicos.app.model.Prestador
import com.servicos.app.ui.theme.Verde

/** Cartão que resume um prestador numa lista (avatar, nome, nota, cidade). */
@Composable
fun PrestadorCard(
    prestador: Prestador,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val semAvaliacao = prestador.totalAvaliacoes == 0

    Card(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.Top,
        ) {
            AvatarPrestador(prestador = prestador, tamanho = 60.dp)
            Spacer(Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = prestador.nome,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false),
                    )
                    if (prestador.verificado) {
                        Spacer(Modifier.width(4.dp))
                        Icon(
                            Icons.Filled.Verified,
                            contentDescription = "Verificado",
                            tint = Verde,
                            modifier = Modifier.size(16.dp),
                        )
                    }
                }
                Text(
                    text = prestador.especialidade,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.size(6.dp))

                if (semAvaliacao) {
                    Text(
                        text = "Novo no app",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        fontStyle = FontStyle.Italic,
                    )
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Estrelas(nota = prestador.mediaEstrelas, tamanho = 15.dp)
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = "%.1f (%d)".format(
                                prestador.mediaEstrelas,
                                prestador.totalAvaliacoes,
                            ),
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }

                Spacer(Modifier.size(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Filled.LocationOn,
                        contentDescription = null,
                        tint = Color.Gray,
                        modifier = Modifier.size(14.dp),
                    )
                    Spacer(Modifier.width(2.dp))
                    Text(
                        text = prestador.cidade,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                    )
                }
            }

            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = Color.LightGray,
            )
        }
    }
}
