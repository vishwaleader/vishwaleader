"use client";

export default function Page() {
  return (
    <>
      

    
    
    {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}

    {/* Top Alert Banner (styled to fit the dark theme) */}
    <div className="bg-black/40 backdrop-blur text-slate-300 py-2.5 px-4 text-center border-b border-borderDark text-[11px] tracking-wider font-semibold relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a id="nav-abstract-strip" data-field="announcements.abstractLink" href="/#conference" className="hover:text-brandBlue transition-colors flex items-center gap-1.5"><i className="fa-solid fa-graduation-cap text-brandBlue"></i> Call for Abstracts</a>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a id="nav-award-strip" data-field="announcements.awardLink" href="/#contact" className="hover:text-brandBlue transition-colors flex items-center gap-1.5"><i className="fa-solid fa-trophy text-brandBlue"></i> Call for Award Nominations</a>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a id="nav-business-strip" data-field="announcements.businessLink" href="/#contact" className="hover:text-brandBlue transition-colors flex items-center gap-1.5"><i className="fa-solid fa-briefcase text-brandBlue"></i> Call for Business Participation</a>
        </div>
    </div>

    {/* Navigation Header (4kwallpaper style: logo left, categories middle, search right) */}
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-borderDark sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-3 md:gap-4">
            {/* Logo & Techmedia Badge */}
            <div className="flex items-center gap-3 shrink-0">
                <a href="/" className="group flex items-center gap-2 md:gap-3">
                    <img src="/assets/images/vishwaleader-logo-hd.png" 
                          alt="Vishwa Leader Logo" 
                          className="h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" 
                           />
                    <span className="hidden sm:inline-block text-[9px] font-black tracking-widest text-brandBlue uppercase border border-brandBlue/30 px-2 py-0.5 rounded bg-brandBlue/10">
                        Techmedia
                    </span>
                </a>
            </div>

            {/* Categories Dropdown Button (Middle) */}
            <div className="relative flex items-center gap-2">
                <button  id="categoriesBtn" className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-borderDark rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-all">
                    <span>Categories</span>
                    <i className="fa-solid fa-chevron-down text-[10px] transition-transform duration-200" id="categoriesChevron"></i>
                </button>
                
                {/* Categories Dropdown menu */}
                <div id="categoriesDropdown" className="absolute top-12 left-0 w-56 bg-slate-950 border border-borderDark rounded-2xl shadow-2xl p-2 hidden z-50">
                    <button  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-900 rounded-xl transition-colors">All Collections</button>
                    <button  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-900 rounded-xl transition-colors">London Summit</button>
                    <button  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-900 rounded-xl transition-colors">Dignitaries</button>
                    <button  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-900 rounded-xl transition-colors">Magazine Covers</button>
                    <button  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-900 rounded-xl transition-colors">Social Events</button>
                </div>
            </div>

            {/* Main Web Navigation Links (Hidden on Mobile) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                <a href="/#about" className="hover:text-white transition-colors">Corporate</a>
                <a href="/#conference" className="hover:text-white transition-colors">SOAS Conference</a>
                <a href="/#events" className="hover:text-white transition-colors">Events</a>
                <a href="archives" className="hover:text-white transition-colors">Archive</a>
                <div id="nav-login-links">
                    <a href="/auth/member" className="text-brandBlue hover:text-brandBlue/80 transition-colors font-bold text-sm flex items-center gap-1">
                        <i className="fa-solid fa-right-to-bracket text-xs"></i> Login/SignIn
                    </a>
                </div>
            </nav>

            {/* Search bar (Right, hidden on xs) */}
            <div className="relative hidden sm:block w-44 md:w-60 shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                    <i className="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input type="text" id="gallery-search"  placeholder="Search archives..." className="w-full bg-slate-900/60 border border-borderDark focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-xs rounded-full pl-9 pr-4 py-2 outline-none text-slate-200 transition-all placeholder:text-slate-500" />
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button id="menuBtn" className="lg:hidden relative w-10 h-10 text-slate-300 hover:text-white focus:outline-none flex items-center justify-center" aria-label="Toggle Menu">
                <div className="w-6 h-4 flex flex-col justify-between items-center relative">
                    <span className="w-full h-0.5 bg-slate-300 rounded transition-all duration-300 transform" id="bar1"></span>
                    <span className="w-full h-0.5 bg-slate-300 rounded transition-all duration-300 transform" id="bar2"></span>
                    <span className="w-full h-0.5 bg-slate-300 rounded transition-all duration-300 transform" id="bar3"></span>
                </div>
            </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div id="mobileMenu" className="lg:hidden max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out bg-slate-950 border-t border-borderDark px-4 space-y-1 shadow-inner">
            {/* Mobile search (visible on xs only) */}
            <div className="pt-4 pb-2 sm:hidden">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <i className="fa-solid fa-magnifying-glass text-xs"></i>
                    </span>
                    <input type="text"  id="gallery-search-mobile" placeholder="Search archives..." className="w-full bg-slate-900 border border-borderDark focus:border-brandBlue text-xs rounded-full pl-9 pr-4 py-2.5 outline-none text-slate-200 placeholder:text-slate-500" />
                </div>
            </div>
            <div className="py-3 space-y-1.5">
                <a href="/#about" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-300 hover:text-white active:bg-slate-900 rounded-xl transition-all border-b border-slate-900/50 last:border-0">
                    <i className="fa-solid fa-building text-slate-500 mr-3 w-5 text-center text-xs"></i>
                    <span>Corporate</span>
                    <i className="fa-solid fa-chevron-right text-slate-600 ml-auto text-[9px]"></i>
                </a>
                <a href="/#conference" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-300 hover:text-white active:bg-slate-900 rounded-xl transition-all border-b border-slate-900/50 last:border-0">
                    <i className="fa-solid fa-graduation-cap text-slate-500 mr-3 w-5 text-center text-xs"></i>
                    <span>SOAS Conference</span>
                    <i className="fa-solid fa-chevron-right text-slate-600 ml-auto text-[9px]"></i>
                </a>
                <a href="/#events" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-300 hover:text-white active:bg-slate-900 rounded-xl transition-all border-b border-slate-900/50 last:border-0">
                    <i className="fa-solid fa-calendar-days text-slate-500 mr-3 w-5 text-center text-xs"></i>
                    <span>Events</span>
                    <i className="fa-solid fa-chevron-right text-slate-600 ml-auto text-[9px]"></i>
                </a>
                <a href="archives" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-300 hover:text-white active:bg-slate-900 rounded-xl transition-all border-b border-slate-900/50 last:border-0">
                    <i className="fa-solid fa-box-archive text-slate-500 mr-3 w-5 text-center text-xs"></i>
                    <span>Archive</span>
                    <i className="fa-solid fa-chevron-right text-slate-600 ml-auto text-[9px]"></i>
                </a>

                <div className="pt-2 border-t border-slate-900 flex flex-col gap-1.5">
                    <a href="/auth/member" className="flex items-center py-2.5 px-3 text-sm font-semibold text-brandBlue hover:text-brandBlue/85 active:bg-slate-900 rounded-xl transition-all">
                        <i className="fa-solid fa-right-to-bracket text-brandBlue mr-3 w-5 text-center text-xs"></i>
                        <span>Login/SignIn</span>
                        <i className="fa-solid fa-chevron-right text-slate-600 ml-auto text-[9px]"></i>
                    </a>
                    <a href="/auth/admin" className="flex items-center py-2.5 px-3 text-sm font-semibold text-indigo-400 hover:text-indigo-300 active:bg-slate-900 rounded-xl transition-all border-b border-slate-800 last:border-0">
                        <i className="fa-solid fa-user-shield text-indigo-400 mr-3 w-5 text-center text-xs"></i>
                        <span>Login as Team</span>
                        <i className="fa-solid fa-chevron-right text-slate-600 ml-auto text-[9px]"></i>
                    </a>
                </div>
            </div>
        </div>
    </header>

    {/* Top Horizontal Subheader Tags Bar (4kwallpaper style) */}
    <div className="bg-slate-950/40 border-b border-borderDark py-3.5 overflow-x-auto select-none">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 md:justify-center text-[10px] md:text-xs font-semibold text-slate-450 whitespace-nowrap scrollbar-none">
            <span className="text-slate-600 uppercase tracking-widest text-[9px] mr-2">Quick Tags:</span>
            <button  className="px-3 py-1 bg-slate-900 border border-borderDark hover:border-slate-700 hover:text-white rounded-md transition-colors">#LondonSummit</button>
            <button  className="px-3 py-1 bg-slate-900 border border-borderDark hover:border-slate-700 hover:text-white rounded-md transition-colors">#DrAmbedkar</button>
            <button  className="px-3 py-1 bg-slate-900 border border-borderDark hover:border-slate-700 hover:text-white rounded-md transition-colors">#HouseOfLords</button>
            <button  className="px-3 py-1 bg-slate-900 border border-borderDark hover:border-slate-700 hover:text-white rounded-md transition-colors">#MagazineCovers</button>
            <button  className="px-3 py-1 bg-slate-900 border border-borderDark hover:border-slate-700 hover:text-white rounded-md transition-colors">#Dignitaries</button>
            <button  className="px-3 py-1 bg-slate-900 border border-borderDark hover:border-slate-700 hover:text-white rounded-md transition-colors">#SocialDrives</button>
            <button  className="px-3 py-1 bg-slate-900/60 border border-borderDark hover:text-white rounded-md transition-colors text-amber-500">Reset</button>
        </div>
    </div>

    {/* Main Workspace */}
    <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Glowing Navigation Tabs Section (4kwallpaper style tabs) */}
        <div className="flex justify-center">
            <div className="inline-flex p-1 bg-slate-950 border border-borderDark rounded-full shadow-2xl relative">
                <button  id="tab-recent" className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 relative z-10 text-white">
                    <i className="fa-solid fa-clock text-[10px]"></i>
                    Recent
                </button>
                <button  id="tab-popular" className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 relative z-10 text-slate-400 hover:text-white">
                    <i className="fa-solid fa-fire text-[10px]"></i>
                    Popular
                </button>
                <button  id="tab-featured" className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 relative z-10 text-slate-400 hover:text-white">
                    <i className="fa-solid fa-star text-[10px]"></i>
                    Featured
                </button>
                <button  id="tab-covers" className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 relative z-10 text-slate-400 hover:text-white">
                    <i className="fa-solid fa-book-open text-[10px]"></i>
                    Covers
                </button>
                <button  id="tab-all" className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 relative z-10 text-slate-400 hover:text-white">
                    <i className="fa-solid fa-circle-nodes text-[10px]"></i>
                    All Assets
                </button>

                {/* Glowing background pill (moves dynamically via Javascript) */}
                <div id="tab-glowing-pill" className="absolute top-1 bottom-1 left-1 bg-brandBlue shadow-[0_0_15px_rgba(0,86,202,0.6)] rounded-full transition-all duration-300 ease-out z-0"></div>
            </div>
        </div>

        {/* Section Title with left vertical accent bar (4kwallpaper style) */}
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <span className="w-[4px] h-[24px] bg-brandBlue rounded-full shadow-[0_0_8px_rgba(0,86,202,0.8)]"></span>
                <h2 id="section-title-header" className="font-display text-xl md:text-2xl font-black uppercase text-white tracking-tight">Recent Archives</h2>
            </div>
            <p id="section-title-desc" className="text-xs text-slate-500 font-medium pl-4">Exploring the most recently added historical media and event photologues.</p>
        </div>

        {/* Loader Spinner */}
        <div id="grid-loader" className="flex flex-col items-center justify-center py-24 space-y-4">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-brandBlue shadow-[0_0_15px_rgba(0,86,202,0.3)]"></i>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Compiling Repository Catalog...</p>
        </div>

        {/* Wallpaper Card Grid */}
        <div id="gallery-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 min-h-[400px]">
            {/* Generated dynamically via JS */}
        </div>

        {/* Empty State */}
        <div id="empty-state" className="hidden text-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-borderDark flex items-center justify-center text-slate-500 mx-auto text-xl">
                <i className="fa-solid fa-image-slash"></i>
            </div>
            <h3 className="font-display font-black text-slate-300 text-sm uppercase">No Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">Adjust your category selector or clear search terms to view other media segments.</p>
        </div>

    </main>

    {/* Footer */}
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-borderDark mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 text-xs">
            <div className="md:col-span-4 space-y-4">
                <span className="font-display text-sm font-black tracking-tight text-white uppercase">VISHWA LEADER</span>
                <p className="text-slate-500 leading-relaxed font-light">
                    Vishwa Leader Techmedia Private Limited is an incorporated corporate media platform driving transnational academic forums and universal empowerment programs.
                </p>
                <div className="flex gap-4 text-slate-600 pt-2">
                    <a href="https://prgi.gov.in" target="_blank" className="hover:text-white transition-colors" title="PRGI"><i className="fa-solid fa-earth-asia text-base"></i></a>
                    <a href="https://tibet.net/delegation-of-ambedkarites-meets-deputy-speaker-led-standing-committee-members/" target="_blank" className="hover:text-white transition-colors" title="Tibet Net"><i className="fa-solid fa-circle-info text-base"></i></a>
                </div>
            </div>

            <div className="md:col-span-4 space-y-3">
                <h4 className="font-display font-bold border-b border-slate-900 pb-2 text-[10px] text-slate-500 uppercase tracking-widest">
                    Verification Registers
                </h4>
                <ul className="space-y-2.5 font-light">
                    <li>
                        <a href="https://prgi.gov.in" target="_blank" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                            Press Registrar General of India Registry <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://tracxn.com/d/legal-entities/india/vishwa-leader-techmedia-private-limited/__jDthDz58Owry-yAaHPhKSuhVYScE1DyjR4IGLp2Bhz8" target="_blank" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                            Ministry of Corporate Affairs Profile <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
                <h4 className="font-display font-bold border-b border-slate-900 pb-2 text-[10px] text-slate-500 uppercase tracking-widest">
                    Registration Metadata
                </h4>
                <div className="bg-slate-900/40 border border-borderDark p-4 rounded-xl space-y-2 text-[10px] font-mono text-slate-500">
                    <p><span className="text-slate-700">CIN:</span> U74999MH2016PTC273606</p>
                    <p><span className="text-slate-700">REG DATE:</span> February 29, 2016</p>
                    <p><span className="text-slate-700">RNI REG:</span> MAHMAR/2009/34832</p>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-900 pt-8 text-center text-[10px] text-slate-650 font-normal">
            <p>© 2026 Vishwa Leader Techmedia Private Limited. All Rights Reserved. Compiled under RNI & MCA guidelines.</p>
        </div>
    </footer>

    {/* Interactive Lightbox Modal */}
    <div id="lightbox" className="fixed inset-0 z-50 bg-black/98 flex flex-col justify-center items-center opacity-0 pointer-events-none transition-all duration-300">
        <button  className="absolute top-6 right-6 text-slate-400 hover:text-white text-2xl focus:outline-none" aria-label="Close Lightbox">
            <i className="fa-solid fa-xmark"></i>
        </button>
        <button  className="absolute left-6 hidden md:block text-slate-400 hover:text-white text-4xl focus:outline-none" aria-label="Previous Image">
            <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button  className="absolute right-6 hidden md:block text-slate-400 hover:text-white text-4xl focus:outline-none" aria-label="Next Image">
            <i className="fa-solid fa-chevron-right"></i>
        </button>
        
        <div className="max-w-4xl max-h-[85vh] px-4 flex flex-col justify-center items-center">
            <img id="lightbox-img" src="" alt="Lightbox Image" className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10" />
            <h4 id="lightbox-caption" className="text-slate-300 text-xs font-medium text-center mt-6 tracking-wide max-w-2xl px-6 leading-relaxed"></h4>
        </div>

        {/* Controls overlay bottom */}
        <div className="absolute bottom-6 flex items-center gap-6 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-borderDark text-slate-300 select-none">
            <button  className="hover:text-amber-400 transition-colors focus:outline-none text-xs" title="Previous"><i className="fa-solid fa-backward-step"></i></button>
            <button  id="slideshow-btn" className="hover:text-amber-400 transition-colors focus:outline-none text-xs" title="Play Slideshow"><i className="fa-solid fa-play"></i></button>
            <button  className="hover:text-amber-400 transition-colors focus:outline-none text-xs" title="Next"><i className="fa-solid fa-forward-step"></i></button>
            <span className="w-[1px] h-4 bg-slate-800"></span>
            <button  id="fullscreen-btn" className="hover:text-amber-400 transition-colors focus:outline-none text-xs" title="Fullscreen"><i className="fa-solid fa-expand"></i></button>
            <span className="w-[1px] h-4 bg-slate-800"></span>
            <span id="lightbox-counter" className="text-[9px] font-mono text-slate-500">0 / 0</span>
        </div>
    </div>

    {/* JS Functionality */}
    

    </>
  )
}
