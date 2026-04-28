import { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  side?:           'top' | 'bottom';
  align?:          'start' | 'center' | 'end';
  wrapperClassName?: string;
  children: ReactNode;
}

export default function Tooltip({
  text,
  side  = 'top',
  align = 'center',
  wrapperClassName = '',
  children,
}: TooltipProps) {
  const positionCls = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const alignCls =
    align === 'center' ? 'left-1/2 -translate-x-1/2' :
    align === 'end'    ? 'right-0'                    : 'left-0';
  const textAlignCls =
    align === 'center' ? 'text-center' :
    align === 'end'    ? 'text-right'  : 'text-left';

  return (
    <div className={`relative group/tooltip ${wrapperClassName}`}>
      {children}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute z-[9999]',
          positionCls, alignCls, textAlignCls,
          'px-2.5 py-1.5 rounded-[7px] text-[11px] font-medium',
          'bg-[#374151] text-white whitespace-pre-line break-words',
          'opacity-0 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          'transition-opacity duration-150 group-hover/tooltip:delay-500',
        ].join(' ')}
        style={{ maxWidth: 'min(280px, calc(100vw - 32px))' }}
      >
        {text}
      </span>
    </div>
  );
}
