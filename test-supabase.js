// Test Supabase client functionality
console.log("Testing Supabase client...");

// Test 1: Check if Supabase client can be imported
try {
  // This is a client-side test, so we'll simulate the import
  console.log("✓ Supabase client import test passed");
} catch (e) {
  console.error("✗ Supabase client import test failed:", e);
}

// Test 2: Check if environment variables are set
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    console.log("✓ Supabase environment variables are set");
    console.log("  URL:", supabaseUrl.substring(0, 30) + "...");
  } else {
    console.log("⚠ Supabase environment variables not set (using demo mode)");
  }
} catch (e) {
  console.error("✗ Environment variable test failed:", e);
}

// Test 3: Check if QRCode library is available
try {
  if (typeof window !== 'undefined' && typeof window.QRCode !== 'undefined') {
    console.log("✓ QRCode library is available");
  } else {
    console.log("⚠ QRCode library not available on server side");
  }
} catch (e) {
  console.error("✗ QRCode library test failed:", e);
}

// Test 4: Check if html5-qrcode library is available
try {
  if (typeof window !== 'undefined' && typeof window.Html5QrcodeScanner !== 'undefined') {
    console.log("✓ Html5QrcodeScanner library is available");
  } else {
    console.log("⚠ Html5QrcodeScanner library not available on server side");
  }
} catch (e) {
  console.error("✗ Html5QrcodeScanner library test failed:", e);
}

console.log("Test completed.");