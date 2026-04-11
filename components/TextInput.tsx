"use client";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  help,
}: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex rounded-md border border-slate-300 bg-white shadow-sm focus-within:border-slate-500">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
      {help && <span className="mt-1 block text-xs text-slate-500">{help}</span>}
    </label>
  );
}
