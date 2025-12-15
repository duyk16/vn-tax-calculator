"use client"

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TT</span>
          </div>
          <span className="font-semibold text-foreground">Tinhthue.vn</span>
        </div>
        {/* <Link href="/legacy">
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
            Phiên bản cũ
          </Button>
        </Link> */}
      </div>
    </header>
  );
}
