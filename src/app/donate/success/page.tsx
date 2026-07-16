import SuccessClient from "./success-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation Successful | Thank You for Your Support",
  description: "Your donation receipt has been generated. Thank you for supporting Vishwa Leader.",
};

export default function DonateSuccessPage() {
  return <SuccessClient />;
}
