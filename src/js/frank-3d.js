/* Interactive 3D “Frank” — mouse / touch / keyboard tilt */
(function () {
  const el = document.getElementById("frank-3d");
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxTilt = reduced ? 6 : 22; // degrees
  let raf = 0;
  let targetX = 12;
  let targetY = -18;
  let curX = 12;
  let curY = -18;
  let hovering = false;

  function setVars(rx, ry, hot) {
    el.style.setProperty("--rx", rx.toFixed(2) + "deg");
    el.style.setProperty("--ry", ry.toFixed(2) + "deg");
    el.classList.toggle("is-hot", !!hot);
  }

  function tick() {
    raf = 0;
    // ease toward target
    curX += (targetX - curX) * 0.18;
    curY += (targetY - curY) * 0.18;
    setVars(curX, curY, hovering);
    if (
      Math.abs(targetX - curX) > 0.05 ||
      Math.abs(targetY - curY) > 0.05
    ) {
      raf = requestAnimationFrame(tick);
    }
  }

  function requestTick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function fromPointer(clientX, clientY) {
    const rect = el.getBoundingClientRect();
    const px = (clientX - rect.left) / Math.max(1, rect.width); // 0..1
    const py = (clientY - rect.top) / Math.max(1, rect.height);
    // map to tilt: left/right → rotateY, up/down → rotateX
    targetY = (px - 0.5) * 2 * maxTilt;
    targetX = (0.5 - py) * 2 * maxTilt;
    hovering = true;
    requestTick();
  }

  function reset() {
    hovering = false;
    targetX = 12;
    targetY = -18;
    requestTick();
  }

  el.addEventListener("pointerenter", function (e) {
    el.setPointerCapture?.(e.pointerId);
    fromPointer(e.clientX, e.clientY);
  });
  el.addEventListener("pointermove", function (e) {
    fromPointer(e.clientX, e.clientY);
  });
  el.addEventListener("pointerleave", reset);
  el.addEventListener("pointerup", reset);

  // keyboard: arrow keys nudge the mark
  el.addEventListener("keydown", function (e) {
    const step = 4;
    if (e.key === "ArrowLeft") {
      targetY = Math.max(-maxTilt, targetY - step);
      hovering = true;
      e.preventDefault();
      requestTick();
    } else if (e.key === "ArrowRight") {
      targetY = Math.min(maxTilt, targetY + step);
      hovering = true;
      e.preventDefault();
      requestTick();
    } else if (e.key === "ArrowUp") {
      targetX = Math.min(maxTilt, targetX + step);
      hovering = true;
      e.preventDefault();
      requestTick();
    } else if (e.key === "ArrowDown") {
      targetX = Math.max(-maxTilt, targetX - step);
      hovering = true;
      e.preventDefault();
      requestTick();
    } else if (e.key === "Escape" || e.key === "Home") {
      reset();
    }
  });
  el.addEventListener("blur", reset);

  // idle float when not interacting
  if (!reduced) {
    let t0 = performance.now();
    function idle(now) {
      if (!hovering) {
        const t = (now - t0) / 1000;
        targetX = 10 + Math.sin(t * 0.9) * 5;
        targetY = -14 + Math.cos(t * 0.7) * 8;
        requestTick();
      }
      requestAnimationFrame(idle);
    }
    requestAnimationFrame(idle);
  } else {
    setVars(8, -10, false);
  }
})();
