async function testChat() {
  try {
    const res = await fetch('http://localhost:5000/api/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ message: 'Help me report a pothole' })
    });
    const data = await res.json();
    console.log('Chat Reply:', data.reply);
  } catch (err) {
    console.error('Chat API Error:', err.message);
  }
}
testChat();
