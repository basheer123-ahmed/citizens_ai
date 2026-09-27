const axios = require('axios');
require('dotenv').config();

const testVoiceChat = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/complaints/voice-chat', {
            text: "hi",
            context: JSON.stringify({}),
            lang: "en-IN"
        }, {
            headers: {
                'Authorization': 'Bearer ' + 'FAKE_TOKEN' // I need a real token or I should bypass auth for test
            }
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};

// Instead of calling the endpoint, let's just try to call Groq directly to see if the key/fetch works
const testGroq = async () => {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                response_format: { type: "json_object" },
                messages: [{ role: 'user', content: 'Say {"hello": "world"}' }],
                temperature: 0
            })
        });
        const data = await response.json();
        console.log("Groq Response:", data);
    } catch (error) {
        console.error("Groq Error:", error.message);
    }
}

testGroq();
