# Trinck - Modern Transport Platform

A comprehensive transport platform built with Next.js, React, and modern web technologies. Connect drivers with customers for seamless transportation services with real-time tracking, secure payments, and beautiful 3D animations.

## 🚀 Features

### Core Functionality
- **Driver & Customer Registration/Login** - Separate portals for drivers and customers
- **Job Posting & Bidding System** - Customers can post jobs, drivers can bid
- **Real-time Tracking** - GPS tracking for shipments
- **Wallet System** - Secure payment processing for both drivers and customers
- **Rating & Review System** - Maintain quality standards
- **Notification System** - Real-time updates and alerts

### Modern UI/UX
- **3D Animations** - Interactive 3D truck model on homepage
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Modern Design** - Clean, professional interface
- **Dark/Light Mode** - User preference support

### Technical Features
- **TypeScript** - Full type safety
- **Next.js 14** - Latest React framework
- **Tailwind CSS** - Utility-first styling
- **Three.js** - 3D graphics and animations
- **Zustand** - State management
- **Real-time Updates** - Socket.io integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **State Management**: Zustand
- **Icons**: Lucide React
- **Real-time**: Socket.io
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trinck-website.git
   cd trinck-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
trinck-website/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Truck3D.tsx       # 3D truck model
│   ├── HeroSection.tsx    # Hero section
│   ├── JobPostForm.tsx    # Job posting form
│   └── Wallet.tsx         # Wallet component
├── store/                 # State management
│   └── useStore.ts        # Zustand store
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
├── public/                # Static assets
└── package.json           # Dependencies
```

## 🎯 Key Components

### Homepage (`app/page.tsx`)
- Hero section with 3D truck animation
- Feature showcase
- Statistics display
- Call-to-action sections

### Dashboard (`app/dashboard/page.tsx`)
- Job management interface
- Real-time statistics
- Quick actions
- Recent activity feed

### Authentication (`app/auth/login/page.tsx`)
- User type selection (Driver/Customer)
- Secure login form
- Social login integration
- Password recovery

### 3D Truck Model (`components/Truck3D.tsx`)
- Interactive 3D truck using Three.js
- Smooth animations and rotations
- Realistic lighting and materials

### Wallet System (`components/Wallet.tsx`)
- Balance display
- Transaction history
- Payment processing
- Withdrawal functionality

## 🚛 Features for Drivers

- **Job Discovery** - Browse available transportation jobs
- **Bidding System** - Place competitive bids on jobs
- **Real-time Tracking** - Track active shipments
- **Earnings Management** - Monitor payments and withdrawals
- **Profile Management** - Update vehicle and license information
- **Rating System** - Build reputation through reviews

## 📦 Features for Customers

- **Job Posting** - Create detailed transportation requests
- **Driver Selection** - Choose from qualified drivers
- **Real-time Tracking** - Monitor shipment progress
- **Payment Processing** - Secure wallet-based payments
- **Communication** - Direct messaging with drivers
- **Review System** - Rate and review drivers

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800

### Components
- **Buttons**: Primary, Secondary, Ghost variants
- **Cards**: Elevated with hover effects
- **Forms**: Consistent styling with validation
- **Modals**: Overlay dialogs with animations

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SOCKET_URL=your_socket_url
```

### Tailwind Configuration
Custom colors and animations are defined in `tailwind.config.js`

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1920px and above
- **Laptop**: 1024px - 1919px
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Compatible with Next.js
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@trinck.com
- Documentation: [docs.trinck.com](https://docs.trinck.com)

## 🔮 Roadmap

### Phase 2 (Q2 2024)
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered route optimization
- [ ] Multi-language support

### Phase 3 (Q3 2024)
- [ ] Blockchain integration
- [ ] IoT device integration
- [ ] Advanced reporting
- [ ] API marketplace

---

**Built with ❤️ by the Trinck team**