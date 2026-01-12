import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TeamMemberModal from './TeamMemberModal';
import './TeamSection.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * TeamSection component based on 21st.dev layout
 * Accepts title and groups (with group title + members)
 * Supports modal interaction for team member stories
 */
function TeamSection({ title = 'Our team', groups = [] }) {
  const [activeMember, setActiveMember] = useState(null);
  const avatarRefs = useRef({});
  const sectionRef = useRef(null);

  // Staggered entrance animation for team avatars
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !groups || groups.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileCheck = window.matchMedia('(max-width: 768px)').matches;

    // Get all avatar buttons/containers
    const avatars = Array.from(section.querySelectorAll('[data-team-avatar]')).filter(Boolean);

    if (avatars.length === 0 || prefersReducedMotion) {
      // Show all avatars immediately if no avatars found or reduced motion
      avatars.forEach(avatar => {
        gsap.set(avatar, { opacity: 1, x: 0, y: 0 });
      });
      return;
    }

    if (isMobileCheck) {
      // MOBILE: Simple from-below animation with stagger
      avatars.forEach((avatar, index) => {
        gsap.set(avatar, {
          opacity: 0,
          y: 12,
          willChange: 'transform, opacity',
        });
      });

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
            invalidateOnRefresh: true,
          },
        });

        avatars.forEach((avatar, index) => {
          tl.to(avatar, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(avatar, { willChange: 'auto' });
            },
          }, index * 0.1); // Small stagger
        });
      }, section);

      return () => {
        ctx.revert();
      };
    } else {
      // DESKTOP: Staggered directional animation - overdreven vanuit buiten viewport
      // Set initial states based on position
      avatars.forEach((avatar, index) => {
        // Left two (0, 1): start from far left (way outside viewport)
        // Right two (2, 3): start from far right (way outside viewport)
        const translateX = index < 2 ? -400 : 400;
        
        gsap.set(avatar, {
          opacity: 0,
          x: translateX,
          y: 6,
          willChange: 'transform, opacity',
        });
      });

      // Create timeline with ScrollTrigger
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
            invalidateOnRefresh: true,
          },
        });

        // Animation timing - iets langer voor dramatisch effect
        const innerDuration = 1.0; // Inner cards duration (langer)
        const outerDuration = 1.0; // Outer cards duration (langer)
        const outerDelay = 0.4; // Outer cards start 0.4s later

        // Inner two (index 1 and 2) start first at position 0
        // Animate both inner avatars simultaneously
        [1, 2].forEach(index => {
          if (avatars[index]) {
            tl.to(avatars[index], {
              opacity: 1,
              x: 0,
              y: 0,
              duration: innerDuration,
              ease: 'power3.out', // Sterkere easing voor meer impact
              onComplete: () => {
                gsap.set(avatars[index], { willChange: 'auto' });
              },
            }, 0); // Start at timeline position 0
          }
        });

        // Outer two (index 0 and 3) start later at position outerDelay
        // Animate both outer avatars simultaneously
        [0, 3].forEach(index => {
          if (avatars[index]) {
            tl.to(avatars[index], {
              opacity: 1,
              x: 0,
              y: 0,
              duration: outerDuration,
              ease: 'power3.out', // Sterkere easing voor meer impact
              onComplete: () => {
                gsap.set(avatars[index], { willChange: 'auto' });
              },
            }, outerDelay); // Start at timeline position outerDelay
          }
        });
      }, section);

      return () => {
        ctx.revert();
      };
    }
  }, [groups]);

  if (!groups || groups.length === 0) {
    return null;
  }

  const handleMemberClick = (member) => {
    if (member.story) {
      setActiveMember(member);
    }
  };

  const handleClose = () => {
    setActiveMember(null);
  };

  // Get member ID for layoutId
  const getMemberId = (member) => {
    return member.id || member.name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <>
      <section ref={sectionRef} className="py-8 md:py-16 relative overflow-visible" style={{ backgroundColor: 'var(--color-blue-ribbon)' }}>
        <div className="team-gradient-background"></div>
        <div className="mx-auto max-w-3xl px-8 lg:px-0 relative z-10">
          <h2 className="mb-4 text-4xl font-bold md:mb-8 lg:text-5xl text-center text-white">{title}</h2>

          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className={groupIndex > 0 ? 'mt-4' : ''}>
              <div className="grid grid-cols-2 gap-8 md:gap-12 border-t border-white/30 py-4 md:grid-cols-4">
                {group.members.map((member, index) => {
                  const memberId = getMemberId(member);
                  const hasStory = !!member.story;
                  
                  return (
                    <div key={index} className="flex flex-col items-center text-center">
                      {hasStory ? (
                        <button
                          ref={(el) => {
                            if (el) avatarRefs.current[memberId] = el;
                          }}
                          data-team-avatar
                          data-team-index={index}
                          onClick={() => handleMemberClick(member)}
                          className="relative size-28 md:size-32 rounded-full shadow shadow-zinc-950/5 group cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Open verhaal van ${member.name}`}
                        >
                          <motion.img
                            layoutId={`member-avatar-${memberId}`}
                            className="aspect-square rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                            src={member.avatar}
                            alt={member.name}
                            height="460"
                            width="460"
                            loading="lazy"
                          />
                          {/* Dark overlay */}
                          <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            {/* Lees meer text */}
                            <span className="text-white font-semibold text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                              Lees meer
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div 
                          data-team-avatar
                          data-team-index={index}
                          className="relative size-28 md:size-32 rounded-full shadow shadow-zinc-950/5 overflow-hidden"
                        >
                          <img
                            className="aspect-square rounded-full object-cover"
                            src={member.avatar}
                            alt={member.name}
                            height="460"
                            width="460"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <span className="mt-3 block text-base md:text-lg text-white">{member.name}</span>
                      <span className="text-white/80 block text-sm md:text-base">{member.role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* CTA Button */}
          <div className="mt-6 md:mt-8 text-center">
            <a 
              href="https://calendly.com/mouseclick2017/30min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg transition-colors duration-200 hover:bg-orange-600"
            >
              Neem contact op
            </a>
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeMember && (
        <TeamMemberModal
          member={activeMember}
          isOpen={true}
          onClose={handleClose}
          avatarRef={{ current: avatarRefs.current[getMemberId(activeMember)] }}
        />
      )}
    </>
  );
}

export default TeamSection;

