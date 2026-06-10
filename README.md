# SANOS Driving School

Welcome to the SANOS Driving School web application repository. This is a modern, responsive web application built to serve as the online platform for Adelaide's trusted driving school. It allows students to find instructors, book lessons, view pricing, and manage their driving learning journey.

## 🚀 Tech Stack

This project is built using modern web development technologies:

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS V4 + Vanilla CSS
- **Routing:** React Router DOM (v7)
- **Icons:** Lucide React

## ✨ Features

- **Home Page:** Engaging landing page with hero sections, statistics, success stories, and testimonials.
- **Booking System:** Allow students to search for instructors by suburb/postcode, transmission type, and lesson type.
- **Pricing & Packages:** Detailed breakdown of lesson costs and value packages.
- **Overseas Licence Conversion:** Information and services for converting overseas licences.
- **Dashboards:** Dedicated portals for both Learners and Instructors to manage their schedules and progress.
- **Responsive Design:** Fully responsive and mobile-friendly layouts.
- **Interactive UI:** Smooth scroll reveal animations and a premium glassmorphism design.

## 📂 Project Structure

```
src/
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks (e.g., useInteractive for scroll reveals)
├── layouts/      # Main application layouts (Header, Footer)
├── pages/        # Route components (Home, Booking, Dashboards, Auth, etc.)
├── App.jsx       # Main application component and routing configuration
├── index.css     # Global CSS and Tailwind directives
└── main.jsx      # Application entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📜 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production into the `dist` folder.
- `npm run preview`: Bootstraps a local web server to preview the production build.
- `npm run lint`: Runs ESLint to check for linting errors.

## 🌟 About SANOS Driving School

Founded by Santosh Dhakal, SANOS Driving School is dedicated to providing high-quality, patient, and professional driving education in Adelaide. We focus on creating a supportive and stress-free environment for learners, specializing in high first-time pass rates, overseas licence conversions, and building confident drivers.
