import express, { Request, Response } from 'express';
import cors from 'cors';
import { ApiResponse, PaginatedResponse } from '@clueso/shared';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://192.168.56.1:3000',
    'http://192.168.56.1:3001',
    'http://192.168.189.1:3000',
    'http://192.168.189.1:3001',
    'http://10.244.233.120:3000',
    'http://10.244.233.120:3001'
  ],
  credentials: true
}));
app.use(express.json());

// Simple health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };
  res.json(response);
});

// Mock auth endpoints
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Mock authentication
  if (email && password) {
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          _id: '1',
          email: email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'owner'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      },
      message: 'Login successful'
    };
    res.json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      error: 'Email and password required'
    };
    res.status(400).json(response);
  }
});

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (email && password && firstName && lastName) {
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          _id: '1',
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'owner'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      },
      message: 'User registered successfully'
    };
    res.status(201).json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      error: 'All fields are required'
    };
    res.status(400).json(response);
  }
});

// Mock projects endpoint
app.get('/api/v1/projects', (req: Request, res: Response) => {
  const response: ApiResponse<PaginatedResponse<any>> = {
    success: true,
    data: {
      data: [
        {
          _id: '1',
          name: 'Demo Project',
          description: 'A sample project for demonstration',
          workspace: { name: 'Demo Workspace' },
          videos: [],
          collaborators: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      }
    }
  };
  res.json(response);
});

// Mock videos endpoint
app.get('/api/v1/videos', (req: Request, res: Response) => {
  const response: ApiResponse<PaginatedResponse<any>> = {
    success: true,
    data: {
      data: [
        {
          _id: '1',
          title: 'Demo Video',
          description: 'A sample video',
          status: 'ready',
          createdAt: new Date().toISOString(),
          processing: {
            stage: 'complete',
            progress: 100
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      }
    }
  };
  res.json(response);
});

// Mock workspaces endpoint
app.get('/api/v1/workspaces', (req: Request, res: Response) => {
  const response: ApiResponse<PaginatedResponse<any>> = {
    success: true,
    data: {
      data: [
        {
          _id: '1',
          name: 'Demo Workspace',
          description: 'A sample workspace',
          owner: '1',
          members: [],
          projects: ['1'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      }
    }
  };
  res.json(response);
});

// Create workspace
app.post('/api/v1/workspaces', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const response: ApiResponse = {
    success: true,
    data: {
      workspace: {
        _id: Date.now().toString(),
        name,
        description,
        owner: '1',
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    message: 'Workspace created successfully'
  };
  res.status(201).json(response);
});

// Get single workspace
app.get('/api/v1/workspaces/:id', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      workspace: {
        _id: req.params.id,
        name: 'Demo Workspace',
        description: 'A sample workspace',
        owner: '1',
        members: [],
        projects: ['1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  };
  res.json(response);
});

// Create project
app.post('/api/v1/projects', (req: Request, res: Response) => {
  const { name, description, workspaceId } = req.body;
  const response: ApiResponse = {
    success: true,
    data: {
      project: {
        _id: Date.now().toString(),
        name,
        description,
        workspace: workspaceId,
        owner: '1',
        videos: [],
        collaborators: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    message: 'Project created successfully'
  };
  res.status(201).json(response);
});

// Get single project
app.get('/api/v1/projects/:id', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      project: {
        _id: req.params.id,
        name: 'Demo Project',
        description: 'A sample project',
        workspace: { _id: '1', name: 'Demo Workspace' },
        owner: '1',
        videos: [],
        documents: [],
        collaborators: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  };
  res.json(response);
});

// Get single video
app.get('/api/v1/videos/:id', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      video: {
        _id: req.params.id,
        title: 'Demo Video',
        description: 'A sample video',
        project: '1',
        status: 'ready',
        originalFile: {
          url: 'https://example.com/video.mp4',
          duration: 120,
          format: 'mp4',
          size: 1024000
        },
        transcript: {
          originalText: 'This is a demo transcript of the video content.',
          enhancedText: 'This is an AI-enhanced version of the transcript with improved clarity and structure.'
        },
        captions: [
          {
            id: '1',
            start: 0,
            end: 5,
            text: 'Welcome to this demo video'
          },
          {
            id: '2',
            start: 5,
            end: 10,
            text: 'This shows the caption functionality'
          }
        ],
        metadata: {
          keyframes: [
            { timestamp: 0, thumbnail: 'https://via.placeholder.com/640x360?text=Frame+1' },
            { timestamp: 30, thumbnail: 'https://via.placeholder.com/640x360?text=Frame+2' },
            { timestamp: 60, thumbnail: 'https://via.placeholder.com/640x360?text=Frame+3' }
          ]
        },
        processing: {
          stage: 'complete',
          progress: 100
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  };
  res.json(response);
});

// AI Enhancement endpoints
app.post('/api/v1/ai/enhance-script', (req: Request, res: Response) => {
  const { text } = req.body;

  // Simulate AI enhancement
  const enhanced = text
    .replace(/um|uh|like|you know/gi, '')
    .split('.')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('. ') + '.';

  const response: ApiResponse = {
    success: true,
    data: {
      originalText: text,
      enhancedText: enhanced,
      improvements: [
        'Removed filler words',
        'Improved capitalization',
        'Enhanced sentence structure'
      ]
    }
  };
  res.json(response);
});

app.post('/api/v1/ai/generate-summary', (req: Request, res: Response) => {
  const { text } = req.body;

  const response: ApiResponse = {
    success: true,
    data: {
      summary: 'This is an AI-generated summary of the content, highlighting the key points and main ideas discussed in the video.',
      keyPoints: [
        'Main topic introduction',
        'Key concept explanation',
        'Practical examples',
        'Conclusion and takeaways'
      ]
    }
  };
  res.json(response);
});

app.post('/api/v1/ai/generate-tags', (req: Request, res: Response) => {
  const { text, title } = req.body;

  const response: ApiResponse = {
    success: true,
    data: {
      tags: ['tutorial', 'demo', 'educational', 'how-to', 'guide'],
      categories: ['Education', 'Technology', 'Tutorial']
    }
  };
  res.json(response);
});

// Analytics endpoints
app.get('/api/v1/analytics/overview', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      totalVideos: 12,
      totalProjects: 5,
      totalWorkspaces: 2,
      processingVideos: 2,
      storageUsed: '2.5 GB',
      storageLimit: '10 GB',
      recentActivity: [
        {
          type: 'video_created',
          message: 'New video uploaded',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          type: 'project_created',
          message: 'New project created',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    }
  };
  res.json(response);
});

// Templates endpoint
app.get('/api/v1/templates', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      templates: [
        {
          _id: '1',
          name: 'Tutorial Template',
          description: 'Perfect for educational content',
          category: 'Education',
          thumbnail: 'https://via.placeholder.com/300x200?text=Tutorial',
          features: ['Intro/Outro', 'Captions', 'Chapters']
        },
        {
          _id: '2',
          name: 'Product Demo',
          description: 'Showcase your product features',
          category: 'Business',
          thumbnail: 'https://via.placeholder.com/300x200?text=Product+Demo',
          features: ['Highlights', 'Call-to-Action', 'Branding']
        },
        {
          _id: '3',
          name: 'Social Media',
          description: 'Optimized for social platforms',
          category: 'Marketing',
          thumbnail: 'https://via.placeholder.com/300x200?text=Social+Media',
          features: ['Square Format', 'Subtitles', 'Music']
        }
      ]
    }
  };
  res.json(response);
});

// Export endpoints
app.post('/api/v1/videos/:id/export', (req: Request, res: Response) => {
  const { format, quality } = req.body;

  const response: ApiResponse = {
    success: true,
    data: {
      exportId: Date.now().toString(),
      status: 'processing',
      format,
      quality,
      estimatedTime: '2-3 minutes'
    },
    message: 'Export started successfully'
  };
  res.json(response);
});

// Collaboration endpoints
app.get('/api/v1/projects/:id/activity', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      activities: [
        {
          _id: '1',
          user: { name: 'Demo User', avatar: null },
          action: 'uploaded video',
          target: 'Tutorial Video.mp4',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          _id: '2',
          user: { name: 'Demo User', avatar: null },
          action: 'edited script',
          target: 'Introduction',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    }
  };
  res.json(response);
});

// Catch all other routes
app.use('*', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: 'Route not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  };
  res.status(404).json(response);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
});