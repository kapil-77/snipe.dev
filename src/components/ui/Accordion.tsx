import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Frame } from './Frame';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

/*
 * FAQ accordion — native <details>/<summary> (accessible, JS-free collapse),
 * rendered inside the dashed "+"-corner frames, two-up on md+.
 */
interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4', className)}>
      {items.map((item) => (
        <Frame key={item.id} className="h-full">
          <details className="group flex h-full flex-col">
            <summary
              className={cn(
                'flex cursor-pointer list-none select-none items-start justify-between gap-5 px-5 py-4 text-[15px] font-semibold text-ink sm:px-6 sm:py-5',
                'transition-colors duration-200 ease-out',
                '[&::-webkit-details-marker]:hidden',
              )}
            >
              {item.question}
              <Plus
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-45"
              />
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-muted sm:px-6 sm:pb-6">
              {item.answer}
            </div>
          </details>
        </Frame>
      ))}
    </div>
  );
}