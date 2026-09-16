'use client';

import { useEffect } from 'react';

/**
 * PreventZoom:
 * Enforces a static, unzoomable viewport across all devices and browsers:
 * 1. Disables iOS Safari pinch-to-zoom gesture events.
 * 2. Blocks multi-touch pinch gestures on mobile devices.
 * 3. Prevents double-tap zooming.
 * 4. Prevents Ctrl + Wheel / Trackpad pinch zoom on desktops.
 * 5. Prevents keyboard zoom shortcuts (Ctrl/Cmd + '+', '-', '0').
 */
export default function PreventZoom() {
  useEffect(() => {
    // 1. Prevent multi-finger pinch zoom on mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1 && e.cancelable) {
        e.preventDefault();
      }
    };

    // 2. Prevent iOS Safari native gesture zoom
    const handleGesture = (e: Event) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // 3. Prevent double-tap to zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300 && e.cancelable) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // 4. Prevent Ctrl + Wheel / Trackpad pinch zoom on desktop
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && e.cancelable) {
        e.preventDefault();
      }
    };

    // 5. Prevent keyboard zoom shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0' || e.code === 'NumpadAdd' || e.code === 'NumpadSubtract')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
