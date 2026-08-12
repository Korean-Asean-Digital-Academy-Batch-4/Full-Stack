import { FileCheck2, FileUp } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";
import { formatImportFileSize, SUPPORTED_IMPORT_EXTENSIONS } from "../../utils/importFile";

export default function ImportFileDropzone({
  file,
  error,
  onFileSelect,
  disabled = false,
  variant = "account",
  inputLabel = "Pilih file import",
  accept = SUPPORTED_IMPORT_EXTENSIONS,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    onFileSelect(event.dataTransfer.files?.[0]);
  };

  const assignmentVariant = variant === "assignment";

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        aria-label={inputLabel}
        accept={accept.join(",")}
        onChange={(event) => {
          onFileSelect(event.target.files?.[0]);
          event.target.value = "";
        }}
        disabled={disabled}
        className="sr-only"
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={file ? `${file.name}, klik untuk mengganti file` : inputLabel}
        onClick={selectFile}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectFile();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "mt-5 flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0756D9] focus-visible:ring-offset-2",
          assignmentVariant ? "min-h-[265px] py-8" : "min-h-[150px] py-6",
          isDragging ? "border-[#0756D9] bg-[#E8EFFF]" : "border-[#AEB9CE] bg-[#F7F8FA] hover:border-[#0756D9] hover:bg-[#F0F4FC]",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className={cn(
          "flex items-center justify-center rounded bg-[#E8EFFF] text-[#0756D9]",
          assignmentVariant ? "h-14 w-14" : "h-10 w-10",
        )}>
          {file ? <FileCheck2 aria-hidden="true" className="h-5 w-5" /> : <FileUp aria-hidden="true" className={assignmentVariant ? "h-6 w-6" : "h-5 w-5"} />}
        </span>

        {file ? (
          <>
            <span className="mt-3 max-w-full truncate text-sm font-medium text-[#20232D]">{file.name}</span>
            <span className="mt-1 text-xs text-[#555D6E]">{formatImportFileSize(file.size)} · klik untuk mengganti file</span>
          </>
        ) : assignmentVariant ? (
          <>
            <span className="mt-4 text-sm font-semibold text-[#20232D]">Tarik &amp; Lepas file Excel di sini</span>
            <span className="mt-1 text-xs text-[#555D6E]">atau klik untuk menelusuri dari komputer Anda</span>
            <Button
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                selectFile();
              }}
              className="mt-4 h-9 px-4 text-xs"
            >
              Pilih File Excel
            </Button>
          </>
        ) : (
          <span className="mt-3 text-sm leading-5 text-[#343946]">Drag and drop file di sini<br />atau klik untuk browse</span>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-[#DC2626]">{error}</p>}
    </>
  );
}
