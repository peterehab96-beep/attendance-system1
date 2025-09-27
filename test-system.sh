#!/bin/bash

echo "🎵 Faculty Attendance Management System - Test Runner"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please configure your Supabase credentials in .env.local"
    echo "   For testing, you can leave them empty and the system will use local storage"
fi

echo ""
echo "🚀 Starting the development server..."
echo "📱 The system includes:"
echo "   - Admin Dashboard (QR Code Generation)"
echo "   - Student Dashboard (QR Code Scanning)"
echo "   - Real-time attendance tracking"
echo "   - Secure token validation"
echo ""
echo "🔧 Test Scenarios:"
echo "   1. Admin creates a session and generates QR code"
echo "   2. Student scans QR code to mark attendance"
echo "   3. Admin sees real-time attendance updates"
echo "   4. QR codes expire after 30 minutes"
echo "   5. Duplicate scans are prevented"
echo ""

# Start the development server
npm run dev

echo "🎉 Test completed!"