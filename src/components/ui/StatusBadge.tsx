const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  active:  { label: 'Ativo',     bg: 'bg-green-100',  text: 'text-green-700'  },
  pending: { label: 'Pendente',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
  paid:    { label: 'Pago',      bg: 'bg-green-100',  text: 'text-green-700'  },
  inactive:{ label: 'Inativo',   bg: 'bg-red-100',    text: 'text-red-700'    },
};

export function StatusBadge({ status }: { status: string }) {
  const { label, bg, text } = STATUS_MAP[status] ?? STATUS_MAP.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}
