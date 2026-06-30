"use client";

// דיאלוג אישור/קלט מעוצב לדשבורד — מחליף את window.confirm/prompt הילידיים.
// שימוש: const confirm = useConfirm(); if (!(await confirm("...")) ) return;
//        const prompt = usePrompt();  const reason = await prompt({ ... });
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** מסמן פעולה הרסנית — כפתור האישור באדום. */
  danger?: boolean;
}

export interface PromptOptions {
  title?: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: string;
  /** שדה רב-שורתי (textarea) במקום שורה אחת. */
  multiline?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions | string) => Promise<boolean>;
type PromptFn = (opts: PromptOptions | string) => Promise<string | null>;

const DialogContext = createContext<{
  confirm: ConfirmFn;
  prompt: PromptFn;
} | null>(null);

/** דיאלוג אישור מעוצב (במקום window.confirm). מחזיר Promise<boolean>. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useConfirm חייב להיות בתוך <ConfirmProvider>");
  return ctx.confirm;
}

/** דיאלוג קלט מעוצב (במקום window.prompt). מחזיר Promise<string | null>. */
export function usePrompt(): PromptFn {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("usePrompt חייב להיות בתוך <ConfirmProvider>");
  return ctx.prompt;
}

type DialogState =
  | { kind: "confirm"; opts: ConfirmOptions }
  | { kind: "prompt"; opts: PromptOptions };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const [value, setValue] = useState("");
  const resolver = useRef<((v: boolean | string | null) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setState({
      kind: "confirm",
      opts: typeof o === "string" ? { message: o } : o,
    });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve as (v: boolean | string | null) => void;
    });
  }, []);

  const prompt = useCallback<PromptFn>((o) => {
    const opts = typeof o === "string" ? { message: o } : o;
    setValue(opts.defaultValue ?? "");
    setState({ kind: "prompt", opts });
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve as (v: boolean | string | null) => void;
    });
  }, []);

  const settle = useCallback((result: boolean | string | null) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
    setValue("");
  }, []);

  // סגירה ב-Escape + נעילת גלילת הרקע + מיקוד התחלתי.
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(state.kind === "prompt" ? null : false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      if (state.kind === "prompt") inputRef.current?.focus();
      else confirmBtnRef.current?.focus();
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [state, settle]);

  const cancel = () => settle(state?.kind === "prompt" ? null : false);
  const accept = () => settle(state?.kind === "prompt" ? value : true);

  const opts = state?.opts;
  const danger = state?.kind === "confirm" && state.opts.danger;

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {state && opts && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
          onClick={cancel}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-sand-200 bg-white p-6 shadow-xl"
          >
            {opts.title && (
              <h3 className="mb-1.5 text-lg font-display text-ink-900">
                {opts.title}
              </h3>
            )}
            {opts.message && (
              <p className="text-sm leading-relaxed text-ink-700">
                {opts.message}
              </p>
            )}

            {state.kind === "prompt" &&
              (state.opts.multiline ? (
                <textarea
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={state.opts.placeholder}
                  rows={3}
                  className="mt-3 w-full resize-y rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
                />
              ) : (
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={state.opts.placeholder}
                  onKeyDown={(e) => e.key === "Enter" && accept()}
                  className="mt-3 w-full rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
                />
              ))}

            <div className="mt-5 flex gap-2">
              <button
                ref={confirmBtnRef}
                onClick={accept}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
                  danger
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-300"
                    : "bg-navy-600 hover:bg-navy-700 focus:ring-navy-300",
                )}
              >
                {opts.confirmLabel ?? "אישור"}
              </button>
              <button
                onClick={cancel}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-sand-300"
              >
                {opts.cancelLabel ?? "ביטול"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
