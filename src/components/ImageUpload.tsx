import { useState } from "react";
import classNames from "classnames";

import { textStyle, hoverColour } from "@ryanliu6/xi/styles";
import ImagePreview from "@/components/ImagePreview";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import ErrorPopup from './ErrorPopup';

export type Stage = "uploading" | "processing" | "extracting" | "complete";

interface ImageUploadProps {
  onUpload: (file: File, setStage: (stage: Stage) => void) => Promise<void>;
}

const ImageUpload = ({ onUpload }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("uploading");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting upload process...");

      await onUpload(selectedFile, setStage);

    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Failed to upload file";
      handleError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    setStage("uploading");
  };

  return (
    <>
      {!selectedFile ? (
        <div className="flex flex-col gap-4">
          <div
            className={classNames(
              "border-2 border-dashed rounded-lg p-8 text-center",
              hoverColour,
              {
                "border-violet-500": isDragging,
                "opacity-50": isLoading
              }
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) await handleUpload(file);
            }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleUpload(file);
              }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={classNames(textStyle, "cursor-pointer")}
            >
              Drop your schedule image here or click to upload
            </label>
            {error && (
              <p className="text-red-500 mt-2 text-sm">{error}</p>
            )}
          </div>

          {/* Data Protection Note */}
          <div className={classNames(
            "p-4 rounded-lg text-center",
            "bg-slate-50 dark:bg-slate-800",
            "border border-slate-200 dark:border-slate-700"
          )}>
            <h3 className={`${textStyle} font-semibold mb-2`}>Data Protection - Your privacy matters!</h3>
            <p className={`${textStyle} text-sm text-slate-500 dark:text-slate-400`}>
              We use OCR.space for text extraction, and the processed schedule is stored securely on our server.
              <br />
              <br />
              For your convenience, it's available for 1 hour, then automatically deleted from our system.
              <br />
              <br />
              No data is sent or kept on any server past that point. If you wish to keep your schedule, please download the generated file.
            </p>
          </div>
        </div>
      ) : previewUrl ? (
        isLoading ? (
          <ProcessingIndicator stage={stage} />
        ) : (
          <ImagePreview
            imageUrl={previewUrl}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            isLoading={isLoading}
          />
        )
      ) : null}

      {showError && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => {
            setShowError(false);
            handleCancel();
          }}
        />
      )}
    </>
  );
};

export default ImageUpload;
