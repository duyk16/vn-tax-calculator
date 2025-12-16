"use client"

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const SCROLL_THRESHOLD = 300;

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-28 right-4 z-40 w-10 h-10 rounded-full bg-secondary/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center hover:bg-accent transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      aria-label="Quay về đầu trang"
    >
      <ChevronUp className="h-5 w-5 text-foreground" />
    </button>
  );
}
