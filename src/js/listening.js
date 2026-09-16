/* Listening — Lanyard presence for Frank's Spotify (no Spotify secrets) */
(function () {
  const DISCORD_ID = "819941445712478250";
  const ENDPOINT = "https://api.lanyard.rest/v1/users/" + DISCORD_ID;
  const POLL_MS = 18000;

  const card = document.getElementById("aside-listening");
  if (!card) return;

  const liveEl = document.getElementById("listening-live");
  const nowEl = document.getElementById("listening-now");
  const artEl = document.getElementById("listening-art");
  const trackEl = document.getElementById("listening-track");
  const artistEl = document.getElementById("listening-artist");
  const meterEl = document.getElementById("listening-meter");
  const barEl = document.getElementById("listening-bar");
  const idleEl = document.getElementById("listening-idle");

  let progressTimer = 0;
  let trackStart = 0;
  let trackEnd = 0;
  let lastTrackId = "";

  function setPlaying(on) {
    card.classList.toggle("is-playing", on);
    card.classList.toggle("is-idle", !on);
    if (liveEl) liveEl.hidden = !on;
    if (nowEl) nowEl.hidden = !on;
    if (idleEl) idleEl.hidden = on;
  }

  function stopProgress() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = 0;
    }
    trackStart = 0;
    trackEnd = 0;
    if (meterEl) meterEl.hidden = true;
    if (barEl) barEl.style.width = "0%";
  }

  function tickProgress() {
    if (!barEl || !trackStart || !trackEnd || trackEnd <= trackStart) return;
    const p = Math.min(1, Math.max(0, (Date.now() - trackStart) / (trackEnd - trackStart)));
    barEl.style.width = (p * 100).toFixed(2) + "%";
  }

  function startProgress(start, end) {
    trackStart = start;
    trackEnd = end;
    const ok = start > 0 && end > start;
    if (meterEl) meterEl.hidden = !ok;
    if (!ok) {
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = 0;
      }
      return;
    }
    tickProgress();
    if (!progressTimer) {
      progressTimer = setInterval(tickProgress, 500);
    }
  }

  function showIdle() {
    lastTrackId = "";
    card.hidden = false;
    setPlaying(false);
    stopProgress();
    if (nowEl) {
      nowEl.removeAttribute("href");
      nowEl.classList.add("is-static");
    }
    if (artEl) {
      artEl.removeAttribute("src");
      artEl.alt = "";
    }
    if (trackEl) trackEl.textContent = "";
    if (artistEl) artistEl.textContent = "";
    card.removeAttribute("aria-label");
  }

  function showError() {
    lastTrackId = "";
    stopProgress();
    card.hidden = true;
  }

  function renderSpotify(spotify) {
    if (!spotify || !spotify.song) {
      showIdle();
      return;
    }

    card.hidden = false;
    setPlaying(true);

    const trackId = spotify.track_id || "";
    const song = spotify.song || "";
    const artist = spotify.artist || "";
    const album = spotify.album || "";

    if (trackEl) trackEl.textContent = song;
    if (artistEl) artistEl.textContent = artist;

    if (nowEl) {
      if (trackId) {
        nowEl.href = "https://open.spotify.com/track/" + encodeURIComponent(trackId);
        nowEl.classList.remove("is-static");
      } else {
        nowEl.removeAttribute("href");
        nowEl.classList.add("is-static");
      }
    }

    if (artEl && spotify.album_art_url && lastTrackId !== trackId) {
      artEl.src = spotify.album_art_url;
      artEl.alt = album ? album : "";
    } else if (artEl && !spotify.album_art_url) {
      artEl.removeAttribute("src");
      artEl.alt = "";
    }

    lastTrackId = trackId;

    const start = spotify.timestamps && spotify.timestamps.start;
    const end = spotify.timestamps && spotify.timestamps.end;
    startProgress(start || 0, end || 0);

    const label = [song, artist].filter(Boolean).join(" — ");
    if (label) card.setAttribute("aria-label", "Listening to " + label);
  }

  function applyPayload(json) {
    if (!json || json.success === false) {
      const code = json && json.error && json.error.code;
      if (code === "user_not_monitored") {
        showError();
        return;
      }
      showIdle();
      return;
    }
    const data = json.data || {};
    if (data.listening_to_spotify && data.spotify) {
      renderSpotify(data.spotify);
    } else {
      showIdle();
    }
  }

  function poll() {
    if (document.hidden) return;
    fetch(ENDPOINT, { cache: "no-store" })
      .then(function (r) {
        return r.json().then(function (json) {
          return { ok: r.ok, json: json };
        });
      })
      .then(function (res) {
        if (!res.ok && !(res.json && res.json.error)) {
          throw new Error("bad status");
        }
        applyPayload(res.json);
      })
      .catch(function () {
        showError();
      });
  }

  showIdle();
  poll();
  setInterval(poll, POLL_MS);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) poll();
  });
})();
