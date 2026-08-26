"use client";

import { useState } from "react";
import { collectionTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function CollectionChart() {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...collectionTrend.map((d) => d.target)) * 1.1;
  const width = 560;
  const height = 220;
  const padding = { top: 10, right: 10, bottom: 28, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const groupW = chartW / collectionTrend.length;
  const barW = groupW * 0.32;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[480px]" style={{ height: 240 }}>
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + chartH * f}
            y2={padding.top + chartH * f}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        ))}
        {collectionTrend.map((d, i) => {
          const x = padding.left + i * groupW + groupW / 2;
          const targetH = (d.target / max) * chartH;
          const collectedH = (d.collected / max) * chartH;
          const isHover = hover === i;
          return (
            <g
              key={d.month}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x - barW - 3}
                y={padding.top + chartH - targetH}
                width={barW}
                height={targetH}
                rx={4}
                fill="var(--color-border)"
                opacity={isHover ? 0.9 : 0.7}
              />
              <rect
                x={x + 3}
                y={padding.top + chartH - collectedH}
                width={barW}
                height={collectedH}
                rx={4}
                fill="var(--color-primary)"
                opacity={isHover ? 1 : 0.85}
              />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-text-secondary)"
              >
                {d.month}
              </text>
              {isHover && (
                <g>
                  <rect
                    x={x - 58}
                    y={padding.top + chartH - Math.max(targetH, collectedH) - 46}
                    width={116}
                    height={38}
                    rx={6}
                    fill="var(--color-text)"
                  />
                  <text x={x} y={padding.top + chartH - Math.max(targetH, collectedH) - 30} textAnchor="middle" fontSize={10} fill="white">
                    Collected: {formatCurrency(d.collected)}
                  </text>
                  <text x={x} y={padding.top + chartH - Math.max(targetH, collectedH) - 17} textAnchor="middle" fontSize={10} fill="white">
                    Target: {formatCurrency(d.target)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-primary)]" /> Collected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-border-strong)]" /> Target
        </span>
      </div>
    </div>
  );
}
