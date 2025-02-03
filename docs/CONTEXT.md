# Productivity App - Flow and Features

## Overview
The goal of this productivity app is to help users focus on one task at a time. It utilizes AI to prioritize tasks and helps users track their progress, block distractions, and stay on track by promoting focused work sessions.

## Tech Stack

- Frontend: React Native with TypeScript, Expo and Expo router
- Backend/Database: Supabase
- Ul Framework: React Native Paper
- Al Processing: DeepSeek

## App Flow

### 1. Welcome Screen
- Clean welcome screen with sign-up/login options
  - **Sign Up**: Email-based registration
  - **Log In**: Existing user authentication

### 2. Main Dashboard
- Displays AI-prioritized tasks
- Task information includes:
  - Task Name
  - Priority Level (AI-determined)
  - Due Date (optional)
  - Time Estimate (optional)

### 3. Task Management
Two methods for adding tasks:
- **Quick Add**: Simple input field for quick task creation
- **AI Chat**: Conversational interface for task creation and management
  - Users describe tasks naturally
  - AI generates appropriate task entries and suggestions

### 4. Focus Mode
Distraction-free environment including:
- Task timer (Pomodoro-style)
- Notification blocker
- Minimalist task display

### 5. End of Session
Progress screen showing:
- Time spent
- Task completion status
- Current progress metrics

Options after session:
- Start new session
- Continue current task
- Take a break (short/long)

## Core Features

### 1. AI Task Prioritization
Factors considered:
- Urgency (deadline-based)
- Estimated effort
- User preferences

### 2. Task Creation Methods
- **Quick-Add**: Simple task entry
- **AI Chat**: Natural language task creation

### 3. Focus Mode Features
- Notification blocking
- Session timer
- Distraction-free interface

### 4. Progress Tracking
Metrics displayed:
- Task completion status
- Time tracking
- Progress percentage

### 5. Break System
- Short breaks (5-10 minutes)
- Long breaks (30 minutes)
- Based on session length and user preferences

## Key Features Summary
- 🏠 Welcome Screen: Clean login/signup interface
- 📊 Dashboard: AI-prioritized task list
- ✏️ Task Management: Quick-Add and AI Chat options
- 🎯 Focus Mode: Distraction-free work environment
- 📈 Progress Tracking: Time and completion monitoring
- ⏸️ Breaks: Structured rest periods

## Design Considerations
1. Maintain simple, clean interface
2. Make AI prioritization transparent and adjustable
3. Keep Focus Mode central and clutter-free

## Database Schema

### Users Table
```sql
users (
id uuid primary key,
email text unique not null,
created_at timestamp with time zone default timezone('utc'::text, now()),
last_login timestamp with time zone,
preferences jsonb default '{}'::jsonb
)
```

### Tasks Table
```sql
tasks (
  id uuid primary key,
  user_id uuid references users(id),
  title text not null,
  description text,
  priority integer,
  due_date timestamp with time zone,
  estimated_time integer, -- in minutes
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
)
```

### Sessions Table
```sql
sessions (
  id uuid primary key,
  user_id uuid references users(id),
  task_id uuid references tasks(id),
  start_time timestamp with time zone default timezone('utc'::text, now()),
  end_time timestamp with time zone,
  duration integer, -- in minutes
  break_count integer default 0
)
```

### AI_Interactions Table
```sql
ai_interactions (
  id uuid primary key,
  user_id uuid references users(id),
  input text not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  context jsonb
)
```

## Project Structure
```
productivity-app/
├── app/                      # Expo Router app directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (main)/              # Main app routes
│   │   ├── dashboard.tsx
│   │   ├── focus-mode.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared components
│   │   ├── auth/           # Auth-related components
│   │   ├── tasks/          # Task-related components
│   │   └── focus/          # Focus mode components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # External services
│   │   ├── ai.ts          # AI service
│   │   ├── supabase.ts    # Database service
│   │   └── notifications.ts
│   ├── utils/             # Helper functions
│   ├── constants/         # App constants
│   ├── types/            # TypeScript types
│   └── context/          # React Context
├── assets/               # Static assets
├── docs/                # Documentation
└── config/              # Configuration files
```

## Key Design Patterns

### 1. Data Flow
- Supabase Real-time subscriptions for task updates
- Context API for global state management
- Local storage for offline capability

### 2. Authentication Flow
- Supabase Auth integration
- Protected routes using Expo Router
- Persistent sessions

### 3. AI Integration
- Queue system for AI requests
- Caching for common AI responses
- Fallback mechanisms for offline mode