import re

with open('src/app/auth/member/member-client.tsx', 'r') as f:
    content = f.read()

# 1. Update MemberData interface
content = re.sub(
    r'passportScanUrl: string;',
    r'passportFrontUrl: string;\n    passportBackUrl: string;\n    visaFrontUrl: string;\n    visaBackUrl: string;',
    content
)

# 2. Add states for uploads
content = re.sub(
    r'const \[passportUploading, setPassportUploading\] = useState\(false\);\n  const \[passportProgress, setPassportProgress\] = useState\(0\);',
    r'''const [passportFrontUploading, setPassportFrontUploading] = useState(false);
  const [passportFrontProgress, setPassportFrontProgress] = useState(0);
  const [passportBackUploading, setPassportBackUploading] = useState(false);
  const [passportBackProgress, setPassportBackProgress] = useState(0);
  const [visaFrontUploading, setVisaFrontUploading] = useState(false);
  const [visaFrontProgress, setVisaFrontProgress] = useState(0);
  const [visaBackUploading, setVisaBackUploading] = useState(false);
  const [visaBackProgress, setVisaBackProgress] = useState(0);''',
    content
)

# 3. Update initialize defaults
content = re.sub(
    r'passportScanUrl: "",',
    r'passportFrontUrl: "", passportBackUrl: "", visaFrontUrl: "", visaBackUrl: "",',
    content
)
content = re.sub(
    r'passportScanUrl: currentUser.passportScanUrl \|\| "",',
    r'passportFrontUrl: currentUser.passportFrontUrl || "", passportBackUrl: currentUser.passportBackUrl || "", visaFrontUrl: currentUser.visaFrontUrl || "", visaBackUrl: currentUser.visaBackUrl || "",',
    content
)

# 4. Update uploadFileToStorage signature and body
content = re.sub(
    r"type: 'headshot' \| 'passportScan' \| 'evidence'",
    r"type: 'headshot' | 'passportFront' | 'passportBack' | 'visaFront' | 'visaBack' | 'evidence'",
    content
)
content = re.sub(
    r"if \(type === 'passportScan'\) \{ setPassportUploading\(true\); setPassportProgress\(0\); \}",
    r'''if (type === 'passportFront') { setPassportFrontUploading(true); setPassportFrontProgress(0); }
    if (type === 'passportBack') { setPassportBackUploading(true); setPassportBackProgress(0); }
    if (type === 'visaFront') { setVisaFrontUploading(true); setVisaFrontProgress(0); }
    if (type === 'visaBack') { setVisaBackUploading(true); setVisaBackProgress(0); }''',
    content
)
content = re.sub(
    r"if \(type === 'passportScan'\) setPassportProgress\(progress\);",
    r'''if (type === 'passportFront') setPassportFrontProgress(progress);
        if (type === 'passportBack') setPassportBackProgress(progress);
        if (type === 'visaFront') setVisaFrontProgress(progress);
        if (type === 'visaBack') setVisaBackProgress(progress);''',
    content
)
content = re.sub(
    r"if \(type === 'passportScan'\) setPassportUploading\(false\);",
    r'''if (type === 'passportFront') setPassportFrontUploading(false);
        if (type === 'passportBack') setPassportBackUploading(false);
        if (type === 'visaFront') setVisaFrontUploading(false);
        if (type === 'visaBack') setVisaBackUploading(false);''',
    content
)
content = re.sub(
    r"const updateField = type === 'headshot' \? 'headshotUrl' : type === 'passportScan' \? 'passportScanUrl' : 'evidenceUrl';",
    r'''const updateField = type === 'headshot' ? 'headshotUrl' : 
                          type === 'passportFront' ? 'passportFrontUrl' : 
                          type === 'passportBack' ? 'passportBackUrl' : 
                          type === 'visaFront' ? 'visaFrontUrl' : 
                          type === 'visaBack' ? 'visaBackUrl' : 
                          'evidenceUrl';''',
    content
)

# 5. Fix img tag with referrerPolicy (also handling headshot)
content = re.sub(
    r'<img src={memberData\?\.headshotUrl \|\| user\.photoURL \|\| "https://placehold\.co/100x100"} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />',
    r'<img src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/100x100"} referrerPolicy="no-referrer" alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />',
    content
)
content = re.sub(
    r'src={memberData\?\.headshotUrl \|\| user\.photoURL \|\| "https://placehold\.co/150x150/0a1e4b/ffffff\?text=User"}',
    r'src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/150x150/0a1e4b/ffffff?text=User"} referrerPolicy="no-referrer"',
    content
)

# 6. Rewrite the JSX for passport/visa cards
jsx_old = r'''                      {\/\* Card 2: Passport Scan Copy \*\/}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-\[10px\] font-bold uppercase tracking-wider text-slate-500">2. Passport Scan Copy<\/span>
                            <FileText className="size-4 text-brandBlue" \/>
                          <\/div>

                          {memberData\?\.passportScanUrl \? \(
                            <div className="h-24 w-full bg-emerald-50\/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" \/>
                              <span className="text-\[9px\] font-bold text-emerald-700 uppercase">Passport Copy Uploaded<\/span>
                              <a href={memberData\.passportScanUrl} target="_blank" className="text-\[9px\] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">
                                Download Scanned Copy
                              <\/a>
                            <\/div>
                          \) : \(
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-\[10px\] text-slate-400">
                              Awaiting passport PDF or image
                            <\/div>
                          \)}

                          <p className="text-\[10px\] text-slate-500 leading-normal text-center">Required for visa invitation letters and international checks\.<\/p>
                        <\/div>

                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {passportUploading \? \(
                            <div className="space-y-1">
                              <div className="flex justify-between text-\[9px\] font-mono text-slate-500">
                                <span>Uploading\.\.\.<\/span>
                                <span>{passportProgress}%<\/span>
                              <\/div>
                              <div className="w-full bg-slate-100 h-1\.5 rounded-full overflow-hidden">
                                <div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `\${passportProgress}%` }}><\/div>
                              <\/div>
                            <\/div>
                          \) : \(
                            <div className="relative w-full">
                              <input 
                                type="file" 
                                accept="application\/pdf,image\/\*" 
                                onChange={\(e\) => {
                                  if \(e\.target\.files && e\.target\.files\[0\]\) {
                                    uploadFileToStorage\(e\.target\.files\[0\], 'passportScan'\);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              \/>
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1\.5 border border-slate-200">
                                <Upload className="size-3\.5" \/>
                                <span>Choose Document<\/span>
                              <\/Button>
                            <\/div>
                          \)}
                        <\/div>
                      <\/Card>'''

jsx_new = '''                      {/* Card 2: Passport Front */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Passport Front</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>
                          {memberData?.passportFrontUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                              <a href={memberData.passportFrontUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting front copy</div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {passportFrontUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{passportFrontProgress}%</span></div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${passportFrontProgress}%` }}></div></div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'passportFront'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload Front</span></Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Card 3: Passport Back */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Passport Back</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>
                          {memberData?.passportBackUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                              <a href={memberData.passportBackUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting back copy</div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {passportBackUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{passportBackProgress}%</span></div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${passportBackProgress}%` }}></div></div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'passportBack'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload Back</span></Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Card 4: Visa Front */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. Visa Front</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>
                          {memberData?.visaFrontUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                              <a href={memberData.visaFrontUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting front copy</div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {visaFrontUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{visaFrontProgress}%</span></div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${visaFrontProgress}%` }}></div></div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'visaFront'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload Front</span></Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Card 5: Visa Back */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">5. Visa Back</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>
                          {memberData?.visaBackUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                              <a href={memberData.visaBackUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting back copy</div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {visaBackUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{visaBackProgress}%</span></div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${visaBackProgress}%` }}></div></div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'visaBack'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload Back</span></Button>
                            </div>
                          )}
                        </div>
                      </Card>'''

content = re.sub(jsx_old, jsx_new, content)

# update numbering for Evidence
content = re.sub(
    r'<span className="text-\[10px\] font-bold uppercase tracking-wider text-slate-500">3\. Supporting Evidence</span>',
    r'<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6. Supporting Evidence</span>',
    content
)

with open('src/app/auth/member/member-client.tsx', 'w') as f:
    f.write(content)

print("Done")
