document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('profile-name').textContent = user.name;

  const collKey    = getUserStorageKey('collection');
  const wishKey    = getUserStorageKey('wishlist');
  const collection = collKey ? JSON.parse(localStorage.getItem(collKey) || '[]') : [];
  const wishlist   = wishKey ? JSON.parse(localStorage.getItem(wishKey)  || '[]') : [];

  document.getElementById('collection-count').textContent = collection.length;
  document.getElementById('wishlist-count').textContent   = wishlist.length;

  document.getElementById('logout-btn').addEventListener('click', logout);
});
