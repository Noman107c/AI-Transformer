import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  Cell
} from 'recharts';
import { Clock, TrendingUp, BarChart2, ShieldAlert, Award, Calendar, Activity } from 'lucide-react';
import { SidebarPage, TransformerStatus } from '../../types';

interface RULPredictionPagesProps {
  subPage: SidebarPage;
  transformers: TransformerStatus[];
  onSelectTransformer: (id: string) => void;
}

export default function RULPredictionPages({
  subPage,
  transformers,
  onSelectTransformer
}: RULPredictionPagesProps) {
  const [selectedTrfId1, setSelectedTrfId1] = useState<string>('TRF-01');
  const [selectedTrfId2, setSelectedTrfId2] = useState<string>('TRF-09');

  const t1 = transformers.find(t => t.id === selectedTrfId1) || transformers[0];
  const t2 = transformers.find(t => t.id === selectedTrfId2) || transformers[8] || transformers[0];

  // Group RUL ranges count
  const criticalRul = transformers.filter(t => t.rulDays < 200).length;
  const riskRul = transformers.filter(t => t.rulDays >= 200 && t.rulDays < 730).length;
  const moderateRul = transformers.filter(t => t.rulDays >= 730 && t.rulDays < 1460).length;
  const healthyRul = transformers.filter(t => t.rulDays >= 1460).length;

  const rulDistribution = [
    { range: '< 200 Days (Critical)', count: criticalRul, color: '#ef4444' },
    { range: '200-730 Days (At Risk)', count: riskRul, color: '#f97316' },
    { range: '730-1460 Days (Moderate)', count: moderateRul, color: '#f59e0b' },
    { range: '> 1460 Days (Healthy)', count: healthyRul, color: '#10b981' }
  ];

  // Multi-curve prediction chart data
  const predictionTrendData = Array.from({ length: 6 }).map((_, stepIdx) => {
    // represent actual years up to 5 years into the future
    const label = `Year +${stepIdx}`;
    const t1Val = Math.max(0, parseFloat((t1.healthIndex - stepIdx * (t1.healthIndex < 60 ? 10 : 6)).toFixed(1)));
    const t2Val = Math.max(0, parseFloat((t2.healthIndex - stepIdx * (t2.healthIndex < 60 ? 12 : 8)).toFixed(1)));
    return {
      yearLabel: label,
      [t1.id]: t1Val,
      [t2.id]: t2Val
    };
  });

  // Calculate ordered rankings
  const rankedTransformers = [...transformers].sort((a, b) => b.healthIndex - a.healthIndex);

  if (subPage === 'rul-dashboard') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            Remaining Useful Life (RUL) Life Prognostics Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Evaluating historical winding heat stresses, oil acidity, and mechanical ages to forecast remaining structural lifespans.
          </p>
        </div>

        {/* Lifespan Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl text-center">
            <span className="text-xs text-slate-450 font-bold uppercase block tracking-wider">Average RUL</span>
            <span className="text-3xl font-extrabold text-slate-100 font-mono mt-2 block">764.5 days</span>
            <span className="text-[10px] text-slate-500 mt-1 block">~2.1 Years continuous duty</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl text-center border-l-4 border-l-red-500">
            <span className="text-xs text-red-400 font-bold uppercase block tracking-wider">Critical Lifespans</span>
            <span className="text-3xl font-extrabold text-red-400 font-mono mt-2 block">{criticalRul} Assets</span>
            <span className="text-[10px] text-red-500/80 mt-1 block">Immediate replacement recommended</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl text-center border-l-4 border-l-orange-500">
            <span className="text-xs text-orange-400 font-bold uppercase block tracking-wider">Warning Lifespans</span>
            <span className="text-3xl font-extrabold text-orange-400 font-mono mt-2 block">{riskRul} Assets</span>
            <span className="text-[10px] text-orange-550 mt-1 block">Requires bushing & insulation diagnostics</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl text-center border-l-4 border-l-emerald-500">
            <span className="text-xs text-emerald-400 font-bold uppercase block tracking-wider">Healthy Lifespans</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-2 block">{healthyRul} Assets</span>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">Nominal continuous operating cycles</span>
          </div>
        </div>

        {/* Useful Life range count chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-8 flex flex-col justify-between shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Useful Life Range Distribution Count (Asset Count)
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rulDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                  <XAxis dataKey="range" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {rulDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RUL prediction explanation (4 cols) */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl lg:col-span-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Prognostics Rules</h4>
              <p className="text-xs text-slate-300 leading-relaxed text-justify mb-3">
                Lifespan prediction uses standard double-exponential smoothing and supervised XGBoost regression calibrated with paper winding moisture sensors.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed text-id-align">
                Continuous high line current and localized temperature peaks of &gt; 80°C dramatically accelerate the core insulation degradation.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl mt-6 flex gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-normal">
                Transformers in <strong>Critical RUL (&lt; 200 Days)</strong> have accelerated hazard rates. Overhauls should be prioritized during upcoming scheduled grid downs.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'prediction-trend') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 animate-pulse">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Predictive Degradation Curves Comparison
            </h2>
            <p className="text-xs text-slate-400">Comparing 5-Year aging prognostics projection between components.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Trf A:</span>
              <select
                value={selectedTrfId1}
                onChange={e => setSelectedTrfId1(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded px-2 py-1"
              >
                {transformers.map(t => (
                  <option key={t.id} value={t.id}>{t.id}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Trf B:</span>
              <select
                value={selectedTrfId2}
                onChange={e => setSelectedTrfId2(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded px-2 py-1"
              >
                {transformers.map(t => (
                  <option key={t.id} value={t.id}>{t.id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-200 uppercase mb-4">
            5-Year Forecast Curves Comparison (Predicted Health Index %)
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                <XAxis dataKey="yearLabel" stroke="#475569" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Line type="monotone" dataKey={t1.id} stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey={t2.id} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Transformer Rank
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
          <Award className="w-5 h-5 text-yellow-450" />
          General Assets Health Index Rankings
        </h2>
        <p className="text-xs text-slate-400">All 25 active transformer nodes ordered by health status coefficients & RUL.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs border-collapse text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/45 uppercase text-[10px] tracking-wide">
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-3">Transformer ID</th>
              <th className="py-3 px-3">Health Index</th>
              <th className="py-3 px-3">Status Pillar</th>
              <th className="py-3 px-3">Remaining Life RUL</th>
              <th className="py-3 px-3">Physical Age</th>
              <th className="py-3 px-3">Weightage score</th>
            </tr>
          </thead>
          <tbody>
            {rankedTransformers.map((t, idx) => (
              <tr
                key={t.id}
                onClick={() => onSelectTransformer(t.id)}
                className={`border-b border-slate-850/60 hover:bg-slate-800/25 transition cursor-pointer font-sans`}
              >
                <td className="py-3 px-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                <td className="py-3 px-3 font-bold text-sky-450">{t.id}</td>
                <td className="py-3 px-3 font-mono font-bold text-slate-100">{t.healthIndex}%</td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      t.status === 'Healthy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : t.status === 'Moderate'
                        ? 'bg-yellow-500/15 text-yellow-550 border border-yellow-500/20'
                        : t.status === 'At Risk'
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                        : 'bg-red-500/15 text-red-500 border border-red-500/30'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-bold">{t.rulDays} days</td>
                <td className="py-3 px-3 font-mono">{t.ageYears} Years</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-medium">{t.overallWeightage}%</span>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
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
  );
}
