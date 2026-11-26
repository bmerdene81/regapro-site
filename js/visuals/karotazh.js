/* Каротажийн өгөгдөл боловсруулалт — four drillholes on a correlation fence. A logging probe runs
   down each hole drawing its GR / RHOB curves; low-gamma, low-density intervals light up as coal,
   then the seams are correlated hole to hole across the section. */
window.RegaPro3D && RegaPro3D.register('karotazh', function (c) {
  var T = c.THREE, S = c.scene;
  var X0 = -16, X1 = 16, BOT = -15, N = 64;
  var HOLES = [-15, -5, 5, 15];
  var GOLD = 0xfbbf24;

  /* surface and layer boundaries (y as a function of x) — gentle dip to the right */
  function top(x) { return 10 + Math.sin(x * 0.19 + 0.6) * 1.1 + Math.sin(x * 0.07) * 0.8; }
  var B = [
    function (x) { return 6.4 - x * 0.06 + Math.sin(x * 0.3) * 0.35; },   /* soil → sandstone */
    function (x) { return 2.8 - x * 0.1 + Math.sin(x * 0.21 + 1) * 0.3; }, /* coal 1 top */
    function (x) { return 1.1 - x * 0.11 + Math.sin(x * 0.18) * 0.25; },   /* coal 1 bottom */
    function (x) { return -3.6 - x * 0.12 + Math.sin(x * 0.25 + 2) * 0.3; }, /* coal 2 top */
    function (x) { return -6.1 - x * 0.12 + Math.sin(x * 0.2 + 0.4) * 0.3; }, /* coal 2 bottom */
    function (x) { return -10 - x * 0.1 + Math.sin(x * 0.17 + 1.3) * 0.4; } /* mudstone → basement */
  ];
  /* layer list: [upper boundary fn, lower boundary fn, colour, isCoal] */
  var L = [
    [top, B[0], 0xc4b189, 0], [B[0], B[1], 0x7a8b74, 0], [B[1], B[2], 0x05080c, 1],
    [B[2], B[3], 0x5a6e5c, 0], [B[3], B[4], 0x05080c, 1], [B[4], B[5], 0x4a5d72, 0],
    [B[5], function () { return BOT; }, 0x2c3544, 0]
  ];

  /* correlation fence: one strip mesh per layer, revealed with an opacity fade */
  var fence = new T.Group(); S.add(fence);
  var fills = [], coalEdges = [];
  L.forEach(function (ly) {
    var pos = [];
    for (var i = 0; i < N; i++) {
      var xa = c.lerp(X0, X1, i / N), xb = c.lerp(X0, X1, (i + 1) / N);
      var a0 = ly[0](xa), a1 = ly[1](xa), b0 = ly[0](xb), b1 = ly[1](xb);
      pos.push(xa, a0, 0, xa, a1, 0, xb, b0, 0, xb, b0, 0, xa, a1, 0, xb, b1, 0);
    }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    var m = new T.Mesh(g, new T.MeshBasicMaterial({ color: ly[2], transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }));
    m.userData.full = ly[3] ? 0.92 : 0.5; fence.add(m); fills.push(m);
    if (ly[3]) {
      [ly[0], ly[1]].forEach(function (f) {
        var pts = []; for (var k = 0; k <= N; k++) { var x = c.lerp(X0, X1, k / N); pts.push(new T.Vector3(x, f(x), 0.05)); }
        var e = c.line(pts, GOLD, 0, true); fence.add(e); coalEdges.push(e);
      });
    }
  });
  /* faint boundary lines + surface profile */
  var bLines = [];
  [top].concat(B).forEach(function (f, k) {
    var pts = []; for (var i = 0; i <= N; i++) { var x = c.lerp(X0, X1, i / N); pts.push(new T.Vector3(x, f(x), 0.03)); }
    var ln = c.line(pts, k === 0 ? c.CYAN : 0x7dd3fc, k === 0 ? 0.9 : 0.3, k === 0); S.add(ln); if (k) bLines.push(ln);
  });
  var frame = c.line([new T.Vector3(X0, top(X0), 0), new T.Vector3(X0, BOT, 0), new T.Vector3(X1, BOT, 0), new T.Vector3(X1, top(X1), 0)], 0x7dd3fc, 0.35);
  S.add(frame);

  /* holes, probes and log curves */
  function gr(x, y) {   /* gamma: low in coal, high in mudstone */
    var n = (c.fbm(x * 0.3 + y * 0.9, y * 0.55 + 3, 3) - 0.5) * 0.9;
    if (y <= B[1](x) && y >= B[2](x) || y <= B[3](x) && y >= B[4](x)) return 0.25 + n * 0.2;
    if (y > B[0](x)) return 1.3 + n; if (y > B[1](x)) return 0.95 + n;
    if (y > B[3](x)) return 1.55 + n; if (y > B[5](x)) return 1.85 + n; return 1.45 + n;
  }
  function rhob(x, y) { /* density: coal is light */
    var n = (c.fbm(y * 0.7 + 9, x * 0.2 + 1, 3) - 0.5) * 0.6;
    if (y <= B[1](x) && y >= B[2](x) || y <= B[3](x) && y >= B[4](x)) return 0.35 + n * 0.3;
    return 1.45 + n;
  }
  var holes = [];
  HOLES.forEach(function (hx, i) {
    var ty = top(hx), len = ty - BOT;
    var tube = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, len, 10, 1), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.85 }));
    tube.position.set(hx, (ty + BOT) / 2, 0.25); S.add(tube);
    var collar = c.glow(c.CYAN, 2.6, 0.9); collar.position.set(hx, ty + 0.15, 0.25); S.add(collar);
    var lab = c.label('DH-0' + (i + 1), { scale: 0.045, px: 16 }); lab.position.set(hx, ty + 1.9, 0.25); S.add(lab);
    var grP = [], rhP = [], STEP = 140;
    for (var k = 0; k <= STEP; k++) {
      var y = ty - k / STEP * len;
      grP.push(new T.Vector3(hx + 0.45 + gr(hx, y) * 1.35, y, 0.6));
      rhP.push(new T.Vector3(hx - 0.45 - rhob(hx, y) * 1.25, y, 0.6));
    }
    var grL = c.line(grP, c.CYAN, 1, true), rhL = c.line(rhP, 0xf472b6, 0.95, true);
    grL.geometry.setDrawRange(0, 0); rhL.geometry.setDrawRange(0, 0); S.add(grL); S.add(rhL);
    var probe = c.glow(0xecfeff, 2.2, 0); S.add(probe);
    holes.push({ x: hx, ty: ty, len: len, gr: grL, rh: rhL, n: STEP + 1, probe: probe, collar: collar, t0: 0.3 + i * 0.35 });
  });
  var lGR = c.label('GR', { plain: true, px: 15, scale: 0.045, color: '#7dd3fc' }); lGR.position.set(HOLES[3] + 1.9, BOT + 1.1, 0.7); S.add(lGR);
  var lRH = c.label('RHOB', { plain: true, px: 15, scale: 0.045, color: '#f9a8d4' }); lRH.position.set(HOLES[3] - 2.3, BOT + 1.1, 0.7); S.add(lRH);
  var lCoal = c.label({ mn: 'Нүүрс', en: 'Coal' }, { scale: 0.05, px: 16, color: '#fde68a' });
  lCoal.position.set(X0 - 3.2, (B[1](X0) + B[2](X0)) / 2, 0.4); lCoal.material.opacity = 0; S.add(lCoal);
  var lCoal2 = c.label({ mn: 'Нүүрс', en: 'Coal' }, { scale: 0.05, px: 16, color: '#fde68a' });
  lCoal2.position.set(X1 + 3.2, (B[3](X1) + B[4](X1)) / 2, 0.4); lCoal2.material.opacity = 0; S.add(lCoal2);

  /* floor grid for depth */
  var grid = new T.GridHelper(56, 28, 0x163044, 0x0e1a28); grid.position.y = BOT - 0.2;
  grid.material.transparent = true; grid.material.opacity = 0.3; S.add(grid);

  c.orbit.target.set(0, -0.6, 0); c.orbit.radius = 47; c.orbit.elev = 9; c.orbit.yaw = Math.PI / 2 - 0.32;
  c.orbit.sway = 0.22; c.orbit.swaySpeed = 0.3; c.orbit.tiltYaw = 0.3; c.orbit.tiltElev = 5;

  return {
    stillTime: 4.6,
    update: function (t) {
      holes.forEach(function (h) {
        var u = c.smooth(h.t0, h.t0 + 2.4, t), cnt = Math.max(0, Math.round(u * h.n));
        h.gr.geometry.setDrawRange(0, cnt); h.rh.geometry.setDrawRange(0, cnt);
        /* after the first run the probe keeps sweeping down, softly */
        var cyc = t < h.t0 + 2.4 ? u : ((t - h.t0 - 2.4) * 0.16) % 1;
        h.probe.position.set(h.x, h.ty - cyc * h.len, 0.35);
        h.probe.material.opacity = t < h.t0 + 2.4 ? (u > 0 && u < 1 ? 1 : 0) : 0.55 * Math.sin(cyc * Math.PI);
        h.collar.material.opacity = 0.65 + 0.25 * Math.sin(t * 2 + h.x);
      });
      var corr = c.smooth(2.9, 4.2, t);
      fills.forEach(function (m) { m.material.opacity = m.userData.full * corr; });
      var pulse = 0.55 + 0.45 * Math.sin(t * 2.4);
      coalEdges.forEach(function (e) { e.material.opacity = corr * pulse; });
      lCoal.material.opacity = lCoal2.material.opacity = corr;
    }
  };
});
