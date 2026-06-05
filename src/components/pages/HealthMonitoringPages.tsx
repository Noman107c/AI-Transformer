import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  Activity,
  Thermometer,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { TransformerStatus, SidebarPage, AlertNotification } from '../../types';

interface HealthMonitoringPagesProps {
  subPage: SidebarPage;
  transformers: TransformerStatus[];
  alerts: AlertNotification[];
  refresh: () => void;
}

export default function HealthMonitoringPages({
  subPage,
  transformers,
  alerts,
  refresh
}: HealthMonitoringPagesProps) {
  const [selectedTrfId, setSelectedTrfId] = useState<string>('TRF-01');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(3); // seconds for live ticks
  const [liveReadings, setLiveReadings] = useState<any[]>([]);

  const selectedTrf = transformers.find(t => t.id === selectedTrfId) || transformers[0];

  // Live simulation ticker for the Real-time Monitor
  useEffect(() => {
    if (!selectedTrf) return;
    
    // Seed initial historical readings
    const seed = Array.from({ length: 10 }).map((_, idx) => ({
      time: new Date(Date.now() - (10 - idx) * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      voltage: selectedTrf.voltage * (1 + (Math.random() * 0.02 - 0.01)),
      current: selectedTrf.current * (1 + (Math.random() * 0.04 - 0.02)),
      temp: selectedTrf.ambientTemp * (1 + (Math.random() * 0.06 - 0.03))
    }));
    setLiveReadings(seed);

    const interval = setInterval(() => {
      setLiveReadings(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          voltage: selectedTrf.voltage * (1 + (Math.random() * 0.02 - 0.01)),
          current: selectedTrf.current * (1 + (Math.random() * 0.04 - 0.015)),
          temp: selectedTrf.ambientTemp * (1 + (Math.random() * 0.05 - 0.025))
        });
        return next;
      });
    }, simulationSpeed * 1000);

    return () => clearInterval(interval);
  }, [selectedTrfId, simulationSpeed, selectedTrf]);

  // Handle different views
  if (subPage === 'real-time-monitor') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl gap-4 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              Real-time Asset Monitor
            </h2>
            <p className="text-xs text-slate-400">Streamed grid readings mapped to live components.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Selector:</span>
            <select
              value={selectedTrfId}
              onChange={e => setSelectedTrfId(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
            >
              {transformers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.status} ({t.healthIndex}%)
                </option>
              ))}
            </select>
            <button
              onClick={refresh}
              className="p-1 px-2 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded flex items-center gap-1 hover:bg-slate-900"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-sync
            </button>
          </div>
        </div>

        {/* Selected Transformer Quick status widgets */}
        {selectedTrf && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Temperature Gauge Meter */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  Thermal State
                </span>
                <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono px-2 py-0.5 rounded">
                  Ambient + Dissipation
                </span>
              </div>
              <div className="my-4 text-center">
                <span className="text-4xl font-extrabold text-orange-400 font-mono">
                  {liveReadings[liveReadings.length - 1]?.temp.toFixed(1) || selectedTrf.ambientTemp}°C
                </span>
                <p className="text-xs text-slate-400 mt-1">Dissipation temp rating</p>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min((selectedTrf.ambientTemp / 80) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Current load state */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  Load Current
                </span>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 font-mono px-2 py-0.5 rounded">
                  Continuous Amperage
                </span>
              </div>
              <div className="my-4 text-center">
                <span className="text-4xl font-extrabold text-sky-400 font-mono">
                  {liveReadings[liveReadings.length - 1]?.current.toFixed(1) || selectedTrf.current}A
                </span>
                <p className="text-xs text-slate-400 mt-1">Secondary winding current</p>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${Math.min((selectedTrf.current / 300) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Voltage state */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Grid Voltage
                </span>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-mono px-2 py-0.5 rounded">
                  Terminal Tension
                </span>
              </div>
              <div className="my-4 text-center">
                <span className="text-4xl font-extrabold text-yellow-400 font-mono">
                  {liveReadings[liveReadings.length - 1]?.voltage.toFixed(2) || selectedTrf.voltage}kV
                </span>
                <p className="text-xs text-slate-400 mt-1">Nominal step-down level</p>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${(selectedTrf.voltage / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Real-time Oscilloscope Lines */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase">
              Microsecond Wave Oscilloscope ({selectedTrfId})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">Sim Tick Interval:</span>
              <button
                onClick={() => setSimulationSpeed(s => Math.max(1, s - 1))}
                className="bg-slate-950 px-2 py-0.5 border border-slate-850 rounded text-slate-300 font-bold"
              >
                -
              </button>
              <span className="text-xs font-mono text-emerald-400">{simulationSpeed}s</span>
              <button
                onClick={() => setSimulationSpeed(s => Math.min(10, s + 1))}
                className="bg-slate-950 px-2 py-0.5 border border-slate-850 rounded text-slate-300 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="temp" name="Ambient Temp (°C)" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="current" name="Line Current (A)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'health-index') {
    // Generate correlation ranking list for health elements from score variables
    const healthScoresList = [
      { field: 'Ambient Temp Score', score: selectedTrf.healthIndex > 80 ? 98 : selectedTrf.healthIndex > 60 ? 76 : 42, impact: 'High', color: '#f59e0b' },
      { field: 'Voltage Tension Score', score: selectedTrf.healthIndex > 70 ? 94 : 61, impact: 'Medium', color: '#10b981' },
      { field: 'Line Load Current Score', score: selectedTrf.healthIndex > 80 ? 95 : 68, impact: 'High', color: '#3b82f6' },
      { field: 'Short Circuits Frequency Score', score: selectedTrf.healthIndex > 85 ? 99 : 54, impact: 'Very High', color: '#ef4444' },
      { field: 'Structural Age Lifespan', score: parseFloat((100 - selectedTrf.ageYears * 6.5).toFixed(1)), impact: 'Medium', color: '#8b5cf6' },
      { field: 'Outages Resiliency rating', score: selectedTrf.healthIndex > 70 ? 90 : 49, impact: 'Low', color: '#ec4899' }
    ];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 animate-pulse">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Health Index (HI) Comprehensive Assessment
            </h2>
            <p className="text-xs text-slate-400">
              Analyzing weighted multi-parameter scoring algorithm for {selectedTrfId}.
            </p>
          </div>
          <select
            value={selectedTrfId}
            onChange={e => setSelectedTrfId(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 border border-slate-850 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {transformers.map(t => (
              <option key={t.id} value={t.id}>
                {t.id} - Score: {t.healthIndex}%
              </option>
            ))}
          </select>
        </div>

        {/* Selected Health Index details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl text-center flex flex-col justify-center min-h-[220px]">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Calculated Health Index (HI)
            </span>
            <div className="text-5xl font-extrabold text-indigo-400 my-4 font-mono">
              {selectedTrf.healthIndex}%
            </div>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedTrf.status === 'Healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : selectedTrf.status === 'Moderate'
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                }`}
              >
                {selectedTrf.status} status rating
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl text-center flex flex-col justify-center min-h-[220px]">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              ML Suggested Health Index
            </span>
            <div className="text-5xl font-extrabold text-violet-400 my-4 font-mono">
              {selectedTrf.predictedHI}%
            </div>
            <p className="text-xs text-slate-400">
              90-day predictive gradient model output (XGBoost)
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl text-center flex flex-col justify-center min-h-[220px]">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Lifespan Remaining Useful Life
            </span>
            <div className="text-5xl font-extrabold text-amber-500 my-4 font-mono">
              {selectedTrf.rulDays}
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              Days of continuous runtime remaining
            </p>
          </div>
        </div>

        {/* Feature Score Decomposition Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed parameter breakdown table */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Sensor Health Component Scores
            </h3>
            <div className="space-y-4">
              {healthScoresList.map(score => (
                <div key={score.field} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-350">{score.field}</span>
                    <div className="flex gap-2">
                      <span className="font-mono text-slate-100 font-bold">{score.score}/100</span>
                      <span className="text-slate-500">({score.impact} Impact)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score.score}%`, backgroundColor: score.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Index Composition Pie or Horizontal Bar */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Weightage Index Decomposition
            </h3>
            <div className="flex-1 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthScoresList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                  <XAxis dataKey="field" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="score" name="Core score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'key-parameters') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-base font-bold text-slate-100">Sensor Parameters Analysis</h2>
          <p className="text-xs text-slate-400">Deep-dive into multi-sensor voltage, thermal limits, and amperage profiles.</p>
        </div>

        {/* Sensory Chart grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1 */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase mb-4">Voltage Level Profile (kV)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedTrf.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                  <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} domain={[10, 12]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="voltage" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase mb-4 font-sans">Current Line Distribution (A)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedTrf.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                  <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'historical-trends') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              Historical Aging Trends
            </h2>
            <p className="text-xs text-slate-400">Tracking long-term degradation profiles across asset series (2019-2024).</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col">
          <h3 className="text-sm font-semibold text-slate-200 uppercase mb-4">6-Year Multi-Sensor Degradation Curve</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedTrf.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Line type="monotone" dataKey="healthIndex" name="Health Index %" stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="predictedHI" name="Predicted HI %" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="temp" name="Ambient Temp (°C)" stroke="#f97316" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Alerts
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          Active Incident Alerts & Alarms Panel
        </h2>
        <p className="text-xs text-slate-400">Current out-of-bounds sensor limits or high-risk forecasting events.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts listing (8 cols) */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recent System Alarms ({alerts.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Sensor limits violations board</span>
          </div>

          <div className="space-y-3">
            {alerts.map(a => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border flex items-start gap-4 transition hover:bg-slate-800/10 ${
                  a.severity === 'Critical'
                    ? 'bg-red-500/10 border-red-500/25 text-red-200'
                    : 'bg-yellow-500/10 border-yellow-500/15 text-yellow-200'
                }`}
              >
                <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${a.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-sky-400 text-sm font-mono">{a.transformerId}</span>
                    <span className="text-xs text-slate-400 font-mono">{a.timestamp}</span>
                  </div>
                  <p className="text-xs">{a.message}</p>
                  <p className="text-[11px] text-slate-400">
                    Category: <strong className="text-slate-350">{a.type === 'HI' ? 'Degrading health index' : a.type === 'RUL' ? 'Remaining useful life' : 'Thermal Load'}</strong>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase text-white ${a.severity === 'Critical' ? 'bg-red-500' : 'bg-yellow-600'}`}>
                    {a.severity}
                  </span>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-slate-500 text-xs text-center py-12">
                All transformers are operating within nominal limits.
              </div>
            )}
          </div>
        </div>

        {/* Summary (4 cols) */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Alerts Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Critical Spills</span>
                <span className="font-bold bg-red-500 text-white font-mono rounded px-2 py-0.5 text-[10px]">
                  {alerts.filter(a => a.severity === 'Critical').length} ACTIVE
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <span>Medium Warnings</span>
                <span className="font-bold bg-yellow-650 text-white font-mono rounded px-2 py-0.5 text-[10px]">
                  {alerts.filter(a => a.severity === 'Warning').length} ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl mt-6">
            <h4 className="text-xs font-semibold text-slate-200 uppercase mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Standard Safety Protocols
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If an asset slips below 50% Health Index or breaches 75°C temperature threshold, immediately dispatch maintenance team to oil sampling terminals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
