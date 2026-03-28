const axios = require('axios');

const verifyImage = async (req, res) => {
  const { imageBase64, category, description } = req.body;

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ message: "GROQ_API_KEY is not configured." });
    }

    console.log(`Verifying image for category: ${category}`);
    if (!imageBase64 || !category) {
      return res.status(400).json({ message: "Image and category are required." });
    }

    const systemPrompt = `You are an expert AI civic grievance validator. Analyze the image against the selected category and description.
Category meanings for our platform:
- "Potholes Protocol": Road damage, holes, asphalt cracks.
- "Sanitation Feed": Garbage overflow, litter, illegal dumping.
- "Hydraulic Integrity": Water leaks, pipe bursts, flooded areas.
- "Illumination Logistics": Broken streetlights, dark public paths, electrical hazards.
- "Security Oversight": Public safety risks, abandoned vehicles, vandalism.
- "Infrastructure Decay": Crumbling buildings, broken pavements, structural damage.

Category: "${category}"
User Description: "${description || 'Not provided'}"

Response Requirement: You MUST respond in JSON format only: {"match": boolean, "reason": "short explanation"}.
Set "match" to true only if the image visually confirms a grievance fitting the category. 
If false, provide a concise reason why it doesn't match (e.g., "Image shows a clean park, not garbage overflow").`;

    console.log("Calling Groq Vision API via Axios...");
    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.2-11b-vision-preview',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 150
    }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
    });

    console.log("Groq Vision API Response received.");
    let result;
    try {
      result = typeof data.choices[0].message.content === 'string' 
        ? JSON.parse(data.choices[0].message.content) 
        : data.choices[0].message.content;
      console.log("Parsed AI result:", result);
    } catch (e) {
      console.error("JSON Parse Error on AI response text:", data.choices[0].message.content);
      return res.json({ match: false, reason: "AI response error. Please try again." });
    }

    return res.json({ 
      match: result.match, 
      reason: result.match ? "Match verified." : result.reason 
    });

  } catch (error) {
    console.error("DETAILED Image Verification Error (Axios Version):", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Image verification failed.",
      details: error.response?.data?.error?.message || error.message 
    });
  }
};

const translateVoiceText = async (req, res) => {
  const { text } = req.body;

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ message: "GROQ_API_KEY is not configured." });
    }

    const systemPrompt = `You are an expert polyglot translator for a civic grievance platform. 
    Task: Detect the input language and translate it into clear, professional, standardized English.
    Requirement: Return ONLY a JSON object: {"translatedText": "string", "detectedLanguage": "string"}.
    If the text is already in English, return it as is.`;

    console.log("Calling Groq Translation API via Axios...");
    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
        response_format: { type: "json_object" },
        messages: [{ role: 'user', content: `${systemPrompt}\n\nInput Text: ${text}` }],
        temperature: 0
    }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
    });

    const result = typeof data.choices[0].message.content === 'string' 
      ? JSON.parse(data.choices[0].message.content) 
      : data.choices[0].message.content;
    return res.json(result);
  } catch (error) {
    console.error("Translation Error (Axios Version):", error.response?.data || error.message);
    res.status(500).json({ message: "Translation failed." });
  }
};

const verifyCompletionProof = async (req, res) => {
  const { imageBase64, originalCategory, originalDescription } = req.body;

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ message: "GROQ_API_KEY is not configured." });
    }

    if (!imageBase64) {
      return res.status(400).json({ message: "Proof image is required." });
    }

    console.log(`Verifying Completion for: ${originalCategory}`);
    console.log(`Image Payload Type: ${typeof imageBase64}, Length: ${imageBase64.length}`);
    console.log(`Image Payload Sample: ${imageBase64.substring(0, 50)}...`);

    const systemPrompt = `You are a verifyer of civic work completion.
    Original Problem Category: "${originalCategory}"
    Original Problem Description: "${originalDescription}"
    
    Task: Analyze the provided "Completion Proof" image. 
    Determine if this image visually confirms that the reported issue has been resolved or addressed.
    Response: JSON only: {"valid": boolean, "reason": "string"}`;

    console.log("Calling Groq Vision API for proof via Axios (Max Payload Focus)...");
    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.2-11b-vision-preview',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 150
    }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    console.log("Groq Vision API Response (Proof) received.");
    
    try {
      const result = typeof data.choices[0].message.content === 'string' 
        ? JSON.parse(data.choices[0].message.content) 
        : data.choices[0].message.content;
      return res.json(result);
    } catch (e) {
      console.error("JSON Parse Error on Proof AI response content:", data.choices[0].message.content);
      return res.json({ valid: false, reason: "AI response error. Please try again." });
    }
  } catch (error) {
    console.error("CRITICAL Verification Error (Axios Version):", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Verification failed.", 
      details: error.response?.data?.error?.message || error.message 
    });
  }
};

module.exports = { verifyImage, translateVoiceText, verifyCompletionProof };
