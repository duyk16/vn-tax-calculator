"use client"

import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/taxCalculator';

interface ComparisonChartProps {
  oldNetSalary: number;
  newNetSalary: number;
  maxSalary: number;
}

export function ComparisonChart({ oldNetSalary, newNetSalary, maxSalary }: ComparisonChartProps) {
  const animatedOld = useAnimatedNumber(oldNetSalary);
  const animatedNew = useAnimatedNumber(newNetSalary);

  const oldPercentage = maxSalary > 0 ? (oldNetSalary / maxSalary) * 100 : 0;
  const newPercentage = maxSalary > 0 ? (newNetSalary / maxSalary) * 100 : 0;
  const savingsPercentage = newPercentage - oldPercentage;

  return (
    <div className="space-y-5">
      {/* Old Law Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Luật cũ (7 bậc)</span>
          <span className="font-semibold text-foreground">{formatCurrency(animatedOld)} đ</span>
        </div>
        <div className="h-8 bg-secondary rounded-full overflow-hidden relative">
          <div
            className="h-full bg-chart-old rounded-full transition-all duration-500 ease-out"
            style={{ width: `${oldPercentage}%` }}
          />
        </div>
      </div>

      {/* New Law Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary font-medium">Luật mới (5 bậc)</span>
          <span className="font-semibold text-primary">{formatCurrency(animatedNew)} đ</span>
        </div>
        <div className="h-8 bg-secondary rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out flex"
            style={{ width: `${newPercentage}%` }}
          >
            <div
              className="h-full bg-chart-new"
              style={{ width: `${oldPercentage > 0 ? (oldPercentage / newPercentage) * 100 : 100}%` }}
            />
            {savingsPercentage > 0 && (
              <div
                className="h-full bg-chart-savings animate-pulse"
                style={{ width: `${(savingsPercentage / newPercentage) * 100}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-old" />
          <span className="text-xs text-muted-foreground">Luật cũ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-new" />
          <span className="text-xs text-muted-foreground">Luật mới</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-savings" />
          <span className="text-xs text-muted-foreground">Tiết kiệm</span>
        </div>
      </div>
    </div>
  );
}
