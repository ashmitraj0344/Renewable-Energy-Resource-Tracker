// Vercel Speed Insights initialization
// This script injects the Speed Insights tracking code
(function() {
  // Initialize the queue for Speed Insights
  if (window.si) return;
  
  window.si = function() {
    (window.siq = window.siq || []).push(arguments);
  };

  // Load the Speed Insights script
  const script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '2.0.0';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if deployed on Vercel.');
  };
  
  document.head.appendChild(script);
})();
