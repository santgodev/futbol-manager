"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Clock, UserRound, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export interface MatchEvent {
  id: string;
  type: string;
  minute: number | null;
  player: { id: string; name: string; number: number | null } | null;
  team_id: string;
  description: string | null;
}

export interface EventContextMenuCallbacks {
  onEditMinute: (event: MatchEvent) => void;
  onChangePlayer: (event: MatchEvent) => void;
  onDelete: (event: MatchEvent) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

interface EventContextMenuProps {
  event: MatchEvent;
  callbacks: EventContextMenuCallbacks;
  /** Flip the dropdown to the left when the event is on the right (away team). */
  alignRight?: boolean;
}

// ─────────────────────────────────────────────────────────────
// PORTAL DROPDOWN — renders outside overflow-hidden containers
// ─────────────────────────────────────────────────────────────
function DropdownPortal({
  position,
  onClose,
  children,
}: {
  position: MenuPosition;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <>
      {/* Invisible overlay to catch outside clicks */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* The actual menu, rendered at the calculated fixed position */}
      <div
        role="menu"
        style={{ top: position.top, left: position.left, animation: "contextMenuIn 130ms ease-out both" }}
        className="fixed z-[9999] w-52 bg-[#060f1f]/95 backdrop-blur-xl border border-[#0055cc]/40 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,240,255,0.04)] overflow-hidden"
      >
        {children}
      </div>
      <style>{`
        @keyframes contextMenuIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function EventContextMenu({ event, callbacks, alignRight = false }: EventContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const MENU_WIDTH = 208; // w-52 = 13rem = 208px
    const GAP = 4;

    // Anchor to left or right edge of the trigger button
    const left = alignRight
      ? rect.right - MENU_WIDTH
      : rect.left;

    // Flip upward if not enough space below
    const spaceBelow = window.innerHeight - rect.bottom;
    const ESTIMATED_MENU_HEIGHT = 170;
    const top = spaceBelow < ESTIMATED_MENU_HEIGHT
      ? rect.top - ESTIMATED_MENU_HEIGHT - GAP
      : rect.bottom + GAP;

    setMenuPos({ top, left: Math.max(8, left) });
    setIsOpen(true);
  };

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const handleAction = (fn: () => void) => {
    fn();
    closeMenu();
  };

  const menuItems = [
    {
      icon: <Clock size={13} />,
      label: "Editar minuto",
      description: "Corregir el minuto del evento",
      action: () => callbacks.onEditMinute(event),
      color: "text-[#00f0ff]",
      hoverBg: "hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30",
    },
    {
      icon: <UserRound size={13} />,
      label: "Cambiar jugador",
      description: "Asignar a otro futbolista",
      action: () => callbacks.onChangePlayer(event),
      color: "text-[#a78bfa]",
      hoverBg: "hover:bg-[#a78bfa]/10 hover:border-[#a78bfa]/30",
    },
    {
      icon: <Trash2 size={13} />,
      label: "Eliminar evento",
      description: "Quitar del timeline",
      action: () => callbacks.onDelete(event),
      color: "text-red-400",
      hoverBg: "hover:bg-red-500/10 hover:border-red-500/30",
      isDanger: true,
    },
  ];

  return (
    <div className="relative shrink-0">
      {/* Trigger ⋮ */}
      <button
        ref={triggerRef}
        aria-label="Opciones del evento"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={openMenu}
        className={`
          w-6 h-6 rounded-md flex items-center justify-center
          text-white/20 transition-all duration-150
          hover:text-white/70 hover:bg-white/5
          focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff]/50
          ${isOpen ? "text-white/70 bg-white/5" : ""}
        `}
      >
        <MoreVertical size={14} />
      </button>

      {/* Portal-rendered dropdown — escapes all overflow-hidden parents */}
      {isOpen && (
        <DropdownPortal position={menuPos} onClose={closeMenu}>
          {/* Header */}
          <div className="px-3 pt-2.5 pb-1.5 border-b border-white/5">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
              Evento {event.minute ? `${event.minute}'` : "—"}
            </span>
          </div>

          {/* Items */}
          <div className="p-1.5 flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => handleAction(item.action)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  border border-transparent text-left transition-all duration-100
                  focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff]/50
                  ${item.hoverBg}
                  ${item.isDanger ? "mt-0.5 border-t border-white/5 rounded-t-none pt-3" : ""}
                `}
              >
                <span className={`shrink-0 ${item.color}`}>{item.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                  <span className="text-[9px] text-white/30 leading-tight">{item.description}</span>
                </div>
              </button>
            ))}
          </div>
        </DropdownPortal>
      )}
    </div>
  );
}
