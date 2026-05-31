/*
   Happy Anniversary & I Love You Static Server
   Pure Node.js static file server (Zero dependencies required!)
*/

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  // รับมือกับ URL parameter เช่น ?v=1
  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>ไม่พบหน้าเว็บที่คุณต้องการ (404 Not Found)</h1>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>เซิร์ฟเวอร์ขัดข้อง: ${error.code}</h1>`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(`💖 เว็บไซต์บอกรักแฟนของคุณเริ่มทำงานแล้ว!`);
  console.log(`🔗 เข้าดูในเครื่องคอมพิวเตอร์ของคุณเองได้ที่: http://localhost:${PORT}/`);
  console.log('======================================================\n');
  console.log('🌟 [วิธีแชร์ลิงก์สาธารณะให้คนอื่น/แฟนเข้าชมจากข้างนอกได้ทันที]:');
  console.log('เปิด Terminal เครื่องคุณขึ้นมาอีกหน้าต่างหนึ่ง (ไม่ต้องปิดหน้านี้) แล้วรันคำสั่ง:');
  console.log(`\x1b[36mnpx localtunnel --port ${PORT}\x1b[0m`);
  console.log('\nระบบจะส่งลิงก์สาธารณะ (HTTPS) มาให้คุณ ซึ่งสามารถนำลิงก์นั้นไปส่งให้แฟนของคุณกดเข้าจากมือถือได้ทันทีครับ! 🥰\n');

  // เปิดเว็บเบราว์เซอร์อัตโนมัติบนเครื่อง Mac
  exec(`open http://localhost:${PORT}/`);
});
