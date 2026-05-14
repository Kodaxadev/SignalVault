export type OverlayVisibility = "visible" | "hidden";
export type OverlayToggleTarget = "show" | "hide";

export function getOverlayToggleTarget(
  visibility: OverlayVisibility,
): OverlayToggleTarget {
  return visibility === "visible" ? "hide" : "show";
}
