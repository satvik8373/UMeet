# UMeet - Watch YouTube Together

UMeet is a real-time streaming and discussion platform that allows users to watch YouTube videos and live streams together while chatting and interacting with other participants.

## Features

- Secure user authentication with email and password
- Create and join rooms via invite links or room IDs
- Watch YouTube videos and live streams synchronously
- Real-time chat with emoji reactions
- Split-screen layout with video and participant list
- Responsive design for desktop and mobile devices

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- MongoDB with Mongoose
- NextAuth.js for authentication
- Socket.IO for real-time communication
- TailwindCSS for styling
- Framer Motion for animations

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/umeet.git
cd umeet
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-chars
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and database connection
- `/models` - MongoDB models
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License # UMeet
