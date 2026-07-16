import DonateClient from "./donate-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Patron | Support Vishwa Leader",
  description: "Become a patron or support Vishwa Leader with a donation. Your contribution helps us empower leadership and drive scholarly and professional recognition.",
};

export default function DonatePage() {
  return <DonateClient />;
}
