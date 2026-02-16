import type { ReactNode } from 'react';
import { Header } from './Header';
import { ViewTabs } from './ViewTabs';
import { LayerPanel } from '../panels/LayerPanel';
import { PanelContainer } from '../panels/PanelContainer';
import { LogPanel } from '../panels/LogPanel';
import { FinancialPanel } from '../panels/FinancialPanel';
import { MetricsPanel } from '../panels/MetricsPanel';
import { QuickActionsPanel } from '../panels/QuickActionsPanel';
import { CompanyLogView } from '../panels/CompanyLogView';
import { useGameStore } from '@/store/gameStore';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentView, showCompanyLog, setShowCompanyLog } = useGameStore();
  const showTimeline = currentView === 'dashboard';

  return (
    <div className="crt-container flex flex-col h-screen w-screen bg-terminal overflow-hidden">
      {/* Header */}
      <Header />

      {/* View Navigation Tabs */}
      <ViewTabs />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Only show on dashboard */}
        {showTimeline && (
          <aside className="w-48 flex-none border-r border-terminal-green-dark bg-terminal-dark overflow-y-auto">
            <LayerPanel />
          </aside>
        )}

        {/* Center Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Timeline or Page Content */}
          <div className="flex-1 overflow-auto p-4">{children}</div>

          {/* Bottom Panels - Only show on dashboard */}
          {showTimeline && (
            <div className="h-96 flex-none border-t border-terminal-green-dark bg-terminal-dark">
              <div className="h-full grid grid-cols-4 divide-x divide-terminal-green-dark">
                <PanelContainer title="COMPANY LOG" defaultOpen={true}>
                  <LogPanel />
                </PanelContainer>
                <PanelContainer title="FINANCIALS" defaultOpen={true}>
                  <FinancialPanel />
                </PanelContainer>
                <PanelContainer title="METRICS" defaultOpen={true}>
                  <MetricsPanel />
                </PanelContainer>
                <PanelContainer title="QUICK ACTIONS" defaultOpen={true}>
                  <QuickActionsPanel />
                </PanelContainer>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Company Log Full View */}
      <CompanyLogView open={showCompanyLog} onOpenChange={setShowCompanyLog} />
    </div>
  );
}

export default AppLayout;
