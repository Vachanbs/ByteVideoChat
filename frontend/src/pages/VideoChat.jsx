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
  const [messages, setMessages] = useState([
    {
      sender: 'Assatnion',
      data: 'Hello everyone! How is the meeting going?',
      timestamp: '10:30 AM'
    },
    {
      sender: 'Onsane',
      data: 'Great! The video quality is excellent.',
      timestamp: '10:31 AM'
    },
    {
      sender: 'You',
      data: 'Thanks for joining everyone!',
      timestamp: '10:32 AM'
    }
  ]);
  const [newMessageCount, setNewMessageCount] = useState(0);
  
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef1 = useRef(null);
  const remoteVideoRef2 = useRef(null);
  
  // Socket ref
  const socketRef = useRef(null);
  
  // Audio recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

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
      const messageData = {
        sender,
        data,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, messageData]);
      setNewMessageCount(prev => prev + 1);
    });

    // Listen for voice messages
    socketRef.current.on('voice-message', (audioData, sender) => {
      playVoiceMessage(audioData, sender);
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder for voice messages
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        sendVoiceMessage(audioBlob);
      };

      // Start recording
      mediaRecorderRef.current.start();
      
      // Set up audio context for real-time audio processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      
      console.log('Voice recording started');
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    console.log('Voice recording stopped');
  };

  const sendVoiceMessage = (audioBlob) => {
    if (socketRef.current && audioBlob.size > 0) {
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result;
        socketRef.current.emit('voice-message', base64Audio, 'You');
        
        // Add voice message to chat
        const voiceMessage = {
          sender: 'You',
          data: '🎤 Voice message',
          timestamp: new Date().toLocaleTimeString(),
          isVoice: true,
          audioData: base64Audio
        };
        setMessages(prev => [...prev, voiceMessage]);
      };
      reader.readAsDataURL(audioBlob);
    }
  };

  const playVoiceMessage = (audioData, sender) => {
    try {
      const audio = new Audio(audioData);
      audio.play();
      
      // Add voice message to chat
      const voiceMessage = {
        sender,
        data: '🎤 Voice message',
        timestamp: new Date().toLocaleTimeString(),
        isVoice: true,
        audioData: audioData
      };
      setMessages(prev => [...prev, voiceMessage]);
      setNewMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error playing voice message:', error);
    }
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

  const handleAudioToggle = async () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const audioTrack = stream.getAudioTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        
        // Start/stop voice chat recording
        if (audioTrack.enabled) {
          await startVoiceRecording();
        } else {
          stopVoiceRecording();
        }
      }
    } else {
      setIsAudioOn(!isAudioOn);
      if (isAudioOn) {
        await startVoiceRecording();
      } else {
        stopVoiceRecording();
      }
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
      const messageData = {
        sender: 'You',
        data: message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      socketRef.current.emit('chat-message', message, 'You');
      setMessages(prev => [...prev, messageData]);
      setMessage('');
    }
  };

  const handleEndCall = () => {
    // Stop all media tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Stop voice recording
    stopVoiceRecording();
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
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
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
            zIndex: 0,
          },
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
            position: 'relative',
            zIndex: 1,
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h6" component="h1">
            {isDarkMode ? 'Video Chat' : 'Video Chat'}
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
            zIndex: 1,
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
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
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
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
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
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
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
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
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
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Messages Display */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    mb: 2,
                    maxHeight: '300px',
                  }}
                >
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: message.sender === 'You' ? 'primary.light' : 'background.default',
                          alignSelf: message.sender === 'You' ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: message.sender === 'You' ? 'primary.contrastText' : 'text.secondary',
                          }}
                        >
                          {message.sender}
                        </Typography>
                        {message.isVoice ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: message.sender === 'You' ? 'primary.contrastText' : 'text.primary',
                              }}
                            >
                              {message.data}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const audio = new Audio(message.audioData);
                                audio.play();
                              }}
                              sx={{
                                color: message.sender === 'You' ? 'primary.contrastText' : 'primary.main',
                                backgroundColor: message.sender === 'You' ? 'rgba(255,255,255,0.2)' : 'primary.light',
                                '&:hover': {
                                  backgroundColor: message.sender === 'You' ? 'rgba(255,255,255,0.3)' : 'primary.main',
                                  color: 'primary.contrastText',
                                },
                              }}
                            >
                              ▶️
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: message.sender === 'You' ? 'primary.contrastText' : 'text.primary',
                            }}
                          >
                            {message.data}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: message.sender === 'You' ? 'primary.contrastText' : 'text.secondary',
                            fontSize: '0.7rem',
                          }}
                        >
                          {message.timestamp}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        mt: 2,
                      }}
                    >
                      No messages yet. Start the conversation!
                    </Typography>
                  )}
                </Box>

                {/* Participants List */}
                <Box
                  sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    pt: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      color: 'text.secondary',
                      fontWeight: 'bold',
                    }}
                  >
                    Participants
                  </Typography>
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
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1,
                          color: 'primary.contrastText',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {participant.name.charAt(0)}
                      </Box>
                      <Typography variant="caption">{participant.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Chat Input */}
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    size="small"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                  <IconButton
                    onClick={async () => {
                      if (isAudioOn) {
                        await startVoiceRecording();
                        setTimeout(() => {
                          stopVoiceRecording();
                        }, 3000); // Record for 3 seconds
                      }
                    }}
                    disabled={!isAudioOn}
                    size="small"
                    sx={{
                      color: isAudioOn ? 'primary.main' : 'text.disabled',
                      backgroundColor: isAudioOn ? 'primary.light' : 'background.default',
                    }}
                  >
                    🎤
                  </IconButton>
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    size="small"
                    sx={{
                      minWidth: '60px',
                      height: '32px',
                    }}
                  >
                    Send
                  </Button>
                </Box>
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
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            borderTop: 1,
            borderColor: 'divider',
            position: 'relative',
            zIndex: 1,
            backdropFilter: 'blur(10px)',
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
