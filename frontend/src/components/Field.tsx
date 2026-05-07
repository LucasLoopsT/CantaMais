function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon?: any;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center text-sm font-medium text-pink-200">
        {icon}
        {label}
      </div>
      {hint && <p className="text-xs text-pink-200/50">{hint}</p>}
      {children}
    </div>
  );
}

export default Field;
