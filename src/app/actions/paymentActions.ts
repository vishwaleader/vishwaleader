'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function createRazorpayOrder(amount: number) {
    const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return { success: false, error: 'Failed to create order.' };
        }
        return { success: true, order };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return { success: false, error: 'Could not create Razorpay order.' };
    }
}

export async function verifyRazorpayPayment(
    paymentId: string, 
    orderId: string, 
    signature: string, 
    userId: string
) {
    if (!paymentId || !orderId || !signature || !userId) {
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

        // Securely write payment state to Firestore on server-side
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            paymentStatus: "Paid",
            paymentId: paymentId,
            paymentOrderId: orderId,
            paidAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        console.error("Payment signature verification error:", error);
        return { success: false, error: error.message || 'Signature verification failed.' };
    }
}