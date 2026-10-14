export const SCENARIO_TEXTAREA_MIN_HEIGHT = 38;
export const SCENARIO_TEXTAREA_MAX_HEIGHT = 160;

type ResizableTextarea = Pick<HTMLTextAreaElement, "scrollHeight" | "style">;

export function resizeScenarioTextarea(element: ResizableTextarea) {
  element.style.height = "auto";
  const contentHeight = element.scrollHeight;
  const height = Math.min(
    Math.max(contentHeight, SCENARIO_TEXTAREA_MIN_HEIGHT),
    SCENARIO_TEXTAREA_MAX_HEIGHT,
  );

  element.style.height = `${height}px`;
  element.style.overflowY =
    contentHeight > SCENARIO_TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
}
