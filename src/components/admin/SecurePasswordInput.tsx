"use client";

import { useState } from "react";
import { Lock, Wand2, Eye, EyeOff } from "lucide-react";

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function SecurePasswordInput({ value, onChange, placeholder = "Mínimo 8 caracteres", className, required = true }: SecurePasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const generateSecurePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    let pass = "";
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    
    const all = chars + uppers + numbers + symbols;
    for (let i = 0; i < 7; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
    onChange(pass);
    setShowPassword(true);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
          Contraseña Inicial *
        </label>
        <button
          type="button"
          onClick={generateSecurePassword}
          className="inline-flex items-center gap-1 text-[9px] font-bold text-[#00f0ff] hover:text-white uppercase tracking-widest bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 px-2 py-1 rounded transition-colors"
        >
          <Wand2 size={10} />
          Generar Segura
        </button>
      </div>
      <div className="relative">
        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type={showPassword ? "text" : "password"}
          required={required}
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className={`w-full pl-9 pr-10 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
