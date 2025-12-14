"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@//components/ui/card"
import { Input } from "@//components/ui/input"
import { Label } from "@//components/ui/label"
import { Button } from "@//components/ui/button"
import { Alert, AlertDescription } from "@//components/ui/alert"
import { Badge } from "@//components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@//components/ui/table"
import { RadioGroup, RadioGroupItem } from "@//components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@//components/ui/select"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calculator, TrendingUp, Info, Wallet, Users } from "lucide-react"

const OLD_TAX_BRACKETS = [
  { limit: 5000000, rate: 0.05, label: "Bậc 1" },
  { limit: 10000000, rate: 0.1, label: "Bậc 2" },
  { limit: 18000000, rate: 0.15, label: "Bậc 3" },
  { limit: 32000000, rate: 0.2, label: "Bậc 4" },
  { limit: 52000000, rate: 0.25, label: "Bậc 5" },
  { limit: 80000000, rate: 0.3, label: "Bậc 6" },
  { limit: Number.POSITIVE_INFINITY, rate: 0.35, label: "Bậc 7" },
]

const NEW_TAX_BRACKETS = [
  { limit: 10000000, rate: 0.05, label: "Bậc 1" },
  { limit: 30000000, rate: 0.15, label: "Bậc 2" },
  { limit: 60000000, rate: 0.25, label: "Bậc 3" },
  { limit: 100000000, rate: 0.3, label: "Bậc 4" },
  { limit: Number.POSITIVE_INFINITY, rate: 0.35, label: "Bậc 5" },
]

const OLD_PERSONAL_DEDUCTION = 11000000
const OLD_DEPENDENT_DEDUCTION = 4400000
const NEW_PERSONAL_DEDUCTION = 15500000
const NEW_DEPENDENT_DEDUCTION = 6200000

const BHXH_BHYT_CEILING = 46800000 // 20 × 2,340,000 VND
const BHXH_RATE = 0.08 // 8%
const BHYT_RATE = 0.015 // 1.5%
const BHTN_RATE = 0.01 // 1%

const REGIONAL_DATA = {
  region1: { name: "Vùng I", minWage: 4960000, bhtnCeiling: 99200000 },
  region2: { name: "Vùng II", minWage: 4410000, bhtnCeiling: 88200000 },
  region3: { name: "Vùng III", minWage: 3860000, bhtnCeiling: 77200000 },
  region4: { name: "Vùng IV", minWage: 3450000, bhtnCeiling: 69000000 },
}

function calculateTax(taxableIncome: number, brackets: typeof OLD_TAX_BRACKETS): number {
  let tax = 0
  let previousLimit = 0

  for (const bracket of brackets) {
    if (taxableIncome <= previousLimit) break

    const taxableAmount = Math.min(taxableIncome, bracket.limit) - previousLimit
    tax += taxableAmount * bracket.rate
    previousLimit = bracket.limit
  }

  return tax
}

function getCurrentBracket(taxableIncome: number, brackets: typeof OLD_TAX_BRACKETS): string {
  let previousLimit = 0
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.limit) {
      return bracket.label
    }
    previousLimit = bracket.limit
  }
  return brackets[brackets.length - 1].label
}

export default function TaxCalculator() {
  const [grossIncome, setGrossIncome] = useState<string>("40000000")
  const [numDependents, setNumDependents] = useState<string>("2")
  const [region, setRegion] = useState<string>("region1")
  const [insuranceMode, setInsuranceMode] = useState<"auto" | "custom">("auto")
  const [insuranceBaseSalary, setInsuranceBaseSalary] = useState<string>("10000000")
  const [results, setResults] = useState<any>(null)

  const formatNumber = (value: string): string => {
    const num = value.replace(/\D/g, "")
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const cleanValue = value.replace(/,/g, "")
    setter(cleanValue)
  }

  const handleCalculate = () => {
    const gross = Number.parseFloat(grossIncome) || 0
    const dependents = Number.parseInt(numDependents) || 0
    const selectedRegion = REGIONAL_DATA[region as keyof typeof REGIONAL_DATA]

    let insurance = 0
    let bhxhAmount = 0
    let bhytAmount = 0
    let bhtnAmount = 0

    let baseSalary = 0

    if (insuranceMode === "auto") {
      baseSalary = gross
    } else {
      baseSalary = Number.parseFloat(insuranceBaseSalary) || 0
      if (baseSalary > gross) {
        baseSalary = gross
      }
    }

    const cappedSalaryBHXH_BHYT = Math.min(baseSalary, BHXH_BHYT_CEILING)
    bhxhAmount = cappedSalaryBHXH_BHYT * BHXH_RATE
    bhytAmount = cappedSalaryBHXH_BHYT * BHYT_RATE

    const cappedSalaryBHTN = Math.min(baseSalary, selectedRegion.bhtnCeiling)
    bhtnAmount = cappedSalaryBHTN * BHTN_RATE

    insurance = bhxhAmount + bhytAmount + bhtnAmount

    const oldTotalDeductions = OLD_PERSONAL_DEDUCTION + dependents * OLD_DEPENDENT_DEDUCTION
    const oldTaxableIncome = Math.max(0, gross - insurance - oldTotalDeductions)

    const newTotalDeductions = NEW_PERSONAL_DEDUCTION + dependents * NEW_DEPENDENT_DEDUCTION
    const newTaxableIncome = Math.max(0, gross - insurance - newTotalDeductions)

    const oldTax = calculateTax(oldTaxableIncome, OLD_TAX_BRACKETS)
    const newTax = calculateTax(newTaxableIncome, NEW_TAX_BRACKETS)

    const oldDisposable = gross - oldTax - insurance
    const newDisposable = gross - newTax - insurance

    const taxReduction = oldTax - newTax
    const disposableIncrease = newDisposable - oldDisposable

    const oldBracket = getCurrentBracket(oldTaxableIncome, OLD_TAX_BRACKETS)
    const newBracket = getCurrentBracket(newTaxableIncome, NEW_TAX_BRACKETS)

    setResults({
      oldTaxableIncome,
      newTaxableIncome,
      oldTax,
      newTax,
      oldDisposable,
      newDisposable,
      taxReduction,
      disposableIncrease,
      oldBracket,
      newBracket,
      gross,
      insurance,
      bhxhAmount,
      bhytAmount,
      bhtnAmount,
      oldTotalDeductions,
      newTotalDeductions,
    })
  }

  useEffect(() => {
    handleCalculate()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  const disposableIncomeData = results
    ? [
        {
          name: "Cũ (7 bậc)",
          value: results.oldDisposable,
        },
        {
          name: "Mới (5 bậc)",
          value: results.newDisposable,
        },
      ]
    : []

  const oldPieData = results
    ? [
        { name: "Thuế", value: results.oldTax },
        { name: "Thu nhập", value: results.oldDisposable },
      ]
    : []

  const newPieData = results
    ? [
        { name: "Thuế", value: results.newTax },
        { name: "Thu nhập", value: results.newDisposable },
      ]
    : []

  const oldBracketData = OLD_TAX_BRACKETS.map((bracket, index) => ({
    name: bracket.label,
    start: index === 0 ? 0 : OLD_TAX_BRACKETS[index - 1].limit,
    end: bracket.limit === Number.POSITIVE_INFINITY ? 100000000 : bracket.limit,
    rate: bracket.rate * 100,
    isHighlighted: results
      ? results.oldTaxableIncome > (index === 0 ? 0 : OLD_TAX_BRACKETS[index - 1].limit) &&
        results.oldTaxableIncome <= bracket.limit
      : false,
  }))

  const newBracketData = NEW_TAX_BRACKETS.map((bracket, index) => ({
    name: bracket.label,
    start: index === 0 ? 0 : NEW_TAX_BRACKETS[index - 1].limit,
    end: bracket.limit === Number.POSITIVE_INFINITY ? 100000000 : bracket.limit,
    rate: bracket.rate * 100,
    isHighlighted: results
      ? results.newTaxableIncome > (index === 0 ? 0 : NEW_TAX_BRACKETS[index - 1].limit) &&
        results.newTaxableIncome <= bracket.limit
      : false,
  }))

  const OLD_PIE_COLORS = ["hsl(0 84% 60%)", "hsl(142 76% 36%)"] // Red for tax, green for income
  const NEW_PIE_COLORS = ["hsl(0 84% 60%)", "hsl(142 76% 36%)"] // Red for tax, green for income

  const calculateTaxPerBracket = (taxableIncome: number, brackets: typeof OLD_TAX_BRACKETS) => {
    let previousLimit = 0
    return brackets.map((bracket) => {
      if (taxableIncome <= previousLimit) {
        return 0
      }
      const taxableAmount = Math.min(taxableIncome, bracket.limit) - previousLimit
      const tax = taxableAmount * bracket.rate
      previousLimit = bracket.limit
      return tax
    })
  }

  const oldTaxPerBracket = results ? calculateTaxPerBracket(results.oldTaxableIncome, OLD_TAX_BRACKETS) : []
  const newTaxPerBracket = results ? calculateTaxPerBracket(results.newTaxableIncome, NEW_TAX_BRACKETS) : []

  const formatBracketRange = (index: number, brackets: typeof OLD_TAX_BRACKETS) => {
    const previousLimit = index === 0 ? 0 : brackets[index - 1].limit
    const currentLimit = brackets[index].limit

    if (currentLimit === Number.POSITIVE_INFINITY) {
      return `Trên ${formatCurrency(previousLimit)}`
    }
    if (index === 0) {
      return `Đến ${formatCurrency(currentLimit)}`
    }
    return `Trên ${formatCurrency(previousLimit)} đến ${formatCurrency(currentLimit)}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Công cụ Tính Thuế TNCN</h1>
              <p className="text-sm text-muted-foreground">So sánh biểu thuế 7 bậc và 5 bậc (từ 01/01/2026)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[350px_1fr]">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nhập Thông tin Thu nhập</CardTitle>
                <CardDescription>Điền thông tin để tính toán thuế</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="grossIncome">Tổng Thu nhập/tháng (Gross)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="grossIncome"
                      type="text"
                      placeholder="40,000,000"
                      value={formatNumber(grossIncome)}
                      onChange={(e) => handleNumberInput(e.target.value, setGrossIncome)}
                      className="pl-10 pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">VND</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numDependents">Số người phụ thuộc</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="numDependents"
                      type="number"
                      placeholder="2"
                      value={numDependents}
                      onChange={(e) => setNumDependents(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Vùng làm việc</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Chọn vùng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="region1">Vùng I</SelectItem>
                      <SelectItem value="region2">Vùng II</SelectItem>
                      <SelectItem value="region3">Vùng III</SelectItem>
                      <SelectItem value="region4">Vùng IV</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Mức trần BHTN: {formatCurrency(REGIONAL_DATA[region as keyof typeof REGIONAL_DATA].bhtnCeiling)}
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
                  <Label className="text-base font-semibold">Bảo hiểm Bắt buộc</Label>

                  <RadioGroup value={insuranceMode} onValueChange={(val) => setInsuranceMode(val as "auto" | "custom")}>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="auto" id="auto" className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="auto" className="font-medium cursor-pointer">
                            Tính theo lương chính thức
                          </Label>
                          {insuranceMode === "auto" && (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">
                                Mức trần BHXH/BHYT: {formatCurrency(BHXH_BHYT_CEILING)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="custom" id="custom" className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="custom" className="font-medium cursor-pointer">
                            Nhập Tùy chỉnh
                          </Label>
                          {insuranceMode === "custom" && (
                            <div className="space-y-2">
                              <Label htmlFor="insuranceBaseSalary" className="text-sm text-muted-foreground">
                                Mức lương đóng bảo hiểm
                              </Label>
                              <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="insuranceBaseSalary"
                                  type="text"
                                  placeholder="10,000,000"
                                  value={formatNumber(insuranceBaseSalary)}
                                  onChange={(e) => handleNumberInput(e.target.value, setInsuranceBaseSalary)}
                                  className="pl-10 pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  VND
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Mức lương đóng bảo hiểm phải nhỏ hơn hoặc bằng tổng thu nhập
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button className="w-full" size="lg" onClick={handleCalculate}>
                  Tính Toán và So Sánh
                </Button>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm space-y-2">
                <div>
                  <p className="font-semibold mb-1">Giảm trừ Cũ (7 bậc):</p>
                  <p>Bản thân: {formatCurrency(OLD_PERSONAL_DEDUCTION)}</p>
                  <p>
                    Người phụ thuộc: {formatCurrency(OLD_DEPENDENT_DEDUCTION)}
                    /người
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold mb-1">Giảm trừ Mới (5 bậc):</p>
                  <p>Bản thân: {formatCurrency(NEW_PERSONAL_DEDUCTION)}</p>
                  <p>
                    Người phụ thuộc: {formatCurrency(NEW_DEPENDENT_DEDUCTION)}
                    /người
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {results ? (
              <>
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle>Phân tích Tác động Chính sách</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-sm font-semibold">
                        Bậc thuế mới: {results.newBracket}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 pt-4 w-full max-w-full overflow-hidden">
                      <div className="space-y-2 w-full max-w-full">
                        <h4 className="text-xs font-semibold text-center text-muted-foreground">Cũ (7 bậc)</h4>
                        <div className="w-full max-w-full overflow-hidden">
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={oldPieData}
                                label={({ name, percent }: any) => `${(percent * 100).toFixed(1)}%`}
                                dataKey="value"
                              >
                                {oldPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={OLD_PIE_COLORS[index % OLD_PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-2 w-full max-w-full">
                        <h4 className="text-xs font-semibold text-center text-muted-foreground">Mới (5 bậc)</h4>
                        <div className="w-full max-w-full overflow-hidden">
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={newPieData}
                                label={({ name, percent }: any) => `${(percent * 100).toFixed(1)}%`}
                                dataKey="value"
                              >
                                {newPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={NEW_PIE_COLORS[index % NEW_PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full max-w-full">
                      {/* Left side (2/3): Phân tích chi tiết */}
                      <div className="lg:col-span-2 space-y-4 w-full max-w-full">
                        <div className="space-y-3 text-sm leading-relaxed">
                          <p className="font-semibold text-foreground">Phân tích chi tiết:</p>
                          <ul className="space-y-2 text-muted-foreground">
                            <li className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span>
                                Với biểu thuế 5 bậc mới, bạn tiết kiệm được{" "}
                                <span className="font-semibold text-green-600 dark:text-green-500">
                                  {formatCurrency(results.taxReduction)}
                                </span>{" "}
                                mỗi tháng so với biểu thuế 7 bậc cũ.
                              </span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span>
                                Thu nhập khả dụng của bạn tăng{" "}
                                <span className="font-semibold text-green-600 dark:text-green-500">
                                  {((results.disposableIncrease / results.oldDisposable) * 100).toFixed(2)}%
                                </span>
                                , giúp cải thiện chất lượng cuộc sống.
                              </span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span>
                                Mức giảm trừ gia cảnh tăng từ {formatCurrency(OLD_PERSONAL_DEDUCTION)} lên{" "}
                                {formatCurrency(NEW_PERSONAL_DEDUCTION)}, giúp giảm thu nhập chịu thuế.
                              </span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span>
                                Bạn đang ở <span className="font-semibold text-foreground">{results.newBracket}</span>{" "}
                                trong biểu thuế mới, với thuế suất tối ưu hơn so với biểu thuế cũ.
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Right side (1/3): Tiền thuế thay đổi */}
                      <div className="lg:col-span-1">
                        <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-950/20 p-6 h-full flex flex-col justify-center">
                          <p className="text-sm text-muted-foreground mb-2">Tiền thuế thay đổi</p>
                          <p className="text-2xl xl:text-3xl font-bold text-green-600 dark:text-green-500">
                            {formatCurrency(results.taxReduction)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Kết quả So sánh Chi tiết</CardTitle>
                    <CardDescription>
                      Thu nhập chịu thuế: Cũ {formatCurrency(results.oldTaxableIncome)} | Mới{" "}
                      {formatCurrency(results.newTaxableIncome)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="table" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="table">Bảng Dữ liệu</TabsTrigger>
                        <TabsTrigger value="structure">Cấu trúc Thuế</TabsTrigger>
                      </TabsList>

                      <TabsContent value="table" className="mt-6 space-y-6">
                        <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-3">
                          <h3 className="text-sm font-semibold">Chi tiết Bảo hiểm Bắt buộc</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">BHXH (8%)</span>
                              <span className="font-medium">{formatCurrency(results.bhxhAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">BHYT (1.5%)</span>
                              <span className="font-medium">{formatCurrency(results.bhytAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">BHTN (1%)</span>
                              <span className="font-medium">{formatCurrency(results.bhtnAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Tổng (10.5%)</span>
                              <span className="font-semibold text-primary">{formatCurrency(results.insurance)}</span>
                            </div>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hạng mục</TableHead>
                              <TableHead className="text-right">Phương án Cũ (7 bậc)</TableHead>
                              <TableHead className="text-right">Phương án Mới (5 bậc)</TableHead>
                              <TableHead className="text-right">Chênh lệch</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Bảo hiểm bắt buộc</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.insurance)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.insurance)}</TableCell>
                              <TableCell className="text-right">-</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Giảm trừ gia cảnh</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.oldTotalDeductions)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.newTotalDeductions)}</TableCell>
                              <TableCell className="text-right text-primary font-semibold">
                                +{formatCurrency(results.newTotalDeductions - results.oldTotalDeductions)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Bậc thuế</TableCell>
                              <TableCell className="text-right">{results.oldBracket}</TableCell>
                              <TableCell className="text-right">{results.newBracket}</TableCell>
                              <TableCell className="text-right">-</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Thu nhập chịu thuế</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.oldTaxableIncome)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.newTaxableIncome)}</TableCell>
                              <TableCell className="text-right text-primary font-semibold">
                                {formatCurrency(results.oldTaxableIncome - results.newTaxableIncome)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Thuế phải nộp</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.oldTax)}</TableCell>
                              <TableCell className="text-right text-primary font-semibold">
                                {formatCurrency(results.newTax)}
                              </TableCell>
                              <TableCell className="text-right text-green-600 dark:text-green-500 font-semibold">
                                -{formatCurrency(results.taxReduction)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Thu nhập Khả dụng</TableCell>
                              <TableCell className="text-right">{formatCurrency(results.oldDisposable)}</TableCell>
                              <TableCell className="text-right text-primary font-semibold">
                                {formatCurrency(results.newDisposable)}
                              </TableCell>
                              <TableCell className="text-right text-green-600 dark:text-green-500 font-semibold">
                                +{formatCurrency(results.disposableIncrease)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TabsContent>

                      <TabsContent value="structure" className="mt-6 space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold mb-4">Biểu thuế Cũ (7 bậc)</h3>
                          <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="font-semibold">Mức chịu thuế</TableHead>
                                  <TableHead className="text-center font-semibold">Thuế suất</TableHead>
                                  <TableHead className="text-right font-semibold">Tiền nộp</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {OLD_TAX_BRACKETS.map((bracket, index) => {
                                  const isCurrentBracket =
                                    results.oldTaxableIncome > (index === 0 ? 0 : OLD_TAX_BRACKETS[index - 1].limit) &&
                                    results.oldTaxableIncome <= bracket.limit
                                  return (
                                    <TableRow
                                      key={index}
                                      className={
                                        isCurrentBracket
                                          ? "bg-primary/10 border-l-4 border-l-primary font-semibold"
                                          : ""
                                      }
                                    >
                                      <TableCell className="font-medium">
                                        {formatBracketRange(index, OLD_TAX_BRACKETS)}
                                      </TableCell>
                                      <TableCell className="text-center">{(bracket.rate * 100).toFixed(0)}%</TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(oldTaxPerBracket[index] || 0)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                                <TableRow className="bg-muted/30 font-semibold">
                                  <TableCell colSpan={2}>Tổng thuế phải nộp</TableCell>
                                  <TableCell className="text-right text-primary">
                                    {formatCurrency(results.oldTax)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-4">Biểu thuế Mới (5 bậc)</h3>
                          <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="font-semibold">Mức chịu thuế</TableHead>
                                  <TableHead className="text-center font-semibold">Thuế suất</TableHead>
                                  <TableHead className="text-right font-semibold">Tiền nộp</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {NEW_TAX_BRACKETS.map((bracket, index) => {
                                  const isCurrentBracket =
                                    results.newTaxableIncome > (index === 0 ? 0 : NEW_TAX_BRACKETS[index - 1].limit) &&
                                    results.newTaxableIncome <= bracket.limit
                                  return (
                                    <TableRow
                                      key={index}
                                      className={
                                        isCurrentBracket
                                          ? "bg-primary/10 border-l-4 border-l-primary font-semibold"
                                          : ""
                                      }
                                    >
                                      <TableCell className="font-medium">
                                        {formatBracketRange(index, NEW_TAX_BRACKETS)}
                                      </TableCell>
                                      <TableCell className="text-center">{(bracket.rate * 100).toFixed(0)}%</TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(newTaxPerBracket[index] || 0)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                                <TableRow className="bg-muted/30 font-semibold">
                                  <TableCell colSpan={2}>Tổng thuế phải nộp</TableCell>
                                  <TableCell className="text-right text-primary">
                                    {formatCurrency(results.newTax)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Cột "Tiền nộp" hiển thị số tiền thuế thực tế phải nộp cho từng bậc dựa trên thu nhập chịu
                            thuế của bạn. Hàng được tô sáng là bậc thuế hiện tại của bạn.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-foreground">Chưa có kết quả</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Vui lòng nhập thông tin và nhấn "Tính Toán và So Sánh"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
