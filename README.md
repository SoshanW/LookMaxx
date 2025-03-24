# LookMaxx

## Overview
LookMaxx is a comprehensive application that applies machine learning and facial analysis to help users improve their physical appearance. The platform offers facial feature recognition, personalized reports, community features, and casting opportunities.

## Features
- **Facial Feature Recognition (FFR)**: Upload photos to analyze facial features and receive tailored recommendations
- **Personalized Reports**: AI-generated reports with actionable advice for appearance enhancement
- **Community Platform**: Share progress, get feedback, and interact with other users
- **Payment Integration**: Secure payment processing for premium features
- **Casting Opportunities**: Connect with casting agencies and modeling opportunities

## Tech Stack

### Frontend
- React.js with Vite
- TailwindCSS for styling
- React Router for navigation
- Three.js and React Three Fiber for 3D visualizations
- GSAP and Framer Motion for animations

### Backend
- Flask Python framework
- MongoDB for database
- JWT for authentication
- AWS S3 for file storage
- Google Cloud services integration
- Anthropic AI integration for report generation

## Project Structure
```
LookMaxx/
├── client/              # Frontend React application
│   ├── src/             # Source code
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── server/              # Backend Flask application
│   ├── ML/              # Machine learning modules
│   │   └── facial_landmark_detection/ # Facial analysis algorithms
│   ├── Signup/          # Authentication module
│   ├── community/       # Community features
│   ├── paymentBe/       # Payment processing
│   └── casting/         # Casting and opportunities
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB
- AWS account for S3 storage
- Google Cloud account (optional)

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
```bash
cd server
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Environment Variables
Create a `.env` file in the server directory with necessary environment variables:
- MongoDB connection string
- AWS credentials
- JWT settings
- API keys for external services

## Contributors
- SDGP CS-37 Team Members

## License
[Your chosen license]
