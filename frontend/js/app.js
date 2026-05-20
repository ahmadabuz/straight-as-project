/* =====================================================
   Straight A's — Frontend Application Logic
   Handles: API calls, rendering, auth, filtering
   ===================================================== */

const API = 'http://localhost:5000/api';

// ========== STATE ==========
let allMaterials = [];
let allCategories = [];
let allUniversities = [];
let activeCategory = null;
let activeUniversity = null;
let searchQuery = '';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  loadUniversities();
  loadCategories();
  loadMaterials();
  checkAuth();
  setupNav();
});

// ========== PASSWORD TOGGLE FUNCTION ==========
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
  }
}

// ========== DATA LOADING ==========
async function loadUniversities() {
  try {
    const res = await fetch(`${API}/universities`);
    allUniversities = await res.json();
    renderUniversities();
    populateUniversityDropdown();
  } catch (e) {
    console.log('Backend not running — using demo data for universities');
    allUniversities = [
      { id: 1, name: 'University of Jordan (UJ)' },
      { id: 2, name: 'Jordan University of Science and Technology (JUST)' },
      { id: 3, name: 'Princess Sumaya University for Technology (PSUT)' },
      { id: 4, name: 'German Jordanian University (GJU)' },
      { id: 5, name: 'Yarmouk University' },
      { id: 6, name: 'Hashemite University' },
      { id: 7, name: 'Al-Balqa Applied University (BAU)' },
      { id: 8, name: 'Philadelphia University' },
    ];
    renderUniversities();
    populateUniversityDropdown();
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API}/categories`);
    allCategories = await res.json();
    renderCategories();
  } catch (e) {
    console.log('Backend not running — using demo data for categories');
    allCategories = [
      { id: 1, name: 'Programming Fundamentals' },
      { id: 2, name: 'Data Structures & Algorithms' },
      { id: 3, name: 'Database Management' },
      { id: 4, name: 'Web Development' },
      { id: 5, name: 'Cybersecurity' },
      { id: 6, name: 'Software Engineering' },
      { id: 7, name: 'Computer Networks' },
      { id: 8, name: 'Operating Systems' },
      { id: 9, name: 'Cloud Computing' },
      { id: 10, name: 'Artificial Intelligence' },
    ];
    renderCategories();
  }
}

async function loadMaterials() {
  try {
    const url = searchQuery
      ? `${API}/materials?search=${encodeURIComponent(searchQuery)}`
      : `${API}/materials`;
    const res = await fetch(url);
    allMaterials = await res.json();
    renderMaterials();
  } catch (e) {
    console.log('Backend not running — using demo data for materials');
    allMaterials = [
      { id: 1, title: 'Introduction to Python Programming', description: 'Complete beginner\'s guide to Python covering basics, data types, control structures, and functions.', type: 'video', category_name: 'Programming Fundamentals', university_name: 'University of Jordan (UJ)', course_code: 'CS101', views: 1250, uploader_name: 'Dr. Ahmad Hassan', url: 'https://youtube.com/watch?v=example1' },
      { id: 2, title: 'Data Structures & Algorithms', description: 'Comprehensive coverage of essential data structures including arrays, linked lists, trees, and graphs.', type: 'video', category_name: 'Data Structures & Algorithms', university_name: 'Jordan University of Science and Technology (JUST)', course_code: 'CS201', views: 2100, uploader_name: 'Prof. Sarah Ali', url: 'https://youtube.com/watch?v=example2' },
      { id: 3, title: 'Web Development with React', description: 'Modern web development using React, including hooks, state management, and component architecture.', type: 'video', category_name: 'Web Development', university_name: 'Princess Sumaya University for Technology (PSUT)', course_code: 'WEB301', views: 890, uploader_name: 'Dr. Ahmad Hassan', url: 'https://youtube.com/watch?v=example3' },
      { id: 4, title: 'Cybersecurity Fundamentals', description: 'Introduction to cybersecurity principles, encryption, network security, and ethical hacking basics.', type: 'video', category_name: 'Cybersecurity', university_name: 'University of Jordan (UJ)', course_code: 'SEC401', views: 1560, uploader_name: 'Prof. Sarah Ali', url: 'https://youtube.com/watch?v=example4' },
    ];
    renderMaterials();
  }
}

// ========== RENDERING ==========
function getAbbr(name) {
  const match = name.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').toUpperCase().slice(0, 3);
}

function renderUniversities() {
  const grid = document.getElementById('universityGrid');
  if (!grid) return;
  grid.innerHTML = allUniversities.map(u => `
    <div class="university-card ${activeUniversity === u.name ? 'active' : ''}" onclick="filterByUniversity('${u.name.replace(/'/g, "\\'")}')">
      <div class="icon">🎓</div>
      <div class="abbr">${getAbbr(u.name)}</div>
      <div class="name">${u.name.replace(/\s*\([^)]*\)/, '')}</div>
    </div>
  `).join('');
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  if (!list) return;
  list.innerHTML = `<li class="${!activeCategory ? 'active' : ''}" onclick="filterByCategory(null)">All Categories</li>` +
    allCategories.map(c => `<li class="${activeCategory === c.name ? 'active' : ''}" onclick="filterByCategory('${c.name.replace(/'/g, "\\'")}')">${c.name}</li>`).join('');
}

function renderMaterials() {
  const grid = document.getElementById('materialsGrid');
  const count = document.getElementById('materialsCount');
  if (!grid) return;

  let filtered = allMaterials;
  if (activeCategory) filtered = filtered.filter(m => m.category_name === activeCategory);
  if (activeUniversity) filtered = filtered.filter(m => m.university_name === activeUniversity);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.course_code || '').toLowerCase().includes(q) ||
      (m.category_name || '').toLowerCase().includes(q)
    );
  }

  if (count) count.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray-400);grid-column:1/-1;text-align:center;padding:3rem;">No materials found. Try a different filter.</p>';
    return;
  }

  const typeIcons = { video: '📹', document: '📄', slides: '📊', exercise: '✏️' };

  grid.innerHTML = filtered.map(m => `
    <div class="material-card" onclick="window.location.href='courses.html?id=${m.id}'">
      <div class="card-top">
        <span class="badge badge-type">${typeIcons[m.type] || '📹'} ${m.type || 'Video'}</span>
        <span class="badge badge-category">${m.category_name || 'General'}</span>
      </div>
      <div class="card-title">${escapeHtml(m.title)}</div>
      <div class="card-desc">${escapeHtml(m.description || '')}</div>
      <div class="card-meta">
        <span><span class="uni">${getAbbr(m.university_name || '')}</span> ${m.course_code || ''}</span>
        <span class="views">👁 ${(m.views || 0).toLocaleString()}</span>
      </div>
      <div class="card-uploader">By ${escapeHtml(m.uploader_name || 'Unknown')}</div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== FILTERING ==========
function filterByCategory(name) {
  activeCategory = name;
  renderCategories();
  renderMaterials();
}

function filterByUniversity(name) {
  activeUniversity = activeUniversity === name ? null : name;
  renderUniversities();
  renderMaterials();
}

async function handleSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  searchQuery = input.value.trim();

  if (!searchQuery) {
    renderMaterials();
    return;
  }

  try {
    const res = await fetch(`${API}/materials?search=${encodeURIComponent(searchQuery)}`);
    if (res.ok) {
      allMaterials = await res.json();
    }
  } catch (e) {
    // backend not running — filter existing allMaterials client-side
  }
  renderMaterials();
}

// Search on Enter key
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'heroSearch') handleSearch();
});

// ========== AUTHENTICATION (UPDATED WITH PASSWORD) ==========
function openModal(type) {
  closeModals();
  document.getElementById(type + 'Modal').classList.add('open');
}

function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.form-message').forEach(m => { m.className = 'form-message'; m.textContent = ''; });
}

function switchModal(type) {
  closeModals();
  setTimeout(() => openModal(type), 100);
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModals();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModals();
});

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const msg = document.getElementById('loginMsg');

  if (!email || !password) {
    msg.className = 'form-message error';
    msg.textContent = 'Please enter both email and password.';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const user = await res.json();
      if (user.status === 'pending') {
        msg.className = 'form-message error';
        msg.textContent = 'Your account is still pending approval. Please wait for admin review.';
        return;
      }
      if (user.status === 'rejected') {
        msg.className = 'form-message error';
        msg.textContent = 'Your registration was rejected. Contact the administrator.';
        return;
      }
      localStorage.setItem('user', JSON.stringify(user));
      closeModals();
      checkAuth();
      document.getElementById('loginPassword').value = '';
      loadMaterials();
    } else {
      const data = await res.json();
      msg.className = 'form-message error';
      msg.textContent = data.error || 'Invalid email or password.';
    }
  } catch (err) {
    console.error('Login error:', err);
    msg.className = 'form-message error';
    msg.textContent = 'Cannot connect to server. Make sure backend is running.';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const university = document.getElementById('regUniversity').value;
  const msg = document.getElementById('registerMsg');

  if (!university) {
    msg.className = 'form-message error';
    msg.textContent = 'Please select your university.';
    return;
  }

  if (!password || password.length < 4) {
    msg.className = 'form-message error';
    msg.textContent = 'Password must be at least 4 characters long.';
    return;
  }

  try {
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'educator', university }),
    });
    const data = await res.json();

    if (res.ok) {
      msg.className = 'form-message success';
      msg.textContent = 'Registration submitted! Your account will be reviewed by an admin.';
      document.getElementById('registerForm').reset();
      document.getElementById('regPassword').value = '';
      setTimeout(() => {
        closeModals();
        openModal('login');
      }, 2000);
    } else {
      msg.className = 'form-message error';
      msg.textContent = data.error || 'Registration failed. Please try again.';
    }
  } catch (err) {
    console.error('Registration error:', err);
    msg.className = 'form-message error';
    msg.textContent = 'Cannot connect to server. Make sure backend is running.';
  }
}

function logout() {
  localStorage.removeItem('user');
  checkAuth();
  loadMaterials();
}

function checkAuth() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authBtns = document.getElementById('navAuthBtns');
  const userInfo = document.getElementById('navUserInfo');
  const userName = document.getElementById('navUserName');

  if (user) {
    if (authBtns) authBtns.style.display = 'none';
    if (userInfo) { 
      userInfo.style.display = 'inline-flex'; 
      userInfo.style.gap = '8px'; 
      userInfo.style.alignItems = 'center'; 
    }
    if (userName) userName.textContent = `Welcome, ${user.name}`;
  } else {
    if (authBtns) authBtns.style.display = 'inline-flex';
    if (userInfo) userInfo.style.display = 'none';
  }
}

function populateUniversityDropdown() {
  const select = document.getElementById('regUniversity');
  if (!select) return;
  const options = allUniversities.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
  select.innerHTML = '<option value="">Select your university</option>' + options;
}

// ========== MOBILE NAV ==========
function setupNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// Make functions globally available
window.openModal = openModal;
window.closeModals = closeModals;
window.switchModal = switchModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.filterByCategory = filterByCategory;
window.filterByUniversity = filterByUniversity;
window.handleSearch = handleSearch;
window.togglePassword = togglePassword;