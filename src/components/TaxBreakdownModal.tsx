"use client"

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { formatCurrency, TaxBracketBreakdown, TAX_CONFIG } from '@/lib/taxCalculator';
import { Analytics } from '@/lib/analytics';

interface TaxBreakdownModalProps {
  taxableIncome: number;
  taxAmount: number;
  bracketBreakdown: TaxBracketBreakdown[];
  isNewLaw: boolean;
  multiplier?: number;
}

export function TaxBreakdownModal({
  taxableIncome,
  taxAmount,
  bracketBreakdown,
  isNewLaw,
  multiplier = 1,
}: TaxBreakdownModalProps) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop screen size
  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Handle open state change and track analytics
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      Analytics.trackTaxBreakdownView(isNewLaw);
    }
  };

  // Get the current tax bracket (highest reached)
  const currentBracket = bracketBreakdown.find(b => b.isHighest);
  const currentBracketNumber = currentBracket?.bracket || 0;

  // Get all brackets configuration
  const allBracketsConfig = isNewLaw ? TAX_CONFIG.NEW_TAX_BRACKETS : TAX_CONFIG.OLD_TAX_BRACKETS;

  // Create full brackets list with all brackets (including disabled ones)
  const allBrackets = allBracketsConfig.map((config, index) => {
    const activeBracket = bracketBreakdown.find(b => b.bracket === index + 1);
    const previousLimit = index === 0 ? 0 : allBracketsConfig[index - 1].limit;

    return {
      bracket: index + 1,
      label: config.label,
      rate: config.rate,
      lowerLimit: previousLimit,
      upperLimit: config.limit,
      taxableAmount: activeBracket?.taxableAmount || 0,
      taxAmount: activeBracket?.taxAmount || 0,
      isActive: !!activeBracket,
      isCurrent: activeBracket?.isHighest || false,
    };
  });

  // Format range for display
  const formatRange = (lower: number, upper: number): string => {
    const formatShort = (v: number) => {
      if (v >= 1000000000) return `${v / 1000000000} tỷ`;
      if (v >= 1000000) return `${v / 1000000} tr`;
      return formatCurrency(v);
    };

    if (upper === Infinity) {
      return `Trên ${formatShort(lower)}`;
    }
    return `${formatShort(lower)} - ${formatShort(upper)}`;
  };

  // Bracket range text for trigger
  const bracketRange = currentBracketNumber > 0
    ? `Bậc 1${currentBracketNumber > 1 ? ` - ${currentBracketNumber}` : ''}`
    : '';

  if (taxableIncome <= 0) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerTrigger asChild>
        <button
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1.5"
          aria-label="Xem chi tiết tính thuế"
        >
          Xem chi tiết từng bậc thuế ({bracketRange})
          <ChevronDown className="h-3 w-3" />
        </button>
      </DrawerTrigger>
      <DrawerContent className={isDesktop ? 'h-full w-[400px]' : 'max-h-[85vh]'}>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">
            Chi tiết tính thuế {isNewLaw ? '(Luật mới - 5 bậc)' : '(Luật cũ - 7 bậc)'}
          </DrawerTitle>
          <DrawerDescription className="text-xs leading-relaxed">
            Thuế TNCN được tính theo phương pháp lũy tiến từng phần. Thu nhập của bạn càng cao thì phần vượt trội sẽ chịu mức thuế suất cao hơn, nhưng các phần thấp hơn vẫn chịu thuế suất thấp.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2 overflow-y-auto flex-1">
          {/* Taxable Income Header */}
          <div className="flex justify-between items-center py-2 border-b border-border mb-3">
            <span className="text-sm text-muted-foreground">Thu nhập tính thuế:</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(taxableIncome * multiplier)} đ
            </span>
          </div>

          {/* Bracket List */}
          <div className="space-y-2">
            {allBrackets.map((bracket) => (
              <div
                key={bracket.bracket}
                className={`rounded-lg p-3 border transition-colors ${bracket.isCurrent
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : bracket.isActive
                    ? 'border-border bg-muted/30'
                    : 'border-border/50 bg-muted/10 opacity-50'
                  }`}
              >
                {/* Bracket Header */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${bracket.isCurrent
                      ? 'text-primary'
                      : bracket.isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                      }`}>
                      {bracket.label}: {Math.round(bracket.rate * 100)}%
                    </span>
                    {bracket.isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">
                        Bậc hiện tại
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${bracket.isCurrent
                    ? 'text-primary'
                    : bracket.isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                    }`}>
                    {formatCurrency(bracket.taxAmount * multiplier)} đ
                  </span>
                </div>

                {/* Bracket Range */}
                <div className="text-xs text-muted-foreground mb-1">
                  ({formatRange(bracket.lowerLimit, bracket.upperLimit)})
                </div>

                {/* Calculation Detail */}
                <div className="text-xs text-muted-foreground">
                  {bracket.isActive
                    ? `${formatCurrency(bracket.taxableAmount * multiplier)} × ${Math.round(bracket.rate * 100)}%`
                    : 'Không áp dụng'
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 mt-3 border-t border-border">
            <span className="text-sm font-medium text-foreground">Tổng thuế TNCN:</span>
            <span className="text-base font-bold text-destructive">
              {formatCurrency(taxAmount * multiplier)} đ
            </span>
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" size="sm">
              Đóng
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
