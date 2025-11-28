const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Fix Port
  if (content.includes('PORT=5000')) {
    content = content.replace('PORT=5000', 'PORT=5001');
    console.log('Updated PORT to 5001');
  } else if (!content.includes('PORT=')) {
    content += '\nPORT=5001';
    console.log('Added PORT=5001');
  } else {
    console.log('PORT already set to something else or 5001');
  }

  // Fix Firebase Key
  if (content.includes('FIREBASE_SDK=')) {
    content = content.replace('FIREBASE_SDK=', 'FIREBASE_SERVICE_KEY=');
    console.log('Renamed FIREBASE_SDK to FIREBASE_SERVICE_KEY');
  } else {
    console.log('FIREBASE_SDK not found or already renamed');
  }

  fs.writeFileSync(envPath, content);
  console.log('.env file updated successfully');
} catch (error) {
  console.error('Error updating .env:', error);
}
