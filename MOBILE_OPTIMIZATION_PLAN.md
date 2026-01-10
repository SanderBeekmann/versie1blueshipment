# Mobile Optimization Analysis & Implementation Plan

## ANALYSIS PHASE

### Issue 1: Scroll Stutter/Hitches on Mobile

**Root Causes Identified:**

1. **GSAP ScrollTrigger Active on Mobile**
   - `src/utils/scrollAnimations.js` - `initScrollAnimations()` creates ScrollTriggers for all `[data-animate]` elements without mobile detection
   - Multiple pages call `ScrollTrigger.refresh()` which triggers layout recalculations
   - ScrollTrigger uses scroll listeners internally that can cause jank on mobile
   - **Location**: `src/utils/scrollAnimations.js:49-111`, called from HomePage, AboutPage, etc.

2. **Multiple Scroll Listeners**
   - `src/components/layout/Navbar/Navbar.js:28` - Passive scroll listener (OK)
   - `src/components/StickyWhatsAppButton.js:38` - visualViewport scroll listener (PROBLEMATIC)
   - `src/index.js:35` - Dev-only scroll monitoring (OK, dev only)
   - `src/utils/scrollAnimations.js:1604` - Scroll listener in testimonials (if used)

3. **Layout Thrashing from ScrollTrigger.refresh()**
   - Multiple `ScrollTrigger.refresh()` calls on mount and resize
   - Each refresh recalculates element positions using `getBoundingClientRect()`
   - Mobile scroll position restoration attempts can conflict with active scrolling

4. **Expensive Paint Operations**
   - WhatsApp button uses `box-shadow` which can be expensive on mobile
   - Multiple fixed/absolute positioned elements with transforms

**Evidence:**
- DienstenPage already has mobile detection to disable ScrollTrigger (line 34-44)
- HomePage has similar mobile detection for bento grid (line 123-225)
- But `initScrollAnimations()` is still called on mobile without gating

---

### Issue 2: Sticky WhatsApp Button Odd Behavior When Scrolling Up

**Root Causes Identified:**

1. **visualViewport Scroll Listener**
   - `src/components/StickyWhatsAppButton.js:38` - `vv.addEventListener('scroll', setLayer)`
   - Fires on every scroll event, updating CSS custom properties
   - Can cause repaints during scroll, especially on iOS Safari
   - The listener is not throttled or debounced

2. **CSS Custom Property Updates During Scroll**
   - Updates `--vv-top`, `--vv-left`, `--vv-width`, `--vv-height` on every scroll
   - Forces style recalculation during scroll
   - The `.vv-layer` is fixed positioned with high z-index, creating a new stacking context

3. **Portal Remounting**
   - Portal root is created correctly (doesn't remount)
   - But the component itself might re-render on route changes
   - Visual viewport listener cleanup might not be perfect

**Evidence:**
- Component uses visualViewport API which is iOS Safari specific
- No throttling/debouncing on scroll handler
- CSS custom properties updated synchronously during scroll

---

### Issue 3: Scroll-to-Top Unreliability on Navigation

**Root Causes Identified:**

1. **ScrollToTop Component Limitations**
   - `src/components/ScrollToTop.js` only checks `location.pathname`
   - Doesn't account for `location.key` or full location object changes
   - React Router might not always trigger pathname change for same-route navigations
   - Timing issue: scroll happens before DOM is ready

2. **ScrollTrigger Interference**
   - `ScrollTrigger.refresh()` calls can restore scroll position after ScrollToTop runs
   - Multiple pages call refresh in useLayoutEffect/useEffect after mount
   - Mobile scroll position restoration code (lines 106-108 in scrollAnimations.js) might conflict

3. **Browser Scroll Restoration**
   - `src/index.js:7-9` sets `window.history.scrollRestoration = 'manual'`
   - But some browsers might still try to restore position
   - No explicit scroll reset on route change before other effects run

4. **Timing Race Conditions**
   - ScrollToTop runs in useEffect (after render)
   - ScrollTrigger.refresh() runs in useLayoutEffect (during render)
   - Page animations might trigger scroll position changes

**Evidence:**
- ScrollToTop uses `behavior: 'instant'` which is good
- But it only checks pathname, not full location object
- Multiple refresh calls happen after route change

---

## IMPLEMENTATION PLAN

### Fix 1: Disable ScrollTrigger on Mobile Globally

**Approach:**
- Add mobile detection at the start of `initScrollAnimations()` and other ScrollTrigger functions
- Use `window.innerWidth < 768` consistently (matches existing pattern)
- For mobile: use simple IntersectionObserver-based animations instead
- Ensure all ScrollTrigger.refresh() calls are gated for mobile

**Files to Modify:**
- `src/utils/scrollAnimations.js` - Add mobile gating to all ScrollTrigger functions
- `src/pages/Home/HomePage.js` - Already has mobile detection, verify it's complete
- `src/pages/About/AboutPage.js` - Add mobile detection
- `src/pages/Diensten/DienstenPage.js` - Already has mobile detection, verify

**Implementation:**
1. Create `isMobile()` helper function
2. Gate `initScrollAnimations()` - return early on mobile, use IntersectionObserver
3. Gate `initTitleAnimations()` - return early on mobile
4. Gate all ScrollTrigger.refresh() calls
5. Remove mobile scroll position restoration code (no longer needed)

---

### Fix 2: Optimize WhatsApp Button Scroll Behavior

**Approach:**
- Throttle visualViewport scroll listener using requestAnimationFrame
- Use CSS-only positioning where possible
- Reduce box-shadow complexity on mobile
- Ensure listener cleanup is perfect

**Files to Modify:**
- `src/components/StickyWhatsAppButton.js` - Throttle scroll listener
- `src/components/StickyWhatsAppButton.css` - Optimize box-shadow for mobile

**Implementation:**
1. Replace direct scroll listener with RAF-throttled version
2. Debounce resize listener
3. Simplify box-shadow on mobile (reduce blur radius)
4. Add will-change optimization only when needed
5. Ensure cleanup removes all listeners

---

### Fix 3: Reliable Scroll-to-Top on Navigation

**Approach:**
- Enhance ScrollToTop to use full location object (including key)
- Run scroll reset synchronously before any layout effects
- Disable ScrollTrigger refresh during route transition
- Add explicit scroll reset in router-level effect

**Files to Modify:**
- `src/components/ScrollToTop.js` - Use location.key, run in useLayoutEffect
- `src/App.js` - Add router-level scroll reset
- `src/utils/scrollAnimations.js` - Gate refresh calls during route changes

**Implementation:**
1. Update ScrollToTop to use `location.key` instead of just pathname
2. Move scroll reset to useLayoutEffect for earlier execution
3. Add router-level scroll reset in App.js
4. Add route change detection to prevent ScrollTrigger refresh during transition

---

## VALIDATION STEPS

### Mobile Scroll Performance
1. Fast flick scroll on long pages (HomePage, DienstenPage)
2. Scroll up and down rapidly
3. Check Chrome DevTools Performance tab for frame drops
4. Test on iOS Safari (iPhone) and Android Chrome

### WhatsApp Button
1. Scroll up and down - button should stay fixed
2. Rapid scroll - no jank or jumping
3. Test on iOS Safari with address bar show/hide
4. Verify button doesn't intercept touch events

### Scroll-to-Top
1. Navigate from HomePage to DienstenPage - should scroll to top
2. Navigate from DienstenPage to AboutPage - should scroll to top
3. Navigate with browser back/forward - should maintain scroll position (not reset)
4. Navigate to same route with different state - should not reset
5. Hash navigation (#section) - should NOT scroll to top

---

## RISK ASSESSMENT

**Low Risk:**
- Mobile-only changes (gated with breakpoints)
- WhatsApp button throttling (performance improvement)
- ScrollToTop enhancement (more reliable)

**Medium Risk:**
- Disabling ScrollTrigger on mobile (might affect animations, but mobile users prefer performance)
- IntersectionObserver fallback (needs testing)

**Mitigation:**
- All changes are mobile-only (max-width: 768px)
- Desktop behavior unchanged
- Fallback to simple animations on mobile
- Extensive testing on real devices

---

## TESTING CHECKLIST

- [ ] Fast scroll on HomePage (mobile)
- [ ] Fast scroll on DienstenPage (mobile)
- [ ] WhatsApp button stability during scroll
- [ ] Navigate HomePage → DienstenPage (scroll to top)
- [ ] Navigate DienstenPage → AboutPage (scroll to top)
- [ ] Browser back button (preserve scroll)
- [ ] Hash navigation (#section) (no scroll to top)
- [ ] Desktop behavior unchanged
- [ ] iOS Safari testing
- [ ] Android Chrome testing

