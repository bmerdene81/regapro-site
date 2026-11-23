/* Дээжийн бүртгэл ба QR — extruded QR block scanned by a laser plane; sample bags and a
   core box linked to the code and to the lab result by glowing lines. */
window.RegaPro3D && RegaPro3D.register('deej-qr', function (c) {
  var T = c.THREE, S = c.scene, N = 21, U = 0.62, r = c.rng(42);
  var grid = [];
  function finder(x0, y0) { for (var y = 0; y < 7; y++) for (var x = 0; x < 7; x++) {
    var on = (x === 0 || x === 6 || y === 0 || y === 6) || (x >= 2 && x <= 4 && y >= 2 && y <= 4); grid[(y0 + y) * N + x0 + x] = on ? 2 : -1; } }
  for (var i = 0; i < N * N; i++) grid[i] = r() < 0.5 ? 1 : 0;
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  for (i = 0; i < 8; i++) { grid[7 * N + i] = -1; grid[i * N + 7] = -1; grid[7 * N + N - 1 - i] = -1; grid[i * N + N - 8] = -1; grid[(N - 8) * N + i] = -1; grid[(N - 1 - i) * N + 7] = -1; }
  for (i = 8; i < N - 8; i++) { grid[6 * N + i] = i % 2 ? 0 : 1; grid[i * N + 6] = i % 2 ? 0 : 1; }
  var mods = []; for (i = 0; i < N * N; i++) if (grid[i] > 0) mods.push(i);
  var qr = new T.Group(); qr.position.set(-5, 0, 0); S.add(qr);
  var half = N * U / 2;
  var plateG = new T.BoxGeometry(N * U + 1.4, 0.35, N * U + 1.4);
  var plate = new T.Mesh(plateG, new T.MeshLambertMaterial({ color: 0x0d1d2c })); plate.position.y = -0.18; qr.add(plate);
  var pe = c.edges(plateG, c.CYAN, 0.7); pe.position.y = -0.18; qr.add(pe);
  var box = new T.BoxGeometry(U * 0.92, 1, U * 0.92); box.translate(0, 0.5, 0);
  var im = new T.InstancedMesh(box, new T.MeshLambertMaterial({ color: 0xffffff }), mods.length);
  var dummy = new T.Object3D(), cols = [], baseCol = new T.Color(0x7dd3fc), hot = new T.Color(0xffffff), tmp = new T.Color();
  mods.forEach(function (idx, k) {
    var x = idx % N, y = Math.floor(idx / N), hgt = grid[idx] === 2 ? 0.75 : 0.5;
    dummy.position.set(-half + U / 2 + x * U, 0, -half + U / 2 + y * U); dummy.scale.set(1, hgt, 1); dummy.updateMatrix();
    im.setMatrixAt(k, dummy.matrix); im.setColorAt(k, baseCol); cols.push(dummy.position.x);
  });
  qr.add(im);
  var laser = new T.Group(); qr.add(laser);
  laser.add(new T.Mesh(new T.PlaneGeometry(N * U + 2, 5), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.16, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })));
  laser.children[0].rotation.y = Math.PI / 2; laser.children[0].position.y = 2.5;
  laser.add(c.line([new T.Vector3(0, 0.95, -half - 1), new T.Vector3(0, 0.95, half + 1)], 0xecfeff, 1, true));
  var lg = c.glow(c.CYAN, 3, 0.6); lg.position.set(0, 5, 0); laser.add(lg);
  /* sample bags */
  var prof = []; [[0, 0], [1.0, 0.05], [1.25, 0.6], [1.3, 1.6], [1.1, 2.4], [0.45, 2.9], [0.3, 3.15], [0.5, 3.5], [0, 3.55]].forEach(function (p) { prof.push(new T.Vector2(p[0], p[1])); });
  var bagG = new T.LatheGeometry(prof, 18);
  var bags = [[7.5, 0, 4.5, 'S-0412'], [10.5, 0, 0.5, 'S-0413'], [7.0, 0, -4, 'S-0414']].map(function (b) {
    var g = new T.Group(); g.position.set(b[0], b[1], b[2]);
    g.add(new T.Mesh(bagG, new T.MeshLambertMaterial({ color: 0xc4b189 })));
    var tag = new T.Mesh(new T.PlaneGeometry(0.8, 0.8), new T.MeshBasicMaterial({ color: 0xecfeff })); tag.position.set(0, 1.4, 1.32); g.add(tag);
    var l = c.label(b[3], { scale: 0.045, px: 15 }); l.position.set(0, 4.6, 0); g.add(l);
    S.add(g); return g;
  });
  /* core box */
  var cb = new T.Group(); cb.position.set(12.5, 0, 6); S.add(cb);
  var cbG = new T.BoxGeometry(4.2, 0.6, 2.6); var cbm = new T.Mesh(cbG, new T.MeshLambertMaterial({ color: 0x3b2f24 })); cbm.position.y = 0.3; cb.add(cbm);
  var cbe = c.edges(cbG, c.CYAN, 0.6); cbe.position.y = 0.3; cb.add(cbe);
  for (i = 0; i < 3; i++) { var cy = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 3.8, 12), new T.MeshLambertMaterial({ color: [0x7a8b74, 0x4a5d72, 0x5a6e5c][i] }));
    cy.rotation.z = Math.PI / 2; cy.position.set(0, 0.65, -0.8 + i * 0.8); cb.add(cy); }
  /* lab panel */
  var lab = c.label('LAB · Au 1.24 g/t', { scale: 0.055, px: 17 }); lab.position.set(5, 9.5, -6); S.add(lab);
  var labDot = c.glow(0xecfeff, 2.5, 1); labDot.position.set(5, 8.5, -6); S.add(labDot);
  var from = new T.Vector3(-5, 1.6, 0), links = [];
  bags.concat([cb]).forEach(function (b) {
    var to = b.position.clone().add(new T.Vector3(0, 2.2, 0));
    var mid = from.clone().lerp(to, 0.5); mid.y += 5;
    links.push(new T.QuadraticBezierCurve3(from, mid, to));
  });
  links.push(new T.QuadraticBezierCurve3(bags[1].position.clone().add(new T.Vector3(0, 3.6, 0)), new T.Vector3(9, 10, -3), labDot.position.clone()));
  var runners = links.map(function (cv) {
    S.add(c.line(cv.getPoints(40), c.CYAN, 0.45, true));
    var g = c.glow(0xffffff, 1.2, 1); S.add(g); return g;
  });
  var base = new T.GridHelper(70, 35, 0x163044, 0x0e1a28); base.position.y = -0.4;
  base.material.transparent = true; base.material.opacity = 0.3; S.add(base);

  c.orbit.target.set(2.5, 1.8, 0.5); c.orbit.radius = 27; c.orbit.elev = 22; c.orbit.yaw = 1.2;
  c.orbit.sway = 0.3; c.orbit.swaySpeed = 0.3; c.orbit.tiltYaw = 0.35; c.orbit.tiltElev = 8;
  return {
    stillTime: 2.2,
    update: function (t) {
      var u = (t * 0.32) % 1, lx = -half - 0.6 + u * (N * U + 1.2);
      laser.position.x = lx;
      for (var k = 0; k < mods.length; k++) {
        var d = cols[k] - lx, f = d < 0 ? Math.exp(d / 1.6) : Math.exp(-d * 3);
        im.setColorAt(k, tmp.copy(baseCol).lerp(hot, Math.min(1, f)));
      }
      im.instanceColor.needsUpdate = true;
      links.forEach(function (cv, i) { var v = (t * 0.45 + i * 0.21) % 1; runners[i].position.copy(cv.getPoint(v)); runners[i].material.opacity = Math.sin(v * Math.PI); });
      labDot.scale.setScalar(2 + 0.6 * Math.sin(t * 3));
    }
  };
});
