// ──────────────────────────────────────────────
// ModelBadge – shows which LLM model was used
// ──────────────────────────────────────────────

interface ModelBadgeProps {
  model: string;
}

export default function ModelBadge({ model }: ModelBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {model}
    </span>
  );
}
