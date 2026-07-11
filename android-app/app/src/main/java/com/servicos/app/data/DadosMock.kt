package com.servicos.app.data

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AcUnit
import androidx.compose.material.icons.filled.Carpenter
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Construction
import androidx.compose.material.icons.filled.ElectricalServices
import androidx.compose.material.icons.filled.FormatPaint
import androidx.compose.material.icons.filled.Grass
import androidx.compose.material.icons.filled.Handyman
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Plumbing
import androidx.compose.material.icons.filled.VpnKey
import com.servicos.app.model.Avaliacao
import com.servicos.app.model.Categoria
import com.servicos.app.model.Prestador

/**
 * Dados de EXEMPLO (mock), guardados só na memória do app.
 *
 * Serve para desenvolver e testar as telas sem precisar de um servidor.
 * Mais pra frente isso será substituído por um back-end de verdade
 * (Firebase, Supabase ou uma API própria).
 */
object DadosMock {

    val categorias = listOf(
        Categoria("pedreiro", "Pedreiro", Icons.Filled.Construction),
        Categoria("eletricista", "Eletricista", Icons.Filled.ElectricalServices),
        Categoria("encanador", "Encanador", Icons.Filled.Plumbing),
        Categoria("pintor", "Pintor", Icons.Filled.FormatPaint),
        Categoria("marceneiro", "Marceneiro", Icons.Filled.Carpenter),
        Categoria("jardineiro", "Jardineiro", Icons.Filled.Grass),
        Categoria("refrigeracao", "Refrigeração", Icons.Filled.AcUnit),
        Categoria("diarista", "Diarista", Icons.Filled.CleaningServices),
        Categoria("chaveiro", "Chaveiro", Icons.Filled.VpnKey),
        Categoria("mudanca", "Mudança", Icons.Filled.LocalShipping),
    )

    val prestadores = listOf(
        Prestador(
            id = "p1",
            nome = "Carlos Andrade",
            categoriaId = "eletricista",
            especialidade = "Instalações elétricas residenciais e comerciais",
            cidade = "São Paulo, SP",
            sobre = "Eletricista há 15 anos. Atendo emergências, troca de fiação, " +
                "instalação de chuveiros, tomadas e quadros de luz. Orçamento gratuito.",
            verificado = true,
            avaliacoesIniciais = listOf(
                Avaliacao("Marina", 5, "Serviço impecável e muito pontual. Recomendo!"),
                Avaliacao("Roberto", 5, "Resolveu um curto que ninguém achava. Profissional!"),
                Avaliacao("Ana Paula", 4, "Bom trabalho, só atrasou um pouquinho."),
            ),
        ),
        Prestador(
            id = "p2",
            nome = "José Marceneiro",
            categoriaId = "marceneiro",
            especialidade = "Móveis planejados sob medida",
            cidade = "Campinas, SP",
            sobre = "Faço armários, estantes, cozinhas planejadas e restauração de " +
                "móveis antigos. Trabalho com MDF e madeira maciça.",
            verificado = true,
            avaliacoesIniciais = listOf(
                Avaliacao("Fernanda", 5, "Meu closet ficou perfeito, acabamento de primeira."),
                Avaliacao("Lucas", 5, "Caprichoso e pontual. Valeu cada centavo."),
            ),
        ),
        Prestador(
            id = "p3",
            nome = "Dona Cida",
            categoriaId = "diarista",
            especialidade = "Limpeza residencial e pós-obra",
            cidade = "São Paulo, SP",
            sobre = "Diarista experiente, caprichosa e de confiança. Faço faxina " +
                "pesada, limpeza pós-obra e organização de armários.",
            avaliacoesIniciais = listOf(
                Avaliacao("Patrícia", 5, "Deixou a casa brilhando! Super atenciosa."),
            ),
        ),
        Prestador(
            id = "p4",
            nome = "Antônio Pintor",
            categoriaId = "pintor",
            especialidade = "Pintura residencial e textura",
            cidade = "Guarulhos, SP",
            sobre = "Pintura interna e externa, textura, grafiato e pequenos reparos. " +
                "Uso tinta de qualidade e protejo todos os móveis.",
            avaliacoesIniciais = listOf(
                Avaliacao("Diego", 4, "Ficou muito bom, ambiente limpo no fim."),
                Avaliacao("Juliana", 3, "Bom, mas precisei chamar de novo pra retoque."),
            ),
        ),
        Prestador(
            id = "p5",
            nome = "Seu Manuel",
            categoriaId = "pedreiro",
            especialidade = "Reformas, alvenaria e assentamento",
            cidade = "Osasco, SP",
            sobre = "Pedreiro com 20 anos de estrada. Reformas em geral, assentamento " +
                "de piso e azulejo, muros e pequenas construções.",
            verificado = true,
            avaliacoesIniciais = listOf(
                Avaliacao("Ricardo", 5, "Trabalho limpo e caprichado, prazo cumprido."),
            ),
        ),
        Prestador(
            id = "p6",
            nome = "Paulo Refrigeração",
            categoriaId = "refrigeracao",
            especialidade = "Instalação e manutenção de ar-condicionado",
            cidade = "São Paulo, SP",
            sobre = "Instalação, limpeza e conserto de ar-condicionado split e janela. " +
                "Atendimento rápido e garantia no serviço.",
        ),
    )

    /** Prestadores de uma categoria, do mais bem avaliado para o menos. */
    fun prestadoresDaCategoria(categoriaId: String): List<Prestador> =
        prestadores
            .filter { it.categoriaId == categoriaId }
            .sortedByDescending { it.mediaEstrelas }

    /** Todos os prestadores ordenados pela nota (para os "destaques"). */
    fun destaques(): List<Prestador> =
        prestadores.sortedByDescending { it.mediaEstrelas }

    fun prestadorPorId(id: String): Prestador? =
        prestadores.firstOrNull { it.id == id }

    fun categoriaPorId(id: String): Categoria? =
        categorias.firstOrNull { it.id == id }

    /** Ícone genérico usado quando a categoria não é encontrada. */
    val iconePadrao = Icons.Filled.Handyman
}
