import { useRef, useState, useCallback } from "react";
import { ImageIcon } from "lucide-react";

type ImageUploadProps = {
  image: File | null;
  setImage: (image: File) => void;
};

const MAX_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// UI tokens
const TEXT_SECONDARY = "#777777";
const BG_ELEVATED = "rgb(24,24,24)";

export default function ImageUpload({
  image,
  setImage
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const addImages = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED.includes(file.type)) {
        setError("Only JPG, PNG, GIF, WebP are supported.");
        return;
      }

      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`Each image must be under ${MAX_MB}MB.`);
        return;
      }
    },
    [image]
  );

  return (
    <div>
      {/* Upload Button */}
      <button
        type="button"
        aria-label="Add image"
        disabled={!!image}
        onClick={() => inputRef.current?.click()}
        className="p-1.5 rounded-lg transition-colors disabled:cursor-not-allowed"
        style={{
          color: TEXT_SECONDARY,
          opacity: !!image ? 0.3 : 1,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = BG_ELEVATED)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <ImageIcon size={20} />
      </button>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        hidden
        onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
                setImage(file);
            }
        }}
      />

      {/* Error */}
      {error && (
        <p
          role="alert"
          style={{
            fontSize: 12,
            color: "hsl(350, 87%, 55%)",
            marginTop: 6,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}