import { CircleAlert } from "lucide-react";

export default function LoginErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 text-left text-[13px] leading-[18px] text-[#DC2626]">
      <CircleAlert aria-hidden="true" className="mt-px h-[18px] w-[18px] shrink-0" />
      <p>{message}</p>
    </div>
  );
}
