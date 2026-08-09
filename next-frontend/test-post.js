const fs = require('fs');

async function testPost() {
  try {
    const response = await fetch('http://localhost:5000/api/picture-races', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: "Test Node Fetch",
        questions: [{ image_url: "data:image/png;base64,A==", answer: "Red", crop_data: {} }]
      }),
      redirect: 'manual'
    });
    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
testPost();
