"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
  name: string;
  label: string;
  bucket?: string;
  folder?: string;
  required?: boolean;
}

export const ImageUpload = ({
  name,
  label,
  bucket = "logos",
  folder = "tournaments",
  required = false,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se admiten archivos de imagen (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB.");
      return;
    }

    setError(null);
    setUploading(true);

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload to Supabase Storage (browser client — uses anon key, RLS must allow authenticated users)
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError("Error al subir la imagen: " + uploadError.message);
      setUploading(false);
      setPreview(null);
      return;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    setUploadedUrl(publicUrl);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/90 font-bold ml-1">
        {label}
      </label>

      {/* Hidden field that holds the final uploaded URL for the form */}
      <input type="hidden" name={name} value={uploadedUrl} required={required} />

      {preview ? (
        /* ── Preview State ── */
        <div className="relative w-full aspect-video bg-[#040c1a]/80 border border-[#00f0ff]/40 rounded-lg overflow-hidden flex items-center justify-center">
          <Image
            src={preview}
            alt="Vista previa"
            fill
            className="object-contain p-4"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors z-10"
          >
            <X size={14} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-[#030b17]/70 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#00f0ff] text-xs font-semibold uppercase tracking-widest">
                Subiendo...
              </span>
            </div>
          )}
        </div>
      ) : (
        /* ── Drop Zone State ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="group relative w-full h-36 border-2 border-dashed border-[#0055cc]/60 hover:border-[#00f0ff] bg-[#040c1a]/40 hover:bg-[#002255]/30 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Upload
            size={24}
            className="text-[#0066cc] group-hover:text-[#00f0ff] transition-colors"
          />
          <p className="text-xs text-white/50 group-hover:text-white/80 transition-colors text-center leading-relaxed px-4">
            <span className="font-semibold text-[#00f0ff]/80">Haz clic</span> o arrastra aquí tu imagen
            <br />
            <span className="text-[10px]">PNG, JPG, WEBP · Máx 5MB</span>
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleChange}
      />

      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};
