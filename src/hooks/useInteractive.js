import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

/* ============================================
   useScrollReveal — Intersection Observer based
   scroll-triggered animations.
   ============================================ */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element); // Only animate once
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? "0px 0px -60px 0px",
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
}

/* ============================================
   useAnimatedCounter — Smoothly counts from 0
   to a target number when triggered.
   ============================================ */
export function useAnimatedCounter(target, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    let start = null;
    const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericTarget));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, trigger]);

  return count;
}

/* ============================================
   useTilt — 3D tilt effect on mouse hover.
   Inspired by vanilla-tilt.js, zero dependencies.
   ============================================ */
export function useTilt(options = {}) {
  const ref = useRef(null);
  const {
    maxTilt = 8,
    perspective = 1000,
    speed = 400,
    glare = true,
    maxGlare = 0.15,
    scale = 1.02,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Create glare element
    let glareEl = null;
    if (glare) {
      glareEl = document.createElement("div");
      glareEl.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        overflow: hidden;
        z-index: 10;
      `;
      const glareInner = document.createElement("div");
      glareInner.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        height: 200%;
        transform: translate(-50%, -50%) rotate(180deg);
        background: linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${maxGlare}) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      glareEl.appendChild(glareInner);
      el.style.position = "relative";
      el.style.overflow = "hidden";
      el.appendChild(glareEl);
    }

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (maxTilt * (0.5 - y)).toFixed(2);
      const tiltY = (maxTilt * (x - 0.5)).toFixed(2);

      el.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;

      if (glareEl) {
        const glareInner = glareEl.firstChild;
        const angle = Math.atan2(e.clientX - (rect.left + rect.width / 2), -(e.clientY - (rect.top + rect.height / 2))) * (180 / Math.PI);
        glareInner.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        glareInner.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glareEl) {
        glareEl.firstChild.style.opacity = "0";
      }
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      if (glareEl && el.contains(glareEl)) {
        el.removeChild(glareEl);
      }
    };
  }, [maxTilt, perspective, speed, glare, maxGlare, scale]);

  return ref;
}

/* ============================================
   useMousePosition — Tracks the mouse position
   relative to a container.
   ============================================ */
export function useMousePosition(containerRef) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef?.current || window;

    const handleMouseMove = (e) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef]);

  return position;
}

/* ============================================
   useRipple — Material-style ripple effect 
   on click.
   ============================================ */
export function useRipple(color = "rgba(255, 255, 255, 0.3)") {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClick = (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: ${color};
        transform: scale(0);
        opacity: 0.6;
        pointer-events: none;
        animation: ripple-expand 0.6s ease-out forwards;
        z-index: 999;
      `;
      el.style.position = "relative";
      el.style.overflow = "hidden";
      el.appendChild(ripple);

      setTimeout(() => {
        if (el.contains(ripple)) {
          el.removeChild(ripple);
        }
      }, 700);
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [color]);

  return ref;
}

/* ============================================
   useTypingEffect — Types text character by
   character for cinematic headlines.
   ============================================ */
export function useTypingEffect(text, speed = 60, delay = 500, trigger = true) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setDisplayText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, trigger]);

  return { displayText, isComplete };
}

/* ============================================
   Toast Notification System
   ============================================ */
const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export { ToastContext };
