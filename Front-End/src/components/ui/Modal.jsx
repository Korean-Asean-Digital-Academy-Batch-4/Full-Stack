import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  panelClassName,
  initialFocusRef,
  dismissible = true,
}) {
  const panelRef = useRef(null);
  const closeHandlerRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    closeHandlerRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        closeHandlerRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      if (initialFocusRef?.current) initialFocusRef.current.focus();
      else panelRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [dismissible, initialFocusRef, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={() => dismissible && closeHandlerRef.current()}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          "max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card outline-none",
          panelClassName,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-[#20232D]">{title}</h2>
            {description && (
              <p id={descriptionId} className="mt-2 text-sm leading-5 text-[#545968]">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              aria-label="Tutup modal"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
