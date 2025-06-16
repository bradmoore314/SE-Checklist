// Debug script to clear all gateway calculator data
console.log("Clearing all gateway calculator storage...");

// Clear localStorage
const localKeys = Object.keys(localStorage);
localKeys.forEach(key => {
  if (key.includes('gateway') || key.includes('camera') || key.includes('Calculator')) {
    localStorage.removeItem(key);
    console.log('Removed localStorage:', key);
  }
});

// Clear sessionStorage
const sessionKeys = Object.keys(sessionStorage);
sessionKeys.forEach(key => {
  if (key.includes('gateway') || key.includes('camera') || key.includes('Calculator')) {
    sessionStorage.removeItem(key);
    console.log('Removed sessionStorage:', key);
  }
});

// Clear all React Query cache
if (window.queryClient) {
  window.queryClient.clear();
  console.log('Cleared React Query cache');
}

console.log("Storage cleared, please refresh the page");