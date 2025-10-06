# ByteVideoChat
A full stack video conferencing web application built with React and Node.js.

# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm start

## 🚀 Features
- Real-time video conferencing
- User authentication
- Meeting history
- Socket.io for real-time communication
- Responsive design

## 🛠️ Tech Stack
- **Frontend**: React, Material-UI, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **Database**: MongoDB Atlas

## 📋 Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

## 🏃‍♂️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ByteVideoChat.git
cd ByteVideoChat
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://vachanbs21:<db_password>@byte.ulqcs6e.mongodb.net/?retryWrites=true&w=majority&appName=BYTE
CORS_ORIGINS=http://localhost:3000
```

### 4. Run the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:8000`

#### Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## 🌐 Production URLs
- **Frontend**: https://bytevideochat.vercel.app
- **Backend**: https://bytevideochat.onrender.com

## 📁 Project Structure
```
ByteVideoChat/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   └── routes/         # API routes
│   ├── app.js              # Main application file
│   └── package.json
└── README.md
```

## 🚀 Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel (frontend) and Render (backend).

## 📝 Available Scripts

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Backend Scripts
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run prod       # Start with PM2 (production)
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the ISC License.
