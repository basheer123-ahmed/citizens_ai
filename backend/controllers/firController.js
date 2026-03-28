const FIR = require('../models/FIR');
const Complaint = require('../models/Complaint');
const PDFDocument = require('pdfkit');

// Helper to strip non-Latin characters for PDF rendering (pdfkit default font safety)
const cleanText = (text) => {
  if (!text) return 'N/A';
  // Strip characters that break the default Helvetica font (WinAnsi only)
  return text.toString().replace(/[^\x00-\x7F]/g, "").trim() || 'Data Unavailable (OCR/Language Sync required)';
};

// @desc Generate FIR from complaint
// @route POST /api/fir/generate/:complaintId
exports.generateFIR = async (req, res) => {
  try {
    const complaintId = req.params.complaintId.trim();
    const complaint = await Complaint.findById(complaintId)
      .populate('citizenUserId', 'name phone email');
      
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Check if FIR already exists
    let fir = await FIR.findOne({ complaintId: complaint._id });
    if (fir) return res.status(200).json(fir); // already generated

    const systemGeneratedId = `FIR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newFir = await FIR.create({
      complaintId: complaint._id,
      systemGeneratedId,
      status: complaint.assignedOfficerUserId ? 'Assigned' : 'Generated',
      complainantDetails: {
        name: complaint.firData?.complainant_details?.name || complaint.citizenUserId?.name || complaint.firData?.complainant_details || 'Unknown Complainant',
        contactInfo: complaint.firData?.complainant_details?.mobile || complaint.citizenUserId?.phone || 'Not Provided'
      },
      incidentDetails: {
        incidentType: complaint.firData?.act_and_section || complaint.translatedText?.split('|')[0] || complaint.category,
        dateAndTime: complaint.firData?.occurrence_details || complaint.firData?.time || new Date(complaint.createdAt).toLocaleString(),
        location: {
          address: complaint.firData?.occurrence_place || complaint.address || 'Geotagged Location',
          latitude: complaint.latitude,
          longitude: complaint.longitude
        },
        description: complaint.firData?.narrative || complaint.translatedText || complaint.description,
        suspectDetails: complaint.firData?.accused_details || 'Unknown',
        itemsLostOrDamaged: complaint.firData?.property_details || 'None reported'
      },
      aiSummary: complaint.firData?.notes || complaint.firData?.summary || 'Standard intake generation',
      priorityLevel: complaint.priority || 'Medium',
      assignedOfficerId: complaint.assignedOfficerUserId
    });

    res.status(201).json(newFir);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get FIR by Complaint ID
// @route GET /api/fir/:complaintId
exports.getFIRById = async (req, res) => {
  try {
    const fir = await FIR.findOne({ complaintId: req.params.complaintId }).populate('assignedOfficerId', 'name rank');
    if (!fir) return res.status(404).json({ message: 'FIR not found' });
    res.json(fir);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Download FIR as PDF
// @route GET /api/fir/:complaintId/download
exports.downloadFIRPdf = async (req, res) => {
  try {
    const complaintId = req.params.complaintId.trim();
    const complaint = await Complaint.findById(complaintId).populate('citizenUserId', 'name phone email');
    if (!complaint) return res.status(404).json({ message: 'Complaint Records not found for ID: ' + complaintId });

    let fir = await FIR.findOne({ complaintId }).populate('assignedOfficerId', 'name rank');
    
    // Create OR Sync FIR Data with latest AI findings
    const firUpdateData = {
      complaintId: complaint._id,
      complainantDetails: {
        name: complaint.firData?.complainant_details?.name || complaint.citizenUserId?.name || complaint.firData?.complainant_details || 'Unknown Complainant',
        contactInfo: complaint.firData?.complainant_details?.mobile || complaint.citizenUserId?.phone || 'Not Provided'
      },
      incidentDetails: {
        incidentType: complaint.firData?.act_and_section || complaint.category,
        dateAndTime: complaint.firData?.occurrence_details || new Date(complaint.createdAt).toLocaleString(),
        location: {
          address: complaint.firData?.occurrence_place || complaint.address || 'Geotagged Location',
          latitude: complaint.latitude,
          longitude: complaint.longitude
        },
        description: complaint.firData?.narrative || complaint.translatedText || complaint.description,
        suspectDetails: complaint.firData?.accused_details || 'Unknown / Not Provided',
        itemsLostOrDamaged: complaint.firData?.property_details || 'None reported'
      },
      aiSummary: complaint.firData?.notes || 'Standard intake generation',
      priorityLevel: complaint.priority || 'Medium',
      assignedOfficerId: complaint.assignedOfficerUserId
    };

    if (!fir) {
      const systemGeneratedId = `FIR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      fir = await FIR.create({ ...firUpdateData, systemGeneratedId, status: complaint.assignedOfficerUserId ? 'Assigned' : 'Generated' });
    } else {
      // Refresh existing FIR with new conversational data
      await FIR.findByIdAndUpdate(fir._id, firUpdateData);
      fir = await FIR.findById(fir._id).populate('assignedOfficerId', 'name rank');
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fir.systemGeneratedId}.pdf`);

    doc.pipe(res);

    // AI-Styled Header
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold').text('[ STATE POLICE DEPARTMENT ]', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text('FIRST INFORMATION REPORT', { align: 'center' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Oblique').text('AI-Powered Citizen Complaint System', { align: 'center' });
    doc.moveDown(2);

    // Meta Info
    doc.rect(50, doc.y, 495, 45).fill('#f8fafc');
    doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text(`CASE ID: ${fir.systemGeneratedId}`, 60, doc.y - 35);
    doc.font('Helvetica').text(`DATE & TIME OF REPORT: ${new Date(fir.generatedAt).toLocaleString()}`, 60, doc.y + 15);
    if (complaint.firData?.police_station) {
      doc.text(`JURISDICTION: ${cleanText(complaint.firData.police_station)}`, 60, doc.y + 15);
    }
    doc.moveDown(2);

    // Helper for sections
    const drawSection = (title, content, isBold = false) => {
      doc.x = 50;
      doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(12).text(title);
      doc.moveDown(0.3);
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#334155').fontSize(10).text(content || 'Not Provided by Complainant', { width: 495, align: 'justify', lineHeight: 1.5 });
      doc.moveDown(1.5);
    };

    // 1. COMPLAINANT DETAILS
    const compName = typeof complaint.firData?.complainant_details === 'object' ? (complaint.firData.complainant_details.name || complaint.citizenUserId?.name) : (complaint.firData?.complainant_details || cleanText(fir.complainantDetails.name));
    drawSection('1. COMPLAINANT DETAILS', `Name: ${cleanText(compName)}\nContact Information: ${cleanText(fir.complainantDetails.contactInfo)}\nInformation Type: ${cleanText(complaint.firData?.info_type || 'Voice AI Intake')}`);

    // 2. INCIDENT CLASSIFICATION
    drawSection('2. INCIDENT CLASSIFICATION', `Type of Case (Act & Section): ${cleanText(fir.incidentDetails.incidentType)}\nSeverity Level: ${fir.priorityLevel.toUpperCase()}`);

    // 3. DATE & TIME OF INCIDENT
    drawSection('3. DATE & TIME OF INCIDENT', cleanText(fir.incidentDetails.dateAndTime));

    // 4. LOCATION DETAILS
    drawSection('4. LOCATION DETAILS', `Full Address / Area: ${cleanText(fir.incidentDetails.location.address)}\nGeo Coordinates: Lat ${fir.incidentDetails.location.latitude?.toFixed(5) || 'N/A'}, Lng ${fir.incidentDetails.location.longitude?.toFixed(5) || 'N/A'}\n(Geolocation derived via AI analysis)`);
    
    // Line Separator
    doc.rect(50, doc.y, 495, 1).fill('#e2e8f0');
    doc.moveDown(1.5);

    // 5. DETAILED INCIDENT DESCRIPTION
    drawSection('5. DETAILED INCIDENT DESCRIPTION', cleanText(fir.incidentDetails.description));
    
    // 6. AI ANALYSIS SUMMARY
    doc.rect(50, doc.y - 10, 495, 45).fill('#eff6ff');
    doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold').text('6. AI ANALYSIS SUMMARY', 60, doc.y + 5);
    doc.font('Helvetica').fillColor('#1e3a8a').text(cleanText(fir.aiSummary), 60, doc.y + 4, { width: 475, align: 'justify' });
    doc.moveDown(3);

    // Line Separator
    doc.rect(50, doc.y, 495, 1).fill('#e2e8f0');
    doc.moveDown(1.5);
    doc.x = 50;

    // 7. SUSPECT INFORMATION
    drawSection('7. SUSPECT INFORMATION', cleanText(fir.incidentDetails.suspectDetails));

    // 8. PROPERTY / LOSS DETAILS
    const totalValue = complaint.firData?.property_value && complaint.firData?.property_value !== '0' ? `\nEstimated Value: ₹${cleanText(complaint.firData.property_value)}` : '';
    drawSection('8. PROPERTY / LOSS DETAILS', `Properties Affected: ${cleanText(fir.incidentDetails.itemsLostOrDamaged)}${totalValue}`);

    // 9. ADDITIONAL REMARKS
    const delayReason = complaint.firData?.delay_reason !== 'None' ? `Delay Reason: ${cleanText(complaint.firData?.delay_reason)}\n` : '';
    drawSection('9. ADDITIONAL REMARKS', `${delayReason}Investigation pending officer assignment. ${cleanText(complaint.firData?.notes || '')}`);

    // Footer
    const footerY = Math.max(doc.y + 20, doc.page.height - 100);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#94a3b8').text('OFFICIAL SYSTEM STATUS', 50, footerY);
    doc.font('Helvetica').text(fir.status === 'Assigned' ? `ASSIGNED TO: OFFICER ${fir.assignedOfficerId?.name?.toUpperCase()} (${fir.assignedOfficerId?.rank})` : 'AWAITING OFFICER ASSIGNMENT', 50, footerY + 15);

    doc.fontSize(8).fillColor('#cbd5e1').text('AUTO-GENERATED LEGAL DOCUMENT VIA CGMP NEURAL INTAKE', 50, footerY + 45, { align: 'center', width: 495 });
    doc.text(`VERIFICATION HASH: ${fir._id} • ${new Date().getTime().toString(16).toUpperCase()}`, 50, footerY + 55, { align: 'center', width: 495 });

    doc.end();

  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
};
