export default function PostCard({
  feed,
  showDelete = false,
  showUpvote = true,
  editPostId,
  editText,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
  onUpvote,
}) {
  const isEditing = editPostId === feed._id;

  return (
    <div className="flex bg-surface rounded-2xl overflow-hidden mb-3 border border-white/5">

      {/* Vote column — the signature element. Large mono number, separate zone. */}
      {showUpvote && (
        <button
          onClick={() => onUpvote(feed._id)}
          className="flex flex-col items-center justify-center gap-1 px-4 py-4 bg-white/[0.03] hover:bg-ember/10 transition-colors w-16 flex-shrink-0 group"
        >
          <span className="text-ember text-lg leading-none group-hover:-translate-y-0.5 transition-transform">▲</span>
          <span className="font-mono text-lg font-bold text-paper">{feed.votes}</span>
        </button>
      )}

      {!showUpvote && (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-4 bg-white/[0.02] w-16 flex-shrink-0">
          <span className="font-mono text-lg font-bold text-slate">{feed.votes}</span>
        </div>
      )}

      {/* Content column */}
      <div className="flex-1 px-4 py-4 min-w-0">
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => onEditChange(e.target.value)}
              className="w-full bg-ink border border-violet/30 rounded-xl p-3 mb-3 text-paper text-sm font-body focus:outline-none focus:border-violet resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => onEditSave(feed._id)}
                className="px-4 py-1.5 bg-violet text-white rounded-lg text-xs font-medium hover:bg-violet/80 transition"
              >
                Save changes
              </button>
              <button
                onClick={onEditCancel}
                className="px-4 py-1.5 text-slate text-xs font-medium hover:text-paper transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-paper text-sm leading-relaxed break-words font-body mb-2">
              {feed.post}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate">
                {new Date(feed.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {' · '}
                {new Date(feed.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>

              {showDelete && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEditStart(feed._id, feed.post)}
                    className="text-[11px] font-medium text-violet hover:text-violet/70 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(feed._id)}
                    className="text-[11px] font-medium text-ember hover:text-ember/70 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}