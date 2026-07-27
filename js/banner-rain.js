/* Hex/matrix rain columns for the profile banner */
(function () {
  const host = document.getElementById("pb-rain");
  if (!host) return;

  const glyphs = "0123456789ABCDEFabcdefRTGI_BVH#*$%/\\|";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cols = reduced ? 8 : Math.min(22, Math.max(12, Math.floor(window.innerWidth / 70)));

  function makeCol(i) {
    const col = document.createElement("div");
    col.className = "pb-rain-col";
    const len = 10 + ((i * 7) % 9);
    let s = "";
    for (let r = 0; r < len; r++) {
      s += glyphs[(i * 13 + r * 5) % glyphs.length] + "\n";
    }
    col.textContent = s;
    col.style.animationDuration = 6 + (i % 7) * 0.85 + "s";
    col.style.animationDelay = -(i * 0.37) + "s";
    return col;
  }

  const frag = document.createDocumentFragment();
  for (let i = 0; i < cols; i++) frag.appendChild(makeCol(i));
  host.appendChild(frag);
})();
