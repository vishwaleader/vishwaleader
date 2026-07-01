import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Plane, CheckCircle2, XCircle, CreditCard, Building2, CalendarDays } from 'lucide-react';

const itinerary = [
  {
    day: "01",
    date: "Thursday, 17 Sept. 2026",
    title: "Arrival & Inaugural Function",
    events: [
      "Arrive London LHR Airport & freshen up",
      "Transfer to restaurant for Indian lunch",
      "Drive to Atrium Hotel LHR (4 Star) & Check-in (Post 15:00 hrs)",
      "Banquet Hall reserved at Hotel (17:00 - 20:00 hrs) for Inaugural Function & Indian dinner"
    ]
  },
  {
    day: "02",
    date: "Friday, 18 Sept. 2026",
    title: "SOAS Conference & London Eye",
    events: [
      "Breakfast at the hotel",
      "Transfer to CENTRAL LONDON for Event @ Brunei Gallery Lecture Theatre, SOAS University of London (International Conference: 10:00 - 15:30 hrs)",
      "Lunch at University",
      "Transfer to London Eye, Ride on the London Eye & Cruise on River Thames",
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
      "International Business Summit @ Atrium Suite (17:00 - 22:00 hrs)",
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
      "Depart for CENTRAL LONDON - Arrive at Greenwood Theatre, Guys Campus, King's College",
      "International Awards and Cultural Ceremony (16:00 - 19:00 hrs)",
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
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brandBlue flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <img src="/assets/images/vishwaleader-logo-hd.png" alt="VishwaLeader" className="h-8 object-contain" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-slate-900 relative overflow-hidden h-[50vh] min-h-[400px] flex items-center justify-center">
        {/* Placeholder for London background image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-md">
            <Plane className="w-4 h-4 text-blue-400" />
            7 Nights / 8 Days
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            London Tour 2026
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium drop-shadow-md">
            17th Sept. to 24th Sept. 2026
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content - Itinerary */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Map className="text-brandBlue w-6 h-6" /> Detailed Itinerary
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {itinerary.map((day, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brandBlue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-sm">
                      {day.day}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-brandBlue uppercase tracking-wider mb-1">{day.date}</p>
                      <h3 className="font-bold text-slate-800 text-lg mb-3">{day.title}</h3>
                      <ul className="space-y-2">
                        {day.events.map((event, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing & Details */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brandBlue" /> Payment Schedule
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Tour Cost (Inc. GST/TCS)</span>
                  <span className="font-bold text-slate-800">₹ 2,86,400</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Registration</span>
                  <span className="font-bold text-slate-800">₹ 23,600</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="font-bold text-slate-800 text-sm uppercase">Total Final Cost</span>
                  <span className="font-black text-brandBlue text-lg">₹ 3,10,000</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900 mb-6">
                <p className="font-bold mb-1">1st Installment: ₹ 1,50,000</p>
                <p className="text-blue-700/80 text-xs">(₹ 25,000 booking amount is Non-Refundable once confirmed)</p>
              </div>

              <h4 className="font-bold text-slate-800 text-sm mb-3">Bank Details (Union Bank of India)</h4>
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><span className="font-semibold text-slate-800">A/c no:</span> 023811100002652</p>
                <p><span className="font-semibold text-slate-800">IFSC Code:</span> UBIN0802387</p>
                <p><span className="font-semibold text-slate-800">Branch:</span> Damodar Park, Ghatkopar West</p>
                <p><span className="font-semibold text-slate-800">Company:</span> M/s. VISHWA LEADER TECHMEDIA PRIVATE LIMITED</p>
              </div>
            </div>

            {/* Inclusions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Inclusions
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Return Economy class Airfare (BOM-LHR-BOM)</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Hotel Atrium (or similar) Accommodation on Twin Sharing</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Continental Breakfast, Indian Lunch & Dinner</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Entire road journey & sightseeing by 49 Seater Coach</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>VISA + Travel Insurance Up to 59 years</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Entry Tickets & Tour Manager Service</li>
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" /> Exclusions
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400"></div>Cost of pre/post tour hotel accommodation</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400"></div>To and fro Air fare to join/leave the group</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400"></div>Porterage, laundry, wines & alcoholic beverages</li>
                <li className="flex items-start gap-2"><div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400"></div>Any increase in Fuel Surcharges / Government taxes</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
