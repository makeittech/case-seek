/**
 * Minimal modal-dialog behavior for overlays: initial focus, Tab wrapping,
 * Escape-to-close (when a close action exists), and focus restore on unmount.
 * Attach the returned ref to the dialog container and pair with aria-modal.
 */
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export interface ModalOptions {
  onClose?: () => void;
  /** CSS selector for the control that receives initial focus (default: first focusable). */
  initialFocus?: string;
}

export function useModal<T extends HTMLElement>(options: ModalOptions = {}): RefObject<T> {
  const ref = useRef<T>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const prior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = (): HTMLElement[] =>
      [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'));

    const initial =
      (optsRef.current.initialFocus ? node.querySelector<HTMLElement>(optsRef.current.initialFocus) : null) ??
      focusables()[0] ??
      node;
    initial.focus();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && optsRef.current.onClose) {
        e.stopPropagation();
        optsRef.current.onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0]!;
      const last = els[els.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prior?.focus();
    };
  }, []);

  return ref;
}
