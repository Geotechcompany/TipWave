<div align="center">

# TipWave

Connect with DJs, request songs, and tip your favorite artists in one seamless platform.

[![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Demo](https://tipwave.vercel.app) · [Report Bug](https://github.com/your-username/tipwave/issues) · [Request Feature](https://github.com/your-username/tipwave/issues)

![TipWave Banner](public/banner.png)

</div>

## 🎵 Overview

TipWave revolutionizes the nightlife experience by bridging the gap between DJs and music lovers. Our platform enables real-time song requests, seamless tipping, and direct interaction between audiences and performers.

### ✨ Key Features

- **🎧 Smart Song Request System**
  - Real-time song search and requests
  - AI-powered music recommendations
  - Custom message support with requests

- **💸 Secure Tipping Integration**
  - Multiple payment methods (M-PESA, Card)
  - Instant DJ payouts
  - Transaction history tracking

- **👤 Rich DJ Profiles**
  - Customizable DJ portfolios
  - Availability calendar
  - Performance analytics

- **⚡ Real-time Features**
  - Live request queue updates
  - Instant notifications
  - Dynamic playlist management

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion
- SWR for data fetching

### Backend
- Next.js API Routes
- MongoDB with MongoDB Atlas
- NextAuth.js for authentication
- SendGrid/SMTP for emails

### DevOps
- Vercel Deployment
- GitHub Actions CI/CD
- MongoDB Atlas Cloud

## 📋 Prerequisites

Before you begin, ensure you have:

## 🚀 Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/your-username/tipwave.git
cd tipwave
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy example env file
cp .env.example .env.local

# Add your variables
nano .env.local
```

4. **Initialize the database**
```bash
npm run init-db
```

5. **Start development server**
```bash
npm run dev
```

## 🔧 Environment Variables

```env
# Required
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email (Choose one provider)
SENDGRID_API_KEY=your_sendgrid_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Payment Integration
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
ENCRYPTION_KEY=your_encryption_key
```

## 📱 Core Features

### Song Request System
- Advanced song search with Spotify integration
- Real-time request queue management
- Custom message support
- Automated playlist suggestions

### Admin Dashboard
- Comprehensive analytics
- User management
- Payment processing
- Email template customization
- System configuration

### Payment Processing
- M-PESA integration
- Secure credential management
- Transaction monitoring
- Automated payouts

## 🔄 API Routes

```typescript
// Song Requests
POST /api/requests
GET  /api/djs
POST /api/payments/mpesa/stkpush
GET  /api/admin/analytics

// DJ Management
GET  /api/dj/:djId/analytics
GET  /api/dj/:djId/fans
POST /api/dj/:djId/profile
```

## 📊 Database Schema

```typescript
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  role: "DJ" | "USER" | "ADMIN";
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Request {
  _id: ObjectId;
  userId: ObjectId;
  djId: ObjectId;
  songId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message?: string;
  createdAt: Date;
}

interface Transaction {
  _id: ObjectId;
  userId: ObjectId;
  type: "TOPUP" | "TIP" | "WITHDRAWAL";
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
}
```

## 🚢 Deployment

### Vercel Deployment
1. Fork this repository
2. Create a new project in Vercel
3. Connect your fork
4. Configure environment variables
5. Deploy

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - [@your-username](https://github.com/your-username)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Vercel](https://vercel.com/)

---

<p align="center">Made with ❤️ for music lovers and DJs everywhere</p>