'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection, arrayUnion } from "firebase/firestore";

// Price Dictionary mapping item IDs to their INR prices (including GST where applicable)
export const PRICE_DICTIONARY: Record<string, number> = {
    // A La Carte Options
    "day_1": 5900,
    "day_2": 11800,
    "day_3": 5900,
    
    // Souvenir Advertisements
    "ad_front_cover": 500000,
    "ad_back_cover": 200000,
    "ad_inside_cover": 150000,
    "ad_double_spread": 100000,
    "ad_full_page": 50000,
    "ad_half_page": 25000,
    "ad_quarter_page": 15000,

    // Tour Packages (Prices are inclusive of Registration Fee 23600)
    "pkg_1": 310000,
    "pkg_2": 235000,
    "pkg_3": 200501,
    "pkg_4": 131000,
};

export async function createDynamicOrder(selectedItems: string[]) {
    if (!selectedItems || selectedItems.length === 0) {
        return { success: false, error: 'No items selected.' };
    }

    // Calculate authoritative total
    let totalAmount = 0;
    for (const item of selectedItems) {
        if (PRICE_DICTIONARY[item] === undefined) {
            return { success: false, error: `Invalid item selected: ${item}` };
        }
        totalAmount += PRICE_DICTIONARY[item];
    }

    if (totalAmount <= 0) {
        return { success: false, error: 'Total amount must be greater than zero.' };
    }

    const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
        amount: totalAmount * 100, // amount in paise
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return { success: false, error: 'Failed to create order.' };
        }
        return { success: true, order, totalAmount };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return { success: false, error: 'Could not create Razorpay order.' };
    }
}

export async function verifyDynamicPayment(
    paymentId: string, 
    orderId: string, 
    signature: string, 
    userId: string,
    selectedItems: string[],
    totalAmount: number
) {
    if (!paymentId || !orderId || !signature || !userId || !selectedItems || selectedItems.length === 0) {
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

        // 1. Save detailed order to 'orders' collection (Source of truth)
        const orderDocRef = await addDoc(collection(db, 'orders'), {
            userId: userId,
            paymentId: paymentId,
            orderId: orderId,
            status: "completed",
            createdAt: new Date().toISOString(),
            amount: totalAmount,
            items: selectedItems.map(id => ({ id }))
        });

        // 2. Update user document with fast-access summary
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            paymentStatus: "Paid", // Legacy field, keeping for compatibility
            paymentId: paymentId,
            paymentOrderId: orderId,
            paidAt: new Date().toISOString(),
            accessRights: arrayUnion(...selectedItems)
        });

        return { success: true, orderDocId: orderDocRef.id };
    } catch (error: any) {
        console.error("Payment signature verification error:", error);
        return { success: false, error: error.message || 'Signature verification failed.' };
    }
}