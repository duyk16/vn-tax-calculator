"use client"

import { sendGAEvent } from "@next/third-parties/google"

// Salary range buckets for aggregation in GA reports
type SalaryRange = "under_15m" | "15m_30m" | "30m_50m" | "50m_80m" | "80m_100m" | "over_100m"

/**
 * Convert salary to a bucketed range for GA tracking
 * This helps with data aggregation in GA reports
 */
function getSalaryRange(salary: number): SalaryRange {
  if (salary < 15000000) return "under_15m"
  if (salary < 30000000) return "15m_30m"
  if (salary < 50000000) return "30m_50m"
  if (salary < 80000000) return "50m_80m"
  if (salary < 100000000) return "80m_100m"
  return "over_100m"
}

/**
 * Analytics utility for tracking user interactions in the tax calculator.
 * All events are sent to Google Analytics 4 via sendGAEvent.
 */
export const Analytics = {
  /**
   * Track when a salary calculation is performed.
   * Uses debounced tracking in the component to avoid spam.
   */
  trackSalaryCalculation: (grossSalary: number, mode: "gross" | "net") => {
    sendGAEvent("event", "salary_calculation", {
      salary_range: getSalaryRange(grossSalary),
      mode,
      gross_salary: grossSalary,
    })
  },

  /**
   * Track salary mode toggle (Gross vs NET)
   */
  trackSalaryModeToggle: (mode: "gross" | "net") => {
    sendGAEvent("event", "salary_mode_toggle", {
      mode,
    })
  },

  /**
   * Track quick value button clicks
   */
  trackQuickValueSelect: (value: number) => {
    sendGAEvent("event", "quick_value_select", {
      value,
      value_millions: value / 1000000,
    })
  },

  /**
   * Track dependents count changes
   */
  trackDependentsChange: (count: number) => {
    sendGAEvent("event", "dependents_change", {
      count,
    })
  },

  /**
   * Track region selection changes
   */
  trackRegionChange: (region: 1 | 2 | 3 | 4) => {
    sendGAEvent("event", "region_change", {
      region,
    })
  },

  /**
   * Track insurance type selection
   */
  trackInsuranceTypeChange: (type: "official" | "none" | "custom") => {
    sendGAEvent("event", "insurance_type_change", {
      type,
    })
  },

  /**
   * Track yearly/monthly toggle
   */
  trackYearlyToggle: (isYearly: boolean) => {
    sendGAEvent("event", "yearly_toggle", {
      is_yearly: isYearly,
    })
  },

  /**
   * Track tax breakdown modal view
   */
  trackTaxBreakdownView: (isNewLaw: boolean) => {
    sendGAEvent("event", "tax_breakdown_view", {
      is_new_law: isNewLaw,
    })
  },
}
