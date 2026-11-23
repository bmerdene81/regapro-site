/* Найдвартай хадгалалт — stacked database inside a rotating geodesic shield, with data
   packets on tilted orbits and remote access nodes linking in. */
window.RegaPro3D && RegaPro3D.register('hadgalalt', function (c) {
  var T = c.THREE, S = c.scene;
  var db = new T.Group(); S.add(db);
  for (var i = 0; i < 3; i++) {
    var y = -2.7 + i * 2.7, g = new T.CylinderGeometry(3.1, 3.1, 2.1, 40, 1);
    var m = new T.Mesh(g, new T.MeshLambertMaterial({ color: 0x12324a, transparent: true, opacity: 0.92 })); m.position.y = y; db.add(m);
    [1.05, -1.05].forEach(function (o) {
      var ring = new T.Mesh(new T.TorusGeometry(3.12, 0.06, 6, 64), new T.MeshBasicMaterial({ color: c.CYAN }));
      ring.rotation.x = Math.PI / 2; ring.position.y = y + o; db.add(ring);
    });
    var band = new T.Mesh(new T.CylinderGeometry(3.16, 3.16, 0.22, 40, 1, true), new T.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
    band.position.y = y; db.add(band);
    for (var k = 0; k < 3; k++) { var a = Math.PI / 2 - 0.5 + k * 0.28, led = c.glow(k === 2 ? 0x6cc04a : c.CYAN, 0.7, 1);
      led.position.set(Math.cos(a) * 3.2, y + 0.55, Math.sin(a) * 3.2); db.add(led); }
  }
  var topCap = new T.Mesh(new T.CircleGeometry(3.1, 40), new T.MeshBasicMaterial({ color: 0x1b4865 })); topCap.rotation.x = -Math.PI / 2; topCap.position.y = 4.06; db.add(topCap);
  /* lock on top */
  var lock = new T.Group(); lock.position.set(0, 5.5, 0); S.add(lock);
  var lb = new T.BoxGeometry(1.9, 1.5, 0.55); lock.add(new T.Mesh(lb, new T.MeshLambertMaterial({ color: 0x0e4a6e }))); lock.add(c.edges(lb, 0xecfeff, 1));
  var sh = new T.Mesh(new T.TorusGeometry(0.62, 0.13, 8, 24, Math.PI), new T.MeshBasicMaterial({ color: c.CYAN })); sh.position.y = 0.75; lock.add(sh);
  var kh = c.glow(0xecfeff, 0.8, 1); kh.position.z = 0.3; lock.add(kh);
  /* shield */
  var shield = new T.Group(); S.add(shield);
  var ico = new T.IcosahedronGeometry(8.6, 2);
  shield.add(c.edges(ico, c.CYAN, 0.32, 1));
  shield.add(new T.Mesh(new T.SphereGeometry(8.55, 32, 20), new T.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.06, depthWrite: false, side: T.BackSide })));
  var vp = new T.BufferGeometry(); vp.setAttribute('position', ico.getAttribute('position'));
  shield.add(new T.Points(vp, new T.PointsMaterial({ color: 0xbae6fd, size: 0.18, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false })));
  var halo = c.glow(c.CYAN, 26, 0.12); S.add(halo);
  /* orbits */
  var orbits = [[11, 0.35, 0.2], [12, -0.5, 1.4], [10.4, 1.2, 2.6]].map(function (o, i) {
    var g = new T.Group(); g.rotation.set(o[1], o[2], 0); S.add(g);
    var pts = []; for (var k = 0; k <= 90; k++) { var a = k / 90 * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * o[0], 0, Math.sin(a) * o[0])); }
    g.add(c.line(pts, 0x7dd3fc, 0.28, true));
    var pk = [];
    for (k = 0; k < 3; k++) {
      var p = new T.Mesh(new T.BoxGeometry(0.55, 0.55, 0.55), new T.MeshBasicMaterial({ color: 0xecfeff }));
      var pg = c.glow(c.CYAN, 2, 0.9); p.add(pg); g.add(p); pk.push(p);
    }
    return { g: g, r: o[0], pk: pk, sp: 0.5 + i * 0.12 };
  });
  /* access nodes */
  var nodes = [new T.Vector3(-16, 5, -4), new T.Vector3(15, -3, 3), new T.Vector3(4, -6, 15)].map(function (p, i) {
    var n = new T.Group(); n.position.copy(p); S.add(n);
    var sc = new T.BoxGeometry(1.8, 1.2, 0.12); n.add(new T.Mesh(sc, new T.MeshBasicMaterial({ color: 0x0e2a40 }))); n.add(c.edges(sc, c.CYAN, 0.9));
    n.add(c.glow(c.CYAN, 2.6, 0.5));
    var to = p.clone().normalize().multiplyScalar(8.6);
    S.add(c.line([p.clone(), to], c.CYAN, 0.35, true));
    var run = c.glow(0xffffff, 1, 1); S.add(run);
    return { from: p, to: to, run: run };
  });

  c.orbit.target.set(0, 0.5, 0); c.orbit.radius = 33; c.orbit.elev = 9; c.orbit.yaw = 1.1; c.orbit.speed = 0.1;
  c.orbit.tiltYaw = 0.4; c.orbit.tiltElev = 9;
  return {
    stillTime: 2,
    update: function (t) {
      shield.rotation.y = t * 0.18; shield.rotation.x = Math.sin(t * 0.3) * 0.15;
      orbits.forEach(function (o, i) { o.pk.forEach(function (p, k) { var a = t * o.sp + k * Math.PI * 2 / 3 + i; p.position.set(Math.cos(a) * o.r, 0, Math.sin(a) * o.r); p.rotation.set(t, t * 1.3, 0); }); });
      nodes.forEach(function (n, i) { var u = (t * 0.5 + i * 0.33) % 1; n.run.position.lerpVectors(n.from, n.to, u); n.run.material.opacity = Math.sin(u * Math.PI); });
      halo.material.opacity = 0.1 + 0.04 * Math.sin(t * 1.5);
      lock.rotation.y = Math.sin(t * 0.8) * 0.4;
    }
  };
});
