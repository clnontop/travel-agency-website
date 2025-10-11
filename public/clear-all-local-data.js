// This script will clear all localStorage data and reset wallet balances to 0 for all users on next page load.
(function() {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    // Optionally, you can reload the page after clearing
    window.location.reload();
  }
})();
