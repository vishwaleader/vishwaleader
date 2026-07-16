import SuccessClient from "./success-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribution Successful | Thank You for Supporting Vishwa Leader",
  description: "Your patron contribution receipt has been generated. Thank you for supporting Vishwa Leader.",
};

export default function PatronSuccessPage() {
  return <SuccessClient />;
}
