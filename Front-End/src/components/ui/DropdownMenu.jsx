import { useEffect, useRef } from "react";

export default function DropdownMenu({ open, onClose, children, labelledBy }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-labelledby={labelledBy}
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-xl border border-[#E5E8F0] bg-white p-2 shadow-soft"
    >
      {children}
    </div>
  );
}
