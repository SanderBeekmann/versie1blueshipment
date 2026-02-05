import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";

export const AnimatedTestimonials = ({
  testimonials = [],
  autoplay = false,
  className,
}) => {
  const [active, setActive] = useState(0);

  // Reset active index when testimonials change
  useEffect(() => {
    if (testimonials.length > 0 && active >= testimonials.length) {
      setActive(0);
    }
  }, [testimonials.length, active]);

  const handleNext = () => {
    if (testimonials.length > 0) {
      setActive((prev) => (prev + 1) % testimonials.length);
    }
  };

  const handlePrev = () => {
    if (testimonials.length > 0) {
      setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  const isActive = (index) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay && testimonials.length > 0) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, testimonials.length, active]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  // Early return if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Ensure active index is valid
  const currentTestimonial = testimonials[active];
  if (!currentTestimonial) {
    return null;
  }

  return (
    <div className={cn("max-w-sm md:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-20", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={`testimonial-${index}-${testimonial.name}`}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={typeof testimonial.src === 'string' ? testimonial.src : (testimonial.src?.default || testimonial.src)}
                    alt={testimonial.name}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center border border-[var(--color-blue-ribbon)]"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-between flex-col py-2 md:py-4">
          <div className="relative min-h-[280px] md:min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: -20,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                className="w-full"
              >
              <h3 className="text-2xl font-bold text-foreground">
                {currentTestimonial.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentTestimonial.designation}
              </p>
              <div className="flex items-center gap-1 my-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-blue-600"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 0L10.163 5.528L16 6.112L11.82 9.944L12.944 16L8 12.944L3.056 16L4.18 9.944L0 6.112L5.837 5.528L8 0Z" />
                  </svg>
                ))}
              </div>
              <motion.p className="text-lg text-muted-foreground mt-8">
                {currentTestimonial.quote.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      filter: "blur(10px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-4 pt-6 md:pt-0">
            <button
              onClick={handlePrev}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center group/button"
              aria-label="Previous testimonial"
            >
              <IconArrowLeft className="h-5 w-5 text-foreground group-hover/button:rotate-12 transition-transform duration-300" />
            </button>
            <button
              onClick={handleNext}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center group/button"
              aria-label="Next testimonial"
            >
              <IconArrowRight className="h-5 w-5 text-foreground group-hover/button:-rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
