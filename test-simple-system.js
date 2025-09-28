// Test script to verify the simple QR system is working
console.log("Testing simple QR system...");

// Test 1: Check if required libraries are available
try {
  if (typeof QRCode !== 'undefined') {
    console.log("✓ QRCode library is available");
  } else {
    console.error("✗ QRCode library is missing");
  }
} catch (e) {
  console.error("✗ QRCode library error:", e);
}

// Test 2: Check if html5-qrcode is available
try {
  if (typeof Html5QrcodeScanner !== 'undefined') {
    console.log("✓ Html5QrcodeScanner is available");
  } else {
    console.error("✗ Html5QrcodeScanner is missing");
  }
} catch (e) {
  console.error("✗ Html5QrcodeScanner error:", e);
}

// Test 3: Check localStorage functionality
try {
  const testKey = 'qr_system_test';
  localStorage.setItem(testKey, 'test');
  const value = localStorage.getItem(testKey);
  localStorage.removeItem(testKey);
  
  if (value === 'test') {
    console.log("✓ localStorage is working");
  } else {
    console.error("✗ localStorage is not working properly");
  }
} catch (e) {
  console.error("✗ localStorage error:", e);
}

console.log("Test completed.");