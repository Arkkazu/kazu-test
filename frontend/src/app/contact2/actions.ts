"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { checkRateLimit, trackEmailSent, type LimitWarning } from "@/lib/redis";

export type ContactData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type Contact2State =
  | { step: "form"; data?: Partial<ContactData>; error?: string }
  | { step: "confirm"; data: ContactData }
  | { step: "success" };

export async function submitContact2(
  _prevState: Contact2State,
  formData: FormData
): Promise<Contact2State> {
  const action = formData.get("_action") as string;

  // 確認画面 → フォームに戻る
  if (action === "back") {
    return {
      step: "form",
      data: {
        name:    formData.get("name")    as string,
        email:   formData.get("email")   as string,
        phone:   formData.get("phone")   as string,
        message: formData.get("message") as string,
      },
    };
  }

  // 確認画面 → メール送信
  if (action === "submit") {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return { step: "form", error: "しばらく時間をおいてから送信してください" };
    }

    const name    = formData.get("name")    as string;
    const email   = formData.get("email")   as string;
    const phone   = formData.get("phone")   as string;
    const message = formData.get("message") as string;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("=== お問い合わせ受信（RESEND_API_KEY未設定のためコンソール出力） ===");
      console.log({ name, email, phone: phone || "未入力", message });
      return { step: "success" };
    }

    const to = process.env.CONTACT_MAIL_TO;
    if (!to) {
      return { step: "form", error: "サーバー設定エラーが発生しました" };
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from:    process.env.CONTACT_MAIL_FROM ?? "onboarding@resend.dev",
      replyTo: email,
      to,
      subject: `【お問い合わせ】${name}様より`,
      html: `
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>電話番号:</strong> ${phone || "未入力"}</p>
        <hr>
        <p><strong>お問い合わせ内容:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { step: "form", error: "送信に失敗しました。しばらく経ってからお試しください。" };
    }

    const warning = await trackEmailSent();
    if (warning) await sendLimitWarning(resend, to, warning);

    return { step: "success" };
  }

  // フォーム → 確認画面（action === "confirm"）
  const honeypot = formData.get("website") as string;
  if (honeypot) return { step: "success" };

  const name    = formData.get("name")    as string;
  const email   = formData.get("email")   as string;
  const phone   = formData.get("phone")   as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { step: "form", error: "必須項目を入力してください" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { step: "form", error: "メールアドレスの形式が正しくありません" };
  }

  return { step: "confirm", data: { name, email, phone, message } };
}

async function sendLimitWarning(
  resend: Resend,
  to: string,
  warning: LimitWarning
): Promise<void> {
  const label      = warning.type === "monthly" ? "月次" : "日次";
  const limitLabel = warning.type === "monthly" ? "3,000通/月" : "100通/日";
  const pct        = Math.round((warning.count / warning.limit) * 100);

  await resend.emails.send({
    from: process.env.CONTACT_MAIL_FROM ?? "onboarding@resend.dev",
    to,
    subject: `【警告】Resend ${label}送信数が上限の${pct}%に達しました`,
    html: `
      <p>Resend の${label}送信数が上限に近づいています。</p>
      <table>
        <tr><td><strong>種別</strong></td><td>${label}（上限: ${limitLabel}）</td></tr>
        <tr><td><strong>現在の送信数</strong></td><td>${warning.count} / ${warning.limit} 通（${pct}%）</td></tr>
      </table>
      <p style="color:red">このまま送信が続くと上限に達し、お問い合わせメールが届かなくなります。</p>
      <p><a href="https://resend.com/overview">Resend ダッシュボードで確認する</a></p>
    `,
  }).catch((e) => console.error("Warning email error:", e));
}
