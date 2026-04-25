'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DataPoint } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

type Mode = 'mobile' | 'internet';

// ── MiniBarChart ────────────────────────────────────────────────────────────

interface BarChartProps {
  data: DataPoint[];
  dataKey: Mode;
  max: number;
  color?: string;
  muted?: string;
}

function MiniBarChart({ data, dataKey, max, color = '#D52B1E', muted = '#FEC6C0' }: BarChartProps) {
  const W = 600, H = 160, P = 28;
  const innerW = W - P * 2;
  const innerH = H - P;
  const barW = (innerW / data.length) * 0.6;
  const gap = (innerW / data.length) * 0.4;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const v = d[dataKey];
        const h = (v / max) * (innerH - 20);
        const x = P + i * (barW + gap) + gap / 2;
        const y = innerH - h + 4;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect
              x={x} y={y} width={barW} height={h} rx="6"
              fill={v === max ? color : muted}
              style={{ transition: 'opacity 0.2s', opacity: hover === null || hover === i ? 1 : 0.6 }}
            />
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fill="#A8A299" fontSize="10" fontWeight="600">
              {d.day}
            </text>
            {hover === i && (
              <g>
                <rect x={x + barW / 2 - 22} y={y - 24} width="44" height="20" rx="6" fill="#14120F" />
                <text x={x + barW / 2} y={y - 10} textAnchor="middle" fill="white" fontSize="10" fontWeight="800">
                  {v} GB
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── MiniAreaChart ───────────────────────────────────────────────────────────

interface AreaChartProps {
  data: DataPoint[];
  dataKey: Mode;
  max: number;
  color?: string;
}

function MiniAreaChart({ data, dataKey, max, color = '#D52B1E' }: AreaChartProps) {
  const W = 600, H = 160, P = 28;
  const innerW = W - P * 2;
  const innerH = H - P - 20;
  const stepX = innerW / (data.length - 1);
  const [hover, setHover] = useState<number | null>(null);

  const points = data.map((d, i) => ({
    x: P + i * stepX,
    y: P + (innerH - (d[dataKey] / max) * innerH),
    v: d[dataKey],
    day: d.day,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${P + innerH} L ${points[0].x} ${P + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        const i = Math.round((x - P) / stepX);
        if (i >= 0 && i < points.length) setHover(i);
      }}
    >
      <defs>
        <linearGradient id="areagrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={P} y1={P + innerH * p}
          x2={W - P} y2={P + innerH * p}
          stroke="#ECE8E2" strokeDasharray="3 3"
        />
      ))}
      <path d={areaPath} fill="url(#areagrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 5 : 3} fill={color} stroke="white" strokeWidth={2} />
      ))}
      {points.map((p, i) => (
        <text key={'l' + i} x={p.x} y={H - 4} textAnchor="middle" fill="#A8A299" fontSize="10" fontWeight="600">
          {p.day}
        </text>
      ))}
      {hover != null && (
        <g>
          <line
            x1={points[hover].x} y1={P}
            x2={points[hover].x} y2={P + innerH}
            stroke="#14120F" strokeOpacity="0.15" strokeDasharray="2 4"
          />
          <rect x={points[hover].x - 26} y={points[hover].y - 30} width="52" height="22" rx="6" fill="#14120F" />
          <text x={points[hover].x} y={points[hover].y - 14} textAnchor="middle" fill="white" fontSize="10" fontWeight="800">
            {points[hover].v} GB
          </text>
        </g>
      )}
    </svg>
  );
}

// ── UsageInsights ───────────────────────────────────────────────────────────

export function UsageInsights({ data }: { data: DataPoint[] }) {
  const [mode, setMode] = useState<Mode>('mobile');

  const total = data.reduce((s, d) => s + d[mode], 0);
  const avg = (total / data.length).toFixed(1);
  const max = Math.max(...data.map((d) => d[mode]));
  const trend = data[data.length - 1][mode] - data[0][mode];
  const unit = 'GB';

  return (
    <section
      className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-7"
      data-tour="usage"
    >
      <header className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-1">Consumo · 7 dias</p>
          <h3 className="text-2xl font-black tracking-tight">Insights de uso</h3>
        </div>
        <div className="flex bg-warm-100 dark:bg-warm-700 rounded-full p-1">
          {(['mobile', 'internet'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cx(
                'text-xs font-bold px-3 py-1.5 rounded-full transition-all',
                mode === m
                  ? 'bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900'
                  : 'text-warm-500 hover:text-warm-900 dark:hover:text-warm-50',
              )}
            >
              {m === 'mobile' ? 'Celular' : 'Internet'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: `${total.toFixed(1)} ${unit}` },
          { label: 'Média/dia', value: `${avg} ${unit}` },
          {
            label: 'Pico',
            value: `${max} ${unit}`,
            delta: trend >= 0 ? ('up' as const) : ('down' as const),
            deltaText: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}`,
          },
        ].map((s) => (
          <div key={s.label} className="bg-warm-100 dark:bg-warm-700 rounded-2xl p-3.5">
            <p className="text-[10px] text-warm-500 uppercase tracking-wider font-bold">{s.label}</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-lg font-black tracking-tight tabular-nums">{s.value}</p>
              {s.delta && (
                <span
                  className={cx(
                    'text-[10px] font-bold flex items-center gap-0.5',
                    s.delta === 'up' ? 'text-claro' : 'text-green-600',
                  )}
                >
                  {s.delta === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {s.deltaText}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="h-44">
        {mode === 'mobile' ? (
          <MiniBarChart data={data} dataKey={mode} max={max} />
        ) : (
          <MiniAreaChart data={data} dataKey={mode} max={max} />
        )}
      </div>
    </section>
  );
}
