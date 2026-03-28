const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  const { 
    category, description, latitude, longitude, address, location, 
    severity, evidenceUrls, originalDescription, detectedLanguage, 
    translatedText, complaintType, voiceTranscript, firData 
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
      firData,
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
    if (req.user.role === 'OFFICER') {
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

    const systemPrompt = `Analyze the given complaint (which may be in English, Hindi, Telugu, or transliterated vernacular like 'Hinglish' or 'Telugish'). 
    Generate a structured FIR police report based on the input.

    SPECIFIC IDENTIFICATION RULES:
    1. Property vs. Person: If the input mentions "gold", "money", "phone", "bike", or other items being "miss", "lost", or "stolen", categorize as 'Theft'. NEVER categorize property loss as 'Missing Person'.
    2. 'Missing Person' is ONLY for humans (e.g., "son", "daughter", "friend", "father" is missing).
    3. 'Hinglish'/'Telugish' detection: Some users write regional languages using English alphabets (e.g., 'naa gold miss cheskunna' means 'I lost my gold' in Telugu). Detected that accurately.

    Return JSON ONLY with:
    - case_type (from: ['Theft', 'Missing Person', 'Cyber Crime', 'Harassment', 'Accident', 'Suspicious Activity', 'Other'])
    - priority (High/Medium/Low)
    - summary (1-2 lines concise overview)
    - fir_description (Detailed official police description in English)
    - time (extracted time or "Not specified")
    - location (extracted location or "Not specified")
    - detected_language (detected language name, e.g., 'Telugu (Transliterated)')
    - translated_text (A FAITHFUL, LITERAL English translation of the original input)

    Rules:
    - fir_description should be a formal police report entry in PURE ENGLISH.
    - translated_text MUST be a direct English translation, not a summary.
    - case_type MUST be an English term from the provided list.
    - If details are missing, do not hallucinate specific names or locations.
    
    Example input: "naa gold miss cheskunna"
    Example output:
    {
      "detected_language": "Telugu (Transliterated)",
      "translated_text": "I have lost my gold.",
      "case_type": "Theft",
      "priority": "Medium",
      "time": "Not specified",
      "location": "Not specified",
      "summary": "Report of lost/stolen gold jewelry.",
      "fir_description": "The complainant reports the loss of gold property. No specific time or location of occurrence was provided in the initial statement."
    }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
        messages: [{ role: 'user', content: `${systemPrompt}\n\nInput: ${text}` }],
        temperature: 0
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API Error: ${err}`);
    }

    const data = await response.json();
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
    const systemPrompt = `You are the Lead AI Detective for a high-intensity FIR Intake Hub.
    🎯 TARGET: FULL INCIDENT DOSSIER CONSTRUCTION.

    STRICT OPERATIONAL RULES:
    1. 🧠 CONTEXTUAL INTELLIGENCE: Analyze the "CURRENT DOSSIER". If a piece of information exists, NEVER ask for it again.
    2. 👮 DETECTIVE PERSONA: Be sharp, brief, and professional. One question at a time.
    3. ⚡ INCIDENT-FIRST: Always prioritize the crime details (What, Where, When) before complainant identity (Name, Age) unless identity is all that's missing.
    4. 🚫 ZERO LOOPS: If a user gives info, acknowledge it and pivot to the next missing data point instantly.
    5. 🧠 SMART BUNDLING: If multiple things are missing, ask for logically related info (e.g., "What is the brand and IMEI of the phone?").
    6. 🌐 LANGUAGE: Respond strictly in ${isTelugu ? 'TELUGU' : 'ENGLISH'}. Do not mix.

    INVESTIGATION SEQUENCE (ADAPTIVE):
    1. Incident Description (Type, Details)
    2. Spatial & Temporal Vector (Where, When)
    3. Missing Property (Brand, Model, Value)
    4. Suspect Intelligence (Description, Known/Unknown)
    5. Identity Verification (Name, Age, Phone - ONLY IF NOT ALREADY PROVIDED)

    ---
    CURRENT DOSSIER: ${JSON.stringify(context)}
    ---

    Your output MUST be a valid JSON object:
    - assistant_response: (Next smart detective question in ${isTelugu ? 'Telugu' : 'English'}. NO REPETITION.)
    - updated_fir: (Map input accurately to: police_station, act_and_section, occurrence_details, occurrence_place, complainant_details, accused_details, property_details, property_value, narrative).
    - map_search_query: (Clean location string for map update).
    - missing_fields: (List of remaining data points).
    - completion_percentage: (0-100).`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
        messages: [{ role: 'user', content: `${systemPrompt}\n\nDetective, the user just said: "${text}"` }],
        temperature: 0.1
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Groq API Error:", data.error);
      return res.status(500).json({ message: "LLM API Failure", error: data.error });
    }
    
    let aiJson;
    try {
      const content = data.choices[0].message.content;
      aiJson = JSON.parse(content);
      
      // PERSISTENT CONTEXT SAVING & SYNC
      if (complaintId && aiJson.updated_fir) {
        const complaint = await Complaint.findById(complaintId);
        if (complaint) {
           const fir = aiJson.updated_fir;
           const prevFir = complaint.firData || {};
           
           complaint.firData = { 
             ...prevFir,
             ...fir,
             complainant_details: {
               ...(prevFir.complainant_details || {}),
               ...(fir.complainant_details || {})
             }
           };

           complaint.markModified('firData');
           await complaint.save();
        }
      }
    } catch (parseErr) {
      console.error("JSON Parse Error on AI output:", parseErr, data.choices[0]?.message?.content);
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    res.json(aiJson);
  } catch (error) {
    console.error("Neural Chat Protocol error stack:", error);
    res.status(500).json({ message: "Neural Chat Protocol failed.", error: error.message });
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
