export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-24 ${className}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-border border-t-primary" />
    </div>
  );
}
