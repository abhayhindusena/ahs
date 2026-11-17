// Abhay Hindu Sena — Dedicated Subpage Redirect Gatekeeper
// Only 'join' is publicly accessible. All other subpages redirect immediately to /join.
(function() {
  'use strict';

  // Check if current page is already join
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath.includes('join')) {
    return;
  }

  // Admin Preview Mode: allow browsing if explicitly requested by admin
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get('preview') === 'true' || sessionStorage.getItem('ahs_preview_bypass') === 'true';

  if (isPreview) {
    try { sessionStorage.setItem('ahs_preview_bypass', 'true'); } catch(e) {}
    return;
  }

  // Public Visitors: Immediately hide document and redirect straight to join page
  document.documentElement.style.display = 'none';
  window.location.replace('https://abhayhindusena.org.in/join');
})();
