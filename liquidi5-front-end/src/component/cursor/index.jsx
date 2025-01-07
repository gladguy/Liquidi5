import gsap from "gsap";
import React, { useEffect, useRef } from "react";
import "../../App.css";

export default function CursorFollower() {
  const cursorRef = useRef(null);
  const isTouchDevice = "ontouchstart" in window;

  useEffect(() => {
    const cursor = cursorRef.current;
    if (isTouchDevice || !cursor) {
      return;
    }

    window.addEventListener("mousemove", (e) => {
      const { target, x, y } = e;
      const isTargetLinkOrBtn =
        target?.closest("a") || target?.closest("button");

      gsap.to(cursor, {
        x: x + 3,
        y: y + 3,
        duration: 0.7,
        ease: "power4",
        opacity: isTargetLinkOrBtn ? 0.6 : 1,
        transform: `scale(${isTargetLinkOrBtn ? 3.5 : 1})`,
      });
    });

    document.addEventListener("mouseleave", () => {
      gsap.to(cursor, {
        duration: 0.7,
        opacity: 0,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="cursor-follower" ref={cursorRef}></div>;
}
