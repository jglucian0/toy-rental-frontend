import { useFloating, offset, flip, shift, size, autoUpdate } from "@floating-ui/react";

export function useFloatingDropdown(minWidth = 120) {
  const floating = useFloating({
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ["top-start"] }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements, availableHeight }) {
          const w = Math.max(rects.reference.width, minWidth);
          Object.assign(elements.floating.style, {
            width: `${w}px`,
            maxHeight: `${Math.max(availableHeight, 180)}px`,
          });
        },
      }),
    ],
  });

  return floating; // {refs, floatingStyles, update}
}