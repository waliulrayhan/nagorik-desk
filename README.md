# Nagorik Desk - Citizen Engagement Platform

A modern web platform connecting citizens with government authorities for efficient problem resolution and transparent governance.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## Overview

Nagorik Desk is a comprehensive citizen engagement platform designed to streamline the process of reporting and resolving civic issues. It creates a direct channel between citizens and government authorities, leveraging AI and machine learning to ensure efficient problem resolution.

### Problem Statement

Many cities face challenges with unresolved citizen grievances that often escalate into public protests. The lack of an efficient, centralized platform for citizens to report problems and for authorities to address these issues systematically leads to:
- Delayed problem resolution
- Citizen dissatisfaction
- Inefficient resource allocation
- Communication gaps between citizens and government

### Solution

Our platform provides:
- Structured problem reporting system
- AI-driven report summarization
- ML-based prioritization
- Transparent resolution tracking
- Citizen participation through voting

## Features

### For Citizens (End Users)
- Secure authentication with NID verification
- Structured problem reporting with sector categorization
- Real-time status tracking
- Solution voting system
- Progress dashboard

### For Sector Administrators
- Sector-specific report management
- AI-powered report summarization
- Problem prioritization tools
- Solution proposal system

### For Government Administrators
- Cross-sector oversight
- ML-based sector prioritization
- Historical data analysis
- Performance metrics dashboard

## Technology Stack

### Frontend
- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- NextAuth.js

### Backend
- Node.js
- Prisma ORM
- PostgreSQL
- REST APIs

### AI/ML Components
- Report Summarization API
- Sector Prioritization Algorithms

## Project Structure

```
nagorik-desk/
├── src/
│   ├── app/                 # Next.js 13 app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── types/              # TypeScript definitions
├── prisma/                  # Database schema
├── public/                  # Static assets
└── tests/                  # Test files
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nagorik-desk.git
cd nagorik-desk
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nagorik-desk"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
APY_HUB_TOKEN="your-apy-hub-token"
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

```typescript
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify-nid
```

### Report Management

```typescript
POST /api/reports
GET /api/reports/user
GET /api/reports/sector
```

### Sector Management

```typescript
GET /api/sectors
GET /api/sectors/[sectorId]/subsectors
```

## User Roles

### END_USER
- Can submit reports
- Track report status
- Vote on solutions

### SECTOR_ADMIN
- Manage sector-specific reports
- Generate problem summaries
- Propose solutions

### GOVT_ADMIN
- Cross-sector oversight
- Approve/reject solutions
- Access analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

