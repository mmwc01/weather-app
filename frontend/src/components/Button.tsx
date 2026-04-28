import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'ghost' | 'icon' | 'outline' | 'unit';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isNight?: boolean;
  isActive?: boolean;
  children: ReactNode;
}

const BASE = 'transition-all duration-200';

function ghostCls(isNight: boolean, isActive: boolean) {
  return [
    'flex items-center gap-[5px] px-2.5 py-[5px] rounded-[8px] border',
    'text-[11px] font-semibold hover:scale-[1.06] active:scale-[0.96]',
    isActive
      ? 'bg-primary text-white border-transparent hover:bg-primary/85'
      : isNight
        ? 'bg-white/[0.08] text-[rgba(210,225,255,0.8)] border-white/[0.15] hover:bg-white/[0.18] hover:border-white/30'
        : 'bg-white/60 text-primary border-primary/20 hover:bg-white/90 hover:border-primary/35 hover:shadow-wx-button',
  ].join(' ');
}

function iconCls(isNight: boolean, isActive: boolean) {
  return [
    'flex items-center justify-center w-10 h-10 rounded-[10px]',
    'backdrop-blur-[10px] shadow-wx-button hover:scale-[1.08] active:scale-[0.95]',
    isActive
      ? 'bg-primary text-white hover:bg-primary/85'
      : isNight
        ? 'bg-white/[0.08] text-[rgba(210,225,255,0.8)] border border-white/[0.15] hover:bg-white/[0.18]'
        : 'bg-white/60 text-primary hover:bg-white/90 hover:shadow-[0_4px_14px_rgba(1,1,45,0.22)]',
  ].join(' ');
}

function outlineCls() {
  return 'flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-[1.5px] border-primary/[0.22] text-[12px] font-semibold tracking-[0.5px] uppercase text-primary hover:bg-white/40';
}

function unitCls(isActive: boolean) {
  return [
    'px-3 py-1.5 text-xs font-semibold',
    isActive
      ? 'bg-primary night:bg-white/[0.22] text-white'
      : 'bg-transparent text-primary/45 night:text-[rgba(210,225,255,0.70)]',
  ].join(' ');
}

export default function Button({
  variant = 'ghost',
  isNight = false,
  isActive = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantCls =
    variant === 'ghost' ? ghostCls(isNight, isActive) :
    variant === 'icon' ? iconCls(isNight, isActive) :
    variant === 'outline' ? outlineCls() : unitCls(isActive);

  return (
    <button className={`${BASE} ${variantCls} ${className}`} {...props}>
      {children}
    </button>
  );
}
