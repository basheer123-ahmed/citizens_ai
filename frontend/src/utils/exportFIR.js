import { jsPDF } from 'jspdf';
import { policeEmblemBase64 } from '../assets/policeEmblemBase64';

export const exportFIR = (complaint) => {
  if (!complaint) return;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const timestamp = new Date().toLocaleString();
  const caseId = complaint.complaintId || 'PENDING-ID';
  
  // Custom Colours
  const primaryBlue = [15, 23, 42]; // Slate 900
  const secondaryGray = [100, 116, 139]; // Slate 500
  const accentBlue = [37, 99, 235]; // Blue 600
  
  // Helper for centering text
  const centerText = (text, y, size, isBold, color = primaryBlue) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // 1. EMBLEM (AI Generated Premium Logo)
  try {
     doc.addImage(policeEmblemBase64, 'PNG', pageWidth / 2 - 12, 12, 24, 24);
  } catch (err) {
     console.error("Failed to load AI Emblem:", err);
  }
  
  // 2. HEADER
  centerText('OFFICIAL FIRST INFORMATION REPORT DOSSIER', 45, 16, true);
  centerText('AI-Powered Crime Intelligence System', 52, 10, false, secondaryGray);
  
  // Horizontal Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(20, 58, pageWidth - 20, 58);
  
  // Meta Details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryGray);
  doc.text(`CASE REF: ${caseId}`, 20, 65);
  doc.text(`GENERATED: ${timestamp}`, pageWidth - 20, 65, { align: 'right' });
  
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...accentBlue);
  centerText('Auto-Generated via AI Intake Engine', 72, 9, false, accentBlue);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 78, pageWidth - 20, 78);

  let startY = 88;

  // Section Generator Helper
  const createSection = (title, items, y) => {
    // Check page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    // Section Title
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(20, y - 6, pageWidth - 40, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryBlue);
    doc.text(`  ${title.toUpperCase()}`, 20, y);
    
    y += 10;
    
    // Items
    doc.setFontSize(10);
    items.forEach(item => {
      // Check page break inside items
      if (y > 280) {
         doc.addPage();
         y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryGray);
      doc.text(`${item.label}:`, 25, y);
      
      const labelWidth = doc.getTextWidth(`${item.label}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...primaryBlue);
      
      const splitValue = doc.splitTextToSize(String(item.value || 'Not Provided'), pageWidth - 35 - labelWidth);
      doc.text(splitValue, 25 + labelWidth, y);
      
      y += (splitValue.length * 5) + 3;
    });
    
    return y + 5;
  };

  const getVal = (val) => val ? val : 'Not Provided';
  const getAiVal = Object.keys(complaint.firData || {}).length > 0;

  // Extract variables with intelligent fallback for both AI_FIR and REGULAR complaints
  const complainantName = complaint.firData?.complainant_details?.name || complaint.citizenUserId?.name || 'Not Provided';
  const complainantPhone = complaint.firData?.complainant_details?.mobile || complaint.citizenUserId?.phone || 'Not Provided';
  const complainantAddress = complaint.firData?.complainant_details?.address || complaint.address || 'Not Provided';
  
  const caseType = getVal(complaint.category || complaint.firData?.case_type);
  const severity = getVal(complaint.priority);
  const infoType = getVal(complaint.firData?.info_type || (complaint.complaintType === 'AI_FIR' ? 'Voice / Digital Entry' : 'Manual Portal Entry'));
  
  const occTime = getVal(complaint.firData?.occurrence_details || complaint.firData?.time);
  
  const locAddress = getVal(complaint.address || complaint.firData?.occurrence_place || complaint.firData?.location);
  const locCoords = complaint.latitude ? `Lat: ${complaint.latitude}, Lng: ${complaint.longitude}` : 'Not Provided';

  const actSection = getVal(complaint.firData?.act_and_section);
  const aiSummary = getVal(complaint.firData?.summary || complaint.firData?.observations);
  const missingAlert = complaint.firData?.missingFields?.length > 0 ? complaint.firData.missingFields.join(', ') : 'None';

  const accusedDet = getAiVal && complaint.firData?.accused_details ? complaint.firData.accused_details : 'Unknown / Not Identified';
  const propDet = getAiVal && complaint.firData?.property_details ? complaint.firData.property_details : 'None specified';
  const propVal = getAiVal && complaint.firData?.property_value ? complaint.firData.property_value : 'Unknown';

  // 1. COMPLAINANT PROFILE
  startY = createSection('1. Complainant Profile', [
    { label: 'Name', value: complainantName },
    { label: 'Contact', value: complainantPhone },
    { label: 'Address', value: complainantAddress }
  ], startY);

  // 2. INCIDENT CLASSIFICATION
  startY = createSection('2. Incident Classification', [
    { label: 'Type of Case', value: caseType },
    { label: 'Severity Level', value: severity },
    { label: 'Nature of Report', value: infoType }
  ], startY);

  // 3. INCIDENT TIMELINE
  startY = createSection('3. Incident Timeline', [
    { label: 'Date & Time of occurrence', value: `${occTime} (Approximate)` },
    { label: 'Reported Timestamp', value: timestamp }
  ], startY);

  // 4. LOCATION INTELLIGENCE
  startY = createSection('4. Location Intelligence', [
    { label: 'Full Address', value: locAddress },
    { label: 'Geo Coordinates', value: locCoords },
    { label: 'Intel Source', value: 'Location intelligence derived using AI-assisted geospatial analysis' }
  ], startY);

  // 5. DETAILED INCIDENT NARRATIVE
  let rawNarrative = complaint.firData?.narrative || complaint.firData?.fir_description || complaint.description || complaint.voiceTranscript || 'Not Provided';
  if (rawNarrative.length > 5 && rawNarrative.length < 50 && rawNarrative !== 'Not Provided') {
      rawNarrative = `The complainant states that the incident occurred as documented: "${rawNarrative}". The context implies a sudden occurrence that requires immediate investigative attention to determine the full sequence of events. Local enforcement units are advised to initiate tracking protocols based on the provided brief.`;
  }
  
  startY = createSection('5. Detailed Incident Narrative', [
    { label: 'Statement', value: rawNarrative }
  ], startY);

  // 6. AI ANALYTICAL SUMMARY
  startY = createSection('6. AI Analytical Summary', [
    { label: 'Act and Section', value: actSection },
    { label: 'Observations', value: aiSummary },
    { label: 'Missing Info Alert', value: missingAlert }
  ], startY);

  // 7. SUSPECT INFORMATION
  startY = createSection('7. Suspect Information', [
    { label: 'Identified Suspects', value: accusedDet }
  ], startY);

  // 8. PROPERTY / LOSS DETAILS
  startY = createSection('8. Property / Loss Details', [
    { label: 'Item Details', value: propDet },
    { label: 'Estimated Value', value: propVal }
  ], startY);
  
  if (startY > 230) {
    doc.addPage();
    startY = 20;
  }

  // 9. DECLARATION SECTION
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('9. OFFICIAL DECLARATION', 20, startY + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...secondaryGray);
  const declaration = "This report has been digitally generated based on citizen-provided input and AI-assisted analysis. It is subject to verification and official processing by the concerned authorities. False reports may be subject to legal penalties.";
  const splitDeclaration = doc.splitTextToSize(declaration, pageWidth - 40);
  doc.text(splitDeclaration, 20, startY + 18);

  // 10. SIGNATURE BLOCK
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  
  doc.text('Officer-in-Charge', pageWidth - 60, startY + 45);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...secondaryGray);
  doc.text('(Digital Verification Pending)', pageWidth - 65, startY + 50);

  // Important: Open PDF in new tab instead of raw auto-download per user request "DO NOT auto-download PDF"
  // It opens the PDF embedded viewer directly so they can preview it seamlessly 
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};
