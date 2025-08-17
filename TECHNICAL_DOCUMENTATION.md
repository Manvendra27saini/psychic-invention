# NoteSwift Technical Documentation

## Project Overview
NoteSwift is an AI-powered meeting transcript summarizer that leverages Groq's LLM API to generate intelligent, customizable summaries from meeting transcripts. The application provides a modern web interface for uploading transcripts, generating summaries with custom instructions, and sharing results via email.

## Tech Stack Architecture

### Frontend
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with strict type checking
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Accessible, unstyled UI components
- **React Hook Form** - Performant forms with validation
- **TanStack Query** - Server state management and caching
- **Wouter** - Lightweight routing solution

### Backend
- **Node.js 24.3.0** - Runtime environment
- **Express.js 4.21.2** - Web application framework
- **TypeScript** - Backend type safety
- **TSX** - TypeScript execution for development

### AI & External Services
- **Groq API** - High-performance LLM inference for summary generation
- **Nodemailer** - Email service integration for sharing summaries

### Database
- **MongoDB** - NoSQL database for storing transcripts, summaries, and email logs
- **Mongoose** - MongoDB object modeling and validation

### Development Tools
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing and optimization
- **Drizzle ORM** - Type-safe database operations (configured but not fully implemented)

## System Architecture

### Client-Server Architecture
```
┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   React Client  │ ◄────────────► │  Express Server │
│   (Port 3000)   │                │                 │
└─────────────────┘                └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   MongoDB       │
                                    │   Database      │
                                    └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   Groq API      │
                                    │   (LLM Service) │
                                    └─────────────────┘
```

### Data Flow
1. **Transcript Upload**: Client uploads text files or pastes content
2. **Storage**: Transcripts stored in MongoDB with unique IDs
3. **Summary Generation**: Groq API processes transcript with custom instructions
4. **Result Storage**: Generated summaries stored in MongoDB
5. **Email Sharing**: Optional email distribution of summaries

## Development Process & Approach

### 1. Environment Setup
- **Configuration Management**: Environment variables for API keys and database connections
- **Cross-Platform Compatibility**: Modified server configuration for macOS compatibility
- **Port Management**: Dynamic port allocation with fallback to 5000

### 2. Server Configuration Challenges & Solutions
**Problem**: Server binding to `0.0.0.0` caused `ENOTSUP` errors on macOS
**Solution**: Modified server configuration to use `localhost` and removed problematic `reusePort` option

**Code Changes Made**:
```typescript
// Before (problematic)
server.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
}, () => {
  log(`serving on port ${port}`);
});

// After (working)
server.listen({
  port,
  host: "localhost",
}, () => {
  log(`serving on port ${port}`);
});
```

### 3. API Design
- **RESTful Endpoints**: Clean, semantic API design
- **File Upload Support**: Multer middleware for handling file uploads
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

### 4. Database Schema Design
```typescript
// Core Entities
interface Transcript {
  id: string;
  content: string;
  fileName?: string;
  uploadedAt: Date;
}

interface Summary {
  id: string;
  transcriptId: string;
  customPrompt: string;
  generatedSummary: string;
  editedSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailLog {
  id: string;
  summaryId: string;
  recipients: string[];
  subject: string;
  message?: string;
  includeOriginal: boolean;
  sentAt: Date;
  status: string;
}
```

## Key Features Implementation

### 1. Transcript Processing
- **File Upload**: Support for TXT, PDF, and DOCX files (TXT fully implemented)
- **Content Validation**: Ensures non-empty transcript content
- **Storage**: Persistent storage with unique identifiers

### 2. AI Summary Generation
- **Groq Integration**: Uses Llama 3.1 8B Instant model
- **Custom Instructions**: User-defined formatting and focus areas
- **Fallback System**: Mock summary generation when API issues occur
- **Performance**: Optimized with temperature 0.3 for consistent results

### 3. Email Sharing
- **Recipient Management**: Multiple email addresses support
- **Template System**: Structured email content with summary details
- **Delivery Tracking**: Email status logging and monitoring

## Security Considerations

### 1. API Key Management
- **Environment Variables**: Secure storage of Groq API keys
- **No Hardcoding**: Credentials never committed to source code
- **Access Control**: Server-side API key validation

### 2. File Upload Security
- **File Type Validation**: Whitelist approach for allowed file types
- **Size Limits**: 10MB maximum file size
- **Content Sanitization**: Input validation and sanitization

### 3. Database Security
- **Connection String**: Secure MongoDB connection with authentication
- **Input Validation**: Zod schema validation for all database operations
- **Error Handling**: No sensitive information exposed in error messages

## Performance Optimizations

### 1. Frontend
- **Code Splitting**: Vite-based lazy loading
- **React Query**: Intelligent caching and background updates
- **Optimized Rendering**: Efficient component updates with React 18

### 2. Backend
- **Async Operations**: Non-blocking I/O operations
- **Connection Pooling**: MongoDB connection management
- **Response Caching**: Strategic caching of frequently accessed data

### 3. AI Processing
- **Model Selection**: Llama 3.1 8B Instant for optimal speed/quality balance
- **Token Optimization**: 2000 max tokens for cost-effective processing
- **Temperature Control**: 0.3 for consistent, focused outputs

## Deployment & Environment

### 1. Development Environment
- **Local Development**: Port 3000 with hot reload
- **Environment Variables**: Local configuration for development
- **Database**: MongoDB Atlas cloud database

### 2. Production Considerations
- **Build Process**: ESBuild for optimized production bundles
- **Static Serving**: Express static file serving for production
- **Port Configuration**: Environment-based port selection

### 3. Monitoring & Logging
- **Request Logging**: Comprehensive API request/response logging
- **Performance Metrics**: Response time tracking
- **Error Monitoring**: Structured error logging and handling

## Future Enhancements

### 1. Planned Features
- **PDF/DOCX Parsing**: Full support for document formats
- **Real-time Collaboration**: WebSocket-based collaborative editing
- **Advanced Analytics**: Meeting insights and trend analysis

### 2. Scalability Improvements
- **Microservices Architecture**: Service decomposition for better scaling
- **Caching Layer**: Redis integration for improved performance
- **Load Balancing**: Multiple server instances support

### 3. AI Enhancements
- **Multiple Models**: Support for different LLM providers
- **Fine-tuning**: Custom model training for specific domains
- **Batch Processing**: Bulk transcript processing capabilities

## Troubleshooting Guide

### Common Issues
1. **Port Conflicts**: Use `PORT` environment variable to specify custom port
2. **MongoDB Connection**: Verify connection string and network access
3. **Groq API Limits**: Monitor API usage and rate limits
4. **File Upload Errors**: Check file size and type restrictions

### Debug Commands
```bash
# Check server status
lsof -i :3000

# View server logs
ps aux | grep "tsx server/index.ts"

# Test API endpoints
curl http://localhost:3000/api/health
```

## Conclusion

NoteSwift demonstrates a modern, scalable approach to AI-powered document processing with a focus on user experience, security, and performance. The tech stack choice prioritizes developer productivity, type safety, and maintainability while providing a robust foundation for future enhancements.

The application successfully addresses the challenges of meeting transcript management through intelligent AI summarization, customizable output formatting, and seamless sharing capabilities, all built on a solid, enterprise-ready architecture.
