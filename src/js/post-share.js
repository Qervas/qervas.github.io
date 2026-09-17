/* Journal article share menu: X, LinkedIn, copy canonical URL */
(function () {
  const root = document.querySelector(".posts-share");
  if (!root) return;

  const details = root.querySelector(".posts-share-details");
  const copyBtn = root.querySelector("[data-share-copy]");
  const url = root.getAttribute("data-share-url") || location.href;
  const idleLabel = "Copy link";

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  function flashCopied() {
    if (!copyBtn) return;
    copyBtn.textContent = "Copied";
    copyBtn.classList.add("is-copied");
    window.setTimeout(function () {
      copyBtn.textContent = idleLabel;
      copyBtn.classList.remove("is-copied");
    }, 1600);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(url)
        .then(function () {
          flashCopied();
          if (details) details.removeAttribute("open");
        })
        .catch(function () {
          copyBtn.textContent = "Copy failed";
          window.setTimeout(function () {
            copyBtn.textContent = idleLabel;
          }, 1600);
        });
    });
  }

  document.addEventListener("click", function (e) {
    if (!details || !details.open) return;
    if (!root.contains(e.target)) details.removeAttribute("open");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && details && details.open) {
      details.removeAttribute("open");
      const toggle = details.querySelector(".posts-share-toggle");
      if (toggle) toggle.focus();
    }
  });
})();
