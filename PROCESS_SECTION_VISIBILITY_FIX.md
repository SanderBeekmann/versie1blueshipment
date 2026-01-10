# Process Section Mobile Visibility Fix

## 🔍 Geïdentificeerde Problemen

### 1. **GSAP Initial States Verbergen Content**
**Probleem:** 
- `.step-image` heeft `opacity: 0` in CSS (regel 166) - dit is een desktop-only state voor GSAP animaties
- `.timeline-text` en `.timeline-media` elementen krijgen `opacity: 0` en `transform` states van GSAP
- Op mobiel worden deze states niet gereset, waardoor content onzichtbaar blijft

**Locatie:**
- `src/components/sections/ProcessSection/ProcessSection.css` regel 166: `.step-image { opacity: 0; }`
- `src/utils/scrollAnimations.js` regel 683-695: `gsap.set()` calls die `opacity: 0` en `x` transforms toepassen

### 2. **Z-Index Issues**
**Probleem:**
- `.process-container::before` lijn heeft `z-index: 0`
- Content heeft geen z-index, waardoor het mogelijk achter de lijn valt

**Locatie:**
- `src/components/sections/ProcessSection/ProcessSection.css` regel 334: `.process-container::before { z-index: 0; }`

### 3. **Overflow Clipping**
**Probleem:**
- `.process-container` heeft mogelijk `overflow: hidden` die content kan afsnijden
- Op mobiel moet `overflow-y: visible` zijn om content volledig zichtbaar te maken

## ✅ Uitgevoerde Fixes

### 1. CSS: Mobile Visibility Overrides
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Toegevoegd in `@media (max-width: 1023px)`:**
```css
/* Mobile: Ensure images and text are always visible */
.step-image {
  opacity: 1 !important; /* Override GSAP initial state on mobile */
  transform: none !important; /* Reset any GSAP transforms */
  will-change: auto;
}

.timeline-text,
.timeline-media {
  opacity: 1 !important; /* Override GSAP initial state on mobile */
  transform: none !important; /* Reset any GSAP transforms */
  will-change: auto;
}

.step-content-mobile {
  position: relative;
  z-index: 10; /* Above the timeline line */
}

.process-step {
  position: relative;
  z-index: 1; /* Ensure steps are above the line */
}

.process-step-final {
  position: relative;
  z-index: 1; /* Ensure step 6 is above the line */
}
```

### 2. GSAP: Mobile State Reset
**Bestand:** `src/utils/scrollAnimations.js`

**Toegevoegd in `initTimelineAnimations()`:**
```javascript
// On mobile, skip GSAP animations - use static CSS line only
// IMPORTANT: Reset any GSAP states that might have been applied before mobile check
if (isMobile) {
  // Reset all GSAP states on mobile to ensure content is visible
  stepItems.forEach((stepItem) => {
    const textElements = stepItem.querySelectorAll('.timeline-text');
    const media = stepItem.querySelector('.timeline-media');
    const img = media ? media.querySelector('img') : null;
    
    // Reset opacity and transforms to ensure visibility
    if (textElements.length > 0) {
      gsap.set(textElements, { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1,
        willChange: 'auto',
        clearProps: 'all' // Clear all GSAP properties
      });
    }
    
    if (media && img) {
      gsap.set([media, img], { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1,
        willChange: 'auto',
        clearProps: 'all' // Clear all GSAP properties
      });
    }
  });
  
  return;
}
```

### 3. Container Overflow Fix
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Aangepast in `@media (max-width: 1023px)`:**
```css
.process-container {
  position: relative; /* For absolute positioned line */
  /* Ensure content is not clipped - only clip horizontal overflow if needed */
  overflow-x: clip;
  overflow-y: visible; /* Allow content to be fully visible */
}
```

## ✅ Scroll Veiligheid

**Geen wijzigingen aan:**
- ❌ `html`, `body`, `#root`, `.app` overflow-y of height regels
- ❌ Geen wrappers met `overflow-y: auto/scroll` of `h-screen/100vh`
- ❌ Geen globale CSS "quick fixes"
- ❌ Geen `overscroll-behavior` wijzigingen
- ❌ Geen `preventDefault` touch/wheel listeners

**Alleen wijzigingen:**
- ✅ CSS `opacity: 1 !important` en `transform: none !important` op mobiel (override GSAP states)
- ✅ Z-index op content elementen (zorgt dat content boven lijn staat)
- ✅ `overflow-y: visible` op `.process-container` op mobiel (voorkomt clipping)
- ✅ GSAP state reset op mobiel (zorgt dat content zichtbaar is)

## 🎯 Resultaat

- ✅ **Tekst volledig zichtbaar** op mobiel - geen opacity: 0 states meer
- ✅ **Afbeeldingen volledig zichtbaar** op mobiel - geen opacity: 0 states meer
- ✅ **Content boven lijn** - z-index zorgt voor correcte stacking
- ✅ **Geen scroll lock** - geen wijzigingen aan scroll containers
- ✅ **Exact één verticale scrollbar** - browser scroll blijft intact
- ✅ **Desktop ongewijzigd** - GSAP animaties blijven werken op >= 1024px

## 📝 Waarom dit scroll niet breekt

1. **Alleen CSS overrides:** `opacity: 1 !important` en `transform: none !important` zijn pure CSS overrides die geen invloed hebben op scroll gedrag.

2. **Z-index alleen voor stacking:** Z-index wijzigt alleen de visuele stacking order, niet scroll gedrag.

3. **Overflow-y: visible:** Dit zorgt dat content niet wordt afgesneden, maar heeft geen invloed op scroll containers.

4. **GSAP clearProps:** `clearProps: 'all'` verwijdert alleen GSAP properties, geen scroll-gerelateerde properties.

5. **Geen body/html wijzigingen:** Geen wijzigingen aan globale scroll containers.




