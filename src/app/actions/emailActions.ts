'use server';

import { Resend } from 'resend';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { checkAdminSession } from './adminAuth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBroadcastEmail(subject: string, htmlContent: string, targetAudience: 'all' | 'paid') {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required.' };
    }

    const db = getAdminDb();
    const usersSnapshot = await db.collection('users').get();
    
    const emails: string[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.email) return;

      if (targetAudience === 'paid') {
        if (data.paymentStatus === 'Paid') {
          emails.push(data.email);
        }
      } else {
        emails.push(data.email);
      }
    });

    if (emails.length === 0) {
      return { success: false, error: 'No users found in the selected audience.' };
    }

    // Resend allows batch sending by passing an array of emails to `to`, up to 50 at a time.
    // Or you can pass an array to Bcc so they don't see each other's emails.
    // The best way to broadcast without showing all emails is to BCC everyone.
    
    // We will send in batches of 50 (Resend limit)
    const BATCH_SIZE = 50;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      
      await resend.emails.send({
        from: 'Vishwa Leader <info@vishwaleader.com>',
        to: ['info@vishwaleader.com'], // Send to self
        bcc: batch,                    // BCC the users
        subject: subject,
        html: htmlContent,
      });
    }

    return { success: true, count: emails.length };
  } catch (error: any) {
    console.error('Error sending broadcast email:', error);
    return { success: false, error: error.message || 'Failed to send emails.' };
  }
}

export async function sendSingleEmail(to: string, subject: string, htmlContent: string) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required.' };
    }

    const data = await resend.emails.send({
      from: 'Vishwa Leader <info@vishwaleader.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending single email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendDonationThankYouEmail(to: string, name: string, amount: number, purpose: string, paymentId: string) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1d4ed8; font-size: 24px; font-weight: bold; margin-bottom: 5px;">Thank You for Your Support!</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Vishwa Leader Techmedia Pvt Ltd</p>
        </div>
        
        <p style="font-size: 16px; color: #0f172a; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          We are deeply grateful for your generous donation of <strong>₹${amount.toLocaleString('en-IN')}</strong> towards the <strong>${purpose}</strong>. Your contribution directly supports our mission and projects.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Donation Receipt Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 40%;">Receipt ID</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace;">REC_${paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Payment ID</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Amount Paid</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #1d4ed8;">₹${amount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Purpose</td>
              <td style="padding: 6px 0; text-align: right;">${purpose}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Status</td>
              <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: 600;">Success</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Date</td>
              <td style="padding: 6px 0; text-align: right;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Your donation receipt is always accessible on your dashboard.
        </p>
        
        <p style="font-size: 14px; color: #334155; margin-top: 30px;">
          Warm regards,<br/>
          <strong>The Vishwa Leader Team</strong>
        </p>
        
        <div style="margin-top: 40px; border-t: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          This is an automated receipt confirmation from Vishwa Leader. Please do not reply directly to this email. For support, write to info@vishwaleader.com.
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Vishwa Leader <info@vishwaleader.com>',
      to: [to],
      cc: ['info@vishwaleader.com'],
      subject: `Thank you for your donation to Vishwa Leader! [Receipt REC_${paymentId}]`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending donation thank-you email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendReuploadNotification(to: string, name: string, rejectedItems: { key?: string; label?: string; feedback?: string; }[] | string[]) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #ef4444; font-size: 20px;">Action Required: Document Re-upload</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>During verification, we found issues with some of your submitted documents. Please re-upload the following items:</p>
        <ul>
          ${rejectedItems.map(item => {
            if (typeof item === 'string') {
              return `<li><strong>${item}</strong></li>`;
            }
            return `<li><strong>${item.label || item.key}</strong>: ${item.feedback || 'Please re-upload a clear copy.'}</li>`;
          }).join('')}
        </ul>
        <p>Please log in to your Vishwa Leader dashboard to upload the correct documents as soon as possible.</p>
        <p>Regards,<br/><strong>The Vishwa Leader Team</strong></p>
      </div>
    `;

    await resend.emails.send({
      from: 'Vishwa Leader <info@vishwaleader.com>',
      to: [to],
      subject: 'Action Required: Re-upload Verification Documents',
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending reupload notification email:', error);
    return { success: false, error: error.message };
  }
}
