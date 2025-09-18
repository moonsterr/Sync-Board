import DrawOptions from '../components/DrawOptions';
import DrawCustomizations from '../components/DrawCustomizations';
import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';

const DrawContext = createContext();

export default function CanvasInstance() {
  const [draw, setDraw] = useState({
    current: 'draw',
    square: {
      outline: '#000000',
      fill: '#ffffff',
      stroke_width: 2,
      transparency: 1,
    },
    diamond: {
      outline: '#000000',
      fill: '#ffffff',
      stroke_width: 2,
      transparency: 1,
    },
    circle: {
      outline: '#000000',
      fill: '#ffffff',
      stroke_width: 2,
      transparency: 1,
    },
    arrow: { outline: '#000000', stroke_width: 2, transparency: 1 },
    line: { outline: '#000000', stroke_width: 2, transparency: 1 },
    draw: { outline: '#000000', stroke_width: 2, transparency: 1 },
    font: {
      outline: '#000000',
      font_family: 1,
      stroke_width: 2,
      transparency: 1,
    },
    pan: {}, // new pan tool
  });

  // Elements array (Excalidraw-like): each element has _id, type, startingPosition, endingPosition, style, points (for draw)
  const [elements, setElements] = useState([]); // serializable scene/state
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);

  // Optional socket ref placeholder (you'll wire real socket)
  // const socketRef = useRef(null);

  useEffect(() => {
    // Initialize canvas + context
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    // Example socket wiring skeleton:
    // socketRef.current = io(SERVER_URL);
    // socketRef.current.on('element:add', (el) => applyRemoteAdd(el));
    // socketRef.current.on('element:update', (el) => applyRemoteUpdate(el));

    // cleanup on unmount
    return () => {
      // if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Utility: current tool info from mouse event
  function findCurrentTool(e) {
    return {
      current: draw.current,
      ...draw[draw.current],
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  }

  // Set ctx style from element.style or tool
  function setCtxContext(obj) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineWidth = obj.stroke_width ?? 2;
    ctx.strokeStyle = obj.outline ?? '#000';
    ctx.globalAlpha = obj.transparency ?? 1;
    if (obj.current === 'draw' || obj.current === 'line') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
    }
  }

  // Draw a single element on the context (pure drawing based on element data)
  function drawElement(ctx, el) {
    const {
      type,
      startingPosition,
      endingPosition,
      points = [],
      style = {},
    } = el;
    setCtxContext({ ...style, current: type });

    // apply pan offset
    const offsetX = pan.x;
    const offsetY = pan.y;

    // helper coordinates
    const startX = (startingPosition?.x ?? 0) + offsetX;
    const startY = (startingPosition?.y ?? 0) + offsetY;
    const endX = (endingPosition?.x ?? startX) + offsetX;
    const endY = (endingPosition?.y ?? startY) + offsetY;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // helper: decide if fill should be applied
    const shouldFill =
      style.fill &&
      style.fill.toLowerCase() !== '#ffffff' &&
      style.fill.toLowerCase() !== 'white';

    // shapes
    if (type === 'square' || type === 'rect') {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      if (shouldFill) {
        ctx.fillStyle = style.fill;
        ctx.fill();
      }
      ctx.stroke();
    } else if (type === 'diamond') {
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + width, cy);
      ctx.lineTo(cx, y + height);
      ctx.lineTo(x, cy);
      if (shouldFill) {
        ctx.fillStyle = style.fill;
        ctx.fill();
      }
      ctx.closePath();
      ctx.stroke();
    } else if (type === 'circle') {
      const radius = Math.min(width, height) / 2;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
      if (shouldFill) {
        ctx.fillStyle = style.fill;
        ctx.fill();
      }
      ctx.stroke();
    } else if (type === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (type === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      drawArrowHead(ctx, startX, startY, endX, endY, style.stroke_width ?? 2);
    } else if (type === 'draw') {
      if (!points || points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x + offsetX, points[0].y + offsetY);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + offsetX, points[i].y + offsetY);
      }
      ctx.stroke();
    } else if (type === 'text') {
      ctx.save();
      ctx.fillStyle = style.outline ?? '#000';
      ctx.font = `${style.font_size ?? 16}px sans-serif`;
      ctx.fillText(el.text || '', startX, startY);
      ctx.restore();
    }
  }

  // arrowhead helper
  function drawArrowHead(ctx, x1, y1, x2, y2, strokeWidth) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = Math.max(8, strokeWidth * 3);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  // redraw all elements from state (single source of truth)
  const redraw = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const el of elements) {
      drawElement(ctx, el);
    }
  }, [elements, pan]);

  // call redraw when elements change
  useEffect(() => {
    redraw();
  }, [elements, pan, redraw]);

  // Event: start drawing
  function onInitiateDraw(e) {
    const tool = findCurrentTool(e);

    if (tool.current === 'pan') {
      isPanningRef.current = true;
      panRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const ctx = ctxRef.current;
    setCtxContext(tool);
    if (tool.current === 'draw') {
      // For freehand, maintain points array inside an element
      const el = {
        _id: nanoid(),
        type: 'draw',
        points: [{ x: tool.x - pan.x, y: tool.y - pan.y }],
        style: { ...draw.draw }, // copy style
      };
      setElements((prev) => [...prev, el]);
      // optional: socket emit add
      // socketRef.current?.emit('element:add', el);
    } else if (
      ['square', 'diamond', 'circle', 'line', 'arrow', 'text'].includes(
        tool.current
      )
    ) {
      const el = {
        _id: nanoid(),
        type: tool.current,
        startingPosition: { x: tool.x - pan.x, y: tool.y - pan.y },
        endingPosition: { x: tool.x - pan.x, y: tool.y - pan.y },
        style: { ...draw[tool.current] },
      };
      setElements((prev) => [...prev, el]);
      // socketRef.current?.emit('element:add', el);
    }

    // keep existing stroke behavior untouched:
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(tool.x, tool.y);
    }
    setIsDrawing(true);
  }

  // Event: while drawing (mouse move)
  function whileDrawing(e) {
    const tool = findCurrentTool(e);

    // Panning logic
    if (tool.current === 'pan') {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panRef.current.x;
      const dy = e.clientY - panRef.current.y;
      panRef.current = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (!isDrawing) return;

    // freehand stroke: append point to last element
    if (tool.current === 'draw') {
      setElements((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (!last || last.type !== 'draw') return prev;
        // Create new element array immutably
        const newPoint = { x: tool.x - pan.x, y: tool.y - pan.y };
        const updatedLast = {
          ...last,
          points: [...(last.points || []), newPoint],
        };
        const newArr = [...prev.slice(0, -1), updatedLast];
        // optionally emit incremental updates: socketRef.current?.emit('element:update', { _id: updatedLast._id, points: updatedLast.points });
        return newArr;
      });

      // keep existing stroke drawing for immediate feedback
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.lineTo(tool.x, tool.y);
        ctx.stroke();
      }
      return;
    }

    // Non-freehand: update endingPosition of last element (live resizing)
    setElements((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      // Only update if last element exists and is a shape-type
      if (
        !last ||
        !['square', 'diamond', 'circle', 'line', 'arrow', 'text'].includes(
          last.type
        )
      )
        return prev;
      const updated = {
        ...last,
        endingPosition: { x: tool.x - pan.x, y: tool.y - pan.y },
      };
      const newArr = [...prev.slice(0, -1), updated];
      // socketRef.current?.emit('element:update', { _id: updated._id, endingPosition: updated.endingPosition });
      return newArr;
    });

    // redraw triggered by state update (useEffect on elements)
  }

  // Event: finish drawing
  function onExitDraw() {
    setIsDrawing(false);
    isPanningRef.current = false;
    // Optionally emit "finalize" or rely on element:add/update already emitted
    // For undo/redo: you can push a patch into a history stack here
  }

  // Remote apply helpers (if you wire socket)
  // function applyRemoteAdd(el) {
  //   setElements((prev) => {
  //     // avoid dup if already exists
  //     if (prev.find((p) => p._id === el._id)) return prev;
  //     return [...prev, el];
  //   });
  // }
  // function applyRemoteUpdate(el) {
  //   setElements((prev) => prev.map((p) => (p._id === el._id ? { ...p, ...el } : p)));
  // }

  // Basic API for external components via context (selection / editing later)
  const contextValue = {
    draw,
    setDraw,
    elements,
    setElements,
    startDrawing: onInitiateDraw,
    stopDrawing: onExitDraw,
    pan,
    setPan,
  };

  return (
    <DrawContext.Provider value={contextValue}>
      <main>
        <DrawOptions />
        <canvas
          ref={canvasRef}
          onMouseDown={onInitiateDraw}
          onMouseMove={whileDrawing}
          onMouseUp={onExitDraw}
          style={{
            display: 'block',
            cursor: draw.current === 'pan' ? 'grab' : 'crosshair',
          }}
        />
        <DrawCustomizations />
      </main>
    </DrawContext.Provider>
  );
}

export { DrawContext };
