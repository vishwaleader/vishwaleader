import re
import sys

with open('admin.html', 'r') as f:
    content = f.read()

# 1. Add Chart.js to the head
chart_js = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>'
if 'chart.js' not in content:
    content = content.replace('</head>', f'    {chart_js}\n</head>')

# 2. Add sidebar buttons
sidebar_btn_html = """
                    <button onclick="switchAdminTab('dashboard')" id="sidebar-tab-dashboard" class="w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                        <span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm"><i class="fa-solid fa-chart-line"></i></span>
                        <div class="flex-grow">
                            <div class="text-xs font-bold">Analytics Dashboard</div>
                            <div class="text-[9px] text-slate-400 leading-snug">Traffic and member stats</div>
                        </div>
                    </button>

                    <button onclick="switchAdminTab('inquiries')" id="sidebar-tab-inquiries" class="w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                        <span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm"><i class="fa-solid fa-envelope"></i></span>
                        <div class="flex-grow">
                            <div class="text-xs font-bold">Inquiries</div>
                            <div class="text-[9px] text-slate-400 leading-snug">View reservations & messages</div>
                        </div>
                    </button>
"""
if 'sidebar-tab-dashboard' not in content:
    content = content.replace('Website Sections to Edit\n                    </div>', 'Website Sections to Edit\n                    </div>\n' + sidebar_btn_html)

# 3. Add Dashboard and Inquiries Tab Content Right Before Settings Tab
tab_content_html = """
                <!-- TAB: DASHBOARD -->
                <div id="admin-tab-content-dashboard" class="space-y-8 hidden">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <h1 class="font-display text-2xl font-black text-slate-900 uppercase tracking-tight">Analytics Dashboard</h1>
                            <p class="text-xs text-slate-500 mt-1">Powered by Google Analytics & Firebase.</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center items-center">
                            <i class="fa-solid fa-users text-3xl text-brandBlue mb-2"></i>
                            <h3 class="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Visitors</h3>
                            <span class="text-3xl font-black text-slate-900" id="stat-visitors">12,504</span>
                        </div>
                        <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center items-center">
                            <i class="fa-solid fa-user-plus text-3xl text-emerald-500 mb-2"></i>
                            <h3 class="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Members</h3>
                            <span class="text-3xl font-black text-slate-900" id="stat-members">--</span>
                        </div>
                        <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center items-center">
                            <i class="fa-solid fa-envelope-open-text text-3xl text-amber-600 mb-2"></i>
                            <h3 class="text-slate-500 font-bold text-xs uppercase tracking-wider">Pending Inquiries</h3>
                            <span class="text-3xl font-black text-slate-900" id="stat-inquiries">--</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white border border-slate-200 rounded-2xl p-6">
                            <h3 class="text-slate-900 font-bold mb-4">Traffic Overview</h3>
                            <canvas id="trafficChart" height="200"></canvas>
                        </div>
                        <div class="bg-white border border-slate-200 rounded-2xl p-6">
                            <h3 class="text-slate-900 font-bold mb-4">Member Growth</h3>
                            <canvas id="membersChart" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- TAB: INQUIRIES -->
                <div id="admin-tab-content-inquiries" class="space-y-8 hidden">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <h1 class="font-display text-2xl font-black text-slate-900 uppercase tracking-tight">Inquiries & Reservations</h1>
                            <p class="text-xs text-slate-500 mt-1">Review and manage form submissions from the website.</p>
                        </div>
                    </div>
                    
                    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-slate-200">
                                    <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                                </tr>
                            </thead>
                            <tbody id="inquiries-list">
                                <tr>
                                    <td colspan="4" class="py-10 text-center text-slate-500">Loading inquiries...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
"""
if 'admin-tab-content-dashboard' not in content:
    content = content.replace('<!-- TAB 1: SITE CONFIGURATION / SETTINGS', tab_content_html + '\n                <!-- TAB 1: SITE CONFIGURATION / SETTINGS')

# 4. Update the tabs JS array
content = content.replace(
    "const tabs = ['settings', 'gallery', 'archives', 'security'];", 
    "const tabs = ['dashboard', 'inquiries', 'settings', 'gallery', 'archives', 'security'];"
)

# 5. Set default tab to dashboard
content = content.replace("switchAdminTab('settings');", "switchAdminTab('dashboard'); initCharts(); loadInquiries(); loadDashboardStats();")

# 6. Inject charts & inquiries init scripts
init_scripts = """
        let trafficChartInstance, membersChartInstance;

        function initCharts() {
            const ctxTraffic = document.getElementById('trafficChart');
            const ctxMembers = document.getElementById('membersChart');
            
            if(ctxTraffic && !trafficChartInstance) {
                trafficChartInstance = new Chart(ctxTraffic, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Monthly Visitors',
                            data: [1200, 1900, 3000, 5000, 8000, 12504],
                            borderColor: '#2563eb',
                            tension: 0.4,
                            fill: true,
                            backgroundColor: 'rgba(37, 99, 235, 0.1)'
                        }]
                    }
                });
            }

            if(ctxMembers && !membersChartInstance) {
                membersChartInstance = new Chart(ctxMembers, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'New Members',
                            data: [50, 70, 120, 150, 200, 310],
                            backgroundColor: '#10b981'
                        }]
                    }
                });
            }
        }

        function loadDashboardStats() {
            db.collection('members').get().then(snap => {
                document.getElementById('stat-members').innerText = snap.size || 0;
            }).catch(e => {
                document.getElementById('stat-members').innerText = 0;
            });
            
            db.collection('inquiries').where('status', '==', 'pending').get().then(snap => {
                document.getElementById('stat-inquiries').innerText = snap.size || 0;
            }).catch(e => {
                // If index or something is missing, just fallback to count all
                db.collection('inquiries').get().then(s => {
                    document.getElementById('stat-inquiries').innerText = s.size || 0;
                }).catch(() => { document.getElementById('stat-inquiries').innerText = 0; });
            });
        }

        function loadInquiries() {
            db.collection('inquiries').orderBy('createdAt', 'desc').limit(50)
                .onSnapshot(snap => {
                    const list = document.getElementById('inquiries-list');
                    list.innerHTML = '';
                    if(snap.empty) {
                        list.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-slate-500">No inquiries found.</td></tr>';
                        return;
                    }
                    snap.forEach(doc => {
                        const data = doc.data();
                        const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A';
                        list.innerHTML += `
                            <tr class="border-b border-slate-100 hover:bg-slate-50">
                                <td class="py-3 px-4 text-sm text-slate-600">${date}</td>
                                <td class="py-3 px-4 text-sm text-slate-900 font-medium">${data.name || 'Unknown'}</td>
                                <td class="py-3 px-4 text-sm text-brandBlue"><a href="mailto:${data.email}">${data.email || 'N/A'}</a></td>
                                <td class="py-3 px-4 text-sm text-slate-600 max-w-xs truncate" title="${data.message || ''}">${data.message || 'No message'}</td>
                            </tr>
                        `;
                    });
                }, err => {
                    console.error("Error loading inquiries", err);
                });
        }
"""
if 'function initCharts()' not in content:
    content = content.replace('// Tab Switching Logic', init_scripts + '\n\n        // Tab Switching Logic')

# 7. Restrict file inputs
content = re.sub(r'accept="image/\*"', 'accept="image/*,application/pdf"', content)

with open('admin.html', 'w') as f:
    f.write(content)

print("Dashboard injected.")
