const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Static images folder support
const IMAGES_DIR = path.join(__dirname, 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);
app.use('/images', express.static(IMAGES_DIR));

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.random().toString(36).substring(2) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

const PORT = process.env.PORT || 3000;

// --- Products ---
app.get('/api/products', (req, res) => {
  const { q, category } = req.query;
  let sql = "SELECT * FROM products";
  const params = [];
  const where = [];
  if (q) {
    where.push("name LIKE ?");
    params.push(`%${q}%`);
  }
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, price, stock, img, category, model } = req.body;
  db.run("INSERT INTO products (name, price, stock, img, category, model) VALUES (?, ?, ?, ?, ?, ?)", [name, price, stock, img, category, model || ''], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, price, stock, img, category, model: model || '' });
  });
});

app.put('/api/products/:id/stock', (req, res) => {
  const { stock } = req.body;
  db.run("UPDATE products SET stock = ? WHERE id = ?", [stock, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Upload product image
app.post('/api/upload/product', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/upload/model', upload.single('model'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

app.post('/api/products/clear-samples', (req, res) => {
  const names = [
    'Cyber Punk Hoodie',
    'Glitch Tee',
    'Neon Cargo Pants',
    'Matrix Shades',
    'Void Sneakers',
    'Techwear Vest'
  ];
  const placeholders = names.map(() => '?').join(',');
  db.run(`DELETE FROM products WHERE name IN (${placeholders})`, names, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

// --- Auth ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const u = (username || '').trim();
  const p = (password || '').trim();
  db.get("SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?", [u, p], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) {
      res.json({ username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const u = (username || '').trim();
  const p = (password || '').trim();
  if (!u || !p) return res.status(400).json({ error: 'Username and password required' });
  db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'user')", [u.toLowerCase(), p], function(err) {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.json({ success: true });
  });
});

// --- Orders ---
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse items JSON back to object
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    res.json(orders);
  });
});

app.post('/api/orders', (req, res) => {
  const { user, items, total, address, phone, payment_method, slip } = req.body;
  const date = new Date().toLocaleDateString();
  const status = 'Paid';
  const itemsJson = JSON.stringify(items);

  db.run("INSERT INTO orders (user_id, date, total, status, items, address, phone, payment_method, slip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [user, date, total, status, itemsJson, address || '', phone || '', payment_method || 'transfer', slip || ''], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update Stock
      items.forEach(item => {
        db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.id]);
      });

      res.json({ success: true, orderId: this.lastID });
    }
  );
});

// Update order status (admin)
app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const id = req.params.id;
  if (!status) return res.status(400).json({ error: 'Missing status' });
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updated: this.changes });
  });
});

// Upload payment slip
app.post('/api/upload/slip', upload.single('slip'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.get('/api/users', (req, res) => {
  db.all("SELECT username, role FROM users ORDER BY username ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/upload/chat', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, name: req.file.originalname, type: req.file.mimetype });
});

app.get('/api/chat/messages', (req, res) => {
  const { user, peer } = req.query;
  if (!user || !peer) return res.status(400).json({ error: 'Missing user or peer' });
  db.all(
    "SELECT * FROM messages WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?) ORDER BY id ASC",
    [user, peer, peer, user],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/chat/send', (req, res) => {
  const { from, to, text, attachment, attachment_name, attachment_type } = req.body || {};
  if (!from || !to) return res.status(400).json({ error: 'Missing from/to' });
  const created_at = new Date().toISOString();
  db.run(
    "INSERT INTO messages (from_user, to_user, text, attachment, attachment_name, attachment_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [from, to, text || '', attachment || '', attachment_name || '', attachment_type || '', created_at],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, from, to, text: text || '', attachment: attachment || '', attachment_name: attachment_name || '', attachment_type: attachment_type || '', created_at });
    }
  );
});

// List images in server/images
app.get('/api/images', (req, res) => {
  fs.readdir(IMAGES_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const list = files.filter(name => /\.(png|jpg|jpeg|gif|webp)$/i.test(name));
    res.json(list);
  });
});

// Categories list
app.get('/api/categories', (req, res) => {
  db.all("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> ''", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.category));
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const { messages, question } = req.body || {};
  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback if no API Key
  if (!apiKey) {
    const userQ = question || (messages && messages.length ? messages[messages.length-1].content : '') || '';
    const lowerQ = userQ.toLowerCase();
    
    let reply = "ระบบ AI ทำงานในโหมดพื้นฐาน (ไม่มี API Key) \n";

    if (lowerQ.includes('สินค้า') || lowerQ.includes('product') || lowerQ.includes('ขาย') || lowerQ.includes('list') || lowerQ.includes('มีอะไร')) {
       return db.all("SELECT name, price, stock FROM products ORDER BY id DESC LIMIT 5", [], (err, rows) => {
         if (err) return res.json({ ok: true, text: "ขออภัย ไม่สามารถดึงข้อมูลสินค้าได้" });
         const list = rows.map(r => `- ${r.name} (ราคา: ${r.price} บาท, คงเหลือ: ${r.stock})`).join('\n');
         res.json({ ok: true, text: `รายการสินค้าล่าสุด:\n${list}\n\nคุณสามารถดูสินค้าทั้งหมดได้ที่หน้า Shop` });
       });
    } else if (lowerQ.includes('สั่ง') || lowerQ.includes('buy') || lowerQ.includes('order') || lowerQ.includes('ทำไง')) {
      reply += "วิธีการสั่งซื้อ: เลือกสินค้าลงตะกร้า -> ไปที่ Cart -> กด Checkout -> แนบสลิปโอนเงิน";
    } else if (lowerQ.includes('สวัสดี') || lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('ทัก')) {
      reply += "สวัสดีครับ! ยินดีต้อนรับสู่ร้านค้าของเรา มีอะไรให้ช่วยไหมครับ?";
    } else {
      reply += "ฉันสามารถตอบคำถามเกี่ยวกับ 'สินค้า' หรือ 'การสั่งซื้อ' ได้ครับ ลองถามดูสิ!";
    }
    
    return res.json({ ok: true, text: reply });
  }

  const msg = messages && Array.isArray(messages) && messages.length ? messages : [{ role: 'user', content: String(question || '').slice(0, 2000) || 'Hello' }];
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...msg],
        temperature: 0.7
      })
    });
    const data = await r.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content : '';
    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ error: 'AI request failed' });
  }
});

// Serve static files from the React frontend app
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Only listen if run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
