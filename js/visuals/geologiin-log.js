/* Геологийн лог — rotating drill-core column: lithology intervals, dipping structural
   planes, glowing alteration shells, mineralisation sparks, depth + assay tracks. */
window.RegaPro3D && RegaPro3D.register('geologiin-log', function (c) {
  var T = c.THREE, S = c.scene, R = 2.3;
  var core = new T.Group(); S.add(core);
  var units = [
    [15, 11.2, 0x7a8b74], [11.2, 7.6, 0xc4b189], [7.6, 2.4, 0x5a6e5c], [2.4, -1.8, 0x9a8a6e],
    [-1.8, -6.6, 0x4a5d72], [-6.6, -10.4, 0x6e6486], [-10.4, -15, 0x2c3544]
  ];
  units.forEach(function (u) {
    var h = u[0] - u[1];
    var m = new T.Mesh(new T.CylinderGeometry(R, R, h - 0.06, 32, 1),
      new T.MeshLambertMaterial({ color: u[2] }));
    m.position.y = (u[0] + u[1]) / 2; core.add(m);
    var ring = new T.Mesh(new T.TorusGeometry(R + 0.04, 0.05, 6, 48), new T.MeshBasicMaterial({ color: 0x7dd3fc }));
    ring.rotation.x = Math.PI / 2; ring.position.y = u[1]; core.add(ring);
  });
  var capTop = new T.Mesh(new T.TorusGeometry(R + 0.04, 0.07, 6, 48), new T.MeshBasicMaterial({ color: c.CYAN }));
  capTop.rotation.x = Math.PI / 2; capTop.position.y = 15; core.add(capTop);
  /* faint casing */
  core.add(c.edges(new T.CylinderGeometry(R + 1.1, R + 1.1, 31, 24, 1, true), c.CYAN, 0.22, 1));

  /* structural planes — dipping discs */
  [[9.4, 0.62, 0.3], [0.6, -0.5, 1.6], [-8.6, 0.8, -0.7]].forEach(function (p) {
    var g = new T.Group();
    g.add(new T.Mesh(new T.CircleGeometry(4.6, 48), new T.MeshBasicMaterial({
      color: c.CYAN, transparent: true, opacity: 0.14, side: T.DoubleSide, depthWrite: false })));
    var pts = []; for (var i = 0; i <= 64; i++) { var a = i / 64 * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 0)); }
    g.add(c.line(pts, 0x7dd3fc, 0.95));
    g.rotation.set(Math.PI / 2 + p[1], p[2], 0);
    g.position.y = p[0]; core.add(g);
  });

  /* alteration shells (pulsing) + mineralisation sparks */
  var shells = [];
  [[5.6, -0.8, 0x22d3ee], [-7.2, -12.4, 0xa78bfa]].forEach(function (z, k) {
    var h = z[0] - z[1];
    var m = new T.Mesh(new T.CylinderGeometry(R * 1.28, R * 1.28, h, 32, 1, true), new T.MeshBasicMaterial({
      color: z[2], transparent: true, opacity: 0.25, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    m.position.y = (z[0] + z[1]) / 2; core.add(m); shells.push(m);
    var r = c.rng(11 + k), pos = [];
    for (var i = 0; i < 70; i++) {
      var a = r() * Math.PI * 2, rr = R * (0.98 + r() * 0.06);
      pos.push(Math.cos(a) * rr, z[1] + r() * h, Math.sin(a) * rr);
    }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    core.add(new T.Points(g, new T.PointsMaterial({ color: k ? 0xe9d5ff : 0xfde68a, size: 0.32,
      transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })));
  });
  var mzGlow = c.glow(0x22d3ee, 9, 0.35); mzGlow.position.y = 2.4; S.add(mzGlow);

  /* static tracks: depth scale (left) + assay curve (right) */
  var tx = -R - 4.2, ticks = [];
  for (var d = 0; d <= 30; d += 2.5) {
    var y = 15 - d, len = d % 7.5 === 0 ? 0.9 : 0.45;
    ticks.push(new T.Vector3(tx, y, 0), new T.Vector3(tx + len, y, 0));
  }
  var tg = new T.BufferGeometry().setFromPoints(ticks);
  S.add(new T.LineSegments(tg, new T.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.7 })));
  S.add(c.line([new T.Vector3(tx, 15, 0), new T.Vector3(tx, -15, 0)], 0x7dd3fc, 0.6));
  [[{ mn: '0 м', en: '0 m' }, 15], ['50', 7.5], ['100', 0], ['150', -7.5], [{ mn: '200 м', en: '200 m' }, -15]].forEach(function (l) {
    var s = c.label(l[0], { plain: true, px: 15, scale: 0.05, color: '#9fdcf7' });
    s.position.set(tx - 1.6, l[1], 0); S.add(s);
  });
  var ax = R + 3.6, apts = [];
  for (var i = 0; i <= 120; i++) {
    var yy = 15 - i / 120 * 30;
    var g = 0.25 + c.fbm(i * 0.35, 3.1, 3) * 0.6;
    g += Math.exp(-Math.pow((yy - 2.4) / 2.2, 2)) * 2.4 + Math.exp(-Math.pow((yy + 9.8) / 1.6, 2)) * 1.5;
    apts.push(new T.Vector3(ax + g * 1.25, yy, 0));
  }
  var assay = c.line(apts, c.CYAN, 1, true); S.add(assay);
  S.add(c.line([new T.Vector3(ax, 15, 0), new T.Vector3(ax, -15, 0)], 0x7dd3fc, 0.35));
  var peak = c.glow(0xecfeff, 2.2, 0.9); peak.position.set(ax + 3.3, 2.4, 0); S.add(peak);
  var l1 = c.label('DH-21', { scale: 0.06 }); l1.position.set(0, 17.4, 0); S.add(l1);
  var l2 = c.label('Au g/t', { plain: true, px: 15, scale: 0.05, color: '#9fdcf7' }); l2.position.set(ax + 1.8, 16.6, 0); S.add(l2);
  var l3 = c.label('35°/120', { scale: 0.05 }); l3.position.set(-5.4, 9.6, 2.5); S.add(l3);

  /* back grid */
  var grid = new T.GridHelper(44, 22, 0x163044, 0x0e1a28);
  grid.rotation.x = Math.PI / 2; grid.position.z = -8;
  grid.material.transparent = true; grid.material.opacity = 0.35; S.add(grid);

  c.orbit.target.set(0, 1.4, 0); c.orbit.radius = 47; c.orbit.elev = 7; c.orbit.yaw = Math.PI / 2;
  c.orbit.sway = 0.18; c.orbit.swaySpeed = 0.4; c.orbit.tiltYaw = 0.3; c.orbit.tiltElev = 8;

  return {
    stillTime: 2,
    update: function (t) {
      core.rotation.y = t * 0.45;
      shells[0].material.opacity = 0.18 + 0.14 * (0.5 + 0.5 * Math.sin(t * 2.2));
      shells[1].material.opacity = 0.16 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2.2 + 2));
      mzGlow.material.opacity = 0.25 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2.2));
      peak.scale.setScalar(1.8 + 0.6 * Math.sin(t * 3));
    }
  };
});
