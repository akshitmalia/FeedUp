// FeedForm is also outside any parent — stable across re-renders

export default function FeedForm({ value, onChange, onSubmit }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-3">
        Create Feed
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your thoughts here..."
        rows={3}
        className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        onClick={onSubmit}
        className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm"
      >
        Post
      </button>
    </div>
  );
}