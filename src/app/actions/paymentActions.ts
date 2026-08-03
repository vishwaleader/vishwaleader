'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, arrayUnion } from "firebase/firestore";

// Price Dictionary mapping item IDs to their Payment Gateway INR prices (including gateway fees & GST)
const PRICE_DICTIONARY: Record<string, number> = {
    // New Dynamic Unified Onboarding
    "reg_conference": 6136,
    "reg_business": 12272,
    "reg_award": 6136,
    "reg_presenter": 6136,
    "reg_souvenir": 6136,
    
    // A La Carte Options
    "day_1": 6136,
    "day_2": 12272,
    "day_3": 6136,
    
    // Souvenir Advertisements
    "ad_front_cover": 500000,
    "ad_back_cover": 200000,
    "ad_inside_cover": 150000,
    "ad_double_spread": 100000,
    "ad_full_page": 50000,
    "ad_half_page": 25000,
    "ad_quarter_page": 15000,

    // Tour Packages (Prices via Payment Gateway)
    "pkg_india": 136240,
    "pkg_intl": 208520,
    "pkg_1": 322400,
    "pkg_2": 244400,
    "pkg_3": 208520,
    "pkg_4": 136240,

    // High-Level Support & Patronage
    "donation_patron": 118000,
};

export async function createDynamicOrder(
    selectedItems: string[], 
    customDonationAmount?: number,
    paymentMode: 'FULL' | 'PARTIAL' = 'FULL',
    partialAmount?: number
) {
    if (!selectedItems || selectedItems.length === 0) {
        return { success: false, error: 'No items selected.' };
    }

    // Calculate authoritative total
    let totalAmount = 0;
    for (const item of selectedItems) {
        if (item === 'donation_patron' && customDonationAmount !== undefined) {
            totalAmount += customDonationAmount;
            continue;
        }

        if (PRICE_DICTIONARY[item] === undefined) {
            return { success: false, error: `Invalid item selected: ${item}` };
        }
        totalAmount += PRICE_DICTIONARY[item];
    }

    if (totalAmount <= 0) {
        return { success: false, error: 'Total amount must be greater than zero.' };
    }

    let payableAmount = totalAmount;

    if (paymentMode === 'PARTIAL') {
        if (totalAmount < 6000) {
            return { success: false, error: 'Part payment is only available for orders of ₹6,000 or above.' };
        }
        if (partialAmount && partialAmount > 0) {
            const MIN_DEPOSIT = 5000;
            if (partialAmount < MIN_DEPOSIT) {
                return { success: false, error: `Minimum partial payment is ₹${MIN_DEPOSIT.toLocaleString('en-IN')}` };
            }
            if (partialAmount > totalAmount) {
                return { success: false, error: 'Partial amount cannot exceed the total price.' };
            }
            payableAmount = Math.round(partialAmount);
        }
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return { success: false, error: 'Razorpay API credentials are not configured in environment variables.' };
    }

    const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    // Cap amount at 5,00,000 INR for test mode Razorpay accounts
    const isTestMode = keyId.startsWith('rzp_test_');
    const finalAmount = isTestMode ? Math.min(payableAmount, 500000) : payableAmount;

    const options = {
        amount: Math.round(finalAmount * 100), // amount in paise
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return { success: false, error: 'Failed to create order.' };
        }
        return { success: true, order, totalAmount, payableAmount };
    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        return { success: false, error: `Could not create Razorpay order: ${error.message || JSON.stringify(error)}` };
    }
}

export async function verifyDynamicPayment(
    paymentId: string, 
    orderId: string, 
    signature: string, 
    userId: string,
    selectedItems: string[],
    totalAmount: number,
    paidAmount?: number
) {
    if (!paymentId || !orderId || !signature || !userId || !selectedItems || selectedItems.length === 0) {
        return { success: false, error: 'Invalid verification arguments.' };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        return { success: false, error: 'Razorpay key secret is not configured.' };
    }

    try {
        // Verify signature securely
        const generated_signature = crypto
            .createHmac('sha256', keySecret)
            .update(orderId + "|" + paymentId)
            .digest('hex');

        if (generated_signature !== signature) {
            return { success: false, error: 'Payment signature verification failed.' };
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        const currentPaid = paidAmount && paidAmount > 0 ? paidAmount : totalAmount;
        const previousAmountPaid = Number(userData.amountPaid) || 0;
        const newAmountPaid = previousAmountPaid + currentPaid;
        
        // Take larger of calculated total or existing stored totalAmount if previously set
        const authoritativeTotal = Math.max(totalAmount, Number(userData.totalAmount) || 0);
        const remainingBalance = Math.max(0, authoritativeTotal - newAmountPaid);
        const newStatus = remainingBalance <= 0 ? "Paid" : "Partially Paid";

        // 1. Save detailed order to 'orders' collection (Source of truth)
        const orderDocRef = await addDoc(collection(db, 'orders'), {
            userId: userId,
            paymentId: paymentId,
            orderId: orderId,
            status: "completed",
            createdAt: new Date().toISOString(),
            amount: currentPaid,
            totalOrderAmount: authoritativeTotal,
            remainingBalance: remainingBalance,
            paymentType: remainingBalance <= 0 ? "Full" : "Partial",
            items: selectedItems.map(id => ({ id }))
        });

        // 2. Update user document
        await updateDoc(userRef, {
            paymentStatus: newStatus,
            paymentId: paymentId,
            paymentOrderId: orderId,
            paidAt: new Date().toISOString(),
            totalAmount: authoritativeTotal,
            amountPaid: newAmountPaid,
            remainingBalance: remainingBalance,
            accessRights: arrayUnion(...selectedItems),
            paymentHistory: arrayUnion({
                paymentId: paymentId,
                orderId: orderId,
                amount: currentPaid,
                paidAt: new Date().toISOString(),
                paymentType: newStatus === "Paid" ? "Full / Final" : "Partial Deposit",
                remainingBalance: remainingBalance
            })
        });

        return { success: true, orderDocId: orderDocRef.id, newStatus, remainingBalance, newAmountPaid };
    } catch (error: any) {
        console.error("Payment signature verification error:", error);
        return { success: false, error: error.message || 'Signature verification failed.' };
    }
}

export async function createBalancePaymentOrder(userId: string, requestedAmount?: number) {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return { success: false, error: 'Razorpay API credentials are not configured in environment variables.' };
    }

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: 'User profile not found.' };
        }

        const userData = userSnap.data();
        const remainingBalance = Number(userData.remainingBalance) || 0;

        if (remainingBalance <= 0) {
            return { success: false, error: 'No outstanding balance remaining.' };
        }

        let payableAmount = remainingBalance;
        if (requestedAmount && requestedAmount > 0) {
            payableAmount = Math.min(requestedAmount, remainingBalance);
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const isTestMode = keyId.startsWith('rzp_test_');
        const finalAmount = isTestMode ? Math.min(payableAmount, 500000) : payableAmount;

        const options = {
            amount: Math.round(finalAmount * 100),
            currency: 'INR',
            receipt: `receipt_bal_${new Date().getTime()}`,
        };

        const order = await razorpay.orders.create(options);
        if (!order) {
            return { success: false, error: 'Failed to create balance payment order.' };
        }

        return { 
            success: true, 
            order, 
            remainingBalance, 
            payableAmount, 
            totalAmount: Number(userData.totalAmount) || remainingBalance,
            accessRights: userData.accessRights || []
        };
    } catch (error: any) {
        console.error('Balance payment order creation error:', error);
        return { success: false, error: error.message || 'Could not create balance payment order.' };
    }
}