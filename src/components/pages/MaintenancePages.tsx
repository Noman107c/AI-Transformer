import { useState } from 'react';
import { Wrench, Calendar, ClipboardList, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { SidebarPage, MaintenanceItem } from '../../types';

interface MaintenancePagesProps {
  subPage: SidebarPage;
  maintenance: MaintenanceItem[];
}

export default function MaintenancePages({ subPage, maintenance }: MaintenancePagesProps) {
  const [tasks, setTasks] = useState<MaintenanceItem[]>(maintenance);

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus: MaintenanceItem['status'] = t.status === 'Completed' ? 'Pending' : 'Completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      default: return 'bg-emerald-600 text-white';
    }
  };

  if (subPage === 'maintenance-history') {
    // Filter out items already completed
    const historyList = tasks.filter(t => t.status === 'Completed');

    return (
      <div className="space-y-6 animate-fadeIn font-sans text-slate-350">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl font-sans">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            Historic Maintenance Records log
          </h2>
          <p className="text-xs text-slate-400">Complete archive of oil replacements, winding tests, and structural refurbishments.</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/40 uppercase text-[10px] tracking-wide">
                <th className="py-3 px-3">Log ID</th>
                <th className="py-3 px-3">Transformer ID</th>
                <th className="py-3 px-3">Intervention Type</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Resolution Date</th>
                <th className="py-3 px-3">Result Action Taken</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map(item => (
                <tr key={item.id} className="border-b border-slate-850/50 hover:bg-slate-800/15">
                  <td className="py-3 px-3 font-mono font-medium text-slate-500">{item.id}</td>
                  <td className="py-3 px-3 font-bold text-sky-400">{item.transformerId}</td>
                  <td className="py-3 px-3 font-medium text-slate-205">{item.recommendation}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{item.dateAdded}</td>
                  <td className="py-3 px-3 text-xs italic">{item.suggestedAction}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase">
                      RESOLVED
                    </span>
                  </td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-slate-500 text-center py-12">
                    No historic records found in memory context. Try marking some upcoming tasks as Resolved!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (subPage === 'maintenance-plan') {
    // Actionable plans derived from AI health scores
    const pendingPlans = tasks.filter(t => t.status !== 'Completed');

    return (
      <div className="space-y-6 animate-fadeIn text-slate-350">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <Wrench className="w-5 h-5 text-indigo-400" />
            AI-Driven Preventive Maintenance Plan
          </h2>
          <p className="text-xs text-slate-400">Prescriptive lifecycle activities calibrated dynamically according to Gini importance indexes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action List (8 cols) */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Recommended Interventions ({pendingPlans.length} pending)</h3>
            <div className="space-y-4">
              {pendingPlans.slice(0, 5).map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-850 bg-slate-950/30 flex gap-4 transition hover:border-indigo-500/30">
                  <Wrench className="w-5 h-5 text-indigo-405 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-400 text-sm font-mono">{item.transformerId}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${getPriorityColor(item.priority)}`}>
                        {item.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200">{item.recommendation}</p>
                    <p className="text-xs text-slate-400">{item.suggestedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines info (4 cols) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" /> Precision Directives
              </h4>
              <p className="text-xs text-slate-300 leading-normal text-justify mb-4">
                Recommended activities are predicted systematically by mapping core dissolved gas analysis (DGA) ratios directly to XGBoost regressor nodes.
              </p>
              <p className="text-xs text-slate-300 leading-normal">
                If the transformer suffers multiple winding short circuits, plan a core insulation oil degassing flow within 15 operating cycles.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl mt-6 flex gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-normal">
                Oil tests should target furan compounds, which correlate perfectly with Cellulose insulation paper structural state.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Upcoming Tasks Checklist Interactive
  return (
    <div className="space-y-6 animate-fadeIn text-slate-350">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
          <Calendar className="w-5 h-5 text-emerald-405 animate-pulse" />
          Scheduled Field Tasks & Interventions
        </h2>
        <p className="text-xs text-slate-400">Interactive board to toggle or record completion of field tasks.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Pending Checklist Tasks ({tasks.filter(t => t.status !== 'Completed').length} active)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(t => (
            <div
              key={t.id}
              onClick={() => toggleTaskStatus(t.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                t.status === 'Completed'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-450 hover:bg-emerald-500/10'
                  : 'bg-slate-950/40 border-slate-850 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex gap-3 items-start">
                <input
                  type="checkbox"
                  checked={t.status === 'Completed'}
                  readOnly
                  className="mt-1 h-4 w-4 text-indigo-500 rounded border-slate-800 focus:ring-slate-700 cursor-pointer pointer-events-none"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sky-400 text-xs">{t.transformerId}</span>
                    <span className={`text-[8px] px-1 py-0.1 font-bold rounded uppercase ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold ${t.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                    {t.recommendation}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">{t.suggestedAction}</p>
                </div>
              </div>
              
              <div>
                {t.status === 'Completed' ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded-md font-bold uppercase tracking-wider">
                    COMPLETED
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 border border-amber-500/20 rounded-md font-bold uppercase tracking-wider">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
