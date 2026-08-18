import { CheckCircle2, CircleAlert, LoaderCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { joinModuleWaitlist } from '@/lib/waitlist';

import { Button } from './Button';
import { Input } from './Input';

/*
 * Email waitlist field used by coming-soon module cards,
 * the module screens and the footer CTA.
 */
interface WaitlistFormProps {
  moduleId: string;
  source?: string;
  /** Pass to use a full width + larger control. */
  size?: 'sm' | 'md';
  buttonLabel?: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function WaitlistForm({
  moduleId,
  source = 'landing',
  size = 'sm',
  buttonLabel = 'Join waitlist',
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ kind: 'loading' });
    const result = await joinModuleWaitlist(email.trim(), moduleId, source);
    setStatus(
      result.ok
        ? { kind: 'success', message: result.message }
        : { kind: 'error', message: result.message },
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
        <Input
          aria-label={`Email for the ${moduleId} waitlist`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.dev"
          value={email}
          disabled={status.kind === 'loading'}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind === 'error' || status.kind === 'success') setStatus({ kind: 'idle' });
          }}
          className={size === 'md' ? 'h-11 text-sm' : undefined}
          invalid={status.kind === 'error'}
        />
        <Button
          type="submit"
          variant="primary"
          size={size === 'md' ? 'lg' : 'md'}
          disabled={status.kind === 'loading' || !email.trim()}
          className="shrink-0"
        >
          {status.kind === 'loading' ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {buttonLabel}
        </Button>
      </form>

      {status.kind === 'success' && (
        <p role="status" className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-accent-bright">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {status.message}
        </p>
      )}
      {status.kind === 'error' && (
        <p role="alert" className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-warning">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {status.message}
        </p>
      )}
    </div>
  );
}