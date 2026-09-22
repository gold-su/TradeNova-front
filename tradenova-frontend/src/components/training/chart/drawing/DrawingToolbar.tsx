import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { ChevronsUp, Eraser, Minus, MousePointer2, Percent, Rows3, SquareDashedMousePointer, Trash2, TrendingUp, Type } from "lucide-react";
import { drawingGroupForTool, reduceDrawingFlyout, type DrawingFlyout } from "./drawingToolbarState";
import type { DrawingTool } from "./drawingTypes";

type Props = {
  tool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onDelete: () => void;
  canDelete: boolean;
  onClear: () => void;
  canClear: boolean;
};

const flyoutTools = {
  LINE: [
    { tool: "TREND_LINE" as const, label: "Trend Line", Icon: TrendingUp },
    { tool: "RAY" as const, label: "Ray", Icon: ChevronsUp },
  ],
  AXIS: [
    { tool: "HORIZONTAL_LINE" as const, label: "Horizontal Line", Icon: Minus },
    { tool: "VERTICAL_LINE" as const, label: "Vertical Line", Icon: Minus },
  ],
};

const railButton = "relative inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition focus-visible:ring-1 focus-visible:ring-primary";

export function DrawingToolbar({ tool, onSelectTool, onDelete, canDelete, onClear, canClear }: Props) {
  const [flyout, setFlyout] = useState<DrawingFlyout>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeGroup = drawingGroupForTool(tool);

  useEffect(() => {
    if (!flyout) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setFlyout((state) => reduceDrawingFlyout(state, { type: "OUTSIDE" }));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setFlyout((state) => reduceDrawingFlyout(state, { type: "ESCAPE" }));
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [flyout]);

  const stopPointer = (event: PointerEvent<HTMLDivElement>) => event.stopPropagation();
  const stopClick = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();
  const select = (nextTool: DrawingTool) => {
    onSelectTool(nextTool);
    setFlyout((state) => reduceDrawingFlyout(state, { type: "SELECT" }));
  };
  const groupButtonClass = (active: boolean) => `${railButton} ${active ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(94,234,212,0.22)]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`;

  return (
    <div ref={rootRef} role="toolbar" aria-label="차트 그리기 도구" onPointerDown={stopPointer} onClick={stopClick} className="absolute left-1.5 top-1.5 z-30 flex w-10 flex-col items-center gap-0.5 rounded-lg border border-border/50 bg-background/90 p-1 shadow-lg backdrop-blur-sm">
      <button type="button" title="Pointer" aria-label="Pointer" aria-pressed={tool === "POINTER"} onClick={() => select("POINTER")} className={groupButtonClass(tool === "POINTER")}><MousePointer2 className="h-4 w-4" /></button>
      <button type="button" title="Line" aria-label="Line" aria-expanded={flyout === "LINE"} aria-pressed={activeGroup === "LINE"} onClick={() => setFlyout((state) => reduceDrawingFlyout(state, { type: "TOGGLE", flyout: "LINE" }))} className={groupButtonClass(activeGroup === "LINE")}><TrendingUp className="h-4 w-4" /><span className="absolute bottom-1 right-1 h-0 w-0 border-x-[2px] border-t-[3px] border-x-transparent border-t-current opacity-70" /></button>
      <button type="button" title="Axis" aria-label="Axis" aria-expanded={flyout === "AXIS"} aria-pressed={activeGroup === "AXIS"} onClick={() => setFlyout((state) => reduceDrawingFlyout(state, { type: "TOGGLE", flyout: "AXIS" }))} className={groupButtonClass(activeGroup === "AXIS")}><Minus className="h-4 w-4" /><span className="absolute bottom-1 right-1 h-0 w-0 border-x-[2px] border-t-[3px] border-x-transparent border-t-current opacity-70" /></button>
      <button type="button" title="Zone" aria-label="Zone" aria-pressed={tool === "ZONE"} onClick={() => select("ZONE")} className={groupButtonClass(tool === "ZONE")}><SquareDashedMousePointer className="h-4 w-4" /></button>
      <button type="button" title="Parallel Channel" aria-label="Parallel Channel" aria-pressed={tool === "PARALLEL_CHANNEL"} onClick={() => select("PARALLEL_CHANNEL")} className={groupButtonClass(tool === "PARALLEL_CHANNEL")}><Rows3 className="h-4 w-4" /></button>
      <button type="button" title="Fibonacci Retracement" aria-label="Fibonacci Retracement" aria-pressed={tool === "FIBONACCI_RETRACEMENT"} onClick={() => select("FIBONACCI_RETRACEMENT")} className={groupButtonClass(tool === "FIBONACCI_RETRACEMENT")}><Percent className="h-4 w-4" /></button>
      <button type="button" title="Text" aria-label="Text" aria-pressed={tool === "TEXT"} onClick={() => select("TEXT")} className={groupButtonClass(tool === "TEXT")}><Type className="h-4 w-4" /></button>
      <span className="my-0.5 h-px w-6 bg-border/60" aria-hidden="true" />
      <button type="button" title="Delete" aria-label="Delete selected drawing" disabled={!canDelete} onClick={onDelete} className={`${railButton} text-muted-foreground hover:bg-red-500/15 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30`}><Trash2 className="h-4 w-4" /></button>
      <button type="button" title="Clear" aria-label="Clear current chart drawings" disabled={!canClear} onClick={onClear} className={`${railButton} text-muted-foreground hover:bg-red-500/15 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30`}><Eraser className="h-4 w-4" /></button>

      {flyout && (
        <div role="menu" aria-label={`${flyout === "LINE" ? "Line" : "Axis"} tools`} className="absolute left-[calc(100%+6px)] top-0 min-w-40 rounded-lg border border-border/55 bg-background/95 p-1.5 shadow-xl backdrop-blur-sm">
          {flyoutTools[flyout].map(({ tool: itemTool, label, Icon }) => (
            <button key={itemTool} type="button" role="menuitemradio" aria-checked={tool === itemTool} onClick={() => select(itemTool)} className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs outline-none transition focus-visible:ring-1 focus-visible:ring-primary ${tool === itemTool ? "bg-primary/15 font-medium text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`}>
              <Icon className={`h-3.5 w-3.5 ${itemTool === "VERTICAL_LINE" ? "rotate-90" : ""}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
