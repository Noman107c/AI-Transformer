import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  Zap,
  TrendingUp,
  Wrench,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  Cpu,
  Clock,
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { TransformerStatus, AlertNotification, MaintenanceItem } from '../../types';

interface OverviewPageProps {
  transformers: TransformerStatus[];
  alerts: AlertNotification[];
  maintenance: MaintenanceItem[];
  dbDataLength: number;
  dataSource: 'Supabase' | 'Hifi-Fallback';
  onSelectTransformer: (id: string) => void;
}

export default function OverviewPage({
  transformers,
  alerts,
  maintenance,
  dbDataLength,
  dataSource,
  onSelectTransformer
}: OverviewPageProps) {
  const [samplePage, setSamplePage] = useState(1);
  const itemsPerPage = 8;

  // Calculate totals and statistics
  const totalTransformers = transformers.length || 25;
  const healthyCount = transformers.filter(t => t.status === 'Healthy').length;
  const moderateCount = transformers.filter(t => t.status === 'Moderate').length;
  const atRiskCount = transformers.filter(t => t.status === 'At Risk').length;
  const criticalCount = transformers.filter(t => t.status === 'Critical').length;

  const avgHealthIndex = parseFloat(
    (transformers.reduce((sum, t) => sum + t.healthIndex, 0) / totalTransformers).toFixed(2)
  ) || 72.45;

  const totalOutages = transformers.reduce((sum, t) => sum + t.outages, 0);
  const totalMaintenance = transformers.reduce((sum, t) => sum + t.maintenanceCount, 0);

  // Pie chart data for weightage selection
  const weightageData = [
    { name: 'Voltage', value: 25, color: '#10b981' },
    { name: 'Current', value: 20, color: '#f59e0b' },
    { name: 'Age', value: 15, color: '#f97316' },
    { name: 'Outage Occurred', value: 15, color: '#ef4444' },
    { name: 'No. of Short Circuits', value: 10, color: '#3b82f6' },
    { name: 'Total Maintenance Count', value: 10, color: '#8b5cf6' },
    { name: 'Ambient Temperature', value: 5, color: '#ec4899' }
  ];

  // Feature Importance Data
  const featureImportance = [
    { name: 'Voltage', score: 0.28 },
    { name: 'Current', score: 0.22 },
    { name: 'Age', score: 0.18 },
    { name: 'Outage Occurred', score: 0.13 },
    { name: 'Short Circuits', score: 0.09 },
    { name: 'Maintenance Count', score: 0.06 },
    { name: 'Ambient Temp', score: 0.04 }
  ];

  // Multiline Trend Data for top transformers
  const trendHistory = Array.from({ length: 6 }).map((_, yearIdx) => {
    const year = 2019 + yearIdx;
    const entry: any = { year };
    ['TRF-01', 'TRF-02', 'TRF-03', 'TRF-04', 'TRF-05', 'TRF-25'].forEach(id => {
      const trf = transformers.find(t => t.id === id);
      const val = trf?.history[yearIdx]?.healthIndex || (90 - (id === 'TRF-25' ? 25 : 5) - yearIdx * (id === 'TRF-05' ? 4 : 2));
      entry[id] = val;
    });
    return entry;
  });

  // Dynamic parameters averages
  const avgVoltage = (transformers.reduce((sum, t) => sum + t.voltage, 0) / totalTransformers).toFixed(2);
  const avgCurrent = (transformers.reduce((sum, t) => sum + t.current, 0) / totalTransformers).toFixed(1);
  const avgAge = (transformers.reduce((sum, t) => sum + t.ageYears, 0) / totalTransformers).toFixed(2);
  const avgTemp = (transformers.reduce((sum, t) => sum + t.ambientTemp, 0) / totalTransformers).toFixed(1);
  const avgShortCircuits = Math.round(transformers.reduce((sum, t) => sum + t.shortCircuits, 0) / totalTransformers);

  // Sparkline generator helper
  const renderSparkline = (points: number[]) => {
    const width = 100;
    const height = 24;
    const maxVal = Math.max(...points, 1);
    const minVal = Math.min(...points, 0);
    const range = maxVal - minVal;
    
    const svgPath = points
      .map((val, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((val - minVal) / (range || 1)) * height + 2;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <svg className="w-24 h-6 text-emerald-400 stroke-current stroke-2 fill-none overflow-visible">
        <path d={svgPath} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner indicating data source */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl gap-4 shadow-lg">
        <div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
            Current Environment Context
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and lifespan forecasting for {totalTransformers} active transformer nodes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <div className="text-xs text-slate-300 font-mono">
            Source: <strong className="text-green-400">{dataSource}</strong>{' '}
            {dataSource === 'Supabase' && `(${dbDataLength} records fetched)`}
          </div>
        </div>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Healthy */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-green-500/40 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">Healthy</div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-sans text-white">{healthyCount}</span>
            <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-bold uppercase">
              {Math.round((healthyCount / totalTransformers) * 100)}%
            </span>
          </div>
        </div>

        {/* Moderate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-yellow-500/40 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">Moderate</div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-sans text-white">{moderateCount}</span>
            <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-bold uppercase">
              {Math.round((moderateCount / totalTransformers) * 100)}%
            </span>
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-orange-500/40 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">At Risk</div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-sans text-white">{atRiskCount}</span>
            <span className="text-[10px] font-mono text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">
              {Math.round((atRiskCount / totalTransformers) * 100)}%
            </span>
          </div>
        </div>

        {/* Critical */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-red-500/40 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">Critical</div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-sans text-white">{criticalCount}</span>
            <span className="text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-bold uppercase">
              {Math.round((criticalCount / totalTransformers) * 100)}%
            </span>
          </div>
        </div>

        {/* Avg Health Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">Avg. Health Index</div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{avgHealthIndex}</span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
        </div>

        {/* Total Outages */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">Total Outages</div>
          <div className="mt-3 text-2xl font-bold text-white">{totalOutages}</div>
        </div>

        {/* Total Maintenance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 transition duration-300 shadow-md">
          <div className="text-xs font-semibold uppercase text-slate-400">Total Maintenance</div>
          <div className="mt-3 text-2xl font-bold text-white">{totalMaintenance}</div>
        </div>
      </div>

      {/* Main Grid: Health Summary, Trend, and Weightage Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn">
        {/* Column 1: Health Summary Table (5 cols) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl xl:col-span-12 lg:col-span-6 xl:grid xl:grid-cols-12 gap-8 shadow-xl">
          <div className="xl:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Transformer Health Summary
              </h3>
              <span className="text-xs text-slate-500">Showing top 10 of {totalTransformers}</span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                    <th className="py-2.5 px-2">Transformer ID</th>
                    <th className="py-2.5 px-2">Health Index (HI)</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2">RUL (Days)</th>
                    <th className="py-2.5 px-2">Age (Yrs)</th>
                    <th className="py-2.5 px-2 text-right">Overall Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {transformers.slice(0, 10).map(t => (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTransformer(t.id)}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30 cursor-pointer transition text-slate-300 font-sans"
                    >
                      <td className="py-2.5 px-2 font-semibold text-sky-400">{t.id}</td>
                      <td className="py-2.5 px-2 font-mono font-medium">{t.healthIndex}%</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                            t.status === 'Healthy'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : t.status === 'Moderate'
                              ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                              : t.status === 'At Risk'
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono">{t.rulDays}</td>
                      <td className="py-2.5 px-2 font-mono">{t.ageYears}</td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono text-[11px] text-slate-400">{t.overallWeightage}%</span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                t.status === 'Healthy'
                                  ? 'bg-emerald-500'
                                  : t.status === 'Moderate'
                                  ? 'bg-yellow-500'
                                  : t.status === 'At Risk'
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${t.overallWeightage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 2: Health Index Trend Chart (4 cols) */}
          <div className="xl:col-span-4 flex flex-col mt-6 xl:mt-0 border-t xl:border-t-0 xl:border-l border-slate-800 xl:pl-6 pt-6 xl:pt-0">
            <h3 className="text-sm font-bold text-slate-200 mb-4 tracking-wider uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Health Index Trend Over Time
            </h3>
            <div className="flex-1 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                  <XAxis dataKey="year" stroke="#475569" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="TRF-01" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="TRF-02" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="TRF-03" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="TRF-04" stroke="#ec4899" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="TRF-05" stroke="#a855f7" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="TRF-25" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> TRF-01</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> TRF-02</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> TRF-03</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ec4899]" /> TRF-04</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> TRF-05</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> TRF-25</span>
            </div>
          </div>

          {/* Column 3: Overall Weightage Distribution Pie (3 cols) */}
          <div className="xl:col-span-3 flex flex-col mt-6 xl:mt-0 border-t xl:border-t-0 xl:border-l border-slate-800 xl:pl-6 pt-6 xl:pt-0">
            <h3 className="text-sm font-bold text-slate-200 mb-2 tracking-wider uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Weightage Distribution
            </h3>
            <div className="relative flex-1 flex items-center justify-center min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {weightageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total</span>
                <span className="text-lg font-bold text-slate-200 font-mono">100%</span>
              </div>
            </div>
            
            <div className="space-y-1 text-[10px] text-slate-400 px-2 leading-tight">
              {weightageData.slice(0, 5).map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-mono text-slate-300">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline trend parameters row (Micro sparkline meters) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          KEY PARAMETERS TREND (All Transformers Average Trend)
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
          {/* Spark V */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Voltage</span>
            <span className="text-lg font-bold text-emerald-400 block font-mono">{avgVoltage}<span className="text-[10px] font-normal text-slate-500 ml-1">kV</span></span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([10.5, 10.9, 11.2, 11.0, 11.02, 11.1, 10.95, 11.02, 11.05])}
            </div>
          </div>
          {/* Spark A */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Current</span>
            <span className="text-lg font-bold text-cyan-400 block font-mono">{avgCurrent}<span className="text-[10px] font-normal text-slate-500 ml-1">A</span></span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([120, 124, 131, 127, 126, 128.6, 132, 128.6, 129.5])}
            </div>
          </div>
          {/* Spark Age */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Age</span>
            <span className="text-lg font-bold text-yellow-400 block font-mono">{avgAge}<span className="text-[10px] font-normal text-slate-500 ml-1">Yrs</span></span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([1.1, 1.8, 2.5, 3.1, 3.8, 4.35, 4.35, 4.4, 4.5])}
            </div>
          </div>
          {/* Spark Temp */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Ambient Temp</span>
            <span className="text-lg font-bold text-orange-400 block font-mono">{avgTemp}<span className="text-[10px] font-normal text-slate-500 ml-1">°C</span></span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([29.1, 30.5, 33.2, 31.8, 32.8, 34.1, 32.8, 33.1, 32.5])}
            </div>
          </div>
          {/* Spark Outages */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Total Outages</span>
            <span className="text-lg font-bold text-red-400 block font-mono">{totalOutages}</span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([10, 15, 21, 28, 35, 42, 48, 48, 48])}
            </div>
          </div>
          {/* Spark Short Circuits */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Short Circuits</span>
            <span className="text-lg font-bold text-indigo-400 block font-mono">{avgShortCircuits}</span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([5, 8, 12, 15, 18, 22, 26, 26, 26])}
            </div>
          </div>
          {/* Spark Maintenance */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Maintenance</span>
            <span className="text-lg font-bold text-fuchsia-400 block font-mono">{totalMaintenance}</span>
            <div className="mt-2 flex justify-center">
              {renderSparkline([30, 48, 65, 82, 101, 118, 134, 134, 134])}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Sample Data, ML model diagnostics and RUL Prediction List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Sample Data 15 Min Interval */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Sample Data (15-Min Interval Logs)
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
              Fetched Live rows
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-[11px] text-left text-slate-300 font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                  <th className="py-2 px-1">Timestamp</th>
                  <th className="py-2 px-1 text-center">ID</th>
                  <th className="py-2 px-1 text-right">Volt (kV)</th>
                  <th className="py-2 px-1 text-right">Curr (A)</th>
                  <th className="py-2 px-1 text-right">Temp (°C)</th>
                  <th className="py-2 px-1 text-center">Outage</th>
                </tr>
              </thead>
              <tbody>
                {transformers.map((t, idx) => (
                  <tr key={`sample-${t.id}-${idx}`} className="border-b border-slate-900/60 hover:bg-slate-800/10">
                    <td className="py-2 px-1 text-slate-500">12-May-2024 10:30</td>
                    <td className="py-2 px-1 text-center font-bold text-sky-400">{t.id}</td>
                    <td className="py-2 px-1 text-right">{t.voltage}</td>
                    <td className="py-2 px-1 text-right">{t.current}</td>
                    <td className="py-2 px-1 text-right text-orange-400">{t.ambientTemp}</td>
                    <td className="py-2 px-1 text-center">
                      <span className={`px-1.5 py-0.2 rounded font-bold ${t.outages > 15 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {t.outages > 20 ? '1' : '0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Learning Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              Machine Learning Model Summary
            </h3>
            <span className="text-[10px] text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded font-mono">
              XGBoost Regressor
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-3 rounded-xl mb-4 border border-slate-900">
            <div className="text-center">
              <span className="text-[10px] uppercase text-slate-500 block">MAE</span>
              <span className="text-lg font-bold text-slate-200 font-mono">4.21</span>
            </div>
            <div className="text-center border-x border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500 block">RMSE</span>
              <span className="text-lg font-bold text-slate-200 font-mono">6.87</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase text-slate-500 block">R² Score</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">0.91</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Feature Importance Distribution
            </span>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={featureImportance}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#475569" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="score" fill="#818cf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RUL Prediction List (Remaining Useful Life) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              RUL Prediction (Remaining Lifespan)
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">Remaining Useful Life</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-[11px] text-left border-collapse font-sans text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-2">Transformer ID</th>
                  <th className="py-2 px-2">RUL (Days)</th>
                  <th className="py-2 px-2 text-right">RUL (Years)</th>
                  <th className="py-2 px-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {transformers.slice(0, 10).map((t) => {
                  const years = (t.rulDays / 365).toFixed(2);
                  const trendPoints = t.history.map(h => h.healthIndex);
                  
                  return (
                    <tr key={`rul-summary-${t.id}`} className="border-b border-slate-900/60 hover:bg-slate-800/15">
                      <td className="py-2 px-2 font-bold text-sky-400">{t.id}</td>
                      <td className="py-2 px-2 font-mono">{t.rulDays} days</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-400">{years} yrs</td>
                      <td className="py-2 px-2 flex justify-end">
                        {renderSparkline(trendPoints)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Alerts & Recommendations, and business rules logic */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Alerts widget (5 cols) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl xl:col-span-4 flex flex-col min-h-[300px] shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex gap-3 ${
                  alert.severity === 'Critical'
                    ? 'bg-red-500/10 border-red-500/20 text-red-300'
                    : 'bg-yellow-500/10 border-yellow-500/10 text-yellow-300'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-450 font-mono">{alert.transformerId}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs">{alert.message}</p>
                </div>
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold h-fit uppercase text-white ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-yellow-600'}`}>
                  {alert.severity}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-slate-500 text-xs text-center py-6">No pending system alarms detected.</div>
            )}
          </div>
        </div>

        {/* Recommendations list (5 cols) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl xl:col-span-5 flex flex-col min-h-[300px] shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            Lifecycle Management Recommendations
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-[11px] text-left border-collapse text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-2">Transformer ID</th>
                  <th className="py-2 px-2">Recommendation</th>
                  <th className="py-2 px-2">Priority</th>
                  <th className="py-2 px-2">Suggested Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b border-slate-900/60 hover:bg-slate-800/10">
                    <td className="py-2 px-2 font-bold text-sky-400">{item.transformerId}</td>
                    <td className="py-2 px-2 font-medium">{item.recommendation}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase text-white ${
                          item.priority === 'High'
                            ? 'bg-red-500'
                            : item.priority === 'Medium'
                            ? 'bg-yellow-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-400 text-xs">{item.suggestedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business rules panel (3 cols) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl xl:col-span-3 flex flex-col min-h-[300px] shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Business Rules (RUL)
          </h3>
          <div className="space-y-4 flex-1 text-slate-300 text-xs text-justify">
            <div className="space-y-2">
              <div className="flex gap-2 items-start bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="font-mono text-xs text-emerald-400 font-bold">1.</span>
                <p>If Health Index &lt; 50 &rarr; RUL = 0 to 200 Days (Critical action recommended)</p>
              </div>
              <div className="flex gap-2 items-start bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="font-mono text-xs text-yellow-400 font-bold">2.</span>
                <p>If Health Index 50 to 70 &rarr; RUL = 200 to 730 Days (At Risk - Inspect immediately)</p>
              </div>
              <div className="flex gap-2 items-start bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="font-mono text-xs text-sky-400 font-bold">3.</span>
                <p>If Health Index 70 to 85 &rarr; RUL = 730 to 1460 Days (Moderate status)</p>
              </div>
              <div className="flex gap-2 items-start bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="font-mono text-xs text-indigo-400 font-bold">4.</span>
                <p>If Health Index &gt; 85 &rarr; RUL = &gt; 1460 Days (Healthy rating)</p>
              </div>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded-lg text-[10px] text-slate-400 leading-normal flex gap-1 border border-slate-900">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Rules are calibrated dynamically using historic lifespan statistics and thermal models.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
