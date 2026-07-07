import React from 'react';
import Link from 'next/link';
import { Map, Plane, Check, X, CreditCard, CalendarDays, Building } from 'lucide-react';

const itinerary = [
  {
    day: "01",
    date: "Thursday, 17 Sept. 2026",
    title: "Arrival & Inaugural Function",
    events: [
      "Arrive London LHR Airport & freshen up",
      "Transfer to restaurant for Indian lunch",
      "Drive to Atrium Hotel LHR (4 Star) & Check-in",
      "Banquet Hall reserved at Hotel for Inaugural Function & Indian dinner"
    ]
  },
  {
    day: "02",
    date: "Friday, 18 Sept. 2026",
    title: "SOAS Conference & London Eye",
    events: [
      "Breakfast at the hotel",
      "Transfer to Central London for Event @ Brunei Gallery Lecture Theatre, SOAS University of London",
      "Lunch at University",
      "Ride on the London Eye & Cruise on River Thames",
      "Dinner at Indian restaurant & transfer to hotel"
    ]
  },
  {
    day: "03",
    date: "Saturday, 19 Sept. 2026",
    title: "Windsor Castle & Business Summit",
    events: [
      "Breakfast at the hotel",
      "Transfer to and entrance to Windsor Castle",
      "Lunch at Indian restaurant and return to hotel",
      "International Business Summit @ Atrium Suite",
      "Dinner post summit & Overnight at hotel"
    ]
  },
  {
    day: "04",
    date: "Sunday, 20 Sept. 2026",
    title: "International Awards Ceremony",
    events: [
      "Breakfast at the hotel and morning at leisure",
      "Indian lunch at hotel",
      "Depart for Central London - Arrive at Greenwood Theatre, Guys Campus",
      "International Awards and Cultural Ceremony",
      "Dinner at Indian restaurant & return to hotel"
    ]
  },
  {
    day: "05",
    date: "Monday, 21 Sept. 2026",
    title: "City Tour & Ambedkar Museum",
    events: [
      "Guided City tour of London with visit to Ambedkar Museum",
      "Lunch at Indian restaurant",
      "Visit to Madame Tussauds Wax Museum",
      "Free time at Oxford Street",
      "Dinner at Indian restaurant & Overnight at hotel"
    ]
  },
  {
    day: "06",
    date: "Tuesday, 22 Sept. 2026",
    title: "Heritage Tour",
    events: [
      "Visit to LSE, India House, and Grey's Inn",
      "Lunch at Indian restaurant",
      "Visit to Tower of London",
      "Dinner at Indian restaurant & Overnight at hotel"
    ]
  },
  {
    day: "07",
    date: "Wednesday, 23 Sept. 2026",
    title: "Wolverhampton & Oxford",
    events: [
      "Drive towards Wolverhampton & Lunch",
      "Visit Wolverhampton Buddha Vihara",
      "Drive to Oxford for Orientation tour",
      "Dinner at Indian restaurant & Transfer to hotel"
    ]
  },
  {
    day: "08",
    date: "Thursday, 24 Sept. 2026",
    title: "Departure",
    events: [
      "Breakfast at the hotel",
      "Check out and Transfer to the airport for Departure",
      "Tour Ends"
    ]
  }
];

export default function TourPackagePage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-7 w-auto object-contain" />
            <span translate="no" className="notranslate font-sans font-bold tracking-tight text-sm text-slate-900">Vishwa Leader</span>
          </a>
          <div className="flex gap-6 text-sm font-medium text-slate-500 hidden md:flex">
            <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
          </div>
        </div>
      </header>

      <main className="pb-16 md:pb-20">
        
        {/* Hero Section */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <Plane className="w-4 h-4 text-amber-400" />
              7 Nights / 8 Days
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
              London Tour Package 2026
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Join the ultimate delegation experience from 17th Sept. to 24th Sept. 2026.
            </p>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-8 flex items-center gap-2">
                <Map className="w-5 h-5 text-slate-400" /> Detailed Itinerary
              </h2>
              
              <div className="space-y-6">
                {itinerary.map((day, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 text-slate-900 flex items-center justify-center font-bold text-sm shrink-0">
                        {day.day}
                      </div>
                      {index !== itinerary.length - 1 && (
                        <div className="w-px h-full bg-slate-200 mt-2 mb-2"></div>
                      )}
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex-1 mb-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{day.date}</p>
                      <h3 className="font-semibold text-slate-900 text-base mb-4">{day.title}</h3>
                      <ul className="space-y-3">
                        {day.events.map((event, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                            <span>{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
            {/* Pricing block */}
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-xl">
              <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-400" /> Payment Schedule
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#333333]">
                  <span className="text-slate-400 text-sm">Tour Cost (Inc. GST/TCS)</span>
                  <span className="font-semibold text-white">₹ 2,86,400</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#333333]">
                  <span className="text-slate-400 text-sm">Event Registration</span>
                  <span className="font-semibold text-white">₹ 23,600</span>
                </div>
                <div className="flex justify-between items-center bg-[#222222] p-4 rounded-lg">
                  <span className="font-bold text-white text-sm uppercase tracking-wider">Total Package</span>
                  <span className="font-semibold text-white text-lg">₹ 3,10,000</span>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-sm text-slate-300 mb-8">
                <p className="font-semibold text-white mb-1">1st Installment: ₹ 1,50,000</p>
                <p className="text-xs text-slate-500">(₹ 25,000 booking amount is Non-Refundable)</p>
              </div>

              <h4 className="font-semibold text-white text-sm mb-4">Bank Details</h4>
              <div className="space-y-2 text-xs text-slate-400 bg-white/5 p-5 rounded-xl border border-white/10">
                <p><span className="font-medium text-white">A/c no:</span> 023811100002652</p>
                <p><span className="font-medium text-white">IFSC Code:</span> UBIN0802387</p>
                <p><span className="font-medium text-white">Bank:</span> Union Bank of India</p>
                <p><span className="font-medium text-white">Company:</span> M/s. <span translate="no" className="notranslate">VISHWA LEADER</span> TECHMEDIA PRIVATE LIMITED</p>
              </div>
            </div>

            {/* Inclusions */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <Check className="w-5 h-5 text-slate-900" /> Inclusions
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>Return Economy class Airfare (BOM-LHR-BOM)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>Hotel Atrium Accommodation (Twin Sharing)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>Continental Breakfast, Indian Lunch & Dinner</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>Entire road journey by 49 Seater Coach</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>VISA + Travel Insurance (Up to 59 years)</span>
                </li>
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <X className="w-5 h-5 text-slate-400" /> Exclusions
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                  <span>Cost of pre/post tour hotel accommodation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                  <span>To and fro Air fare to join/leave the group</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                  <span>Porterage, laundry, wines & alcoholic beverages</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
