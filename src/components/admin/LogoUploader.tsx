"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface LogoUploaderProps {
  onUploadSuccess: (url: string) => void;
  defaultImage?: string;
  compact?: boolean;
}

export function LogoUploader({ onUploadSuccess, defaultImage, compact = false }: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [status, setStatus] = useState<"idle" | "processing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const processImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("No canvas context");

          // Target dimensions (Square Crop & Resize to 500x500)
          const TARGET_SIZE = 500;
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;

          // Calculate crop
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;

          // Draw cropped and resized image
          ctx.drawImage(img, startX, startY, size, size, 0, 0, TARGET_SIZE, TARGET_SIZE);

          // Convert to highly compressed WEBP
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject("Canvas to Blob failed");
            },
            "image/webp",
            0.85 // 85% quality - excellent balance of size and visual quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMessage("Solo se permiten imágenes");
      return;
    }

    try {
      setStatus("processing");
      
      // 1. Client-side Pipeline: Crop, Resize, WebP Compression
      const processedBlob = await processImage(file);
      
      // Mostrar preview instantáneo
      const previewUrl = URL.createObjectURL(processedBlob);
      setPreview(previewUrl);

      // 2. Subir a Supabase Storage
      setStatus("uploading");
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      
      const { error } = await supabase.storage
        .from("logos")
        .upload(fileName, processedBlob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) throw error;

      // 3. Obtener URL Pública
      const { data: publicUrlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      setStatus("success");
      onUploadSuccess(publicUrlData.publicUrl);

    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Error procesando imagen");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />

      <button
        type="button"
        aria-label="Cambiar escudo del club"
        title="Cambiar escudo del club"
        disabled={status === "uploading" || status === "processing"}
        onClick={() => fileInputRef.current?.click()}
        className={`${compact ? 'size-20 sm:size-32' : 'size-32'} rounded-lg border flex items-center justify-center cursor-pointer transition-colors overflow-hidden group focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-4 disabled:opacity-50
          ${status === 'error' ? 'border-red-500 bg-red-500/10' : 'border-border-default hover:border-brand-primary bg-bg-elevated'}
        `}
      >
        {preview ? (
          <span className="relative w-full h-full">
            <img src={preview} alt="Escudo del club" className="w-full h-full object-contain p-3" />
            <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-white" />
            </span>
          </span>
        ) : (
          <span className="flex flex-col items-center gap-2 text-text-secondary group-hover:text-brand-primary">
            <UploadCloud className="w-8 h-8" />
            <span className="text-xs text-center px-2">Subir escudo</span>
          </span>
        )}
      </button>

      <div className="min-h-4" role="status">
        {status === 'idle' && <span className="text-xs text-text-secondary">Cambiar escudo</span>}
        {status === 'processing' && (
          <span className="flex items-center gap-1 text-yellow-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Optimizando...
          </span>
        )}
        {status === 'uploading' && (
          <span className="flex items-center gap-1 text-brand-teal font-bold text-[10px] uppercase tracking-widest animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Subiendo...
          </span>
        )}
        {status === 'success' && (
          <span className="flex items-center gap-1 text-green-500 font-bold text-[10px] uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" /> ¡Listo!
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase tracking-widest">
            <AlertTriangle className="w-3 h-3" /> {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
}
