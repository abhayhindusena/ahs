// Abhay Hindu Sena — Universal Launch Gatekeeper for Subpages
// Blocks public access to subpages when website status is 'prelaunch' or 'maintenance'
(function() {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get('preview') === 'true' || sessionStorage.getItem('ahs_preview_bypass') === 'true';

  if (isPreview) {
    // Admin Preview Mode: allow browsing and display top preview banner
    try { sessionStorage.setItem('ahs_preview_bypass', 'true'); } catch(e) {}
    
    window.addEventListener('DOMContentLoaded', function() {
      // Ensure all internal links maintain preview=true
      document.querySelectorAll('a[href$=".html"]').forEach(function(a) {
        const href = a.getAttribute('href');
        if (href && !href.includes('admin.html') && !href.includes('preview=true')) {
          a.setAttribute('href', href + (href.includes('?') ? '&preview=true' : '?preview=true'));
        }
      });

      // Top preview banner
      const bar = document.createElement('div');
      bar.id = 'adminPreviewSubpageBar';
      bar.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:99999999; background:linear-gradient(90deg, #7A0C0C, #FF6B1A); color:#fff; padding:7px 18px; font-size:12px; font-weight:600; text-align:center; display:flex; justify-content:space-between; align-items:center; box-shadow:0 3px 12px rgba(0,0,0,0.6); font-family:system-ui, sans-serif;';
      bar.innerHTML = '<span>👁️ <strong>Admin Preview Active:</strong> Website is currently NOT RELEASED to the public.</span>' +
        '<div style="display:flex; gap:10px; align-items:center;">' +
        '<a href="index.html" style="color:#FFF; background:rgba(0,0,0,0.4); padding:3px 10px; border-radius:4px; text-decoration:none; font-size:11px;">🔒 See Curtain</a>' +
        '<a href="admin.html" style="color:#FFD700; background:rgba(0,0,0,0.4); padding:3px 10px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700;">⚙️ Dashboard</a>' +
        '</div>';
      document.body.prepend(bar);
      document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || '0', 10) + 34) + 'px';
    });
    return;
  }

  // Regular Visitor Mode:
  const cachedStatus = localStorage.getItem('ahs_launch_status');

  // If status is NOT confirmed 'launched' (i.e. 'prelaunch', 'maintenance', or null),
  // immediately hide page and redirect to index.html where the Inauguration Curtain is shown!
  if (cachedStatus !== 'launched') {
    document.documentElement.style.display = 'none';
    window.location.replace('index.html');
    return;
  }

  // Even if cache says 'launched', verify with Firestore in background
  fetch('https://firestore.googleapis.com/v1/projects/abhay-hindu-sena-org/databases/(default)/documents/videos/site_launch_status')
    .then(function(res) { return res.json(); })
    .then(function(doc) {
      if (doc && doc.fields && doc.fields.status) {
        const liveStatus = doc.fields.status.stringValue || 'prelaunch';
        localStorage.setItem('ahs_launch_status', liveStatus);
        if (liveStatus !== 'launched') {
          document.documentElement.style.display = 'none';
          window.location.replace('index.html');
        }
      }
    })
    .catch(function() {});

  // Listen to multi-tab BroadcastChannel
  try {
    const ch = new BroadcastChannel('ahs_launch_control');
    ch.onmessage = function(e) {
      if (!e.data) return;
      if (e.data.action === 'countdown_start' || (e.data.status && e.data.status !== 'launched')) {
        document.documentElement.style.display = 'none';
        window.location.replace('index.html');
      }
    };
  } catch(e) {}
})();
