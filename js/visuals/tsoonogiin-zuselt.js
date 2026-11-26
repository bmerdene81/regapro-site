/* Талбайн цооногуудын зүсэлт — a line A–A′ is drawn across the V2 terrain, the ground in front of it
   is cut away and the geological section opens along the line: strata, drillholes with collar
   labels, and the report title block (штамп) in the corner. */
window.RegaPro3D && RegaPro3D.register('tsoonogiin-zuselt', function (c) {
  var T = c.THREE, S = c.scene, SIZE = 64, HALF = SIZE / 2;
  /* section line A → A′ (slightly oblique) */
  var AX = -27, AZ = -3, BX = 27, BZ = 5;
  var DX = BX - AX, DZ = BZ - AZ, LEN = Math.sqrt(DX * DX + DZ * DZ), NX = -DZ / LEN, NZ = DX / LEN;
  function side(x, z) { return (x - AX) * NX + (z - AZ) * NZ; } /* > 0: in front of the line (towards camera) */
  var ter = c.terrain({ size: SIZE, grid: 72, levels: 14, pointSize: 0.45,
    skip: function (x, z) { return side(x, z) > 0.4; } });
  S.add(ter.group);
  var H = ter.height, BOT = ter.minH - 9, N = 90;
  function P(u) { return [AX + DX * u, AZ + DZ * u]; }
  function top(u) { var p = P(u); return H(p[0], p[1]); }
  /* strata boundaries below the surface, in depth; they dip from A to A′ */
  var D = [
    function (u) { return top(u) - 2.6 - Math.sin(u * 7) * 0.5; },
    function (u) { return BOT + 13.5 - u * 4.5 + Math.sin(u * 5 + 1) * 1.1; },
    function (u) { return BOT + 9 - u * 3.6 + Math.sin(u * 6.5) * 0.9; },
    function (u) { return BOT + 4.6 - u * 2.4 + Math.sin(u * 4 + 2) * 0.8; }
  ];
  var bounds = [top, function (u) { return Math.min(D[0](u), top(u) - 1); },
    function (u) { return Math.min(D[1](u), top(u) - 3.2); },
    function (u) { return Math.min(D[2](u), top(u) - 5.5); },
    function (u) { return Math.min(D[3](u), top(u) - 8); }, function () { return BOT; }];
  var COLS = [0xc4b189, 0x7a8b74, 0x5a6e5c, 0x4a5d72, 0x2c3544];

  /* section face: one strip mesh per stratum, revealed column by column from A to A′ */
  var strips = [];
  for (var k = 0; k < 5; k++) {
    var pos = [];
    for (var i = 0; i < N; i++) {
      var u0 = i / N, u1 = (i + 1) / N, p0 = P(u0), p1 = P(u1);
      var a0 = bounds[k](u0), a1 = bounds[k + 1](u0), b0 = bounds[k](u1), b1 = bounds[k + 1](u1);
      pos.push(p0[0], a0, p0[1], p0[0], a1, p0[1], p1[0], b0, p1[1], p1[0], b0, p1[1], p0[0], a1, p0[1], p1[0], b1, p1[1]);
    }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setDrawRange(0, 0);
    var m = new T.Mesh(g, new T.MeshBasicMaterial({ color: COLS[k], transparent: true, opacity: 0.88, side: T.DoubleSide, depthWrite: false }));
    S.add(m); strips.push(m);
  }
  /* boundary lines (also revealed with the face) */
  var blines = [];
  bounds.forEach(function (f, k) {
    var pts = [];
    for (var i = 0; i <= N; i++) { var p = P(i / N); pts.push(new T.Vector3(p[0] + NX * 0.06, f(i / N) + (k ? 0 : 0.08), p[1] + NZ * 0.06)); }
    var ln = c.line(pts, k === 0 ? c.CYAN : 0xbfe9ff, k === 0 ? 1 : 0.45, k === 0); ln.geometry.setDrawRange(0, 0); S.add(ln); blines.push(ln);
  });
  var pa = P(0), pb = P(1);
  var ends = c.line([new T.Vector3(pa[0], top(0), pa[1]), new T.Vector3(pa[0], BOT, pa[1]), new T.Vector3(pb[0], BOT, pb[1]), new T.Vector3(pb[0], top(1), pb[1])], 0x7dd3fc, 0.5);
  ends.geometry.setDrawRange(0, 0); S.add(ends);

  /* drillholes on the section */
  var HU = [0.17, 0.4, 0.62, 0.85], holes = [];
  HU.forEach(function (u, i) {
    var p = P(u), ty = top(u), by = BOT + 2.5 + (i % 2) * 2;
    var x = p[0] + NX * 0.2, z = p[1] + NZ * 0.2;
    var tube = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, ty - by, 10, 1), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0 }));
    tube.position.set(x, (ty + by) / 2, z); tube.scale.y = 0.001; S.add(tube);
    var collar = c.glow(c.CYAN, 3, 0); collar.position.set(x, ty + 0.3, z); S.add(collar);
    var lab = c.label('DH-0' + (i + 1), { scale: 0.05, px: 16 }); lab.position.set(x, ty + 3, z); lab.material.opacity = 0; S.add(lab);
    var stick = c.line([new T.Vector3(x, ty + 0.3, z), new T.Vector3(x, ty + 2.2, z)], c.CYAN, 0); S.add(stick);
    /* contact markers where the hole crosses strata boundaries */
    var marks = [];
    for (var k = 1; k < 5; k++) { var y = bounds[k](u); if (y > by) { var mk = c.glow(0xecfeff, 1.1, 0); mk.position.set(x, y, z + 0.05); S.add(mk); marks.push(mk); } }
    var pulse = c.glow(0xecfeff, 2, 0); S.add(pulse);
    holes.push({ x: x, z: z, ty: ty, by: by, tube: tube, collar: collar, lab: lab, stick: stick, marks: marks, pulse: pulse, t0: 2.3 + i * 0.22 });
  });

  /* A / A′ markers */
  var lA = c.label('A', { scale: 0.06, px: 18 }); lA.position.set(pa[0], top(0) + 3.4, pa[1]); lA.material.opacity = 0; S.add(lA);
  var lB = c.label('A′', { scale: 0.06, px: 18 }); lB.position.set(pb[0], top(1) + 3.4, pb[1]); lB.material.opacity = 0; S.add(lB);
  var pen = c.glow(0xffffff, 2.4, 0); S.add(pen);

  /* report title block (штамп) in the lower right corner of the face */
  var tb = new T.Group(), tw = 9, th = 3.6;
  var tbPts = [[0, 0], [tw, 0], [tw, th], [0, th], [0, 0]].map(function (q) { return new T.Vector3(q[0], q[1], 0); });
  tb.add(new T.Mesh(new T.PlaneGeometry(tw, th), new T.MeshBasicMaterial({ color: 0x0b1c27, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false })));
  tb.children[0].position.set(tw / 2, th / 2, -0.02);
  tb.add(c.line(tbPts, 0xecfeff, 0.9));
  tb.add(c.line([new T.Vector3(0, th * 0.5, 0), new T.Vector3(tw, th * 0.5, 0)], 0xbfe9ff, 0.7));
  tb.add(c.line([new T.Vector3(tw * 0.38, 0, 0), new T.Vector3(tw * 0.38, th, 0)], 0xbfe9ff, 0.7));
  tb.add(c.line([new T.Vector3(tw * 0.7, 0, 0), new T.Vector3(tw * 0.7, th * 0.5, 0)], 0xbfe9ff, 0.7));
  for (var r = 0; r < 3; r++) tb.add(c.line([new T.Vector3(tw * 0.45, th * (0.62 + r * 0.11), 0), new T.Vector3(tw * (0.92 - r * 0.12), th * (0.62 + r * 0.11), 0)], 0x7dd3fc, 0.8));
  var pt = P(0.97);
  tb.position.set(pt[0] + NX * 0.3, BOT + 0.9, pt[1] + NZ * 0.3);
  tb.rotation.y = -Math.atan2(DZ, DX); tb.translateX(-tw); S.add(tb);
  tb.traverse(function (o) { if (o.material) { o.material.transparent = true; o.userData.full = o.material.opacity; o.material.opacity = 0; } });

  /* faint floor grid */
  var grid = new T.GridHelper(SIZE * 1.15, 23, 0x163044, 0x0e1a28); grid.position.y = BOT - 0.3;
  grid.material.transparent = true; grid.material.opacity = 0.25; S.add(grid);

  c.orbit.target.set(1, (ter.maxH + BOT) / 2 - 0.6, 1); c.orbit.radius = 52; c.orbit.elev = 34; c.orbit.yaw = Math.PI / 2 + Math.atan2(DZ, DX) * 0.3 + 0.18;
  c.orbit.sway = 0.2; c.orbit.swaySpeed = 0.28; c.orbit.tiltYaw = 0.3; c.orbit.tiltElev = 8;

  return {
    stillTime: 4.8,
    update: function (t) {
      /* 1) the line is traced A → A′ */
      var lt = c.smooth(0.2, 1.5, t), cnt = Math.round(lt * (N + 1));
      blines[0].geometry.setDrawRange(0, cnt);
      var pp = P(lt); pen.position.set(pp[0], top(lt) + 0.5, pp[1]); pen.material.opacity = lt > 0 && lt < 1 ? 1 : 0;
      lA.material.opacity = c.smooth(0.2, 0.6, t); lB.material.opacity = c.smooth(1.3, 1.7, t);
      /* 2) the section opens along the line */
      var st = c.smooth(1.2, 2.6, t), cols = Math.round(st * N);
      strips.forEach(function (m) { m.geometry.setDrawRange(0, cols * 6); });
      for (var k = 1; k < blines.length; k++) blines[k].geometry.setDrawRange(0, Math.round(st * (N + 1)));
      ends.geometry.setDrawRange(0, st >= 1 ? 4 : st > 0 ? 2 : 0);
      /* 3) holes drop in, labels and contact markers appear */
      holes.forEach(function (h) {
        var e = c.smooth(h.t0, h.t0 + 0.9, t);
        h.tube.scale.y = Math.max(0.001, e); h.tube.position.y = h.ty - (h.ty - h.by) * e / 2; h.tube.material.opacity = 0.9 * Math.min(1, e * 3);
        h.collar.material.opacity = e * (0.7 + 0.25 * Math.sin(t * 2 + h.x));
        h.lab.material.opacity = h.stick.material.opacity = c.smooth(h.t0 + 0.5, h.t0 + 1.0, t);
        h.marks.forEach(function (m) { m.material.opacity = c.smooth(h.t0 + 0.8, h.t0 + 1.2, t) * 0.9; });
        var cy = ((t - h.t0 - 1.2) * 0.22) % 1;
        if (t > h.t0 + 1.2) { h.pulse.position.set(h.x, h.ty - cy * (h.ty - h.by), h.z + 0.1); h.pulse.material.opacity = 0.7 * Math.sin(cy * Math.PI); }
      });
      /* 4) title block */
      var tt = c.smooth(3.6, 4.4, t);
      tb.traverse(function (o) { if (o.material && o.userData.full != null) o.material.opacity = o.userData.full * tt; });
    }
  };
});
