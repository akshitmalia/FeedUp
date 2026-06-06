// PostCard is defined OUTSIDE any parent component
// This means React never destroys/recreates it on re-render
// which fixes the edit textarea losing focus on every keystroke

export default function PostCard({
  feed,
  showDelete = false,
  showUpvote = true,
  editPostId,
  editText,
  onEditStart,     // (id, currentText) => void
  onEditChange,    // (newText) => void
  onEditSave,      // (id) => void
  onEditCancel,    // () => void
  onDelete,        // (id) => void
  onUpvote,        // (id) => void
}) {
  const isEditing = editPostId === feed._id;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => onEditSave(feed._id)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              Save
            </button>
            <button
              onClick={onEditCancel}
              className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-800 mb-2 text-sm leading-relaxed break-words">
            {feed.post}
          </p>
          <small className="text-gray-400 text-xs">
            {new Date(feed.createdAt).toLocaleString()}
          </small>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {showUpvote && (
              <button
                onClick={() => onUpvote(feed._id)}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition text-sm font-medium"
              >
                ▲ {feed.votes}
              </button>
            )}
            {showDelete && (
              <>
                <button
                  onClick={() => onEditStart(feed._id, feed.post)}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(feed._id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}