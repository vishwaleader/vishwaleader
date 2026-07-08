"use client";

import React from "react";
import Image from "next/image";
import GlobalPreloader from "@/components/GlobalPreloader";

export default function MissionPage() {
  return (
    <>
      <GlobalPreloader />
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col selection:bg-brandBlue selection:text-white pb-20">
        
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1960px] mx-auto px-6 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-10 w-auto object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-brandBlue font-black tracking-tight text-lg uppercase font-display">VISHWA LEADER</span>
                <span className="text-[10px] font-black tracking-widest text-brandBlue uppercase border border-brandBlue/30 px-2 py-0.5 rounded bg-brandBlue/10 self-start mt-0.5">
                  Our Mission
                </span>
              </div>
            </a>
            <a href="/" className="text-xs font-bold text-slate-500 hover:text-brandBlue uppercase tracking-wider transition-colors flex items-center gap-2">
              &larr; Back to Home
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-white py-24 md:py-32 border-b border-slate-900 relative overflow-hidden flex items-center justify-center">
          {/* Background Image using Next.js Image for reliable rendering */}
          <Image 
            src="/assets/images/Ambedkar_at_the_Round_Table_Conference.jpg"
            alt="Ambedkar at the Round Table Conference"
            fill
            quality={100}
            priority
            className="object-cover object-center z-0"
          />
          {/* Neutral Overlay to ensure text readability without altering image color */}
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4 block drop-shadow-md">The Larger Vision</span>
            <h1 className="font-display text-[38px] md:text-[50px] lg:text-[63px] font-black leading-tight tracking-tight mb-6 drop-shadow-lg">
              Our Global Mission
            </h1>
            <p className="text-slate-200 text-base md:text-xl leading-relaxed font-light drop-shadow-md">
              Taking Babasaheb’s message to the world stage.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate prose-lg max-w-none">
            <p className="lead text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-8">
              Many people have asked us an important question: <strong className="text-brandBlue italic">“Why are we organizing the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards in London and not in India?”</strong>
            </p>
            
            <p>
              This is a valid question, and we would like to explain the larger vision behind this mission.
            </p>
            
            <p>
              First, let us be very clear: <strong className="text-slate-900">India is the birthplace of Babasaheb Dr. B. R. Ambedkar, and no country can ever replace India’s importance in his legacy.</strong> Babasaheb belongs to India, and his contribution to our nation is eternal.
            </p>
            
            <p>
              However, <strong className="text-slate-900">Babasaheb’s vision was never meant to remain limited to India alone.</strong> His ideals of <strong className="text-slate-900">equality, liberty, fraternity, social justice, human dignity, and constitutional values</strong> are universal values meant for the entire world.
            </p>
            
            <p className="text-lg font-semibold text-brandBlue border-l-4 border-brandBlue pl-4 py-1 my-8 bg-brandBlue/5">
              That is precisely why we chose London as the launchpad of this historic global mission.
            </p>

            <p>
              London is one of the world’s most influential global centres — a city where international leaders, policymakers, academicians, entrepreneurs, media houses, and global communities converge. A message launched from London gains worldwide visibility and can reach every continent much faster.
            </p>

            <p>
              London also carries deep emotional and historical significance in Babasaheb’s life. It was here that Babasaheb pursued higher education at London School of Economics and Gray's Inn, shaping the intellectual, legal, and economic foundation that later transformed India.
            </p>

            <p>
              We must remember one important fact: <strong className="text-slate-900">Babasaheb himself traveled from India to the world to gain knowledge.</strong> He went to London, the USA, and other countries not for personal luxury, but to acquire world-class education, ideas, legal understanding, economic knowledge, and global exposure. He studied at Columbia University, the London School of Economics, and Gray's Inn. He learned from the best institutions in the world, understood global systems, and then returned to India to uplift millions.
            </p>

            <p>
              Babasaheb conquered the world not through power or wealth, but through <strong className="text-slate-900">knowledge, intellect, struggle, vision, and extraordinary hard work</strong>. The knowledge he gained abroad became a blessing for India.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 font-display uppercase tracking-tight">Because of his immense work, India received:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-8 marker:text-brandBlue text-slate-700">
              <li>The Constitution of India</li>
              <li>Protection of fundamental rights</li>
              <li>Equal voting rights</li>
              <li>Labour reforms</li>
              <li>Economic and financial policy vision</li>
              <li>Social justice movements</li>
              <li>Hope and dignity for millions of oppressed and poor people</li>
            </ul>

            <p>
              He dedicated his entire life to ensuring that the poorest, weakest, and most marginalized people could live with dignity and self-respect.
            </p>

            <p>
              That is why today, <strong className="text-slate-900">it is our moral duty to carry forward Babasaheb’s unfinished global mission</strong>. If Babasaheb could cross oceans to bring knowledge and justice back to India, then we too must cross borders to spread his message to the world.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 my-10 text-center">
              <p className="text-lg text-slate-700 mb-2">Our mission is much bigger than conducting just one event.</p>
              <p className="text-2xl font-black text-brandBlue uppercase tracking-tight font-display">We are building a global movement.</p>
            </div>

            <p>
              Beginning in <strong>2026, the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards</strong> will be organized <strong>once every two years in different countries</strong>. By taking this platform across nations, we will connect the global Ambedkarite diaspora and diverse communities under one shared vision of justice and human dignity.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 font-display uppercase tracking-tight">This is not only about awards. This is about:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-8 marker:text-amber-500 text-slate-700">
              <li>Building global unity</li>
              <li>Creating international networks</li>
              <li>Encouraging business, academic, and cultural collaboration</li>
              <li>Strengthening brotherhood among communities worldwide</li>
              <li>Taking Babasaheb’s message to future generations globally</li>
            </ul>

            <p>
              This mission will also create real benefits for our poor people in India and disadvantaged communities across the world.
            </p>
            <p className="font-bold text-lg text-slate-900">How?</p>

            <p>
              When global communities connect, opportunities increase:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 marker:text-brandBlue text-slate-700">
              <li>International scholarships for students</li>
              <li>Business collaborations and investments</li>
              <li>Employment opportunities</li>
              <li>Skill development and mentorship</li>
              <li>Global support systems for marginalized communities</li>
              <li>Access to knowledge, technology, and progressive ideas</li>
            </ul>

            <p>
              When strong international networks are built, the benefits do not remain only in London or abroad — they eventually flow back to villages, towns, and cities in India where our people need support the most.
            </p>

            <p>
              The poor in India do not need only sympathy; they need <strong className="text-slate-900">opportunities, access, education, global exposure, economic empowerment, and strong networks</strong>. This global mission aims to help create exactly that.
            </p>

            <p>
              This is equally beneficial for people worldwide. Babasaheb’s teachings are not only for India. Even today, many societies across the world struggle with discrimination, inequality, exclusion, and injustice. Babasaheb’s philosophy provides powerful solutions for humanity as a whole.
            </p>

            <h3 className="text-2xl font-black text-slate-900 mt-12 mb-6 font-display tracking-tight text-center">Our long-term vision is bold but clear.</h3>

            <p className="text-center text-lg leading-relaxed mb-8">
              In the next <strong>10–15 years</strong>, we want this award to gain such international credibility and prestige that people across the world aspire to receive it — <strong className="text-brandBlue">just as people aspire to receive the Nobel Peace Prize</strong>.
            </p>

            <p className="text-center italic text-slate-600 mb-8">
              Yes, this is an ambitious dream.<br/>
              But every globally respected institution begins with one courageous first step.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 my-10 text-center">
              <p className="text-3xl font-black text-amber-600 uppercase tracking-tight font-display mb-2">London 2026 is that first step.</p>
            </div>

            <p>
              Beginning 2026, this will become a <strong className="text-slate-900">bi-yearly global event</strong>, hosted once every two years in different countries so Babasaheb’s teachings can reach new regions, cultures, and communities.
            </p>

            <p>
              The next event is expected to be hosted in <strong className="text-slate-900">California in 2028</strong>, further expanding the mission across continents.
            </p>

            <p>
              Once the award earns global stature, future editions can be hosted across major international centres such as <strong className="text-slate-900">California, New York, Tokyo, Paris, Johannesburg, Sydney, and also India</strong>, thereby expanding Babasaheb’s influence across continents.
            </p>

            <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 my-12 text-center shadow-xl">
              <p className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-4">So the question is not "Why London instead of India?"</p>
              <h3 className="text-2xl md:text-3xl font-black text-amber-400 font-display mb-6">The real question is:</h3>
              <p className="text-xl md:text-2xl italic font-serif mb-8 text-white/90">
                “How do we make Babasaheb’s message reach the entire world?”
              </p>
              
              <div className="text-lg text-slate-300 space-y-2 mb-8 font-medium">
                <p>Our answer is simple:</p>
                <p className="text-white">By going global.</p>
                <p className="text-white">By thinking long-term.</p>
                <p className="text-white">By building something historic.</p>
              </div>

              <p className="text-lg md:text-xl font-bold text-amber-400">
                This mission is not against India — it is for taking India’s greatest social reformer to the world stage.
              </p>
            </div>

            <p className="text-center text-lg text-slate-700">
              Let us think beyond borders and work together to build a legacy worthy of Babasaheb’s vision.
            </p>
            <p className="text-center text-lg text-slate-700 mb-8">
              It is now the responsibility of every Ambedkarite and every person who believes in equality and justice to contribute in whatever way possible and move this mission forward.
            </p>

            <p className="text-center text-xl font-semibold text-slate-900 mb-12">
              Babasaheb showed us the path.<br/>
              Now it is our duty to walk on it and take it to the world.
            </p>

            <div className="text-center pt-8 border-t border-slate-200">
              <p className="text-2xl font-black text-brandBlue uppercase tracking-widest font-display">
                Jai Bhim. Jai Hind.
              </p>
              <p className="mt-4 text-xl font-bold text-slate-800">
                - Shirish B. Ramteke
              </p>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
