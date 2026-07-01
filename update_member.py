import os
import re

filepath = "src/app/member/page.tsx"

with open(filepath, "r") as f:
    content = f.read()

# 1. Add Imports
imports = """import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
"""

content = content.replace('"use client";', '"use client";\n\n' + imports)

# 2. Add State and Logic inside the Page component
logic = """
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setMemberData(docSnap.data());
        } else {
          const newMember = {
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: 'member',
            joinedAt: new Date().toISOString()
          };
          await setDoc(userRef, newMember);
          setMemberData(newMember);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
"""

content = content.replace("export default function Page() {", "export default function Page() {\n" + logic)

# 3. Hook up the Login button
# Look for <button id="googleSignInBtn"
content = re.sub(
    r'<button id="googleSignInBtn"[^>]*>',
    r'<button id="googleSignInBtn" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98]">',
    content
)

# 4. Hook up the Logout buttons
content = re.sub(
    r'<button([^>]+)id="signOutBtn"[^>]*>',
    r'<button\1id="signOutBtn" onClick={handleLogout}>',
    content
)
content = re.sub(
    r'<button([^>]+)class="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-rose-500 font-bold transition-all uppercase tracking-wider flex items-center gap-1.5"[^>]*>',
    r'<button onClick={handleLogout} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-rose-500 font-bold transition-all uppercase tracking-wider flex items-center gap-1.5">',
    content
)
content = re.sub(
    r'<button([^>]+)class="flex items-center py-2.5 px-3 text-sm font-semibold text-rose-600 hover:text-rose-750 active:bg-rose-50 rounded-xl transition-all w-full text-left"[^>]*>',
    r'<button onClick={handleLogout} className="flex items-center py-2.5 px-3 text-sm font-semibold text-rose-600 hover:text-rose-750 active:bg-rose-50 rounded-xl transition-all w-full text-left">',
    content
)


# 5. Conditionally Render the Views
# We need to wrap auth-spinner, unauth-view, and auth-view
# We can just inject {loading ? (<spinner>) : user ? (<auth-view>) : (<unauth-view>)}

# Replace the start of auth-spinner
content = content.replace(
    '<div id="auth-spinner" className="flex flex-col items-center gap-4 py-20">',
    '{loading ? (\n<div id="auth-spinner" className="flex flex-col items-center gap-4 py-20">'
)
# End of auth spinner is </p>\n        </div>
content = content.replace(
    '</p>\n        </div>\n\n        {/* Unauthenticated View: Sign In */}',
    '</p>\n        </div>\n) : user ? ('
)

# Move unauth-view to be after auth-view since user? is true first.
# Wait, it's easier to do: {loading ? (...) : !user ? (unauth) : (auth)}
content = content.replace(
    '</p>\n        </div>\n) : user ? (',
    '</p>\n        </div>\n) : !user ? (\n        {/* Unauthenticated View: Sign In */}'
)

# Now find where unauth ends and auth begins
content = content.replace(
    '        </div>\n\n        {/* Authenticated View: Member Dashboard */}',
    '        </div>\n) : (\n        {/* Authenticated View: Member Dashboard */}'
)

# And find where auth ends to close the ternary
content = content.replace(
    '            </div>\n        </div>\n    </main>',
    '            </div>\n        </div>\n)}\n    </main>'
)

# Make the Member Dashboard dynamic
content = content.replace(
    '<p id="member-name" className="text-xl md:text-2xl font-black font-display text-slate-800">Welcome, <span className="text-brandBlue">Member</span></p>',
    '<p id="member-name" className="text-xl md:text-2xl font-black font-display text-slate-800">Welcome, <span className="text-brandBlue">{user?.displayName || "Member"}</span></p>'
)
content = content.replace(
    '<img id="member-avatar" src="assets/images/vishwaleader-logo-globe.png" alt="Profile" className="w-full h-full object-cover" />',
    '<img id="member-avatar" src={user?.photoURL || "assets/images/vishwaleader-logo-globe.png"} alt="Profile" className="w-full h-full object-cover" />'
)
content = content.replace(
    '<p id="member-email" className="text-xs md:text-sm font-semibold text-slate-500">member@example.com</p>',
    '<p id="member-email" className="text-xs md:text-sm font-semibold text-slate-500">{user?.email}</p>'
)

# Make headers dynamic
content = content.replace(
    '<div id="header-user-badge" className="hidden flex items-center gap-3 border-l border-slate-200 pl-6">',
    '{user && (\n<div id="header-user-badge" className="flex items-center gap-3 border-l border-slate-200 pl-6">'
)
content = content.replace(
    '            </nav>',
    '            </div>\n)}\n            </nav>'
)
content = content.replace(
    '<span id="header-username" className="text-xs font-bold text-slate-700">Member</span>',
    '<span id="header-username" className="text-xs font-bold text-slate-700">{user?.displayName}</span>'
)

# Fix Mobile header dynamic
content = content.replace(
    '<div id="mobile-user-badge" className="hidden pt-3 border-t border-slate-100 space-y-2">',
    '{user && (\n<div id="mobile-user-badge" className="pt-3 border-t border-slate-100 space-y-2">'
)
content = content.replace(
    '                </div>\n            </div>\n        </div>',
    '                </div>\n)}\n            </div>\n        </div>'
)
content = content.replace(
    '<p id="mobile-username" className="text-xs font-bold text-slate-900 truncate">Member</p>',
    '<p id="mobile-username" className="text-xs font-bold text-slate-900 truncate">{user?.displayName}</p>'
)

# Remove 'hidden' from auth/unauth blocks because we rely on React rendering
content = content.replace('id="unauth-view" className="w-full max-w-md"', 'id="unauth-view" className="w-full max-w-md"')
content = content.replace('id="auth-view" className="hidden w-full space-y-6 md:space-y-8"', 'id="auth-view" className="w-full space-y-6 md:space-y-8"')


with open(filepath, "w") as f:
    f.write(content)

print("Updated src/app/member/page.tsx with Auth state.")
