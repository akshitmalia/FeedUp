export default function FeedForm({ value, onChange, onSubmit }) {
  return (
    <div className="bg-surface rounded-2xl p-5 mb-6 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-ember"></span>
        <h2 className="font-display text-sm font-semibold text-paper tracking-wide uppercase">
          Share something
        </h2>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What's on your mind? No one will know it's you."
        rows={3}
        className="w-full bg-ink border border-white/10 rounded-xl p-3 mb-3 text-paper text-sm font-body placeholder:text-slate/60 focus:outline-none focus:border-violet transition resize-none"
      />
      <button
        onClick={onSubmit}
        className="w-full bg-ember text-white py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-ember/90 transition"
      >
        Post anonymously
      </button>
    </div>
  );
}