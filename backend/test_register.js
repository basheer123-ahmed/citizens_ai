const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Testing Error',
      email: `test_staff_${Date.now()}@gmail.com`,
      phone: '1234567890',
      password: 'password123',
      dob: '2026-04-22',
      role: 'STAFF'
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('ERROR STATUS:', err.response.status);
      console.log('ERROR DATA:', err.response.data);
    } else {
      console.log('ERROR:', err.message);
    }
  }
}

test();
