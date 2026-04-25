const USER_KEY = 'kortkammer_user';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function login() {
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 'test-user', name: 'Testbruker' }));
  window.location.reload();
}

function logout() {
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html';
}

function getUserStorageKey(type) {
  const user = getUser();
  if (!user || !user.id) return null;
  return 'kortkammer_' + type + '_' + user.id;
}

function initNav() {
  const el = document.getElementById('nav-auth');
  if (!el) return;
  const user = getUser();
  if (user) {
    el.innerHTML = '<a href="profile.html" class="nav-auth-link">Min profil</a>';
  } else {
    el.innerHTML = '<button class="nav-auth-link" onclick="login()">Logg inn</button>';
  }
}

function initTheme() {
  const btn = document.querySelector('.nav-icon-btn[aria-label="Bytt tema"]');
  if (!btn) return;
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  btn.textContent = current === 'dark' ? '☀️' : '🌙';
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kortkammer_theme', next);
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTheme();
});
