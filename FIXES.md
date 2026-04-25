# Shirt editor fixes (Step 1)

## What was broken

1. **Blank or empty-looking canvas**
   - **Relative mockup URLs**: Django often returns `mockup_image` as `/media/...`. The browser requested that path from the Next.js origin (`localhost:3000`), so the image 404’d and nothing drew on top of the gray background.
   - **Print-area “rectangle”**: The old editor used `FabricObject` with `width`/`height` for the dashed guide. In Fabric.js v6/v7, that does not behave like a visible `Rect`, so the guide could fail to render as expected.
   - **History + `loadFromJSON`**: Firing history snapshots while Fabric was still loading objects produced noisy state and could interfere with undo/redo.

2. **`FabricImage.fromURL` usage (Fabric 7)**  
   The second argument must be an options object (e.g. `{ crossOrigin: 'anonymous' }`), not `undefined`, to match the current Fabric typings and load behavior.

3. **Event listeners attached too early**  
   `object:added` ran while the shirt mockup was still loading, pushing half-built states onto the undo stack.

## What we changed

- Added **`frontend/lib/resolveMockupUrl.ts`** to turn API-relative media paths into absolute URLs using `NEXT_PUBLIC_API_URL` (strip `/api`, prepend origin).
- Added **`frontend/public/mockup-tshirt.svg`** as an offline-friendly fallback if the product has no mockup or loading fails.
- Replaced **`FabricCanvas.tsx`** with **`ShirtEditor.tsx`**:
  - Explicit canvas wrapper size, dashed border, and `touchAction: 'none'` plus non-passive `touchmove` prevention for multi-touch (reduces browser gesture fighting the canvas on mobile).
  - **`Rect`** for the print-area guide; **`FabricImage.fromURL`** with CORS retry then local SVG fallback.
  - **Undo/redo** via a JSON snapshot stack capped at **50** steps; **`suppressHistory`** during `loadFromJSON` and a **`requestAnimationFrame`** tick before re-enabling snapshots so Fabric events do not corrupt history.
  - **Export PNG** with transparent background (`multiplier: 3`) and **`saveDesign` / `getDesign`** wired to `/api/designs/`.
  - **Toasts** for save/load/export feedback.
- **`lib/api.ts`**: added **`getDesign(id)`** for `GET /api/designs/<id>/`.
- **Product page** now renders **`ShirtEditor`** with **`productId`** for save/load validation.

## Note on `import { fabric } from 'fabric'`

This project uses **Fabric 7**, which exposes **named exports** (`Canvas`, `FabricImage`, `IText`, `Rect`, …). The legacy `fabric` namespace is not used.

## How to verify (Chrome desktop)

1. Run Django (`python manage.py runserver`) and Next (`npm run dev` in `frontend/`).
2. Open a clothing product: `/product/<id>`.
3. You should see the **shirt mockup** inside the bordered canvas, dashed print guide (if configured), and **Add Text** / **Add Clipart** updating the canvas.
4. **Undo / Redo**, **Clear canvas** (removes user objects; keeps mockup + guide), **Export PNG**, **Save to server** (requires API), **Load** with a design UUID returned from save.
