import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import TeamMemberModal from './TeamMemberModal';

/**
 * TeamSection component based on 21st.dev layout
 * Accepts title and groups (with group title + members)
 * Supports modal interaction for team member stories
 */
function TeamSection({ title = 'Our team', groups = [] }) {
  const [activeMember, setActiveMember] = useState(null);
  const avatarRefs = useRef({});

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
      <section className="py-12 md:py-32">
        <div className="mx-auto max-w-3xl px-8 lg:px-0">
          <h2 className="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl text-center">{title}</h2>

          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className={groupIndex > 0 ? 'mt-6' : ''}>
              <div className="grid grid-cols-2 gap-8 md:gap-12 border-t border-blue-500 border-opacity-100 py-6 md:grid-cols-4">
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
                          onClick={() => handleMemberClick(member)}
                          className="relative bg-white size-28 md:size-32 rounded-full border p-0.5 shadow shadow-zinc-950/5 group cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                            <span className="text-blue-500 font-semibold text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                              Lees meer
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div className="relative bg-white size-28 md:size-32 rounded-full border p-0.5 shadow shadow-zinc-950/5 overflow-hidden">
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
                      <span className="mt-3 block text-base md:text-lg">{member.name}</span>
                      <span className="text-slate-500 block text-sm md:text-base">{member.role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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

