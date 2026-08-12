import { Download, FileCheck2, FileUp, Info } from "lucide-react";
import { useState } from "react";
import ImportFileDropzone from "../ImportFileDropzone";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Toast from "../../ui/Toast";
import { formatImportFileSize, validateImportFile } from "../../../utils/importFile";
import { downloadAccountTemplate, importAccounts } from "../../../services/adminService";

const UPLOAD_STATES = {
  IDLE: "idle",
  READY: "ready",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
};

const accountImportConfig = {
  teacher: {
    subject: "guru",
    title: "Pembuatan Akun Guru",
    description: "Unggah file data guru untuk membuat akun secara massal dan mengelola akses sistem.",
    modalTitle: "Unggah Data Guru",
    successMessage: "Data guru berhasil diproses.",
  },
  student: {
    subject: "siswa",
    title: "Pembuatan Akun Siswa",
    description: "Unggah file data siswa untuk membuat akun secara massal dan mengelola akses sistem.",
    modalTitle: "Unggah Data Siswa",
    successMessage: "Data siswa berhasil diproses.",
  },
};

export default function BulkAccountUploadPage({ accountType, onUploadSuccess, children }) {
  const config = accountImportConfig[accountType];
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(UPLOAD_STATES.IDLE);
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState(null);

  if (!config) throw new Error(`Unsupported account import type: ${accountType}`);

  const selectValidFile = (file) => {
    const validationError = validateImportFile(file, { extensions: [".csv"] });
    setUploadError(validationError);
    if (!file || validationError) {
      setSelectedFile(null);
      setUploadStatus(validationError ? UPLOAD_STATES.ERROR : UPLOAD_STATES.IDLE);
      return;
    }
    setSelectedFile(file);
    setUploadStatus(UPLOAD_STATES.READY);
  };

  const openUploadModal = () => {
    setSelectedFile(null);
    setUploadError("");
    setUploadStatus(UPLOAD_STATES.IDLE);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    if (uploadStatus === UPLOAD_STATES.UPLOADING) return;
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadError("");
    setUploadStatus(uploadedFile ? UPLOAD_STATES.SUCCESS : UPLOAD_STATES.IDLE);
  };

  const processFile = async () => {
    if (!selectedFile || uploadStatus === UPLOAD_STATES.UPLOADING) return;
    setUploadStatus(UPLOAD_STATES.UPLOADING);
    try {
      const result = await importAccounts(accountType, selectedFile);
      const fileMetadata = { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type, result };
      setUploadedFile(fileMetadata);
      setUploadStatus(UPLOAD_STATES.SUCCESS);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      onUploadSuccess?.(fileMetadata);
      const createdCount = result.createdCount ?? 0;
      const failedCount = result.failedRows?.length ?? 0;
      setToast({
        type: createdCount === 0 && failedCount > 0 ? "error" : "success",
        message: failedCount > 0
          ? `${createdCount} akun dibuat; ${failedCount} baris gagal. Lihat alasan pada ringkasan.`
          : `${createdCount} akun berhasil dibuat.`,
      });
    } catch (error) {
      setUploadStatus(UPLOAD_STATES.ERROR);
      setUploadError(error.message || "File gagal diproses.");
    }
  };

  const downloadTemplate = async () => {
    try {
      const downloaded = await downloadAccountTemplate(accountType);
      setToast({ type: downloaded ? "success" : "error", message: downloaded ? "Template CSV berhasil diunduh." : "Template hanya tersedia ketika backend aktif." });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Template gagal diunduh." });
    }
  };

  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1000px]">
        <header>
          <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#20232D]">{config.title}</h1>
          <p className="mt-2 text-sm text-[#555D6E]">{config.description}</p>
        </header>

        <section className="mt-7 rounded-lg border border-[#C5CDDC] bg-white px-5 py-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#E8EFFF] text-[#0756D9]">
              {uploadedFile ? <FileCheck2 aria-hidden="true" className="h-5 w-5" /> : <FileUp aria-hidden="true" className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              {uploadedFile ? (
                <>
                  <h2 className="truncate text-sm font-medium text-[#20232D]" title={uploadedFile.name}>{uploadedFile.name}</h2>
                  <p className="mt-1 text-xs font-medium text-[#0756D9]">File selesai diproses ({formatImportFileSize(uploadedFile.size)})</p>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-medium text-[#20232D]">Klik untuk unggah data {config.subject} <span className="text-xs font-normal text-[#555D6E]">(.csv)</span></h2>
                  <p className="mt-1 text-xs text-[#555D6E]">Maksimal ukuran file 5MB</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={downloadTemplate} className="h-10 whitespace-nowrap px-4">
                <Download aria-hidden="true" className="h-4 w-4" /> Unduh Template
              </Button>
              <Button onClick={openUploadModal} className="h-10 whitespace-nowrap px-5">Pilih File</Button>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 border-t border-[#D7DCE7] pt-4 text-xs text-[#555D6E]">
            <Info aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-[#0756D9]" />
            <p>Sistem akan memproses data dan menghasilkan password otomatis.</p>
          </div>
        </section>

        {children}
      </div>

      <Modal
        open={isUploadModalOpen}
        onClose={closeUploadModal}
        title={config.modalTitle}
        panelClassName="max-w-[480px] rounded-lg"
        dismissible={uploadStatus !== UPLOAD_STATES.UPLOADING}
      >
        <div className="border-t border-[#D7DCE7] pt-5">
          <p className="text-sm leading-5 text-[#555D6E]">
            Silakan unggah file data {config.subject} dalam format CSV (.csv)
          </p>
          <button type="button" onClick={downloadTemplate} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#0756D9] hover:underline">
            <Download aria-hidden="true" className="h-4 w-4" /> Unduh Template CSV
          </button>

          <ImportFileDropzone
            file={selectedFile}
            error={uploadError}
            onFileSelect={selectValidFile}
            disabled={uploadStatus === UPLOAD_STATES.UPLOADING}
            inputLabel={`Pilih file data ${config.subject}`}
            accept={[".csv"]}
          />
        </div>

        <div className="mt-5 flex justify-end gap-3 border-t border-[#D7DCE7] pt-4">
          <Button variant="secondary" onClick={closeUploadModal} disabled={uploadStatus === UPLOAD_STATES.UPLOADING} className="h-10 px-5">Batal</Button>
          <Button
            onClick={processFile}
            disabled={!selectedFile || uploadStatus === UPLOAD_STATES.ERROR}
            loading={uploadStatus === UPLOAD_STATES.UPLOADING}
            className="h-10 min-w-[92px] px-5"
          >
            {uploadStatus === UPLOAD_STATES.UPLOADING ? "Mengunggah..." : "Unggah"}
          </Button>
        </div>
      </Modal>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
