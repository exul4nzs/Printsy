'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Canvas, FabricImage, IText, Rect, Circle } from 'fabric';
import {
  Type,
  Shapes,
  Undo,
  Redo,
  Trash2,
  Download,
  CloudUpload,
  FolderOpen,
  Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMockupUrl } from '@/lib/resolveMockupUrl';
import { saveDesign, getDesign } from '@/lib/api';
import type { ProductConfig } from '@/types';

const HISTORY_CAP = 50;

type HistoryState = { stack: string[]; index: number };

type HistoryAction =
  | { type: 'PUSH'; json: string }
  | { type: 'GOTO'; index: number }
  | { type: 'RESET' };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'PUSH': {
      const slice = state.stack.slice(0, state.index + 1);
      const stack = [...slice, action.json].slice(-HISTORY_CAP);
      return { stack, index: stack.length - 1 };
    }
    case 'GOTO':
      if (action.index < 0 || action.index >= state.stack.length) return state;
      return { ...state, index: action.index };
    case 'RESET':
      return { stack: [], index: -1 };
    default:
      return state;
  }
}

export interface ShirtEditorProps {
  productId: string;
  width: number;
  height: number;
  mockupImage?: string;
  printArea?: ProductConfig['print_area'];
  onExport?: (dataUrl: string, json: unknown) => void;
  className?: string;
}

function clampSize(n: number, fallback: number): number {
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.round(Math.min(Math.max(n, 240), 1200));
}

async function addMockupAndGuide(
  canvas: Canvas,
  w: number,
  h: number,
  mockupUrl: string,
  printArea?: ProductConfig['print_area']
): Promise<void> {
  const tryLoad = async (url: string, crossOrigin: 'anonymous' | null = null) => {
    return FabricImage.fromURL(url, { crossOrigin });
  };

  let img: FabricImage;
  try {
    img = await tryLoad(mockupUrl, 'anonymous');
  } catch {
    try {
      img = await tryLoad(mockupUrl, null);
    } catch {
      img = await tryLoad('/mockup-tshirt.svg', null);
    }
  }

  img.set({
    left: 0,
    top: 0,
    scaleX: w / (img.width || 1),
    scaleY: h / (img.height || 1),
    selectable: false,
    evented: false,
    objectCaching: true,
  });
  canvas.add(img);
  canvas.sendObjectToBack(img);

  if (printArea) {
    const guide = new Rect({
      left: printArea.x,
      top: printArea.y,
      width: printArea.width,
      height: printArea.height,
      fill: 'transparent',
      stroke: '#14b8a6',
      strokeWidth: 2,
      strokeDashArray: [6, 6],
      selectable: false,
      evented: false,
      objectCaching: true,
    });
    canvas.add(guide);
  }
}

export default function ShirtEditor({
  productId,
  width: rawWidth,
  height: rawHeight,
  mockupImage,
  printArea,
  onExport,
  className,
}: ShirtEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const suppressHistory = useRef(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [history, dispatchHistory] = useReducer(historyReducer, { stack: [], index: -1 });
  const [saving, setSaving] = useState(false);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [designIdInput, setDesignIdInput] = useState('');
  const [exporting, setExporting] = useState(false);

  const w = clampSize(rawWidth, 500);
  const h = clampSize(rawHeight, 600);
  const mockupUrl = resolveMockupUrl(mockupImage);
  const printAreaKey = printArea ? JSON.stringify(printArea) : '';

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const recordSnapshot = useCallback((canvas: Canvas) => {
    if (suppressHistory.current) return;
    dispatchHistory({ type: 'PUSH', json: JSON.stringify(canvas.toJSON()) });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    dispatchHistory({ type: 'RESET' });

    const canvas = new Canvas(el, {
      width: w,
      height: h,
      backgroundColor: '#f0ebe5',
      preserveObjectStacking: true,
    });

    canvas.set({
      allowTouchScrolling: false,
      selection: true,
    });

    fabricRef.current = canvas;

    let cancelled = false;
    let listenersAttached = false;

    const onChange = () => recordSnapshot(canvas);

    const pa = printAreaKey ? (JSON.parse(printAreaKey) as ProductConfig['print_area']) : undefined;

    (async () => {
      try {
        await addMockupAndGuide(canvas, w, h, mockupUrl, pa);
        if (cancelled) return;
        canvas.renderAll();
        recordSnapshot(canvas);
      } catch (e) {
        console.error('ShirtEditor: failed to add mockup', e);
        if (!cancelled) {
          setToast({ tone: 'err', text: 'Could not load shirt mockup. Using placeholder.' });
          try {
            await addMockupAndGuide(canvas, w, h, '/mockup-tshirt.svg', pa);
            if (!cancelled) {
              canvas.renderAll();
              recordSnapshot(canvas);
            }
          } catch {
            /* empty */
          }
        }
      }
      if (cancelled) return;
      canvas.on('object:modified', onChange);
      canvas.on('object:added', onChange);
      canvas.on('object:removed', onChange);
      listenersAttached = true;
    })();

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelled = true;
      el.removeEventListener('touchmove', onTouchMove);
      if (listenersAttached) {
        canvas.off('object:modified', onChange);
        canvas.off('object:added', onChange);
        canvas.off('object:removed', onChange);
      }
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [w, h, mockupUrl, printAreaKey, recordSnapshot]);

  const getCanvas = () => fabricRef.current;

  const addText = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const text = new IText('Your Text', {
      left: w / 2 - 60,
      top: h / 2 - 18,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 28,
      fill: '#111827',
      objectCaching: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    recordSnapshot(canvas);
  };

  const addClipart = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const shape = new Circle({
      left: w / 2 - 40,
      top: h / 2 - 40,
      radius: 40,
      fill: '#14b8a6',
      stroke: '#0f766e',
      strokeWidth: 3,
      objectCaching: true,
    });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
    recordSnapshot(canvas);
  };

  const clearUserObjects = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const toRemove = canvas
      .getObjects()
      .filter((o) => !(o.selectable === false && o.evented === false));
    toRemove.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    recordSnapshot(canvas);
  };

  const deleteSelected = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.requestRenderAll();
      recordSnapshot(canvas);
    }
  };

  const handleUndo = () => {
    const canvas = getCanvas();
    if (!canvas || history.index <= 0) return;
    const newIndex = history.index - 1;
    suppressHistory.current = true;
    canvas
      .loadFromJSON(JSON.parse(history.stack[newIndex]))
      .then(() => {
        canvas.requestRenderAll();
        requestAnimationFrame(() => {
          suppressHistory.current = false;
          dispatchHistory({ type: 'GOTO', index: newIndex });
        });
      })
      .catch((err) => {
        console.error(err);
        suppressHistory.current = false;
        setToast({ tone: 'err', text: 'Undo failed.' });
      });
  };

  const handleRedo = () => {
    const canvas = getCanvas();
    if (!canvas || history.index >= history.stack.length - 1) return;
    const newIndex = history.index + 1;
    suppressHistory.current = true;
    canvas
      .loadFromJSON(JSON.parse(history.stack[newIndex]))
      .then(() => {
        canvas.requestRenderAll();
        requestAnimationFrame(() => {
          suppressHistory.current = false;
          dispatchHistory({ type: 'GOTO', index: newIndex });
        });
      })
      .catch((err) => {
        console.error(err);
        suppressHistory.current = false;
        setToast({ tone: 'err', text: 'Redo failed.' });
      });
  };

  const exportPngTransparent = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    setExporting(true);
    try {
      const json = canvas.toJSON();
      const exportCanvas = new Canvas(document.createElement('canvas'), {
        width: w,
        height: h,
      });
      await exportCanvas.loadFromJSON(json);
      exportCanvas.getObjects().forEach((obj) => {
        if (!obj.selectable && !obj.evented) {
          exportCanvas.remove(obj);
        }
      });
      exportCanvas.backgroundColor = 'transparent';
      exportCanvas.requestRenderAll();
      const dataUrl = exportCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 3,
      });
      exportCanvas.dispose();
      onExport?.(dataUrl, json);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'my-design.png';
      a.click();
      setToast({ tone: 'ok', text: 'PNG exported (transparent where the shirt shows through).' });
    } catch (e) {
      console.error(e);
      setToast({ tone: 'err', text: 'Export failed.' });
    } finally {
      setExporting(false);
    }
  };

  const saveToBackend = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    setSaving(true);
    try {
      const json = canvas.toJSON();
      const exportCanvas = new Canvas(document.createElement('canvas'), {
        width: w,
        height: h,
      });
      await exportCanvas.loadFromJSON(json);
      exportCanvas.getObjects().forEach((obj) => {
        if (!obj.selectable && !obj.evented) {
          exportCanvas.remove(obj);
        }
      });
      exportCanvas.backgroundColor = 'transparent';
      exportCanvas.requestRenderAll();
      const dataUrl = exportCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 3,
      });
      exportCanvas.dispose();

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'design.png', { type: 'image/png' });
      const saved = await saveDesign(productId, json, file);
      onExport?.(dataUrl, json);
      setToast({ tone: 'ok', text: `Design saved (id: ${saved.id.slice(0, 8)}…).` });
    } catch (e) {
      console.error(e);
      setToast({ tone: 'err', text: 'Save failed. Is the API running?' });
    } finally {
      setSaving(false);
    }
  };

  const loadFromBackend = async () => {
    const id = designIdInput.trim();
    if (!id) {
      setToast({ tone: 'err', text: 'Enter a design ID.' });
      return;
    }
    const canvas = getCanvas();
    if (!canvas) return;
    setLoadingDesign(true);
    try {
      const design = await getDesign(id);
      if (String(design.product) !== String(productId)) {
        setToast({
          tone: 'err',
          text: 'This design belongs to another product.',
        });
        return;
      }
      suppressHistory.current = true;
      await canvas.loadFromJSON(design.design_config as object);
      canvas.requestRenderAll();
      requestAnimationFrame(() => {
        suppressHistory.current = false;
        dispatchHistory({ type: 'RESET' });
        recordSnapshot(canvas);
      });
      setToast({ tone: 'ok', text: 'Design loaded from server.' });
    } catch (e) {
      console.error(e);
      suppressHistory.current = false;
      setToast({ tone: 'err', text: 'Load failed. Check the design ID.' });
    } finally {
      setLoadingDesign(false);
    }
  };

  const ToolBtn = ({
    label,
    icon: Icon,
    onClick,
    disabled,
  }: {
    label: string;
    icon: typeof Type;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-xl text-sm font-medium transition-all',
        'bg-warm-gray-100 text-warm-gray-800 hover:bg-warm-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs text-center leading-tight">{label}</span>
    </button>
  );

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6', className)}>
      {toast && (
        <div
          role="status"
          className={cn(
            'fixed bottom-6 right-6 z-50 max-w-sm rounded-xl px-4 py-3 shadow-lg text-sm',
            toast.tone === 'ok' ? 'bg-emerald-800 text-white' : 'bg-red-700 text-white'
          )}
        >
          {toast.text}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div
          className="inline-block rounded-xl border-2 border-dashed border-accent/50 bg-warm-gray-50 p-2 shadow-inner"
          style={{
            width: w + 16,
            touchAction: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={w}
            height={h}
            className="block max-w-full h-auto rounded-lg"
            style={{ width: w, height: h }}
          />
        </div>
        <p className="mt-2 text-xs text-warm-gray-500">
          Canvas {w}×{h}px · export uses ×3 multiplier for print resolution.
        </p>
      </div>

      <div className="lg:w-80 flex flex-col gap-4 shrink-0">
        <div className="card p-4">
          <h3 className="font-semibold text-warm-gray-900 mb-3">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <ToolBtn label="Add Text" icon={Type} onClick={addText} />
            <ToolBtn label="Add Clipart" icon={Shapes} onClick={addClipart} />
            <ToolBtn label="Clear canvas" icon={Eraser} onClick={clearUserObjects} />
            <ToolBtn label="Delete selected" icon={Trash2} onClick={deleteSelected} />
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-warm-gray-900 mb-3">History (max {HISTORY_CAP})</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.index <= 0}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Undo className="w-4 h-4" />
              Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={history.index >= history.stack.length - 1}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Redo className="w-4 h-4" />
              Redo
            </button>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-warm-gray-900">Export &amp; server</h3>
          <button
            type="button"
            onClick={exportPngTransparent}
            disabled={exporting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
          <button
            type="button"
            onClick={saveToBackend}
            disabled={saving}
            className="btn-secondary w-full flex items-center justify-center gap-2 border border-accent/30"
          >
            <CloudUpload className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save to server'}
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={designIdInput}
              onChange={(e) => setDesignIdInput(e.target.value)}
              placeholder="Design UUID…"
              className="input flex-1 text-sm"
            />
            <button
              type="button"
              onClick={loadFromBackend}
              disabled={loadingDesign}
              className="btn-secondary flex items-center gap-1 shrink-0"
              title="Load design from server"
            >
              <FolderOpen className="w-4 h-4" />
              {loadingDesign ? '…' : 'Load'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
