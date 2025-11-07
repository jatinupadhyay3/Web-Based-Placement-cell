
// script.js — shared logic for all pages (frontend only)
const uid = () => 'id_' + Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString();
const STORAGE_KEY = 'pc_site_v2';

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function ensureDefaults() {
  let data = loadData();
  if (!data) {
    const admin = { id: uid(), role: 'Admin', name: 'Admin', email: 'admin@college.edu', password: 'admin123' };
    const comp = { id: uid(), role: 'Company', name: 'BlueSoft', email: 'hr@bluesoft.com', password: 'comp123', logo: 'assets/company1.svg' };
    const student = { id: uid(), role: 'Student', name: 'Rohit Sharma', email: 'rohit@college.edu', password: 'stud123', branch: 'CSE', year: '3', skills: ['javascript', 'html', 'css'] };
    const jobs = [
      { id: uid(), companyId: comp.id, title: 'Frontend Developer Intern', desc: 'Work on UI components and web pages', type: 'Internship', ctc: 0, skills: ['html', 'css', 'javascript'], logo: comp.logo, createdAt: today() },
      { id: uid(), companyId: comp.id, title: 'Junior Web Developer', desc: 'Full-time role building SPA', type: 'Full-Time', ctc: 350000, skills: ['javascript', 'react'], logo: comp.logo, createdAt: today() }
    ];
    data = { users: [admin, comp, student], jobs: jobs, applications: [] };
    saveData(data);
  }
}
ensureDefaults();

// session
function currentUser() {
  const s = localStorage.getItem('pc_user');
  if (!s) return null;
  try { const obj = JSON.parse(s); const data = loadData(); return data.users.find(u => u.id === obj.id) || null; } catch (e) { return null; }
}
function setCurrentUser(user) { localStorage.setItem('pc_user', JSON.stringify({ id: user.id })); }
function clearCurrentUser() { localStorage.removeItem('pc_user'); }

// helpers
function el(q) { return document.querySelector(q); }
function els(q) { return Array.from(document.querySelectorAll(q)); }
function escapeHtml(s = '') { return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }

// page: index.html
function renderHome() {
  const data = loadData();
  const jobs = data.jobs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const container = el('#home-jobs');
  if (!container) return;
  container.innerHTML = '';
  jobs.slice(0, 6).forEach(j => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${escapeHtml(j.logo || 'assets/company1.svg')}" style="width:56px;height:56px;border-radius:10px;object-fit:cover">
        <div style="flex:1">
          <strong>${escapeHtml(j.title)}</strong>
          <div class="small">${escapeHtml(j.desc)}</div>
          <div class="job-meta">${escapeHtml(j.type)} • ${j.ctc > 0 ? '₹ ' + j.ctc.toLocaleString() : 'Stipend'}</div>
        </div>
        <div><button class="btn btn-primary" onclick="goToPlacement()">View</button></div>
      </div>
    `;
    container.appendChild(div);
  });
}

// navigation helpers
function goToPlacement() { window.location.href = 'placement.html'; }
function goToLogin() { window.location.href = 'login.html'; }
function goToRegister() { window.location.href = 'register.html'; }
function goToHome() { window.location.href = 'index.html'; }

// login/register logic
function handleLoginForm() {
  const form = el('#login-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = el('#login-email').value.trim();
    const pw = el('#login-password').value;
    const data = loadData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pw);
    if (!user) { alert('Invalid credentials'); return; }
    setCurrentUser(user);
    alert('Logged in as ' + user.name);
    // redirect based on role
    if (user.role === 'Admin') window.location.href = 'admin.html';
    else window.location.href = 'placement.html';
  });
}

function handleRegisterForm() {
  const form = el('#reg-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.querySelector('input[name="role"]:checked').value;
    const name = el('#reg-name').value.trim();
    const email = el('#reg-email').value.trim();
    const pw = el('#reg-password').value;
    if (!name || !email || !pw) { alert('Fill required fields'); return; }
    const data = loadData();
    if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) { alert('Email already registered'); return; }
    const user = { id: uid(), role, name, email, password: pw };
    if (role === 'Student') { user.branch = el('#reg-branch').value; user.year = el('#reg-year').value; user.skills = (el('#reg-skills').value || '').split(',').map(s => s.trim()).filter(Boolean); }
    else { user.companyProfile = ''; user.logo = 'assets/company1.svg'; }
    data.users.push(user);
    saveData(data);
    alert('Registration successful. Please login.');
    window.location.href = 'login.html';
  });
}

// placement page
function renderPlacement() {
  const data = loadData();
  const container = el('#jobs-grid');
  if (!container) return;
  container.innerHTML = '';
  data.jobs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(j => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${escapeHtml(j.logo || 'assets/company1.svg')}" style="width:56px;height:56px;border-radius:10px;object-fit:cover">
        <div style="flex:1">
          <strong>${escapeHtml(j.title)}</strong>
          <div class="small">${escapeHtml(j.desc)}</div>
          <div class="job-meta">${escapeHtml(j.type)} • ${j.ctc > 0 ? '₹ ' + j.ctc.toLocaleString() : 'Stipend'}</div>
          <div class="small">Skills: ${escapeHtml((j.skills || []).join(', '))}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary" onclick="applyForJob('${j.id}')">Apply</button>
          <button class="btn" onclick="viewCompany('${j.companyId}')">Company</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function applyForJob(jobId) {
  const user = currentUser();
  if (!user) { if (confirm('You must login to apply. Go to login?')) goToLogin(); return; }
  if (user.role !== 'Student') { alert('Only students can apply'); return; }
  const data = loadData();
  if (data.applications.some(a => a.jobId === jobId && a.studentId === user.id)) { alert('Already applied'); return; }
  data.applications.push({ id: uid(), jobId, studentId: user.id, appliedAt: today(), status: 'Applied' });
  saveData(data);
  alert('Application submitted');
}

// admin page render
function renderAdmin() {
  const data = loadData();
  const stuC = el('#admin-students'); const compC = el('#admin-companies'); const jobsC = el('#admin-jobs');
  if (!stuC) return;
  stuC.innerHTML = ''; compC.innerHTML = ''; jobsC.innerHTML = '';
  data.users.filter(u => u.role === 'Student').forEach(s => {
    const tr = document.createElement('div'); tr.className = 'card'; tr.style.marginBottom = '8px';
    tr.innerHTML = `<strong>${escapeHtml(s.name)}</strong><div class="small">${escapeHtml(s.email)} • ${escapeHtml(s.branch || '')}</div><div style="margin-top:8px"><button class="btn" onclick="deleteUser('${s.id}')">Delete</button></div>`;
    stuC.appendChild(tr);
  });
  data.users.filter(u => u.role === 'Company').forEach(c => {
    const tr = document.createElement('div'); tr.className = 'card'; tr.style.marginBottom = '8px';
    tr.innerHTML = `<strong>${escapeHtml(c.name)}</strong><div class="small">${escapeHtml(c.email)}</div><div style="margin-top:8px"><button class="btn" onclick="deleteUser('${c.id}')">Delete</button></div>`;
    compC.appendChild(tr);
  });
  data.jobs.forEach(j => {
    const tr = document.createElement('div'); tr.className = 'card'; tr.style.marginBottom = '8px';
    const comp = data.users.find(u => u.id === j.companyId) || { name: 'Unknown' };
    tr.innerHTML = `<strong>${escapeHtml(j.title)}</strong><div class="small">${escapeHtml(comp.name)} • ${escapeHtml(j.type)}</div><div style="margin-top:8px"><button class="btn" onclick="deleteJob('${j.id}')">Delete Job</button></div>`;
    jobsC.appendChild(tr);
  });
}

// admin actions
function deleteUser(uidToDelete) {
  if (!confirm('Delete this user?')) return;
  const data = loadData();
  data.users = data.users.filter(u => u.id !== uidToDelete);
  data.jobs = data.jobs.filter(j => j.companyId !== uidToDelete);
  data.applications = data.applications.filter(a => a.studentId !== uidToDelete);
  saveData(data); renderAdmin(); alert('Deleted');
}
function deleteJob(jobId) {
  if (!confirm('Delete job?')) return;
  const data = loadData();
  data.jobs = data.jobs.filter(j => j.id !== jobId);
  data.applications = data.applications.filter(a => a.jobId !== jobId);
  saveData(data); renderAdmin(); alert('Job deleted');
}

// small helpers for pages
function viewCompany(cid) {
  const data = loadData();
  const c = data.users.find(u => u.id === cid);
  if (c) alert('Company: ' + c.name + '\\nEmail: ' + c.email);
}

// on DOM ready, call page-specific initializers
document.addEventListener('DOMContentLoaded', () => {
  ensureDefaults();
  const page = document.body.dataset.page;
  // simple nav buttons
  const loginBtn = document.getElementById('nav-login'); if (loginBtn) loginBtn.addEventListener('click', () => goToLogin());
  const registerBtn = document.getElementById('nav-register'); if (registerBtn) registerBtn.addEventListener('click', () => goToRegister());
  const homeBtn = document.getElementById('nav-home'); if (homeBtn) homeBtn.addEventListener('click', () => goToHome());
  const logoutBtn = document.getElementById('nav-logout'); if (logoutBtn) logoutBtn.addEventListener('click', () => { clearCurrentUser(); alert('Logged out'); goToHome(); });

  const user = currentUser();
  const navUser = document.getElementById('nav-user'); if (navUser) navUser.textContent = user ? (user.name + ' (' + user.role + ')') : 'Guest';

  if (page === 'home') { renderHome(); }
  else if (page === 'login') { handleLoginForm(); }
  else if (page === 'register') { handleRegisterForm(); }
  else if (page === 'placement') { renderPlacement(); }
  else if (page === 'admin') { renderAdmin(); }
});
