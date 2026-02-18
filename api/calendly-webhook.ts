// Calendly Webhook Handler - Sends booking confirmations to invitees
// POST /api/calendly-webhook

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MailService } from '@sendgrid/mail';

// ============================================================================
// TYPES
// ============================================================================

interface CalendlyWebhookPayload {
  event: 'invitee.created' | 'invitee.canceled';
  payload: {
    event: {
      uri: string;
      name: string;
      start_time: string;
      end_time: string;
      location?: {
        type: string;
        location?: string;
        join_url?: string;
      };
    };
    invitee: {
      uri: string;
      name: string;
      email: string;
      timezone: string;
    };
    questions_and_answers?: Array<{
      question: string;
      answer: string;
    }>;
    scheduled_event?: {
      uri: string;
      name: string;
      start_time: string;
      end_time: string;
    };
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDateTime(isoString: string, timezone: string): { date: string; time: string } {
  const date = new Date(isoString);

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short',
  });

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

// ============================================================================
// SENDGRID EMAIL
// ============================================================================

async function sendBookingConfirmationEmail(data: {
  inviteeName: string;
  inviteeEmail: string;
  eventName: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  joinUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'phil.shields92@gmail.com';

  if (!apiKey) {
    console.error('Missing SENDGRID_API_KEY');
    return { success: false, error: 'Missing SENDGRID_API_KEY' };
  }

  const mailService = new MailService();
  mailService.setApiKey(apiKey);

  const { date, time } = formatDateTime(data.startTime, data.timezone);
  const endFormatted = formatDateTime(data.endTime, data.timezone);

  const locationHtml = data.joinUrl
    ? `<a href="${data.joinUrl}" style="color: #3b82f6;">Join Video Call</a>`
    : data.location || 'To be confirmed';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #050505; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .detail-box { background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 20px; margin: 15px 0; }
    .detail-row { display: flex; margin: 10px 0; }
    .detail-label { color: #666; font-size: 14px; width: 100px; }
    .detail-value { color: #050505; font-size: 16px; font-weight: 500; }
    .cta-button { display: inline-block; background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Meeting Confirmed!</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">${data.eventName}</p>
  </div>

  <div class="content">
    <p>Hi ${data.inviteeName},</p>
    <p>Your meeting with Phil Shields at Nukode has been confirmed. Here are the details:</p>

    <div class="detail-box">
      <div style="margin: 10px 0;">
        <div style="color: #666; font-size: 12px; text-transform: uppercase;">Date</div>
        <div style="color: #050505; font-size: 18px; font-weight: bold;">${date}</div>
      </div>
      <div style="margin: 10px 0;">
        <div style="color: #666; font-size: 12px; text-transform: uppercase;">Time</div>
        <div style="color: #050505; font-size: 18px; font-weight: bold;">${time} - ${endFormatted.time}</div>
      </div>
      <div style="margin: 10px 0;">
        <div style="color: #666; font-size: 12px; text-transform: uppercase;">Location</div>
        <div style="color: #050505; font-size: 16px;">${locationHtml}</div>
      </div>
    </div>

    <p>I'm looking forward to discussing how AI automation can help your business save time and reduce costs.</p>

    <p>If you need to reschedule or cancel, please use the link in your calendar invite.</p>

    <p>Best regards,<br><strong>Phil Shields</strong><br>Nukode - AI Automation Agency</p>
  </div>

  <div class="footer">
    <p><a href="https://nukode.co.uk">nukode.co.uk</a></p>
  </div>
</body>
</html>`;

  const text = `
Meeting Confirmed - ${data.eventName}

Hi ${data.inviteeName},

Your meeting with Phil Shields at Nukode has been confirmed.

Date: ${date}
Time: ${time} - ${endFormatted.time}
Location: ${data.joinUrl || data.location || 'To be confirmed'}

I'm looking forward to discussing how AI automation can help your business save time and reduce costs.

If you need to reschedule or cancel, please use the link in your calendar invite.

Best regards,
Phil Shields
Nukode - AI Automation Agency
https://nukode.co.uk
`;

  try {
    console.log(`Sending booking confirmation to ${data.inviteeEmail}`);
    await mailService.send({
      to: data.inviteeEmail,
      from: { email: fromEmail, name: 'Phil Shields' },
      subject: `Meeting Confirmed: ${data.eventName} - ${date}`,
      html,
      text,
    });
    console.log('Booking confirmation sent successfully');
    return { success: true };
  } catch (err: any) {
    console.error('SendGrid error:', JSON.stringify(err?.response?.body || err.message));
    return { success: false, error: err?.message };
  }
}

async function sendCancellationEmail(data: {
  inviteeName: string;
  inviteeEmail: string;
  eventName: string;
  startTime: string;
  timezone: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'phil.shields92@gmail.com';

  if (!apiKey) {
    return { success: false, error: 'Missing SENDGRID_API_KEY' };
  }

  const mailService = new MailService();
  mailService.setApiKey(apiKey);

  const { date, time } = formatDateTime(data.startTime, data.timezone);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6b7280; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .cta-button { display: inline-block; background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Meeting Cancelled</h1>
  </div>
  <div class="content">
    <p>Hi ${data.inviteeName},</p>
    <p>Your meeting scheduled for <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
    <p>If you'd like to reschedule, please book a new time:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://calendly.com/phil-shields92" class="cta-button">Book New Meeting</a>
    </div>
    <p>Best regards,<br><strong>Phil Shields</strong><br>Nukode</p>
  </div>
</body>
</html>`;

  try {
    await mailService.send({
      to: data.inviteeEmail,
      from: { email: fromEmail, name: 'Phil Shields' },
      subject: `Meeting Cancelled: ${data.eventName}`,
      html,
    });
    return { success: true };
  } catch (err: any) {
    console.error('SendGrid error:', err?.response?.body || err.message);
    return { success: false, error: err?.message };
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: CalendlyWebhookPayload = req.body;

    console.log('Calendly webhook received:', payload.event);

    const { event, invitee } = payload.payload;
    const scheduledEvent = payload.payload.scheduled_event || event;

    if (payload.event === 'invitee.created') {
      // New booking - send confirmation
      const result = await sendBookingConfirmationEmail({
        inviteeName: invitee.name,
        inviteeEmail: invitee.email,
        eventName: scheduledEvent.name,
        startTime: scheduledEvent.start_time,
        endTime: scheduledEvent.end_time,
        timezone: invitee.timezone,
        location: event.location?.location,
        joinUrl: event.location?.join_url,
      });

      if (!result.success) {
        console.error('Failed to send confirmation:', result.error);
      }

      return res.status(200).json({ success: true, emailSent: result.success });
    }

    if (payload.event === 'invitee.canceled') {
      // Cancellation - send cancellation email
      const result = await sendCancellationEmail({
        inviteeName: invitee.name,
        inviteeEmail: invitee.email,
        eventName: scheduledEvent.name,
        startTime: scheduledEvent.start_time,
        timezone: invitee.timezone,
      });

      return res.status(200).json({ success: true, emailSent: result.success });
    }

    // Unknown event type
    return res.status(200).json({ success: true, message: 'Event type not handled' });

  } catch (error: any) {
    console.error('Calendly webhook error:', error);
    return res.status(200).json({ success: false, error: error.message });
  }
}
