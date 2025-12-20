"use client"

import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/taxCalculator';
import { Analytics } from '@/lib/analytics';

export type SalaryMode = 'gross' | 'net';

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
  mode: SalaryMode;
  onModeChange: (mode: SalaryMode) => void;
}

const QUICK_VALUES = [15000000, 30000000, 50000000, 80000000];
const STEP = 1000000;

export function SalaryInput({ value, onChange, mode, onModeChange }: SalaryInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted on client side
  useEffect(() => {
    setIsMounted(true);
    setDisplayValue(formatCurrency(value));
  }, []);

  useEffect(() => {
    if (!isFocused && isMounted) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused, isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue) || 0;
    setDisplayValue(rawValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(formatCurrency(value));
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value > 0 ? value.toString() : '');
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, value - STEP);
    onChange(newValue);
  };

  const handleIncrement = () => {
    onChange(value + STEP);
  };

  return (
    <div className="space-y-3">
      {/* Gross/NET Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-secondary p-1">
          <button
            onClick={() => {
              onModeChange('gross');
              Analytics.trackSalaryModeToggle('gross');
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'gross'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Gross
          </button>
          <button
            onClick={() => {
              onModeChange('net');
              Analytics.trackSalaryModeToggle('net');
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'net'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            NET
          </button>
        </div>
      </div>

      <label className="text-sm font-medium text-muted-foreground block text-center">
        {mode === 'gross' ? 'Nhập lương Gross' : 'Nhập lương NET mong muốn'}
      </label>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleDecrement}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
          aria-label="Giảm 500.000đ"
        >
          <Minus className="h-5 w-5 text-foreground" />
        </button>

        <div className="relative flex-1 max-w-[200px]">
          <input
            id="grossIncome"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="0"
            className="w-full text-center text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30 py-3"
            suppressHydrationWarning
          />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        </div>

        <button
          onClick={handleIncrement}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
          aria-label="Tăng 500.000đ"
        >
          <Plus className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">VNĐ / tháng</p>

      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_VALUES.map((quickValue) => (
          <button
            key={quickValue}
            onClick={() => {
              onChange(quickValue);
              Analytics.trackQuickValueSelect(quickValue);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${value === quickValue
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
          >
            {quickValue / 1000000} tr
          </button>
        ))}
      </div>
    </div>
  );
}
