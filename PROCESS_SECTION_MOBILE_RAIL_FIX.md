# Process Section Mobile Rail & Progress Line Fix

## 🎯 Doel

Op mobiel (<1024px):
1. Lijn gecentreerd door de cirkels (exact dezelfde x-positie)
2. Lijn "volgt" de viewport tijdens scroll (progress animatie)

## ✅ Uitgevoerde Wijzigingen

### 1. CSS: Rail Container & Shared X-Position
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Toegevoegd:**
- CSS variable `--rail-x` voor gedeelde x-positie: `calc(var(--section-padding-medium) + 12px - 1.5px)`
  - Container padding + center van 24px kolom (12px) - helft lijn breedte (1.5px)
- Rail container `.process-timeline-rail`:
  - `position: absolute`
  - `left: var(--rail-x)`
  - `top: 0; bottom: 0` (inset-y-0)
  - `z-index: 0` (achter content)
- Track `.process-timeline-track`:
  - Statische basislijn (volledige hoogte)
  - `background-color: rgba(255, 255, 255, 0.3)`
- Progress `.process-timeline-progress`:
  - Animated progress lijn
  - `position: absolute; bottom: 0`
  - `height: 0` (wordt geanimeerd door GSAP)
  - `background-color: var(--color-white)`

**Aangepast:**
- `.step-timeline .timeline-dot`: `left: calc(12px - 5.5px)` (center van 24px kolom)
- `.process-step-final::before`: `left: calc(12px - 5.5px)` (center van 24px kolom)

### 2. HTML: Rail Container Toegevoegd
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.js`

**Toegevoegd:**
```jsx
<div className="process-steps" ref={processStepsRef}>
  {/* Mobile: Timeline rail container for animated line */}
  <div className="process-timeline-rail">
    <div className="process-timeline-track"></div>
    <div className="process-timeline-progress"></div>
  </div>
  {/* ... steps ... */}
</div>
```

### 3. GSAP: Mobile Progress Animation
**Bestand:** `src/utils/scrollAnimations.js`

**Herstructurering:**
- Gebruikt `gsap.context()` voor proper cleanup
- Gebruikt `gsap.matchMedia()` voor desktop/mobile scheiding

**Mobile (max-width: 1023px):**
- Reset GSAP states voor content visibility
- Animate progress line:
  - `ScrollTrigger.create()` met:
    - `trigger: processContainer`
    - `start: 'top center'`
    - `end: 'bottom center'`
    - `scrub: true`
    - `onUpdate`: `height: ${progress * 100}%`
  - Geen pin, geen custom scroller
  - `transform-origin: bottom` (groeit van onder naar boven)

**Desktop (min-width: 1024px):**
- Bestaande code ongewijzigd
- Alle desktop animaties blijven werken

**Cleanup:**
- `ctx.revert()` in return cleanup function
- `ScrollTrigger.refresh()` na initialisatie

### 4. Component Cleanup
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.js`

**Aangepast:**
- `initTimelineAnimations()` retourneert nu cleanup function
- Component gebruikt cleanup function in `useLayoutEffect` return

## 📐 X-Offset Uitleg

**Gedeelde x-positie (`--rail-x`):**
- `calc(var(--section-padding-medium) + 12px - 1.5px)`
- Container padding + center van 24px kolom - helft lijn breedte

**Lijn positie:**
- `.process-timeline-rail`: `left: var(--rail-x)`

**Dot positie:**
- `.step-timeline .timeline-dot`: `left: calc(12px - 5.5px)`
  - Center van 24px kolom (12px) - helft dot breedte (5.5px)
  - Binnen `.step-timeline` die in grid column 1 staat (24px breed)
  - Grid column 1 begint op `var(--section-padding-medium)`
  - Center = `var(--section-padding-medium) + 12px`
  - Lijn center = `var(--section-padding-medium) + 12px - 1.5px + 1.5px = var(--section-padding-medium) + 12px`
  - **Perfect gecentreerd!**

## ✅ Scroll Veiligheid

**Geen wijzigingen aan:**
- ❌ `html`, `body`, `#root`, `.app` overflow-y of height
- ❌ Geen wrappers met `overflow-y: auto/scroll` of `h-screen/100vh`
- ❌ Geen globale CSS hacks
- ❌ Geen pinning op mobiel
- ❌ Geen custom scroller

**Alleen wijzigingen:**
- ✅ Rail container met `position: absolute` (geen scroll impact)
- ✅ Progress lijn met `height` animatie (geen scroll impact)
- ✅ `gsap.matchMedia()` voor geïsoleerde mobile/desktop code
- ✅ `gsap.context()` voor proper cleanup

## 🎯 Resultaat

- ✅ **Lijn gecentreerd door cirkels** - gedeelde `--rail-x` variable
- ✅ **Lijn animeert mee met viewport** - GSAP ScrollTrigger met `scrub: true`
- ✅ **Tekst en afbeeldingen blijven zichtbaar** - GSAP state reset op mobiel
- ✅ **Mobile scroll niet gelockt** - geen pinning, geen custom scroller
- ✅ **Geen extra verticale scrollbar** - geen overflow wijzigingen
- ✅ **Desktop animatie exact hetzelfde** - `gsap.matchMedia()` scheidt mobile/desktop

## 📝 Waarom dit scroll niet breekt

1. **Rail container is absolute:** `position: absolute` binnen `position: relative` container heeft geen invloed op scroll flow.

2. **Progress animatie is height-only:** Alleen `height` wordt geanimeerd, geen transforms die layout kunnen beïnvloeden.

3. **Geen pinning:** ScrollTrigger gebruikt geen `pin`, dus geen extra scroll space.

4. **Geen custom scroller:** Gebruikt standaard `window` scroller, geen custom scroll containers.

5. **Geïsoleerde mobile code:** `gsap.matchMedia()` zorgt dat mobile code alleen op mobiel draait, desktop blijft 100% hetzelfde.




