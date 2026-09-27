const Complaint = require('../models/Complaint');
const User = require('../models/User');
const axios = require('axios');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  const { 
    category, description, latitude, longitude, address, location, 
    severity, evidenceUrls, originalDescription, detectedLanguage, 
    translatedText, complaintType, voiceTranscript, reportData 
  } = req.body;

  try {
    // Generate simple complain ID: COMP-timestamp
    const complaintId = `COMP-${Date.now()}`;

    // Automatic Priority Engine
    let priority = 'Medium';
    if (severity === 'high' || severity === 'critical') priority = 'High';
    if (category === 'Public Safety') priority = 'High';
    if (severity === 'critical') priority = 'Critical';

    const complaint = await Complaint.create({
      complaintId,
      citizenUserId: req.user._id,
      category,
      description,
      latitude: latitude !== undefined ? latitude : (location?.coordinates ? location.coordinates[1] : 28.6139),
      longitude: longitude !== undefined ? longitude : (location?.coordinates ? location.coordinates[0] : 77.2090),
      address: address || location?.address || '',
      evidenceUrls: evidenceUrls || [],
      priority,
      status: 'Submitted',
      originalDescription: originalDescription || description,
      detectedLanguage: detectedLanguage || 'English',
      translatedText: translatedText || description,
      complaintType: complaintType || 'REGULAR',
      voiceTranscript,
      reportData,
      statusHistory: [{ status: 'Submitted', remarks: 'Complaint submitted by citizen' }]
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints (Admin/Officer)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'STAFF') {
      query.assignedOfficerUserId = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('citizenUserId', 'name email phone')
      .populate('assignedOfficerUserId', 'name rank')
      .populate('assignedDepartmentId', 'name')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenUserId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenUserId', 'name email phone')
      .populate('assignedOfficerUserId', 'name rank')
      .populate('assignedDepartmentId', 'name');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Officer/Admin)
const updateComplaintStatus = async (req, res) => {
  const { status, remarks, resolutionEvidenceUrl } = req.body;

  try {
    console.log(`Command received: Update Complaint ${req.params.id} to ${status}`);
    if (!req.user) {
        console.error("Authorization check failed: req.user is missing.");
        return res.status(401).json({ message: "Authentication required for this protocol." });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        console.error(`Dossier not found for ID: ${req.params.id}`);
        return res.status(404).json({ message: 'Requested investigation dossier not found.' });
    }

    console.log(`Previous Status: ${complaint.status}, New Target: ${status}`);

    // Update root fields
    complaint.status = status;
    if (resolutionEvidenceUrl) {
      complaint.resolutionEvidenceUrl = resolutionEvidenceUrl;
    }

    // Update History with safely validated metadata
    complaint.statusHistory.push({
      status,
      remarks: remarks || 'Manual state transition committed by officer.',
      updatedBy: req.user._id
    });

    if (remarks) {
      complaint.remarks.push({
        officer: req.user._id,
        message: remarks
      });
    }

    if (status === 'Completed') {
      complaint.status = 'Feedback Pending';
      complaint.statusHistory.push({
        status: 'Feedback Pending',
        remarks: 'System automatically moved to Feedback Pending sequence.',
        updatedBy: req.user._id
      });
    }

    await complaint.save();
    console.log(`Status transition SUCCESS: ${complaint.complaintId} updated.`);
    res.json(complaint);
  } catch (error) {
    console.error("CRITICAL Status Update Error:", error);
    res.status(500).json({ message: "System failed to commit status update.", details: error.message });
  }
};

// @desc    Get hotspots (Geospatial)
// @route   GET /api/complaints/hotspots
// @access  Private (Admin)
const getHotspots = async (req, res) => {
  try {
    // Simple hotspot detection logic: count complaints in groups
    const hotspots = await Complaint.aggregate([
      {
        $group: {
          _id: {
            lat: { $round: ['$latitude', 2] },
            lng: { $round: ['$longitude', 2] }
          },
          count: { $sum: 1 },
          complaints: { $push: '$_id' }
        }
      },
      { $match: { count: { $gte: 3 } } }, // Hotspot if 3+ complaints in same vicinity
      { $sort: { count: -1 } }
    ]);
    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate an officer's performance on a complaint
// @route   PUT /api/complaints/:id/rate
// @access  Private (Citizen)
const rateComplaint = async (req, res) => {
  const { rating, feedback } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Check if user is the one who submitted the complaint
    if (complaint.citizenUserId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to rate this complaint' });
    }

    // Only resolved complaints can be rated
    if (!['Resolved', 'Closed', 'Completed', 'Feedback Pending'].includes(complaint.status)) {
      return res.status(400).json({ message: 'Only completed/resolved complaints can be rated' });
    }

    complaint.rating = rating;
    complaint.feedback = feedback;
    complaint.status = 'Resolved';
    complaint.statusHistory.push({
      status: 'Resolved',
      remarks: 'Citizen provided rating and feedback. Protocol resolved.',
      updatedBy: req.user._id
    });

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assigned complaints for officer
// @route   GET /api/complaints/assigned
// @access  Private (Officer)
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedOfficerUserId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GeneralFeedback = require('../models/GeneralFeedback');

// @desc    Submit general platform feedback
// @route   POST /api/complaints/platform-feedback
// @access  Private
const submitGeneralFeedback = async (req, res) => {
  try {
    const { rating, factors, remarks } = req.body;
    const feedback = await GeneralFeedback.create({
      userId: req.user._id,
      rating,
      factors,
      remarks
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all general feedbacks
// @route   GET /api/complaints/platform-feedback
// @access  Private
const getGeneralFeedbacks = async (req, res) => {
  try {
    const feedbacks = await GeneralFeedback.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze complaint text (Language detection + Translation)
// @route   POST /api/complaints/analyze-complaint
// @access  Private
const analyzeComplaint = async (req, res) => {
  const { text } = req.body;

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ message: "GROQ_API_KEY is not configured." });
    }

    const systemPrompt = `Analyze the given civic grievance (may be English, Hindi, Telugu, or transliterated). 
    Generate a structured municipal report based on the input.

    SPECIFIC IDENTIFICATION RULES:
    1. Critical Infrastructure: If the input relates to Water, Electricity, or Roads, mark as 'High' priority if it causes significant public disruption.
    2. Public Health: Issues like garbage piles, open drains, or medical emergencies.
    3. Categorization: Map strictly to ['Sanitation', 'Roads', 'Water Supply', 'Electricity', 'Public Health', 'Encroachment', 'Other'].
    3. 'Hinglish'/'Telugish' detection: Map regional input to English.

    Return JSON ONLY with:
    - case_type (from: ['Sanitation', 'Roads', 'Water Supply', 'Electricity', 'Public Health', 'Encroachment', 'Other'])
    - priority (High/Medium/Low)
    - summary (1-2 lines concise overview)
    - report_description (Detailed municipal report entry in English)
    - time (extracted time or "Not specified")
    - location (extracted location or "Not specified")
    - detected_language (detected language name)
    - translated_text (Literal English translation)

    Rules:
    - report_description should be a formal authority report entry in PURE ENGLISH.
    - translated_text MUST be a direct English translation, not a summary.
    - case_type MUST be an English term from the provided list.
    - If details are missing, do not hallucinate specific names or locations.
    
    Example input: "ma area lo water block ayindi"
    Example output:
    {
      "detected_language": "Telugu (Transliterated)",
      "translated_text": "Water is blocked in our area.",
      "case_type": "Water Supply",
      "priority": "High",
      "time": "Not specified",
      "location": "Our area",
      "summary": "Report of domestic water supply disruption.",
      "report_description": "The resident reports a total blockage in the local water supply line. Immediate maintenance required to restore service."
    }`;

    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
        messages: [{ role: 'user', content: `${systemPrompt}\n\nInput: ${text}` }],
        temperature: 0
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      });

    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: "Analysis failed." });
  }
};

const voiceChat = async (req, res) => {
  const { text, context: contextString, lang = 'te-IN', complaintId } = req.body;
  
  let context = {};
  try {
    context = JSON.parse(contextString || '{}');
  } catch (e) {
    context = {};
  }

  const isTelugu = lang === 'te-IN';
  
  try {
    const systemPrompt = `You are a Friendly Civic Grievance Assistant. 
    Your goal is to help citizens file complaints about public issues (Sanitation, Roads, Water, Electricity, etc.) in a simple, non-formal way.

    STRICT CONVERSATION FLOW (5 STEPS):
    1. Issue Type: Identify the problem (Options: Sanitation, Roads, Water, Electricity, Others).
    2. Location: Identify exactly where it is (Area, Road, Landmark).
    3. Description: Get specific details (e.g., "Deep pothole at main junction").
    4. Severity: Determine urgency (Low, Medium, High).
    5. Media/Wrap-up: Ask if they want to upload an image and say a warm goodbye.

    EXAMPLES FOR YOUR RESPONSES:
    - Right: "What type of issue are you facing? (e.g., Pothole, Garbage pile, Water leak...)"
    - Wrong: "What type of incident occurred? (e.g., Theft, Assault, Accident...)"

    RULES:
    - NEVER behave like police or an investigator.
    - NEVER ask for legal details, accused names, or act/sections.
    - Be supportive, friendly, and simple. 
    - One question at a time.
    - If the user provides info, acknowledge it warmly and move to the next step.
    - Respond strictly in ${isTelugu ? 'TELUGU' : 'ENGLISH'}.

    ---
    CURRENT INTAKE DATA: ${JSON.stringify(context)}
    ---

    Your output MUST be a valid JSON object:
    - assistant_response: (Friendly response and next question in ${isTelugu ? 'Telugu' : 'English'}. 
      CRITICAL: Use ONLY civic examples. 
      In English: "Potholes, Garbage, Street lights". 
      In Telugu: "రోడ్డు గుంతలు (Potholes), చెత్త కుప్పలు (Garbage), వీధి దీపాలు (Street lights), నీటి సరఫరా (Water supply)".
      NEVER mention crime, theft, or assault.)
    - updated_grievance: (Extract values from conversation and map to: issueType, location, description, severity, status). Keep existing values if not mentioned.
    - map_search_query: (Clean location string for map update, e.g., "Anantapur, India").
    - current_step: (Increment based on provided context. If context says step 1 is done, you are at 2. Max 5.)
    - completion_percentage: (Calculate based on current_step: 1=20, 2=40, 3=60, 4=80, 5=100. DO NOT include % symbol.)
    - is_complete: (true if step 5 is reached and addressed)
    
    IMPORTANT: Look at the CURRENT INTAKE DATA. If 'location' is 'Awaiting...', you MUST ask for it. If you have it, move to 'description'.`;

    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'openai/gpt-oss-120b',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Citizen says: "${text}"` }
        ],
        temperature: 0
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      });

    if (data.error) {
      return res.status(500).json({ message: "LLM Failure", error: data.error });
    }
    
    let aiJson;
    try {
      aiJson = JSON.parse(data.choices[0].message.content);
      
      // PERSISTENT DATA SYNC
      if (complaintId && aiJson.updated_grievance) {
        const complaint = await Complaint.findById(complaintId);
        if (complaint) {
           complaint.reportData = { 
             ...(complaint.reportData || {}),
             ...aiJson.updated_grievance,
             current_step: aiJson.current_step,
             completion_percentage: aiJson.completion_percentage
           };
           
           // Update root fields if available
           if (aiJson.updated_grievance.issueType) complaint.category = aiJson.updated_grievance.issueType;
           if (aiJson.updated_grievance.description) complaint.description = aiJson.updated_grievance.description;
           if (aiJson.updated_grievance.severity) {
              complaint.priority = aiJson.updated_grievance.severity === 'High' ? 'High' : 'Medium';
           }

           complaint.markModified('reportData');
           await complaint.save();
        }
      }
    } catch (parseErr) {
      return res.status(500).json({ message: "AI response parse failed" });
    }

    res.json(aiJson);
  } catch (error) {
    res.status(500).json({ message: "Protocol failed.", error: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  getHotspots,
  rateComplaint,
  getAssignedComplaints,
  submitGeneralFeedback,
  getGeneralFeedbacks,
  analyzeComplaint,
  voiceChat
};
