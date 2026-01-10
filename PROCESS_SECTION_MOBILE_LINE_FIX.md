# Process Section Mobile Lijn Fix

## 🔍 Diagnose

**Probleem:** Op mobiel loopt de timeline lijn niet door van stap 1 tot stap 6.

**Oorzaak:** 
- Elke `.process-step` heeft zijn eigen `.step-timeline` met individuele lijnen
- Deze lijnen zijn niet met elkaar verbonden
- GSAP ScrollTrigger animaties werken niet goed op mobiel

## ✅ Oplossing

### 1. Mobile-only statische doorlopende lijn
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Implementatie:**
- Toegevoegd: `.process-container::before` op mobiel (max-width: 1023px)
- Lijn loopt van `top: 0` tot `bottom: 0` van de container
- Gebruikt `position: absolute` binnen `position: relative` container
- Lijn positie: `left: calc(var(--section-padding-medium) + 12px - 1.5px)`
  - Container padding + center van 24px kolom (12px) - helft lijn breedte (1.5px)

**CSS wijzigingen:**
```css
@media (max-width: 1023px) {
  .process-container {
    position: relative; /* For absolute positioned line */
  }
  
  .process-container::before {
    content: '';
    position: absolute;
    left: calc(var(--section-padding-medium) + 12px - 1.5px);
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: rgba(255, 255, 255, 0.3);
    z-index: 0;
    pointer-events: none;
  }
  
  /* Hide individual timeline lines on mobile */
  .step-timeline .timeline-line,
  .step-timeline .timeline-line-base,
  .step-timeline .timeline-line-progress {
    display: none;
  }
}
```

### 2. GSAP ScrollTrigger alleen op desktop
**Bestand:** `src/utils/scrollAnimations.js`

**Implementatie:**
- Toegevoegd: Mobile check aan het begin van `initTimelineAnimations`
- Als `max-width: 1023px`, return early (skip alle GSAP animaties)
- Desktop (>= 1024px) blijft exact hetzelfde

**Code wijziging:**
```javascript
export const initTimelineAnimations = (stepsContainer, processContainer, options = {}) => {
  if (!stepsContainer || !processContainer) return;

  // Check if mobile - GSAP animations only on desktop
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  
  // On mobile, skip GSAP animations - use static CSS line only
  if (isMobile) {
    return;
  }
  
  // ... rest of desktop GSAP code unchanged
}
```

### 3. Step 6 dot op mobiel
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Implementatie:**
- Toegevoegd: `.process-step-final::before` voor dot op stap 6
- Dot gepositioneerd op dezelfde positie als andere dots

## ✅ Scroll Veiligheid

**Geen wijzigingen aan:**
- ❌ `html`, `body`, `#root`, `.app` overflow-y of height regels
- ❌ Geen wrappers met `overflow-y: auto/scroll` of `h-screen/100vh`
- ❌ Geen globale CSS "quick fixes"
- ❌ Geen `overscroll-behavior` wijzigingen
- ❌ Geen `preventDefault` touch/wheel listeners
- ❌ Geen CSS die overflow op grote containers wijzigt

**Alleen wijzigingen:**
- ✅ `.process-container` krijgt `position: relative` (alleen op mobiel)
- ✅ `.process-container::before` voor statische lijn (alleen op mobiel)
- ✅ `.process-container` krijgt `overflow-x: clip` (prevent horizontale scroll)
- ✅ Individuele timeline lijnen verborgen op mobiel
- ✅ GSAP code skip op mobiel

## 🎯 Resultaat

- ✅ **Doorlopende lijn op mobiel** van stap 1 tot stap 6
- ✅ **Desktop gedrag ongewijzigd** - GSAP ScrollTrigger animaties blijven werken
- ✅ **Geen scroll lock** - geen wijzigingen aan scroll containers
- ✅ **Exact één verticale scrollbar** - browser scroll blijft intact
- ✅ **Geen extra scrollcontainers** - alleen visuele CSS wijzigingen
- ✅ **Mobile-only fix** - desktop code blijft 100% hetzelfde

## 📝 Waarom dit scroll niet breekt

1. **Alleen visuele CSS:** De lijn is een `::before` pseudo-element met `position: absolute` binnen een `position: relative` container. Dit heeft geen invloed op scroll gedrag.

2. **Geen overflow wijzigingen:** Alleen `overflow-x: clip` op `.process-container` (prevent horizontale scroll), geen wijzigingen aan verticale overflow.

3. **Geen GSAP op mobiel:** GSAP ScrollTrigger code wordt volledig overgeslagen op mobiel, dus geen pinning, geen scroll listeners, geen extra scroll containers.

4. **Geen wrappers:** Geen nieuwe divs of containers toegevoegd die scroll kunnen beïnvloeden.

5. **Geen body/html wijzigingen:** Geen wijzigingen aan globale scroll containers.




