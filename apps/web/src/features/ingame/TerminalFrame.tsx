import type { ReactNode } from 'react';

type TerminalPanelTone = 'neutral' | 'warning' | 'success' | 'info' | 'danger';

const toneClasses: Record<TerminalPanelTone, string> = {
  neutral: 'border-zinc-700/90',
  warning: 'border-amber-700/80',
  success: 'border-emerald-700/80',
  info: 'border-sky-700/80',
  danger: 'border-red-700/80',
};

export function TerminalPanel({
  title,
  code,
  tone = 'neutral',
  headingLevel = 2,
  children,
}: {
  title: string;
  code?: string;
  tone?: TerminalPanelTone;
  headingLevel?: 2 | 3;
  children: ReactNode;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section className={`border bg-black/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] ${toneClasses[tone]}`}>
      <div className="flex min-h-9 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-3">
        <Heading className="font-mono text-[13px] font-semibold uppercase tracking-normal text-zinc-100">
          {title}
        </Heading>
        {code && (
          <span className="font-mono text-[11px] uppercase tracking-normal text-zinc-500">
            {code}
          </span>
        )}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function TerminalStatusStrip({
  tone = 'neutral',
  children,
}: {
  tone?: TerminalPanelTone;
  children: ReactNode;
}) {
  const stripClasses: Record<TerminalPanelTone, string> = {
    neutral: 'border-zinc-700 bg-zinc-900 text-zinc-300',
    warning: 'border-orange-600 bg-orange-600 text-black',
    success: 'border-emerald-700 bg-emerald-950 text-emerald-300',
    info: 'border-sky-700 bg-sky-950 text-sky-300',
    danger: 'border-red-700 bg-red-950 text-red-300',
  };

  return (
    <div className={`border px-3 py-2 font-mono text-xs font-semibold uppercase ${stripClasses[tone]}`}>
      {children}
    </div>
  );
}

export function TerminalButton({
  children,
  onClick,
  type = 'button',
  tone = 'neutral',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  tone?: 'neutral' | 'primary' | 'success';
  disabled?: boolean;
}) {
  const buttonClasses = {
    neutral: 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-900',
    primary: 'border-orange-600 bg-orange-600 text-black hover:bg-orange-500',
    success: 'border-emerald-700 bg-emerald-900 text-emerald-100 hover:bg-emerald-800',
  }[tone];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border px-3 py-2 font-mono text-xs font-semibold uppercase tracking-normal disabled:cursor-not-allowed disabled:opacity-50 ${buttonClasses}`}
    >
      {children}
    </button>
  );
}
