export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[420px] rounded-lg border border-divider bg-surface/60 p-8 shadow-2xl">
      <h1 className="font-heading text-3xl font-semibold text-text">{title}</h1>
      <p className="mt-1.5 mb-7 text-sm text-neutral-400">{subtitle}</p>
      {children}
    </div>
  );
}
