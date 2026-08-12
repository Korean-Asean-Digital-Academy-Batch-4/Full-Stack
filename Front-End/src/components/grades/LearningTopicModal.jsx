import { Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assessmentComponents } from "../../data/assessmentComponents";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function LearningTopicModal({ open, topics, onClose, onSave }) {
  const firstInputRef = useRef(null);
  const [draftTopics, setDraftTopics] = useState(topics);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraftTopics(topics);
    setErrors({});
    setGeneralError("");
  }, [open, topics]);

  const requestClose = () => {
    if (isSaving) return;
    onClose();
  };

  const handleChange = (componentId, value) => {
    setDraftTopics((current) => ({ ...current, [componentId]: value }));
    setErrors((current) => ({ ...current, [componentId]: "" }));
    setGeneralError("");
  };

  const handleSave = async () => {
    const nextErrors = {};
    const normalizedTopics = {};
    assessmentComponents.forEach((component) => {
      const topic = (draftTopics[component.id] || "").trim();
      normalizedTopics[component.id] = topic;
      if (!topic) {
        nextErrors[component.id] = "Topik materi wajib diisi.";
      } else if (topic.length > 100) {
        nextErrors[component.id] = "Topik materi maksimal 100 karakter.";
      }
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setGeneralError("Guru wajib menginput topik pembelajaran.");
      requestAnimationFrame(() => firstInputRef.current?.focus());
      return;
    }

    setIsSaving(true);
    try {
      await onSave(normalizedTopics);
      onClose();
    } catch {
      setGeneralError("Topik materi gagal disimpan. Silakan coba kembali.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <Modal
        open={open}
        onClose={requestClose}
        title="Input Materi Pembelajaran"
        panelClassName="max-h-[calc(100vh-2rem)] !max-w-[650px] overflow-y-auto rounded-[24px] [&_h2]:text-base"
        initialFocusRef={firstInputRef}
      >
        <div>
          <div className="overflow-hidden">
            <div className="grid grid-cols-[120px_1fr] bg-[#F3F3FF] px-4 py-2.5 text-xs font-semibold text-[#4B5060] sm:grid-cols-[190px_1fr]">
              <span>Komponen Nilai</span>
              <span>Topik Materi</span>
            </div>
            {assessmentComponents.map((component, index) => {
              const errorId = `topic-error-${component.id}`;
              return (
                <div key={component.id} className="grid grid-cols-[120px_1fr] items-start gap-3 border-t border-[#E9ECF2] px-4 py-1.5 sm:grid-cols-[190px_1fr]">
                  <label htmlFor={`topic-${component.id}`} className="pt-2.5 text-sm font-medium text-[#20232D]">
                    {component.label}
                  </label>
                  <div>
                    <input
                      ref={index === 0 ? firstInputRef : undefined}
                      id={`topic-${component.id}`}
                      type="text"
                      maxLength={100}
                      value={draftTopics[component.id] || ""}
                      onChange={(event) => handleChange(component.id, event.target.value)}
                      disabled={isSaving}
                      aria-invalid={Boolean(errors[component.id])}
                      aria-describedby={errors[component.id] ? errorId : undefined}
                      placeholder={`Masukkan topik materi ${component.label}...`}
                      className={`h-9 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 disabled:bg-slate-50 ${
                        errors[component.id]
                          ? "border-red-500 focus:ring-red-100"
                          : "border-[#CDD4E2] focus:border-[#0756D9] focus:ring-blue-100"
                      }`}
                    />
                    {errors[component.id] && <p id={errorId} className="mt-1 text-xs text-red-600">{errors[component.id]}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="-mx-6 -mb-6 mt-5 flex flex-col gap-3 border-t border-[#E4E8F1] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="min-h-5 text-xs font-medium text-red-600">{generalError}</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button variant="secondary" onClick={requestClose} disabled={isSaving} className="h-11 border-[#0756D9] text-[#0756D9]">Batal</Button>
              <Button onClick={handleSave} loading={isSaving} className="h-11 min-w-[180px]">
                {!isSaving && <Save aria-hidden="true" className="h-4 w-4" />}
                {isSaving ? "Menyimpan..." : "Simpan Materi"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
  );
}
