# NoteSwift 🚀

AI-powered meeting transcript summarizer that leverages Groq's LLM API to generate intelligent, customizable summaries from meeting transcripts.

## ✨ Features

- **📝 Transcript Upload**: Upload TXT files or paste text directly
- **🤖 AI Summary Generation**: Uses Groq's Llama 3.1 8B Instant model
- **⚙️ Custom Instructions**: Apply specific formatting and focus areas to summaries
- **📧 Email Sharing**: Send summaries to team members
- **💾 Persistent Storage**: MongoDB database for transcripts and summaries
- **🎨 Modern UI**: Beautiful React interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, TypeScript
- **AI**: Groq API (Llama 3.1 8B Instant)
- **Database**: MongoDB with Mongoose
- **Development**: ESBuild, PostCSS, Hot Reload

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB database
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manvendra27saini/psychic-invention.git
   cd NoteSwift
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
PORT=3000
```

### Getting Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Generate a new API key
4. Copy the key to your `.env` file

## 📖 Usage

1. **Upload Transcript**: Upload a TXT file or paste meeting text
2. **Custom Instructions**: Specify how you want the summary formatted
3. **Generate Summary**: AI processes your transcript with custom instructions
4. **Edit & Share**: Modify the summary and email it to your team

## 🏗️ Project Structure

```
NoteSwift/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── hooks/         # Custom React hooks
├── server/                 # Express.js backend
│   ├── services/          # Business logic
│   ├── routes/            # API endpoints
│   └── storage.ts         # Database operations
├── shared/                 # Shared types and schemas
└── .env.example           # Environment variables template
```

## 🔌 API Endpoints

- `POST /api/transcripts` - Upload transcript
- `GET /api/transcripts/:id` - Get transcript by ID
- `POST /api/summaries` - Generate AI summary
- `PATCH /api/summaries/:id` - Update summary
- `POST /api/email` - Send summary via email

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure your production environment has the same environment variables as your `.env` file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing the LLM API
- [MongoDB](https://mongodb.com/) for the database
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)
  2. Open an [Issue](https://github.com/Manvendra27saini/psychic-invention/issues)
3. Review the troubleshooting guide in the documentation

---

**Made with ❤️ for better meeting management**
