# Deployment Guide

This guide will help you deploy your ByteVideoChat application to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account
- Render account
- MongoDB Atlas account (already configured)

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub
1. Initialize git repository if not already done:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub and push your code:
   ```bash
   git remote add origin https://github.com/yourusername/ByteVideoChat.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Click "Deploy"

### Step 3: Update Environment Configuration
After deployment, Vercel will provide you with a URL (e.g., `https://your-app.vercel.app`). Update your backend CORS configuration with this URL.

## Backend Deployment (Render)

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `bytevideochat-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 2: Set Environment Variables
In Render dashboard, go to your service → Environment tab and add:
- `NODE_ENV`: `production`
- `MONGODB_URI`: `mongodb+srv://tanushr20:Tanush@chatbot.kdrvim3.mongodb.net/?retryWrites=true&w=majority&appName=ChatBot`
- `CORS_ORIGINS`: `https://your-frontend-url.vercel.app,http://localhost:3000`

### Step 3: Deploy
Click "Create Web Service" to deploy your backend.

## Post-Deployment Configuration

### Update Frontend Environment
1. After backend deployment, you'll get a Render URL (e.g., `https://bytevideochat-backend.onrender.com`)
2. Update `frontend/src/environment.js`:
   ```javascript
   let IS_PROD = true;
   const server = IS_PROD ?
       "https://your-backend-url.onrender.com/" :
       "http://localhost:8000"
   
   export default server;
   ```

### Update Backend CORS
1. In Render dashboard, update the `CORS_ORIGINS` environment variable with your actual Vercel URL
2. Redeploy the backend service

## Testing Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test API endpoints at `https://your-backend-url.onrender.com/api/v1/users`
3. **Full Integration**: Test the complete video chat functionality

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure your frontend URL is added to `CORS_ORIGINS`
2. **Build Failures**: Check that all dependencies are in `package.json`
3. **Database Connection**: Verify MongoDB URI is correct
4. **Environment Variables**: Ensure all required variables are set in Render

### Logs:
- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check service logs in Render dashboard

## URLs After Deployment
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
