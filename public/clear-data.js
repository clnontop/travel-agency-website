
// Clear all customer data from localStorage
console.log('🧹 Clearing all customer data...');

// Clear user data
localStorage.removeItem('trink_users');
localStorage.removeItem('trink_current_user');

// Clear auth data
localStorage.removeItem('auth_token');
localStorage.removeItem('user_session');

// Clear any other Trink-related data
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('trink_') || key.startsWith('auth_') || key.startsWith('user_')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ All customer data cleared successfully!');
console.log('You can now register with the same email address.');
