import { useState, useCallback, useRef, useEffect } from "react";
import { ToastContext } from "../hooks/useInteractive";

/* ============================================
   Toast Provider & Component
   Beautiful dark-themed toast notifications.
   ============================================ */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 400);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: "380px" }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const typeConfig = {
    success: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
      iconSvg: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    error: {
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      icon: "text-red-400",
      iconSvg: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    info: {
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      iconSvg: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      ),
    },
    warning: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      icon: "text-amber-400",
      iconSvg: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl shadow-black/20 ${config.bg} ${config.border} ${toast.exiting ? "toast-exit" : "toast-enter"}`}
    >
      <div className={`shrink-0 ${config.icon}`}>{config.iconSvg}</div>
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        aria-label="Dismiss"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

/* ============================================
   ScrollReveal — Wrapper component that 
   animates children into view when scrolled.
   ============================================ */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 800,
  distance = 40,
  className = "",
  once = true,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [once]);

  const directionTransforms = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    scale: "scale(0.92)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) translateX(0) scale(1)" : directionTransforms[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ============================================
   AnimatedCounter — Renders a number that 
   counts up from 0 when scrolled into view.
   ============================================ */
export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  className = "",
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  // Parse the numeric value from the target string
  const numericTarget =
    parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
  const hasDecimal = String(target).includes(".");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * numericTarget;

      setCount(hasDecimal ? parseFloat(value.toFixed(1)) : Math.round(value));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isVisible, numericTarget, duration, hasDecimal]);

  // Determine what to display: keep the original string format
  const displayValue = () => {
    if (!isVisible) return `${prefix}0${suffix}`;

    // If the original target has suffix characters like K+ or %
    const formatted = hasDecimal ? count.toFixed(1) : count.toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  };

  return (
    <span ref={ref} className={className}>
      {displayValue()}
    </span>
  );
}

/* ============================================
   ParticleCursor — Sparkle particles following
   the cursor inside a container.
   ============================================ */
export function ParticleCursor({ containerRef }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -100, y: -100 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Spawn particles
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: mouse.current.x + (Math.random() - 0.5) * 20,
          y: mouse.current.y + (Math.random() - 0.5) * 20,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2 - 1,
          life: 1,
          decay: Math.random() * 0.02 + 0.01,
          hue: Math.random() * 30 + 340, // Pinkish-red to match brand color
        });
      }
    };

    container.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= p.decay;
        p.size *= 0.98;

        if (p.life <= 0 || p.size < 0.3) {
          particles.current.splice(i, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.6;
        ctx.fillStyle = `hsl(${p.hue}, 80%, 65%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.globalAlpha = p.life * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Limit particles
      if (particles.current.length > 100) {
        particles.current = particles.current.slice(-80);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/* ============================================
   MagneticButton — Button that subtly attracts
   towards the cursor on hover.
   ============================================ */
export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  ...props
}) {
  const ref = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }, []);

  return (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

/* ============================================
   FloatingElement — Subtle floating animation
   with customizable parameters.
   ============================================ */
export function FloatingElement({
  children,
  amplitude = 10,
  duration = 4,
  delay = 0,
  className = "",
}) {
  return (
    <div
      className={className}
      style={{
        animation: `interactive-float ${duration}s ease-in-out ${delay}s infinite`,
        "--float-amplitude": `${amplitude}px`,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================
   GlowCursor — Spotlight that follows the mouse
   across a section, creating a glow effect.
   ============================================ */
export function GlowCursor({
  containerRef,
  color = "rgba(201, 46, 80, 0.08)",
  size = 500,
}) {
  const glowRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !glowRef.current) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current.style.left = `${x}px`;
      glowRef.current.style.top = `${y}px`;
      glowRef.current.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, color, size]);

  return (
    <div
      ref={glowRef}
      className="absolute pointer-events-none z-0 transition-opacity duration-500"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        transform: "translate(-50%, -50%)",
        opacity: 0,
      }}
    />
  );
}
