const fs = require('fs');
require('dotenv').config({path: '.env.local'});
let credJson = process.env.GOOGLE_CREDENTIALS_JSON;
let cred;
try {
  cred = JSON.parse(credJson);
} catch (e) {
  try {
    // Unescape quotes if they are escaped with a backslash
    let fixed = credJson.replace(/\\"/g, '"');
    
    // Check if it parses now
    cred = JSON.parse(fixed);
  } catch (e2) {
    console.error('Failed 2:', e2);
  }
}
console.log('Success!', cred && cred.type);
