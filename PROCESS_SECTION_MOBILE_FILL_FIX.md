# Process Section Mobile Fill Fix

## 🔍 Geïdentificeerde Problemen

### 1. **Fill werd te lang (overschreed rail)**
**Probleem:**
- Fill gebruikte `progressMaxPx` gebaseerd op `step6El` positie
- Dit was niet de exacte rail hoogte
- Fill kon langer worden dan de rail

**Oorzaak:**
- Cap gebruikte verkeerde max: `step6El` positie in plaats van `railTrackEl` hoogte

### 2. **Viewport-follow punt te laag**
**Probleem:**
- Viewport center berekening gebruikte `containerTop` direct
- Dit gaf verkeerde offset basis
- Fill volgde niet exact 50vh

**Oorzaak:**
- Verkeerde offset basis: `viewportCenter - containerTop` zonder rekening te houden met rail positie

## ✅ Uitgevoerde Fixes

### 1. Correcte Rail Hoogte Cap
**Bestand:** `src/utils/scrollAnimations.js`

**Wijziging:**
- Gebruikt nu `railTrackEl` om exacte rail hoogte te bepalen
- `railHeightPx = railBottomInSection - railTopInSection`
- Fill cap: `Math.min(rawFill, railHeightPx)` - stopt exact bij rail bottom

**Code:**
```javascript
const railRect = railTrackEl.getBoundingClientRect();
const railTopInSection = railRect.top - sectionRect.top;
const railBottomInSection = railRect.bottom - sectionRect.top;
const railHeightPx = railBottomInSection - railTopInSection;
```

### 2. Correcte Viewport Center Berekening
**Bestand:** `src/utils/scrollAnimations.js`

**Wijziging:**
- Viewport center berekening is nu relatief aan rail top
- `viewportCenterInSection = viewportCenter - sectionRect.top`
- `rawFill = viewportCenterInSection - railTopInSection`
- Dit zorgt dat fill exact tot 50vh groeit

**Code:**
```javascript
const viewportCenter = window.innerHeight * 0.5;
const viewportCenterInSection = viewportCenter - sectionRect.top;
const rawFill = viewportCenterInSection - railTopInSection;
const fillHeightPx = Math.max(0, Math.min(rawFill, railHeightPx));
```

### 3. Element Identificatie
**Elementen:**
- `railTrackEl`: `.process-timeline-track` (statische rail, lage opacity)
- `railFillEl`: `.process-timeline-progress` (geanimeerde fill)
- Beide zitten in `.process-timeline-rail` (shared parent, zelfde coordinate systeem)

### 4. Refresh Handling
**Toegevoegd:**
- `onRefresh` callback in ScrollTrigger
- Herberekent `railHeightPx` en offsets bij resize/orientation change
- Zorgt voor correcte animatie na layout wijzigingen

### 5. Null Checks
**Toegevoegd:**
- Null checks voor `railTrackEl` en `railFillEl`
- Fallback voor reduced motion
- Geen runtime errors als elementen niet bestaan

## 📐 Berekening Uitleg

**Fill hoogte berekening:**
1. `sectionRect` = processContainer positie
2. `railRect` = railTrackEl positie
3. `viewportCenter` = `window.innerHeight * 0.5` (50vh)
4. `viewportCenterInSection` = viewport center relatief aan section top
5. `railTopInSection` = rail top relatief aan section top
6. `railHeightPx` = exacte rail hoogte (rail bottom - rail top)
7. `rawFill` = viewport center relatief aan rail top
8. `fillHeightPx` = clamp(0, rawFill, railHeightPx)

**Waarom dit werkt:**
- Rail top offset wordt meegenomen in `rawFill` berekening
- Rail hoogte wordt gebruikt als absolute cap (niet section hoogte)
- Viewport center (50vh) is de basis voor fill groei

## ✅ Resultaat

- ✅ **Fill stopt exact op rail bottom** - gebruikt `railHeightPx` als cap
- ✅ **Viewport-follow punt op 50vh** - correcte offset basis met `railTopInSection`
- ✅ **Geen extra scrollbar** - geen overflow wijzigingen
- ✅ **Geen scroll lock** - geen pinning, geen custom scroller
- ✅ **Desktop ongewijzigd** - `gsap.matchMedia()` scheidt mobile/desktop
- ✅ **Refresh handling** - correcte animatie na resize/orientation change

## 📝 Waarom dit scroll niet breekt

1. **Alleen height animatie:** `gsap.set(railFillEl, { height: fillHeightPx })` - geen layout impact
2. **Absolute positioning:** Rail en fill zijn `position: absolute` - geen scroll flow impact
3. **Geen pinning:** ScrollTrigger gebruikt geen `pin` - geen extra scroll space
4. **Geen custom scroller:** Gebruikt standaard `window` scroller
5. **Geïsoleerde mobile code:** `gsap.matchMedia()` zorgt dat mobile code alleen op mobiel draait




