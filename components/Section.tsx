interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Section({ title, description, children }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
