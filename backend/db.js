const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'straightas.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Universities table
  db.run(`
    CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table (with university column)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT CHECK(role IN ('educator', 'admin')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      university TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  // Materials table 
  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT CHECK(type IN ('video', 'document', 'slides', 'exercise')) DEFAULT 'video',
      url TEXT,
      category_id INTEGER,
      university_id INTEGER,
      uploader_id INTEGER,
      course_code TEXT,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (university_id) REFERENCES university(id), 
      FOREIGN KEY (uploader_id) REFERENCES users(id)
    )
  `);

  // Insert default Jordanian universities
  db.get("SELECT COUNT(*) as count FROM universities", (err, row) => {
    if (err) {
      console.error('Error checking universities:', err);
      return;
    }
    if (row.count === 0) {
      const universities = [
        'University of Jordan (UJ)',
        'Jordan University of Science and Technology (JUST)',
        'Applied Science University (ASU)',
        'Hashemite University',
        'Al-Balqa Applied University (BAU)',
        'Philadelphia University',
        'Princess Sumaya University for Technology (PSUT)',
        'Al-Zaytoonah University',
        'Middle East University',
        'German Jordanian University (GJU)',
        'Amman Arab University',
        'Al-Ahliyya Amman University',
        'Isra University',
        'Petra University',
        'Tafila Technical University',
        'Al-Hussein Bin Talal University'
      ];
      
      universities.forEach(uni => {
        db.run('INSERT INTO universities (name) VALUES (?)', [uni]);
      });
      console.log('Default Jordanian universities inserted');
    }
  });

  // Insert sample categories if empty
  db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
    if (err) {
      console.error('Error checking categories:', err);
      return;
    }
    if (row.count === 0) {
      const categories = [
        ['Programming Fundamentals', 'Variables, loops, functions, and basic programming concepts'],
        ['Data Structures & Algorithms', 'Stacks, queues, trees, sorting, and searching algorithms'],
        ['Database Management', 'SQL, NoSQL, database design, and normalization'],
        ['Web Development', 'HTML, CSS, JavaScript, React, and backend frameworks'],
        ['Cybersecurity', 'Network security, encryption, ethical hacking, and risk management'],
        ['Software Engineering', 'SDLC, Agile, requirements, testing, and project management'],
        ['Computer Networks', 'OSI model, TCP/IP, routing, and network configuration'],
        ['Operating Systems', 'Process management, memory management, file systems'],
        ['Cloud Computing', 'AWS, Azure, cloud architecture, and deployment'],
        ['Artificial Intelligence', 'Machine learning, neural networks, and AI algorithms']
      ];
      
      categories.forEach(cat => {
        db.run('INSERT INTO categories (name, description) VALUES (?, ?)', cat);
      });
      console.log('Sample categories inserted');
    }
  });

  // Create default admin account
  db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
    if (err) {
      console.error('Error checking admin:', err);
      return;
    }
    if (row.count === 0) {
      db.run(
        `INSERT INTO users (name, email, role, status, university) VALUES (?, ?, ?, ?, ?)`,
        ['Administrator', 'admin@straightas.com', 'admin', 'approved', 'System']
      );
      console.log('Default admin created: admin@straightas.com');
    }
  });
});

module.exports = db;
