// ──────────────────────────────────────────────
// AdaptationBanner – shown after a plan is adapted
// ──────────────────────────────────────────────

interface AdaptationBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function AdaptationBanner({
  visible,
  onDismiss,
}: AdaptationBannerProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
      <p className="text-sm text-amber-200">
        ✨ Your plan has been adapted based on missed tasks.
      </p>
      <button
        onClick={onDismiss}
        className="ml-4 shrink-0 text-xs text-amber-300/60 transition hover:text-amber-200"
      >
        Dismiss
      </button>
    </div>
  );
}
