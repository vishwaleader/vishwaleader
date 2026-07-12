'use server';

import { Resend } from 'resend';
import { getAdminDb } from '@/lib/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBroadcastEmail(subject: string, htmlContent: string, targetAudience: 'all' | 'paid') {
  try {
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
