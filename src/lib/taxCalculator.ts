// Vietnamese Tax Calculator (2026)
// All amounts in VND
// CORRECT LOGIC: 7-bracket (old) vs 5-bracket (new) comparison

export interface TaxInput {
  grossSalary: number
  dependents: number
  region: 1 | 2 | 3 | 4
  insuranceType: "official" | "none" | "custom"
  customInsurance?: number
}

export interface TaxResult {
  grossSalary: number
  socialInsurance: number
  healthInsurance: number
  unemploymentInsurance: number
  totalInsurance: number
  personalDeduction: number
  dependentDeduction: number
  totalDeduction: number
  taxableIncome: number
  taxAmount: number
  netSalary: number
  bracket: string
}

export interface ComparisonResult {
  oldLaw: TaxResult
  newLaw: TaxResult
  savings: number
  savingsPercentage: number
}

// Insurance caps
const BHXH_BHYT_CEILING = 46800000 // 20 × 2,340,000 VND

const REGIONAL_BHTN_CEILING: Record<number, number> = {
  1: 99200000, // Vùng I: 20 × 4,960,000
  2: 88200000, // Vùng II: 20 × 4,410,000
  3: 77200000, // Vùng III: 20 × 3,860,000
  4: 69000000, // Vùng IV: 20 × 3,450,000
}

// Insurance rates (employee contribution)
const INSURANCE_RATES = {
  social: 0.08, // 8%
  health: 0.015, // 1.5%
  unemployment: 0.01, // 1%
}

// OLD LAW: 7 brackets
const OLD_PERSONAL_DEDUCTION = 11000000
const OLD_DEPENDENT_DEDUCTION = 4400000
const OLD_TAX_BRACKETS = [
  { limit: 5000000, rate: 0.05, label: "Bậc 1" },
  { limit: 10000000, rate: 0.1, label: "Bậc 2" },
  { limit: 18000000, rate: 0.15, label: "Bậc 3" },
  { limit: 32000000, rate: 0.2, label: "Bậc 4" },
  { limit: 52000000, rate: 0.25, label: "Bậc 5" },
  { limit: 80000000, rate: 0.3, label: "Bậc 6" },
  { limit: Infinity, rate: 0.35, label: "Bậc 7" },
]

// NEW LAW: 5 brackets (from 01/01/2026)
const NEW_PERSONAL_DEDUCTION = 15500000
const NEW_DEPENDENT_DEDUCTION = 6200000
const NEW_TAX_BRACKETS = [
  { limit: 10000000, rate: 0.05, label: "Bậc 1" },
  { limit: 30000000, rate: 0.15, label: "Bậc 2" },
  { limit: 60000000, rate: 0.25, label: "Bậc 3" },
  { limit: 100000000, rate: 0.3, label: "Bậc 4" },
  { limit: Infinity, rate: 0.35, label: "Bậc 5" },
]

function calculateInsurance(
  grossSalary: number,
  region: number,
  insuranceType: "official" | "none" | "custom",
  customInsurance?: number
): {
  social: number
  health: number
  unemployment: number
  total: number
} {
  if (insuranceType === "none") {
    return { social: 0, health: 0, unemployment: 0, total: 0 }
  }

  if (insuranceType === "custom" && customInsurance !== undefined) {
    // Custom insurance - distribute proportionally
    const totalRate = INSURANCE_RATES.social + INSURANCE_RATES.health + INSURANCE_RATES.unemployment
    const social = (INSURANCE_RATES.social / totalRate) * customInsurance
    const health = (INSURANCE_RATES.health / totalRate) * customInsurance
    const unemployment = (INSURANCE_RATES.unemployment / totalRate) * customInsurance
    return { social, health, unemployment, total: customInsurance }
  }

  // Official - calculate based on gross salary with caps
  const cappedBHXH_BHYT = Math.min(grossSalary, BHXH_BHYT_CEILING)
  const social = cappedBHXH_BHYT * INSURANCE_RATES.social
  const health = cappedBHXH_BHYT * INSURANCE_RATES.health

  const bhtnCeiling = REGIONAL_BHTN_CEILING[region] || REGIONAL_BHTN_CEILING[1]
  const cappedBHTN = Math.min(grossSalary, bhtnCeiling)
  const unemployment = cappedBHTN * INSURANCE_RATES.unemployment

  return {
    social,
    health,
    unemployment,
    total: social + health + unemployment,
  }
}

function calculateProgressiveTax(
  taxableIncome: number,
  brackets: typeof OLD_TAX_BRACKETS
): { tax: number; bracket: string } {
  if (taxableIncome <= 0) {
    return { tax: 0, bracket: "Không chịu thuế" }
  }

  let tax = 0
  let previousLimit = 0
  let currentBracket = brackets[0].label

  for (const bracket of brackets) {
    if (taxableIncome <= previousLimit) break

    const taxableAmount = Math.min(taxableIncome, bracket.limit) - previousLimit
    tax += taxableAmount * bracket.rate

    if (taxableIncome <= bracket.limit) {
      currentBracket = bracket.label
      break
    }

    previousLimit = bracket.limit
    currentBracket = bracket.label
  }

  return { tax, bracket: currentBracket }
}

function calculateTax(input: TaxInput, isNewLaw: boolean): TaxResult {
  const insurance = calculateInsurance(input.grossSalary, input.region, input.insuranceType, input.customInsurance)

  const personalDeduction = isNewLaw ? NEW_PERSONAL_DEDUCTION : OLD_PERSONAL_DEDUCTION
  const dependentDeduction = (isNewLaw ? NEW_DEPENDENT_DEDUCTION : OLD_DEPENDENT_DEDUCTION) * input.dependents
  const totalDeduction = personalDeduction + dependentDeduction

  const brackets = isNewLaw ? NEW_TAX_BRACKETS : OLD_TAX_BRACKETS

  const incomeAfterInsurance = input.grossSalary - insurance.total
  const taxableIncome = Math.max(0, incomeAfterInsurance - totalDeduction)
  const { tax: taxAmount, bracket } = calculateProgressiveTax(taxableIncome, brackets)
  const netSalary = input.grossSalary - insurance.total - taxAmount

  return {
    grossSalary: input.grossSalary,
    socialInsurance: insurance.social,
    healthInsurance: insurance.health,
    unemploymentInsurance: insurance.unemployment,
    totalInsurance: insurance.total,
    personalDeduction,
    dependentDeduction,
    totalDeduction,
    taxableIncome,
    taxAmount,
    netSalary,
    bracket,
  }
}

export function calculateComparison(input: TaxInput): ComparisonResult {
  const oldLaw = calculateTax(input, false)
  const newLaw = calculateTax(input, true)
  const savings = newLaw.netSalary - oldLaw.netSalary
  const savingsPercentage = oldLaw.netSalary > 0 ? (savings / oldLaw.netSalary) * 100 : 0

  return {
    oldLaw,
    newLaw,
    savings,
    savingsPercentage,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount))
}

export function formatCurrencyShort(amount: number): string {
  if (Math.abs(amount) >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`
  }
  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} tr`
  }
  return formatCurrency(amount)
}

// Export constants for display
export const TAX_CONFIG = {
  OLD_PERSONAL_DEDUCTION,
  OLD_DEPENDENT_DEDUCTION,
  NEW_PERSONAL_DEDUCTION,
  NEW_DEPENDENT_DEDUCTION,
  OLD_TAX_BRACKETS,
  NEW_TAX_BRACKETS,
  BHXH_BHYT_CEILING,
  REGIONAL_BHTN_CEILING,
}
