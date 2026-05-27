import { useRef, useState, useCallback } from "react";
import { ImageIcon } from "lucide-react";

type ImageItem = {
  id: string;
  file?: File;
  previewUrl: string;
};

type ImageUploadProps = {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
};

const MAX_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// UI tokens
const TEXT_SECONDARY = "#777777";
const BG_ELEVATED = "rgb(24,24,24)";

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const addImages = useCallback(
    (files: FileList) => {
      setError(null);

      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        setError(`Max ${maxImages} images allowed.`);
        return;
      }

      const newImages: ImageItem[] = [];

      for (const file of Array.from(files).slice(0, remaining)) {
        if (!ACCEPTED.includes(file.type)) {
          setError("Only JPG, PNG, GIF, WebP are supported.");
          continue;
        }

        if (file.size > MAX_MB * 1024 * 1024) {
          setError(`Each image must be under ${MAX_MB}MB.`);
          continue;
        }

        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onChange]
  );

  return (
    <div>
      {/* Upload Button */}
      <button
        type="button"
        aria-label="Add image"
        disabled={images.length >= maxImages}
        onClick={() => inputRef.current?.click()}
        className="p-1.5 rounded-lg transition-colors disabled:cursor-not-allowed"
        style={{
          color: TEXT_SECONDARY,
          opacity: images.length >= maxImages ? 0.3 : 1,
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
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) addImages(e.target.files);
          e.target.value = "";
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