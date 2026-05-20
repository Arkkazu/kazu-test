export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-lg font-bold text-gray-900">My Blog</span>
        <p className="text-sm text-gray-500">© {year} My Blog. All rights reserved.</p>
      </div>
    </footer>
  );
}
