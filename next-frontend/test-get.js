async function testGet() {
  try {
    const response = await fetch('http://localhost:5000/api/picture-races/user/user_123');
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Body:", text);
  } catch(e) {
    console.error(e);
  }
}
testGet();
