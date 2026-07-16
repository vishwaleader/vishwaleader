'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { sendDonationThankYouEmail } from "./emailActions";

export async function createDonationOrder(amount: number) {
    if (!amount || amount <= 0) {
        return { success: false, error: 'Amount must be greater than zero.' };
    }

    const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Cap amount at 5,00,000 INR for test mode Razorpay accounts to prevent amount exceeds limit error
    const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');
    const finalAmount = isTestMode ? Math.min(amount, 500000) : amount;

    const options = {
        amount: Math.round(finalAmount * 100), // amount in paise
        currency: 'INR',
        receipt: `receipt_donation_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return { success: false, error: 'Failed to create order.' };
        }
        return { success: true, order };
    } catch (error: any) {
        console.error('Razorpay donation order creation error:', error);
        return { success: false, error: `Could not create order: ${error.message || JSON.stringify(error)}` };
    }
}

export async function verifyDonationPayment(data: {
    paymentId: string;
    orderId: string;
    signature: string;
    userId: string | null;
    name: string;
    email: string;
    phone: string;
    amount: number;
    purpose: string;
    consent: boolean;
}) {
    const { paymentId, orderId, signature, userId, name, email, phone, amount, purpose, consent } = data;
    if (!paymentId || !orderId || !signature || !name || !email || !phone || !amount || !purpose) {
        return { success: false, error: 'Invalid verification arguments.' };
    }

    try {
        // Verify signature securely
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(orderId + "|" + paymentId)
            .digest('hex');

        if (generated_signature !== signature) {
            return { success: false, error: 'Payment signature verification failed.' };
        }

        // Save detailed donation to 'donations' collection
        const donationDocRef = await addDoc(collection(db, 'donations'), {
            userId: userId || null,
            paymentId: paymentId,
            orderId: orderId,
            status: "completed",
            createdAt: new Date().toISOString(),
            amount: amount,
            name: name,
            email: email,
            phone: phone,
            purpose: purpose,
            consent: consent
        });

        // Send email
        try {
            await sendDonationThankYouEmail(email, name, amount, purpose, paymentId);
        } catch (emailErr) {
            console.error("Failed to send thank-you email:", emailErr);
        }

        return { success: true, donationId: donationDocRef.id };
    } catch (error: any) {
        console.error("Donation verification error:", error);
        return { success: false, error: error.message || 'Signature verification failed.' };
    }
}

export async function getRecentDonors() {
    try {
        const { getAdminDb } = await import('@/lib/firebaseAdmin');
        const adminDb = getAdminDb();
        const snap = await adminDb
            .collection('donations')
            .where('consent', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: list };
    } catch (error: any) {
        console.error("Error fetching recent donors via admin:", error);
        return { success: false, error: error.message };
    }
}
