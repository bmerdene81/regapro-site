/*!
 * RegaPro 3D — shared base for service-page hero visuals (three.js r128).
 * Style: "V2 contour glow" — navy #090d16, cyan #38bdf8 glow, elevation ramp.
 *
 * Usage (site hero, same markup as 3d-durslel's .svc-hero-3d):
 *   <figure class="svc-hero-img svc-hero-3d" data-rp3d="geologiin-log">
 *     <img class="svc-hero-3d__poster" src="images/services/geologiin-log.jpg" alt="...">
 *     <div class="svc-hero-3d__stage" aria-hidden="true"></div>
 *   </figure>
 * The canvas goes into .svc-hero-3d__stage (or the element itself); the root gets .is-ready after the
 * first frame (poster fades out) or .is-fallback when WebGL / three.js is unavailable (poster stays).
 * Labels may be {mn, en} objects; they follow <html lang> (MN/EN toggle) live.
 * Transparent mode: add class "svc-hero-3d--clear" to the figure (or pass {transparent:true}) — no navy box,
 * the page background shows through the scene.
 * data-rp3d-pullback="1.12" on the figure moves the camera back (×1.12) to leave room for the soft CSS edge fade.
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 *   <script src="js/regapro-3d-base.js"></script>
 *   <script src="js/visuals/geologiin-log.js"></script>
 * Elements with [data-rp3d] auto-mount on DOMContentLoaded (or call RegaPro3D.mount(el, name)).
 *
 * Handles: container-sized renderer, devicePixelRatio cap, ResizeObserver,
 * IntersectionObserver + tab-visibility pause, prefers-reduced-motion (single still frame),
 * eased mouse tilt, slow auto-orbit / sway, and a deterministic renderAt(t) for capture (?capture).
 */
(function (global) {
  'use strict';

  var BG = 0x090d16;
  var CYAN = 0x38bdf8;
  var STRATA = [0x7a8b74, 0xc4b189, 0x5a6e5c, 0x4a5d72, 0x2c3544];
  var registry = {};
  var instances = [];
  var query = (global.location && global.location.search) || '';
  var CAPTURE = /[?&]capture\b/.test(query);
  var reduceMQ = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var coarse = global.matchMedia ? global.matchMedia('(pointer: coarse)').matches : false;

  /* ---------- deterministic helpers ---------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash2(ix, iy) {
    var n = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function fade(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
  function vnoise(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fade(fx), uy = fade(fy);
    return lerp(lerp(hash2(ix, iy), hash2(ix + 1, iy), ux),
                lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux), uy);
  }
  function fbm(x, y, oct) {
    var v = 0, a = 1, f = 1, s = 0, n = oct || 5;
    for (var i = 0; i < n; i++) { v += a * vnoise(x * f, y * f); s += a; a *= 0.5; f *= 2.05; }
    return v / s;
  }
  /* the V2 terrain height function (scale 1 = V2's 86-unit field) */
  function v2Height(x, z) {
    var n = fbm(x * 0.038 + 4.2, z * 0.038 + 1.7);
    var h = (n - 0.42) * 22;
    h += Math.exp(-((x - 12) * (x - 12) + (z + 6) * (z + 6)) / 520) * 11;
    h += Math.exp(-((x + 18) * (x + 18) + (z - 14) * (z - 14)) / 380) * 8.5;
    h += Math.exp(-((x - 22) * (x - 22) + (z - 18) * (z - 18)) / 260) * 5.5;
    h -= Math.exp(-(x * x) / 1100) * 3.2;
    return h;
  }

  function pageLang() {
    var l = (document.documentElement.getAttribute('lang') || 'mn').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'mn';
  }
  function pick(text) { return text[pageLang()] || text.mn || text.en || ''; }

  function makeKit(THREE, i18nLabels) {
    var glowTex = null;
    function elevColor(t) {
      t = clamp(t, 0, 1);
      var c = new THREE.Color();
      if (t < 0.5) c.setRGB(0.05, 0.22, 0.55).lerp(new THREE.Color(CYAN), t * 2);
      else c.set(CYAN).lerp(new THREE.Color(0xecfeff), (t - 0.5) * 2);
      return c;
    }
    function glowTexture() {
      if (glowTex) return glowTex;
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d');
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.18, 'rgba(255,255,255,0.75)');
      gr.addColorStop(0.45, 'rgba(255,255,255,0.18)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      glowTex = new THREE.CanvasTexture(c);
      return glowTex;
    }
    /* additive soft glow sprite */
    function glow(color, size, opacity) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(), color: color == null ? CYAN : color, transparent: true,
        opacity: opacity == null ? 0.9 : opacity, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      s.scale.setScalar(size || 1);
      return s;
    }
    /* small boxed label like V2 (or plain text with opts.plain) */
    function label(text, opts) {
      opts = opts || {};
      if (text && typeof text === 'object') {
        var spr0 = drawLabel(pick(text), opts, null);
        i18nLabels.push({ spr: spr0, text: text, opts: opts });
        return spr0;
      }
      return drawLabel(text, opts, null);
    }
    function drawLabel(text, opts, spr) {
      var px = opts.px || 18;
      var font = (opts.weight || 700) + ' ' + px + 'px Inter, "Noto Sans", Helvetica, Arial, sans-serif';
      var c = document.createElement('canvas');
      var g = c.getContext('2d');
      g.font = font;
      var tw = Math.ceil(g.measureText(text).width);
      var padX = opts.plain ? 4 : 10;
      var w = tw + padX * 2, h = Math.round(px * 1.45);
      c.width = w * 2; c.height = h * 2;
      g.scale(2, 2); g.font = font;
      if (!opts.plain) {
        var r = 4;
        g.beginPath();
        g.moveTo(r, 0); g.lineTo(w - r, 0); g.quadraticCurveTo(w, 0, w, r);
        g.lineTo(w, h - r); g.quadraticCurveTo(w, h, w - r, h);
        g.lineTo(r, h); g.quadraticCurveTo(0, h, 0, h - r);
        g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0); g.closePath();
        g.fillStyle = 'rgba(9,13,22,0.74)'; g.fill();
        g.strokeStyle = opts.stroke || 'rgba(56,189,248,0.85)'; g.lineWidth = 1; g.stroke();
      }
      g.fillStyle = opts.color || '#e0f6ff';
      g.textBaseline = 'middle';
      g.fillText(text, padX, h / 2 + 1);
      var tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      if (spr) { var old = spr.material.map; spr.material.map = tex; spr.material.needsUpdate = true; if (old) old.dispose(); }
      else spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      var k = opts.scale || 0.07;
      spr.scale.set(w * k, h * k, 1);
      spr.renderOrder = 10;
      return spr;
    }
    function line(points, color, opacity, additive) {
      var g = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(g, new THREE.LineBasicMaterial({
        color: color == null ? CYAN : color, transparent: true, opacity: opacity == null ? 0.9 : opacity,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !additive
      }));
    }
    function edges(geo, color, opacity, angle) {
      return new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle || 1), new THREE.LineBasicMaterial({
        color: color == null ? CYAN : color, transparent: true, opacity: opacity == null ? 0.85 : opacity
      }));
    }
    /* V2 terrain: elevation-coloured point cloud + glowing marching-squares contours */
    function terrain(o) {
      o = o || {};
      var size = o.size || 60, grid = o.grid || 64, levels = o.levels || 14;
      var hf = o.height || function (x, z) { var k = 86 / size; return v2Height(x * k, z * k) / k; };
      var skip = o.skip || function () { return false; };
      var half = size / 2, step = size / grid, W = grid + 1;
      var H = new Float32Array(W * W), minH = 1e9, maxH = -1e9;
      for (var j = 0; j <= grid; j++) for (var i = 0; i <= grid; i++) {
        var hh = hf(-half + i * step, -half + j * step);
        H[j * W + i] = hh; if (hh < minH) minH = hh; if (hh > maxH) maxH = hh;
      }
      var group = new THREE.Group();
      var pPos = [], pCol = [];
      for (j = 0; j <= grid; j++) for (i = 0; i <= grid; i++) {
        var x = -half + i * step, z = -half + j * step;
        if (skip(x, z)) continue;
        var h = H[j * W + i], c = elevColor((h - minH) / (maxH - minH));
        pPos.push(x, h + 0.04, z); pCol.push(c.r, c.g, c.b);
      }
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
      pg.setAttribute('color', new THREE.Float32BufferAttribute(pCol, 3));
      group.add(new THREE.Points(pg, new THREE.PointsMaterial({
        size: o.pointSize || 0.5, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false
      })));
      var SEG = { 1: [3, 0], 2: [0, 1], 3: [3, 1], 4: [1, 2], 5: [3, 0, 1, 2], 6: [0, 2], 7: [3, 2],
        8: [2, 3], 9: [0, 2], 10: [0, 1, 2, 3], 11: [1, 2], 12: [1, 3], 13: [0, 1], 14: [0, 3] };
      function lp(ax, ay, az, bx, by, bz, lv) { var t = (lv - ay) / ((by - ay) || 1e-6); return [ax + (bx - ax) * t, lv, az + (bz - az) * t]; }
      var cPos = [], cCol = [];
      for (var L = 0; L < levels; L++) {
        var lv = minH + (maxH - minH) * (L + 0.5) / levels, col = elevColor((L + 0.5) / levels);
        for (j = 0; j < grid; j++) for (i = 0; i < grid; i++) {
          var x0 = -half + i * step, z0 = -half + j * step, x1 = x0 + step, z1 = z0 + step;
          if (skip(x0, z0) || skip(x1, z1)) continue;
          var h00 = H[j * W + i], h10 = H[j * W + i + 1], h11 = H[(j + 1) * W + i + 1], h01 = H[(j + 1) * W + i];
          var bits = (h00 >= lv ? 1 : 0) | (h10 >= lv ? 2 : 0) | (h11 >= lv ? 4 : 0) | (h01 >= lv ? 8 : 0);
          if (bits === 0 || bits === 15) continue;
          var e = [lp(x0, h00, z0, x1, h10, z0, lv), lp(x1, h10, z0, x1, h11, z1, lv),
                   lp(x1, h11, z1, x0, h01, z1, lv), lp(x0, h01, z1, x0, h00, z0, lv)];
          var sg = SEG[bits];
          for (var s = 0; s < sg.length; s += 2) {
            var A = e[sg[s]], B = e[sg[s + 1]];
            cPos.push(A[0], A[1] + 0.08, A[2], B[0], B[1] + 0.08, B[2]);
            cCol.push(col.r, col.g, col.b, col.r, col.g, col.b);
          }
        }
      }
      var cg = new THREE.BufferGeometry();
      cg.setAttribute('position', new THREE.Float32BufferAttribute(cPos, 3));
      cg.setAttribute('color', new THREE.Float32BufferAttribute(cCol, 3));
      group.add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: o.contourOpacity || 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false
      })));
      return { group: group, height: hf, minH: minH, maxH: maxH, size: size };
    }
    function relabel() {
      i18nLabels.forEach(function (l) { drawLabel(pick(l.text), l.opts, l.spr); });
    }
    return { relabel: relabel, elevColor: elevColor, glow: glow, label: label, line: line, edges: edges, terrain: terrain, glowTexture: glowTexture };
  }

  /* ---------- mount ---------- */
  function mount(container, name, opts) {
    opts = opts || {};
    var builder = typeof name === 'function' ? name : registry[name];
    if (!container || !builder) { if (global.console) console.warn('RegaPro3D: unknown visual', name); return null; }
    if (container.__rp3d) return container.__rp3d;
    var THREE = global.THREE;
    function fail() { container.classList.add('is-fallback'); container.classList.add('rp3d-fallback'); return null; }
    if (!THREE) return fail();
    var stage = container.querySelector('.svc-hero-3d__stage') || container;

    var w = stage.clientWidth || container.clientWidth || 560, h = stage.clientHeight || container.clientHeight || 350;
    var clear = opts.transparent != null ? !!opts.transparent : container.classList.contains('svc-hero-3d--clear');
    var pull = opts.pullback || parseFloat(container.getAttribute('data-rp3d-pullback')) || 1;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: clear, powerPreference: 'low-power' });
    } catch (err) { return fail(); }
    if (!renderer.getContext()) return fail();
    var dprCap = opts.dprCap || (coarse ? 1.5 : 2);
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, dprCap));
    renderer.setSize(w, h, false);
    renderer.setClearColor(BG, clear ? 0 : 1);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    canvas.setAttribute('aria-hidden', 'true');
    stage.appendChild(canvas);

    var scene = new THREE.Scene();
    scene.background = clear ? null : new THREE.Color(BG);
    var camera = new THREE.PerspectiveCamera(opts.fov || 42, w / h, 0.1, 600);
    scene.add(new THREE.AmbientLight(0xbfd9ff, 0.62));
    var sun = new THREE.DirectionalLight(0xffffff, 0.75);
    sun.position.set(20, 40, 30);
    scene.add(sun);

    var reduce = !!(reduceMQ && reduceMQ.matches);
    var i18nLabels = [];
    var kit = makeKit(THREE, i18nLabels);
    var ctx = {
      THREE: THREE, scene: scene, camera: camera, renderer: renderer, container: container,
      BG: BG, CYAN: CYAN, STRATA: STRATA, mobile: coarse, reduceMotion: reduce, transparent: clear,
      orbit: { target: new THREE.Vector3(), radius: 60, elev: 24, yaw: 0.6, speed: 0.12,
               sway: 0, swaySpeed: 0.35, tiltYaw: 0.4, tiltElev: 10 },
      lang: pageLang, rng: rng, fbm: fbm, v2Height: v2Height, lerp: lerp, clamp: clamp, smooth: smooth
    };
    for (var k in kit) ctx[k] = kit[k];
    var api = builder(ctx) || {};

    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    var time = reduce ? (api.stillTime || 3) : 0;
    var raf = 0, running = false, visible = true, last = null, disposed = false;

    function placeCamera() {
      var o = ctx.orbit; if (!o) return;
      var yaw = o.sway ? o.yaw + Math.sin(time * o.swaySpeed) * o.sway : o.yaw + time * o.speed;
      yaw += mouse.x * o.tiltYaw;
      /* framed for 16:10; pull back on narrower cards (e.g. 4:3 on mobile) so nothing is cropped */
      var k = Math.pow(Math.max(1, (o.refAspect || 1.6) / camera.aspect), 0.9) * pull;
      var el = (o.elev + mouse.y * o.tiltElev) * k;
      camera.position.set(o.target.x + Math.cos(yaw) * o.radius * k, o.target.y + el, o.target.z + Math.sin(yaw) * o.radius * k);
      camera.lookAt(o.target);
    }
    function frame(dt) {
      var e = Math.min(1, dt * 3.5);
      mouse.x += (mouse.tx - mouse.x) * e; mouse.y += (mouse.ty - mouse.y) * e;
      placeCamera();
      if (api.update) api.update(time, dt);
      renderer.render(scene, camera);
    }
    function loop(ts) {
      raf = global.requestAnimationFrame(loop);
      var now = ts * 0.001, dt = last == null ? 0 : Math.min(now - last, 0.1);
      last = now; time += dt; frame(dt);
    }
    function start() {
      if (running || disposed || CAPTURE) return;
      if (reduce) { frame(0); return; }
      running = true; last = null; raf = global.requestAnimationFrame(loop);
    }
    function stop() { running = false; if (raf) global.cancelAnimationFrame(raf); raf = 0; }
    function sync() { if (visible && !document.hidden) start(); else stop(); }

    function onMove(e) {
      if (CAPTURE || reduce) return;
      var r = container.getBoundingClientRect();
      if (!r.width) return;
      mouse.tx = clamp((e.clientX - (r.left + r.width / 2)) / (global.innerWidth * 0.5), -1, 1);
      mouse.ty = clamp((e.clientY - (r.top + r.height / 2)) / (global.innerHeight * 0.5), -1, 1);
    }
    global.addEventListener('pointermove', onMove, { passive: true });

    function resize() {
      var nw = stage.clientWidth, nh = stage.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh, false);
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      if (!running) frame(0);
    }
    var ro = global.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container); else global.addEventListener('resize', resize);
    var io = global.IntersectionObserver ? new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting; sync();
    }, { rootMargin: '80px' }) : null;
    if (io) io.observe(container);
    document.addEventListener('visibilitychange', sync);
    var mo = (global.MutationObserver && i18nLabels.length) ? new MutationObserver(function () {
      ctx.relabel(); if (!running) frame(0);
    }) : null;
    if (mo) mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    var inst = {
      name: typeof name === 'string' ? name : 'custom', ctx: ctx, canvas: canvas,
      start: start, stop: stop, setPullback: function (v) { pull = v || 1; frame(0); },
      renderAt: function (t) { stop(); time = t; mouse.x = mouse.y = mouse.tx = mouse.ty = 0; frame(0); return canvas; },
      dispose: function () {
        disposed = true; stop();
        if (ro) ro.disconnect(); if (io) io.disconnect(); if (mo) mo.disconnect();
        global.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', sync);
        scene.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
        });
        renderer.dispose(); if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        container.__rp3d = null;
      }
    };
    container.__rp3d = inst;
    container.classList.add('rp3d-ready');
    instances.push(inst);
    frame(0);
    sync();
    (global.requestAnimationFrame || setTimeout)(function () { container.classList.add('is-ready'); });
    return inst;
  }

  function autoMount() {
    var els = document.querySelectorAll('[data-rp3d]');
    for (var i = 0; i < els.length; i++) {
      var n = els[i].getAttribute('data-rp3d');
      if (registry[n]) mount(els[i], n);
    }
  }

  global.RegaPro3D = {
    /* registering also mounts any matching element already in the DOM, so script order/defer timing never matters */
    register: function (name, fn) { registry[name] = fn; if (document.readyState !== 'loading') autoMount(); },
    mount: mount, autoMount: autoMount, instances: instances, registry: registry,
    capture: CAPTURE, colors: { BG: BG, CYAN: CYAN, STRATA: STRATA }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})(window);
