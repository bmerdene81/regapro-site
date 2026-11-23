/* Dashboard ба GIS — tilted contour map with glowing sites and routes; holographic
   bar chart, line chart and KPI ring floating above it. */
window.RegaPro3D && RegaPro3D.register('dashboard-gis', function (c) {
  var T = c.THREE, S = c.scene;
  var MW = 34, MD = 22;
  var map = new T.Group(); S.add(map);
  var ter = c.terrain({ size: 34, grid: 56, levels: 12, pointSize: 0.22,
    height: function (x, z) { return c.v2Height(x * 2.4, z * 2.4) * 0.06; },
    skip: function (x, z) { return Math.abs(z) > MD / 2; }, contourOpacity: 0.55 });
  map.add(ter.group);
  var plate = new T.Mesh(new T.PlaneGeometry(MW, MD), new T.MeshBasicMaterial({ color: 0x0b1b2b, transparent: true, opacity: 0.6, depthWrite: false }));
  plate.rotation.x = -Math.PI / 2; plate.position.y = -0.9; map.add(plate);
  var pe = c.edges(new T.BoxGeometry(MW, 0.01, MD), c.CYAN, 0.7); pe.position.y = -0.9; map.add(pe);
  var r = c.rng(5), sites = [];
  var cols = [c.CYAN, c.CYAN, 0xecfeff, 0xfbbf24];
  for (var i = 0; i < 14; i++) {
    var x = (r() - 0.5) * (MW - 4), z = (r() - 0.5) * (MD - 4);
    var p = new T.Vector3(x, 0.3, z), col = cols[i % 4];
    var g = c.glow(col, 1.6, 0.95); g.position.copy(p); map.add(g);
    var dot = new T.Mesh(new T.SphereGeometry(0.16, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff })); dot.position.copy(p); map.add(dot);
    sites.push({ p: p, g: g, ph: r() * 6 });
  }
  var route = [0, 4, 9, 2, 11, 6, 13].map(function (k) { return sites[k].p; });
  map.add(c.line(route, 0x7dd3fc, 0.9, true));
  var area = [sites[1].p, sites[5].p, sites[8].p, sites[12].p, sites[1].p].map(function (v) { return v.clone().setY(0.25); });
  map.add(c.line(area, 0xa7f3d0, 0.7, true));
  var runner = c.glow(0xffffff, 1.4, 1); map.add(runner);
  var curve = new T.CatmullRomCurve3(route, false, 'catmullrom', 0);

  function panel(w, h, x, y, z) {
    var g = new T.Group();
    g.add(new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: 0x0e2a40, transparent: true, opacity: 0.45, depthWrite: false, side: T.DoubleSide })));
    var e = c.edges(new T.PlaneGeometry(w, h), c.CYAN, 0.75); g.add(e);
    g.position.set(x, y, z); g.userData.y0 = y; S.add(g); return g;
  }
  /* bar chart */
  var bp = panel(10, 6.4, -9, 9.5, -5), bars = [];
  var vals = [0.45, 0.7, 0.55, 0.9, 0.65, 0.8];
  vals.forEach(function (v, k) {
    var m = new T.Mesh(new T.BoxGeometry(1, 1, 0.5), new T.MeshBasicMaterial({ color: c.elevColor(0.35 + v * 0.6), transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false }));
    m.position.set(-3.75 + k * 1.5, 0, 0.3); bp.add(m); bars.push({ m: m, v: v });
  });
  /* line chart */
  var lp = panel(10, 6.4, 8.5, 11, -6), lpts = [];
  for (var k = 0; k <= 30; k++) { var u = k / 30; lpts.push(new T.Vector3(-4.4 + u * 8.8, -2.4 + u * 3.2 + Math.sin(u * 9) * 0.7 + c.fbm(u * 6, 1, 3) * 1.1, 0.2)); }
  var lline = c.line(lpts, 0xecfeff, 1, true); lp.add(lline);
  var lhead = c.glow(c.CYAN, 1.3, 1); lp.add(lhead);
  /* KPI ring */
  var kpi = new T.Group(); kpi.position.set(13.5, 4.5, 6); kpi.userData.y0 = 4.5; S.add(kpi);
  kpi.add(new T.Mesh(new T.RingGeometry(1.9, 2.3, 64), new T.MeshBasicMaterial({ color: 0x1e3a5f, side: T.DoubleSide, transparent: true, opacity: 0.8 })));
  var arcGeo = new T.RingGeometry(1.85, 2.35, 96, 1, Math.PI / 2, -Math.PI * 2);
  var arc = new T.Mesh(arcGeo, new T.MeshBasicMaterial({ color: c.CYAN, side: T.DoubleSide, transparent: true, opacity: 0.95, blending: T.AdditiveBlending }));
  kpi.add(arc);
  var kl = c.label('78%', { plain: true, px: 22, scale: 0.06, color: '#ecfeff' }); kpi.add(kl);
  var kg = c.glow(c.CYAN, 7, 0.25); kpi.add(kg);
  /* beams from map to charts */
  [[sites[3].p, bp.position], [sites[10].p, lp.position], [sites[7].p, kpi.position]].forEach(function (b) {
    S.add(c.line([b[0].clone(), new T.Vector3(b[1].x, b[1].y - 3.2, b[1].z)], c.CYAN, 0.35, true));
  });
  var tl = c.label('ArcGIS Dashboard', { scale: 0.05, px: 16 }); tl.position.set(-9, 13.6, -5); S.add(tl);

  c.orbit.target.set(1, 5.2, 0); c.orbit.radius = 36; c.orbit.elev = 19; c.orbit.yaw = Math.PI / 2 - 0.25;
  c.orbit.sway = 0.3; c.orbit.swaySpeed = 0.3; c.orbit.tiltYaw = 0.35; c.orbit.tiltElev = 8;
  var idxCount = arcGeo.index.count;
  return {
    stillTime: 3,
    update: function (t) {
      var cyc = t % 8, grow = c.smooth(0.1, 2.2, cyc) * (1 - c.smooth(7.4, 7.95, cyc));
      bars.forEach(function (b, k) {
        var h = Math.max(0.02, (b.v * 5.2) * c.smooth(0.1 + k * 0.15, 1.6 + k * 0.15, cyc) * (1 - c.smooth(7.4, 7.95, cyc)) * (0.94 + 0.06 * Math.sin(t * 2 + k)));
        b.m.scale.y = h; b.m.position.y = -2.9 + h / 2;
      });
      var n = Math.max(2, Math.round(31 * grow)); lline.geometry.setDrawRange(0, n); lhead.position.copy(lpts[n - 1]);
      var frac = 0.78 * grow; arcGeo.setDrawRange(0, Math.floor(idxCount * frac / 6) * 6);
      kl.material.opacity = grow;
      var u = (t * 0.12) % 1; runner.position.copy(curve.getPointAt(u)).setY(0.45);
      sites.forEach(function (s) { s.g.scale.setScalar(1.3 + 0.45 * Math.sin(t * 2.4 + s.ph)); });
      [bp, lp, kpi].forEach(function (o, k) { o.position.y = o.userData.y0 + Math.sin(t * 1.2 + k * 2) * 0.25; });
      kpi.lookAt(c.camera.position);
    }
  };
});
