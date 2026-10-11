/* Lightweight self-hosted video player: chapters, speed, captions, keyboard, PiP, fullscreen.
   Progressive enhancement over a native <video controls>. No dependencies, no network calls. */
(function () {
  'use strict';
  var SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
  var ICON = {
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
    vol: '<path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9H4zm15.6 3 2.1-2.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4 2.1 2.1-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4z"/>',
    cc: '<path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 6H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z"/>',
    pip: '<path d="M19 11h-8v6h8v-6zm4 8V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2zm-2 0H3V5h18v14z"/>',
    fs: '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>',
    fsx: '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>'
  };
  function svg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>'; }
  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    var m = Math.floor(t / 60), s = t % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function btn(cls, label, icon) {
    var b = el('button', 'qp-btn ' + cls, icon ? svg(icon) : '');
    b.type = 'button'; b.setAttribute('aria-label', label); b.title = label; return b;
  }

  function init(video) {
    var wrap = video.closest('.watch-player');
    if (!wrap || wrap.classList.contains('qp')) return;
    wrap.classList.add('qp');
    video.controls = false;
    video.removeAttribute('controls');
    wrap.tabIndex = -1;

    var big = btn('qp-big', 'Play', 'play');
    var bar = el('div', 'qp-bar');
    var prog = el('div', 'qp-progress');
    prog.setAttribute('role', 'slider'); prog.setAttribute('aria-label', 'Seek'); prog.tabIndex = 0;
    var buf = el('div', 'qp-buf'), fill = el('div', 'qp-fill'), knob = el('div', 'qp-knob');
    var ticks = el('div', 'qp-ticks'), tip = el('div', 'qp-tip');
    prog.append(buf, fill, ticks, knob, tip);
    var row = el('div', 'qp-row');
    var bPlay = btn('qp-play', 'Play (k)', 'play');
    var bMute = btn('qp-mute', 'Mute (m)', 'vol');
    var vol = el('input', 'qp-vol'); vol.type = 'range'; vol.min = 0; vol.max = 1; vol.step = 0.05; vol.value = video.volume; vol.setAttribute('aria-label', 'Volume');
    var time = el('span', 'qp-time', '0:00 / 0:00');
    var chap = el('span', 'qp-chap');
    var spacer = el('span', 'qp-spacer');
    var bSpeed = el('button', 'qp-btn qp-speed', '1×'); bSpeed.type = 'button'; bSpeed.setAttribute('aria-label', 'Playback speed'); bSpeed.title = 'Speed (< / >)';
    var bCC = btn('qp-cc', 'Captions (c)', 'cc');
    var bPip = btn('qp-pip', 'Picture-in-picture (p)', 'pip');
    var bFs = btn('qp-fs', 'Fullscreen (f)', 'fs');
    row.append(bPlay, bMute, vol, time, chap, spacer, bSpeed, bCC, bPip, bFs);
    bar.append(prog, row);
    var toast = el('div', 'qp-toast');
    var capBox = el('div', 'qp-captions'); capBox.setAttribute('aria-live', 'off');
    wrap.append(capBox, big, bar, toast);
    if (!(document.pictureInPictureEnabled && video.requestPictureInPicture)) bPip.hidden = true;

    // tracks
    var capTrack = null, chapTrack = null, chapters = [];
    for (var i = 0; i < video.textTracks.length; i++) {
      var tt = video.textTracks[i];
      if (tt.kind === 'captions' || tt.kind === 'subtitles') capTrack = capTrack || tt;
      if (tt.kind === 'chapters') chapTrack = tt;
    }
    var capOn = false;
    try { capOn = localStorage.getItem('qp-cc') === '1'; } catch (e) {}
    function setCC(on) {
      capOn = on;
      if (capTrack) capTrack.mode = 'hidden'; // rendered in our own overlay so it never sits under the controls
      renderCues();
      bCC.classList.toggle('is-on', on); bCC.setAttribute('aria-pressed', on);
      try { localStorage.setItem('qp-cc', on ? '1' : '0'); } catch (e) {}
    }
    function renderCues() {
      capBox.innerHTML = '';
      if (!capOn || !capTrack || !capTrack.activeCues) return;
      Array.prototype.forEach.call(capTrack.activeCues, function (c) {
        var line = el('span'); line.textContent = c.text.replace(/<[^>]+>/g, ''); capBox.appendChild(line);
      });
    }
    if (capTrack) { capTrack.addEventListener('cuechange', renderCues); setCC(capOn); } else bCC.hidden = true;

    var list = document.querySelector('.qp-chapters');
    function buildChapters() {
      if (!chapTrack || !chapTrack.cues || !chapTrack.cues.length || !video.duration) return false;
      chapters = Array.prototype.map.call(chapTrack.cues, function (c) { return { start: c.startTime, end: c.endTime, title: c.text }; });
      ticks.innerHTML = '';
      chapters.forEach(function (c, i) { if (i) { var t = el('span'); t.style.left = (c.start / video.duration * 100) + '%'; ticks.appendChild(t); } });
      if (list) {
        var ol = list.querySelector('ol'); ol.innerHTML = '';
        chapters.forEach(function (c, i) {
          var li = el('li'), a = el('button', 'qp-chapter');
          a.type = 'button';
          a.innerHTML = '<span class="qp-ct">' + fmt(c.start) + '</span><span class="qp-cn"></span>';
          a.querySelector('.qp-cn').textContent = c.title;
          a.addEventListener('click', function () { video.currentTime = c.start + 0.01; video.play(); wrap.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
          li.appendChild(a); ol.appendChild(li);
        });
        list.hidden = false;
      }
      update();
      return true;
    }
    if (chapTrack) {
      chapTrack.mode = 'hidden';
      var tries = 0;
      (function poll() { if (!buildChapters() && tries++ < 40) setTimeout(poll, 150); })();
      var trEl = video.querySelector('track[kind="chapters"]');
      if (trEl) trEl.addEventListener('load', buildChapters);
    }
    video.addEventListener('loadedmetadata', buildChapters);
    function chapterAt(t) { for (var i = chapters.length - 1; i >= 0; i--) if (t >= chapters[i].start) return i; return -1; }

    // state
    var lastChap = -2;
    function update() {
      var d = video.duration || 0, t = video.currentTime;
      var p = d ? t / d * 100 : 0;
      fill.style.width = p + '%'; knob.style.left = p + '%';
      prog.setAttribute('aria-valuenow', Math.round(p)); prog.setAttribute('aria-valuetext', fmt(t));
      time.textContent = fmt(t) + ' / ' + fmt(d);
      if (video.buffered.length && d) buf.style.width = (video.buffered.end(video.buffered.length - 1) / d * 100) + '%';
      var ci = chapterAt(t);
      if (ci !== lastChap) {
        lastChap = ci;
        chap.textContent = ci >= 0 ? '· ' + chapters[ci].title : '';
        if (list) list.querySelectorAll('li').forEach(function (li, i) { li.classList.toggle('is-current', i === ci); });
      }
    }
    function syncPlay() {
      var paused = video.paused;
      bPlay.innerHTML = svg(paused ? 'play' : 'pause');
      bPlay.setAttribute('aria-label', paused ? 'Play (k)' : 'Pause (k)');
      wrap.classList.toggle('is-paused', paused);
      wrap.classList.toggle('is-started', wrap.classList.contains('is-started') || !paused);
    }
    function syncVol() {
      var m = video.muted || video.volume === 0;
      bMute.innerHTML = svg(m ? 'mute' : 'vol');
      vol.value = video.muted ? 0 : video.volume;
    }
    function toggle() { if (video.paused) video.play(); else video.pause(); }
    var toastT;
    function say(msg) { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 700); }
    function setSpeed(r) { video.playbackRate = r; bSpeed.textContent = r + '×'; say(r + '×'); }
    function stepSpeed(dir) { var i = SPEEDS.indexOf(video.playbackRate); if (i < 0) i = 1; setSpeed(SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, i + dir))]); }

    // speed menu
    var menu = el('div', 'qp-menu'); menu.setAttribute('role', 'menu'); menu.hidden = true;
    SPEEDS.forEach(function (r) {
      var o = el('button', 'qp-menu-item', r === 1 ? 'Normal' : r + '×'); o.type = 'button'; o.setAttribute('role', 'menuitemradio');
      o.addEventListener('click', function (e) { e.stopPropagation(); setSpeed(r); menu.hidden = true; });
      menu.appendChild(o);
    });
    wrap.appendChild(menu);
    bSpeed.addEventListener('click', function (e) {
      e.stopPropagation(); menu.hidden = !menu.hidden;
      menu.querySelectorAll('.qp-menu-item').forEach(function (o, i) { o.setAttribute('aria-checked', SPEEDS[i] === video.playbackRate); });
    });
    document.addEventListener('click', function () { menu.hidden = true; });

    // seek
    function seekFrac(e) { var r = prog.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); }
    var dragging = false;
    prog.addEventListener('pointerdown', function (e) { dragging = true; prog.setPointerCapture(e.pointerId); video.currentTime = seekFrac(e) * video.duration; wrap.classList.add('is-seeking'); });
    prog.addEventListener('pointermove', function (e) {
      var f = seekFrac(e), t = f * (video.duration || 0), ci = chapterAt(t);
      tip.textContent = (ci >= 0 ? chapters[ci].title + ' · ' : '') + fmt(t);
      tip.style.left = (f * 100) + '%';
      if (dragging) video.currentTime = t;
    });
    prog.addEventListener('pointerup', function () { dragging = false; wrap.classList.remove('is-seeking'); });
    prog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); video.currentTime += e.key === 'ArrowLeft' ? -5 : 5; }
    });

    // buttons
    big.addEventListener('click', toggle);
    bPlay.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    video.addEventListener('dblclick', fullscreen);
    bMute.addEventListener('click', function () { video.muted = !video.muted; });
    vol.addEventListener('input', function () { video.volume = +vol.value; video.muted = +vol.value === 0; });
    bCC.addEventListener('click', function () { setCC(!capOn); });
    bPip.addEventListener('click', pip);
    bFs.addEventListener('click', fullscreen);
    function pip() {
      if (document.pictureInPictureElement) document.exitPictureInPicture();
      else if (video.requestPictureInPicture) video.requestPictureInPicture().catch(function () {});
    }
    function fullscreen() {
      if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else if (wrap.requestFullscreen) wrap.requestFullscreen();
      else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iOS Safari
    }
    function onFs() {
      var on = (document.fullscreenElement || document.webkitFullscreenElement) === wrap;
      wrap.classList.toggle('is-fullscreen', on); bFs.innerHTML = svg(on ? 'fsx' : 'fs');
    }
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);

    ['play', 'pause', 'ended'].forEach(function (ev) { video.addEventListener(ev, syncPlay); });
    video.addEventListener('timeupdate', update);
    video.addEventListener('progress', update);
    video.addEventListener('durationchange', update);
    video.addEventListener('volumechange', syncVol);
    video.addEventListener('ratechange', function () { bSpeed.textContent = video.playbackRate + '×'; });

    // auto-hide controls
    var idleT;
    function wake() { wrap.classList.add('is-active'); clearTimeout(idleT); idleT = setTimeout(function () { if (!video.paused) wrap.classList.remove('is-active'); }, 2500); }
    wrap.addEventListener('pointermove', wake);
    wrap.addEventListener('touchstart', wake, { passive: true });
    wrap.addEventListener('focusin', wake);

    // keyboard (YouTube-style), active unless typing in a field
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var tg = e.target, tn = tg && tg.tagName;
      if (tn === 'INPUT' && tg !== vol || tn === 'TEXTAREA' || tn === 'SELECT' || (tg && tg.isContentEditable)) return;
      if ((e.key === ' ' || e.key === 'Enter') && tn === 'BUTTON') return;
      var k = e.key, handled = true;
      switch (k) {
        case ' ': case 'k': case 'K': toggle(); say(video.paused ? 'Paused' : 'Play'); break;
        case 'j': case 'J': video.currentTime -= 10; say('−10 s'); break;
        case 'l': case 'L': video.currentTime += 10; say('+10 s'); break;
        case 'ArrowLeft': video.currentTime -= 5; say('−5 s'); break;
        case 'ArrowRight': video.currentTime += 5; say('+5 s'); break;
        case 'ArrowUp': video.volume = Math.min(1, video.volume + 0.1); video.muted = false; say(Math.round(video.volume * 100) + '%'); break;
        case 'ArrowDown': video.volume = Math.max(0, video.volume - 0.1); say(Math.round(video.volume * 100) + '%'); break;
        case 'm': case 'M': video.muted = !video.muted; say(video.muted ? 'Muted' : 'Sound on'); break;
        case 'c': case 'C': if (capTrack) { setCC(!capOn); say(capOn ? 'Captions on' : 'Captions off'); } break;
        case 'f': case 'F': fullscreen(); break;
        case 'p': case 'P': pip(); break;
        case '<': case ',': stepSpeed(-1); break;
        case '>': case '.': stepSpeed(1); break;
        case 'N': case 'n': var ni = chapterAt(video.currentTime) + 1; if (chapters[ni]) { video.currentTime = chapters[ni].start + 0.01; say(chapters[ni].title); } break;
        case 'B': case 'b': var pi = chapterAt(video.currentTime - 2); if (pi >= 0) { video.currentTime = chapters[pi].start + 0.01; say(chapters[pi].title); } break;
        case 'Home': video.currentTime = 0; break;
        case 'End': video.currentTime = video.duration; break;
        default:
          if (/^[0-9]$/.test(k) && video.duration) video.currentTime = video.duration * (+k) / 10; else handled = false;
      }
      if (handled) { e.preventDefault(); wake(); }
    });

    // deep link: #t=90 or ?t=90
    var m = /[#?&]t=(\d+)/.exec(location.hash + location.search);
    if (m) video.addEventListener('loadedmetadata', function () { video.currentTime = +m[1]; }, { once: true });

    syncPlay(); syncVol(); update(); wake();
  }

  function boot() { document.querySelectorAll('.watch-player video').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
