"use client";

import React from 'react';
import Link from 'next/link';
import { Map, Plane, Check, X, CalendarDays, MapPin } from 'lucide-react';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

const itinerary = [
  { day: "01", date: "Thursday, 17 Sept. 2026", title: "Arrival & Inaugural Function", events: ["Arrive London LHR Airport & freshen up","Transfer to restaurant for Indian lunch","Drive to Atrium Hotel LHR (4 Star) & Check-in","Banquet Hall reserved at Hotel for Inaugural Function & Indian dinner"] },
  { day: "02", date: "Friday, 18 Sept. 2026", title: "SOAS Conference & London Eye", events: ["Breakfast at the hotel","Transfer to Central London for Event @ Brunei Gallery Lecture Theatre, SOAS University of London","Lunch at University","Ride on the London Eye & Cruise on River Thames","Dinner at Indian restaurant & transfer to hotel"] },
  { day: "03", date: "Saturday, 19 Sept. 2026", title: "Windsor Castle & Business Summit", events: ["Breakfast at the hotel","Transfer to and entrance to Windsor Castle","Lunch at Indian restaurant and return to hotel","International Business Summit @ Atrium Suite","Dinner post summit & Overnight at hotel"] },
  { day: "04", date: "Sunday, 20 Sept. 2026", title: "International Awards Ceremony", events: ["Breakfast at the hotel and morning at leisure","Indian lunch at hotel","Depart for Central London - Arrive at Greenwood Theatre, Guys Campus","International Awards and Cultural Ceremony","Dinner at Indian restaurant & return to hotel"] },
  { day: "05", date: "Monday, 21 Sept. 2026", title: "City Tour & Ambedkar Museum", events: ["Guided City tour of London with visit to Ambedkar Museum","Lunch at Indian restaurant","Visit to Madame Tussauds Wax Museum","Free time at Oxford Street","Dinner at Indian restaurant & Overnight at hotel"] },
  { day: "06", date: "Tuesday, 22 Sept. 2026", title: "Heritage Tour", events: ["Visit to LSE, India House, and Grey's Inn","Lunch at Indian restaurant","Visit to Tower of London","Dinner at Indian restaurant & Overnight at hotel"] },
  { day: "07", date: "Wednesday, 23 Sept. 2026", title: "Wolverhampton & Oxford", events: ["Drive towards Wolverhampton & Lunch","Visit Wolverhampton Buddha Vihara","Drive to Oxford for Orientation tour","Dinner at Indian restaurant & Transfer to hotel"] },
  { day: "08", date: "Thursday, 24 Sept. 2026", title: "Departure", events: ["Breakfast at the hotel","Check out and Transfer to the airport for Departure","Tour Ends"] }
];

export default function TourPackagePage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      <main className="pb-16 md:pb-20">

        {/* Hero */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <Plane className="w-4 h-4 text-amber-400" /> 7 Nights / 8 Days
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">London Tour Package 2026</h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">Join the ultimate delegation experience from 17th–24th Sept. 2026. Book your spot entirely online.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          <div className="md:col-span-2 space-y-8">

            {/* Itinerary */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-8 flex items-center gap-2"><Map className="w-5 h-5 text-slate-400" /> Detailed Itinerary</h2>
              <div className="space-y-6">
                {itinerary.map((day, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 text-slate-900 flex items-center justify-center font-bold text-sm shrink-0">{day.day}</div>
                      {index !== itinerary.length - 1 && <div className="w-px h-full bg-slate-200 mt-2 mb-2" />}
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex-1 mb-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{day.date}</p>
                      <h3 className="font-semibold text-slate-900 text-base mb-4">{day.title}</h3>
                      <ul className="space-y-3">
                        {day.events.map((event, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" /><span>{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400" /> Hotel Atrium — Tour Base</h2>
                <p className="text-slate-500 text-sm mt-1">Bath Road, Heathrow, London, UK (4 Star)</p>
              </div>
              <iframe src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY}&q=Atrium+Hotel+Heathrow,Bath+Road,London,UK&zoom=15&maptype=satellite`}
                width="100%" height="280" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Hotel Atrium Heathrow London" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
              <div className="mb-2"><span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-1 rounded">Online Booking</span></div>
              <h3 className="font-bold text-lg text-white mt-3 mb-6">London Tour Booking</h3>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 mb-6">₹ 25,000 booking amount is <strong className="text-amber-200">Non-Refundable</strong>.</div>
              <EventRegistrationCTA itemId="pkg_1" price="₹3,10,000" label="Book London Tour Package" paidLabel="✅ Tour Package Booked" dark />
              <Link 
                href="/pricing"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/40 mt-3"
              >
                Check Pricing
              </Link>
              <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-600">Secured by</p>
                <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain mx-auto mt-1 opacity-40 invert" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Inclusions</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {["Return Economy class Airfare (BOM-LHR-BOM)","Hotel Atrium Accommodation (Twin Sharing)","Continental Breakfast, Indian Lunch & Dinner","Entire road journey by 49 Seater Coach","VISA + Travel Insurance (Up to 59 years)"].map((s, i) => (
                  <li key={i} className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /><span>{s}</span></li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2"><X className="w-5 h-5 text-slate-400" /> Exclusions</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {["Cost of pre/post tour hotel accommodation","To and fro Air fare to join/leave the group","Porterage, laundry, wines & alcoholic beverages"].map((s, i) => (
                  <li key={i} className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" /><span>{s}</span></li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-slate-400" /> Tour Dates</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Departure</span><span className="font-semibold text-slate-900">17 Sept 2026</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Return</span><span className="font-semibold text-slate-900">24 Sept 2026</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold text-slate-900">7 Nights / 8 Days</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
