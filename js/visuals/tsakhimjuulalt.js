/* Хуучин өгөгдөл цахимжуулах — scattered paper/Excel sheets on the left flow along
   glowing cyan pipelines into a structured database and borehole-log stack on the right. */
window.RegaPro3D && RegaPro3D.register('tsakhimjuulalt', function (c) {
  var T = c.THREE, S = c.scene, r = c.rng(42);

  function sheetTexture(kind, seed) {
    var cv = document.createElement('canvas'); cv.width = 256; cv.height = 360;
    var g = cv.getContext('2d'), rr = c.rng(seed);
    if (kind === 'excel') {
      g.fillStyle = '#d7efe0'; g.fillRect(0, 0, 256, 360);
      g.fillStyle = '#217346'; g.fillRect(0, 0, 256, 44);
      g.fillStyle = '#e8fff2'; g.font = '700 22px Inter, "Noto Sans", sans-serif';
      g.textBaseline = 'middle'; g.fillText('Excel', 16, 22);
      g.fillStyle = '#cfe8d8';
      for (var y = 44; y < 360; y += 22) g.fillRect(0, y, 256, 1);
      for (var x = 0; x < 256; x += 42) g.fillRect(x, 44, 1, 316);
      g.fillStyle = '#1b5e3a';
      for (y = 56; y < 340; y += 22) {
        for (x = 8; x < 240; x += 42) {
          g.globalAlpha = 0.35 + rr() * 0.5;
          g.fillRect(x, y - 6, 26 + rr() * 8, 8);
        }
      }
      g.globalAlpha = 1;
    } else {
      g.fillStyle = kind === 'pdf' ? '#efe6d4' : '#f3ead4';
      g.fillRect(0, 0, 256, 360);
      g.fillStyle = kind === 'pdf' ? '#7a4a2a' : '#5b4630';
      g.fillRect(0, 0, 256, 40);
      g.fillStyle = '#f8f1e3';
      g.font = '700 20px Inter, "Noto Sans", sans-serif';
      g.textBaseline = 'middle';
      g.fillText(kind === 'pdf' ? 'PDF' : (kind === 'log' ? 'LOG' : 'PAPER'), 16, 20);
      g.strokeStyle = 'rgba(91,70,48,0.28)'; g.lineWidth = 2;
      for (y = 58; y < 340; y += 16) {
        g.beginPath(); g.moveTo(18, y); g.lineTo(180 + rr() * 50, y); g.stroke();
      }
      /* tiny color chips like lithology ticks */
      var cols = ['#D9C79B', '#A7B3A6', '#E8C766', '#2A2D2E', '#C98D5A', '#6F7F78'];
      for (y = 64; y < 330; y += 28) {
        g.fillStyle = cols[Math.floor(rr() * cols.length)];
        g.fillRect(18, y - 8, 14, 14);
      }
    }
    var tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter;
    return tex;
  }

  /* ----- floor grid (V2 accent) ----- */
  var grid = new T.GridHelper(64, 32, 0x163044, 0x0e1a28);
  grid.position.y = -6.2;
  grid.material.transparent = true; grid.material.opacity = 0.32;
  S.add(grid);
  var halo = c.glow(c.CYAN, 36, 0.1); halo.position.set(8, 1, 0); S.add(halo);

  /* ----- scattered source sheets (left) ----- */
  var kinds = ['log', 'excel', 'paper', 'pdf', 'log', 'excel', 'paper', 'pdf', 'log'];
  var sheets = [];
  var home = [
    [-16.5, 3.2, -3.4], [-14.2, 0.6, 2.8], [-17.4, -1.8, 1.2],
    [-13.6, 4.4, 1.6], [-15.8, 2.0, 4.6], [-18.2, 1.2, -1.4],
    [-13.0, -2.2, -2.6], [-16.8, 5.2, 0.2], [-14.8, -0.6, -4.6]
  ];
  for (var i = 0; i < home.length; i++) {
    var g = new T.Group();
    var geo = new T.PlaneGeometry(3.1, 4.3);
    var mat = new T.MeshLambertMaterial({ map: sheetTexture(kinds[i], 200 + i * 17), side: T.DoubleSide });
    var mesh = new T.Mesh(geo, mat);
    var frame = c.edges(new T.BoxGeometry(3.14, 4.34, 0.06), kinds[i] === 'excel' ? 0x6ee7b7 : 0xe8d5a8, 0.7);
    g.add(mesh); g.add(frame);
    var gl = c.glow(kinds[i] === 'excel' ? 0x34d399 : 0xf5d98a, 3.2, 0.28);
    gl.position.z = 0.2; g.add(gl);
    g.position.set(home[i][0], home[i][1], home[i][2]);
    g.rotation.set((r() - 0.5) * 0.7, (r() - 0.5) * 0.8, (r() - 0.5) * 0.5);
    S.add(g);
    sheets.push({ g: g, home: home[i].slice(), ph: r() * 6, spin: (r() - 0.5) * 0.25 });
  }

  /* ----- curved pipelines left -> right ----- */
  function curvePts(a, b, midY, midZ, n) {
    var pts = [];
    for (var k = 0; k <= n; k++) {
      var t = k / n, u = 1 - t;
      var x = u * u * a.x + 2 * u * t * ((a.x + b.x) / 2) + t * t * b.x;
      var y = u * u * a.y + 2 * u * t * midY + t * t * b.y;
      var z = u * u * a.z + 2 * u * t * midZ + t * t * b.z;
      pts.push(new T.Vector3(x, y, z));
    }
    return pts;
  }
  var sinks = [
    new T.Vector3(9.0, 2.2, 0.3),
    new T.Vector3(9.0, 0.15, 0.0),
    new T.Vector3(9.0, -2.1, -0.25)
  ];
  var pipes = [];
  var pipeDefs = [
    { from: new T.Vector3(-12.2, 2.0, 0.8), to: sinks[0], midY: 3.1, midZ: 1.4 },
    { from: new T.Vector3(-12.4, 0.3, 0.15), to: sinks[1], midY: 0.5, midZ: -0.2 },
    { from: new T.Vector3(-12.0, -1.7, -0.5), to: sinks[2], midY: -2.6, midZ: -1.3 }
  ];
  pipeDefs.forEach(function (d, i) {
    var pts = curvePts(d.from, d.to, d.midY, d.midZ, 64);
    S.add(c.line(pts, c.CYAN, 0.55, true));
    S.add(c.line(pts, 0xecfeff, 0.18, true));
    var beads = [];
    for (var b = 0; b < 8; b++) {
      var sp = c.glow(b % 2 ? 0xecfeff : c.CYAN, 1.45, 0.95);
      S.add(sp); beads.push(sp);
    }
    pipes.push({ pts: pts, beads: beads, off: i * 0.22 });
  });

  /* mid QA gate */
  var gate = new T.Group(); gate.position.set(0.15, 0.35, 0); gate.rotation.y = 0.55; S.add(gate);
  var ring = new T.Mesh(new T.TorusGeometry(3.35, 0.08, 8, 56), new T.MeshBasicMaterial({ color: c.CYAN, transparent: true, opacity: 0.95 }));
  ring.rotation.y = Math.PI / 2; gate.add(ring);
  var ring2 = new T.Mesh(new T.TorusGeometry(2.55, 0.05, 8, 56), new T.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.65, blending: T.AdditiveBlending, depthWrite: false }));
  ring2.rotation.y = Math.PI / 2; gate.add(ring2);
  gate.add(c.glow(c.CYAN, 9, 0.28));
  var qa = c.label({ mn: 'QA/QC', en: 'QA/QC' }, { scale: 0.055, px: 16 });
  qa.position.set(0, 4.15, 0.2); gate.add(qa);

  /* ----- structured database (right) ----- */
  var db = new T.Group(); db.position.set(11.6, 0.1, 0); S.add(db);
  for (i = 0; i < 3; i++) {
    var y = -2.7 + i * 2.7;
    var cyl = new T.CylinderGeometry(2.55, 2.55, 2.0, 36, 1);
    var cm = new T.Mesh(cyl, new T.MeshLambertMaterial({ color: 0x12324a, transparent: true, opacity: 0.94 }));
    cm.position.y = y; db.add(cm);
    [1.0, -1.0].forEach(function (o) {
      var rg = new T.Mesh(new T.TorusGeometry(2.57, 0.055, 6, 56), new T.MeshBasicMaterial({ color: c.CYAN }));
      rg.rotation.x = Math.PI / 2; rg.position.y = y + o; db.add(rg);
    });
    var band = new T.Mesh(new T.CylinderGeometry(2.6, 2.6, 0.2, 36, 1, true),
      new T.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false }));
    band.position.y = y; db.add(band);
    for (var k = 0; k < 3; k++) {
      var a = Math.PI / 2 - 0.45 + k * 0.28;
      var led = c.glow(k === 2 ? 0x6cc04a : c.CYAN, 0.55, 1);
      led.position.set(Math.cos(a) * 2.62, y + 0.5, Math.sin(a) * 2.62); db.add(led);
    }
  }
  var topCap = new T.Mesh(new T.CircleGeometry(2.55, 36), new T.MeshBasicMaterial({ color: 0x1b4865 }));
  topCap.rotation.x = -Math.PI / 2; topCap.position.y = 3.72; db.add(topCap);
  db.add(c.glow(c.CYAN, 10, 0.2));

  /* borehole-log stack beside the database */
  var core = new T.Group(); core.position.set(16.6, -0.2, 0.6); S.add(core);
  var strata = [0xc4b189, 0x7a8b74, 0x5a6e5c, 0x4a5d72, 0x2c3544, 0xc4b189, 0x7a8b74, 0x4a5d72];
  var h0 = -4.4;
  strata.forEach(function (col, i) {
    var hh = 0.7 + (i % 3) * 0.35;
    var sg = new T.CylinderGeometry(0.85, 0.85, hh, 20, 1);
    var sm = new T.Mesh(sg, new T.MeshLambertMaterial({ color: col }));
    sm.position.y = h0 + hh / 2;
    core.add(sm);
    core.add((function () { var e = c.edges(sg, c.CYAN, 0.45); e.position.y = sm.position.y; return e; })());
    h0 += hh;
  });
  /* glass sleeve */
  var sleeve = new T.Mesh(new T.CylinderGeometry(0.95, 0.95, 8.6, 24, 1, true),
    new T.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.12, side: T.DoubleSide, depthWrite: false }));
  sleeve.position.y = 0.1; core.add(sleeve);
  core.add(c.edges(new T.CylinderGeometry(0.95, 0.95, 8.6, 12, 1, true), c.CYAN, 0.4));
  var clab = c.label({ mn: 'Цооногийн лог', en: 'Borehole log' }, { scale: 0.05, px: 15 });
  clab.position.set(0, 5.1, 0); core.add(clab);

  var leftLab = c.label({ mn: 'Цаасан лог, Excel', en: 'Paper logs, Excel' }, { scale: 0.06, px: 16 });
  leftLab.position.set(-15.4, 6.6, 0); S.add(leftLab);
  var rightLab = c.label({ mn: 'Стандарт сан', en: 'Standard DB' }, { scale: 0.06, px: 16 });
  rightLab.position.set(11.6, 5.6, 0); S.add(rightLab);

  c.orbit.target.set(0.6, 0.35, 0);
  c.orbit.radius = 31;
  c.orbit.elev = 7.8;
  c.orbit.yaw = 1.22;
  c.orbit.speed = 0.08;
  c.orbit.sway = 0.18;
  c.orbit.swaySpeed = 0.32;
  c.orbit.tiltYaw = 0.35;
  c.orbit.tiltElev = 7;

  function along(pts, u) {
    var t = c.clamp(u, 0, 1) * (pts.length - 1);
    var i0 = Math.floor(t), i1 = Math.min(i0 + 1, pts.length - 1), f = t - i0;
    return pts[i0].clone().lerp(pts[i1], f);
  }

  return {
    stillTime: 2.4,
    update: function (t) {
      sheets.forEach(function (s) {
        s.g.position.set(
          s.home[0] + Math.sin(t * 0.7 + s.ph) * 0.25,
          s.home[1] + Math.cos(t * 0.9 + s.ph) * 0.35,
          s.home[2] + Math.sin(t * 0.5 + s.ph) * 0.2
        );
        s.g.rotation.z += s.spin * 0.01;
        s.g.rotation.y = Math.sin(t * 0.4 + s.ph) * 0.2;
      });
      pipes.forEach(function (p) {
        p.beads.forEach(function (sp, b) {
          var u = (t * 0.28 + p.off + b / p.beads.length) % 1;
          var pos = along(p.pts, u);
          sp.position.copy(pos);
          sp.material.opacity = 0.25 + 0.75 * Math.sin(u * Math.PI);
          sp.scale.setScalar(1.2 + 0.8 * Math.sin(u * Math.PI));
        });
      });
      ring.rotation.x = t * 0.35;
      ring2.rotation.x = -t * 0.5;
      db.rotation.y = t * 0.15;
      core.rotation.y = Math.sin(t * 0.4) * 0.25;
      halo.material.opacity = 0.08 + 0.04 * Math.sin(t * 1.3);
    }
  };
});
