const http = require('http');

let total = 0;
let pages = 0;

function fetchPage(cursor = '') {
  const url = `http://localhost:5000/api/quizzes/public?limit=12${cursor ? '&cursor=' + encodeURIComponent(cursor) : ''}`;
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      total += parsed.quizzes?.length || 0;
      pages++;
      console.log(`Page ${pages}: Got ${parsed.quizzes?.length || 0} quizzes. Next cursor: ${parsed.nextCursor}`);
      
      if (parsed.hasNextPage && pages < 5) {
        fetchPage(parsed.nextCursor);
      } else {
        console.log(`Finished testing. Total so far: ${total}`);
      }
    });
  }).on('error', (err) => console.log('Error: ' + err.message));
}

fetchPage();
