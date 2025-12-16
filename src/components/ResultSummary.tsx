"use client"

import { ArrowRight } from 'lucide-react';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency, TaxResult } from '@/lib/taxCalculator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TaxBreakdownModal } from './TaxBreakdownModal';
import { InfoTooltip } from './InfoTooltip';

interface ResultSummaryProps {
  result: TaxResult;
  label: string;
  isNew?: boolean;
  multiplier?: number;
}

export function ResultSummary({ result, label, isNew = false, multiplier = 1 }: ResultSummaryProps) {
  const animatedGross = useAnimatedNumber(result.grossSalary * multiplier);
  const animatedTotalDeductions = useAnimatedNumber((result.totalInsurance + result.taxAmount) * multiplier);
  const animatedNet = useAnimatedNumber(result.netSalary * multiplier);

  return (
    <div className={`rounded-xl overflow-hidden card-shadow ${isNew ? 'ring-2 ring-primary' : ''}`}>
      <div className={`px-3 py-2 ${isNew ? 'bg-primary' : 'bg-muted'}`}>
        <p className={`text-xs font-semibold ${isNew ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
          {label}
        </p>
      </div>

      <div className="bg-card p-3">
        {/* Summary Flow */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="text-center flex-1">
            <p className="text-muted-foreground text-xs mb-0.5">Gross</p>
            <p className="font-semibold text-foreground text-xs">{formatCurrency(animatedGross)}</p>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-1" />
          <div className="text-center flex-1">
            <p className="text-muted-foreground text-xs mb-0.5">Thuế & BH</p>
            <p className="font-semibold text-destructive text-xs">-{formatCurrency(animatedTotalDeductions)}</p>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-1" />
          <div className="text-center flex-1">
            <p className="text-muted-foreground text-xs mb-0.5">Thực nhận</p>
            <p className={`font-bold text-xs ${isNew ? 'text-primary' : 'text-foreground'}`}>
              {formatCurrency(animatedNet)}
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-1.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline">
              Xem chi tiết đóng bảo hiểm & giảm trừ
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-2 text-sm">
                <div className="space-y-1.5 pb-2 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bảo hiểm bắt buộc</p>
                  <DetailRow label="BHXH (8%)" value={result.socialInsurance * multiplier} isNegative />
                  <DetailRow label="BHYT (1.5%)" value={result.healthInsurance * multiplier} isNegative />
                  <DetailRow label="BHTN (1%)" value={result.unemploymentInsurance * multiplier} isNegative />
                  <DetailRow label="Tổng BH" value={result.totalInsurance * multiplier} isNegative isBold />
                </div>

                <div className="space-y-1.5 pb-2 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    Giảm trừ
                    <InfoTooltip content="Mức miễn thuế cố định cho bản thân (11tr cũ / 15.5tr mới) cộng với mức giảm trừ cho người phụ thuộc." />
                  </p>
                  <DetailRow label="Giảm trừ bản thân" value={result.personalDeduction * multiplier} />
                  <DetailRow label="Giảm trừ người PT" value={result.dependentDeduction * multiplier} />
                  <DetailRow label="Tổng giảm trừ" value={result.totalDeduction * multiplier} isBold />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    Thuế TNCN
                    <InfoTooltip content="Thuế TNCN tính theo biểu thuế lũy tiến từng phần: thu nhập càng cao, phần vượt bị đánh thuế cao hơn." />
                  </p>
                  <DetailRow label="Thu nhập chịu thuế" value={result.taxableIncome * multiplier} />
                  <DetailRow label={`Bậc thuế: ${result.bracket}`} value={result.taxAmount * multiplier} isNegative isBold />
                  <TaxBreakdownModal
                    taxableIncome={result.taxableIncome}
                    taxAmount={result.taxAmount}
                    bracketBreakdown={result.bracketBreakdown}
                    isNewLaw={isNew}
                    multiplier={multiplier}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  isNegative = false,
  isBold = false
}: {
  label: string;
  value: number;
  isNegative?: boolean;
  isBold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-muted-foreground text-xs ${isBold ? 'font-medium' : ''}`}>{label}</span>
      <span className={`text-xs ${isBold ? 'font-semibold' : ''} ${isNegative && value > 0 ? 'text-destructive' : 'text-foreground'}`}>
        {isNegative && value > 0 ? '-' : ''}{formatCurrency(value)} đ
      </span>
    </div>
  );
}
