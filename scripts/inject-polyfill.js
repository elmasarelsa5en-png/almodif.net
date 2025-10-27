const fs = require('fs');
const path = require('path');

// Polyfill script with global and require fixes
const polyfillScript = '<script>' +
'(function() {' +
  "'use strict';" +
  "window.global = window;" +
  "window.process = window.process || { env: {}, browser: true };" +
  "if (typeof globalThis !== 'undefined') {" +
    "globalThis.global = globalThis;" +
  "}" +
  "Object.defineProperty(window, 'global', {" +
    "value: window," +
    "writable: false," +
    "configurable: false" +
  "});" +
  "if (typeof window.require === 'undefined') {" +
    "window.require = function(module) {" +
      "console.warn('require() not available in browser for:', module);" +
      "return {};" +
    "};" +
  "}" +
'})();' +
'</script>';

function injectPolyfill(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      injectPolyfill(filePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Only inject if not already present
      if (!content.includes('window.global')) {
        // Inject right after <head>
        content = content.replace(/<head>/i, '<head>' + polyfillScript);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Injected polyfill into ' + filePath);
      }
    }
  });
}

const outDir = path.join(__dirname, '..', 'out');
if (fs.existsSync(outDir)) {
  console.log('Injecting polyfill into HTML files...');
  injectPolyfill(outDir);
  console.log('Done!');
} else {
  console.error('Error: out directory not found');
  process.exit(1);
}
