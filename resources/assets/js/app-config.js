/**
 * Global API Helper
 * Centralized API configuration and helper functions
 * 
 * Usage:
 * - Get API URL: window.AppConfig.apiUrl
 * - Make API call: window.AppConfig.apiCall('/endpoint', 'GET', data)
 */

'use strict';

(function () {
  // Read configuration from meta tags
  var apiBaseUrl = document.querySelector('meta[name="api-base-url"]');
  var csrfToken = document.querySelector('meta[name="csrf-token"]');

  // Global App Configuration
  window.AppConfig = {
    // API Base URL (from .env via meta tag)
    apiUrl: apiBaseUrl ? apiBaseUrl.getAttribute('content') : 'http://localhost:8080/api',
    
    // CSRF Token
    csrfToken: csrfToken ? csrfToken.getAttribute('content') : '',
    
    // Get API Token from localStorage
    getApiToken: function() {
      return localStorage.getItem('api_token') || '';
    },
    
    // Set API Token to localStorage
    setApiToken: function(token) {
      localStorage.setItem('api_token', token);
    },
    
    // Remove API Token
    removeApiToken: function() {
      localStorage.removeItem('api_token');
    },
    
    // Check if user is authenticated
    isAuthenticated: function() {
      return !!this.getApiToken();
    },
    
    // Make API call using jQuery AJAX
    apiCall: function(endpoint, method, data, options) {
      var self = this;
      options = options || {};
      
      var ajaxConfig = {
        url: this.apiUrl + endpoint,
        method: method || 'GET',
        headers: {
          'Authorization': 'Bearer ' + this.getApiToken(),
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        },
        beforeSend: options.beforeSend || function() {},
        complete: options.complete || function() {}
      };
      
      // Handle data based on method
      if (method === 'GET' || method === 'DELETE') {
        ajaxConfig.data = data;
      } else {
        ajaxConfig.contentType = 'application/json';
        ajaxConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
      }
      
      return $.ajax(ajaxConfig);
    },
    
    // Shorthand methods
    get: function(endpoint, params) {
      return this.apiCall(endpoint, 'GET', params);
    },
    
    post: function(endpoint, data) {
      return this.apiCall(endpoint, 'POST', data);
    },
    
    put: function(endpoint, data) {
      return this.apiCall(endpoint, 'PUT', data);
    },
    
    delete: function(endpoint, params) {
      return this.apiCall(endpoint, 'DELETE', params);
    },
    
    // Show error message using SweetAlert2
    showError: function(message) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        });
      } else {
        alert('Error: ' + message);
      }
    },
    
    // Show success message using SweetAlert2
    showSuccess: function(title, message) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: title,
          text: message,
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        });
      } else {
        alert(title + ': ' + message);
      }
    }
  };
  
  // Console log for debugging (remove in production)
  console.log('AppConfig initialized. API URL:', window.AppConfig.apiUrl);
})();
