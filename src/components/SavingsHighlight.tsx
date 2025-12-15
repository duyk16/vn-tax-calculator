"use client"

import { TrendingUp } from 'lucide-react';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/taxCalculator';
import { Switch } from '@/components/ui/switch';

interface SavingsHighlightProps {
  monthlySavings: number;
  savingsPercentage: number;
  isYearly: boolean;
  onToggleYearly: (value: boolean) => void;
}

export function SavingsHighlight({ monthlySavings, savingsPercentage, isYearly, onToggleYearly }: SavingsHighlightProps) {
  const displaySavings = isYearly ? monthlySavings * 12 : monthlySavings;
  const animatedSavings = useAnimatedNumber(displaySavings);
  const isPositive = monthlySavings > 0;

  return (
    <div className={`rounded-2xl p-4 text-center transition-all duration-300 ${isPositive ? 'bg-success-light' : 'bg-secondary'
      }`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        {isPositive && (
          <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          Thu nhập tăng lên (Luật mới vs Luật cũ)
        </span>
      </div>

      <p className={`text-2xl font-bold mb-1 ${isPositive ? 'text-success' : 'text-muted-foreground'
        }`}>
        {isPositive ? '+' : ''}{formatCurrency(animatedSavings)} đ
      </p>

      {isPositive && (
        <p className="text-xs text-success/80 mb-3">
          Tăng {savingsPercentage.toFixed(1)}% so với luật cũ
        </p>
      )}

      <div className="flex items-center justify-center gap-3 pt-1">
        <span className={`text-xs font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          Tháng
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={onToggleYearly}
          className="data-[state=checked]:bg-success"
        />
        <span className={`text-xs font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          Năm
        </span>
      </div>
    </div>
  );
}
