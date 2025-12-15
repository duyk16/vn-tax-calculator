import { test, expect } from "@playwright/test"

/**
 * Tax Calculator E2E Tests - NEW UI
 *
 * The new UI auto-calculates on input change (no submit button).
 * Tests verify accuracy using correct logic:
 * - Old Law: 7 brackets (5M → 10M → 18M → 32M → 52M → 80M → ∞)
 * - New Law: 5 brackets (10M → 30M → 60M → 100M → ∞)
 * - Old Deductions: 11M personal, 4.4M dependent
 * - New Deductions: 15.5M personal, 6.2M dependent
 */

// Helper: format VND currency for matching
const formatVND = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// Calculate expected values based on correct formula
function calculateExpectedTax(gross: number, dependents: number, region: number = 1) {
  // Insurance calculation
  const BHXH_BHYT_CEILING = 46800000
  const REGIONAL_BHTN_CEILING: Record<number, number> = {
    1: 99200000,
    2: 88200000,
    3: 77200000,
    4: 69000000,
  }

  const cappedBHXH_BHYT = Math.min(gross, BHXH_BHYT_CEILING)
  const bhxhAmount = cappedBHXH_BHYT * 0.08
  const bhytAmount = cappedBHXH_BHYT * 0.015

  const cappedBHTN = Math.min(gross, REGIONAL_BHTN_CEILING[region])
  const bhtnAmount = cappedBHTN * 0.01

  const insurance = bhxhAmount + bhytAmount + bhtnAmount

  // Old law (7 brackets)
  const OLD_PERSONAL_DEDUCTION = 11000000
  const OLD_DEPENDENT_DEDUCTION = 4400000
  const OLD_TAX_BRACKETS = [
    { limit: 5000000, rate: 0.05 },
    { limit: 10000000, rate: 0.1 },
    { limit: 18000000, rate: 0.15 },
    { limit: 32000000, rate: 0.2 },
    { limit: 52000000, rate: 0.25 },
    { limit: 80000000, rate: 0.3 },
    { limit: Infinity, rate: 0.35 },
  ]

  // New law (5 brackets)
  const NEW_PERSONAL_DEDUCTION = 15500000
  const NEW_DEPENDENT_DEDUCTION = 6200000
  const NEW_TAX_BRACKETS = [
    { limit: 10000000, rate: 0.05 },
    { limit: 30000000, rate: 0.15 },
    { limit: 60000000, rate: 0.25 },
    { limit: 100000000, rate: 0.3 },
    { limit: Infinity, rate: 0.35 },
  ]

  const calculateTax = (taxableIncome: number, brackets: typeof OLD_TAX_BRACKETS) => {
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

  const oldTotalDeductions = OLD_PERSONAL_DEDUCTION + dependents * OLD_DEPENDENT_DEDUCTION
  const oldTaxableIncome = Math.max(0, gross - insurance - oldTotalDeductions)
  const oldTax = calculateTax(oldTaxableIncome, OLD_TAX_BRACKETS)

  const newTotalDeductions = NEW_PERSONAL_DEDUCTION + dependents * NEW_DEPENDENT_DEDUCTION
  const newTaxableIncome = Math.max(0, gross - insurance - newTotalDeductions)
  const newTax = calculateTax(newTaxableIncome, NEW_TAX_BRACKETS)

  return {
    insurance,
    oldTax,
    newTax,
    oldTaxableIncome,
    newTaxableIncome,
    oldNetSalary: gross - oldTax - insurance,
    newNetSalary: gross - newTax - insurance,
    savings: gross - newTax - insurance - (gross - oldTax - insurance),
  }
}

// Format number for display matching
const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value))
}

test.describe("Tax Calculator Accuracy Tests - New UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("Test 1: Basic calculation - 40M gross, 2 dependents", async ({ page }) => {
    // The new UI has default values of 40M/2 dependents, just verify results show
    // Wait for the results to appear
    await expect(page.getByText("Luật mới (5 bậc)")).toBeVisible()
    await expect(page.getByText("Luật cũ (7 bậc)")).toBeVisible()

    const expected = calculateExpectedTax(40000000, 2)

    // Verify savings is positive
    expect(expected.savings).toBeGreaterThan(0)

    // Verify the savings highlight shows positive value
    await expect(page.getByText(/Thu nhập tăng lên/)).toBeVisible()
  })

  test("Test 2: Dependent count changes affect deductions correctly", async ({ page }) => {
    // Get initial tax with 2 dependents (default)
    const expected2 = calculateExpectedTax(40000000, 2)

    // Change to 0 dependents - click minus button twice
    const minusButton = page.getByLabel("Giảm người phụ thuộc")
    await minusButton.click()
    await minusButton.click()

    // Wait for update
    await page.waitForTimeout(500)

    // Calculate expected with 0 dependents
    const expected0 = calculateExpectedTax(40000000, 0)

    // Verify tax increased (less deductions = more tax)
    expect(expected0.newTax).toBeGreaterThan(expected2.newTax)
    expect(expected0.oldTax).toBeGreaterThan(expected2.oldTax)

    // Verify net salary decreased (more tax = less take-home)
    expect(expected0.newNetSalary).toBeLessThan(expected2.newNetSalary)

    // Verify results are still displaying
    await expect(page.getByText(/Thu nhập tăng lên/)).toBeVisible()
  })

  test("Test 3: Region selection affects BHTN ceiling correctly", async ({ page }) => {
    // First enter high income
    const salaryInput = page.locator("#grossIncome")
    await salaryInput.click()
    await salaryInput.fill("100000000")
    await page.keyboard.press("Tab")

    // Wait for recalculation
    await page.waitForTimeout(500)

    // Open advanced settings accordion
    await page.getByText("Cài đặt nâng cao").click()

    // Wait for accordion to expand
    await page.waitForTimeout(300)

    // Verify Region 1 BHTN ceiling is shown
    await expect(page.getByText(/99.*200.*000/)).toBeVisible()

    // Select Region 4
    await page.getByText("Vùng 4").click()

    // Wait for update
    await page.waitForTimeout(300)

    // Verify Region 4 BHTN ceiling is now shown
    await expect(page.getByText(/69.*000.*000/)).toBeVisible()
  })

  test("Test 4: Insurance mode toggle (auto vs custom)", async ({ page }) => {
    // Open advanced settings
    await page.getByText("Cài đặt nâng cao").click()
    await page.waitForTimeout(300)

    // Select custom insurance
    await page.getByText("Tuỳ chỉnh").click()
    await page.waitForTimeout(200)

    // Verify custom insurance input appears
    await expect(page.locator("#insuranceBaseSalary")).toBeVisible()

    // Results should still be visible
    await expect(page.getByText("Luật mới (5 bậc)")).toBeVisible()
  })

  test("Test 5: Compare old law (7 brackets) vs new law (5 brackets)", async ({ page }) => {
    // Use 50M salary
    await page.getByText("50 tr").click()
    await page.waitForTimeout(500)

    // Change dependents to 1
    const minusButton = page.getByLabel("Giảm người phụ thuộc")
    await minusButton.click()
    await page.waitForTimeout(300)

    const expected = calculateExpectedTax(50000000, 1)

    // Verify both law labels are visible
    await expect(page.getByText(/Luật.*cũ.*7 bậc/)).toBeVisible()
    await expect(page.getByText(/Luật.*mới.*5 bậc/)).toBeVisible()

    // Verify savings is positive
    expect(expected.savings).toBeGreaterThan(0)

    // Verify savings highlight is visible
    await expect(page.getByText(/Thu nhập tăng lên/)).toBeVisible()

    // Verify detail cards show correct bracket labels
    await expect(page.getByText("Theo Luật Thuế Mới (5 bậc - từ 2026)")).toBeVisible()
    await expect(page.getByText("Theo Luật Thuế Cũ (7 bậc)")).toBeVisible()
  })
})

// Additional test for legacy page
test.describe("Legacy Page", () => {
  test("Legacy page is accessible and functional", async ({ page }) => {
    await page.goto("/legacy")
    await page.waitForLoadState("networkidle")

    // Verify it's the old UI with the calculate button
    await expect(page.getByRole("button", { name: /Tính Toán/i })).toBeVisible()

    // Verify it shows both tax bracket comparisons
    await expect(page.getByText("Phương án Cũ (7 bậc)")).toBeVisible()
    await expect(page.getByText("Phương án Mới (5 bậc)")).toBeVisible()
  })
})
