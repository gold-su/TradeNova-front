import type { ComponentType, MouseEvent, PointerEvent, SVGProps } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Eraser, Minus, MousePointer2, Percent, Rows3, SquareDashedMousePointer, Trash2, TrendingUp, Type } from "lucide-react";
import type { DrawingTool } from "./drawingTypes";

type Props = {
  tool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  onDelete: () => void;
  canDelete: boolean;
  onClear: () => void;
  canClear: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

type ToolIcon = ComponentType<SVGProps<SVGSVGElement>>;

function ExtendedLineIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 18 21 6" /><path d="m3 18 3-.2-.2-3" /><path d="m21 6-3 .2.2 3" /></svg>;
}

const tools: Array<{ tool: DrawingTool; label: string; Icon: ToolIcon; rotate?: boolean }> = [
  { tool: "POINTER", label: "포인터", Icon: MousePointer2 },
  { tool: "TREND_LINE", label: "추세선", Icon: TrendingUp },
  { tool: "RAY", label: "레이", Icon: ArrowUpRight },
  { tool: "EXTENDED_LINE", label: "연장선", Icon: ExtendedLineIcon },
  { tool: "HORIZONTAL_LINE", label: "수평선", Icon: Minus },
  { tool: "VERTICAL_LINE", label: "수직선", Icon: Minus, rotate: true },
  { tool: "ZONE", label: "영역", Icon: SquareDashedMousePointer },
  { tool: "PARALLEL_CHANNEL", label: "평행 채널", Icon: Rows3 },
  { tool: "FIBONACCI_RETRACEMENT", label: "피보나치 되돌림", Icon: Percent },
  { tool: "TEXT", label: "텍스트", Icon: Type },
];

const railButton = "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded outline-none transition focus-visible:ring-1 focus-visible:ring-primary";

export function DrawingToolbar({ tool, onSelectTool, onDelete, canDelete, onClear, canClear, collapsed, onToggleCollapsed }: Props) {
  const stopPointer = (event: PointerEvent<HTMLDivElement>) => event.stopPropagation();
  const stopClick = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();
  const toolClass = (active: boolean) => `${railButton} ${active ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(94,234,212,0.22)]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`;

  return (
    <div role="toolbar" aria-label="차트 그리기 도구" onPointerDown={stopPointer} onClick={stopClick} className="absolute left-1.5 top-1.5 z-30 flex max-h-[calc(100%-12px)] w-9 flex-col items-center gap-px overflow-hidden rounded-lg border border-border/50 bg-background/90 p-0.5 shadow-lg backdrop-blur-sm">
      <button type="button" title={collapsed ? "도구 펼치기" : "도구 접기"} aria-label={collapsed ? "도구 펼치기" : "도구 접기"} aria-expanded={!collapsed} onClick={onToggleCollapsed} className={`${railButton} text-muted-foreground hover:bg-muted/80 hover:text-foreground`}>
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
      {!collapsed && <>
        {tools.map(({ tool: itemTool, label, Icon, rotate }) => (
          <button key={itemTool} type="button" title={label} aria-label={label} aria-pressed={tool === itemTool} onClick={() => onSelectTool(itemTool)} className={toolClass(tool === itemTool)}>
            <Icon className={`h-3.5 w-3.5 ${rotate ? "rotate-90" : ""}`} />
          </button>
        ))}
        <span className="my-px h-px w-5 shrink-0 bg-border/60" aria-hidden="true" />
        <button type="button" title="선택 삭제" aria-label="선택한 드로잉 삭제" disabled={!canDelete} onClick={onDelete} className={`${railButton} text-muted-foreground hover:bg-red-500/15 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30`}><Trash2 className="h-3.5 w-3.5" /></button>
        <button type="button" title="전체 초기화" aria-label="현재 차트 드로잉 전체 초기화" disabled={!canClear} onClick={onClear} className={`${railButton} text-muted-foreground hover:bg-red-500/15 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30`}><Eraser className="h-3.5 w-3.5" /></button>
      </>}
    </div>
  );
}
