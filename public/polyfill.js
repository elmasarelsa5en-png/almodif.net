// Global polyfill for Browser compatibility
// This MUST load before any other scripts
(function() {
  'use strict';
  
  // Define global immediately
  if (typeof window !== 'undefined') {
    window.global = window;
  }
  
  // Also set it on globalThis
  if (typeof globalThis !== 'undefined') {
    globalThis.global = globalThis;
  }
  
  // Define process.env
  if (typeof window !== 'undefined') {
    window.process = {
      env: {},
      browser: true,
      version: '',
      versions: {}
    };
  }
  
  // Make it available globally
  if (typeof global === 'undefined') {
    self.global = self;
  }
})();
