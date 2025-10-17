"use client"

import { Github } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            <p>© {currentYear} Máy tính Thuế TNCN. Mọi quyền được bảo lưu.</p>
            <p className="mt-1">Phát hành theo giấy phép MIT</p>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/duyk16/vn-tax-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="text-sm font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

