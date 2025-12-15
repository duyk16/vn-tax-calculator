# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-15

### ✨ Added

- **💰 Tax Calculator Application**: Complete redesign with modern UI components

  - Interactive salary input with quick value buttons (+/- controls, preset amounts)
  - Dependent counter/stepper component
  - Advanced settings for region and insurance type selection
  - Real-time comparison between old (7-bracket) and new (5-bracket) tax laws
  - Animated savings highlight showing monthly/yearly savings
  - Sticky bottom bar with share functionality
  - Comprehensive tax calculation logic supporting both 2026 and legacy tax laws

- **📊 Tax Breakdown Modal**: Detailed view of tax bracket calculations

  - Visual breakdown of all tax brackets (old: 7 brackets, new: 5 brackets)
  - Displays current bracket with badge indicator
  - Shows taxable amount and tax amount per bracket
  - Responsive drawer on mobile, side drawer on desktop

- **🔍 SEO Improvements**

  - Dynamic `sitemap.xml` generation
  - `robots.txt` with sitemap reference
  - FAQ structured data (FAQPage schema) with 3 common tax questions
  - WebApplication structured data for better discoverability
  - Enhanced metadata with Open Graph and Twitter Card support

- **🧪 E2E Testing**: Comprehensive Playwright test suite

  - Tax calculation accuracy tests
  - UI interaction tests
  - Comparison validation between tax laws

- **📦 Legacy Page**: Preserved original calculator at `/legacy` route

### 🔄 Changed

- **♻️ Project Structure**: Reorganized codebase into `src/` directory

  - Moved all components, hooks, and utilities to `src/`
  - Better separation of concerns with dedicated component folders

- **⚡ Dependencies**

  - Upgraded Next.js from 15.4.9 to 16.0.10
  - Added pnpm workspace configuration
  - Updated TypeScript configuration with stricter settings

- **🎨 UI/UX Enhancements**
  - Modern glassmorphism design with card shadows
  - Smooth animations and transitions
  - Better mobile responsiveness
  - Improved color scheme and typography

### 🐛 Fixed

- **⚛️ React hydration error** in `SalaryInput` component

  - Fixed mismatch between SSR and CSR rendering
  - Added `suppressHydrationWarning` for input element
  - Proper state initialization to avoid formatting issues

- **🔒 Security vulnerability**: `node-tar` race condition (CVE)
  - Added pnpm override for `tar` package to enforce version >=7.5.2

### Technical Details

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: Radix UI primitives
- **State Management**: React hooks
- **Testing**: Playwright for E2E tests
- **Package Manager**: pnpm v10

---

## Links

- [Repository](https://github.com/duyk16/vn-tax-calculator)
- [Live Site](https://tinhthue.vn)
