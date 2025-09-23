export function CoursesHeader() {
  return (
    <div className="flex items-center justify-start mb-6">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button className="px-4 py-2 bg-slate-800 text-white text-sm font-medium">2025 2Q</button>
        <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border-l border-gray-300 hover:bg-gray-50">
          2025 1Q
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border-l border-gray-300 hover:bg-gray-50">
          ANTERIORES
        </button>
      </div>
    </div>
  )
}
