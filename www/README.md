# Verby Website

A modern, cloud-themed landing page for Verby - your calm inbox companion.

## Project Overview

Verby is a digital assistant designed to simplify communication by managing emails and chats. The website serves as a landing page to showcase Verby's capabilities with a calming, cloud-themed design that emphasizes ease of use and productivity.

## 🎯 Key Features

### Hero Section
- Full-height, responsive two-column layout
- Animated floating clouds using CSS keyframes
- Character image with cloud background
- Neumorphic "Get Started" button
- Integration badges for Gmail, Slack, and Teams
- Gradient backgrounds with radial overlays

### Features Section
- Three feature cards with icons:
  - Smart Summaries (AI-powered email/chat summaries)
  - Prioritized Inbox (auto-sorting)
  - Voice Playback (audio summaries)
- Framer Motion animations for scroll reveal
- Neumorphic card design with hover effects

### Footer
- Dark green background (#2d3436)
- Logo and brand section
- Product and Company navigation
- Responsive grid layout
- Animated link hover effects

## 🎨 Design System

### Colors
- Primary: #8de0ad (mint green)
- Light: #a7ebc3 (soft green)
- Dark: #2d3436 (charcoal)

### Animations
- Cloud floating animation
- Hover effects on buttons and links
- Scroll-triggered animations
- Reduced motion support

### Typography
- Responsive font sizes
- Custom heading styles
- Consistent text hierarchy

### Components
- Neumorphic shadows
- Gradient overlays
- Responsive containers
- Accessible interactive elements

## 🛠 Technical Stack

- **Framework**: Next.js 15.2.4 with TypeScript
- **Styling**: Tailwind CSS with custom configuration
- **UI Components**: Radix UI for accessible components
- **Animations**: Framer Motion for smooth transitions
- **Asset Management**: Next/Image for optimized images
- **Performance**: SSR hydration, lazy loading, hardware-accelerated animations

## 📁 Project Structure

```
verby-website/
├── app/
│   ├── layout.tsx    # Theme and global configuration
│   ├── page.tsx      # Main landing page
│   └── globals.css   # Global styles and animations
├── components/
│   ├── hero.tsx      # Hero section with animations
│   ├── features.tsx  # Feature cards component
│   ├── footer.tsx    # Footer with navigation
│   └── ui/          # Reusable UI components
├── public/
│   └── images/
│       ├── cloud.png
│       ├── guy.png
│       └── cloudguy.png
└── tailwind.config.ts
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Use Cases

1. **Email Management**
   - Organize and prioritize emails
   - Integration with popular email clients

2. **Chat Integration**
   - Seamless integration with Slack and Teams
   - Unified communication management

3. **Productivity Enhancement**
   - Time-saving features
   - Automated communication handling

## ♿ Accessibility

- Semantic HTML structure
- ARIA-compliant Radix UI components
- Color contrast compliance
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support

## 🔍 Testing Considerations

1. **Cross-browser Compatibility**
   - Tested on modern browsers
   - Fallbacks for older browsers
   - CSS property checks

2. **Performance Metrics**
   - Fast initial load
   - Optimized assets
   - Smooth animations
   - Efficient hydration

## 🎨 Design Principles

1. **Visual Hierarchy**
   - Clear typography scale
   - Consistent spacing
   - Prominent CTAs
   - Subtle animations

2. **Brand Identity**
   - Cloud theme throughout
   - Consistent color palette
   - Modern, clean aesthetic
   - Calming visual elements

3. **User Experience**
   - Smooth transitions
   - Clear navigation
   - Responsive interactions
   - Accessible design

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
