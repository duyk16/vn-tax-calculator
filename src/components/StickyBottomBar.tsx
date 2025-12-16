"use client"

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/taxCalculator';

interface StickyBottomBarProps {
  netSalary: number;
  grossSalary: number;
  salaryMode: 'gross' | 'net';
  isYearly?: boolean;
}

export function StickyBottomBar({ netSalary, grossSalary, salaryMode, isYearly = false }: StickyBottomBarProps) {
  // When user inputs NET, show calculated Gross as the result
  // When user inputs Gross, show calculated NET as the result
  const displayValue = salaryMode === 'net' ? grossSalary : netSalary;
  const displayLabel = salaryMode === 'net' ? 'Lương Gross cần có' : 'Lương NET (Luật mới)';

  const animatedValue = useAnimatedNumber(displayValue);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://tinhthue.vn');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = 'https://tinhthue.vn';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
        <div>
          <p className="text-xs text-muted-foreground">{displayLabel} {isYearly ? '/ năm' : '/ tháng'}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(animatedValue)} đ
          </p>
        </div>
        <Button
          onClick={handleCopy}
          variant={copied ? "secondary" : "default"}
          className={`gap-2 transition-all duration-300 ${copied
            ? 'bg-success text-success-foreground hover:bg-success/90'
            : 'bg-primary hover:bg-primary/90'
            }`}
          size="sm"
        >
          <div className="relative w-4 h-4">
            <Copy
              className={`h-4 w-4 absolute inset-0 transition-all duration-300 ${copied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                }`}
            />
            <Check
              className={`h-4 w-4 absolute inset-0 transition-all duration-300 ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
            />
          </div>
          {copied ? '' : 'Chia sẻ'}
        </Button>
      </div>
    </div>
  );
}
