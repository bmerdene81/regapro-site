/* Геотехникийн лог — core tray with broken core fragments, fracture rings,
   RQD bars glowing beside each row and a scanning line. */
window.RegaPro3D && RegaPro3D.register('geotekhnikiin-log', function (c) {
  var T = c.THREE, S = c.scene;
  var ROWS = 5, L = 24, R = 0.78, GAP = 2.3, X0 = -L / 2;
  var r = c.rng(7);
  var colors = [0x7a8b74, 0x8f8a78, 0x5a6e5c, 0x4a5d72, 0x6b7a8c];
  var trayW = L + 1.6, trayD = ROWS * GAP + 0.6;
  var tray = new T.Mesh(new T.BoxGeometry(trayW, 0.2, trayD), new T.MeshLambertMaterial({ color: 0x10202e }));
  tray.position.y = -R - 0.1; S.add(tray);
  var frame = c.edges(new T.BoxGeometry(trayW, 1.5, trayD), c.CYAN, 0.55); frame.position.y = -0.2; S.add(frame);
  var cyl = new T.CylinderGeometry(R, R, 1, 18, 1);
  var bars = [], rqds = [];
  var rowFrac = [0.9, 0.5, 0.75, 0.22, 0.82];
  for (var k = 0; k < ROWS; k++) {
    var z = -trayD / 2 + 0.3 + GAP / 2 + k * GAP;
    if (k) { var div = c.line([new T.Vector3(X0 - 0.8, -0.2, z - GAP / 2), new T.Vector3(X0 + L + 0.8, -0.2, z - GAP / 2)], c.CYAN, 0.3); S.add(div); }
    var x = X0, good = 0, total = 0;
    var mat = new T.MeshLambertMaterial({ color: colors[k] });
    var rubble = new T.MeshLambertMaterial({ color: 0xb08a64 });
    while (x < X0 + L - 0.3) {
      var intact = r() < rowFrac[k];
      var len = intact ? 1.2 + r() * 2.6 : 0.3 + r() * 0.5;
      len = Math.min(len, X0 + L - x);
      var m = new T.Mesh(cyl, intact ? mat : rubble);
      m.scale.y = len - 0.2; m.rotation.z = Math.PI / 2;
      m.position.set(x + len / 2, intact ? 0 : -0.12, z + (intact ? 0 : (r() - 0.5) * 0.3));
      if (!intact) m.rotation.x = (r() - 0.5) * 0.5;
      S.add(m);
      total += len; if (len >= 1.0) good += len;
      x += len;
      if (x < X0 + L - 0.3) {
        var pts = [], tilt = (r() - 0.5) * 1.1;
        for (var i = 0; i <= 28; i++) { var a = i / 28 * Math.PI * 2; pts.push(new T.Vector3(0, Math.sin(a) * (R + 0.05), Math.cos(a) * (R + 0.05))); }
        var ring = c.line(pts, intact ? 0x7dd3fc : 0xfbbf24, intact ? 0.9 : 0.8);
        ring.position.set(x, 0, z); ring.rotation.z = tilt; S.add(ring);
      }
    }
    var rqd = good / total; rqds.push(rqd);
    var bh = 0.4 + rqd * 7.5;
    var col = c.elevColor(rqd);
    if (rqd < 0.5) col = new T.Color(0xf59e0b);
    var bar = new T.Mesh(new T.BoxGeometry(1.4, 1, 1.4), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
    var be = c.edges(new T.BoxGeometry(1.4, 1, 1.4), col, 0.95);
    var g = new T.Group(); g.add(bar); g.add(be);
    g.position.set(-6 + k * 3, -R, -trayD / 2 - 2.6); S.add(g);
    var lab = c.label(Math.round(rqd * 100) + '%', { scale: 0.045, px: 16 });
    S.add(lab);
    bars.push({ g: g, h: bh, lab: lab, z: -trayD / 2 - 2.6 });
  }
  var bz = -trayD / 2 - 2.6;
  S.add(c.line([new T.Vector3(-8, -R, bz), new T.Vector3(8, -R, bz)], 0x7dd3fc, 0.6));
  S.add(c.line([new T.Vector3(-8, -R, bz), new T.Vector3(-8, -R + 8.2, bz)], 0x7dd3fc, 0.6));
  var ttl = c.label('RQD %', { scale: 0.05, px: 16 }); ttl.position.set(-10.2, -R + 8.2, bz); S.add(ttl);
  var bpan = new T.Mesh(new T.PlaneGeometry(17, 9), new T.MeshBasicMaterial({ color: 0x0e2a40, transparent: true, opacity: 0.35, depthWrite: false, side: T.DoubleSide }));
  bpan.position.set(0, -R + 4.3, bz - 0.8); S.add(bpan); var bpe = c.edges(new T.PlaneGeometry(17, 9), c.CYAN, 0.4); bpe.position.copy(bpan.position); S.add(bpe);
  /* scanning line */
  var scan = new T.Mesh(new T.PlaneGeometry(0.25, trayD), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
  scan.rotation.x = -Math.PI / 2; scan.position.y = R + 0.15; S.add(scan);
  var sg = c.glow(c.CYAN, 3, 0.5); S.add(sg);
  var grid = new T.GridHelper(60, 30, 0x163044, 0x0e1a28); grid.position.y = -R - 0.25;
  grid.material.transparent = true; grid.material.opacity = 0.3; S.add(grid);

  c.orbit.target.set(0.5, 1.8, -2); c.orbit.radius = 31; c.orbit.elev = 17; c.orbit.yaw = Math.PI / 2 + 0.22;
  c.orbit.sway = 0.25; c.orbit.swaySpeed = 0.3; c.orbit.tiltYaw = 0.35; c.orbit.tiltElev = 8;
  return {
    stillTime: 3,
    update: function (t) {
      var cyc = t % 8;
      bars.forEach(function (b, i) {
        var e = c.smooth(0.2 + i * 0.25, 1.4 + i * 0.25, cyc) * (1 - c.smooth(7.3, 7.9, cyc));
        var h = Math.max(0.02, b.h * e);
        b.g.scale.y = h; b.g.position.y = -R + h / 2;
        b.lab.position.set(b.g.position.x, -R + h + 0.9, b.z);
        b.lab.material.opacity = e;
      });
      var sx = X0 + ((t * 0.32) % 1) * L;
      scan.position.x = sx; sg.position.set(sx, R + 0.3, 0);
    }
  };
});
