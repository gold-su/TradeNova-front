import { Eraser, Minus, MousePointer2, Percent, Rows3, SquareDashedMousePointer, Trash2, TrendingUp, Type } from "lucide-react";
import type { DrawingTool } from "./drawingTypes";

type Props = {
  tool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onDelete: () => void;
  canDelete: boolean;
  onClear: () => void;
  canClear: boolean;
};

const tools: Array<{ tool: DrawingTool; label: string; Icon: typeof MousePointer2 }> = [
  { tool: "POINTER", label: "선택", Icon: MousePointer2 },
  { tool: "TREND_LINE", label: "추세선", Icon: TrendingUp },
  { tool: "HORIZONTAL_LINE", label: "수평선", Icon: Minus },
  { tool: "VERTICAL_LINE", label: "수직선", Icon: Minus },
  { tool: "RAY", label: "레이", Icon: TrendingUp },
  { tool: "ZONE", label: "영역", Icon: SquareDashedMousePointer },
  { tool: "FIBONACCI_RETRACEMENT", label: "피보나치", Icon: Percent },
  { tool: "PARALLEL_CHANNEL", label: "평행 채널", Icon: Rows3 },
  { tool: "TEXT", label: "텍스트", Icon: Type },
];

export function DrawingToolbar({ tool, onSelectTool, onDelete, canDelete, onClear, canClear }: Props) {
  return (
    <div role="toolbar" aria-label="차트 그리기 도구" className="flex flex-wrap items-center gap-1 rounded-lg border border-border/45 bg-background/55 p-1">
      {tools.map(({ tool: itemTool, label, Icon }) => (
        <button key={itemTool} type="button" title={label} aria-label={label} aria-pressed={tool === itemTool} onClick={() => onSelectTool(itemTool)}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${tool === itemTool ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
          <Icon className={`h-3.5 w-3.5 ${itemTool === "VERTICAL_LINE" ? "rotate-90" : ""}`} />
        </button>
      ))}
      <span className="mx-0.5 h-4 w-px bg-border/60" aria-hidden="true" />
      <button type="button" title="선택한 그리기 삭제" aria-label="선택한 그리기 삭제" disabled={!canDelete} onClick={onDelete} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-500/15 hover:text-red-300 disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
      <button type="button" title="현재 차트 그리기 전체 초기화" aria-label="현재 차트 그리기 전체 초기화" disabled={!canClear} onClick={onClear} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-500/15 hover:text-red-300 disabled:opacity-30"><Eraser className="h-3.5 w-3.5" /></button>
    </div>
  );
}
