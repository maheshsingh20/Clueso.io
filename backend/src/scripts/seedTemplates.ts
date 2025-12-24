import mongoose from 'mongoose';
import { Template } from '../models/Template';
import { User } from '../models/User';
import { config } from '../config';

const sampleTemplates = [
  {
    name: "Professional Business Presentation",
    description: "Clean and modern template perfect for business presentations, quarterly reports, and corporate communications.",
    category: "Business",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    features: ["Clean Design", "Corporate Colors", "Data Visualization", "Professional Fonts"],
    tags: ["business", "corporate", "presentation", "professional", "clean"],
    rating: 4.8,
    views: 2340,
    downloads: 456,
    isPremium: false,
    duration: 120,
    aspectRatio: "16:9",
    resolution: "1920x1080",
    templateData: {
      scenes: [
        {
          id: "intro",
          type: "intro",
          duration: 15,
          elements: [
            { type: "text", properties: { content: "Company Name", fontSize: 48, color: "#1e40af" } },
            { type: "text", properties: { content: "Quarterly Report", fontSize: 24, color: "#64748b" } }
          ]
        },
        {
          id: "content",
          type: "content", 
          duration: 90,
          elements: [
            { type: "text", properties: { content: "Key Metrics", fontSize: 36, color: "#1e40af" } },
            { type: "shape", properties: { type: "chart", chartType: "bar" } }
          ]
        },
        {
          id: "outro",
          type: "outro",
          duration: 15,
          elements: [
            { type: "text", properties: { content: "Thank You", fontSize: 42, color: "#1e40af" } }
          ]
        }
      ],
      style: {
        colors: ["#1e40af", "#3b82f6", "#64748b", "#f8fafc"],
        fonts: ["Inter", "Roboto"],
        animations: ["fadeIn", "slideUp", "zoomIn"]
      },
      settings: {
        backgroundColor: "#f8fafc",
        transitionDuration: 0.5
      }
    }
  },
  {
    name: "Social Media Story Template",
    description: "Eye-catching vertical template designed for Instagram Stories, TikTok, and other social media platforms.",
    category: "Social Media",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    features: ["Vertical Format", "Trendy Design", "Social Optimized", "Mobile Friendly"],
    tags: ["social", "instagram", "tiktok", "story", "vertical", "mobile"],
    rating: 4.9,
    views: 5670,
    downloads: 1234,
    isPremium: true,
    price: 9.99,
    duration: 30,
    aspectRatio: "9:16",
    resolution: "1080x1920",
    templateData: {
      scenes: [
        {
          id: "hook",
          type: "intro",
          duration: 5,
          elements: [
            { type: "text", properties: { content: "Did You Know?", fontSize: 32, color: "#ec4899" } },
            { type: "animation", properties: { type: "bounce", duration: 1 } }
          ]
        },
        {
          id: "content",
          type: "content",
          duration: 20,
          elements: [
            { type: "text", properties: { content: "Your Content Here", fontSize: 24, color: "#1f2937" } },
            { type: "shape", properties: { type: "gradient", colors: ["#ec4899", "#8b5cf6"] } }
          ]
        },
        {
          id: "cta",
          type: "outro",
          duration: 5,
          elements: [
            { type: "text", properties: { content: "Follow for More!", fontSize: 28, color: "#ffffff" } }
          ]
        }
      ],
      style: {
        colors: ["#ec4899", "#8b5cf6", "#1f2937", "#ffffff"],
        fonts: ["Poppins", "Nunito"],
        animations: ["bounce", "pulse", "slideIn"]
      },
      settings: {
        backgroundColor: "#fdf2f8",
        transitionDuration: 0.3
      }
    }
  },
  {
    name: "Educational Tutorial Template",
    description: "Perfect for online courses, tutorials, and educational content with clear structure and engaging visuals.",
    category: "Education",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    features: ["Step-by-Step Layout", "Educational Icons", "Progress Indicators", "Clear Typography"],
    tags: ["education", "tutorial", "learning", "course", "teaching"],
    rating: 4.7,
    views: 3210,
    downloads: 678,
    isPremium: false,
    duration: 180,
    aspectRatio: "16:9",
    resolution: "1920x1080",
    templateData: {
      scenes: [
        {
          id: "title",
          type: "intro",
          duration: 10,
          elements: [
            { type: "text", properties: { content: "Lesson Title", fontSize: 44, color: "#059669" } },
            { type: "text", properties: { content: "Chapter 1", fontSize: 20, color: "#6b7280" } }
          ]
        },
        {
          id: "lesson",
          type: "content",
          duration: 150,
          elements: [
            { type: "text", properties: { content: "Learning Objective", fontSize: 32, color: "#059669" } },
            { type: "shape", properties: { type: "progress", value: 0.3 } }
          ]
        },
        {
          id: "summary",
          type: "outro",
          duration: 20,
          elements: [
            { type: "text", properties: { content: "Key Takeaways", fontSize: 36, color: "#059669" } }
          ]
        }
      ],
      style: {
        colors: ["#059669", "#10b981", "#6b7280", "#f9fafb"],
        fonts: ["Source Sans Pro", "Lato"],
        animations: ["fadeIn", "slideRight", "highlight"]
      },
      settings: {
        backgroundColor: "#f9fafb",
        transitionDuration: 0.4
      }
    }
  },
  {
    name: "Product Launch Promo",
    description: "High-energy promotional template perfect for product launches, announcements, and marketing campaigns.",
    category: "Marketing",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    features: ["Dynamic Animations", "Call-to-Action", "Product Showcase", "Brand Colors"],
    tags: ["marketing", "promo", "product", "launch", "announcement", "commercial"],
    rating: 4.6,
    views: 4560,
    downloads: 892,
    isPremium: true,
    price: 14.99,
    duration: 60,
    aspectRatio: "16:9",
    resolution: "1920x1080",
    templateData: {
      scenes: [
        {
          id: "teaser",
          type: "intro",
          duration: 10,
          elements: [
            { type: "text", properties: { content: "Coming Soon", fontSize: 48, color: "#dc2626" } },
            { type: "animation", properties: { type: "flash", duration: 0.5 } }
          ]
        },
        {
          id: "reveal",
          type: "content",
          duration: 40,
          elements: [
            { type: "text", properties: { content: "Product Name", fontSize: 52, color: "#dc2626" } },
            { type: "image", properties: { placeholder: "product-image" } }
          ]
        },
        {
          id: "cta",
          type: "outro",
          duration: 10,
          elements: [
            { type: "text", properties: { content: "Get Yours Now!", fontSize: 40, color: "#ffffff" } }
          ]
        }
      ],
      style: {
        colors: ["#dc2626", "#ef4444", "#1f2937", "#ffffff"],
        fonts: ["Montserrat", "Oswald"],
        animations: ["flash", "zoom", "rotate"]
      },
      settings: {
        backgroundColor: "#1f2937",
        transitionDuration: 0.2
      }
    }
  },
  {
    name: "Entertainment Show Intro",
    description: "Fun and vibrant template for entertainment content, shows, podcasts, and creative projects.",
    category: "Entertainment",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
    features: ["Vibrant Colors", "Fun Animations", "Music Sync", "Creative Elements"],
    tags: ["entertainment", "show", "podcast", "fun", "creative", "colorful"],
    rating: 4.5,
    views: 2890,
    downloads: 567,
    isPremium: false,
    duration: 45,
    aspectRatio: "16:9",
    resolution: "1920x1080",
    templateData: {
      scenes: [
        {
          id: "intro",
          type: "intro",
          duration: 15,
          elements: [
            { type: "text", properties: { content: "Show Name", fontSize: 56, color: "#f59e0b" } },
            { type: "animation", properties: { type: "rainbow", duration: 2 } }
          ]
        },
        {
          id: "host",
          type: "content",
          duration: 20,
          elements: [
            { type: "text", properties: { content: "Hosted by", fontSize: 24, color: "#7c3aed" } },
            { type: "text", properties: { content: "Host Name", fontSize: 36, color: "#f59e0b" } }
          ]
        },
        {
          id: "start",
          type: "outro",
          duration: 10,
          elements: [
            { type: "text", properties: { content: "Let's Begin!", fontSize: 44, color: "#ec4899" } }
          ]
        }
      ],
      style: {
        colors: ["#f59e0b", "#ec4899", "#7c3aed", "#1f2937"],
        fonts: ["Fredoka One", "Quicksand"],
        animations: ["rainbow", "bounce", "spin"]
      },
      settings: {
        backgroundColor: "#1f2937",
        transitionDuration: 0.3
      }
    }
  },
  {
    name: "Minimalist Presentation",
    description: "Clean, minimal design perfect for modern presentations, portfolios, and professional content.",
    category: "Presentation",
    thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
    features: ["Minimal Design", "Clean Typography", "Subtle Animations", "Professional Look"],
    tags: ["minimal", "clean", "professional", "simple", "modern", "presentation"],
    rating: 4.9,
    views: 1890,
    downloads: 423,
    isPremium: false,
    duration: 90,
    aspectRatio: "16:9",
    resolution: "1920x1080",
    templateData: {
      scenes: [
        {
          id: "title",
          type: "intro",
          duration: 15,
          elements: [
            { type: "text", properties: { content: "Presentation Title", fontSize: 42, color: "#374151" } }
          ]
        },
        {
          id: "content",
          type: "content",
          duration: 60,
          elements: [
            { type: "text", properties: { content: "Content Section", fontSize: 32, color: "#374151" } }
          ]
        },
        {
          id: "end",
          type: "outro",
          duration: 15,
          elements: [
            { type: "text", properties: { content: "Thank You", fontSize: 38, color: "#374151" } }
          ]
        }
      ],
      style: {
        colors: ["#374151", "#6b7280", "#f9fafb", "#ffffff"],
        fonts: ["Inter", "System UI"],
        animations: ["fadeIn", "slideUp"]
      },
      settings: {
        backgroundColor: "#ffffff",
        transitionDuration: 0.6
      }
    }
  }
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign as creator (or create a default one)
    let user = await User.findOne({ email: 'admin@clueso.io' });
    if (!user) {
      user = new User({
        email: 'admin@clueso.io',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'owner'
      });
      await user.save();
      console.log('Created admin user');
    }

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert sample templates
    const templatesWithCreator = sampleTemplates.map(template => ({
      ...template,
      createdBy: user!._id
    }));

    await Template.insertMany(templatesWithCreator);
    console.log(`Inserted ${sampleTemplates.length} sample templates`);

    console.log('Template seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTemplates();