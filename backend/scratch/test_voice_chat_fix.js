const axios = require('axios');
require('dotenv').config();

const testVoiceChatFunction = async () => {
    try {
        console.log("Testing voiceChat integration...");
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            response_format: { type: "json_object" },
            messages: [
                { role: 'system', content: 'You are a Friendly Civic Grievance Assistant. Respond in English. Your output MUST be a valid JSON object with assistant_response, updated_grievance, map_search_query, current_step, completion_percentage, is_complete.' },
                { role: 'user', content: 'Citizen says: "hi"' }
            ],
            temperature: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            }
        });
        console.log("Status:", response.status);
        console.log("Content:", response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};

testVoiceChatFunction();
