"use client";

import { FloatingWidget } from "@/components/FloatingWidget";

export default function WidgetPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        background: "transparent",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <FloatingWidget />
    </div>
  );
}
