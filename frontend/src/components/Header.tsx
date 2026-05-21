"use client";

import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

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

          {/* お問い合わせ メガメニュー */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              aria-expanded={open}
              aria-haspopup="true"
            >
              お問い合わせ
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <>
              {/* ボタンとメニューの隙間を埋める透明ブリッジ */}
              <div className="absolute top-full left-0 right-0 h-2" aria-hidden="true" />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  フォームを選択
                </div>
                <a
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="mt-0.5 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-gray-900">標準フォーム</span>
                    <span className="block text-xs text-gray-500 mt-0.5">入力してそのまま送信</span>
                  </span>
                </a>
                <a
                  href="/contact2"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <span className="mt-0.5 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-gray-900">確認画面付きフォーム</span>
                    <span className="block text-xs text-gray-500 mt-0.5">送信前に内容を確認できる</span>
                  </span>
                </a>
              </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
