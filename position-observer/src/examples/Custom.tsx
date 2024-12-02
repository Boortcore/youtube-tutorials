import { useLayoutEffect, useRef, useState } from "react";
import { DynamicWidthItem } from "../components/DynamicWidthItem";
import { ExampleWrapper } from "../components/ExampleWrapper";
import { Tooltip } from "../components/Tooltip";
import { observeMove } from "../utils/observeMove";

export function Custom() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!itemRef.current) {
      return;
    }

    return observeMove(itemRef.current, (rect) => {
      setPosition({ x: rect.left, y: rect.bottom });
    });
  }, []);

  return (
    <ExampleWrapper>
      <DynamicWidthItem text="dynamic neighbor" color="red" />
      <DynamicWidthItem nodeRef={itemRef} text="anchor element" color="green" />

      <Tooltip position={position} />
    </ExampleWrapper>
  );
}
