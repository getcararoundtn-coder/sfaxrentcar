const fetch = require('node-fetch'); // قد تحتاج لتثبيتها: npm install node-fetch

(async () => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: '123456' })
  });
  const data = await res.json();
  console.log(data);
})();