/* Differential geometry / topology symbol rain */
(function () {
  const host = document.getElementById("pb-rain");
  if (!host) return;

  const glyphs =
    "∑∫∂∇πλθφψ∞√±≈≠∈∀∃⊂∪∩→⇒ℝℂℕΔαβγωμσΩε" +
    "∂∧⋆⊗⊕⊖" +
    "χπρ" +
    "MⁿTₚ" +
    "g_{ij}" +
    "Γ" +
    "R" +
    "Ω" +
    "0123456789";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cols = reduced ? 8 : Math.min(20, Math.max(12, Math.floor(window.innerWidth / 75)));

  function makeCol(i) {
    const col = document.createElement("div");
    col.className = "pb-rain-col";
    const len = 9 + ((i * 5) % 8);
    let s = "";
    for (let r = 0; r < len; r++) {
      s += glyphs[(i * 17 + r * 11) % glyphs.length] + "\n";
    }
    col.textContent = s;
    col.style.animationDuration = 7 + (i % 6) * 0.9 + "s";
    col.style.animationDelay = -(i * 0.41) + "s";
    return col;
  }

  const frag = document.createDocumentFragment();
  for (let i = 0; i < cols; i++) frag.appendChild(makeCol(i));
  host.appendChild(frag);
})();
