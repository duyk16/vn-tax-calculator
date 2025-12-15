"use client"

import { useState } from 'react';
import { Search, Minus, Plus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatCurrency, TAX_CONFIG } from '@/lib/taxCalculator';

interface AdvancedSettingsProps {
  region: 1 | 2 | 3 | 4;
  insuranceType: 'official' | 'none' | 'custom';
  customInsurance: number;
  onRegionChange: (value: 1 | 2 | 3 | 4) => void;
  onInsuranceChange: (value: 'official' | 'none' | 'custom') => void;
  onCustomInsuranceChange: (value: number) => void;
}

const REGIONS = [
  {
    value: 1 as const,
    label: 'Vùng 1',
    description: 'Hà Nội, TP.HCM, Hải Phòng...',
  },
  {
    value: 2 as const,
    label: 'Vùng 2',
    description: 'Đà Nẵng, Cần Thơ...',
  },
  {
    value: 3 as const,
    label: 'Vùng 3',
    description: 'Các tỉnh còn lại',
  },
  {
    value: 4 as const,
    label: 'Vùng 4',
    description: 'Vùng nông thôn, miền núi',
  },
];

const ALL_PROVINCES = [
  { name: 'Hà Nội', region: 1 },
  { name: 'TP. Hồ Chí Minh', region: 1 },
  { name: 'Hải Phòng', region: 1 },
  { name: 'Bình Dương', region: 1 },
  { name: 'Đồng Nai', region: 1 },
  { name: 'Bà Rịa - Vũng Tàu', region: 1 },
  { name: 'Đà Nẵng', region: 2 },
  { name: 'Cần Thơ', region: 2 },
  { name: 'Quảng Ninh', region: 2 },
  { name: 'Khánh Hòa', region: 2 },
  { name: 'Long An', region: 2 },
  { name: 'Bắc Ninh', region: 2 },
  { name: 'Thanh Hóa', region: 3 },
  { name: 'Nghệ An', region: 3 },
  { name: 'Bình Thuận', region: 3 },
  { name: 'Đắk Lắk', region: 3 },
  { name: 'Cao Bằng', region: 4 },
  { name: 'Bắc Kạn', region: 4 },
  { name: 'Lạng Sơn', region: 4 },
  { name: 'Hà Giang', region: 4 },
];

const INSURANCE_TYPES = [
  { value: 'official' as const, label: 'Theo lương chính thức', description: 'Đóng BH theo lương Gross' },
  { value: 'none' as const, label: 'Không đóng', description: 'Không tham gia BH' },
  { value: 'custom' as const, label: 'Tuỳ chỉnh', description: 'Nhập số tiền đóng BH' },
];

const INSURANCE_QUICK_VALUES = [5000000, 7000000, 10000000, 20000000];
const INSURANCE_STEP = 500000;

export function AdvancedSettings({
  region,
  insuranceType,
  customInsurance,
  onRegionChange,
  onInsuranceChange,
  onCustomInsuranceChange,
}: AdvancedSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProvinces = searchQuery.trim()
    ? ALL_PROVINCES.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleProvinceSelect = (province: typeof ALL_PROVINCES[0]) => {
    onRegionChange(province.region as 1 | 2 | 3 | 4);
    setSearchQuery('');
  };

  const handleInsuranceDecrement = () => {
    const newValue = Math.max(0, customInsurance - INSURANCE_STEP);
    onCustomInsuranceChange(newValue);
  };

  const handleInsuranceIncrement = () => {
    onCustomInsuranceChange(customInsurance + INSURANCE_STEP);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="settings" className="border-none">
        <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-foreground hover:no-underline">
          <span className="flex items-center gap-2">
            Cài đặt nâng cao
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Region Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Vùng lương tối thiểu
            </label>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tỉnh/thành phố..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Search results */}
            {filteredProvinces.length > 0 && (
              <div className="bg-secondary rounded-lg max-h-32 overflow-y-auto">
                {filteredProvinces.map((province) => (
                  <button
                    key={province.name}
                    onClick={() => handleProvinceSelect(province)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex justify-between items-center"
                  >
                    <span>{province.name}</span>
                    <span className="text-xs text-muted-foreground">Vùng {province.region}</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Mức trần BHTN: {formatCurrency(TAX_CONFIG.REGIONAL_BHTN_CEILING[region])} ₫
            </p>

            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  id={r.value === 1 ? 'region' : undefined}
                  onClick={() => onRegionChange(r.value)}
                  className={`p-2.5 rounded-lg text-left transition-all duration-200 ${region === r.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                >
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className={`text-xs ${region === r.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {r.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Insurance Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Loại bảo hiểm
            </label>
            <div className="space-y-2">
              {INSURANCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onInsuranceChange(type.value)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${insuranceType === type.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                >
                  <div>
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className={`text-xs ${insuranceType === type.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {type.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${insuranceType === type.value
                    ? 'border-primary-foreground'
                    : 'border-muted-foreground/30'
                    }`}>
                    {insuranceType === type.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Insurance Input */}
            {insuranceType === 'custom' && (
              <div className="mt-3 p-3 bg-secondary/50 rounded-lg space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleInsuranceDecrement}
                    className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
                    aria-label="Giảm 500.000đ"
                  >
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>

                  <div className="text-center">
                    <input
                      id="insuranceBaseSalary"
                      type="text"
                      value={formatCurrency(customInsurance)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        onCustomInsuranceChange(parseInt(rawValue) || 0);
                      }}
                      className="text-lg font-bold text-foreground bg-transparent border-none outline-none text-center w-32"
                    />
                    <p className="text-xs text-muted-foreground">Tổng BH/tháng</p>
                  </div>

                  <button
                    onClick={handleInsuranceIncrement}
                    className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-accent transition-colors active:scale-95"
                    aria-label="Tăng 500.000đ"
                  >
                    <Plus className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5">
                  {INSURANCE_QUICK_VALUES.map((quickValue) => (
                    <button
                      key={quickValue}
                      onClick={() => onCustomInsuranceChange(quickValue)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${customInsurance === quickValue
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-secondary-foreground hover:bg-accent'
                        }`}
                    >
                      {quickValue / 1000000} tr
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
