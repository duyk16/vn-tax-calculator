"use client"

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from './Header';
import { SalaryInput, SalaryMode } from './SalaryInput';
import { DependentStepper } from './DependentStepper';
import { AdvancedSettings } from './AdvancedSettings';
import { ComparisonChart } from './ComparisonChart';
import { SavingsHighlight } from './SavingsHighlight';
import { ResultSummary } from './ResultSummary';
import { StickyBottomBar } from './StickyBottomBar';
import { BackToTopButton } from './BackToTopButton';
import { calculateComparison, calculateGrossFromNet, TaxInput } from '@/lib/taxCalculator';

interface TaxCalculatorProps {
  appVersion?: string;
}

export function TaxCalculator({ appVersion }: TaxCalculatorProps) {
  const [salaryValue, setSalaryValue] = useState(30000000);
  const [salaryMode, setSalaryMode] = useState<SalaryMode>('gross');
  const [dependents, setDependents] = useState(2);
  const [region, setRegion] = useState<1 | 2 | 3 | 4>(1);
  const [insuranceType, setInsuranceType] = useState<'official' | 'none' | 'custom'>('official');
  const [customInsurance, setCustomInsurance] = useState(5000000);

  const [isYearly, setIsYearly] = useState(false);

  // Calculate the gross salary to use for tax calculation
  const grossSalary = useMemo(() => {
    if (salaryMode === 'gross') {
      return salaryValue;
    }
    // NET mode: calculate gross from net
    return calculateGrossFromNet(
      salaryValue,
      dependents,
      region,
      insuranceType,
      customInsurance,
      true // Use new law for calculation
    );
  }, [salaryValue, salaryMode, dependents, region, insuranceType, customInsurance]);

  const input: TaxInput = useMemo(() => ({
    grossSalary,
    dependents,
    region,
    insuranceType,
    customInsurance,
  }), [grossSalary, dependents, region, insuranceType, customInsurance]);

  const result = useMemo(() => calculateComparison(input), [input]);

  const multiplier = isYearly ? 12 : 1;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="max-w-md mx-auto px-3 py-4 space-y-4">
        {/* Input Section */}
        <section className="bg-card rounded-xl p-4 card-shadow-lg">
          <SalaryInput
            value={salaryValue}
            onChange={setSalaryValue}
            mode={salaryMode}
            onModeChange={setSalaryMode}
          />
        </section>

        {/* Dependent Stepper */}
        <DependentStepper
          value={dependents}
          onChange={setDependents}
        />

        {/* Advanced Settings */}
        <div className="bg-card rounded-xl p-3 card-shadow">
          <AdvancedSettings
            region={region}
            insuranceType={insuranceType}
            customInsurance={customInsurance}
            onRegionChange={setRegion}
            onInsuranceChange={setInsuranceType}
            onCustomInsuranceChange={setCustomInsurance}
          />
        </div>

        {/* Results Section */}

        <section className="space-y-4 animate-fade-slide-up">
          {/* Savings Highlight */}
          <SavingsHighlight
            monthlySavings={result.savings}
            savingsPercentage={result.savingsPercentage}
            isYearly={isYearly}
            onToggleYearly={setIsYearly}
          />

          {/* Comparison Chart */}
          <div className="bg-card rounded-xl p-4 card-shadow">
            <h3 className="text-sm font-semibold text-foreground mb-3">So sánh lương thực nhận</h3>
            <ComparisonChart
              oldNetSalary={result.oldLaw.netSalary * multiplier}
              newNetSalary={result.newLaw.netSalary * multiplier}
              maxSalary={result.newLaw.grossSalary * multiplier}
            />
          </div>

          {/* Detail Cards */}
          <div className="space-y-3">
            <ResultSummary
              result={result.newLaw}
              label="Theo Luật Thuế Mới (5 bậc - từ 2026)"
              isNew
              multiplier={multiplier}
            />
            <ResultSummary
              result={result.oldLaw}
              label="Theo Luật Thuế Cũ (7 bậc)"
              multiplier={multiplier}
            />
          </div>
        </section>

        {/* Footer - 2 columns */}
        <footer className="pt-4 pb-2">
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">TinhThue.vn</p>
              <p>Công cụ tính thuế TNCN theo luật thuế mới 2026</p>
              {appVersion && <p className="mt-1 opacity-80">Phiên bản: {appVersion}</p>}
            </div>
            <div className="text-right">
              <p className="mb-1">Phát hành theo giấy phép MIT</p>
              <div className="flex flex-col items-end gap-1">
                <a
                  href="https://github.com/duyk16/vn-tax-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-foreground hover:underline"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <Link href="/legacy" className="text-foreground hover:underline inline-flex items-center gap-1.5">
                  Phiên bản cũ
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <StickyBottomBar
        netSalary={result.newLaw.netSalary * multiplier}
        grossSalary={result.newLaw.grossSalary * multiplier}
        salaryMode={salaryMode}
        isYearly={isYearly}
      />
      <BackToTopButton />
    </div>
  );
}
