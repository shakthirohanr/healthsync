export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-medical ${className}`}>
      <div className="h-9 w-9 rounded-lg bg-white"></div>
    </div>
  );
}
