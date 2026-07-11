// Arquivo de build da raiz do projeto.
// Declara os plugins que os módulos podem usar (mas não aplica aqui).
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
