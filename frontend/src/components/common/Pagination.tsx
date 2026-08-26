import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  colorScheme?: 'amber' | 'gold' | 'emerald' | 'blue';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  colorScheme = 'gold'
}) => {
  const { t, isRTL } = useLanguage();
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const indexOfLastItem = Math.min(safePage * itemsPerPage, totalItems);
  const indexOfFirstItem = (safePage - 1) * itemsPerPage + 1;

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safePage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (safePage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(safePage - 1);
        pages.push(safePage);
        pages.push(safePage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const activeColorClasses: Record<string, string> = {
    amber: 'bg-amber-500 text-white font-bold shadow-xs',
    gold: 'bg-gold-500 text-emerald-950 font-bold shadow-xs',
    emerald: 'bg-emerald-600 text-white font-bold shadow-xs',
    blue: 'bg-blue-600 text-white font-bold shadow-xs',
  };

  const activeClass = activeColorClasses[colorScheme] || activeColorClasses.gold;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800 font-sans">
      <div className="text-xs text-slate-500 dark:text-slate-400 font-arabic">
        {t('showing')} <span className="font-semibold text-slate-700 dark:text-slate-300">{indexOfFirstItem}</span> {t('to')}{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{indexOfLastItem}</span> {t('of')}{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{totalItems}</span> {t('entries')}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(safePage - 1, 1))}
          disabled={safePage === 1}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-arabic"
          title={t('previous')}
        >
          <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline">{t('previous')}</span>
        </button>

        {getPageNumbers().map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-lg transition flex items-center justify-center cursor-pointer ${
                safePage === p
                  ? activeClass
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400 select-none">
              ...
            </span>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safePage + 1, totalPages))}
          disabled={safePage === totalPages}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-arabic"
          title={t('next')}
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

