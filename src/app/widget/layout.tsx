export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "transparent", width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}
