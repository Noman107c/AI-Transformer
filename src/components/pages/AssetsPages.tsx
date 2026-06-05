import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Database, Search, Sliders, ChevronRight, Activity, Zap, Clipboard, ShieldCheck } from 'lucide-react';
import { SidebarPage, TransformerStatus } from '../../types';

interface AssetsPagesProps {
  subPage: SidebarPage;
  transformers: TransformerStatus[];
  onSelectTransformer: (id: string) => void;
}

export default function AssetsPages({
  subPage,
  transformers,
  onSelectTransformer
}: AssetsPagesProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDetailsId, setSelectedDetailsId] = useState<string>('TRF-01');

  // Filter transformers based on inputs
  const filteredTransformers = transformers.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDetails = transformers.find(t => t.id === selectedDetailsId) || transformers[0];

  if (subPage === 'all-transformers') {
    return (
      <div className="space-y-6 animate-fadeIn text-slate-350">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
              <Database className="w-5 h-5 text-indigo-400 animate-pulse" />
              Comprehensive Transformer Asset Registry
            </h2>
            <p className="text-xs text-slate-400">Inventory and real-time status index for all 25 grid distribution nodes.</p>
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Asset ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 pl-8.5 pr-3 py-1.5 border border-slate-800 rounded-md focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-md px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Moderate">Moderate</option>
              <option value="At Risk">At Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Transformer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTransformers.map(t => (
            <div
              key={t.id}
              onClick={() => {
                onSelectTransformer(t.id);
                setSelectedDetailsId(t.id);
              }}
              className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-slate-800/10 transition flex flex-col justify-between h-[160px] shadow-lg relative overflow-hidden"
            >
              {/* Glowing accent border based on status */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  t.status === 'Healthy'
                    ? 'bg-emerald-500'
                    : t.status === 'Moderate'
                    ? 'bg-yellow-500'
                    : t.status === 'At Risk'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
              />

              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-sky-400 text-sm select-none">{t.id}</span>
                <span
                  className={`text-[9px] px-2 py-0.2 rounded font-bold uppercase ${
                    t.status === 'Healthy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                      : t.status === 'Moderate'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-550/15'
                      : 'bg-red-500/10 text-red-400 border border-red-500/15'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="my-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-450 uppercase text-[9px] tracking-wider font-bold">Health Index</span>
                  <strong className="font-mono text-slate-100 text-lg">{t.healthIndex}%</strong>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded mt-1 overflow-hidden">
                  <div
                    className={`h-full ${
                      t.status === 'Healthy' ? 'bg-emerald-500' : t.status === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${t.healthIndex}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-450 border-t border-slate-850/60 pt-2 font-mono">
                <span>Age: {t.ageYears} Yrs</span>
                <span>RUL: {t.rulDays} Days</span>
              </div>
            </div>
          ))}
          {filteredTransformers.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-12 text-sm font-medium">
              No matching transformer assets found in registry.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (subPage === 'transformer-details') {
    return (
      <div className="space-y-6 animate-fadeIn text-slate-350">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
              <Clipboard className="w-5 h-5 text-indigo-400" />
              Transformer Diagnostics Sheet View({selectedDetailsId})
            </h2>
            <p className="text-xs text-slate-400">Detailed historical measurements and predictive aging logs.</p>
          </div>
          <select
            value={selectedDetailsId}
            onChange={e => setSelectedDetailsId(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 border border-slate-850 rounded px-2.5 py-1.5"
          >
            {transformers.map(t => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </select>
        </div>

        {selectedDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick stats and properties */}
            <div className="col-span-4 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-2">Properties Summary</h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-450">Active ID</span>
                  <span className="text-sky-400 font-bold">{selectedDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Health index score</span>
                  <span className="text-slate-100 font-bold">{selectedDetails.healthIndex}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Continuous Age</span>
                  <span className="text-slate-100 font-bold">{selectedDetails.ageYears} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Terminal current</span>
                  <span className="text-slate-100 font-bold">{selectedDetails.current} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Terminal tension</span>
                  <span className="text-slate-100 font-bold">{selectedDetails.voltage} kV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Furan oil temp</span>
                  <span className="text-slate-100 font-bold">{selectedDetails.ambientTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Outages experienced</span>
                  <span className="text-red-400 font-bold">{selectedDetails.outages} instances</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Short circuit ripples</span>
                  <span className="text-amber-400 font-bold">{selectedDetails.shortCircuits} instances</span>
                </div>
              </div>
            </div>

            {/* Historical chart of the select transformer */}
            <div className="col-span-8 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-2 mb-4">Aging Curve (HI progression)</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedDetails.history}>
                    <defs>
                      <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#13223f" />
                    <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="healthIndex" name="Health index %" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#detailGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Asset Hierarchy tree structure
  return (
    <div className="space-y-6 animate-fadeIn text-slate-350">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-slate-100">Regional Substations & Asset Hierarchy</h2>
        <p className="text-xs text-slate-400">Structural system tree of grid substation distribution segments.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl max-w-2xl mx-auto shadow-2xl">
        <div className="space-y-4">
          {/* Root Substation */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-sans">
              <Zap className="w-4.5 h-4.5 text-yellow-400" />
              GRID DISTRICT EAST SUBSTATION (132kV Segment)
            </h4>
            <div className="pl-6 mt-3 border-l border-slate-850 space-y-4 pt-1">
              {/* Mid Group A */}
              <div className="space-y-2">
                <span className="text-xs uppercase text-slate-450 tracking-wider font-semibold block flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Secondary Winding Section A (33kV)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pl-4">
                  {transformers.slice(0, 5).map(t => (
                    <div key={t.id} className="text-[10px] font-mono text-center p-2 rounded bg-slate-900/30 border border-slate-850 text-slate-300">
                      <strong className="text-sky-400 block">{t.id}</strong>
                      <span className="text-slate-500 font-bold">{t.healthIndex}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mid Group B */}
              <div className="space-y-2 pt-2 border-t border-slate-900/40">
                <span className="text-xs uppercase text-slate-450 tracking-wider font-semibold block flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Secondary Winding Section B (11kV)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pl-4">
                  {transformers.slice(5, 10).map(t => (
                    <div key={t.id} className="text-[10px] font-mono text-center p-2 rounded bg-slate-900/30 border border-slate-850 text-slate-300">
                      <strong className="text-sky-400 block">{t.id}</strong>
                      <span className="text-slate-500 font-bold">{t.healthIndex}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
