/**
 * Global Device Reset Badge Updater
 * Updates the sidebar badge for pending device reset requests
 */

(function() {
  'use strict';

  // Only run if not on device reset page (to avoid duplicate polling)
  var isDeviceResetPage = window.location.pathname.includes('device-reset');
  if (isDeviceResetPage) return;

  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || '';

  function updateDeviceResetBadge() {
    $.ajax({
      url: API_BASE_URL + '/device-reset/pending',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN,
        'Accept': 'application/json'
      },
      success: function(response) {
        if (response.rcode === '00' && response.data) {
          var pendingCount = response.total_pending || response.data.length;
          var badgeElement = $('#device-reset-badge');
          
          if (badgeElement.length) {
            badgeElement.text(pendingCount);
            
            // Hide badge if count is 0
            if (pendingCount === 0) {
              badgeElement.hide();
            } else {
              badgeElement.show();
            }
          }
        }
      },
      error: function() {
        // Silently fail - don't show errors for background polling
      }
    });
  }

  // Update on page load
  $(document).ready(function() {
    updateDeviceResetBadge();
    
    // Poll every 30 seconds
    setInterval(updateDeviceResetBadge, 30000);
  });
})();
