/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoreProvider, useStore } from './store';
import { Header, BottomNav } from './components/LayoutControls';
import { HomeScreen } from './screens/Home';
import { NovaOSScreen } from './screens/NovaOS';
import { HistoricoScreen } from './screens/Historico';
import { ListaOSScreen } from './screens/ListaOS';
import { DetalhesOSScreen } from './screens/OSDetails';
import { CalendarioScreen } from './screens/Calendario';
import { AjustesScreen } from './screens/Ajustes';
import { ResumoDetalhadoScreen } from './screens/ResumoDetalhado';

function AppContent() {
  const { currentScreen } = useStore();

  return (
    <div className="w-full max-w-[440px] mx-auto h-[100dvh] bg-[#F2F2F7] relative shadow-2xl flex flex-col font-sans overflow-hidden pb-[80px]">
      <Header />
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {currentScreen === 'HOME' && <HomeScreen />}
        {currentScreen === 'NOVA_OS' && <NovaOSScreen />}
        {currentScreen === 'HISTORICO' && <HistoricoScreen />}
        {currentScreen === 'LISTA_OS' && <ListaOSScreen />}
        {currentScreen === 'DETALHES_OS' && <DetalhesOSScreen />}
        {currentScreen === 'CALENDARIO' && <CalendarioScreen />}
        {currentScreen === 'AJUSTES' && <AjustesScreen />}
        {currentScreen === 'RESUMO_DETALHADO' && <ResumoDetalhadoScreen />}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <AppContent />
      </div>
    </StoreProvider>
  );
}
