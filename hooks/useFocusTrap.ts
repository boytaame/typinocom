import React, { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_ELEMENTS_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A custom hook to trap focus within a specific element.
 * @param ref A React ref attached to the container element where focus should be trapped.
 * @param isOpen A boolean indicating whether the focus trap should be active.
 */
const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean) => {
  const previousFocusedElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !ref.current) {
      return;
    }

    // Fix: Explicitly type `focusableElements` as HTMLElement[] to guide the compiler.
    const focusableElements: HTMLElement[] = Array.from(
      ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentFocusedIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement || currentFocusedIndex === -1) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement || currentFocusedIndex === -1) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [ref]);

  useEffect(() => {
    if (isOpen && ref.current) {
      previousFocusedElement.current = document.activeElement as HTMLElement;

      const focusableElements = Array.from(
        ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
      );
      
      // Focus the first element, or the container itself if no focusable elements are found.
      const elementToFocus = focusableElements[0] || ref.current;
      elementToFocus.focus();

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (previousFocusedElement.current) {
          previousFocusedElement.current.focus();
        }
      };
    } else {
        // Ensure listener is removed if component is still mounted but trap is no longer open
        document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, ref, handleKeyDown]);
};

export default useFocusTrap;
