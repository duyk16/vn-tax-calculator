"use client"

import { useEffect, useRef } from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { Analytics } from '@/lib/analytics';

interface DependentStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export function DependentStepper({ value, onChange }: DependentStepperProps) {
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track dependent changes with debounce
  useEffect(() => {
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current);
    }

    trackingTimeoutRef.current = setTimeout(() => {
      Analytics.trackDependentsChange(value);
    }, 1000);

    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, [value]);

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  return (
    <div className="bg-card rounded-xl p-3 card-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm flex items-center gap-1">
              Người phụ thuộc
              <InfoTooltip content="Người phụ thuộc là con dưới 18 tuổi, con đang học (dưới 25 tuổi), cha mẹ không có thu nhập. Mỗi người được giảm trừ 4.4tr (cũ) hoặc 6.2tr (mới)/tháng." />
            </p>
            <p className="text-xs text-muted-foreground">Giảm trừ gia cảnh</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={value === 0}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            aria-label="Giảm người phụ thuộc"
          >
            <Minus className="h-4 w-4 text-foreground" />
          </button>
          <span className="w-8 text-center text-xl font-bold text-foreground">{value}</span>
          <button
            onClick={handleIncrement}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
            aria-label="Tăng người phụ thuộc"
          >
            <Plus className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
