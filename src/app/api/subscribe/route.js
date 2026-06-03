let resend = null;
try {
  const { Resend } = require("resend");
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.warn("Resend not available:", e.message);
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!resend) {
      // Resend not configured — still show success to user
      console.warn("Resend not configured. Email not sent to:", email);
      return new Response(JSON.stringify({ success: true, note: "Email service not configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await resend.emails.send({
      from: "AetherMail <onboarding@resend.dev>",
      to: email,
      subject: "Thank you for subscribing to AetherMail!",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#0f0f13;color:#e2e8f0;border-radius:12px">
        <h2 style="color:#38bdf8;margin-bottom:8px">Welcome to AetherMail 🎮</h2>
        <p>Hi there,</p>
        <p>Thank you for subscribing! You'll now get the latest <strong>GTA 6</strong> news, gaming updates, and tech articles delivered straight to your inbox.</p>
        <p style="margin-top:24px;color:#94a3b8;font-size:13px">— The AetherNews Team</p>
      </div>`,
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

