import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, souls } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Arcane Ledger <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Soul is Bound!',
      html: `
        <div style="font-family: serif; background: #050505; color: #E3DAC9; padding: 40px; border: 2px solid #D4AF37;">
          <h1 style="color: #D4AF37; text-align: center; letter-spacing: 0.2em;">ARCANE LEDGER</h1>
          <p style="font-size: 18px;">Greetings, <strong>${name}</strong>,</p>
          <p>The ritual is complete. Your identity has been bound to the cloud.</p>
          <p>Your current essence of <strong>${souls} Souls</strong> has been secured. Your progress is now eternal.</p>
          <hr style="border-color: #4B3F72;" />
          <p style="font-style: italic; text-align: center;">"The stars merely watch, but we burn our own paths."</p>
        </div>
      `,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
