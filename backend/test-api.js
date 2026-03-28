const axios = require('axios');

async function run() {
  try {
    let token;
    try {
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@citizen.care',
        password: 'admin'
      });
      token = loginRes.data.token;
    } catch(e) {
      const loginRes2 = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@citizen.care',
        password: 'admin123'
      });
      token = loginRes2.data.token;
    }

    const { data: analytics } = await axios.get('http://localhost:5000/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Analytics Officer Performance:");
    console.log(JSON.stringify(analytics.officerPerformance, null, 2));

    const { data: officers } = await axios.get('http://localhost:5000/api/admin/officers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("\nOfficers List:");
    console.log(JSON.stringify(officers.map(o => ({ _id: o._id, name: o.name, performance: o.performance })), null, 2));
    
    const { data: complaints } = await axios.get('http://localhost:5000/api/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("\nComplaints:");
    console.log(JSON.stringify(complaints.map(c => ({ id: c.complaintId, status: c.status, history: c.statusHistory })), null, 2));

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
