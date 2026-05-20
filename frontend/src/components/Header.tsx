export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-tight text-gray-900">
          My Blog
        </a>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/" className="hover:text-gray-900 transition-colors">ホーム</a>
          <a href="/news" className="hover:text-gray-900 transition-colors">お知らせ</a>
          <a href="/about" className="hover:text-gray-900 transition-colors">About</a>
        </nav>
      </div>
    </header>
  );
}
