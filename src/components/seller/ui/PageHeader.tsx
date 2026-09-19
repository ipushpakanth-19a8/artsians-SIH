import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action, children }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] p-6 sm:p-8 shadow-xs transition-all">
      {/* Subtle top heritage decorative gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A8462D] via-[#C88732] to-[#273B59]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 text-[10px] font-bold uppercase tracking-[0.18em]">
              <span>✦ {eyebrow}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#29221D] font-serif tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-[#7A6E65] font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0 flex items-center gap-2.5">
            {action}
          </div>
        )}
      </div>

      {children && <div className="mt-4 pt-4 border-t border-[#D9CEB8]/50">{children}</div>}
    </div>
  );
}
