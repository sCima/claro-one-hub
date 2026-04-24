'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DataPoint } from '../../../data/mockData';

type Mode = 'mobile' | 'internet';

const CONFIG: Record<Mode, { label: string; unit: string; color: string }> = {
  mobile:   { label: 'Celular',  unit: 'GB', color: '#D52B1E' },
  internet: { label: 'Internet', unit: 'GB', color: '#000000' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, mode }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="opacity-60">{label}</p>
      <p className="font-black mt-0.5">{payload[0].value} {CONFIG[mode as Mode].unit}</p>
    </div>
  );
}

export function UsageInsights({ data }: { data: DataPoint[] }) {
  const [mode, setMode] = useState<Mode>('mobile');
  const cfg = CONFIG[mode];

  const total = data.reduce((s, d) => s + d[mode], 0);
  const avg = (total / data.length).toFixed(1);
  const max = Math.max(...data.map((d) => d[mode]));
  const trend = data[data.length - 1][mode] - data[0][mode];

  return (
    <section className="bg-white border border-gray-100 rounded-3xl p-7">
      <header className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
            Consumo · 7 dias
          </p>
          <h3 className="text-2xl font-black text-black tracking-tight">Insights de uso</h3>
        </div>
        <div className="flex bg-gray-50 rounded-full p-1">
          {(['mobile', 'internet'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                mode === m ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {CONFIG[m].label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Total"   value={`${total.toFixed(1)} ${cfg.unit}`} />
        <Stat label="Média/dia" value={`${avg} ${cfg.unit}`} />
        <Stat
          label="Pico" value={`${max} ${cfg.unit}`}
          delta={trend >= 0 ? 'up' : 'down'} deltaText={`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}`}
        />
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-44"
      >
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'mobile' ? (
            <BarChart data={data} barSize={22} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip mode={mode} />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey={mode} radius={[8, 8, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d[mode] === max ? cfg.color : '#FECACA'} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="net-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip mode={mode} />} />
              <Area type="monotone" dataKey={mode} stroke="#000" strokeWidth={2} fill="url(#net-gradient)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </section>
  );
}

function Stat({ label, value, delta, deltaText }: {
  label: string; value: string; delta?: 'up' | 'down'; deltaText?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3.5">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <p className="text-lg font-black text-black tracking-tight">{value}</p>
        {delta && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${delta === 'up' ? 'text-[#D52B1E]' : 'text-green-600'}`}>
            {delta === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {deltaText}
          </span>
        )}
      </div>
    </div>
  );
}
