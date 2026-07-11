package com.servicos.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.servicos.app.ui.screens.TelaAvaliar
import com.servicos.app.ui.screens.TelaCategoria
import com.servicos.app.ui.screens.TelaInicial
import com.servicos.app.ui.screens.TelaPrestador
import com.servicos.app.ui.theme.ServicosTheme

/** Ponto de entrada do app Praja: mostra o tema e a navegação entre telas. */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ServicosTheme {
                AppNavegacao()
            }
        }
    }
}

/**
 * Controla o "ir e voltar" entre as telas.
 *
 * As telas trocam de uma para a outra passando apenas ids (da categoria ou
 * do prestador); os dados de verdade vêm do DadosMock a partir desse id.
 */
@Composable
fun AppNavegacao() {
    val nav = rememberNavController()

    NavHost(navController = nav, startDestination = "inicial") {
        composable("inicial") {
            TelaInicial(
                onCategoria = { id -> nav.navigate("categoria/$id") },
                onPrestador = { id -> nav.navigate("prestador/$id") },
            )
        }

        composable(
            route = "categoria/{categoriaId}",
            arguments = listOf(navArgument("categoriaId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("categoriaId").orEmpty()
            TelaCategoria(
                categoriaId = id,
                onVoltar = { nav.popBackStack() },
                onPrestador = { pid -> nav.navigate("prestador/$pid") },
            )
        }

        composable(
            route = "prestador/{prestadorId}",
            arguments = listOf(navArgument("prestadorId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("prestadorId").orEmpty()
            TelaPrestador(
                prestadorId = id,
                onVoltar = { nav.popBackStack() },
                onAvaliar = { nav.navigate("avaliar/$id") },
            )
        }

        composable(
            route = "avaliar/{prestadorId}",
            arguments = listOf(navArgument("prestadorId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("prestadorId").orEmpty()
            TelaAvaliar(
                prestadorId = id,
                onVoltar = { nav.popBackStack() },
                onEnviado = { nav.popBackStack() },
            )
        }
    }
}
