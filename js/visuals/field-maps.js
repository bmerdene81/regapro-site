/* Field Maps апп — V2 terrain; GPS pins drop in, a polygon and a traverse line are traced,
   and a sync pulse rises to a satellite. */
window.RegaPro3D && RegaPro3D.register('field-maps', function (c) {
  var T = c.THREE, S = c.scene, SIZE = 64;
  var ter = c.terrain({ size: SIZE, grid: 72, levels: 14, pointSize: 0.45 });
  S.add(ter.group);
  var H = function (x, z) { return ter.height(x, z); };
  var base = new T.GridHelper(SIZE * 1.15, 23, 0x163044, 0x0e1a28); base.position.y = ter.minH - 4;
  base.material.transparent = true; base.material.opacity = 0.28; S.add(base);
  var pinGeo = new T.ConeGeometry(0.55, 1.8, 14); pinGeo.rotateX(Math.PI); pinGeo.translate(0, 0.9, 0);
  var pins = [], spots = [[-16, -6], [-6, 10], [6, -12], [15, 6], [-2, -2], [20, -10], [-20, 12]];
  spots.forEach(function (s, i) {
    var g = new T.Group(), y = H(s[0], s[1]);
    var cone = new T.Mesh(pinGeo, new T.MeshLambertMaterial({ color: i % 3 === 2 ? 0xfbbf24 : 0x38bdf8 }));
    var head = new T.Mesh(new T.SphereGeometry(0.75, 14, 10), new T.MeshLambertMaterial({ color: 0xecfeff }));
    head.position.y = 2.2; g.add(cone); g.add(head);
    var gl = c.glow(c.CYAN, 3, 0.6); gl.position.y = 2.2; g.add(gl);
    g.position.set(s[0], y, s[1]); g.userData.k = 1.5; S.add(g);
    var ring = new T.Mesh(new T.RingGeometry(0.6, 0.85, 32), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(s[0], y + 0.15, s[1]); S.add(ring);
    pins.push({ g: g, y: y, ring: ring, t0: 0.15 + i * 0.32 });
  });
  function trace(verts, closed, seg) {
    var pts = [], vv = closed ? verts.concat([verts[0]]) : verts;
    for (var i = 0; i < vv.length - 1; i++) for (var k = 0; k < seg; k++) {
      var u = k / seg, x = c.lerp(vv[i][0], vv[i + 1][0], u), z = c.lerp(vv[i][1], vv[i + 1][1], u);
      pts.push(new T.Vector3(x, H(x, z) + 0.35, z));
    }
    var last = vv[vv.length - 1]; pts.push(new T.Vector3(last[0], H(last[0], last[1]) + 0.35, last[1]));
    return pts;
  }
  var polyV = [[-12, -16], [2, -20], [12, -14], [8, -3], [-6, -4]];
  var polyPts = trace(polyV, true, 18), poly = c.line(polyPts, 0xa7f3d0, 1, true); S.add(poly);
  var polyFill = (function () {
    var pos = [], cx = 0, cz = 0; polyV.forEach(function (v) { cx += v[0]; cz += v[1]; }); cx /= polyV.length; cz /= polyV.length;
    for (var i = 0; i < polyPts.length - 1; i++) {
      var a = polyPts[i], b = polyPts[i + 1];
      pos.push(cx, H(cx, cz) + 0.3, cz, a.x, a.y - 0.05, a.z, b.x, b.y - 0.05, b.z);
    }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    var m = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
    S.add(m); return m;
  })();
  var linePts = trace([[-24, 4], [-14, 8], [-4, 14], [8, 16], [18, 20]], false, 16), trav = c.line(linePts, 0xfde68a, 1, true); S.add(trav);
  var pen = c.glow(0xffffff, 2, 1); S.add(pen);
  var area = c.label({ mn: 'Талбай 2.4 га', en: 'Area 2.4 ha' }, { scale: 0.08 }); area.position.set(2, H(2, -11) + 4, -11); S.add(area);
  /* satellite + sync pulses */
  var sat = new T.Group(); sat.position.set(-12, 24, 12); S.add(sat);
  var body = new T.BoxGeometry(1.6, 1.6, 2.2);
  sat.add(new T.Mesh(body, new T.MeshLambertMaterial({ color: 0x1e3a5f }))); sat.add(c.edges(body, c.CYAN, 1));
  [-1, 1].forEach(function (sd) {
    var pg = new T.PlaneGeometry(3.6, 1.4, 4, 1), p = new T.Mesh(pg, new T.MeshBasicMaterial({ color: 0x0e4a6e, side: T.DoubleSide, transparent: true, opacity: 0.85 }));
    p.position.x = sd * 2.7; sat.add(p); var e = new T.LineSegments(new T.WireframeGeometry(pg), new T.LineBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.8 })); e.position.x = sd * 2.7; sat.add(e);
  });
  var satGlow = c.glow(c.CYAN, 7, 0.4); sat.add(satGlow);
  var src = new T.Vector3(-6, H(-6, 10) + 3.5, 10);
  S.add(c.line([src, sat.position.clone()], c.CYAN, 0.25, true));
  var pulses = [];
  for (var i = 0; i < 3; i++) {
    var pr = new T.Mesh(new T.TorusGeometry(1.2, 0.08, 6, 36), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
    S.add(pr); pulses.push(pr);
  }
  var sl = c.label('SYNC', { scale: 0.06 }); sl.position.set(-12, 27.4, 12); S.add(sl);

  c.orbit.target.set(0, 6, 0); c.orbit.radius = 76; c.orbit.elev = 40; c.orbit.yaw = 0.95; c.orbit.sway = 0.35; c.orbit.swaySpeed = 0.25;
  c.orbit.tiltYaw = 0.4; c.orbit.tiltElev = 12;
  return {
    stillTime: 4.2,
    update: function (t) {
      var cyc = t % 9, out = 1 - c.smooth(8.3, 8.9, cyc);
      pins.forEach(function (p) {
        var u = c.clamp((cyc - p.t0) / 0.7, 0, 1), bounce = u < 1 ? (1 - u * u) * 14 : 0;
        var land = u >= 1 ? Math.max(0, Math.sin((cyc - p.t0 - 0.7) * 14) * 0.6 * Math.exp(-(cyc - p.t0 - 0.7) * 6)) : 0;
        p.g.position.y = p.y + bounce + land; p.g.visible = cyc > p.t0 && out > 0.02;
        p.g.scale.setScalar(1.5 * Math.max(0.01, out));
        var rr = c.clamp((cyc - p.t0 - 0.7) / 1.0, 0, 1);
        p.ring.scale.setScalar(1 + rr * 4); p.ring.material.opacity = (rr > 0 && rr < 1) ? (1 - rr) * 0.9 : 0;
      });
      var pu = c.smooth(1.2, 3.6, cyc), n = Math.max(2, Math.floor(polyPts.length * pu));
      poly.geometry.setDrawRange(0, n); poly.material.opacity = out;
      polyFill.material.opacity = c.smooth(3.4, 4.2, cyc) * 0.22 * out;
      area.material.opacity = c.smooth(3.6, 4.2, cyc) * out;
      var lu = c.smooth(2.4, 4.6, cyc), ln = Math.max(2, Math.floor(linePts.length * lu));
      trav.geometry.setDrawRange(0, ln); trav.material.opacity = out;
      pen.position.copy(pu < 1 ? polyPts[n - 1] : linePts[ln - 1]); pen.material.opacity = (pu > 0 && lu < 1) ? 1 : 0;
      pulses.forEach(function (p, i) {
        var u = ((t * 0.5) + i / 3) % 1;
        p.position.lerpVectors(src, sat.position, u); p.rotation.x = Math.PI / 2;
        p.scale.setScalar(1.6 - u); p.material.opacity = Math.sin(u * Math.PI) * 0.9;
      });
      sat.rotation.y = t * 0.4; satGlow.material.opacity = 0.3 + 0.2 * Math.sin(t * 3);
    }
  };
});
