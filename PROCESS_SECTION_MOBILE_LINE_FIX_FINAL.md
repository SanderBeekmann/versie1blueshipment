# Process Section Mobile Line Fix - Final

## 🔍 Geïdentificeerde Problemen

### 1. **Dubbele Lijn**
**Probleem:**
- `.process-steps::before` (oude lijn) was nog steeds zichtbaar op mobiel
- `.process-timeline-rail` (nieuwe lijn) was ook zichtbaar
- Resultaat: twee lijnen naast elkaar

**Oorzaak:**
- `.process-steps::before` was niet verborgen op mobiel
- Beide lijnen werden gerenderd

### 2. **Verkeerde Animatierichting**
**Probleem:**
- Lijn groeide van bottom naar top (`bottom: 0`, `height` groeit)
- Moest groeien van top naar bottom (zoals desktop)

**Oorzaak:**
- `transform-origin: bottom` en `height` animatie van 0 naar 100%
- Dit maakte de lijn van onder naar boven groeien

### 3. **Geen Viewport-Follow**
**Probleem:**
- Lijn animeerde alleen op basis van scroll progress
- Bleef niet rond viewport center

**Oorzaak:**
- Gebruikte alleen `height` animatie gebaseerd op `self.progress`
- Geen berekening van viewport center positie

## ✅ Uitgevoerde Fixes

### 1. Verwijder Dubbele Lijn
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Wijziging:**
```css
@media (max-width: 1023px) {
  /* Mobile: Hide old process-steps::before line */
  .process-steps::before {
    display: none;
  }
}
```

### 2. Correcte Uitlijning
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**CSS Variable:**
- `--rail-x: calc(var(--section-padding-medium) + 12px - 1.5px)`
  - Container padding + center van 24px kolom (12px) - helft lijn breedte (1.5px)

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

### 3. Correcte Animatierichting
**Bestand:** `src/components/sections/ProcessSection/ProcessSection.css`

**Wijziging:**
```css
/* Mobile: Active segment that follows viewport center */
.process-timeline-progress {
  position: absolute;
  top: 0; /* Will be animated by GSAP translateY */
  left: 0;
  width: 3px;
  height: 120px; /* Fixed height for active segment */
  background-color: var(--color-white);
  transform: translateY(0); /* Will be animated by GSAP */
}
```

- Verwijderd: `bottom: 0`, `height: 0`, `transform-origin: bottom`
- Toegevoegd: `top: 0`, `height: 120px` (fixed), `transform: translateY(0)`

### 4. Viewport-Follow Animatie
**Bestand:** `src/utils/scrollAnimations.js`

**Nieuwe animatie:**
```javascript
ScrollTrigger.create({
  trigger: processContainer,
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    // Calculate y-position to keep segment around viewport center
    const containerRect = processContainer.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;
    
    // Calculate desired y-position: viewport center relative to container top
    let targetY = viewportCenter - containerTop - (progressLine.offsetHeight / 2);
    
    // Clamp to keep segment within container bounds
    const segmentHeight = progressLine.offsetHeight;
    const minY = 0;
    const maxY = containerHeight - segmentHeight;
    targetY = Math.max(minY, Math.min(maxY, targetY));
    
    // Animate translateY to move segment
    gsap.set(progressLine, {
      y: targetY,
    });
  },
});
```

**Hoe het werkt:**
1. Berekent viewport center (`window.innerHeight / 2`)
2. Berekent container positie t.o.v. viewport (`containerRect.top`)
3. Berekent gewenste y-positie: viewport center - container top - helft segment hoogte
4. Clamp waarde binnen container bounds (0 tot containerHeight - segmentHeight)
5. Animeert `translateY` om segment te verplaatsen

## ✅ Scroll Veiligheid

**Geen wijzigingen aan:**
- ❌ `html`, `body`, `#root`, `.app` overflow-y of height
- ❌ Geen wrappers met `overflow-y: auto/scroll` of `h-screen/100vh`
- ❌ Geen pinning op mobiel
- ❌ Geen custom scroller

**Alleen wijzigingen:**
- ✅ `.process-steps::before` verborgen op mobiel
- ✅ Rail container met `position: absolute` (geen scroll impact)
- ✅ Active segment met `translateY` animatie (geen scroll impact)
- ✅ `gsap.matchMedia()` voor geïsoleerde mobile/desktop code

## 🎯 Resultaat

- ✅ **Exact één lijn zichtbaar op mobiel** - oude lijn verborgen
- ✅ **Lijn loopt perfect door cirkels** - gedeelde `--rail-x` variable
- ✅ **Animatierichting correct** - top-geankerd, groeit van boven naar beneden
- ✅ **Animaties volgt scroll en blijft rond viewport center** - `translateY` berekening
- ✅ **Geen verdwenen content** - GSAP state reset blijft actief
- ✅ **Geen scroll lock** - geen pinning, geen custom scroller
- ✅ **Geen extra verticale scrollbar** - geen overflow wijzigingen
- ✅ **Desktop exact hetzelfde** - `gsap.matchMedia()` scheidt mobile/desktop

## 📝 Waarom dit scroll niet breekt

1. **Absolute positioning:** Rail container en active segment gebruiken `position: absolute`, geen invloed op scroll flow.

2. **TranslateY animatie:** Alleen `translateY` wordt geanimeerd, geen layout properties die scroll kunnen beïnvloeden.

3. **Geen pinning:** ScrollTrigger gebruikt geen `pin`, dus geen extra scroll space.

4. **Geen custom scroller:** Gebruikt standaard `window` scroller, geen custom scroll containers.

5. **Geïsoleerde mobile code:** `gsap.matchMedia()` zorgt dat mobile code alleen op mobiel draait, desktop blijft 100% hetzelfde.

