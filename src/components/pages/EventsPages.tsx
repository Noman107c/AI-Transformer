import { Calendar, AlertTriangle, CloudRain, Clock, ToggleLeft } from 'lucide-react';
import { SidebarPage, TransformerStatus } from '../../types';

interface EventsPagesProps {
  subPage: SidebarPage;
  transformers: TransformerStatus[];
}

export default function EventsPages({ subPage, transformers }: EventsPagesProps) {
  // Synthesizing interesting event scenarios based on actual active transformers data
  const criticalList = transformers.filter(t => t.outages > 20);

  if (subPage === 'outage-events') {
    return (
      <div className="space-y-6 animate-fadeIn text-slate-350">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
            <CloudRain className="w-5 h-5 text-red-400 animate-pulse" />
            Historic Outage Events & Load Shredding Log
          </h2>
          <p className="text-xs text-slate-400">Archived list of transformer drop-outs, thermal fuses melting, or lightning strikes.</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Critical Outage Records ({criticalList.length} anomalies)</h3>
          
          <div className="space-y-4">
            {criticalList.map(t => (
              <div key={`outage-${t.id}`} className="p-4 border border-red-500/10 bg-red-500/5 rounded-xl flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sky-400 text-sm font-mono">{t.id}</span>
                    <span className="text-[10px] bg-red-400/10 text-red-400 px-2 py-0.5 rounded font-bold font-mono">
                      {t.outages} total outages
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    High recurring outages logged (age profile: {t.ageYears} Years). Transformer insulation requires urgent bushing sweep testing.
                  </p>
                </div>
              </div>
            ))}
            {criticalList.length === 0 && (
              <div className="text-slate-500 text-xs text-center py-12">No high outages anomalies recorded in memory context.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'short-circuits') {
    return (
      <div className="space-y-6 animate-fadeIn text-slate-350">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Line Short Circuit Ripple Reports
          </h2>
          <p className="text-xs text-slate-400">Copper windings pressure surges triggered by lightning ripples, bird contact, or load dumps.</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-8s0 text-slate-400 font-bold bg-slate-950/45 uppercase text-[9px] tracking-wider">
                <th className="py-3 px-3">Transformer ID</th>
                <th className="py-3 px-3">Short Circuits Count</th>
                <th className="py-3 px-3">Degrading Impact Rating</th>
                <th className="py-3 px-3">Winding Heat stress index</th>
                <th className="py-3 px-3 text-right">Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {transformers.map(t => (
                <tr key={`sc-row-${t.id}`} className="border-b border-slate-850/50 hover:bg-slate-800/10">
                  <td className="py-3 px-3 font-bold text-sky-400 font-mono">{t.id}</td>
                  <td className="py-3 px-3 font-semibold font-mono text-slate-100">{t.shortCircuits} times</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${t.shortCircuits > 15 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-450'}`}>
                      {t.shortCircuits > 15 ? 'CRITICAL WINDING DECAY' : 'NOMINAL STRESS'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-350">{(t.shortCircuits * 3.8).toFixed(1)}%</span>
                      <div className="w-12 bg-slate-850 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400" style={{ width: `${Math.min(t.shortCircuits * 4, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-[11px] font-medium text-slate-400 italic">
                    {t.shortCircuits > 13 ? 'Immediate winding degassing oil test' : 'Regular inspection cycle'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Event Log
  return (
    <div className="space-y-6 animate-fadeIn text-slate-350">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
          <Clock className="w-5 h-5 text-indigo-400" />
          General System Audit Log
        </h2>
        <p className="text-xs text-slate-400">Comprehensive event log detailing database synchronizations, sensory triggers, and state completions.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col font-mono text-xs text-slate-300 shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Audit Records Log (Live Event streams)</span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 animate-pulse">SYSTEM RUNNING OK</span>
        </div>

        <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
          <div className="flex gap-4 p-2 rounded hover:bg-slate-850/20 select-none">
            <span className="text-slate-500 shrink-0">12-May-2024 10:30:15</span>
            <span className="text-emerald-400 font-bold uppercase shrink-0">[INFO]</span>
            <span className="text-slate-300">Fetched latest transformer records from Supabase database. Grid telemetry successfully refreshed.</span>
          </div>
          <div className="flex gap-4 p-2 rounded hover:bg-slate-850/20 select-none">
            <span className="text-slate-500 shrink-0">12-May-2024 10:15:00</span>
            <span className="text-red-400 font-bold uppercase shrink-0">[ALARM]</span>
            <span className="text-slate-300">TRF-09: Health index threshold breached (current: 45.2%). Diagnostic recommendation generated.</span>
          </div>
          <div className="flex gap-4 p-2 rounded hover:bg-slate-850/20 select-none">
            <span className="text-slate-500 shrink-0">12-May-2024 09:50:22</span>
            <span className="text-red-400 font-bold uppercase shrink-0">[ALARM]</span>
            <span className="text-slate-300">TRF-10: Predicted remaining useful life shorter than 200 days threshold. Suggested scheduling major overhaul.</span>
          </div>
          <div className="flex gap-4 p-2 rounded hover:bg-slate-850/20 select-none">
            <span className="text-slate-500 shrink-0">12-May-2024 08:30:11</span>
            <span className="text-yellow-405 font-bold uppercase shrink-0">[WARN]</span>
            <span className="text-slate-300">TRF-06: High number of copper winding short circuits detected (15 counts). Local temperature rises observed.</span>
          </div>
          <div className="flex gap-4 p-2 rounded hover:bg-slate-850/20 select-none">
            <span className="text-slate-500 shrink-0">11-May-2024 14:22:45</span>
            <span className="text-indigo-400 font-bold uppercase shrink-0">[SYSTEM]</span>
            <span className="text-slate-300">Algorithm recalibration finished: Adjusted gradient Gini weights coefficients based on physical age curves.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
