import PatronClient from "./patron-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Patron | Support Vishwa Leader",
  description: "Support Vishwa Leader with a patron contribution. Fund academic research, leadership awards, and global scholarships in Dr. B.R. Ambedkar's legacy.",
};

export default function PatronPage() {
  return <PatronClient />;
}
