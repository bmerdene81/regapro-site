/* Embeddable contour-glow borehole terrain for the 3d-durslel.html hero.
   Renders into [data-hero-3d]. Keeps the poster image until the first frame,
   and leaves it in place if WebGL is unavailable.
   Transparent mode: class "svc-hero-3d--clear" on the figure (no navy box, page shows through);
   data-rp3d-pullback="1.1" moves the camera back to leave room for the CSS edge fade. */
(function () {
  'use strict';

  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var BG = 0x090d16;
  var CYAN = 0x38bdf8;
  var SIZE = 86;
  var BOTTOM = -16;
  var LEVELS_MAX = 16;

  var LITHO = [
    { max: 100, min: 9.0, color: 0x7a8b74 },
    { max: 9.0, min: 3.5, color: 0xc4b189 },
    { max: 3.5, min: -1.5, color: 0x5a6e5c },
    { max: -1.5, min: -7.0, color: 0x4a5d72 },
    { max: -7.0, min: -99, color: 0x2c3544 }
  ];

  var HOLES = [
    { name: 'SHOB-18R', x: -18, z: 12, depth: 22, dip: 0,  azi: 0 },
    { name: 'SHOB-19',  x: -7,  z: 20, depth: 20, dip: 22, azi: 130 },
    { name: 'GT-04',    x: 6,   z: 8,  depth: 24, dip: 28, azi: 40 },
    { name: 'GT-07',    x: 18,  z: -6, depth: 19, dip: 0,  azi: 0 },
    { name: 'BH-12',    x: -22, z: -8, depth: 21, dip: 18, azi: 80 },
    { name: 'BH-15',    x: -4,  z: -18, depth: 18, dip: 0,  azi: 0 },
    { name: 'KW-03',    x: 16,  z: 17, depth: 23, dip: 32, azi: 220 },
    { name: 'DH-21',    x: 24,  z: 4,  depth: 20, dip: 25, azi: 250 },
    { name: 'GT-11',    x: 4,   z: -9, depth: 25, dip: 15, azi: 10 },
    { name: 'BH-08',    x: -14, z: 2,  depth: 19, dip: 0,  azi: 0 }
  ];

  var FEATURED_LABELS = { 'SHOB-18R': 1, 'KW-03': 1, 'GT-04': 1, 'DH-21': 1, 'SHOB-19': 1 };

  function hash2(ix, iy) {
    var n = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function fade(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function vnoise(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y);
    var fx = x - ix, fy = y - iy;
    var ux = fade(fx), uy = fade(fy);
    return lerp(
      lerp(hash2(ix, iy), hash2(ix + 1, iy), ux),
      lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux),
      uy
    );
  }
  function fbm(x, y) {
    var v = 0, a = 1, f = 1, s = 0, i;
    for (i = 0; i < 5; i++) {
      v += a * vnoise(x * f, y * f);
      s += a; a *= 0.5; f *= 2.05;
    }
    return v / s;
  }
  function heightAt(x, z) {
    var n = fbm(x * 0.038 + 4.2, z * 0.038 + 1.7);
    var h = (n - 0.42) * 22;
    h += Math.exp(-((x - 12) * (x - 12) + (z + 6) * (z + 6)) / 520) * 11;
    h += Math.exp(-((x + 18) * (x + 18) + (z - 14) * (z - 14)) / 380) * 8.5;
    h += Math.exp(-((x - 22) * (x - 22) + (z - 18) * (z - 18)) / 260) * 5.5;
    h -= Math.exp(-(x * x) / 1100) * 3.2;
    return h;
  }
  function inCut(x, z) { return x > 0.2 && z > 0.2; }
  function lithoColor(y) {
    var i;
    for (i = 0; i < LITHO.length; i++) {
      if (y <= LITHO[i].max && y > LITHO[i].min) return LITHO[i].color;
    }
    return LITHO[LITHO.length - 1].color;
  }
  function elevColor(THREE, h, minH, maxH) {
    var t = Math.max(0, Math.min(1, (h - minH) / (maxH - minH || 1)));
    var c = new THREE.Color();
    if (t < 0.5) c.setRGB(0.05, 0.22, 0.55).lerp(new THREE.Color(CYAN), t * 2);
    else c.set(CYAN).lerp(new THREE.Color(0xecfeff), (t - 0.5) * 2);
    return c;
  }
  function holeEnds(THREE, hole) {
    var y0 = heightAt(hole.x, hole.z);
    var dip = (hole.dip || 0) * Math.PI / 180;
    var azi = (hole.azi || 0) * Math.PI / 180;
    var d = hole.depth;
    return {
      start: new THREE.Vector3(hole.x, y0, hole.z),
      end: new THREE.Vector3(
        hole.x + Math.sin(dip) * Math.sin(azi) * d,
        y0 - Math.cos(dip) * d,
        hole.z + Math.sin(dip) * Math.cos(azi) * d
      )
    };
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = THREE_URL;
      s.async = true;
      s.onload = function () {
        if (window.THREE) resolve(window.THREE);
        else reject(new Error('THREE missing after load'));
      };
      s.onerror = function () { reject(new Error('Failed to load three.js')); };
      document.head.appendChild(s);
    });
  }

  function qualityFor(width) {
    if (width < 480) return { grid: 52, levels: 9, pointStep: 2, antialias: false, labels: 'featured', nSeg: 8, labelScale: 0.075 };
    if (width < 800) return { grid: 72, levels: 12, pointStep: 1, antialias: true, labels: 'all', nSeg: 12, labelScale: 0.068 };
    return { grid: 96, levels: LEVELS_MAX, pointStep: 1, antialias: true, labels: 'all', nSeg: 14, labelScale: 0.07 };
  }

  function makeLabel(THREE, text, scale) {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    var font = '600 13px Inter, Helvetica, Arial, sans-serif';
    ctx.font = font;
    var tw = Math.ceil(ctx.measureText(text).width);
    var w = tw + 14, h = 20;
    c.width = w * 2; c.height = h * 2;
    ctx.scale(2, 2);
    ctx.font = font;
    ctx.fillStyle = 'rgba(9,13,22,0.72)';
    var r = 4;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(56,189,248,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#e0f6ff';
    ctx.fillText(text, 7, 14);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthTest: false
    }));
    spr.scale.set(w * scale, h * scale, 1);
    return spr;
  }

  function lerpP(ax, ay, az, ah, bx, by, bz, bh, level) {
    var t = (level - ah) / ((bh - ah) || 1e-6);
    return [ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t];
  }

  function buildScene(THREE, stage, quality, opts) {
    opts = opts || {};
    var clear = !!opts.clear, pull = opts.pullback || 1;
    var scene = new THREE.Scene();
    scene.background = clear ? null : new THREE.Color(BG);
    scene.fog = clear ? null : new THREE.Fog(BG, 58, 170);

    var camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 400);
    var renderer = new THREE.WebGLRenderer({
      antialias: quality.antialias,
      alpha: clear,
      powerPreference: 'low-power'
    });
    renderer.setClearColor(BG, clear ? 0 : 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    stage.appendChild(renderer.domElement);

    var GRID = quality.grid;
    var half = SIZE / 2;
    var step = SIZE / GRID;
    var minH = 1e9, maxH = -1e9;
    var H = new Float32Array((GRID + 1) * (GRID + 1));
    var i, j, x, z, h;

    for (j = 0; j <= GRID; j++) {
      for (i = 0; i <= GRID; i++) {
        x = -half + i * step;
        z = -half + j * step;
        h = heightAt(x, z);
        H[j * (GRID + 1) + i] = h;
        if (!inCut(x, z)) {
          if (h < minH) minH = h;
          if (h > maxH) maxH = h;
        }
      }
    }

    var pPos = [], pCol = [], cTmp = new THREE.Color();
    var ps = quality.pointStep;
    for (j = 0; j <= GRID; j += ps) {
      for (i = 0; i <= GRID; i += ps) {
        x = -half + i * step;
        z = -half + j * step;
        if (inCut(x, z)) continue;
        h = H[j * (GRID + 1) + i];
        pPos.push(x, h + 0.04, z);
        cTmp.copy(elevColor(THREE, h, minH, maxH));
        pCol.push(cTmp.r, cTmp.g, cTmp.b);
      }
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.Float32BufferAttribute(pCol, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: quality.pointStep > 1 ? 0.7 : 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false
    })));

    var cPos = [], cCol = [], levels = [], L;
    for (L = 0; L < quality.levels; L++) {
      levels.push(minH + (maxH - minH) * (L + 0.5) / quality.levels);
    }
    var SEGS_MAP = {
      1: [3, 0], 2: [0, 1], 3: [3, 1], 4: [1, 2],
      5: [3, 0, 1, 2], 6: [0, 2], 7: [3, 2], 8: [2, 3],
      9: [0, 2], 10: [0, 1, 2, 3], 11: [1, 2], 12: [1, 3],
      13: [0, 1], 14: [0, 3]
    };
    for (L = 0; L < levels.length; L++) {
      var level = levels[L];
      var col = elevColor(THREE, level, minH, maxH);
      for (j = 0; j < GRID; j++) {
        for (i = 0; i < GRID; i++) {
          var x0 = -half + i * step, z0 = -half + j * step;
          var x1 = x0 + step, z1 = z0 + step;
          if (inCut(x0, z0) && inCut(x1, z0) && inCut(x1, z1) && inCut(x0, z1)) continue;
          var cutCount = 0;
          if (inCut(x0, z0)) cutCount++;
          if (inCut(x1, z0)) cutCount++;
          if (inCut(x1, z1)) cutCount++;
          if (inCut(x0, z1)) cutCount++;
          if (cutCount >= 3) continue;
          var h00 = H[j * (GRID + 1) + i];
          var h10 = H[j * (GRID + 1) + i + 1];
          var h11 = H[(j + 1) * (GRID + 1) + i + 1];
          var h01 = H[(j + 1) * (GRID + 1) + i];
          var bits = (h00 >= level ? 1 : 0) | (h10 >= level ? 2 : 0) |
                     (h11 >= level ? 4 : 0) | (h01 >= level ? 8 : 0);
          if (bits === 0 || bits === 15) continue;
          var e = [
            lerpP(x0, h00, z0, h00, x1, h10, z0, h10, level),
            lerpP(x1, h10, z0, h10, x1, h11, z1, h11, level),
            lerpP(x1, h11, z1, h11, x0, h01, z1, h01, level),
            lerpP(x0, h01, z1, h01, x0, h00, z0, h00, level)
          ];
          var segs = SEGS_MAP[bits];
          var s;
          for (s = 0; s < segs.length; s += 2) {
            var A = e[segs[s]], B = e[segs[s + 1]];
            cPos.push(A[0], A[1] + 0.08, A[2], B[0], B[1] + 0.08, B[2]);
            cCol.push(col.r, col.g, col.b, col.r, col.g, col.b);
          }
        }
      }
    }
    var cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(cPos, 3));
    cGeo.setAttribute('color', new THREE.Float32BufferAttribute(cCol, 3));
    scene.add(new THREE.LineSegments(cGeo, new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })));

    var cutHalf = half;
    function addStrataFace(axisIsX) {
      var segs = 48, verts = [], cols = [], idx = [], v = 0;
      var col = new THREE.Color();
      var si, bi;
      for (si = 0; si < segs; si++) {
        var t0 = si / segs, t1 = (si + 1) / segs;
        var ax = axisIsX ? 0 : t0 * cutHalf, az = axisIsX ? t0 * cutHalf : 0;
        var bx = axisIsX ? 0 : t1 * cutHalf, bz = axisIsX ? t1 * cutHalf : 0;
        var top0 = heightAt(ax, az), top1 = heightAt(bx, bz);
        for (bi = 0; bi < LITHO.length; bi++) {
          var band = LITHO[bi];
          var yt0 = Math.max(BOTTOM, Math.min(top0, band.max));
          var yb0 = Math.max(BOTTOM, Math.min(top0, band.min));
          var yt1 = Math.max(BOTTOM, Math.min(top1, band.max));
          var yb1 = Math.max(BOTTOM, Math.min(top1, band.min));
          if (yt0 - yb0 < 0.03 && yt1 - yb1 < 0.03) continue;
          col.set(band.color);
          verts.push(ax, yb0, az, ax, yt0, az, bx, yt1, bz, bx, yb1, bz);
          cols.push(col.r, col.g, col.b, col.r, col.g, col.b, col.r, col.g, col.b, col.r, col.g, col.b);
          idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
          v += 4;
        }
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      g.setIndex(idx);
      scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide
      })));
      var rim = [], bot = [], ri;
      for (ri = 0; ri <= segs; ri++) {
        var t = ri / segs;
        var rx = axisIsX ? 0 : t * cutHalf;
        var rz = axisIsX ? t * cutHalf : 0;
        rim.push(rx, heightAt(rx, rz) + 0.12, rz);
        bot.push(rx, BOTTOM, rz);
      }
      var rg = new THREE.BufferGeometry();
      rg.setAttribute('position', new THREE.Float32BufferAttribute(rim, 3));
      scene.add(new THREE.Line(rg, new THREE.LineBasicMaterial({
        color: CYAN, transparent: true, opacity: 0.95
      })));
      var bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.Float32BufferAttribute(bot, 3));
      scene.add(new THREE.Line(bg, new THREE.LineBasicMaterial({
        color: CYAN, transparent: true, opacity: 0.35
      })));
    }
    addStrataFace(true);
    addStrataFace(false);

    var glass = new THREE.Mesh(
      new THREE.BoxGeometry(cutHalf, Math.abs(BOTTOM) + 8, cutHalf),
      new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.03,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    glass.position.set(cutHalf / 2, (BOTTOM + 8) / 2, cutHalf / 2);
    scene.add(glass);
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(glass.geometry),
      new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.28 })
    );
    edges.position.copy(glass.position);
    scene.add(edges);

    var base = new THREE.GridHelper(SIZE * 1.15, 23, 0x163044, 0x0e1a28);
    base.position.y = BOTTOM - 0.4;
    base.material.transparent = true;
    base.material.opacity = 0.28;
    scene.add(base);

    var pulses = [];
    var up = new THREE.Vector3(0, 1, 0);
    HOLES.forEach(function (hole) {
      var ends = holeEnds(THREE, hole);
      var start = ends.start, end = ends.end;
      var dir = new THREE.Vector3().subVectors(end, start);
      var nrm = dir.clone().normalize();
      var nSeg = quality.nSeg;
      var si;
      for (si = 0; si < nSeg; si++) {
        var ta = si / nSeg, tb = (si + 1) / nSeg;
        var a = start.clone().lerp(end, ta);
        var b = start.clone().lerp(end, tb);
        var hSeg = a.distanceTo(b);
        var m = a.clone().lerp(b, 0.5);
        var mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, hSeg, 7, 1),
          new THREE.MeshBasicMaterial({ color: lithoColor((a.y + b.y) * 0.5) })
        );
        mesh.position.copy(m);
        mesh.quaternion.setFromUnitVectors(up, nrm);
        scene.add(mesh);
      }

      var collar = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 14, 14),
        new THREE.MeshBasicMaterial({ color: CYAN })
      );
      collar.position.copy(start);
      scene.add(collar);
      var halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 12, 12),
        new THREE.MeshBasicMaterial({
          color: CYAN, transparent: true, opacity: 0.18, depthWrite: false
        })
      );
      halo.position.copy(start);
      scene.add(halo);
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.05, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(start);
      ring.position.y += 0.04;
      scene.add(ring);

      var showLabel = quality.labels === 'all' || FEATURED_LABELS[hole.name];
      if (showLabel) {
        var label = makeLabel(THREE, hole.name, quality.labelScale);
        label.position.set(start.x, start.y + 2.0, start.z);
        scene.add(label);
      }

      var pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
      );
      var pulseHalo = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 10, 10),
        new THREE.MeshBasicMaterial({
          color: CYAN, transparent: true, opacity: 0.35, depthWrite: false
        })
      );
      scene.add(pulse);
      scene.add(pulseHalo);
      pulses.push({ start: start, end: end, pulse: pulse, halo: pulseHalo, off: Math.random() });
    });

    var look = new THREE.Vector3(6, 1.5, 6);
    var yaw = 0.62;
    var mouseX = 0, mouseY = 0;
    var targetX = 0, targetY = 0;

    function setMouse(nx, ny) {
      targetX = nx;
      targetY = ny;
    }

    function resize() {
      var w = Math.max(1, stage.clientWidth);
      var hgt = Math.max(1, stage.clientHeight);
      camera.aspect = w / hgt;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, hgt, false);
    }

    function placeCamera() {
      var yawOff = yaw + mouseX * 0.45;
      var radius = 66;
      var elev = 26 + mouseY * 14;
      camera.position.set(Math.cos(yawOff) * radius, elev, Math.sin(yawOff) * radius);
      if (pull !== 1) camera.position.sub(look).multiplyScalar(pull).add(look);
      camera.lookAt(look);
    }

    function tick(sec, animate) {
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;
      if (animate) yaw += 0.0022;
      placeCamera();
      if (animate) {
        pulses.forEach(function (p, idx) {
          var u = (sec * 0.22 + p.off + idx * 0.07) % 1;
          var pos = p.start.clone().lerp(p.end, u);
          p.pulse.position.copy(pos);
          p.halo.position.copy(pos);
          var sc = 0.85 + 0.25 * Math.sin(sec * 6 + idx);
          p.halo.scale.setScalar(sc);
        });
      } else {
        pulses.forEach(function (p, idx) {
          var u = (0.35 + p.off * 0.3 + idx * 0.07) % 1;
          var pos = p.start.clone().lerp(p.end, u);
          p.pulse.position.copy(pos);
          p.halo.position.copy(pos);
        });
      }
    }

    function render() {
      renderer.render(scene, camera);
    }

    function dispose() {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }

    resize();
    return {
      setMouse: setMouse,
      resize: resize,
      tick: tick,
      render: render,
      dispose: dispose,
      canvas: renderer.domElement
    };
  }

  function enhance(root) {
    var stage = root.querySelector('.svc-hero-3d__stage');
    if (!stage) return;

    if (!hasWebGL()) {
      root.classList.add('is-fallback');
      return;
    }

    var reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}

    loadThree().then(function (THREE) {
      var quality = qualityFor(stage.clientWidth || root.clientWidth || 800);
      var app = buildScene(THREE, stage, quality, {
        clear: root.classList.contains('svc-hero-3d--clear'),
        pullback: parseFloat(root.getAttribute('data-rp3d-pullback')) || 1
      });
      root.__hero3d = app;
      var inView = true;
      var pageVisible = typeof document.hidden === 'boolean' ? !document.hidden : true;
      var running = false;
      var raf = 0;
      var startTime = 0;

      function shouldAnimate() {
        return !reduced && inView && pageVisible;
      }

      function loop(t) {
        raf = requestAnimationFrame(loop);
        if (!startTime) startTime = t;
        var sec = (t - startTime) * 0.001;
        app.tick(sec, shouldAnimate());
        app.render();
        if (!root.classList.contains('is-ready')) {
          root.classList.add('is-ready');
        }
        if (!shouldAnimate() && root.classList.contains('is-ready')) {
          /* Keep the last frame; stop the loop until we should run again. */
          running = false;
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }

      function start() {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(loop);
      }

      function renderOnce() {
        app.tick(0, false);
        app.render();
        root.classList.add('is-ready');
      }

      app.resize();
      app.tick(0, false);
      app.render();
      requestAnimationFrame(function () {
        app.render();
        root.classList.add('is-ready');
        if (!reduced) start();
      });

      if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(function () {
          app.resize();
          if (!running) {
            app.tick(0, false);
            app.render();
          }
        });
        ro.observe(root);
      }

      function onMove(e) {
        var r = root.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        app.setMouse(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
      }
      function onLeave() { app.setMouse(0, 0); }
      root.addEventListener('mousemove', onMove);
      root.addEventListener('mouseleave', onLeave);

      if (typeof IntersectionObserver !== 'undefined') {
        var io = new IntersectionObserver(function (entries) {
          inView = entries[0] && entries[0].isIntersecting;
          if (shouldAnimate()) start();
        }, { threshold: 0.12 });
        io.observe(root);
      }

      document.addEventListener('visibilitychange', function () {
        pageVisible = !document.hidden;
        if (shouldAnimate()) start();
      });
    }).catch(function () {
      root.classList.add('is-fallback');
    });
  }

  function boot() {
    var nodes = document.querySelectorAll('[data-hero-3d]');
    var i;
    for (i = 0; i < nodes.length; i++) enhance(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
