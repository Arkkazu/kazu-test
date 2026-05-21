"use client";

import { useActionState } from "react";
import { submitContact2, type Contact2State } from "./actions";

const initialState: Contact2State = { step: "form" };

export default function Contact2Form() {
  const [state, formAction, isPending] = useActionState(
    submitContact2,
    initialState
  );

  if (state.step === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
        <p className="text-green-800 font-semibold text-lg">
          お問い合わせを受け付けました
        </p>
        <p className="text-green-700 mt-2 text-sm">
          内容を確認の上、担当者よりご連絡いたします。
        </p>
      </div>
    );
  }

  if (state.step === "confirm") {
    const d = state.data;
    return (
      <div className="space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          以下の内容で送信します。よろしければ「送信する」を押してください。
        </div>

        <dl className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {[
            { label: "お名前",           value: d.name },
            { label: "メールアドレス",   value: d.email },
            { label: "電話番号",         value: d.phone || "未入力" },
            { label: "お問い合わせ内容", value: d.message },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-3 px-4 py-3 text-sm">
              <dt className="font-medium text-gray-600">{label}</dt>
              <dd className="col-span-2 text-gray-900 whitespace-pre-wrap">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-3">
          <form action={formAction} className="flex-1">
            <input type="hidden" name="_action"  value="back" />
            <input type="hidden" name="name"     value={d.name} />
            <input type="hidden" name="email"    value={d.email} />
            <input type="hidden" name="phone"    value={d.phone} />
            <input type="hidden" name="message"  value={d.message} />
            <button
              type="submit"
              disabled={isPending}
              className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              修正する
            </button>
          </form>

          <form action={formAction} className="flex-1">
            <input type="hidden" name="_action"  value="submit" />
            <input type="hidden" name="name"     value={d.name} />
            <input type="hidden" name="email"    value={d.email} />
            <input type="hidden" name="phone"    value={d.phone} />
            <input type="hidden" name="message"  value={d.message} />
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "送信中..." : "送信する"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // フォーム入力画面（step === "form"）
  // 戻ってきた場合は state.data で defaultValue を復元
  const d = state.data;
  return (
    <form
      key={JSON.stringify(d)}
      action={formAction}
      className="space-y-6"
    >
      {/* ハニーポット */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="_action" value="confirm" />

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name" name="name" type="text" required
            defaultValue={d?.name ?? ""}
            placeholder="山田 太郎"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email" name="email" type="email" required
            defaultValue={d?.email ?? ""}
            placeholder="example@mail.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-gray-400 text-xs ml-1">（任意）</span>
        </label>
        <input
          id="phone" name="phone" type="tel"
          defaultValue={d?.phone ?? ""}
          placeholder="090-0000-0000"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          お問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message" name="message" required rows={6}
          defaultValue={d?.message ?? ""}
          placeholder="お問い合わせ内容をご記入ください"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "確認中..." : "確認画面へ"}
      </button>
    </form>
  );
}
