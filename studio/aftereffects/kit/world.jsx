// CRM Analytics Academy — morph scenes for a film set in one open white world
// (spec "layout": "canvas" with canvas.cards false: see film.jsx).
//
// Nothing cuts: one thing becomes the next.
//   morphCharts  "Want to learn CRM Analytics?" — each letter becomes a bar, the "?"
//                becomes a donut, the line under the word becomes a line chart
//   dataInsight  the word "data" bursts into dots, they scatter, stack into
//                columns, fuse into bars, and the tallest says "insight."
//   pathRoad     a pen line draws across the white, slides unfold along it, then
//                it thickens into a road with stops, running on out of frame
//   aiSketch     a prompt types, dashed sketches draw, each becomes a real widget
// All on white: colour only from the content (navy, signal blue).

SCENES_INFO.push(
  { type: 'morphCharts', label: 'Morph: a word becomes charts (letters → bars, ? → donut, underline → line)', props: { small: 'Want to learn', big: 'CRM Analytics' } },
  { type: 'dataInsight', label: 'Morph: "data" → dots → columns → bars → insight', props: { word: 'data', result: 'insight.' } },
  { type: 'pathRoad', label: 'Morph: a pen line → slides → a road with stops', props: { caption: 'Your path.' } },
  { type: 'aiSketch', label: 'Morph: AI sketches a dashboard, sketches become widgets', props: { caption: 'AI at your side.' } }
);

(function () {
  var C = KIT.C;
  var F = KIT.F;
  var U = KIT.ui;
  var TR = 'ADBE Transform Group';

  function prop(L, name) {
    return L.property(TR).property(name);
  }
  // The right edge of a string's ink, set at x = 0 (left-justified).
  function rightOf(comp, str, o) {
    var t = KIT.text(comp, str, { size: o.size, font: o.font, color: o.color, x: 0, y: 0, align: 'left' });
    var r = t.sourceRectAtTime(0, false);
    t.remove();
    return r.left + r.width;
  }
  // One text layer per letter, on a shared baseline (y), laid out as the word would be.
  // Each layer's anchor is its ink centre on the baseline.
  function letters(comp, str, o) {
    var total = rightOf(comp, str, o);
    var x0 = o.cx !== undefined ? o.cx - total / 2 : o.x0;
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      if (ch === ' ') continue;
      var right = rightOf(comp, str.substr(0, i + 1), o);
      var L = KIT.text(comp, ch, { size: o.size, font: o.font, color: o.color, x: 0, y: 0, align: 'left', name: 'Letter ' + ch });
      var r = L.sourceRectAtTime(0, false);
      prop(L, 'ADBE Anchor Point').setValue([r.left + r.width / 2, 0]);
      var cx = x0 + right - r.width / 2;
      KIT.at(L, cx, o.y);
      out.push({ L: L, ch: ch, cx: cx, w: r.width, top: r.top, bottom: r.top + r.height });
    }
    return { items: out, x0: x0, w: total };
  }
  // A rectangle whose bottom edge sits on the layer's origin; returns getters for size and position.
  function baseRect(comp, name, w, h, r, color, x, y) {
    var L = KIT.shapeLayer(comp, name);
    var g = KIT.group(L, name);
    KIT.rectIn(g, w, h, r, 0, -h / 2);
    KIT.fill(g, color);
    KIT.at(L, x, y);
    function shape() {
      return L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property('ADBE Vector Shape - Rect');
    }
    return {
      L: L,
      size: function () { return shape().property('ADBE Vector Rect Size'); },
      pos: function () { return shape().property('ADBE Vector Rect Position'); }
    };
  }
  // Morph a rectangle from (w0, h0) to (w1, h1), its bottom staying on the baseline.
  function grow(R, t, d, w0, h0, w1, h1) {
    KIT.keys(R.size(), [[t, [w0, h0]], [t + d * 0.8, [w1, h1 * 1.05]], [t + d, [w1, h1]]], 70);
    KIT.keys(R.pos(), [[t, [0, -h0 / 2]], [t + d * 0.8, [0, -h1 * 1.05 / 2]], [t + d, [0, -h1 / 2]]], 70);
  }
  function polyShape(pts) {
    var s = new Shape();
    s.vertices = pts;
    s.closed = false;
    return s;
  }
  function slamIn(L, t) {
    KIT.keys(prop(L, 'ADBE Scale'), [[t - 0.14, [300, 300, 100]], [t, [92, 92, 100]], [t + 0.12, [104, 104, 100]], [t + 0.24, [100, 100, 100]]], 70);
    KIT.keys(prop(L, 'ADBE Rotate Z'), [[t - 0.14, -24], [t, 4], [t + 0.24, 0]], 70);
    KIT.opacityKeys(L, [[0, 0], [t - 0.14, 0], [t - 0.1, 100]], 30);
  }
  function seeded(seed) {
    var r = seed || 7;
    return function () {
      r = (r * 9301 + 49297) % 233280;
      return r / 233280;
    };
  }
  function caption(comp, str, t, color) {
    var L = KIT.text(comp, str, { size: 104, font: F.black, color: color || C.navy, x: 160, y: 170, align: 'left' });
    KIT.charsIn(L, t, 0.45, { pos: [0, 70], rot: 8 }, { spread: 25 });
    return L;
  }

  // ---- a word becomes charts ------------------------------------------------------------------------
  SCENES.morphCharts = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    KIT.enter(comp, p._transition || 'world', C.white, T);
    var size = p.size || 200;
    var base = 650;
    var o = { size: size, font: F.black, color: C.signal };
    var big = p.big || 'CRM Analytics';
    var qw = rightOf(comp, '?', { size: size * 1.2, font: F.black, color: C.navy });
    var wordW = rightOf(comp, big, o);
    var all = wordW + 28 + qw;
    var x0 = 960 - all / 2;
    o.x0 = x0;
    o.y = base;
    var sm = KIT.text(comp, p.small || 'Want to learn', { size: 84, font: F.bold, color: C.navy, x: x0 + 6, y: 380, align: 'left' });
    U.typeOn(sm, T, 34);
    var W = letters(comp, big, o);
    var i;
    for (i = 0; i < W.items.length; i++) {
      var tl = T + b * 1.5 + i * 0.035;
      KIT.moveFrom(W.items[i].L, tl, 0, 90, 0.4);
      KIT.opacityKeys(W.items[i].L, [[0, 0], [tl, 0], [tl + 0.12, 100]]);
    }
    var q = KIT.text(comp, '?', { size: size * 1.2, font: F.black, color: C.navy, x: 0, y: 0, align: 'left', name: 'Question mark' });
    var qr = q.sourceRectAtTime(0, false);
    prop(q, 'ADBE Anchor Point').setValue([qr.left + qr.width / 2, qr.top + qr.height / 2]);
    var qx = x0 + wordW + 28 + qw / 2;
    var qy = base + qr.top + qr.height / 2;
    KIT.at(q, qx, qy);
    slamIn(q, T + b * 4);
    // The line under the word: drawn, later it becomes a line chart.
    var n = W.items.length;
    var ly = base + 46;
    var flat = [];
    for (i = 0; i < n; i++) flat.push([W.items[i].cx, ly]);
    var LC = KIT.shapeLayer(comp, 'Underline → line chart');
    var lg = KIT.group(LC, 'Line');
    KIT.pathIn(lg, flat, false);
    KIT.stroke(lg, C.navy, 10);
    KIT.keys(KIT.trim(lg).property('ADBE Vector Trim End'), [[T + b * 2.5, 0], [T + b * 3.3, 100]], 80);
    KIT.at(LC, 0, 0);
    // The morph, on the third beat of the second bar.
    var tm = T + b * 6;
    KIT.fade(sm, tm - 0.3, tm, 100, 0);
    KIT.moveFrom(sm, tm - 0.3, 0, 0, 0.3);
    var hs = p.heights || [0.55, 0.78, 0.62, 0.95, 0.5, 0.7, 0.86, 0.6, 0.74, 0.45, 0.66, 0.9];
    var maxH = p.maxH || 380;
    var bw = Math.min(70, (W.w / n) * 0.62);
    var tops = [];
    for (i = 0; i < n; i++) {
      var it = W.items[i];
      var t = tm + i * 0.04;
      var H = maxH * hs[i % hs.length];
      var R = baseRect(comp, 'Bar from ' + it.ch, it.w, -it.top, 6, i % 3 === 2 ? C.navy : C.signal, it.cx, base);
      grow(R, t, 0.5, it.w, -it.top, bw, H);
      KIT.opacityKeys(R.L, [[0, 0], [t, 0], [t + 0.06, 100]], 30);
      KIT.opacityKeys(it.L, [[t, 100], [t + 0.08, 0]], 30);
      tops.push([it.cx, base - H - 46]);
    }
    // The underline lifts into a line over the bars.
    var pathP = LC.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property('ADBE Vector Shape - Group').property('ADBE Vector Shape');
    pathP.setValueAtTime(tm + 0.1, polyShape(flat));
    pathP.setValueAtTime(tm + 0.75, polyShape(tops));
    KIT.easeAll(pathP, 75);
    for (i = 0; i < n; i++) KIT.pop(KIT.circle(comp, 'Point ' + (i + 1), 22, C.navy, tops[i][0], tops[i][1]), tm + 0.7 + i * 0.02);
    // The "?" becomes a donut.
    var td = tm + 0.35;
    KIT.keys(prop(q, 'ADBE Scale'), [[td, [100, 100, 100]], [td + 0.2, [40, 40, 100]]], 70);
    KIT.opacityKeys(q, [[td + 0.05, 100], [td + 0.2, 0]], 40);
    var D = 200;
    // Right of the bars, but never past the frame's edge (outer radius ≈ D / 2 + 26).
    var dcx = Math.min(qx + 190, 1920 - 150);
    var dcy = base - 190;
    var parts = [55, 30, 15];
    var cols = [C.signal, C.navy, C.frost];
    var acc = 0;
    for (i = 0; i < parts.length; i++) {
      var dl = KIT.shapeLayer(comp, 'Donut ' + (i + 1));
      var dg = KIT.group(dl, 'Slice');
      KIT.ellipseIn(dg, D, D);
      KIT.stroke(dg, cols[i], 52, false);
      var tr = KIT.trim(dg);
      tr.property('ADBE Vector Trim Start').setValue(acc);
      KIT.keys(tr.property('ADBE Vector Trim End'), [[td + 0.1 + i * 0.08, acc], [td + 0.6 + i * 0.08, acc + parts[i] - 0.6]], 70);
      KIT.at(dl, qx, qy);
      KIT.keys(prop(dl, 'ADBE Position'), [[td, [qx, qy]], [td + 0.5, [dcx, dcy]]], 80);
      KIT.keys(prop(dl, 'ADBE Scale'), [[td, [30, 30, 100]], [td + 0.5, [100, 100, 100]]], 80);
      acc += parts[i];
    }
  };

  // ---- data becomes insight -----------------------------------------------------------------------------
  SCENES.dataInsight = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    KIT.enter(comp, p._transition || 'world', C.white, T);
    var rnd = seeded(p.seed || 11);
    var base = 600;
    var W = letters(comp, p.word || 'data', { size: 300, font: F.black, color: C.navy, cx: 960, y: base });
    var i;
    for (i = 0; i < W.items.length; i++) {
      var tl = T + i * 0.06;
      KIT.moveFrom(W.items[i].L, tl, 0, 110, 0.45);
      KIT.opacityKeys(W.items[i].L, [[0, 0], [tl, 0], [tl + 0.12, 100]]);
    }
    var tb = T + b * 2;
    var per = 6;
    var counts = p.counts || [4, 6, 9, 5];
    var colX = [];
    for (i = 0; i < counts.length; i++) colX.push(960 + (i - (counts.length - 1) / 2) * 210);
    var floor = 900;
    var slots = [];
    for (var c = 0; c < counts.length; c++) for (var k = 0; k < counts[c]; k++) slots.push([colX[c], floor - 20 - k * 40]);
    var dots = 0;
    var tCol = T + b * 4.5;
    var tFuse = T + b * 6;
    var palette = [C.signal, C.navy, C.signalBright, C.frost];
    for (i = 0; i < W.items.length; i++) {
      var it = W.items[i];
      KIT.opacityKeys(it.L, [[tb, 100], [tb + 0.1, 0]], 30);
      KIT.keys(prop(it.L, 'ADBE Scale'), [[tb, [100, 100, 100]], [tb + 0.1, [120, 120, 100]]], 50);
      for (var j = 0; j < per && dots < slots.length; j++) {
        var sx = it.cx + (rnd() - 0.5) * it.w * 0.9;
        var sy = base + it.top * (0.15 + rnd() * 0.75);
        var scx = 260 + rnd() * 1400;
        var scy = 260 + rnd() * 560;
        var d = KIT.circle(comp, 'Data point ' + (dots + 1), 30, palette[dots % palette.length], sx, sy);
        var ts = tCol + dots * 0.02;
        KIT.keys(prop(d, 'ADBE Position'), [[tb, [sx, sy]], [tb + 0.55, [scx, scy]], [ts, [scx + (rnd() - 0.5) * 40, scy + (rnd() - 0.5) * 40]], [ts + 0.5, slots[dots]]], 75);
        KIT.keys(prop(d, 'ADBE Scale'), [[tb, [0, 0, 100]], [tb + 0.15, [120, 120, 100]], [tb + 0.3, [100, 100, 100]]], 60);
        KIT.opacityKeys(d, [[tFuse + 0.25, 100], [tFuse + 0.45, 0]], 40);
        dots++;
      }
    }
    // The stacks fuse into bars.
    var tallest = 0;
    for (i = 1; i < counts.length; i++) if (counts[i] > counts[tallest]) tallest = i;
    for (i = 0; i < counts.length; i++) {
      var H = counts[i] * 40;
      var R = baseRect(comp, 'Insight bar ' + (i + 1), 44, 30, 8, i === tallest ? C.signal : C.navy, colX[i], floor);
      grow(R, tFuse, 0.5, 44, 30, 150, H);
      KIT.opacityKeys(R.L, [[0, 0], [tFuse, 0], [tFuse + 0.1, 100]], 30);
    }
    var ax = KIT.rect(comp, 'Floor', 900, 4, 2, C.line, 960, floor + 2);
    KIT.opacityKeys(ax, [[0, 0], [tFuse, 0], [tFuse + 0.2, 100]]);
    var ins = KIT.text(comp, p.result || 'insight.', { size: 130, font: F.black, color: C.signal, x: colX[tallest], y: floor - counts[tallest] * 40 - 110 });
    KIT.charsIn(ins, tFuse + b * 1.2, 0.45, { pos: [0, 60], scale: 40 }, { spread: 30 });
  };

  // ---- a line becomes slides, then a road -------------------------------------------------------------
  SCENES.pathRoad = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    KIT.enter(comp, p._transition || 'world', C.white, T);
    var N = 48;
    var xEnd = p.xEnd || 2560;
    var pts = [];
    var i;
    for (i = 0; i < N; i++) {
      var x = 120 + (xEnd - 120) * i / (N - 1);
      pts.push([x, 700 + 120 * Math.sin(x / 380) - 60 * Math.sin(x / 900)]);
    }
    var tDraw = b * 3.2;
    var L = KIT.shapeLayer(comp, 'Pen line → road');
    var g = KIT.group(L, 'Road');
    KIT.pathIn(g, pts, false);
    KIT.stroke(g, C.navy, 8);
    // Keys on the stroke first: adding the trim afterwards invalidates references.
    var sw = function () {
      return L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property('ADBE Vector Graphic - Stroke').property('ADBE Vector Stroke Width');
    };
    var tRoad = T + b * 4;
    KIT.keys(sw(), [[tRoad, 8], [tRoad + 0.5, 70]], 75);
    KIT.keys(KIT.trim(L.property('ADBE Root Vectors Group').property(1)).property('ADBE Vector Trim End'), [[T, 0], [T + tDraw, 100]], 20);
    KIT.at(L, 0, 0);
    // The pen: a dot riding the line's head.
    var pen = KIT.circle(comp, 'Pen', 30, C.signal, pts[0][0], pts[0][1]);
    var pk = [];
    for (i = 0; i < N; i += 3) pk.push([T + tDraw * i / (N - 1), pts[i]]);
    pk.push([T + tDraw, pts[N - 1]]);
    for (i = 0; i < pk.length; i++) prop(pen, 'ADBE Position').setValueAtTime(pk[i][0], pk[i][1]);
    KIT.opacityKeys(pen, [[0, 0], [T, 0], [T + 0.05, 100], [tRoad, 100], [tRoad + 0.2, 0]]);
    // Slides unfold from the line as the pen passes.
    var at = p.slides || [8, 17, 26];
    for (i = 0; i < at.length; i++) {
      var pt = pts[at[i]];
      var ts = T + tDraw * at[i] / (N - 1);
      var card = KIT.shapeLayer(comp, 'Slide ' + (i + 1));
      var cg = KIT.group(card, 'Slide');
      KIT.rectIn(cg, 300, 190, 14, 0, -95);
      KIT.fill(cg, C.white);
      KIT.stroke(cg, C.navy, 4);
      var mg = KIT.group(card, 'Mini');
      var hh = [[50, 70], [80, 40], [110, 100]];
      for (var m = 0; m < 3; m++) KIT.rectIn(mg, 46, hh[m][i % 2 ? 1 : 0] || 60, 4, -70 + m * 70, -30 - (hh[m][i % 2 ? 1 : 0] || 60) / 2);
      KIT.fill(mg, i === 1 ? C.navy : C.signal);
      // The mini chart group was added after the frame: move it in front.
      card.property('ADBE Root Vectors Group').property(2).moveTo(1);
      KIT.at(card, pt[0], pt[1] - 40);
      KIT.keys(prop(card, 'ADBE Scale'), [[ts, [100, 0, 100]], [ts + 0.3, [100, 108, 100]], [ts + 0.42, [100, 100, 100]]], 70);
      KIT.keys(prop(card, 'ADBE Rotate Z'), [[ts, -10], [ts + 0.42, i % 2 ? 3 : -3]], 70);
      KIT.keys(prop(card, 'ADBE Position'), [[tRoad, [pt[0], pt[1] - 40]], [tRoad + 0.5, [pt[0], pt[1] - 90]]], 80);
    }
    // The road's centre line, then the stops.
    var cl = KIT.shapeLayer(comp, 'Road centre line');
    var cg2 = KIT.group(cl, 'Centre');
    KIT.pathIn(cg2, pts, false);
    var st = KIT.stroke(cg2, C.white, 6);
    try {
      st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(28);
    } catch (e) {
      // decoration
    }
    KIT.keys(KIT.trim(cl.property('ADBE Root Vectors Group').property(1)).property('ADBE Vector Trim End'), [[tRoad + 0.4, 0], [tRoad + 1.3, 100]], 50);
    KIT.at(cl, 0, 0);
    var stops = p.stops || [[4, 'db'], [13, 'out'], [22, 'spark'], [31, 'award']];
    for (i = 0; i < stops.length; i++) {
      var sp = pts[stops[i][0]];
      var tp = tRoad + 0.6 + i * b / 2;
      var pin = KIT.icon(comp, stops[i][1], sp[0], sp[1] + 110, 96, C.white, C.signal);
      KIT.pop(pin, tp);
      var stem = KIT.rect(comp, 'Stop ' + (i + 1), 6, 50, 3, C.signal, sp[0], sp[1] + 45);
      KIT.opacityKeys(stem, [[0, 0], [tp, 0], [tp + 0.1, 100]]);
    }
    caption(comp, p.caption || 'Your path.', tRoad);
  };

  // ---- AI sketches, sketches become widgets ------------------------------------------------------------------
  SCENES.aiSketch = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    KIT.enter(comp, p._transition || 'world', C.white, T);
    caption(comp, p.caption || 'AI at your side.', T);
    var pl = U.box(comp, 'Prompt', 1200, 84, 42, 1040, 340, { fill: C.paper, stroke: C.line });
    U.arrive([pl], T + 0.2, 16);
    KIT.pop(KIT.icon(comp, 'spark', 400, 340, 64, C.white, C.signal), T + 0.25);
    var pr = KIT.text(comp, p.prompt || 'Sketch a dashboard for my team', { size: 34, font: F.medium, color: C.ink, x: 470, y: 340, align: 'left' });
    U.typeOn(pr, T + 0.4, 45);
    var boxes = [[700, 520, 560, 170], [1320, 520, 560, 170], [700, 800, 560, 340], [1320, 800, 560, 340]];
    var tS = T + b * 2.2;
    var i;
    for (i = 0; i < boxes.length; i++) {
      var bx = boxes[i];
      var sk = KIT.shapeLayer(comp, 'Sketch ' + (i + 1));
      var g = KIT.group(sk, 'Box');
      KIT.rectIn(g, bx[2], bx[3], 16);
      var st = KIT.stroke(g, C.signalBright, 4);
      try {
        st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(16);
      } catch (e) {
        // decoration
      }
      KIT.keys(KIT.trim(sk.property('ADBE Root Vectors Group').property(1)).property('ADBE Vector Trim End'), [[tS + i * 0.12, 0], [tS + 0.45 + i * 0.12, 100]], 60);
      KIT.at(sk, bx[0], bx[1]);
      // The sketch becomes the widget: a solid card swells out of the dashes.
      var tw = T + b * 4 + i * b / 2;
      var wd = U.box(comp, 'Widget ' + (i + 1), bx[2], bx[3], 16, bx[0], bx[1], { fill: C.white, stroke: C.line, width: 3 });
      KIT.keys(prop(wd, 'ADBE Scale'), [[tw, [96, 96, 100]], [tw + 0.25, [102, 102, 100]], [tw + 0.4, [100, 100, 100]]], 70);
      KIT.opacityKeys(wd, [[0, 0], [tw, 0], [tw + 0.12, 100]]);
      KIT.opacityKeys(sk, [[tw + 0.05, 100], [tw + 0.2, 0]]);
      var tc = tw + 0.2;
      if (i === 0) {
        var k1 = KIT.text(comp, '0', { size: 90, font: F.black, color: C.navy, x: bx[0], y: bx[1] });
        KIT.countUp(k1, tc, tc + 0.8, 1284, '');
        KIT.opacityKeys(k1, [[0, 0], [tc, 0], [tc + 0.1, 100]]);
      } else if (i === 1) {
        var k2 = KIT.text(comp, '0', { size: 90, font: F.black, color: C.signal, x: bx[0], y: bx[1] });
        KIT.countUp(k2, tc, tc + 0.8, 68, '%');
        KIT.opacityKeys(k2, [[0, 0], [tc, 0], [tc + 0.1, 100]]);
      } else if (i === 2) {
        U.bars(comp, 'Widget bars', bx[0] - 220, bx[1] + 130, 440, 230, [52, 74, 61, 90, 70], tc, { axis: false, max: 56, colors: [C.signal, C.navy] });
      } else {
        U.lineChart(comp, 'Widget line', bx[0] - 220, bx[1] - 100, 440, 210, [20, 32, 28, 45, 52, 61, 74], tc, { color: C.signal, dot: 14, d: 0.6 });
      }
    }
  };
}());
