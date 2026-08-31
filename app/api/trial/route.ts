import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parentName, email, phone, childAge, preferredTime } = body;

    if (!parentName || !email) {
      return NextResponse.json(
        { error: "Parent name and email are required." },
        { status: 400 }
      );
    }

    // 1. Send notification email to YOU
    await resend.emails.send({
      from: "Àwa Yorùbá <onboarding@resend.dev>", // Default testing domain on Resend
      to: process.env.NOTIFICATION_EMAIL || "your-email@gmail.com",
      subject: `🎉 New Trial Booking: ${parentName}`,
      html: `
        <h2>New Free Trial Request Received!</h2>
        <p><strong>Parent Name:</strong> ${parentName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone / WhatsApp:</strong> ${phone || "Not provided"}</p>
        <p><strong>Child's Age:</strong> ${childAge}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime}</p>
        <hr />
        <p><em>Reply directly to ${email} or reach out via WhatsApp at ${phone}.</em></p>
      `,
    });

    // 2. Send confirmation email to the PARENT
    await resend.emails.send({
      from: "Àwa Yorùbá <onboarding@resend.dev>",
      to: email,
      subject: "Ẹ kú àbọ̀! Your Free Yoruba Trial Session Request",
      html: `
        <div font-family: sans-serif; color: #1A2621;">
          <h2>Ẹ kú àbọ̀, ${parentName}!</h2>
          <p>Thank you for requesting a free trial session with <strong>Àwa Yorùbá</strong>.</p>
          <p>We’ve received your details for the <strong>Ages ${childAge}</strong> program. Our team will review your preferred time (<em>${preferredTime}</em>) and contact you shortly via email or WhatsApp to finalize your slot.</p>
          <br />
          <p>Ẹ ṣeun (Thank you),<br /><strong>The Àwa Yorùbá Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Free trial booking submitted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend Email Error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}