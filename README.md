# 🎓 Smart Attendance System

A comprehensive attendance management system built with Next.js, Supabase, and modern web technologies.

## ✨ Features

- **Multiple Authentication Methods**
  - QR Code scanning
  - Biometric authentication
  - Social login (Google OAuth)
  - Traditional username/password

- **Role-Based Access Control**
  - Students: View attendance, grades, and personal dashboard
  - Admins: Manage attendance, generate reports, configure system
  - Super Admin: Full system control and user management

- **Real-time Features**
  - Live attendance monitoring
  - Real-time notifications
  - Instant grade updates

- **Advanced Functionality**
  - Automated backup system
  - Comprehensive reporting
  - Grade management system
  - Attendance history and analytics

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd attendance-system

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
# or
pnpm dev
```

### Environment Setup

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📱 Usage

1. **Students**: Scan QR codes or use biometric authentication for attendance
2. **Admins**: Access admin panel for attendance monitoring and reporting
3. **Super Admin**: Full system configuration and user management

## 🔧 Configuration

- Database setup scripts are in `/scripts/`
- Supabase configuration in `/lib/supabase/`
- Authentication services in `/lib/auth-service.ts`

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Admin Access Guide](./ADMIN_ACCESS_GUIDE.md)
- [Biometric Setup](./BIOMETRIC_SETUP_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Custom solutions
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Real-time**: Supabase Realtime

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Dr. Peter Ehab**

---

Made with ❤️ for educational institutions