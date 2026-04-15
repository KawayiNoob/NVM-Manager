import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  activeTab: 'installed' | 'available';
}

export function BackToTop({ activeTab }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  const getCurrentScrollContainer = useCallback(() => {
    const containers = document.querySelectorAll('.custom-scrollbar');
    // Find the visible tab's scroll container
    for (const container of containers) {
      const element = container as HTMLElement;
      const parent = element.closest('.pointer-events-auto');
      if (parent) {
        return element;
      }
    }
    return null;
  }, []);

  const handleScroll = useCallback(() => {
    const container = getCurrentScrollContainer();
    if (container) {
      setVisible(container.scrollTop > 200);
    }
  }, [getCurrentScrollContainer]);

  const scrollToTop = useCallback(() => {
    const container = getCurrentScrollContainer();
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [getCurrentScrollContainer]);

  useEffect(() => {
    const handleGlobalScroll = () => {
      handleScroll();
    };

    const containers = document.querySelectorAll('.custom-scrollbar');
    containers.forEach((container) => {
      container.addEventListener('scroll', handleGlobalScroll);
    });

    handleScroll(); // Check initial position

    return () => {
      containers.forEach((container) => {
        container.removeEventListener('scroll', handleGlobalScroll);
      });
    };
  }, [handleScroll, activeTab]);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-25 right-6 transition-all duration-300 z-50 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        boxShadow: 'none',
        outline: 'none',
      }}
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors shadow-lg">
        <ArrowUp className="h-5 w-5 text-white" />
      </div>
    </button>
  );
}
