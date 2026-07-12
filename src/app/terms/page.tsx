"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 font-sans antialiased">

      {/* Main Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-4 mt-8 md:mt-12">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="space-y-3 pb-6 text-center">
            <div className="mx-auto w-12 h-1 bg-brandBlue/20 rounded-full mb-2"></div>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">LEGAL NOTE</CardTitle>
            <CardDescription className="text-base font-medium text-slate-500 uppercase tracking-widest">
              Declaration & Consent
            </CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-8 space-y-8 text-sm text-slate-600">
            <p className="leading-relaxed">
              This Legal Note applies to all delegates, participants, awardees, volunteers, researchers, paper presenters, sponsors, exhibitors, invitees, celebrity and attendees of any national or international event, program, conference, publication, or initiative organized under the banner of <strong className="text-slate-800">Vishwa Leader Techmedia Private Limited</strong>, including the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026, London.
            </p>

            <div className="space-y-6">
              
              {/* 1 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">1. Event Participation & Eligibility</h3>
                <p className="leading-relaxed">Participation in any Vishwa Leader Techmedia Private Limited event is subject to:</p>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Verification of identity and credentials</li>
                  <li>Acceptance of registration by the organizing committee</li>
                  <li>Compliance with event guidelines, rules, and announcements</li>
                </ul>
                <p className="font-medium text-slate-800 mt-2">Vishwa Leader Techmedia Pvt. Ltd. reserves the right to accept or reject any application without assigning reasons.</p>
              </div>

              {/* 2 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">2. Travel, Visa & Accommodation</h3>
                <p className="leading-relaxed">All delegates and participants are responsible for:</p>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Obtaining their own passport, visa, travel documents, insurance, and accommodation</li>
                  <li>Ensuring compliance with immigration and international travel laws</li>
                </ul>
                <p className="leading-relaxed mt-2">While Vishwa Leader Techmedia may provide supporting documents (e.g., invitation letter), it is not responsible for visa refusal, delay, cancellation, or any travel-related issues.</p>
              </div>

              {/* 3 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">3. No Liability for Loss, Damage, or Injury</h3>
                <p className="leading-relaxed">Vishwa Leader Techmedia Private Limited is not liable for:</p>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Loss of personal belongings</li>
                  <li>Travel delays or cancellations</li>
                  <li>Injury, illness, or medical emergencies</li>
                  <li>Any financial loss before, during, or after the event</li>
                </ul>
                <p className="font-medium text-slate-800 mt-2">Participants attend the event entirely at their own risk.</p>
              </div>

              {/* 4 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">4. Intellectual Property & Publication Rights</h3>
                <p className="leading-relaxed">By participating in the event:</p>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Delegates grant Vishwa Leader Techmedia Private Limited the right to use photographs, videos, interviews, and event footage for promotional and archival purposes.</li>
                  <li>Paper presenters agree that abstracts, papers, biographies, or profiles submitted may be published in the event souvenir, journal, website, or digital media.</li>
                </ul>
                <p className="leading-relaxed mt-2">All copyrights of publications, designs, recordings, photographs, and event materials remain the exclusive property of Vishwa Leader Techmedia Private Limited.</p>
              </div>

              {/* 5 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">5. Code of Conduct</h3>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>All attendees must maintain professional and respectful behavior throughout the event.</li>
                  <li>Harassment, discrimination, disruptive behavior, or violation of the law can lead to immediate removal from the event without refund.</li>
                </ul>
              </div>

              {/* 6 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">6. Awards & Recognitions</h3>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Award selection is based on nominations, committee evaluation, and organizational discretion.</li>
                  <li>The decision of Vishwa Leader’s Selection Committee shall be final and binding.</li>
                  <li>Awards cannot be contested legally or otherwise.</li>
                </ul>
              </div>

              {/* 7 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">7. Changes, Postponements & Force Majeure</h3>
                <p className="leading-relaxed">The organizing company reserves the right to:</p>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Change the schedule, venue, speakers, performers, or format</li>
                  <li>Postpone or cancel the event due to unforeseen circumstances, including natural disasters, pandemics, political instability, government regulations, or other force majeure events</li>
                </ul>
                <p className="leading-relaxed mt-2">In such cases, Vishwa Leader Techmedia Private Limited is not liable for any financial or personal loss incurred by participants.</p>
              </div>

              {/* 8 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">8. Financial Terms</h3>
                <ul className="list-disc pl-5 space-y-1 ml-2">
                  <li>Fees paid for registration, nomination, sponsorship, advertisement, or exhibition are generally non-refundable, except in cases expressly stated by the organizer.</li>
                  <li>Any disputes shall be subject to the jurisdiction of Mumbai courts only.</li>
                </ul>
              </div>

              {/* 9 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">9. Acceptance of Terms</h3>
                <p className="leading-relaxed">By registering for or attending the event, every participant agrees to this Legal Note and acknowledges that they have read, understood, and accepted all disclaimers and conditions.</p>
              </div>

            </div>

            <Separator className="my-8" />

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 space-y-4">
              <div>
                <p className="font-semibold text-slate-900">Issued By:</p>
                <p className="font-medium text-slate-800">Vishwa Leader Dr. B. R. Ambedkar International Awards Committee</p>
                <p className="text-slate-500">formed by Vishwa Leader Techmedia Private Limited<br/>Mumbai, Maharashtra, India<br/>(International Knowledge & Media Company)</p>
              </div>
              
              <div className="text-slate-500 italic border-l-2 border-brandBlue/30 pl-4 py-1">
                <strong>Note:</strong> In all matters of dispute, the decision of the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026 Committee formed by Vishwa Leader Techmedia Pvt. Ltd. shall be final and binding.
              </div>
            </div>

            <div className="bg-brandBlue/5 p-6 rounded-lg border border-brandBlue/10 flex gap-4 mt-6">
              <i className="fa-solid fa-circle-check text-brandBlue mt-1"></i>
              <p className="text-slate-700 font-medium leading-relaxed">
                I hereby declare and accept Legal Note and also the information provided above by me is true and correct. I understand that the event is organized by Vishwa Leader Techmedia Private Limited, Mumbai, India, and I agree to receive event-related updates.
              </p>
            </div>

          </CardContent>
        </Card>
      </main>

    </div>
  );
}
