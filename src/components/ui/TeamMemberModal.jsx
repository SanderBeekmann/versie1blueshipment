import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TeamMemberModal - Modal component for displaying team member story
 * Uses Framer Motion shared layout for smooth avatar transition
 */
function TeamMemberModal({ member, isOpen, onClose, avatarRef }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Store trigger ref for focus return
  const triggerRef = useRef(avatarRef);

  // Focus management: focus modal on open, return to trigger on close
  useEffect(() => {
    if (isOpen) {
      // Store the trigger element for focus return
      if (avatarRef) {
        triggerRef.current = avatarRef;
      }
      
      // Focus the close button or modal content
      const focusTarget = closeButtonRef.current || modalRef.current;
      if (focusTarget) {
        // Small delay to ensure modal is rendered
        const focusTimer = setTimeout(() => {
          focusTarget.focus();
        }, 100);

        // Prevent body scroll (without changing global overflow)
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // ESC key handler
        const handleEscape = (e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        document.addEventListener('keydown', handleEscape);

        return () => {
          clearTimeout(focusTimer);
          document.body.style.overflow = originalStyle;
          document.removeEventListener('keydown', handleEscape);
        };
      } else {
        // Fallback: just prevent scroll
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        document.addEventListener('keydown', handleEscape);

        return () => {
          document.body.style.overflow = originalStyle;
          document.removeEventListener('keydown', handleEscape);
        };
      }
    } else {
      // Return focus to trigger when closing
      const trigger = triggerRef.current;
      if (trigger) {
        setTimeout(() => {
          if (typeof trigger === 'object' && trigger.current) {
            trigger.current.focus();
          } else if (trigger && trigger.focus) {
            trigger.focus();
          }
        }, 100);
      }
    }
  }, [isOpen, onClose, avatarRef]);

  if (!member || !isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            onClick={handleBackdropClick}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="p-6 md:p-8">
                {/* Header with close button */}
                <div className="flex justify-end mb-4">
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100"
                    aria-label="Sluiten"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                  {/* Avatar with shared layout */}
                  <motion.div
                    layoutId={`member-avatar-${member.id || member.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-white size-32 md:size-40 rounded-full border p-0.5 shadow-lg mb-6"
                  >
                    <img
                      className="aspect-square rounded-full object-cover"
                      src={member.avatar}
                      alt={member.name}
                      height="460"
                      width="460"
                    />
                  </motion.div>

                  {/* Name and role */}
                  <h2 id="modal-title" className="text-2xl md:text-3xl font-bold mb-2">
                    {member.name}
                  </h2>
                  <p className="text-slate-500 text-lg mb-6">{member.role}</p>

                  {/* Story */}
                  <div className="text-left w-full">
                    {Array.isArray(member.story) ? (
                      member.story.map((paragraph, index) => (
                        <p key={index} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-700 leading-relaxed">{member.story}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default TeamMemberModal;

