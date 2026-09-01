"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, MapPin, BookOpen, Briefcase, Award, ArrowRight } from "lucide-react";

export interface ScheduleEvent {
  time: string;
  title: string;
  desc: string;
}

export interface DaySchedule {
  id: string;
  dayNum: string;
  date: string;
  title: string;
  venue: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  pageUrl: string;
  actionText: string;
  icon: React.ReactNode;
  schedule: ScheduleEvent[];
}

export const scheduleData: DaySchedule[] = [
  {
    id: "day1",
    dayNum: "DAY 1",
    date: "Friday, 18th Sept 2026",
    title: "International Academic Conference",
    venue: "SOAS University of London",
    badge: "Academic Conference",
    badgeBg: "bg-blue-50 border-blue-200 text-brandBlue",
    badgeText: "text-brandBlue",
    pageUrl: "/call-for-papers",
    actionText: "Conference Details & Call for Papers",
    icon: <BookOpen className="w-5 h-5 text-brandBlue" />,
    schedule: [
      { time: "08:30 AM – 09:30 AM", title: "Delegate Breakfast & Assembly", desc: "Continental Breakfast at Atrium Hotel Heathrow before morning departure." },
      { time: "09:30 AM – 10:00 AM", title: "Executive Transit to SOAS", desc: "Private coach transfer to Brunei Gallery, SOAS University of London." },
      { time: "10:00 AM – 10:30 AM", title: "Inaugural Ceremony & Keynote Address", desc: "Official opening, lighting of lamp, and welcome by SOAS conveners." },
      { time: "10:30 AM – 01:00 PM", title: "Academic Session 1: Research Presentations", desc: "Parallel paper presentations, panel discussions & academic exchanges." },
      { time: "01:00 PM – 02:00 PM", title: "Networking Lunch Break", desc: "Indian Buffet Lunch provided at the SOAS University Campus." },
      { time: "02:00 PM – 03:30 PM", title: "Academic Session 2 & Valedictory Session", desc: "Concluding presentations, chair feedback, and valedictory address." },
      { time: "03:30 PM – 06:00 PM", title: "Sightseeing Excursion", desc: "Guided visit to the iconic London Eye and River Thames Cruise." },
      { time: "06:30 PM – 08:30 PM", title: "Welcome Dinner & Evening Transfer", desc: "Indian dinner at central London restaurant followed by coach transfer back to hotel." },
    ]
  },
  {
    id: "day2",
    dayNum: "DAY 2",
    date: "Saturday, 19th Sept 2026",
    title: "International Business Summit",
    venue: "Hotel Atrium Heathrow, London, UK",
    badge: "Business Summit",
    badgeBg: "bg-amber-50 border-amber-200 text-amber-800",
    badgeText: "text-amber-800",
    pageUrl: "/business-summit",
    actionText: "Business Summit Details & B2B Forum",
    icon: <Briefcase className="w-5 h-5 text-amber-600" />,
    schedule: [
      { time: "08:30 AM – 09:30 AM", title: "Breakfast at Hotel", desc: "Continental Breakfast at Atrium Hotel Heathrow." },
      { time: "09:30 AM – 12:30 PM", title: "Windsor Castle Excursion", desc: "Guided sightseeing tour & entrance to historic Windsor Castle." },
      { time: "01:00 PM – 02:00 PM", title: "Indian Buffet Lunch", desc: "Indian lunch at restaurant." },
      { time: "02:30 PM – 04:30 PM", title: "Return & Prep Time", desc: "Return to hotel for summit preparation & executive networking." },
      { time: "05:00 PM – 05:30 PM", title: "Delegate Registration & Business Welcome", desc: "Arrival of delegates, corporate leaders, and VIP dignitaries at Atrium Suite." },
      { time: "05:30 PM – 07:30 PM", title: "Inaugural Keynote & B2B Presentations", desc: "Opening remarks by GBBC, DACC & WLCC conveners, investor presentations." },
      { time: "07:30 PM – 09:30 PM", title: "Panel Discussion & Global Network Forum", desc: "Cross-border trade forums, startup pitches & global Bahujan business initiatives." },
      { time: "09:30 PM Onwards", title: "Business Summit Gala Dinner", desc: "Networking banquet dinner post summit at Hotel Atrium." },
    ]
  },
  {
    id: "day3",
    dayNum: "DAY 3",
    date: "Sunday, 20th Sept 2026",
    title: "International Award & Cultural Ceremony",
    venue: "Greenwood Theatre, King's College London",
    badge: "Awards & Cultural",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-800",
    badgeText: "text-purple-800",
    pageUrl: "/awards",
    actionText: "Awards Ceremony & Nominations",
    icon: <Award className="w-5 h-5 text-purple-600" />,
    schedule: [
      { time: "08:30 AM – 10:00 AM", title: "Delegate Breakfast", desc: "Breakfast at Atrium Hotel Heathrow." },
      { time: "10:00 AM – 01:00 PM", title: "Morning Leisure & Global Delegate Networking", desc: "Free time for international delegate networking, press & media interactions." },
      { time: "01:00 PM – 02:00 PM", title: "Indian Buffet Lunch", desc: "Indian lunch served at hotel." },
      { time: "02:30 PM – 03:30 PM", title: "Coach Departure for Central London", desc: "Executive coach transfer to Greenwood Theatre, Guy's Campus, King's College London." },
      { time: "04:00 PM – 04:30 PM", title: "Red Carpet VIP Reception", desc: "Arrival of award recipients, VIP dignitaries, House of Lords patrons, and media." },
      { time: "04:30 PM – 06:00 PM", title: "Dr. Ambedkar International Awards Ceremony", desc: "Presentation of prestigious International Awards to honored global leaders." },
      { time: "06:00 PM – 07:00 PM", title: "Cultural Evening & Performing Arts Showcase", desc: "Live music, poetry, and socio-cultural performances celebrating Dr. Ambedkar's legacy." },
      { time: "07:30 PM – 09:30 PM", title: "Gala Awards Dinner & Return Transfer", desc: "Dinner at Indian restaurant in central London followed by return coach to hotel." },
    ]
  }
];

export default function UnifiedSchedule() {
  const [activeTab, setActiveTab] = useState<string>("day1");

  const activeDay = scheduleData.find((d) => d.id === activeTab) || scheduleData[0];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Schedule Component Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-brandBlue shrink-0" />
            Minute-to-Minute Program Schedule
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Complete minute-to-minute itinerary for all three days of the London Summit & Awards 2026.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
          {scheduleData.map((day) => {
            const isActive = activeTab === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActiveTab(day.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-brandBlue text-white shadow-md shadow-brandBlue/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {day.dayNum}
                </span>
                <span className="hidden sm:inline">{day.date.split(",")[0]}</span>
                <span className="sm:hidden">{day.date.split(" ")[1]} {day.date.split(" ")[2]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brandDark to-slate-900 text-white p-5 md:p-6 rounded-xl shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              {activeDay.dayNum}
            </span>
            <span className="text-slate-300 text-xs font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> {activeDay.date}
            </span>
          </div>
          <h4 className="text-lg md:text-xl font-bold font-display text-white">{activeDay.title}</h4>
          <p className="text-xs text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brandBlue shrink-0" />
            <span>{activeDay.venue}</span>
          </p>
        </div>

        <Link
          href={activeDay.pageUrl}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors shrink-0 shadow-sm"
        >
          <span>{activeDay.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 pt-2">
        {activeDay.schedule.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3.5 md:p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-brandBlue/30 hover:bg-slate-50/80 hover:shadow-sm transition-all"
          >
            <span className="shrink-0 px-3 py-1 bg-white border border-slate-200 text-brandBlue font-bold text-xs tracking-tight rounded-lg shadow-2xs self-start sm:self-auto">
              {item.time}
            </span>
            <div className="space-y-0.5 min-w-0">
              <h5 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="pt-2 text-center border-t border-slate-100">
        <p className="text-[11px] text-slate-400">
          * Schedule times are subject to local traffic and venue logistics. Delegations will be notified of any real-time updates via email.
        </p>
      </div>
    </div>
  );
}
