/* ── Vercel serverless: verify payment + send confirmation email ─────── */
/*
  POST /api/send-confirmation
  Body: {
    razorpay_payment_id, razorpay_order_id, razorpay_signature,
    service_key, amount, currency,
    customer_name, customer_email
  }

  Env vars (Vercel dashboard):
    RAZORPAY_KEY_SECRET  – to verify the payment signature
    RESEND_API_KEY       – from resend.com
    FROM_EMAIL           – e.g. "Gauri Pillai · FoodMedi.Co <hello@foodmedi.co>"
*/

import crypto from 'crypto';

/* ── Per-plan copy ─────────────────────────────────────────────────── */
const PLANS = {
  initial: {
    name:     'Initial Consultation',
    duration: '60–75 mins · Google Meet',
    emoji:    '🌱',
    thankYou: `This is the beginning of something meaningful. Your Initial Consultation with Gauri is the first real step toward understanding your body — your unique biology, your history, your goals — and building a nutrition plan that actually fits your life, not a template borrowed from someone else's.`,
    nextSteps: [
      'You'll receive a calendar invite for your Google Meet session within 24 hours.',
      'Please fill in the pre-consultation health questionnaire (link in the invite) — the more detail you share, the more we can cover in your session.',
      'Gather your most recent lab reports, prescriptions, or medical summaries if you have them.',
      'No prep needed beyond that. Come as you are.',
    ],
    closing: `Looking forward to meeting you and understanding what health means for you, specifically.`,
  },

  followup: {
    name:     'Follow-up Session',
    duration: '30–45 mins · Google Meet',
    emoji:    '🔄',
    thankYou: `Consistency is where real change happens — not in any single session, but in the space between them. By continuing with a follow-up, you're giving your plan the chance to adapt to your real life, and giving yourself the chance to see what's working and what needs a nudge.`,
    nextSteps: [
      'A calendar invite for your Google Meet session will be sent within 24 hours.',
      'Before the session, spend a few minutes noting what's felt easy, what's been hard, and any symptoms or changes since your last visit.',
      'If your labs or reports have been updated, please share them ahead of time.',
      'No formal prep required — honest reflection is all you need.',
    ],
    closing: `See you soon. Every session builds on the last.`,
  },

  package: {
    name:     'Nutrition Package',
    duration: 'Multi-session programme',
    emoji:    '📋',
    thankYou: `You've made a real commitment — and that matters. The Nutrition Package gives you the depth and continuity that one-off sessions simply can't offer. Gauri will be with you through each phase: understanding your baseline, building your plan, refining it as your body responds, and equipping you with the tools to maintain it long after the programme ends.`,
    nextSteps: [
      'An onboarding call will be scheduled within 48 hours to map out your session timeline.',
      'You'll receive a pre-consultation questionnaire — please complete this before the first session.',
      'Compile your recent medical reports, lab results, and a 3-day food diary if possible.',
      'If you have a specific medical condition or goal driving this, prepare a brief summary — it helps Gauri prepare a more targeted plan.',
    ],
    closing: `This is one of the best investments you can make in your own health. We're honoured to be part of it.`,
  },

  group: {
    name:     'Group Session',
    duration: 'Group · Google Meet',
    emoji:    '🤝',
    thankYou: `There's something quietly powerful about healing alongside others. Your Group Session brings together people at similar points in their health journeys — to learn, ask questions, share what's worked, and hear Gauri's guidance in a setting that feels both professional and personal.`,
    nextSteps: [
      'Session details, the Google Meet link, and the exact schedule will be emailed separately.',
      'You're welcome to submit questions in advance — there will be a form in your session confirmation.',
      'Please keep your camera on if possible — it makes the group feel more connected.',
      'You'll receive a resource pack after the session with key takeaways and personalised notes.',
    ],
    closing: `Looking forward to having you in the group. See you there.`,
  },

  oncology: {
    name:     'Oncology Nutrition Consultation',
    duration: '60–75 mins · Google Meet',
    emoji:    '💚',
    thankYou: `This takes courage — both to face what you or your loved one is going through, and to take an active step toward supporting it. Gauri is honoured to be part of your care team. Oncology nutrition is deeply personal, and every recommendation will be tailored around your specific diagnosis, treatment protocol, and the realities of your daily life — always in coordination with your treating oncologist at Tata Cancer Hospital.`,
    nextSteps: [
      'A calendar invite for your Google Meet session will arrive within 24 hours.',
      'Please fill in the oncology intake form carefully — diagnosis, current treatment phase, medications, and any side effects you're managing.',
      'Share recent lab reports, treatment summaries, or oncologist notes if available.',
      'If a caregiver is attending, they are very welcome — in fact, we encourage it.',
      'Please let your treating oncologist know you're working with a clinical dietitian — coordinated care gives you the best outcomes.',
    ],
    closing: `You are not alone in this. Gauri will be alongside you every step of the way.`,
  },

  corporate: {
    name:     'Corporate Wellness Programme',
    duration: 'Team · Custom schedule',
    emoji:    '🏢',
    thankYou: `A team that feels well, performs well. By investing in your team's nutrition, you're making a decision that shows up in energy, focus, immune resilience, and the kind of sustained performance that no productivity tool can manufacture. Gauri will work with your organisation to build habits that are practical, evidence-based, and actually enjoyable — not the kind people ignore after week two.`,
    nextSteps: [
      'A scheduling coordinator will reach out within 24 hours to plan your onboarding call.',
      'On the call, we'll understand your team size, goals, industry, and any specific wellness challenges.',
      'We'll then design a session structure that fits your calendar — not the other way around.',
      'If you'd like any dietary preferences or restrictions from the team gathered in advance, we'll send you a simple form to share.',
    ],
    closing: `Thank you for putting your team's health first. We're looking forward to building something great together.`,
  },
};

/* ── Email HTML builder ─────────────────────────────────────────────── */
function buildEmailHtml({ plan, customerName, amount, currency, paymentId, date }) {
  const firstName  = customerName.split(' ')[0] || customerName;
  const amountFmt  = currency === 'INR'
    ? '₹' + Number(amount).toLocaleString('en-IN')
    : '$' + Number(amount).toLocaleString('en-US');

  const stepsHtml = plan.nextSteps.map(step => `
    <tr>
      <td style="padding:0 0 12px 0;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:3px 12px 0 0;color:#137A48;font-size:18px;line-height:1;">→</td>
          <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#2C3A2F;">${step}</td>
        </tr></table>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Booking Confirmed · FoodMedi.Co</title></head>
<body style="margin:0;padding:0;background:#F4F7F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7F3;padding:40px 20px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <!-- Header -->
    <tr><td style="background:#0E5F38;border-radius:20px 20px 0 0;padding:36px 40px 32px;text-align:center;">
      <p style="margin:0 0 6px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.6);">FoodMedi.Co</p>
      <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#fff;letter-spacing:-.01em;">Booking Confirmed ${plan.emoji}</h1>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:40px 40px 36px;">

      <!-- Greeting -->
      <p style="margin:0 0 20px;font-size:17px;line-height:1.65;color:#0A2615;">
        Hi <strong>${firstName},</strong>
      </p>
      <p style="margin:0 0 32px;font-size:15.5px;line-height:1.75;color:#2C3A2F;">
        ${plan.thankYou}
      </p>

      <!-- Invoice card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#F4F7F3;border-radius:14px;border:1px solid #DDE3DA;margin-bottom:36px;">
        <tr><td style="padding:20px 24px 0;">
          <p style="margin:0 0 16px;font-family:monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#5A6A5E;">Payment Receipt</p>
        </td></tr>

        <tr><td style="padding:0 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:13px;color:#5A6A5E;padding-bottom:10px;">Plan</td>
              <td align="right" style="font-size:13.5px;font-weight:600;color:#0A2615;padding-bottom:10px;">${plan.name}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#5A6A5E;padding-bottom:10px;">Duration</td>
              <td align="right" style="font-size:13.5px;color:#2C3A2F;padding-bottom:10px;">${plan.duration}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#5A6A5E;padding-bottom:10px;">Date</td>
              <td align="right" style="font-size:13.5px;color:#2C3A2F;padding-bottom:10px;">${date}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top:1px solid #DDE3DA;padding-top:12px;padding-bottom:0;"></td>
            </tr>
            <tr>
              <td style="font-size:15px;font-weight:700;color:#0A2615;padding-bottom:14px;">Amount Paid</td>
              <td align="right" style="font-size:22px;font-weight:700;color:#137A48;font-family:Georgia,serif;padding-bottom:14px;">${amountFmt}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="background:#EEF3ED;border-radius:0 0 14px 14px;padding:12px 24px;">
          <p style="margin:0;font-family:monospace;font-size:11px;color:#5A6A5E;letter-spacing:.06em;">
            Payment ID &nbsp;·&nbsp; ${paymentId}
          </p>
        </td></tr>
      </table>

      <!-- Next steps -->
      <p style="margin:0 0 18px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-family:monospace;color:#137A48;">What happens next</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${stepsHtml}
      </table>

      <!-- Closing -->
      <p style="margin:32px 0 0;font-size:15.5px;line-height:1.7;color:#2C3A2F;font-style:italic;">
        ${plan.closing}
      </p>

      <p style="margin:28px 0 0;font-size:15px;color:#0A2615;">
        With care,<br/>
        <strong>Gauri Pillai</strong><br/>
        <span style="font-size:13px;color:#5A6A5E;">Clinical Dietitian · FoodMedi.Co</span>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#EEF3ED;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#5A6A5E;">
        Questions? Reply to this email or write to
        <a href="mailto:hello@foodmedi.co" style="color:#137A48;text-decoration:none;">hello@foodmedi.co</a>
      </p>
      <p style="margin:0;font-size:11px;color:#8A9A8E;">
        © ${new Date().getFullYear()} FoodMedi.Co · All sessions are conducted over Google Meet.
      </p>
    </td></tr>

  </table>
  </td></tr>
  </table>

</body>
</html>`;
}

/* ── Owner notification email ───────────────────────────────────────── */
function buildOwnerEmailHtml({ plan, customerName, customerEmail, customerPhone, amount, currency, paymentId, date }) {
  const amountFmt = currency === 'INR'
    ? '₹' + Number(amount).toLocaleString('en-IN')
    : '$' + Number(amount).toLocaleString('en-US');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Booking · FoodMedi.Co</title></head>
<body style="margin:0;padding:0;background:#F4F7F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7F3;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#0E5F38;border-radius:16px 16px 0 0;padding:28px 36px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.6);font-family:monospace;">FoodMedi.Co · New Booking</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#fff;">
      💰 Payment received — ${plan.name}
    </h1>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:32px 36px;">

    <!-- Amount callout -->
    <div style="background:#EEF3ED;border-left:4px solid #137A48;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;color:#5A6A5E;font-family:monospace;letter-spacing:.1em;text-transform:uppercase;">Amount Received</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:32px;color:#137A48;font-weight:700;">${amountFmt}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#5A6A5E;">${plan.name} &nbsp;·&nbsp; ${date}</p>
    </div>

    <!-- Customer details -->
    <p style="margin:0 0 16px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-family:monospace;color:#137A48;">Customer Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-size:13px;color:#5A6A5E;padding-bottom:12px;width:110px;">Name</td>
        <td style="font-size:14px;font-weight:600;color:#0A2615;padding-bottom:12px;">${customerName}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#5A6A5E;padding-bottom:12px;">Email</td>
        <td style="font-size:14px;color:#2C3A2F;padding-bottom:12px;">
          <a href="mailto:${customerEmail}" style="color:#137A48;text-decoration:none;">${customerEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#5A6A5E;padding-bottom:12px;">Phone</td>
        <td style="font-size:14px;color:#2C3A2F;padding-bottom:12px;">${customerPhone || '—'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#5A6A5E;padding-bottom:12px;">Plan</td>
        <td style="font-size:14px;color:#2C3A2F;padding-bottom:12px;">${plan.name} &nbsp;·&nbsp; ${plan.duration}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#5A6A5E;">Payment ID</td>
        <td style="font-size:13px;font-family:monospace;color:#5A6A5E;">${paymentId}</td>
      </tr>
    </table>

    <!-- Quick reply CTA -->
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#137A48;border-radius:999px;padding:12px 28px;">
        <a href="mailto:${customerEmail}?subject=Your ${encodeURIComponent(plan.name)} — FoodMedi.Co"
           style="color:#fff;font-size:14px;font-weight:600;text-decoration:none;font-family:'Helvetica Neue',sans-serif;">
          Reply to ${customerName.split(' ')[0]} →
        </a>
      </td></tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#8A9A8E;">
      A confirmation email has already been sent to the customer automatically.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#EEF3ED;border-radius:0 0 16px 16px;padding:18px 36px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#8A9A8E;">FoodMedi.Co · Booking notification</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── Handler ────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    service_key,
    amount,
    currency = 'INR',
    customer_name,
    customer_email,
    customer_phone,
  } = req.body || {};

  /* ── Verify Razorpay signature ── */
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (secret) {
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
  }

  const plan = PLANS[service_key];
  if (!plan) return res.status(400).json({ error: 'Unknown service' });

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL
    ? `Gauri Pillai · FoodMedi.Co <${process.env.FROM_EMAIL}>`
    : 'Gauri Pillai · FoodMedi.Co <hello@foodmedi.co>';
  const ownerEmail = process.env.OWNER_EMAIL || process.env.FROM_EMAIL || 'hello@foodmedi.co';

  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return res.status(200).json({ sent: false, reason: 'email not configured' });
  }

  const date        = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const firstName   = customer_name.split(' ')[0];

  const customerHtml  = buildEmailHtml({ plan, customerName: customer_name, amount, currency, paymentId: razorpay_payment_id, date });
  const ownerHtml     = buildOwnerEmailHtml({ plan, customerName: customer_name, customerEmail: customer_email, customerPhone: customer_phone, amount, currency, paymentId: razorpay_payment_id, date });

  const sendEmail = (to, subject, html) =>
    fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
    }).then(r => r.json().then(d => ({ ok: r.ok, data: d })));

  try {
    /* Send both emails in parallel */
    const [customerResult, ownerResult] = await Promise.all([
      sendEmail(
        customer_email,
        `Your ${plan.name} is confirmed, ${firstName}! ${plan.emoji}`,
        customerHtml,
      ),
      sendEmail(
        ownerEmail,
        `💰 New booking: ${plan.name} — ${customer_name}`,
        ownerHtml,
      ),
    ]);

    if (!customerResult.ok) console.error('Customer email failed:', customerResult.data);
    if (!ownerResult.ok)   console.error('Owner email failed:', ownerResult.data);

    return res.status(200).json({
      sent:     true,
      customer: customerResult.ok,
      owner:    ownerResult.ok,
    });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Email send failed' });
  }
}
