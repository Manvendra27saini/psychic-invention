# AI Meeting Notes Summarizer

## Overview

This is a full-stack web application that allows users to upload meeting transcripts, add custom instructions, and generate AI-powered summaries using the Groq API. Users can edit the generated summaries and share them via email. The application features a clean, modern interface built with React and shadcn/ui components, with a robust Express.js backend and PostgreSQL database for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Single-page application using React 18 with TypeScript for type safety
- **Vite Build System**: Modern build tool for fast development and optimized production builds
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Styling**: Tailwind CSS with custom CSS variables for theming and design tokens

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for JSON parsing, file uploads, and logging
- **TypeScript**: Full TypeScript implementation for type safety across the stack
- **File Upload**: Multer middleware for handling file uploads with size and type restrictions
- **API Structure**: Clean separation of routes, services, and storage layers
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Database Design
- **PostgreSQL with Drizzle ORM**: Type-safe database operations with schema-first approach
- **Three Main Tables**:
  - `transcripts`: Stores uploaded transcript content and metadata
  - `summaries`: Links transcripts to generated summaries with custom prompts
  - `email_logs`: Tracks email sharing history with recipients and status
- **UUID Primary Keys**: Auto-generated unique identifiers for all entities
- **Timestamps**: Automatic tracking of creation and update times

### External Dependencies
- **Groq API**: AI service for generating meeting summaries using Llama models
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Nodemailer**: Email service integration for sharing summaries via SMTP
- **Replit Integration**: Development environment with hot reloading and error overlay

### Key Features
- **Multi-format Support**: Handles text files with planned support for PDF and DOCX
- **Custom Instructions**: Users can provide specific formatting requirements for summaries
- **Editable Summaries**: Generated content can be modified before sharing
- **Email Integration**: Direct email sharing with customizable messages
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Feedback**: Toast notifications and loading states for all operations

### Security and Validation
- **Input Validation**: Zod schemas for runtime type checking and data validation
- **File Type Restrictions**: Limited to safe file formats with size constraints
- **Email Validation**: Client and server-side email format validation
- **Environment Variables**: Secure configuration management for API keys and database connections