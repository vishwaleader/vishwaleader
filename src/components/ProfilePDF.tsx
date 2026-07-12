import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a standard corporate font (Helvetica is built-in, but we use it explicitly)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    paddingBottom: 60, // Space for footer
  },
  
  // CORPORATE HEADER
  headerBand: {
    backgroundColor: '#ffffff', // Light background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  logo: {
    width: 140, // Increased size for visibility
    height: 'auto',
  },
  headerTextContainer: {
    alignItems: 'flex-end',
  },
  companyName: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  docType: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  addressText: {
    color: '#94a3b8',
    fontSize: 6,
    marginTop: 6,
    textAlign: 'right',
    maxWidth: 320,
    lineHeight: 1.4,
    textTransform: 'uppercase',
  },
  
  // META INFO BAR
  metaBar: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    marginRight: 6,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  memberIdBadge: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },

  // BODY
  body: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  
  section: {
    marginBottom: 25,
  },
  sectionBreak: {
    marginBottom: 25,
    marginTop: 30, // Extra space from the header on new pages
  },
  sectionTitleBox: {
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 6,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // GRID/TABLE SYSTEM
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
  },
  gridCol: {
    flex: 1,
    paddingRight: 15,
  },
  gridCol2: {
    flex: 2,
    paddingRight: 15,
  },
  gridLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 11,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  
  // DOCUMENTS & IMAGES
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  imageCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
  },
  imageCardLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  imageFile: {
    width: '100%',
    height: 75,
    objectFit: 'contain',
    backgroundColor: '#ffffff',
  },
  pdfPlaceholder: {
    width: '100%',
    height: 75,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  pdfPlaceholderText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  
  // GUEST CARD
  guestBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    marginHorizontal: -10,
    marginTop: -10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  guestName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  guestBadge: {
    fontSize: 9,
    color: '#ffffff',
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },

  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#94a3b8',
  }
});

interface ProfilePDFProps {
  memberData: any;
  guestProfiles?: any[];
}

export const ProfilePDF: React.FC<ProfilePDFProps> = ({ memberData, guestProfiles = [] }) => {
  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Helper for checking if an image is a PDF
  const isPdf = (url: string) => url && url.toLowerCase().includes('.pdf');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* CORPORATE HEADER */}
        <View style={styles.headerBand} fixed>
          <Image src="/assets/images/vishwaleader-logo-hd.png" style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.companyName}>Vishwa Leader TechMedia Private Limited</Text>
            <Text style={styles.docType}>Official Registration Dossier</Text>
            <Text style={styles.addressText}>
              {`UNIT NO 1 MALWA PATANWALA COMP,\nLALBAHADUR SHASTRI MARG, GHATKOPAR W,\nMumbai, 400086 Maharashtra, India.\ncorporate identification number\n(CIN) U74999MH2016PTC273606`}
            </Text>
          </View>
        </View>

        {/* META BAR */}
        <View style={styles.metaBar} fixed>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Generated On:</Text>
            <Text style={styles.metaValue}>{currentDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Member ID:</Text>
            <Text style={styles.memberIdBadge}>{memberData?.memberId || 'PENDING'}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* PERSONAL INFO */}
          <View style={styles.section}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>1. Personal Details</Text>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol2}>
                <Text style={styles.gridLabel}>Full Legal Name</Text>
                <Text style={styles.gridValue}>{memberData?.name || 'Not Provided'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Gender</Text>
                <Text style={styles.gridValue}>{memberData?.gender || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Age</Text>
                <Text style={styles.gridValue}>{memberData?.age || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol2}>
                <Text style={styles.gridLabel}>Email Address</Text>
                <Text style={styles.gridValue}>{memberData?.email || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Phone Number</Text>
                <Text style={styles.gridValue}>{memberData?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Nationality</Text>
                <Text style={styles.gridValue}>{memberData?.nationality || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Passport Number</Text>
                <Text style={styles.gridValue}>{memberData?.passportNumber || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol2}>
                <Text style={styles.gridLabel}>Registered Address</Text>
                <Text style={styles.gridValue}>{memberData?.fullAddress || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>City</Text>
                <Text style={styles.gridValue}>{memberData?.city || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>State / Region</Text>
                <Text style={styles.gridValue}>{memberData?.state || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* PROFESSIONAL PROFILE */}
          <View style={styles.section}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>2. Professional Profile</Text>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Designation / Title</Text>
                <Text style={styles.gridValue}>{memberData?.designation || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Organization</Text>
                <Text style={styles.gridValue}>{memberData?.organization || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Industry Sector</Text>
                <Text style={styles.gridValue}>{memberData?.sector || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Professional Summary / Bio</Text>
                <Text style={styles.gridValue}>{memberData?.bio || 'No professional bio provided.'}</Text>
              </View>
            </View>
          </View>

          {/* EVENT LOGISTICS */}
          <View style={styles.sectionBreak} break>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>3. Event Logistics & Support</Text>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Nomination Category</Text>
                <Text style={styles.gridValue}>{memberData?.nominationCategory || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Selected Tour Package</Text>
                <Text style={styles.gridValue}>{memberData?.packageTour || 'None'}</Text>
              </View>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Participation Intents</Text>
                <Text style={styles.gridValue}>{(memberData?.wizardIntents || []).join(', ') || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridCol2}>
                <Text style={styles.gridLabel}>Special Assistance Required</Text>
                <Text style={styles.gridValue}>
                  {[
                    memberData?.wheelchairSupport && 'Wheelchair Support',
                    memberData?.visaSupport && 'Visa Assistance',
                    memberData?.accommodationSupport && 'Accommodation Support'
                  ].filter(Boolean).join(' • ') || 'None Requested'}
                </Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Dietary Requirements</Text>
                <Text style={styles.gridValue}>{memberData?.dietaryNotes || 'None'}</Text>
              </View>
            </View>
          </View>

          {/* DOCUMENTATION */}
          <View style={styles.section}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>4. Primary Delegate Identity Documents</Text>
            </View>
            <View style={styles.imageGrid}>
              <View style={styles.imageCard}>
                <Text style={styles.imageCardLabel}>Official Headshot</Text>
                {memberData?.headshotUrl ? (
                  isPdf(memberData.headshotUrl) ? (
                    <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Document Attached</Text></View>
                  ) : (
                    <Image style={styles.imageFile} src={memberData.headshotUrl} />
                  )
                ) : (
                  <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                )}
              </View>

              <View style={styles.imageCard}>
                <Text style={styles.imageCardLabel}>National ID Card</Text>
                {memberData?.nationalIdUrl ? (
                  isPdf(memberData.nationalIdUrl) ? (
                    <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Document Attached</Text></View>
                  ) : (
                    <Image style={styles.imageFile} src={memberData.nationalIdUrl} />
                  )
                ) : (
                  <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                )}
              </View>

              <View style={styles.imageCard}>
                <Text style={styles.imageCardLabel}>Passport Front Page</Text>
                {memberData?.passportFrontUrl ? (
                  isPdf(memberData.passportFrontUrl) ? (
                    <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Document Attached</Text></View>
                  ) : (
                    <Image style={styles.imageFile} src={memberData.passportFrontUrl} />
                  )
                ) : (
                  <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                )}
              </View>

              <View style={styles.imageCard}>
                <Text style={styles.imageCardLabel}>Passport Back Page</Text>
                {memberData?.passportBackUrl ? (
                  isPdf(memberData.passportBackUrl) ? (
                    <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Document Attached</Text></View>
                  ) : (
                    <Image style={styles.imageFile} src={memberData.passportBackUrl} />
                  )
                ) : (
                  <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                )}
              </View>
            </View>
          </View>

          {/* FAMILY / GUESTS */}
          {guestProfiles && guestProfiles.length > 0 && (
            <View style={styles.sectionBreak} break>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>5. Authorised Guests & Family Members</Text>
              </View>
              
              {guestProfiles.map((guest: any, idx: number) => (
                <View key={idx} style={styles.guestBox} wrap={false}>
                  <View style={styles.guestHeader}>
                    <Text style={styles.guestName}>{guest.title} {guest.name}</Text>
                    <Text style={styles.guestBadge}>Guest Profile {idx + 1}</Text>
                  </View>
                  
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Relationship</Text>
                      <Text style={styles.gridValue}>{guest.relationship || 'N/A'}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Gender</Text>
                      <Text style={styles.gridValue}>{guest.gender || 'N/A'}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Age</Text>
                      <Text style={styles.gridValue}>{guest.age || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Passport Number</Text>
                      <Text style={styles.gridValue}>{guest.passportNumber || 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Guest Documents */}
                  <View style={[styles.imageGrid, { marginTop: 15 }]}>
                    <View style={styles.imageCard}>
                      <Text style={styles.imageCardLabel}>Headshot</Text>
                      {guest.headshotUrl ? (
                        isPdf(guest.headshotUrl) ? (
                          <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Attached</Text></View>
                        ) : (
                          <Image style={styles.imageFile} src={guest.headshotUrl} />
                        )
                      ) : (
                        <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                      )}
                    </View>

                    <View style={styles.imageCard}>
                      <Text style={styles.imageCardLabel}>National ID</Text>
                      {guest.nationalIdUrl ? (
                        isPdf(guest.nationalIdUrl) ? (
                          <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Attached</Text></View>
                        ) : (
                          <Image style={styles.imageFile} src={guest.nationalIdUrl} />
                        )
                      ) : (
                        <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                      )}
                    </View>

                    <View style={styles.imageCard}>
                      <Text style={styles.imageCardLabel}>Passport Front</Text>
                      {guest.passportFrontUrl ? (
                        isPdf(guest.passportFrontUrl) ? (
                          <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Attached</Text></View>
                        ) : (
                          <Image style={styles.imageFile} src={guest.passportFrontUrl} />
                        )
                      ) : (
                        <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                      )}
                    </View>

                    <View style={styles.imageCard}>
                      <Text style={styles.imageCardLabel}>Passport Back</Text>
                      {guest.passportBackUrl ? (
                        isPdf(guest.passportBackUrl) ? (
                          <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>PDF Attached</Text></View>
                        ) : (
                          <Image style={styles.imageFile} src={guest.passportBackUrl} />
                        )
                      ) : (
                        <View style={styles.pdfPlaceholder}><Text style={styles.pdfPlaceholderText}>Not Uploaded</Text></View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© {new Date().getFullYear()} VishwaLeader TechMedia Private Limited. Strictly Confidential.</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} fixed />
        </View>
      </Page>
    </Document>
  );
};
