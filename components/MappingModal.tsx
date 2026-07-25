"use client";

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  children: ReactNode;
};

export default function MappingModal({ open, children }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="modalOverlay">
      <div className="modalPanel">{children}</div>
    </div>
  );
}
