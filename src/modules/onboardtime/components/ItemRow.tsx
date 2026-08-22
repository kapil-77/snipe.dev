import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import { Frame } from '@/components/ui/Frame';
import { cn } from '@/lib/cn';
import type { ChecklistItem, ItemStatus } from '../types';
import { ItemMeta } from './ItemMeta';

const STATUS_META: Record<
  ItemStatus,
  { label: string; box: string }
> = {
  todo: { label: 'todo', box: 'border-line text-faint' },
  doing: { label: 'doing', box: 'border-accent/70 text-accent-bright' },
  done: { label: 'done', box: 'border-accent bg-accent text-abyss' },
};

interface ItemRowProps {
  item: ChecklistItem;
  index: number;
  total: number;
  busy?: boolean;
  onCycle: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}

/** One checklist item — dashed frame, status cycle, ordering, delete. */
export function ItemRow({
  item,
  index,
  total,
  busy,
  onCycle,
  onMove,
  onDelete,
}: ItemRowProps) {
  const meta = STATUS_META[item.status];

  return (
    <Frame className="w-full">
      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCycle}
            disabled={busy}
            aria-label={`Mark “${item.title}” (currently ${item.status})`}
            title={`${meta.label} — click to advance`}
            className={cn(
              'grid size-6 shrink-0 place-items-center border transition-colors duration-200 ease-out',
              meta.box,
              busy && 'cursor-wait opacity-60',
            )}
          >
            {item.status === 'done' && <Check className="size-3.5" aria-hidden="true" />}
          </button>

          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm',
              item.status === 'done' ? 'text-faint line-through' : 'text-ink',
            )}
          >
            {item.title}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => onMove(-1)}
                disabled={busy || index === 0}
                aria-label="Move up"
                className="grid size-6 place-items-center border border-line text-faint transition-colors duration-200 ease-out hover:text-ink disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronUp className="size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMove(1)}
                disabled={busy || index === total - 1}
                aria-label="Move down"
                className="grid size-6 place-items-center border border-line text-faint transition-colors duration-200 ease-out hover:text-ink disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              aria-label={`Delete item “${item.title}”`}
              className="grid size-8 place-items-center border border-line text-faint transition-colors duration-200 ease-out hover:border-warning/60 hover:text-warning disabled:pointer-events-none disabled:opacity-30"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={cn('pl-9', item.status === 'done' && 'opacity-60')}>
          <ItemMeta item={item} />
        </div>
      </div>
    </Frame>
  );
}