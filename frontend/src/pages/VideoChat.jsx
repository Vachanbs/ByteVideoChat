import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel,
  Box,
  Typography,
  Badge
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  CallEnd as CallEndIcon,
  FiberManualRecord as RecordIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import io from 'socket.io-client';
import server from '../environment';

const server_url = server;

export default function VideoChat() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Video/audio states
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessageCount, setNewMessageCount] = useState(0);
  
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef1 = useRef(null);
  const remoteVideoRef2 = useRef(null);
  
  // Socket ref
  const socketRef = useRef(null);

  // Create theme based on mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#90caf9' : '#1976d2',
      },
      background: {
        default: isDarkMode ? '#121212' : '#ffffff',
        paper: isDarkMode ? '#1e1e1e' : '#f5f5f5',
      },
    },
  });

  // Mock participants for demo
  const participants = [
    { name: 'Assatnion', id: 1 },
    { name: 'Onsane', id: 2 },
    { name: 'Aicsssenit', id: 3 }
  ];

  useEffect(() => {
    // Initialize video stream
    initializeVideo();
    
    // Connect to socket
    connectToSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        
        // Set initial states based on actual stream tracks
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        if (videoTrack) {
          setIsVideoOn(videoTrack.enabled);
        }
        if (audioTrack) {
          setIsAudioOn(audioTrack.enabled);
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      // Set states to false if permission denied
      setIsVideoOn(false);
      setIsAudioOn(false);
    }
  };

  const connectToSocket = () => {
    socketRef.current = io.connect(server_url);
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });
    
    socketRef.current.on('chat-message', (data, sender) => {
      setMessages(prev => [...prev, { sender, data }]);
      setNewMessageCount(prev => prev + 1);
    });
  };

  const handleVideoToggle = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  const handleAudioToggle = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const audioTrack = stream.getAudioTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    } else {
      setIsAudioOn(!isAudioOn);
    }
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Implement screen sharing logic
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    // Implement recording logic
  };

  const handleChatToggle = () => {
    setShowChat(!showChat);
    if (showChat) {
      setNewMessageCount(0);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit('chat-message', message, 'You');
      setMessages(prev => [...prev, { sender: 'You', data: message }]);
      setMessage('');
    }
  };

  const handleEndCall = () => {
    // Stop all media tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Navigate back to home
    window.location.href = '/home';
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          color: 'text.primary',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="h1">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Typography>
          
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={handleThemeToggle}
                    icon={<WbSunnyIcon sx={{ color: '#FFA500' }} />}
                    checkedIcon={<DarkModeIcon />}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        backgroundColor: isDarkMode ? '#90caf9' : '#ffa726',
                      },
                    }}
                  />
                }
                label=""
              />
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Video Grid */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            {/* Main Video */}
            <Box
              sx={{
                width: '100%',
                maxWidth: '800px',
                aspectRatio: '16/9',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                overflow: 'hidden',
                border: 2,
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>

            {/* Remote Videos */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                width: '100%',
                maxWidth: '800px',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '200px',
                  aspectRatio: '16/9',
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: 2,
                  borderColor: 'divider',
                }}
              >
                <video
                  ref={remoteVideoRef1}
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              
              <Box
                sx={{
                  width: '200px',
                  aspectRatio: '16/9',
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: 2,
                  borderColor: 'divider',
                }}
              >
                <video
                  ref={remoteVideoRef2}
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Chat Sidebar */}
          {showChat && (
            <Box
              sx={{
                width: '300px',
                backgroundColor: 'background.paper',
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="h6">Chat</Typography>
              </Box>
              
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflow: 'auto',
                }}
              >
                {participants.map((participant) => (
                  <Box
                    key={participant.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'background.default',
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1,
                        color: 'primary.contrastText',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {participant.name.charAt(0)}
                    </Box>
                    <Typography variant="body2">{participant.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Controls */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {/* Control Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={handleAudioToggle}
              sx={{
                color: isAudioOn ? 'text.primary' : 'error.main',
                backgroundColor: isAudioOn ? 'background.default' : 'error.light',
                '&:hover': {
                  backgroundColor: isAudioOn ? 'action.hover' : 'error.main',
                  color: 'error.contrastText',
                },
              }}
            >
              {isAudioOn ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <IconButton
              onClick={handleVideoToggle}
              sx={{
                color: isVideoOn ? 'text.primary' : 'error.main',
                backgroundColor: isVideoOn ? 'background.default' : 'error.light',
                '&:hover': {
                  backgroundColor: isVideoOn ? 'action.hover' : 'error.main',
                  color: 'error.contrastText',
                },
              }}
            >
              {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              onClick={handleScreenShare}
              sx={{
                color: isScreenSharing ? 'primary.main' : 'text.primary',
                backgroundColor: isScreenSharing ? 'primary.light' : 'background.default',
              }}
            >
              {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>

            <IconButton
              onClick={handleRecording}
              sx={{
                color: isRecording ? 'error.main' : 'text.primary',
                backgroundColor: isRecording ? 'error.light' : 'background.default',
              }}
            >
              <RecordIcon />
            </IconButton>

            <Badge badgeContent={newMessageCount} color="error">
              <IconButton
                onClick={handleChatToggle}
                sx={{
                  color: showChat ? 'primary.main' : 'text.primary',
                  backgroundColor: showChat ? 'primary.light' : 'background.default',
                }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </Box>

          {/* Input and End Call */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                startAdornment: (
                  <IconButton size="small">
                    <MicIcon />
                  </IconButton>
                ),
              }}
              variant="outlined"
              size="small"
            />
            
            <Button
              variant="contained"
              color="error"
              onClick={handleEndCall}
              startIcon={<CallEndIcon />}
              sx={{
                minWidth: '120px',
                height: '40px',
              }}
            >
              End Call
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
