/* Left-rail Contact me menu: Email + X */
(function () {
  const btn = document.getElementById("rail-contact-btn");
  const menu = document.getElementById("rail-contact-menu");
  if (!btn || !menu) return;

  function setOpen(open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    menu.hidden = !open;
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(menu.hidden);
  });

  document.addEventListener("click", function (e) {
    if (!menu.hidden && !btn.contains(e.target) && !menu.contains(e.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();
