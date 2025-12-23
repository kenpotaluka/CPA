# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-8fc72w90u03n

# Complaint Prioritization AI (CPA) System

An AI-powered intelligent complaint management system designed for urban areas transitioning to smart cities. The system automatically ranks citizen complaints by urgency, severity, and public impact, routes them to appropriate government departments, and collects feedback after resolution to improve municipal service quality.

## Features

### 🎯 Core Functionality

- **AI-Powered Complaint Routing**: Automatically routes complaints to the respective department based on complaint type and content
- **Dynamic Priority Management**: Continuously updates complaint priority based on time, location, and content analysis
- **Emergency Response System**: Immediate resolution workflow for emergency issues including fallen electric poles, water leaks, and accidents
- **Real-Time Alert System**: Auto-alerts to authorities for high-risk complaints
- **Authority Performance Dashboard**: Performance metrics based on citizen feedback with department-wise response time tracking
- **Predictive Analytics**: Displays complaint patterns and trends for proactive issue prevention
- **Citizen Feedback Collection**: Post-resolution feedback system with satisfaction ratings

### 🎨 Design Features

- **Professional Government Interface**: Clean, trustworthy design with deep blue primary color (#1E3A8A)
- **Color-Coded Priority System**:
  - 🔴 Critical (Red): Emergency issues requiring immediate attention
  - 🟡 High (Amber): Important issues needing quick response
  - 🔵 Medium (Blue): Standard priority issues
  - ⚪ Low (Gray): Non-urgent matters
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices
- **Interactive Map Visualization**: Geographic distribution of complaints
- **Real-Time Statistics**: Live dashboard with key performance indicators

### 📱 User Experience

- **Easy Complaint Submission**: Simple form with image upload support
- **Image Compression**: Automatic image optimization (max 1MB, WEBP format)
- **Advanced Filtering**: Filter complaints by status, priority, category, and department
- **Search Functionality**: Quick search across complaint titles and descriptions
- **Status Tracking**: Real-time updates on complaint resolution progress
- **Feedback System**: Star ratings and comments for resolved complaints

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for complaint images
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **State Management**: React Context + Hooks

## Database Schema

### Tables

1. **departments**: Government departments handling different complaint categories
2. **complaints**: All citizen complaints with priority scoring and status tracking
3. **feedback**: Citizen feedback and ratings for resolved complaints
4. **complaint_analytics**: Aggregated data for analytics and reporting

### Key Features

- Automatic department assignment based on complaint category
- Priority scoring algorithm considering urgency, severity, and impact
- Real-time status tracking (submitted → assigned → in_progress → resolved → closed)
- Image attachment support via Supabase Storage

## Priority Scoring Algorithm

The system uses an intelligent algorithm to calculate priority scores (0-100):

1. **Base Score**: 50 points
2. **Category Weight**: Different categories have different base priorities
   - Public Safety: +22 points
   - Infrastructure: +20 points
   - Health: +20 points
   - Utilities: +18 points
   - Traffic: +15 points
   - Sanitation: +12 points
   - Environment: +10 points
   - Other: +8 points
3. **Keyword Analysis**: Urgent keywords add +10 points each
   - emergency, urgent, immediate, danger, accident, fallen, leak, fire, flood
4. **Priority Levels**:
   - Critical: Score ≥ 85
   - High: Score ≥ 70
   - Medium: Score ≥ 40
   - Low: Score < 40

## Pages

### 1. Dashboard (`/`)
- Overview statistics (total complaints, critical issues, resolved today, avg resolution time)
- Recent high-priority complaints list
- Interactive map showing complaint locations
- Quick action buttons

### 2. All Complaints (`/complaints`)
- Comprehensive list of all complaints
- Advanced filtering and search
- Grid view with complaint cards
- Priority and status badges

### 3. Complaint Detail (`/complaints/:id`)
- Full complaint information
- Image attachments
- Citizen contact information
- Status management
- Priority metrics breakdown
- Timeline tracking
- Feedback section (for resolved complaints)

### 4. New Complaint (`/complaints/new`)
- Complaint submission form
- Category selection
- Location input
- Image upload with compression
- Optional contact information

### 5. Performance Dashboard (`/performance`)
- Department-wise performance metrics
- Resolution rates and average times
- Citizen satisfaction ratings
- AI-powered insights and recommendations
- Overall system statistics

## Image Upload System

### Features
- Automatic image compression to under 1MB
- WEBP format conversion for optimal storage
- Maximum resolution: 1920x1080 (maintains aspect ratio)
- Progress bar during upload
- Multiple image support
- Preview before submission

### Validation
- Supported formats: JPEG, PNG, GIF, WEBP, AVIF
- Maximum initial size: 10MB
- Automatic compression with quality adjustment
- Sanitized file names (alphanumeric only)

## Color Scheme

### Light Mode
- Primary: Deep Blue (HSL: 217 91% 32%)
- Secondary: Green (HSL: 160 84% 39%)
- Alert: Red (HSL: 0 84% 60%)
- Warning: Amber (HSL: 38 92% 50%)
- Background: White
- Foreground: Dark Blue

### Dark Mode
- Automatically adjusted for optimal contrast
- Maintains color hierarchy and accessibility

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
# .env file is already configured with Supabase credentials
```

3. Run development server:
```bash
pnpm dev
```

4. Build for production:
```bash
pnpm build
```

## Project Structure

```
src/
├── components/
│   ├── layouts/          # Layout components (DashboardLayout)
│   ├── complaint/        # Complaint-specific components (FeedbackForm)
│   ├── ui/              # shadcn/ui components
│   └── common/          # Shared components
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── ComplaintsPage.tsx
│   ├── ComplaintDetailPage.tsx
│   ├── NewComplaintPage.tsx
│   └── PerformancePage.tsx
├── db/                  # Database layer
│   ├── supabase.ts     # Supabase client
│   └── api.ts          # API functions
├── lib/                 # Utilities
│   ├── utils.ts        # General utilities
│   └── imageCompression.ts  # Image processing
├── types/              # TypeScript types
│   └── types.ts
├── hooks/              # Custom React hooks
└── contexts/           # React contexts
```

## Key Features Implementation

### Automatic Department Routing
When a complaint is submitted, the system automatically assigns it to the appropriate department based on the selected category.

### Priority Scoring
The AI algorithm analyzes complaint content and assigns a priority score, which determines the urgency level and routing priority.

### Real-Time Updates
Complaint status can be updated in real-time, with automatic timestamp tracking for assigned and resolved states.

### Performance Analytics
The system tracks department performance including:
- Total complaints handled
- Resolution rate
- Average resolution time
- Citizen satisfaction ratings
- Pending complaint count

### Feedback Collection
After a complaint is resolved, citizens can provide:
- Overall rating (1-5 stars)
- Response time rating
- Resolution quality rating
- Written comments

## Future Enhancements

- Machine learning model for improved priority prediction
- SMS/Email notifications for complaint updates
- Mobile app for citizens
- Integration with city infrastructure sensors
- Predictive maintenance recommendations
- Multi-language support
- Advanced analytics and reporting
- API for third-party integrations

## License

Copyright © 2025 Complaint Prioritization AI

---

Built with ❤️ for smarter cities
