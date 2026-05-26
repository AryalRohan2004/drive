import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";

/* ============================================
   MOCK DATA — Backend Developer: Replace these
   with API fetch calls (e.g., useSWR, React Query,
   or useEffect + fetch). Each array/object is
   self-contained for easy swapping.
   ============================================ */

// --- Instructor Profiles (swap with GET /api/instructors) ---
const MOCK_INSTRUCTORS = [
  {
    id: 1,
    name: "Michael Torres",
    photo: "/instructor_male_1.png",
    rating: 4.9,
    reviewCount: 312,
    car: "Toyota Corolla 2024",
    transmission: "Auto",
    hourlyRate: 65,
    isVerified: true,
    passRate: 94,
    yearsExperience: 8,
    suburb: "Bondi Junction",
  },
  {
    id: 2,
    name: "Sarah Chen",
    photo: "/instructor_female_2.png",
    rating: 4.8,
    reviewCount: 247,
    car: "Mazda 3 2023",
    transmission: "Manual",
    hourlyRate: 60,
    isVerified: true,
    passRate: 91,
    yearsExperience: 6,
    suburb: "Chatswood",
  },
  {
    id: 3,
    name: "Raj Patel",
    photo: "/instructor_male_2.png",
    rating: 4.9,
    reviewCount: 189,
    car: "Hyundai i30 2024",
    transmission: "Auto",
    hourlyRate: 58,
    isVerified: true,
    passRate: 96,
    yearsExperience: 10,
    suburb: "Parramatta",
  },
  {
    id: 4,
    name: "Emma Lawson",
    photo: "/instructor_female_1.png",
    rating: 4.7,
    reviewCount: 156,
    car: "Kia Cerato 2023",
    transmission: "Auto",
    hourlyRate: 55,
    isVerified: true,
    passRate: 89,
    yearsExperience: 4,
    suburb: "Manly",
  },
];

// --- How It Works Steps ---
const HOW_IT_WORKS_STEPS = [
  {
    icon: "search",
    title: "Search Your Area",
    description:
      "Enter your suburb or postcode to find top-rated instructors near you.",
  },
  {
    icon: "compare",
    title: "Compare Profiles & Cars",
    description:
      "Browse ratings, reviews, prices, and vehicle details to find your perfect match.",
  },
  {
    icon: "book",
    title: "Book & Drive",
    description:
      "Choose a time that suits you, pay securely online, and start learning.",
  },
];

// --- Trust & Safety Features ---
const TRUST_FEATURES = [
  {
    icon: "shield",
    title: "Background-Checked",
    description: "Every instructor passes a rigorous national background check.",
  },
  {
    icon: "car",
    title: "Dual-Control Vehicles",
    description:
      "All lesson cars are fitted with dual controls for your safety.",
  },
  {
    icon: "lock",
    title: "Secure Payments",
    description:
      "Your payments are protected with bank-level 256-bit encryption.",
  },
  {
    icon: "star",
    title: "Verified Reviews",
    description:
      "Only real students can leave reviews — no fakes, no paid reviews.",
  },
];

// --- Navigation Links ---
const NAV_LINKS = [
  { label: "For Learners", href: "/learners" },
  { label: "For Instructors", href: "/instructors" },
  { label: "Help", href: "/help" },
];

// --- Footer Link Groups ---
const FOOTER_LINKS = {
  product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Instructors", href: "/instructors" },
    { label: "Enterprise", href: "/enterprise" },
  ],
  support: [
    { label: "Help Centre", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Safety", href: "/safety" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};


/* ============================================
   ICON COMPONENTS
   Inline SVG icons for zero-dependency design.
   ============================================ */

function SearchIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4", filled = true }) {
  return filled ? (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ShieldIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CarIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function LockIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function CheckBadgeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

function MapPinIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function MenuIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XMarkIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}


function EyeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function EnvelopeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}


/* ============================================
   REUSABLE COMPONENTS
   ============================================ */

/**
 * Navigation Bar
 * - Fixed at top with glass morphism effect on scroll
 * - Responsive hamburger menu for mobile
 */
function Navbar({ onLoginClick, onSignupClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25 transition-transform duration-300 group-hover:scale-110">
              <CarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Drive<span className="text-gradient">Mate</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-lg hover:bg-brand-50/60 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLoginClick}
              id="nav-login-btn"
              className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 transition-all duration-200 cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onSignupClick}
              id="nav-signup-btn"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XMarkIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={onLoginClick}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={onSignupClick}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


/**
 * Hero Section
 * - Full-width gradient background with overlay
 * - Prominent floating search bar
 * - Social proof stats
 */
function HeroSection({
  searchQuery,
  onSearchChange,
  transmissionFilter,
  onTransmissionChange,
  onSearchSubmit,
}) {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background gradient & pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950" />
      <div className="absolute inset-0 bg-[url('/hero_driving.png')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-400/8 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/10 border border-white/15 text-sm text-brand-300 font-medium backdrop-blur-md">
          <SparklesIcon className="w-4 h-4" />
          <span>Trusted by 50,000+ learner drivers</span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
          style={{ animationDelay: "0.1s" }}
        >
          Find and Book the{" "}
          <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-300 bg-clip-text text-transparent">
            Perfect Driving Instructor
          </span>{" "}
          Near You
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in-up max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Compare vetted instructors, book instantly, and pass your test with
          confidence. Your road to freedom starts here.
        </p>

        {/* ===== SEARCH BAR — The Core Action ===== */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.35s" }}
        >
          <form
            onSubmit={onSearchSubmit}
            id="hero-search-form"
            className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            {/* Location Input */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-0">
              <MapPinIcon className="w-5 h-5 text-brand-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Enter suburb or postcode..."
                className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-base font-medium outline-none"
                id="hero-search-input"
              />
            </div>

            {/* Divider (desktop only) */}
            <div className="hidden sm:block w-px h-10 bg-slate-200" />

            {/* Transmission Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mx-2 sm:mx-0">
              {["Auto", "Manual"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => onTransmissionChange(type)}
                  id={`transmission-${type.toLowerCase()}-btn`}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    transmissionFilter === type
                      ? "bg-white text-brand-600 shadow-md shadow-brand-500/10"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              id="hero-search-btn"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap"
            >
              <SearchIcon className="w-5 h-5" />
              <span>Search Instructors</span>
            </button>
          </form>
        </div>

        {/* Social Proof Stats */}
        <div
          className="animate-fade-in-up mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { value: "50K+", label: "Learner Drivers" },
            { value: "2,400+", label: "Verified Instructors" },
            { value: "4.8★", label: "Average Rating" },
            { value: "92%", label: "First-Time Pass Rate" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}


/**
 * How It Works — 3-Step Process
 * Clean cards with icon, number, and description
 */
function HowItWorksSection() {
  // Map icon names to SVG components
  const iconMap = {
    search: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    compare: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    book: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
  };

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold">
            <SparklesIcon className="w-4 h-4" />
            Simple Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-5">
            How It Works
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed">
            Get behind the wheel in three easy steps. No phone calls, no hassle
            — just seamless online booking.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="group relative text-center p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 hover:border-brand-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-brand-500/30">
                {index + 1}
              </div>

              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                {iconMap[step.icon]}
              </div>

              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/**
 * Instructor Card Component
 * - Displays instructor profile with hover effects
 * - Responsive design adapts to grid layout
 */
function InstructorCard({ instructor, onViewProfile, onBookNow }) {
  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 hover:-translate-y-2"
      id={`instructor-card-${instructor.id}`}
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-60 overflow-hidden">
        <img
          src={instructor.photo}
          alt={`${instructor.name} — Driving Instructor`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Verified Badge (over image) */}
        {instructor.isVerified && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
            <CheckBadgeIcon className="w-3.5 h-3.5" />
            Verified
          </div>
        )}

        {/* Rate Badge (over image, bottom left) */}
        <div className="absolute bottom-3 left-3 inline-flex items-center px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg">
          <span className="text-lg font-bold text-slate-900">${instructor.hourlyRate}</span>
          <span className="text-sm text-slate-500 ml-1">/hr</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6">
        {/* Name & Location */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
              {instructor.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
              <MapPinIcon className="w-3.5 h-3.5" />
              {instructor.suburb}
            </div>
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50">
            <StarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-slate-800">{instructor.rating}</span>
            <span className="text-xs text-slate-400">({instructor.reviewCount})</span>
          </div>
        </div>

        {/* Car & Details */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {/* Transmission Pill */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
              instructor.transmission === "Auto"
                ? "bg-blue-50 text-blue-600"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            {instructor.transmission}
          </span>

          {/* Car Model */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-xs font-medium text-slate-600">
            <CarIcon className="w-3.5 h-3.5" />
            {instructor.car}
          </span>
        </div>

        {/* Pass Rate & Experience */}
        <div className="flex items-center justify-between mb-5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="text-center">
            <div className="text-lg font-bold text-brand-600">{instructor.passRate}%</div>
            <div className="text-[11px] text-slate-400 font-medium">Pass Rate</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-lg font-bold text-slate-700">{instructor.yearsExperience}+</div>
            <div className="text-[11px] text-slate-400 font-medium">Years Exp.</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-lg font-bold text-slate-700">{instructor.reviewCount}</div>
            <div className="text-[11px] text-slate-400 font-medium">Reviews</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile(instructor.id)}
            id={`view-profile-${instructor.id}`}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 transition-all duration-200 cursor-pointer"
          >
            View Profile
          </button>
          <button
            onClick={() => onBookNow(instructor.id)}
            id={`book-now-${instructor.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            Book Now
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


/**
 * Instructor Grid Section (Marketplace)
 * - Responsive 1→2→4 column grid
 * - "View All" CTA button
 */
function InstructorGridSection({
  instructors,
  onViewProfile,
  onBookNow,
  onViewAllInstructors,
}) {
  return (
    <section id="instructors-grid" className="py-24 sm:py-32 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold">
              <StarIcon className="w-4 h-4 text-brand-500" />
              Top Rated
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Featured Instructors
            </h2>
            <p className="mt-3 text-lg text-slate-500 max-w-xl">
              Hand-picked professionals with the highest ratings and pass rates
              in your area.
            </p>
          </div>
          <button
            onClick={onViewAllInstructors}
            id="view-all-instructors-btn"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all duration-200 cursor-pointer group"
          >
            View All Instructors
            <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Instructor Cards Grid */}
        <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {instructors.map((instructor) => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
              onViewProfile={onViewProfile}
              onBookNow={onBookNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


/**
 * Trust & Safety Section
 * - Horizontal banner with feature highlights
 * - Gradient background for visual impact
 */
function TrustSection() {
  const iconMap = {
    shield: <ShieldIcon className="w-8 h-8" />,
    car: <CarIcon className="w-8 h-8" />,
    lock: <LockIcon className="w-8 h-8" />,
    star: <StarIcon className="w-8 h-8" />,
  };

  return (
    <section id="trust-safety" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-400/6 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/10 border border-white/10 text-brand-300 text-sm font-semibold">
            <ShieldIcon className="w-4 h-4" />
            Your Safety Matters
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-5">
            Learn with Complete{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
              Peace of Mind
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
            We rigorously vet every instructor so you can focus on what matters
            — becoming a confident, safe driver.
          </p>
        </div>

        {/* Trust Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-7 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/30 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 text-brand-400 mb-5 transition-transform duration-500 group-hover:scale-110">
                {iconMap[feature.icon]}
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/**
 * CTA Section
 * - Final call-to-action before footer
 * - Gradient background with prominent button
 */
function CTASection({ onGetStarted }) {
  return (
    <section id="cta" className="py-24 sm:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-brand-50 via-white to-brand-50 border border-brand-100 shadow-xl shadow-brand-500/5">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-5">
            Ready to Hit the Road?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-slate-500 leading-relaxed mb-10">
            Join thousands of learner drivers who found their perfect instructor
            on DriveMate. Your first lesson is just a few clicks away.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              id="cta-get-started-btn"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-1 animate-pulse-glow cursor-pointer"
            >
              Find Your Instructor
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


/**
 * Footer
 * - Multi-column layout with links
 * - Newsletter signup form
 * - Social icons
 */
function Footer({ onNewsletterSubmit, newsletterEmail, onNewsletterEmailChange }) {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <CarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">
                Drive<span className="text-brand-400">Mate</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              Australia's most trusted platform for finding and booking verified
              driving instructors. Your road to freedom starts here.
            </p>

            {/* Newsletter */}
            <form onSubmit={onNewsletterSubmit} className="flex gap-2" id="newsletter-form">
              <input
                type="email"
                value={newsletterEmail}
                onChange={onNewsletterEmailChange}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-sm bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                id="newsletter-email-input"
              />
              <button
                type="submit"
                id="newsletter-submit-btn"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-brand-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-brand-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-brand-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} DriveMate. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {/* Social Icons — Placeholder SVGs */}
            {["Facebook", "Twitter", "Instagram"].map((social) => (
              <a
                key={social}
                href={`#${social.toLowerCase()}`}
                id={`footer-social-${social.toLowerCase()}`}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-brand-500/20 flex items-center justify-center text-slate-400 hover:text-brand-400 transition-all duration-200"
                aria-label={social}
              >
                <span className="text-xs font-bold">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


/**
 * AuthModal — Login / Sign Up Modal
 * - Glassmorphism overlay with smooth transitions
 * - Tabbed interface to switch between Login and Sign Up
 * - Social login placeholders (Google, Apple)
 * - Password visibility toggle
 * - Backend Developer: Wire handleAuthSubmit to POST /api/auth/login or /api/auth/register
 */
function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form field state
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  // Sync tab when parent changes initialTab (e.g., Login vs Sign Up button)
  useEffect(() => {
    setActiveTab(initialTab);
    setShowPassword(false);
    setAuthForm({ fullName: "", email: "", password: "", agreeTerms: false });
  }, [initialTab, isOpen]);

  // Reset form when modal opens/closes or tab switches
  const switchTab = (tab) => {
    setActiveTab(tab);
    setShowPassword(false);
    setAuthForm({ fullName: "", email: "", password: "", agreeTerms: false });
  };

  /**
   * handleAuthSubmit
   * Backend Developer: Replace with POST /api/auth/login or /api/auth/register
   */
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    console.log(`[handleAuthSubmit] Mode: ${activeTab}`, authForm);
    // TODO: Call authentication API, handle tokens, redirect on success
  };

  /**
   * handleSocialLogin
   * Backend Developer: Replace with OAuth redirect (Google, Apple, etc.)
   */
  const handleSocialLogin = (provider) => {
    console.log(`[handleSocialLogin] Provider: ${provider}`);
    // TODO: Redirect to /api/auth/oauth/:provider
  };

  /**
   * handleForgotPassword
   * Backend Developer: Replace with navigate to /forgot-password or open reset modal
   */
  const handleForgotPassword = () => {
    console.log("[handleForgotPassword] Open reset flow");
    // TODO: Navigate to password reset page or open sub-modal
  };

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={activeTab === "login" ? "Log in to DriveMate" : "Create a DriveMate account"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        id="auth-modal-backdrop"
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/20 animate-fade-in-up overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="auth-modal-close-btn"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer z-10"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="pt-8 pb-2 px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <CarIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-slate-900 tracking-tight">
              Drive<span className="text-gradient">Mate</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "login"
              ? "Welcome back! Log in to continue."
              : "Create your account and start learning."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mx-8 mt-5 flex bg-slate-100 rounded-xl p-1">
          {["login", "signup"].map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              id={`auth-tab-${tab}`}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-brand-600 shadow-md shadow-brand-500/10"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="p-8 pt-6 space-y-4" id="auth-form">
          {/* Full Name — Sign Up only */}
          {activeTab === "signup" && (
            <div>
              <label htmlFor="auth-fullname" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  id="auth-fullname"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <EnvelopeIcon className="w-4.5 h-4.5" />
              </div>
              <input
                type="email"
                id="auth-email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              {activeTab === "login" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  id="auth-forgot-password-btn"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LockIcon className="w-4.5 h-4.5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="auth-password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                id="auth-toggle-password-btn"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon className="w-4.5 h-4.5" /> : <EyeIcon className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox — Sign Up only */}
          {activeTab === "signup" && (
            <label className="flex items-start gap-3 cursor-pointer group" htmlFor="auth-agree-terms">
              <input
                type="checkbox"
                id="auth-agree-terms"
                checked={authForm.agreeTerms}
                onChange={(e) => setAuthForm({ ...authForm, agreeTerms: e.target.checked })}
                required
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/30 cursor-pointer"
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                I agree to DriveMate's{" "}
                <a href="#terms" className="text-brand-600 hover:underline font-medium">Terms of Service</a>{" "}
                and{" "}
                <a href="#privacy" className="text-brand-600 hover:underline font-medium">Privacy Policy</a>.
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {activeTab === "login" ? "Log In" : "Create Account"}
            <ArrowRightIcon className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-4 text-xs text-slate-400 font-medium">or continue with</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              id="auth-social-google-btn"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              id="auth-social-apple-btn"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ============================================
   PAGE COMPONENTS
   ============================================ */

/**
 * HomePage
 * The main landing page view.
 */
function HomePage({
  searchQuery,
  setSearchQuery,
  transmissionFilter,
  handleInstructorFilter,
  handleSearchSubmit,
  handleViewProfile,
  handleBookNow,
  handleViewAllInstructors,
  handleGetStarted,
}) {
  return (
    <>
      {/* Hero with Search */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        transmissionFilter={transmissionFilter}
        onTransmissionChange={handleInstructorFilter}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Featured Instructor Cards */}
      <InstructorGridSection
        instructors={MOCK_INSTRUCTORS}
        onViewProfile={handleViewProfile}
        onBookNow={handleBookNow}
        onViewAllInstructors={handleViewAllInstructors}
      />

      {/* Trust & Safety */}
      <TrustSection />

      {/* Final CTA */}
      <CTASection onGetStarted={handleGetStarted} />
    </>
  );
}

/**
 * PlaceholderPage
 * A simple page component for missing routes (Learners, Instructors, Legal, etc.)
 */
function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname.replace("/", "");
  const title = path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Page Not Found";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-2xl mx-auto p-12 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm">
        <div className="w-16 h-16 mx-auto bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
          <CarIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">{title}</h1>
        <p className="text-lg text-slate-500 mb-8">
          This is a placeholder page for the <code className="bg-slate-200 px-2 py-1 rounded text-slate-800">{location.pathname}</code> route. 
          A backend developer or frontend engineer would build out this specific view.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

/**
 * InstructorProfilePage
 * Detailed view of an instructor's profile.
 */
function InstructorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const instructor = MOCK_INSTRUCTORS.find((inst) => inst.id === parseInt(id));

  if (!instructor) return <PlaceholderPage />;

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      {/* Profile Header (Hero) */}
      <div className="relative h-64 sm:h-80 bg-slate-900">
        <div className="absolute inset-0 bg-[url('/hero_driving.png')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 sm:left-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl">
          <ArrowRightIcon className="w-4 h-4 rotate-180" /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end border-b border-slate-100 pb-8">
                <img src={instructor.photo} alt={instructor.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-lg border-4 border-white" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">{instructor.name}</h1>
                    {instructor.isVerified && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success-50 text-success-700 text-xs font-bold">
                        <CheckBadgeIcon className="w-4 h-4" /> Verified
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {instructor.suburb}</span>
                    <span className="flex items-center gap-1 text-amber-500"><StarIcon className="w-4 h-4" /> {instructor.rating} ({instructor.reviewCount} reviews)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">English</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">Spanish</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-b border-slate-100">
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl font-bold text-brand-600 mb-1">{instructor.passRate}%</div>
                  <div className="text-xs text-slate-500 font-medium">Pass Rate</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{instructor.yearsExperience} yrs</div>
                  <div className="text-xs text-slate-500 font-medium">Experience</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{instructor.transmission}</div>
                  <div className="text-xs text-slate-500 font-medium">Transmission</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-2xl font-bold text-slate-900 mb-1"><CarIcon className="w-6 h-6 mx-auto" /></div>
                  <div className="text-xs text-slate-500 font-medium truncate px-2">{instructor.car}</div>
                </div>
              </div>

              {/* Bio */}
              <div className="py-8">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">About {instructor.name}</h2>
                <p className="text-slate-600 leading-relaxed space-y-4">
                  Hi! I'm {instructor.name}, a passionate and patient driving instructor with {instructor.yearsExperience} years of experience helping learners become safe, confident drivers. I specialize in nervous beginners and test preparation. My lessons are structured, relaxed, and tailored entirely to your learning pace.
                  <br/><br/>
                  I'm fully RMS accredited and hold a Working With Children check. My {instructor.car} is fully equipped with dual controls for your absolute safety and peace of mind.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              <div className="text-center border-b border-slate-100 pb-6 mb-6">
                <div className="text-4xl font-bold text-slate-900 mb-1">${instructor.hourlyRate}</div>
                <div className="text-slate-500 font-medium">per hour</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><CarIcon className="w-4 h-4" /></div>
                  Pick-up & Drop-off included
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><ShieldIcon className="w-4 h-4" /></div>
                  Dual-control vehicle
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><StarIcon className="w-4 h-4" /></div>
                  Test day car hire available
                </li>
              </ul>

              <button
                onClick={() => navigate(`/checkout/${instructor.id}`)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-lg shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-1"
              >
                Book a Lesson
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const instructor = MOCK_INSTRUCTORS.find((inst) => inst.id === parseInt(id));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If instructor not found, fallback
  if (!instructor) {
    return <PlaceholderPage />;
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Mock processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Wait a moment then redirect to home
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 pt-20">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl shadow-brand-500/10 max-w-lg w-full animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-success-100 text-success-600 rounded-full flex items-center justify-center mb-6">
            <CheckBadgeIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8">
            Your lesson with {instructor.name} is booked. You will receive an email confirmation shortly.
          </p>
          <div className="animate-pulse text-brand-600 font-medium">Redirecting to home...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowRightIcon className="w-4 h-4 rotate-180" /> Back
        </button>
        
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-8">Complete your booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date/Time Placeholder */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Select Time</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"].map(time => (
                  <button key={time} type="button" className="py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all focus:border-brand-500 focus:bg-brand-50 focus:text-brand-600 outline-none">
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Payment Details</h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input type="text" required placeholder="0000 0000 0000 0000" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input type="text" required placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                    <input type="text" required placeholder="123" maxLength="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name on Card</label>
                  <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockIcon className="w-5 h-5" />
                      Pay ${instructor.hourlyRate * 2 + 10}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-28">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <img src={instructor.photo} alt={instructor.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-100" />
                <div>
                  <h3 className="font-bold text-slate-900">{instructor.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <CarIcon className="w-4 h-4" />
                    {instructor.car} ({instructor.transmission})
                  </div>
                </div>
              </div>

              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>$ {instructor.hourlyRate} x 2 hours</span>
                  <span>${instructor.hourlyRate * 2}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service Fee</span>
                  <span>$10</span>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="font-bold text-brand-600 text-2xl">${instructor.hourlyRate * 2 + 10}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LearnerSearchPage
 * The main search and browsing interface for learners.
 * BACKEND DEVELOPER: Hook up the useEffect to your API.
 */
function LearnerSearchPage({ onViewProfile, onBookNow }) {
  // --- Backend Developer: Wire these filters to your API ---
  const [searchTerm, setSearchTerm] = useState("");
  const [transmission, setTransmission] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [isLoading, setIsLoading] = useState(false);

  // Instructor State
  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);

  // Backend Developer: Replace this with your actual API fetch
  useEffect(() => {
    /*
    setIsLoading(true);
    fetch(`/api/instructors?q=${searchTerm}&trans=${transmission}&sort=${sortBy}`)
      .then(res => res.json())
      .then(data => setInstructors(data))
      .finally(() => setIsLoading(false));
    */
  }, [searchTerm, transmission, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">Find an Instructor</h1>
          <p className="text-lg text-slate-500">Browse {instructors.length}+ top-rated instructors ready to help you pass.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
              <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
                Filters
              </h2>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location / Suburb</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Bondi" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" 
                    />
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Transmission</label>
                  <div className="flex flex-col gap-2">
                    {["All", "Auto", "Manual"].map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="transmission" 
                          checked={transmission === type}
                          onChange={() => setTransmission(type)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
                  >
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {instructors.map(instructor => (
                  <InstructorCard 
                    key={instructor.id}
                    instructor={instructor}
                    onViewProfile={onViewProfile}
                    onBookNow={onBookNow}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination Placeholder */}
            {!isLoading && instructors.length > 0 && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors cursor-not-allowed" disabled>Previous</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-50 text-brand-600 font-bold text-sm cursor-pointer">1</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors cursor-pointer">2</button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors cursor-pointer">3</button>
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors cursor-pointer">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * InstructorLandingPage
 * A promotional landing page to acquire new instructors.
 */
function InstructorLandingPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero_driving.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-brand-500/20 border border-brand-500/30 text-sm text-brand-300 font-bold backdrop-blur-md">
              <SparklesIcon className="w-4 h-4" /> DriveMate for Instructors
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.1] mb-6">
              Be your own boss. <br/>
              <span className="text-brand-400">Earn up to $2,500/week.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Join Australia's fastest-growing driving instructor marketplace. You set your rates and schedule, we handle the marketing and secure your payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/instructors/apply"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
              >
                Apply to Teach <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Why teach with DriveMate?</h2>
            <p className="text-lg text-slate-500">We provide the tools, the students, and the support. You provide the expertise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPinIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Marketing Effort</h3>
              <p className="text-slate-600 leading-relaxed">Stop worrying about finding students. Our platform connects you with thousands of verified learners actively searching in your exact suburb.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
                <StarIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Total Flexibility</h3>
              <p className="text-slate-600 leading-relaxed">Work when you want, where you want. You have complete control over your calendar, service areas, and your hourly rates.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
                <LockIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Guaranteed Payments</h3>
              <p className="text-slate-600 leading-relaxed">No more chasing students for cash or dealing with last-minute cancellations. Payments are processed securely upfront.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * InstructorApplyPage
 * The onboarding application form.
 */
function InstructorApplyPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 pt-20">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl shadow-brand-500/10 max-w-lg w-full animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-success-100 text-success-600 rounded-full flex items-center justify-center mb-6">
            <CheckBadgeIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Application Received!</h2>
          <p className="text-slate-500 mb-8">
            Thank you for applying to teach with DriveMate. Our onboarding team will review your application and be in touch within 24-48 hours.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowRightIcon className="w-4 h-4 rotate-180" /> Back
        </button>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">Apply to Teach</h1>
            <p className="text-slate-500">Fill out the details below to list your services on DriveMate.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Suburb</label>
                  <input type="text" required placeholder="e.g. Bondi Junction" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle & Experience */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Vehicle & Experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Car Make & Model</label>
                  <input type="text" required placeholder="e.g. Toyota Corolla 2024" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white">
                    <option value="">Select transmission</option>
                    <option value="auto">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                  <input type="number" required min="0" placeholder="e.g. 5" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Section 3: Pricing */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Your Rates</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-bold text-slate-400">$</span>
                  <input type="number" required min="30" placeholder="65" className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                </div>
                <p className="text-xs text-slate-500 mt-2">You can change this at any time later in your dashboard.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-lg shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MAIN APP COMPONENT
   ============================================ */

export default function App() {
  const navigate = useNavigate();
  // Ensure page scrolls to top on route change
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  /* ---------- State ---------- */
  // Search / filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("Auto");

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  /* ---------- Placeholder Event Handlers ----------
     Backend Developer: Replace the console.log calls
     inside these functions with your real API logic.
     Each handler is named descriptively and already
     wired to the correct UI element.
  ------------------------------------------------- */

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("[handleSearchSubmit] Search:", {
      query: searchQuery,
      transmission: transmissionFilter,
    });
    // TODO: Navigate to results page or filter instructors via API
  };

  const handleViewProfile = (instructorId) => {
    console.log("[handleViewProfile] Instructor ID:", instructorId);
    navigate(`/instructor/${instructorId}`);
  };

  const handleBookNow = (instructorId) => {
    console.log("[handleBookNow] Instructor ID:", instructorId);
    // Open checkout flow
    navigate(`/checkout/${instructorId}`);
  };

  const handleStripeCheckout = (bookingDetails) => {
    console.log("[handleStripeCheckout] Booking:", bookingDetails);
    // TODO: Create Stripe checkout session and redirect
  };

  const handleInstructorFilter = (filterType) => {
    console.log("[handleInstructorFilter] Filter:", filterType);
    setTransmissionFilter(filterType);
    // TODO: Re-fetch instructors with new filter params
  };

  const handleViewAllInstructors = () => {
    console.log("[handleViewAllInstructors] Navigate to full marketplace");
    navigate("/learners");
  };

  const handleLoginClick = () => {
    console.log("[handleLoginClick] Open login modal");
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    console.log("[handleSignupClick] Open signup modal");
    setAuthModalTab("signup");
    setIsAuthModalOpen(true);
  };

  const handleGetStarted = () => {
    console.log("[handleGetStarted] Scroll to hero search");
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
    // TODO: Focus the search input after scroll
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("[handleNewsletterSubmit] Email:", newsletterEmail);
    setNewsletterEmail("");
    // TODO: Send email to newsletter API endpoint
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Main Content Area (Routing) */}
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                transmissionFilter={transmissionFilter}
                handleInstructorFilter={handleInstructorFilter}
                handleSearchSubmit={handleSearchSubmit}
                handleViewProfile={handleViewProfile}
                handleBookNow={handleBookNow}
                handleViewAllInstructors={handleViewAllInstructors}
                handleGetStarted={handleGetStarted}
              />
            } 
          />
          <Route 
            path="/learners" 
            element={
              <LearnerSearchPage 
                onViewProfile={handleViewProfile} 
                onBookNow={handleBookNow} 
              />
            } 
          />
          <Route path="/instructors" element={<InstructorLandingPage />} />
          <Route path="/instructors/apply" element={<InstructorApplyPage />} />
          <Route path="/instructor/:id" element={<InstructorProfilePage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer
        onNewsletterSubmit={handleNewsletterSubmit}
        newsletterEmail={newsletterEmail}
        onNewsletterEmailChange={(e) => setNewsletterEmail(e.target.value)}
      />
    </div>
  );
}
