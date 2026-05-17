import { useRef, useState, useCallback } from "react";
import { ImageIcon } from "lucide-react";

export type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ImageUploadProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
};

const MAX_MB   = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Design tokens
const TEXT_SECONDARY = "#777777";
const BG_ELEVATED    = "rgb(24,24,24)";

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError]  = useState<string | null>(null);

  const add = useCallback(
    (files: FileList) => {
      setError(null);
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        setError(`Max ${maxImages} images allowed.`);
        return;
      }
      const toAdd: UploadedImage[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!ACCEPTED.includes(file.type)) {
          setError("Only JPG, PNG, GIF, WebP are supported.");
          continue;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
          setError(`Each image must be under ${MAX_MB}MB.`);
          continue;
        }
        toAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
      if (toAdd.length) onChange([...images, ...toAdd]);
    },
    [images, maxImages, onChange]
  );

  return (
    <div>
      <button
        type="button"
        aria-label="Add image"
        disabled={images.length >= maxImages}
        onClick={() => inputRef.current?.click()}
        className="p-1.5 rounded-lg transition-colors disabled:cursor-not-allowed"
        style={{ color: TEXT_SECONDARY, opacity: images.length >= maxImages ? 0.3 : 1 }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = BG_ELEVATED)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <ImageIcon size={20} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        hidden
        aria-hidden
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <p
          role="alert"
          style={{ fontSize: 12, color: "hsl(350, 87%, 55%)", marginTop: 6 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}