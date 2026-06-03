import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { data, error } = await resend.emails.send({
      from: "AetherMail <news@aethernews.com>",
      to: email,
      subject: "Thank you for subscribing to AetherMail",
      html: `<p>Hi there,</p><p>Thank you for joining AetherMail! We’ll keep you updated with the latest GTA‑6 news and gaming articles.</p>`,
    });
    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ success: false, error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
