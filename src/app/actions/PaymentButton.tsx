'use client';

import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/paymentActions';
import { useAuth } from '@/app/actions/AuthContext'; // Assuming you have an AuthContext to get the user

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PaymentButton() {
    const { user } = useAuth(); // Get the currently logged-in user

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            alert('Could not load payment gateway. Please check your connection.');
            return;
        }

        // 1. Create the order on the server
        const registrationFee = 5900; // Registration fee in INR (5000 + 18% GST)
        const result = await createRazorpayOrder(registrationFee);

        if (!result.success || !result.order) {
            alert(result.error || 'Something went wrong.');
            return;
        }

        const { order } = result;

        // 2. Open the Razorpay checkout modal
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Vishwa Leader Tech Media Pvt Ltd',
            description: 'Delegation Fee: ₹5000 + 18% GST: ₹900 (Total: ₹5900)',
            order_id: order.id,
            handler: async function (response: any) {
                // 3. This function is called after a successful payment
                // Call the verification action on the server
                if (!user) {
                    alert('You must be logged in to verify a payment.');
                    return;
                }

                const verificationResult = await verifyRazorpayPayment(
                    response.razorpay_payment_id,
                    response.razorpay_order_id,
                    response.razorpay_signature,
                    user.uid
                );

                if (verificationResult.success) {
                    alert('Payment Successful and Verified!');
                    // Optionally, you can refresh the page or redirect the user
                    window.location.reload();
                } else {
                    alert(`Payment verification failed: ${verificationResult.error}`);
                }
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return <button onClick={handlePayment}>Pay Registration Fee</button>;
}