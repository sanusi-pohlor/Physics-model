import React, { useEffect, useRef } from 'react';
import { GraphTraceSpec } from '../types/physics';

interface LiveTelemetryChartProps {
  title: string;
  traces: GraphTraceSpec[];
  history: Array<Record<string, number>>;
}

export const LiveTelemetryChart: React.FC<LiveTelemetryChartProps> = ({
  title,
  traces,
  history,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Light Theme Background Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (history.length < 2) return;

    // Find global min and max across active traces
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const pt of history) {
      for (const tr of traces) {
        const v = pt[tr.key] ?? 0;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }
    if (!isFinite(minVal) || !isFinite(maxVal)) return;
    if (Math.abs(maxVal - minVal) < 1e-3) {
      maxVal += 1;
      minVal -= 1;
    }
    const pad = (maxVal - minVal) * 0.15;
    const low = minVal - pad;
    const high = maxVal + pad;

    // Draw zero baseline if in range
    if (low < 0 && high > 0) {
      const zeroY = h - ((0 - low) / (high - low)) * h;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(w, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Plot each trace
    traces.forEach((tr) => {
      ctx.strokeStyle = tr.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      history.forEach((pt, idx) => {
        const val = pt[tr.key] ?? 0;
        const x = (idx / Math.max(1, history.length - 1)) * (w - 12) + 6;
        const y = h - ((val - low) / (high - low)) * (h - 16) - 8;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [history, traces]);

  const latest = history[history.length - 1] ?? {};

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-700 truncate">{title}</span>
        <div className="flex items-center gap-3 flex-wrap">
          {traces.map((tr) => (
            <div key={tr.key} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: tr.color }}
              />
              <span className="text-slate-500">{tr.label}:</span>
              <span className="font-mono font-semibold text-slate-900">
                {(latest[tr.key] ?? 0).toFixed(1)} {tr.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={480}
        height={135}
        className="w-full h-[125px] bg-slate-50 rounded-lg border border-slate-200"
      />
    </div>
  );
};
