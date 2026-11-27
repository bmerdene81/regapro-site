/* =====================================================================
   RegaPro · ЭТТ төвийн 3D дүрслэл ('ett-hub')
   Сайтын нийтлэг 3D хөдөлгүүр (../js/regapro-3d-base.js, three.js r128) дээр ажиллана.
   Контуртай газрын гадарга, цооногууд (идэвхтэй нь өрөмдөж буй хөдөлгөөнтэй),
   сүүлийн 14 хоногийн өрөмдлөгийн багана, сүүлийн өдрийн дээжийн цагираг.
   Бодит өгөгдөл: ETT_HERO.setData({ bars, holes, ring })
   ===================================================================== */
(function () {
  'use strict';
  var pending = null, live = null;
  window.ETT_HERO = {
    setData: function (d) { pending = d; if (live) live(d); }
  };
  if (!window.RegaPro3D) return;

  RegaPro3D.register('ett-hub', function (c) {
    var T = c.THREE, S = c.scene;
    var GREEN = 0x6cc04a, MINT = 0xa7f3d0, WHITE = 0xecfeff;
    var SIZE = 40;
    var hf = function (x, z) { return c.v2Height(x * 2.1, z * 2.1) * 0.09; };
    var ter = c.terrain({ size: SIZE, grid: 64, levels: 12, pointSize: 0.24, height: hf, contourOpacity: 0.62 });
    S.add(ter.group);

    /* --- цооногууд --- */
    var r = c.rng(11), holes = [];
    var spots = [[-11, -6], [-4, 5], [3, -8], [9, 3], [-14, 8], [14, -9], [-2, -1], [6, 11], [-8, -13]];
    spots.forEach(function (p, k) {
      var x = p[0] + (r() - 0.5) * 2, z = p[1] + (r() - 0.5) * 2, y0 = hf(x, z);
      var depth = 7 + r() * 6, active = k < 2;
      var g = new T.Group(); g.position.set(x, y0, z); S.add(g);
      var top = 0;
      c.STRATA.forEach(function (col, i) {
        var h = depth / c.STRATA.length;
        var m = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, h * 0.96, 14, 1),
          new T.MeshLambertMaterial({ color: col, transparent: true, opacity: active ? 0.95 : 0.55 }));
        m.position.y = top - h / 2; g.add(m); top -= h;
      });
      g.add(c.edges(new T.CylinderGeometry(0.42, 0.42, depth, 12, 1, true), active ? GREEN : c.CYAN, active ? 0.75 : 0.3, 1));
      var collar = c.glow(active ? GREEN : c.CYAN, active ? 2.6 : 1.5, active ? 0.95 : 0.6); collar.position.y = 0.25; g.add(collar);
      var bit = null;
      if (active) { bit = c.glow(WHITE, 1.5, 1); g.add(bit); }
      holes.push({ g: g, depth: depth, active: active, collar: collar, bit: bit, ph: r() * 6, label: null, x: x, z: z, y0: y0 });
    });

    function setHoleLabel(h, text) {
      if (h.label) { h.g.remove(h.label); h.label.material.map.dispose(); h.label.material.dispose(); }
      h.label = c.label(text, { scale: 0.06, px: 16, stroke: 'rgba(108,192,74,0.9)' });
      h.label.position.set(0, 3.1, 0); h.g.add(h.label);
    }
    var DEMO_HOLE = { mn: 'Өрөмдөж байна', en: 'Drilling' };
    holes.filter(function (h) { return h.active; }).forEach(function (h) { setHoleLabel(h, DEMO_HOLE); });

    /* --- 14 хоногийн өрөмдлөгийн самбар --- */
    function panel(w, h, x, y, z) {
      var g = new T.Group();
      g.add(new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: 0x0e2a40, transparent: true, opacity: 0.45, depthWrite: false, side: T.DoubleSide })));
      g.add(c.edges(new T.PlaneGeometry(w, h), c.CYAN, 0.75));
      g.position.set(x, y, z); g.userData.y0 = y; S.add(g); return g;
    }
    var bp = panel(13, 7, -7.5, 12, -9), bars = [];
    var demo = [0.62, 0.48, 0.3, 0.12, 0.34, 0.55, 0.42, 0.33, 0.25, 0.4, 0.3, 0.75, 0.86, 0.7];
    for (var i = 0; i < 14; i++) {
      var last = i === 13;
      var m = new T.Mesh(new T.BoxGeometry(0.62, 1, 0.4), new T.MeshBasicMaterial({
        color: last ? GREEN : c.elevColor(0.45 + demo[i] * 0.5), transparent: true, opacity: last ? 0.95 : 0.8,
        blending: T.AdditiveBlending, depthWrite: false }));
      m.position.set(-5.6 + i * 0.86, 0, 0.25); bp.add(m);
      bars.push({ m: m, v: demo[i], cur: 0.02 });
    }
    var bt = c.label({ mn: 'Өрөмдсөн м · 14 хоног', en: 'Metres drilled · 14 days' }, { scale: 0.062, px: 16 });
    bt.position.set(0, 4.5, 0); bp.add(bt);
    var bvLabel = null;
    function setBarValue(text) {
      if (bvLabel) { bp.remove(bvLabel); bvLabel.material.map.dispose(); bvLabel.material.dispose(); }
      if (!text) { bvLabel = null; return; }
      bvLabel = c.label(text, { plain: true, px: 20, scale: 0.065, color: '#d9f99d' });
      bvLabel.position.set(5.9, 1.4, 0.4); bp.add(bvLabel);
    }

    /* --- сүүлийн өдрийн дээжийн цагираг --- */
    var kpi = new T.Group(); kpi.position.set(12, 7.5, 4); kpi.userData.y0 = 7.5; S.add(kpi);
    kpi.add(new T.Mesh(new T.RingGeometry(2.1, 2.55, 64), new T.MeshBasicMaterial({ color: 0x1e3a5f, side: T.DoubleSide, transparent: true, opacity: 0.8 })));
    var arcGeo = new T.RingGeometry(2.05, 2.6, 96, 1, Math.PI / 2, -Math.PI * 2);
    var arc = new T.Mesh(arcGeo, new T.MeshBasicMaterial({ color: GREEN, side: T.DoubleSide, transparent: true, opacity: 0.95, blending: T.AdditiveBlending }));
    kpi.add(arc); kpi.add(c.glow(GREEN, 7.5, 0.22));
    var kt = c.label({ mn: 'Дээж · сүүлийн өдөр', en: 'Samples · latest day' }, { scale: 0.06, px: 16 });
    kt.position.set(0, 3.8, 0); kpi.add(kt);
    var kl = null, ringFrac = 0.72, ringCur = 0;
    function setRing(text, frac) {
      if (kl) { kpi.remove(kl); kl.material.map.dispose(); kl.material.dispose(); }
      kl = c.label(text, { plain: true, px: 24, scale: 0.075, color: '#ecfeff' }); kpi.add(kl);
      ringFrac = Math.max(0.04, Math.min(1, frac));
    }
    setRing({ mn: 'дээж', en: 'samples' }, 0.72);

    /* --- туяа: идэвхтэй цооногоос самбар руу --- */
    var beams = [];
    holes.filter(function (h) { return h.active; }).forEach(function (h, k) {
      var to = k === 0 ? new T.Vector3(bp.position.x, bp.position.y - 3.6, bp.position.z) : new T.Vector3(kpi.position.x, kpi.position.y - 2.8, kpi.position.z);
      var b = c.line([new T.Vector3(h.x, h.y0 + 0.4, h.z), to], GREEN, 0.4, true); S.add(b); beams.push(b);
    });

    /* --- бодит өгөгдөл --- */
    live = function (d) {
      if (!d) return;
      if (d.bars && d.bars.length) {
        var vals = d.bars.slice(-14), mx = Math.max.apply(null, vals.concat([1]));
        while (vals.length < 14) vals.unshift(0);
        bars.forEach(function (b, k) { b.v = vals[k] / mx; });
        setBarValue(d.barText || '');
      }
      if (d.holes) {
        var act = holes.filter(function (h) { return h.active; });
        act.forEach(function (h, k) {
          var info = d.holes[k];
          h.g.visible = true;
          if (info) setHoleLabel(h, info.name + (info.m ? ' · ' + info.m : ''));
          else if (k > 0) h.g.visible = false;
        });
      }
      if (d.ring) setRing(d.ring.text, d.ring.frac);
    };
    if (pending) live(pending);

    c.orbit.target.set(0, 4.2, 0); c.orbit.radius = 37; c.orbit.elev = 18; c.orbit.yaw = Math.PI / 2 - 0.35;
    c.orbit.sway = 0.32; c.orbit.swaySpeed = 0.22; c.orbit.tiltYaw = 0.3; c.orbit.tiltElev = 7;
    var idxCount = arcGeo.index.count;
    return {
      stillTime: 4,
      update: function (t, dt) {
        var e = Math.min(1, (dt || 0.016) * 2.2);
        bars.forEach(function (b, k) {
          b.cur += (Math.max(0.03, b.v) - b.cur) * e;
          var h = b.cur * 5.4 * (0.97 + 0.03 * Math.sin(t * 2 + k));
          b.m.scale.y = h; b.m.position.y = -3.2 + h / 2;
        });
        ringCur += (ringFrac - ringCur) * e;
        arcGeo.setDrawRange(0, Math.floor(idxCount * ringCur / 6) * 6);
        holes.forEach(function (h) {
          var s = h.active ? 2.4 + 0.7 * Math.sin(t * 3 + h.ph) : 1.4 + 0.25 * Math.sin(t * 1.6 + h.ph);
          h.collar.scale.setScalar(s);
          if (h.bit) { var u = (t * 0.16 + h.ph) % 1; h.bit.position.y = -u * h.depth; h.bit.material.opacity = 0.35 + 0.65 * Math.sin(u * Math.PI); }
        });
        beams.forEach(function (b, k) { b.material.opacity = 0.25 + 0.2 * Math.sin(t * 2.2 + k * 1.7); });
        [bp, kpi].forEach(function (o, k) { o.position.y = o.userData.y0 + Math.sin(t * 1.1 + k * 2) * 0.25; });
        bp.lookAt(c.camera.position.x, bp.position.y, c.camera.position.z);
        kpi.lookAt(c.camera.position);
      }
    };
  });
})();
