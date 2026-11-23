/* Автоматжуулалт — meshing wireframe gears; data particles flow from Python / Excel /
   SharePoint sources through the gears into a stack of finished reports. */
window.RegaPro3D && RegaPro3D.register('avtomatjuulalt', function (c) {
  var T = c.THREE, S = c.scene, M = 0.62;
  function gearGeo(teeth, holeR) {
    var rp = teeth * M / 2, ro = rp + M * 0.9, ri = rp - M * 1.1, sh = new T.Shape();
    for (var i = 0; i < teeth; i++) {
      var a0 = i / teeth * Math.PI * 2, da = Math.PI * 2 / teeth;
      var pts = [[ri, a0], [ri, a0 + da * 0.12], [ro, a0 + da * 0.3], [ro, a0 + da * 0.55], [ri, a0 + da * 0.73], [ri, a0 + da]];
      pts.forEach(function (p, k) { var x = Math.cos(p[1]) * p[0], y = Math.sin(p[1]) * p[0]; if (i === 0 && k === 0) sh.moveTo(x, y); else sh.lineTo(x, y); });
    }
    var hole = new T.Path(); hole.absarc(0, 0, holeR, 0, Math.PI * 2, true); sh.holes.push(hole);
    for (var s = 0; s < 5; s++) { var a = s / 5 * Math.PI * 2, h = new T.Path(), rr = (holeR + ri) / 2, hr = (ri - holeR) * 0.28;
      h.absarc(Math.cos(a) * rr, Math.sin(a) * rr, hr, 0, Math.PI * 2, true); sh.holes.push(h); }
    var g = new T.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -0.35); return { geo: g, rp: rp };
  }
  function gear(teeth, holeR, color) {
    var d = gearGeo(teeth, holeR), g = new T.Group();
    g.add(new T.Mesh(d.geo, new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.16, depthWrite: false })));
    g.add(c.edges(d.geo, color, 0.95, 25));
    S.add(g); return { g: g, rp: d.rp, n: teeth };
  }
  var A = gear(16, 1.1, c.CYAN), B = gear(10, 0.7, 0x7dd3fc), C = gear(8, 0.55, 0xa5f3fc);
  A.g.position.set(-1.5, 0.6, 0);
  var dAB = A.rp + B.rp, aAB = -0.55; B.g.position.set(A.g.position.x + Math.cos(aAB) * dAB, A.g.position.y + Math.sin(aAB) * dAB, 0);
  var dBC = B.rp + C.rp, aBC = 0.75; C.g.position.set(B.g.position.x + Math.cos(aBC) * dBC, B.g.position.y + Math.sin(aBC) * dBC, 0);
  var hub = c.glow(c.CYAN, 5, 0.4); hub.position.copy(A.g.position); S.add(hub);

  /* sources */
  var srcs = [['Python', new T.Vector3(-15, 5.5, -1)], ['Excel', new T.Vector3(-16, 0.5, 0)], ['SharePoint', new T.Vector3(-15, -4.5, 1)]];
  var curves = [];
  srcs.forEach(function (s, k) {
    var box = new T.Group(); box.position.copy(s[1]);
    var bg = new T.BoxGeometry(2.2, 1.6, 0.3);
    box.add(new T.Mesh(bg, new T.MeshBasicMaterial({ color: 0x0e2a40, transparent: true, opacity: 0.7 })));
    box.add(c.edges(bg, c.CYAN, 0.9));
    for (var i = 0; i < 3; i++) box.add(c.line([new T.Vector3(-0.7, 0.4 - i * 0.35, 0.2), new T.Vector3(0.7 - i * 0.25, 0.4 - i * 0.35, 0.2)], 0x7dd3fc, 0.8));
    S.add(box);
    var l = c.label(s[0], { scale: 0.045, px: 16 }); l.position.set(s[1].x, s[1].y + 1.7, s[1].z); S.add(l);
    curves.push(new T.CatmullRomCurve3([s[1].clone().add(new T.Vector3(1.2, 0, 0)), new T.Vector3(-9, s[1].y * 0.5, 0.5), new T.Vector3(-6.5, 0.8, 0.6), A.g.position.clone().setZ(0.6)]));
  });
  /* reports */
  var rep = new T.Group(); rep.position.set(16.5, 0, 0); S.add(rep);
  var pages = [];
  for (var i = 0; i < 5; i++) {
    var pg = new T.Group(), pgeo = new T.BoxGeometry(3.4, 4.4, 0.08);
    pg.add(new T.Mesh(pgeo, new T.MeshBasicMaterial({ color: 0x0f2638, transparent: true, opacity: 0.85 })));
    pg.add(c.edges(pgeo, i === 4 ? 0xecfeff : c.CYAN, i === 4 ? 1 : 0.55));
    if (i === 4) {
      for (var k = 0; k < 5; k++) pg.add(c.line([new T.Vector3(-1.2, 1.4 - k * 0.5, 0.06), new T.Vector3(1.2 - (k % 2) * 0.6, 1.4 - k * 0.5, 0.06)], 0x7dd3fc, 0.9));
      for (k = 0; k < 4; k++) { var bh = 0.3 + k * 0.25, b = new T.Mesh(new T.PlaneGeometry(0.35, bh), new T.MeshBasicMaterial({ color: c.CYAN }));
        b.position.set(-1.0 + k * 0.55, -1.6 + bh / 2, 0.06); pg.add(b); }
    }
    pg.position.set(i * 0.28, i * 0.14, -1.2 + i * 0.3); pg.rotation.y = -0.35; rep.add(pg); pages.push(pg);
  }
  var rl = c.label({ mn: 'Тайлан · PDF', en: 'Report · PDF' }, { scale: 0.045, px: 16 }); rl.position.set(17.1, 3.6, 0.5); S.add(rl);
  curves.push(new T.CatmullRomCurve3([C.g.position.clone().setZ(0.6), new T.Vector3(9.5, 1.5, 0.6), new T.Vector3(13, 0.4, 0.4), new T.Vector3(15.9, 0.3, 0.2)]));
  curves.forEach(function (cv) {
    S.add(new T.Mesh(new T.TubeGeometry(cv, 40, 0.07, 5, false), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.3, blending: T.AdditiveBlending, depthWrite: false })));
  });
  var parts = [], r = c.rng(3);
  for (i = 0; i < 36; i++) { var g = c.glow(i % 5 ? c.CYAN : 0xecfeff, 0.9, 1); S.add(g); parts.push({ g: g, cv: curves[i % 4], off: r() }); }

  c.orbit.target.set(0.5, 0.5, 0); c.orbit.radius = 36; c.orbit.elev = 7; c.orbit.yaw = Math.PI / 2;
  c.orbit.sway = 0.28; c.orbit.swaySpeed = 0.3; c.orbit.tiltYaw = 0.35; c.orbit.tiltElev = 8;
  function mesh(th1, n1, n2, a) {
    var d1 = Math.PI * 2 / n1, d2 = Math.PI * 2 / n2, f1 = (a - th1) / d1 - 0.425;
    return a + Math.PI - d2 * (0.925 - f1);
  }
  return {
    stillTime: 2.5,
    update: function (t) {
      var w = t * 0.6;
      A.g.rotation.z = w;
      B.g.rotation.z = mesh(w, A.n, B.n, aAB);
      C.g.rotation.z = mesh(B.g.rotation.z, B.n, C.n, aBC);
      parts.forEach(function (p) { var u = (t * 0.28 + p.off) % 1; p.g.position.copy(p.cv.getPointAt(u)); p.g.material.opacity = Math.sin(u * Math.PI); });
      var top = pages[4]; top.position.y = 0.56 + Math.sin(t * 1.5) * 0.12;
      hub.material.opacity = 0.3 + 0.15 * Math.sin(t * 3);
    }
  };
});
