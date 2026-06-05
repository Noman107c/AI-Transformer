import { useState } from 'react';
import { useTransformerData } from './hooks/useTransformerData';
import { SidebarPage } from './types';
import OverviewPage from './components/pages/OverviewPage';
import HealthMonitoringPages from './components/pages/HealthMonitoringPages';
import MLAnalysisPages from './components/pages/MLAnalysisPages';
import RULPredictionPages from './components/pages/RULPredictionPages';
import MaintenancePages from './components/pages/MaintenancePages';
import AssetsPages from './components/pages/AssetsPages';
import EventsPages from './components/pages/EventsPages';

import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Eye,
  Info,
  LayoutDashboard,
  RefreshCw,
  Sliders,
  TrendingUp,
  Wrench,
  Zap
} from 'lucide-react';

export default function App() {
  const {
    dbData,
    transformers,
    isLoading,
    errorStatus,
    dataSource,
    alerts,
    maintenance,
    refresh
  } = useTransformerData();

  // Navigation pages tracking: default active page is 'overview'
  const [activePage, setActivePage] = useState<SidebarPage>('overview');

  // Multi-level collapsible folder states in sidebar
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    monitoring: true,
    ml: true,
    rul: true,
    maintenance: true,
    assets: true,
    events: true
  });

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  // Callback to quickly swap view from Overview page to Details page
  const handleSelectTransformer = (id: string) => {
    setActivePage('transformer-details');
  };

  // Helper function to render active page panel based on state selection
  const renderActiveViewport = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-4 font-mono select-none">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm">Connecting and hydrating data from Supabase...</p>
        </div>
      );
    }

    switch (activePage) {
      case 'overview':
        return (
          <OverviewPage
            transformers={transformers}
            alerts={alerts}
            maintenance={maintenance}
            dbDataLength={dbData.length}
            dataSource={dataSource}
            onSelectTransformer={handleSelectTransformer}
          />
        );

      // Health Monitoring sub-screens
      case 'real-time-monitor':
      case 'health-index':
      case 'key-parameters':
      case 'historical-trends':
      case 'alerts':
        return (
          <HealthMonitoringPages
            subPage={activePage}
            transformers={transformers}
            alerts={alerts}
            refresh={refresh}
          />
        );

      // ML Analysis sub-panels
      case 'model-performance':
      case 'feature-importance':
      case 'data-insights':
        return <MLAnalysisPages subPage={activePage} transformers={transformers} />;

      // RUL Prediction sub-panels
      case 'rul-dashboard':
      case 'prediction-trend':
      case 'transformer-rank':
        return (
          <RULPredictionPages
            subPage={activePage}
            transformers={transformers}
            onSelectTransformer={handleSelectTransformer}
          />
        );

      // Maintenance sub-panels
      case 'maintenance-history':
      case 'maintenance-plan':
      case 'upcoming-tasks':
        return <MaintenancePages subPage={activePage} maintenance={maintenance} />;

      // Assets sub-panels
      case 'all-transformers':
      case 'transformer-details':
      case 'asset-hierarchy':
        return (
          <AssetsPages
            subPage={activePage}
            transformers={transformers}
            onSelectTransformer={handleSelectTransformer}
          />
        );

      // Incidents sub-panels
      case 'outage-events':
      case 'short-circuits':
      case 'event-log':
        return <EventsPages subPage={activePage} transformers={transformers} />;

      default:
        return (
          <div className="text-slate-400 text-xs text-center py-10 font-mono">
            Unimplemented view segment state.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans antialiased text-sm">
      {/* Sidebar Frame Navigation */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto max-h-screen sticky top-0 scrollbar-none select-none">
        
        {/* Sidebar Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 border border-blue-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white leading-none">VoltGuard AI</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Operational Control</p>
          </div>
        </div>

        {/* Sidebar menu categories */}
        <nav className="p-4 flex-1 space-y-4">
          
          {/* Overview static button */}
          <button
            onClick={() => setActivePage('overview')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold tracking-wide transition uppercase ${
              activePage === 'overview'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/10'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4.5 h-4.5 text-blue-400" />
              Overview
            </span>
          </button>

          {/* Collapsible Section: Health Monitoring */}
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder('monitoring')}
              className="w-full flex items-center justify-between p-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Health Monitoring
              </span>
              {expandedFolders.monitoring ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {expandedFolders.monitoring && (
              <div className="pl-3 space-y-1 pt-1 border-l border-slate-900/80 ml-2">
                {[
                  { id: 'real-time-monitor', label: 'Real-time Monitor' },
                  { id: 'health-index', label: 'Health Index' },
                  { id: 'key-parameters', label: 'Key Parameters' },
                  { id: 'historical-trends', label: 'Historical Trends' },
                  { id: 'alerts', label: 'Alerts' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as SidebarPage)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition ${
                      activePage === item.id ? 'bg-slate-900 text-emerald-400 font-semibold' : 'text-slate-450 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section: ML Analysis */}
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder('ml')}
              className="w-full flex items-center justify-between p-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                ML Analysis
              </span>
              {expandedFolders.ml ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {expandedFolders.ml && (
              <div className="pl-3 space-y-1 pt-1 border-l border-slate-900/80 ml-2">
                {[
                  { id: 'model-performance', label: 'Model Performance' },
                  { id: 'feature-importance', label: 'Feature Importance' },
                  { id: 'data-insights', label: 'Data Insights' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as SidebarPage)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition ${
                      activePage === item.id ? 'bg-slate-900 text-violet-400 font-semibold' : 'text-slate-455 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section: RUL Prediction */}
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder('rul')}
              className="w-full flex items-center justify-between p-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                RUL Prediction
              </span>
              {expandedFolders.rul ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {expandedFolders.rul && (
              <div className="pl-3 space-y-1 pt-1 border-l border-slate-900/80 ml-2">
                {[
                  { id: 'rul-dashboard', label: 'RUL Dashboard' },
                  { id: 'prediction-trend', label: 'Prediction Trend' },
                  { id: 'transformer-rank', label: 'Transformer Rank' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as SidebarPage)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition ${
                      activePage === item.id ? 'bg-slate-900 text-amber-550 font-semibold' : 'text-slate-455 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section: Maintenance */}
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder('maintenance')}
              className="w-full flex items-center justify-between p-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                Maintenance
              </span>
              {expandedFolders.maintenance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {expandedFolders.maintenance && (
              <div className="pl-3 space-y-1 pt-1 border-l border-slate-900/80 ml-2">
                {[
                  { id: 'maintenance-history', label: 'Maintenance History' },
                  { id: 'maintenance-plan', label: 'Maintenance Plan' },
                  { id: 'upcoming-tasks', label: 'Upcoming Tasks' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as SidebarPage)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition ${
                      activePage === item.id ? 'bg-slate-900 text-blue-400 font-semibold' : 'text-slate-455 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section: Assets */}
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder('assets')}
              className="w-full flex items-center justify-between p-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Assets
              </span>
              {expandedFolders.assets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {expandedFolders.assets && (
              <div className="pl-3 space-y-1 pt-1 border-l border-slate-900/80 ml-2">
                {[
                  { id: 'all-transformers', label: 'All Transformers' },
                  { id: 'transformer-details', label: 'Transformer Details' },
                  { id: 'asset-hierarchy', label: 'Asset Hierarchy' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as SidebarPage)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition ${
                      activePage === item.id ? 'bg-slate-900 text-indigo-400 font-semibold' : 'text-slate-455 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section: Events */}
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder('events')}
              className="w-full flex items-center justify-between p-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                Events
              </span>
              {expandedFolders.events ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {expandedFolders.events && (
              <div className="pl-3 space-y-1 pt-1 border-l border-slate-900/80 ml-2">
                {[
                  { id: 'outage-events', label: 'Outage Events' },
                  { id: 'short-circuits', label: 'Short Circuits' },
                  { id: 'event-log', label: 'Event Log' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as SidebarPage)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition ${
                      activePage === item.id ? 'bg-slate-900 text-pink-400 font-semibold' : 'text-slate-455 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </nav>
      </aside>

      {/* Primary Dashboard viewport layout */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Dynamic Nav-header bar */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 select-none">
          <div className="space-y-1">
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white uppercase">
              INTEGRATED MACHINE LEARNING DRIVEN ASSET LIFECYCLE MANAGEMENT
            </h1>
            <p className="text-[10px] md:text-xs text-sky-450 font-bold uppercase tracking-widest font-mono">
              FOR DISTRIBUTION TRANSFORMERS
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3.5 text-xs">
            {/* Time Range */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Time Range</span>
              <div className="bg-slate-950 px-3 py-1.5 border border-slate-850 text-slate-300 rounded font-semibold font-mono">
                01-May-2019 00:00 <span className="text-slate-500 font-normal mx-0.5">to</span> 30-Apr-2024 23:45
              </div>
            </div>

            {/* Interval badge */}
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded transition shadow-sm select-none uppercase tracking-wider">
              15 Min Interval
            </button>

            {/* Sync */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Last Updated:</span>
              <div className="bg-slate-950 px-3 py-1.5 border border-slate-850 text-slate-300 rounded font-semibold font-mono flex items-center gap-2">
                <span>12-May-2024 10:30 AM</span>
                <RefreshCw
                  onClick={refresh}
                  className="w-3.5 h-3.5 text-sky-400 hover:text-white cursor-pointer transition"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="p-6">
          {errorStatus && (
            <div className="mb-4 p-4.5 bg-yellow-950/20 border border-yellow-500/20 rounded-xl text-yellow-300 text-xs flex gap-2 w-full max-w-4xl font-mono leading-relaxed select-none">
              <Info className="w-5 h-5 shrink-0" />
              <div>
                <strong>Supabase tables connection status limit:</strong> {errorStatus}. App is running flawlessly with highly detailed synthesized hifi metrics.
              </div>
            </div>
          )}
          {renderActiveViewport()}
        </main>
      </div>
    </div>
  );
}
