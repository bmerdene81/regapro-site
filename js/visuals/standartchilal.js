/* Стандартчилал — irregular, mismatched data blocks self-organise into a clean,
   colour-coded table (HOLE_ID, FROM, TO, LITH, RQD, Au), get a QA/QC sweep, then scatter. */
window.RegaPro3D && RegaPro3D.register('standartchilal', function (c) {
  var T = c.THREE, S = c.scene, COLS = 6, ROWS = 7, CW = 2.9, CH = 1.15;
  var heads = ['HOLE_ID', 'FROM', 'TO', 'LITH', 'RQD', 'Au'];
  var r = c.rng(21), cells = [], messy = [0xf59e0b, 0xa78bfa, 0x94a3b8, 0xf472b6, 0x64748b, 0xfbbf24];
  var geo = new T.BoxGeometry(CW - 0.25, CH - 0.22, 0.5), egeo = new T.EdgesGeometry(geo);
  var W = COLS * CW, Hh = ROWS * CH;
  for (var j = 0; j < ROWS; j++) for (var i = 0; i < COLS; i++) {
    var hdr = j === 0;
    var mat = new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    var lm = new T.LineBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.9 });
    var g = new T.Group(); g.add(new T.Mesh(geo, mat)); g.add(new T.LineSegments(egeo, lm)); S.add(g);
    var dir = new T.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    var target = new T.Vector3(-W / 2 + CW / 2 + i * CW, Hh / 2 - CH / 2 - j * CH, 0);
    var final = hdr ? new T.Color(0x0e4a6e) : c.elevColor(0.08 + (i / (COLS - 1)) * 0.8).multiplyScalar(0.62);
    cells.push({ g: g, mat: mat, lm: lm, target: target, final: final, hdr: hdr,
      scat: dir.multiplyScalar(9 + r() * 7).add(new T.Vector3(0, 0, -2)),
      rot: new T.Euler(r() * 3, r() * 3, r() * 3), sc: new T.Vector3(0.5 + r() * 1.1, 0.5 + r() * 1.2, 0.6 + r() * 1.6),
      messy: new T.Color(messy[Math.floor(r() * messy.length)]).multiplyScalar(0.8), delay: (i + j) * 0.06 + r() * 0.25, ph: r() * 6 });
  }
  var labels = heads.map(function (h, i) {
    var l = c.label(h, { plain: true, px: 15, scale: 0.042, color: '#e0f6ff' });
    l.position.set(-W / 2 + CW / 2 + i * CW, Hh / 2 - CH / 2, 0.4); S.add(l); return l;
  });
  var frame = c.edges(new T.PlaneGeometry(W + 0.6, Hh + 0.6), c.CYAN, 0.6); S.add(frame);
  var scan = new T.Mesh(new T.PlaneGeometry(0.3, Hh + 1), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
  scan.position.z = 0.5; S.add(scan);
  var ok = c.label('QA/QC ✓', { scale: 0.05, px: 16, stroke: 'rgba(108,192,74,0.9)', color: '#d9f99d' });
  ok.position.set(0, -Hh / 2 - 1.6, 0.5); S.add(ok);
  var grid = new T.GridHelper(60, 30, 0x163044, 0x0e1a28); grid.position.y = -Hh / 2 - 3;
  grid.material.transparent = true; grid.material.opacity = 0.3; S.add(grid);
  var tmp = new T.Color(), q0 = new T.Quaternion(), q1 = new T.Quaternion();

  c.orbit.target.set(0, -0.3, 0); c.orbit.radius = 21; c.orbit.elev = 5; c.orbit.yaw = Math.PI / 2;
  c.orbit.sway = 0.3; c.orbit.swaySpeed = 0.35; c.orbit.tiltYaw = 0.35; c.orbit.tiltElev = 7;
  return {
    stillTime: 5.2,
    update: function (t) {
      var cyc = t % 8;
      var sx = c.smooth(3.1, 4.6, cyc);
      scan.position.x = -W / 2 + sx * W; scan.material.opacity = (sx > 0 && sx < 1) ? 0.8 : 0;
      cells.forEach(function (k) {
        var e = c.smooth(0.4 + k.delay, 1.9 + k.delay, cyc) * (1 - c.smooth(6.9 + k.delay * 0.5, 7.8, cyc));
        var drift = (1 - e) * 0.8;
        k.g.position.copy(k.scat).lerp(k.target, e);
        k.g.position.x += Math.sin(t * 0.9 + k.ph) * drift; k.g.position.y += Math.cos(t * 0.7 + k.ph) * drift;
        q0.setFromEuler(new T.Euler(k.rot.x + t * 0.3 * (1 - e), k.rot.y, k.rot.z)); q1.identity();
        k.g.quaternion.copy(q0).slerp(q1, e);
        k.g.scale.set(c.lerp(k.sc.x, 1, e), c.lerp(k.sc.y, 1, e), c.lerp(k.sc.z, 1, e));
        tmp.copy(k.messy).lerp(k.final, e);
        var flash = Math.exp(-Math.pow((k.g.position.x - scan.position.x) / 0.9, 2)) * (sx > 0 && sx < 1 ? 1 : 0);
        tmp.lerp(new T.Color(0xecfeff), flash * 0.6);
        k.mat.color.copy(tmp); k.lm.opacity = 0.35 + 0.6 * e;
      });
      var lo = c.smooth(1.9, 2.6, cyc) * (1 - c.smooth(6.6, 7.0, cyc));
      labels.forEach(function (l) { l.material.opacity = lo; });
      frame.material.opacity = 0.6 * lo;
      ok.material.opacity = c.smooth(4.4, 4.9, cyc) * (1 - c.smooth(6.6, 7.0, cyc));
    }
  };
});
