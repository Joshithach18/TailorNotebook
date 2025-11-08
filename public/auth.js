(function () {
  function isLoggedIn() {
    return !!localStorage.getItem('tn_token');
  }
  function showAuthUI() {
    const userName = document.getElementById('user-name');
    const btnLogout = document.getElementById('btn-logout');
    if (!userName || !btnLogout) return;
    if (isLoggedIn()) {
      const storedName = localStorage.getItem('tn_user_name');
      userName.textContent = storedName || 'User';
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('tn_token');
        localStorage.removeItem('tn_user_name');
        window.location.href = '/login.html';
      });
    }
  }
  window.getAuthHeaders = function () {
    const token = localStorage.getItem('tn_token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }
  document.addEventListener('DOMContentLoaded', showAuthUI);
})();