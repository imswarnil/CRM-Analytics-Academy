// CRM Analytics Academy — the trailer kit: scenes that look like CRM Analytics itself.
//
// Flat, no camera: every scene is a page of one app. The same shell (navy app
// header, a dashboard's page tabs, a grey canvas) stays put from scene to scene;
// switching scene is switching tab: the underline slides, a loading line runs,
// and the new page's widgets arrive. Widgets are the props: KPIs that count,
// bar / donut / line charts that swap type, a recipe canvas that runs, Query
// mode with SAQL, toasts. Plus `clipSlot`, a placeholder for your own camera
// clip until the file exists (studio/films/<film>-clips.md says what to record).

SCENES_INFO.push(
  { type: 'appHook', label: 'Trailer hook: a statement, then a dashboard builds itself', props: { lines: ['Every company has *the data.*', 'Few can make it *answer.*'], pill: 'Someone has to build this. Why not you?' } },
  { type: 'whyLearn', label: 'Why learn it: four reason widgets', props: {} },
  { type: 'approach', label: 'How you learn: a recipe canvas that runs', props: {} },
  { type: 'realData', label: 'Real data: Explorer query, chart type swaps', props: {} },
  { type: 'pathList', label: 'The path: sections list with progress', props: {} },
  { type: 'queryMode', label: 'Query mode: SAQL typed, run, results', props: {} },
  { type: 'proveIt', label: 'Prove it: exam gauge, interview Q and A, certificate', props: {} },
  { type: 'clipSlot', label: 'Your camera clip (a placeholder until the file exists)', props: { n: 1, title: 'Hi, I am Swarnil', say: 'One line about you.', lower: { name: 'Swarnil Singhai', role: 'CRM Analytics Academy' } } }
);

(function () {
  var C = KIT.C;
  var F = KIT.F;
  var TABS = ['Why learn', 'How you learn', 'Real data', 'The path', 'Query', 'Prove it'];

  // ---- small parts ------------------------------------------------------------------------
  function dash(stroke, len) {
    try {
      stroke.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(len);
    } catch (e) {
      // decoration only
    }
  }
  // A rounded box: fill and/or hairline (stroke on top of fill).
  function box(comp, name, w, h, r, x, y, o) {
    o = o || {};
    var L = KIT.shapeLayer(comp, name);
    var g = KIT.group(L, name);
    KIT.rectIn(g, w, h, r);
    if (o.stroke) {
      var s = KIT.stroke(g, o.stroke, o.width || 2);
      if (o.dash) dash(s, o.dash);
    }
    if (o.fill) KIT.fill(g, o.fill, o.opacity);
    return KIT.at(L, x, y);
  }
  function ring(comp, name, d, x, y, color, width) {
    var L = KIT.shapeLayer(comp, name);
    var g = KIT.group(L, name);
    KIT.ellipseIn(g, d, d);
    KIT.stroke(g, color, width || 4);
    return KIT.at(L, x, y);
  }
  function width(L) {
    return L.sourceRectAtTime(0, false).width;
  }
  // Widgets and their content arrive the way a dashboard loads: up a little, fading in.
  function arrive(layers, t, dy) {
    for (var i = 0; i < layers.length; i++) {
      KIT.moveFrom(layers[i], t, 0, dy === undefined ? 36 : dy, 0.45);
      KIT.fade(layers[i], t, t + 0.25, 0, 100);
    }
    return layers;
  }
  function fadeAll(layers, t0, t1, a, b) {
    for (var i = 0; i < layers.length; i++) KIT.fade(layers[i], t0, t1, a, b);
  }
  function exitUp(layers, t) {
    for (var i = 0; i < layers.length; i++) {
      var p = layers[i].property('ADBE Transform Group').property('ADBE Position');
      var v = p.valueAtTime(t, false);
      KIT.keys(p, [[t + i * 0.03, v], [t + i * 0.03 + 0.4, [v[0], v[1] - 70]]], 70);
      KIT.fade(layers[i], t + i * 0.03, t + i * 0.03 + 0.3, 100, 0);
    }
  }
  function wrap(s, n) {
    var words = String(s).split(' ');
    var lines = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      if (cur && (cur + ' ' + words[i]).length > n) {
        lines.push(cur);
        cur = words[i];
      } else cur = cur ? cur + ' ' + words[i] : words[i];
    }
    if (cur) lines.push(cur);
    return lines.join('\r');
  }
  // Typing with a cursor only while typing (nothing before t, no cursor after).
  function typeOn(layer, t, cps) {
    layer.property('ADBE Text Properties').property('ADBE Text Document').expression =
      'var n = Math.max(0, Math.floor((time - ' + t.toFixed(3) + ') * ' + (cps || 60) + '));\n' +
      'var s = String(value);\n' +
      's.substr(0, n) + (n > 0 && n < s.length ? "\\u258D" : "");';
  }
  // One line of words, each arriving on a step (half-beats), *accent* in signal blue.
  function words(comp, str, y, t, step, size) {
    var ws = str.split(' ');
    var lay = [];
    var total = 0;
    var space = size * 0.27;
    var inA = false;
    var i;
    for (i = 0; i < ws.length; i++) {
      if (ws[i].charAt(0) === '*') inA = true;
      var acc = inA;
      if (/\*[.,!?]*$/.test(ws[i])) inA = false;
      var L = KIT.text(comp, ws[i].replace(/\*/g, ''), { size: size, font: F.black, color: acc ? C.signal : C.navy, x: 0, y: y, align: 'left' });
      var rr = L.sourceRectAtTime(0, false);
      L.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([rr.left, -size * 0.36]);
      lay.push([L, rr.width]);
      total += rr.width + (i ? space : 0);
    }
    var x = 960 - total / 2;
    var out = [];
    for (i = 0; i < lay.length; i++) {
      KIT.at(lay[i][0], x, y);
      var tt = t + i * step;
      KIT.moveFrom(lay[i][0], tt, 0, size * 0.5, 0.45);
      KIT.fade(lay[i][0], tt, tt + 0.2, 0, 100);
      x += lay[i][1] + space;
      out.push(lay[i][0]);
    }
    return out;
  }

  // ---- the app shell -------------------------------------------------------------------------
  // p.tab: the active page (index in TABS); p.from: the page we come from (the
  // underline slides). p.intro: the app itself arrives (first scene).
  // p._transition 'tab' | 'none': a page switch (loading line); anything else
  // (slices, push…) sweeps the app in over the previous scene.
  function shell(comp, p, T) {
    var tr = p._transition || 'tab';
    var swept = tr !== 'tab' && tr !== 'none';
    var made = [];
    if (swept) KIT.enter(comp, tr, C.paper, T);
    else made.push(KIT.rect(comp, 'BG', 1920, 1080, 0, C.paper, 960, 540));
    var head = [];
    head.push(KIT.rect(comp, 'App header', 1920, 76, 0, C.navy, 960, 38));
    var mk = KIT.mark(comp, 54, 38, 46);
    for (var m = 0; m < mk.length; m++) head.push(mk[m]);
    var nm = KIT.text(comp, 'CRM Analytics Academy', { size: 26, font: F.bold, color: C.white, x: 94, y: 38, align: 'left' });
    head.push(nm);
    var sep = KIT.rect(comp, 'Header divider', 2, 30, 0, C.frost, 94 + width(nm) + 22, 38);
    head.push(sep);
    head.push(KIT.text(comp, 'Analytics Studio', { size: 22, font: F.medium, color: C.frost, x: 94 + width(nm) + 44, y: 38, align: 'left' }));
    head.push(box(comp, 'Search', 560, 46, 23, 1080, 38, { fill: C.white, opacity: 12 }));
    head.push(KIT.text(comp, 'Search dashboards, lenses, datasets', { size: 20, font: F.medium, color: C.frost, x: 830, y: 38, align: 'left' }));
    head.push(KIT.circle(comp, 'Avatar', 46, C.signalBright, 1866, 38));
    head.push(KIT.text(comp, 'SS', { size: 18, font: F.bold, color: C.white, x: 1866, y: 38 }));
    var bar = [];
    bar.push(KIT.rect(comp, 'Tab bar', 1920, 72, 0, C.white, 960, 112));
    bar.push(KIT.rect(comp, 'Tab bar hairline', 1920, 2, 0, C.line, 960, 148));
    bar.push(KIT.icon(comp, 'out', 62, 112, 42, C.signal, C.ice));
    var x = 104;
    var tabX = [];
    var tabW = [];
    var tab = p.tab === undefined ? 0 : p.tab;
    for (var i = 0; i < TABS.length; i++) {
      var on = i === tab;
      var tl = KIT.text(comp, TABS[i], { size: 24, font: on ? F.bold : F.semi, color: on ? C.navy : C.muted, x: x, y: 112, align: 'left' });
      var w = width(tl);
      tabX.push(x + w / 2);
      tabW.push(w);
      bar.push(tl);
      x += w + 46;
    }
    var u = KIT.rect(comp, 'Tab underline', 100, 5, 2, C.signal, tabX[tab], 145);
    var us = u.property('ADBE Transform Group').property('ADBE Scale');
    if (p.from !== undefined && p.from !== tab && !swept) {
      KIT.keys(u.property('ADBE Transform Group').property('ADBE Position'), [[Math.max(0, T - 0.45), [tabX[p.from], 145]], [T - 0.1, [tabX[tab], 145]]], 80);
      KIT.keys(us, [[Math.max(0, T - 0.45), [tabW[p.from], 100, 100]], [T - 0.1, [tabW[tab], 100, 100]]], 80);
    } else us.setValue([tabW[tab], 100, 100]);
    bar.push(u);
    bar.push(box(comp, 'Share button', 118, 44, 4, 1690, 112, { stroke: C.line, fill: C.white }));
    bar.push(KIT.text(comp, 'Share', { size: 22, font: F.bold, color: C.signal, x: 1690, y: 112 }));
    bar.push(box(comp, 'Edit button', 118, 44, 4, 1824, 112, { fill: C.signal }));
    bar.push(KIT.text(comp, 'Edit', { size: 22, font: F.bold, color: C.white, x: 1824, y: 112 }));
    var all = made.concat(head).concat(bar);
    if (p.intro) {
      // The app arrives: the header drops in, then the tab bar.
      for (var h = 0; h < head.length; h++) KIT.moveFrom(head[h], T - 0.3, 0, -90, 0.5);
      arrive(bar, T, -20);
    } else if (swept) {
      for (var s = 0; s < all.length; s++) KIT.from(all[s], T - 0.26);
    }
    // The sweep passes over the app, not under it.
    if (swept) {
      var sw = [];
      for (var q = 1; q <= comp.numLayers; q++) if (comp.layer(q).name.indexOf('Sweep') === 0) sw.push(comp.layer(q));
      for (q = sw.length - 1; q >= 0; q--) sw[q].moveToBeginning();
    }
    // The page loading line, under the tabs.
    var ld = KIT.rect(comp, 'Loading line', 1920, 4, 0, C.signalBright, 0, 152);
    ld.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-960, 0]);
    var lt = p.intro ? T : Math.max(0, T - 0.5);
    KIT.keys(ld.property('ADBE Transform Group').property('ADBE Scale'), [[lt, [0, 100, 100]], [lt + 0.45, [100, 100, 100]]], 60);
    KIT.keys(ld.property('ADBE Transform Group').property('ADBE Opacity'), [[lt + 0.45, 100], [lt + 0.65, 0]], 50);
  }
  function pageHead(comp, kicker, title, T) {
    var k = KIT.text(comp, String(kicker).toUpperCase(), { size: 22, font: F.bold, color: C.signal, tracking: 160, x: 60, y: 206, align: 'left' });
    var t = KIT.text(comp, title, { size: 54, font: F.black, color: C.navy, x: 60, y: 262, align: 'left' });
    arrive([k], T, 20);
    arrive([t], T + 0.08, 30);
  }

  // ---- widgets and charts ---------------------------------------------------------------------
  // widget(comp, title, left, top, w, h, t, {fill, dark}) → { x, y, w, h, cx, cy }
  function widget(comp, title, x, y, w, h, t, o) {
    o = o || {};
    var out = [box(comp, 'Widget ' + (title || ''), w, h, 10, x + w / 2, y + h / 2, { stroke: o.dark ? o.fill : C.line, fill: o.fill || C.white })];
    if (title) {
      out.push(KIT.text(comp, title, { size: 24, font: F.bold, color: o.dark ? C.white : C.ink, x: x + 28, y: y + 42, align: 'left' }));
    }
    arrive(out, t);
    return { x: x, y: y, w: w, h: h, cx: x + w / 2, cy: y + h / 2 };
  }
  // Vertical bars from a baseline (x, y = bottom-left of the plot), growing in from t.
  function bars(comp, name, x, y, w, h, values, t, o) {
    o = o || {};
    var n = values.length;
    var gap = w / n;
    var bw = Math.min(gap * 0.62, o.max || 110);
    var top = 0;
    var i;
    for (i = 0; i < n; i++) top = Math.max(top, values[i]);
    var out = [];
    for (i = 0; i < n; i++) {
      var bh = Math.max(4, h * values[i] / top);
      var cx = x + gap * i + gap / 2;
      var L = KIT.rect(comp, name + ' bar ' + (i + 1), bw, bh, 4, o.colors ? o.colors[i % o.colors.length] : (o.color || C.signal), cx, y);
      L.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, bh / 2]);
      var tt = t + i * (o.stagger || 0.07);
      KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[tt, [100, 0, 100]], [tt + 0.35, [100, 108, 100]], [tt + 0.5, [100, 100, 100]]], 70);
      out.push(L);
      if (o.labels) {
        var lb = KIT.text(comp, o.labels[i], { size: o.labelSize || 22, font: F.semi, color: C.muted, x: cx, y: y + 30 });
        KIT.fade(lb, tt, tt + 0.3, 0, 100);
        out.push(lb);
      }
      if (o.values) {
        var vl = KIT.text(comp, o.values[i], { size: 24, font: F.bold, color: C.navy, x: cx, y: y - bh - 24 });
        KIT.fade(vl, tt + 0.4, tt + 0.6, 0, 100);
        out.push(vl);
      }
    }
    if (o.axis !== false) {
      var ax = KIT.rect(comp, name + ' axis', w, 2, 0, C.line, x + w / 2, y + 1);
      KIT.fade(ax, t - 0.1, t + 0.1, 0, 100);
      out.push(ax);
    }
    return out;
  }
  // A line chart drawn on (x, y = top-left of the plot), dots popping as it passes.
  function lineChart(comp, name, x, y, w, h, values, t, o) {
    o = o || {};
    var n = values.length;
    var lo = 1e9;
    var hi = -1e9;
    var i;
    for (i = 0; i < n; i++) {
      lo = Math.min(lo, values[i]);
      hi = Math.max(hi, values[i]);
    }
    if (o.zero) lo = 0;
    var pts = [];
    for (i = 0; i < n; i++) pts.push([x + w * i / (n - 1), y + h - h * (values[i] - lo) / Math.max(1, hi - lo)]);
    var L = KIT.shapeLayer(comp, name);
    var g = KIT.group(L, name);
    KIT.pathIn(g, pts, false);
    KIT.stroke(g, o.color || C.signal, o.width || 6);
    var tr = KIT.trim(g);
    var d = o.d || 0.9;
    KIT.keys(tr.property('ADBE Vector Trim End'), [[t, 0], [t + d, 100]], 60);
    KIT.at(L, 0, 0);
    var out = [L];
    if (o.dots !== false) {
      for (i = 0; i < n; i++) {
        var dt = KIT.circle(comp, name + ' dot ' + (i + 1), o.dot || 18, o.color || C.signal, pts[i][0], pts[i][1]);
        KIT.pop(dt, t + d * i / (n - 1));
        out.push(dt);
      }
    }
    if (o.labels) {
      for (i = 0; i < n; i++) {
        var lb = KIT.text(comp, o.labels[i], { size: 20, font: F.semi, color: C.muted, x: pts[i][0], y: y + h + 34 });
        KIT.fade(lb, t, t + 0.3, 0, 100);
        out.push(lb);
      }
    }
    return out;
  }
  // A donut: one stroked ring per slice, each drawing its own arc.
  function donut(comp, name, cx, cy, d, parts, colors, t, thick) {
    var total = 0;
    var i;
    for (i = 0; i < parts.length; i++) total += parts[i];
    var acc = 0;
    var out = [];
    for (i = 0; i < parts.length; i++) {
      var L = KIT.shapeLayer(comp, name + ' slice ' + (i + 1));
      var g = KIT.group(L, 'Slice');
      KIT.ellipseIn(g, d, d);
      KIT.stroke(g, colors[i % colors.length], thick || d * 0.2, false);
      var tr = KIT.trim(g);
      var a = acc / total * 100;
      var b = (acc + parts[i]) / total * 100;
      tr.property('ADBE Vector Trim Start').setValue(a);
      KIT.keys(tr.property('ADBE Vector Trim End'), [[t + i * 0.08, a], [t + i * 0.08 + 0.6, Math.max(a, b - 0.5)]], 70);
      KIT.at(L, cx, cy);
      acc += parts[i];
      out.push(L);
    }
    return out;
  }
  // A half-circle gauge (bottom-centre at cx, cy) filling to pct.
  function gauge(comp, name, cx, cy, r, pct, t) {
    var k = 0.5523 * r;
    var make = function (nm, color) {
      var L = KIT.shapeLayer(comp, nm);
      var g = KIT.group(L, nm);
      KIT.pathIn(g, [[-r, 0], [0, -r], [r, 0]], false, [[0, 0], [-k, 0], [0, -k]], [[0, -k], [k, 0], [0, 0]]);
      KIT.stroke(g, color, r * 0.2);
      KIT.at(L, cx, cy);
      return [L, g];
    };
    var back = make(name + ' track', C.ice);
    var front = make(name + ' fill', C.signal);
    var tr = KIT.trim(front[1]);
    KIT.keys(tr.property('ADBE Vector Trim End'), [[t, 0], [t + 1.2, pct]], 60);
    return [back[0], front[0]];
  }
  // A success toast, top right, sliding in at t and out after `hold`.
  function toast(comp, text, t, hold) {
    var tx = KIT.text(comp, text, { size: 26, font: F.bold, color: C.white, x: 0, y: 214, align: 'left' });
    var w = width(tx) + 120;
    var x = 1880 - w / 2;
    KIT.at(tx, x - w / 2 + 84, 214);
    var b = box(comp, 'Toast', w, 76, 8, x, 214, { fill: C.good });
    var ic = KIT.icon(comp, 'check', x - w / 2 + 44, 214, 44, C.good, C.white);
    tx.moveBefore(ic);
    var out = [b, ic, tx];
    for (var i = 0; i < out.length; i++) {
      KIT.moveFrom(out[i], t, w + 120, 0, 0.4);
      KIT.fade(out[i], t + (hold || 1.6), t + (hold || 1.6) + 0.25, 100, 0);
    }
    return out;
  }
  function button(comp, label, x, y, w, filled) {
    var b = box(comp, label + ' button', w, 52, 4, x, y, filled ? { fill: C.signal } : { stroke: C.line, fill: C.white });
    var t = KIT.text(comp, label, { size: 24, font: F.bold, color: filled ? C.white : C.signal, x: x, y: y });
    return [b, t];
  }
  function pill(comp, text, x, y, o) {
    o = o || {};
    var t = KIT.text(comp, text, { size: o.size || 24, font: F.bold, color: o.ink || C.navy, x: x, y: y });
    var b = box(comp, 'Pill ' + text, width(t) + (o.pad || 48), (o.size || 24) * 2.1, (o.size || 24) * 1.05, x, y, { fill: o.fill || C.ice, stroke: o.stroke });
    t.moveBefore(b);
    return [b, t];
  }

  // ---- scenes ------------------------------------------------------------------------------------
  // The hook: two statements on the empty canvas, then a dashboard builds itself on the beat.
  SCENES.appHook = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var bar = beat * 4;
    shell(comp, { intro: true, tab: p.tab || 0, _transition: 'none' }, T);
    var lines = p.lines || ['Every company has *the data.*', 'Few can make it *answer.*'];
    var w1 = words(comp, lines[0], 520, T + 0.3, beat / 2, 92);
    var w2 = words(comp, lines[1], 660, T + bar + 0.3, beat / 2, 92);
    exitUp(w1.concat(w2), T + bar * 2 - beat * 0.8);
    // The dashboard, one widget per half-beat.
    var t0 = T + bar * 2;
    var step = beat / 2;
    var kp = [['Sessions', 48210, ''], ['Sign-ups', 1284, ''], ['Lessons done', 9870, '']];
    for (var i = 0; i < kp.length; i++) {
      var W = widget(comp, kp[i][0], 40 + i * 620, 180, 600, 200, t0 + i * step);
      var n = KIT.text(comp, '0', { size: 78, font: F.black, color: C.navy, x: W.x + 28, y: W.y + 130, align: 'left' });
      KIT.countUp(n, t0 + i * step + 0.1, t0 + i * step + 1.1, kp[i][1], kp[i][2]);
      arrive([n], t0 + i * step + 0.05);
      var sp = lineChart(comp, kp[i][0] + ' spark', W.x + 360, W.y + 90, 200, 70, [3, 5, 4, 7, 6, 9, 11], t0 + i * step + 0.3, { dots: false, width: 5, color: C.frost });
      fadeAll(sp, t0 + i * step + 0.3, t0 + i * step + 0.4, 0, 100);
    }
    var B = widget(comp, 'Sign-ups by source', 40, 400, 900, 470, t0 + step * 3);
    bars(comp, 'Source', B.x + 60, B.y + 400, 780, 290, [42, 27, 14, 11, 6], t0 + step * 3 + 0.2, { labels: ['Google', 'YouTube', 'LinkedIn', 'Direct', 'Other'] });
    var L = widget(comp, 'Sessions by week', 980, 400, 900, 470, t0 + step * 4);
    lineChart(comp, 'Weekly', L.x + 70, L.y + 110, 760, 260, [120, 160, 150, 210, 260, 250, 330, 410], t0 + step * 4 + 0.2, { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] });
    // The point, on the last bar.
    var tp = T + bar * 3;
    var pl = pill(comp, p.pill || 'Someone has to build this. Why not you?', 960, 975, { size: 36, fill: C.navy, ink: C.white, pad: 90 });
    KIT.pop(pl[0], tp);
    KIT.pop(pl[1], tp + 0.06);
  };

  // Why learn: four reasons, each a widget with its own small chart.
  SCENES.whyLearn = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    shell(comp, p, T);
    pageHead(comp, p.kicker || 'Why learn CRM Analytics', p.title || 'Four reasons it is worth your time', T);
    var R = p.reasons || [
      { icon: 'db', head: 'Every Salesforce org has the data', line: 'Most of it never becomes an answer.' },
      { icon: 'out', head: 'Leaders decide from dashboards', line: 'Build the ones they open every morning.' },
      { icon: 'brief', head: 'Teams hire for it', line: 'New CRM Analytics roles, daily on /jobs.' },
      { icon: 'spark', head: 'It goes far past reports', line: 'Recipes, SAQL, security, AI, embedding.' }
    ];
    for (var i = 0; i < R.length && i < 4; i++) {
      var x = 40 + (i % 2) * 940;
      var y = 312 + Math.floor(i / 2) * 378;
      var t = T + 0.35 + i * beat * 1.5;
      var W = widget(comp, null, x, y, 900, 350, t);
      var ic = KIT.icon(comp, R[i].icon, x + 96, y + 100, 120, C.signal, C.ice);
      KIT.pop(ic, t + 0.1);
      var hd = KIT.text(comp, R[i].head, { size: 40, font: F.black, color: C.navy, x: x + 180, y: y + 82, align: 'left' });
      var ln = KIT.text(comp, R[i].line, { size: 27, font: F.medium, color: C.muted, x: x + 180, y: y + 134, align: 'left' });
      arrive([hd, ln], t + 0.12);
      var tc = t + 0.4;
      if (i === 0) bars(comp, 'Unused', x + 180, y + 310, 660, 120, [3, 5, 4, 6, 8, 7, 9, 11, 10, 12], tc, { colors: [C.frost, C.frost, C.frost, C.frost, C.frost, C.frost, C.frost, C.frost, C.frost, C.signal], max: 44, stagger: 0.04 });
      else if (i === 1) lineChart(comp, 'Daily', x + 180, y + 200, 660, 100, [2, 3, 3, 5, 4, 6, 8, 9], tc, { dot: 14 });
      else if (i === 2) bars(comp, 'Roles', x + 180, y + 310, 660, 120, [2, 3, 3, 4, 5, 6, 7, 9], tc, { color: C.good, max: 50, stagger: 0.05 });
      else {
        var tags = ['Recipes', 'SAQL', 'Security', 'AI', 'Embedding'];
        var px = x + 180;
        for (var k = 0; k < tags.length; k++) {
          var pt = pill(comp, tags[k], 0, y + 262, { size: 24 });
          var pw = width(pt[1]) + 48;
          KIT.at(pt[0], px + pw / 2, y + 262);
          KIT.at(pt[1], px + pw / 2, y + 262);
          KIT.pop(pt[0], tc + k * beat / 2);
          KIT.pop(pt[1], tc + k * beat / 2 + 0.04);
          px += pw + 16;
        }
      }
    }
  };

  // How you learn: the steps as a recipe; Run sends a packet through and every node ticks.
  SCENES.approach = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var bar = beat * 4;
    shell(comp, p, T);
    pageHead(comp, p.kicker || 'How you learn', p.title || 'Learn it the way you will use it at work', T);
    var W = widget(comp, 'Recipe · your learning path', 40, 312, 1840, 738, T + 0.2);
    var run = button(comp, 'Run', 1790, 360, 120, true);
    arrive(run, T + 0.3);
    var S = p.steps || [
      { icon: 'play', name: 'Watch', sub: 'Short lessons' },
      { icon: 'db', name: 'Build', sub: 'On real data' },
      { icon: 'check', name: 'Check', sub: 'A quiz every lesson' },
      { icon: 'badge', name: 'Practise', sub: 'Exam sets and drills' },
      { icon: 'award', name: 'Ship', sub: 'Capstone + certificate' }
    ];
    var y = 640;
    var xs = [];
    var i;
    for (i = 0; i < S.length; i++) xs.push(260 + i * (1400 / (S.length - 1)));
    for (i = 0; i < S.length; i++) {
      var tn = T + 0.5 + i * beat * 1.5;
      var rg = ring(comp, 'Node ring ' + S[i].name, 170, xs[i], y, C.frost, 4);
      var ic = KIT.icon(comp, S[i].icon, xs[i], y, 140, C.signal, C.ice);
      KIT.pop(rg, tn);
      KIT.pop(ic, tn + 0.05);
      var nm = KIT.text(comp, S[i].name, { size: 36, font: F.black, color: C.navy, x: xs[i], y: y + 130 });
      var sb = KIT.text(comp, S[i].sub, { size: 25, font: F.medium, color: C.muted, x: xs[i], y: y + 176 });
      arrive([nm, sb], tn + 0.1, 20);
      if (i < S.length - 1) KIT.wire(comp, 'Link ' + (i + 1), [xs[i] + 95, y], [xs[i + 1] - 95, y], C.frost, 5, tn + beat * 0.6, tn + beat * 1.3, false);
    }
    // Run: the cursor clicks, a packet runs the steps, each one ticks.
    var tr = T + bar * 2 + beat;
    KIT.cursor(comp, [1400, 950], [1790, 360], tr, C.signal, true);
    var pk = KIT.circle(comp, 'Packet', 30, C.signalBright, xs[0], y);
    var pp = [];
    var tick = 0.38;
    for (i = 0; i < S.length; i++) pp.push([tr + 0.25 + i * tick, [xs[i], y]]);
    KIT.keys(pk.property('ADBE Transform Group').property('ADBE Position'), pp, 50);
    KIT.keys(pk.property('ADBE Transform Group').property('ADBE Opacity'), [[tr + 0.2, 0], [tr + 0.3, 100], [tr + 0.25 + (S.length - 1) * tick, 100], [tr + 0.4 + (S.length - 1) * tick, 0]], 40);
    for (i = 0; i < S.length; i++) {
      var tk = KIT.icon(comp, 'check', xs[i] + 62, y - 62, 52, C.white, C.good);
      KIT.pop(tk, tr + 0.25 + i * tick);
    }
    toast(comp, p.toast || 'Run complete · 5 of 5 steps', tr + 0.4 + S.length * tick, 1.5);
  };

  // Real data: the Explorer. Query on the left, the chart on the right swapping type.
  SCENES.realData = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var bar = beat * 4;
    shell(comp, p, T);
    pageHead(comp, p.kicker || 'Built on real data', p.title || 'This platform\'s own traffic, sign-ups and lessons', T);
    var Q = widget(comp, 'Query', 40, 312, 520, 738, T + 0.2);
    var rows = p.query || [['DATASET', 'academy_traffic'], ['MEASURE', 'Count of Sessions'], ['GROUP BY', 'Source'], ['FILTER', 'Last 8 weeks']];
    var i;
    for (i = 0; i < rows.length; i++) {
      var ry = 410 + i * 150;
      var lb = KIT.text(comp, rows[i][0], { size: 18, font: F.bold, color: C.muted, tracking: 140, x: 72, y: ry, align: 'left' });
      var bx = box(comp, 'Field ' + rows[i][0], 456, 62, 6, 300, ry + 52, { stroke: C.frost, fill: C.ice });
      var vt = KIT.text(comp, rows[i][1], { size: 26, font: F.semi, color: C.navy, x: 94, y: ry + 52, align: 'left' });
      arrive([lb, bx, vt], T + 0.5 + i * beat, 20);
    }
    var Cw = widget(comp, p.chart || 'Sessions by source', 600, 312, 1280, 738, T + 0.3);
    // The chart-type picker (bar, donut, line); the highlight follows the clicks.
    var px = [1700, 1764, 1828];
    var hl = box(comp, 'Picker highlight', 56, 56, 6, px[0], 366, { stroke: C.signal, width: 3, fill: C.ice });
    arrive([hl], T + 0.4, 10);
    var kinds = ['bar', 'donut', 'line'];
    for (i = 0; i < 3; i++) {
      var L = KIT.shapeLayer(comp, 'Chart type ' + kinds[i]);
      var g = KIT.group(L, 'Glyph');
      if (kinds[i] === 'bar') {
        KIT.rectIn(g, 7, 12, 1, -9, 5);
        KIT.rectIn(g, 7, 20, 1, 0, 1);
        KIT.rectIn(g, 7, 28, 1, 9, -3);
        KIT.fill(g, C.navy);
      } else if (kinds[i] === 'donut') {
        KIT.ellipseIn(g, 24, 24);
        KIT.stroke(g, C.navy, 6, false);
      } else {
        KIT.pathIn(g, [[-14, 10], [-4, 0], [4, 6], [14, -10]], false);
        KIT.stroke(g, C.navy, 4);
      }
      var fr = KIT.group(L, 'Frame');
      KIT.rectIn(fr, 56, 56, 6);
      KIT.stroke(fr, C.line, 2);
      KIT.at(L, px[i], 366);
      arrive([L], T + 0.4, 10);
    }
    var hp = hl.property('ADBE Transform Group').property('ADBE Position');
    var labels = p.labels || ['Google', 'YouTube', 'LinkedIn', 'Direct', 'Other'];
    var vals = p.values || [42, 27, 14, 11, 6];
    // 1. bars
    var tb = T + 0.9;
    var b1 = bars(comp, 'Sessions', 700, 950, 1080, 460, vals, tb, { labels: labels, values: (function () { var o = []; for (var k = 0; k < vals.length; k++) o.push(vals[k] + '%'); return o; }()) });
    // 2. donut
    var tc1 = T + bar * 1.5;
    KIT.cursor(comp, [1500, 800], [px[1], 366], tc1, C.signal, true);
    KIT.keys(hp, [[tc1, [px[0], 366]], [tc1 + 0.2, [px[1], 366]]], 80);
    fadeAll(b1, tc1, tc1 + 0.2, 100, 0);
    var cols = [C.navy, C.signal, C.signalBright, C.frost, C.line];
    var d1 = donut(comp, 'Share', 1000, 690, 420, vals, cols, tc1 + 0.15);
    var lg = [];
    for (i = 0; i < labels.length; i++) {
      var ly = 520 + i * 80;
      var dot = KIT.circle(comp, 'Legend ' + labels[i], 26, cols[i], 1360, ly);
      var lt = KIT.text(comp, labels[i], { size: 30, font: F.semi, color: C.ink, x: 1392, y: ly, align: 'left' });
      var lv = KIT.text(comp, vals[i] + '%', { size: 30, font: F.black, color: C.navy, x: 1740, y: ly, align: 'right' });
      lg.push(dot, lt, lv);
      arrive([dot, lt, lv], tc1 + 0.2 + i * 0.07, 16);
    }
    // 3. line
    var tc2 = T + bar * 2.6;
    KIT.cursor(comp, [1500, 800], [px[2], 366], tc2, C.signal, true);
    KIT.keys(hp, [[tc2, [px[1], 366]], [tc2 + 0.2, [px[2], 366]]], 80);
    fadeAll(d1.concat(lg), tc2, tc2 + 0.2, 100, 0);
    lineChart(comp, 'Weekly sessions', 720, 480, 1040, 400, p.weekly || [120, 160, 150, 210, 260, 250, 330, 410], tc2 + 0.15, { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], d: 1.0 });
    var ch = pill(comp, p.callout || 'Your own data. Your own answers.', 1240, 980, { size: 26, fill: C.navy, ink: C.white });
    KIT.pop(ch[0], tc2 + 1.3);
    KIT.pop(ch[1], tc2 + 1.35);
  };

  // The path: the sections as a list widget, each row's progress filling in turn.
  SCENES.pathList = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    shell(comp, p, T);
    pageHead(comp, p.kicker || 'The path', p.title || '7 sections · 34 lessons · one clear order', T);
    widget(comp, 'Course sections', 40, 312, 1220, 738, T + 0.2);
    var S = p.sections || [['Foundations', 3], ['Data Prep', 8], ['Visualization', 5], ['SAQL', 6], ['Interactions and Bindings', 5], ['Sharing and Embedding', 4], ['Einstein Discovery', 3]];
    var i;
    for (i = 0; i < S.length; i++) {
      var y = 410 + i * 90;
      var t = T + 0.35 + i * beat / 2;
      var nc = KIT.circle(comp, 'Row ' + (i + 1), 50, C.ice, 100, y);
      var nn = KIT.text(comp, String(i + 1), { size: 24, font: F.black, color: C.navy, x: 100, y: y });
      var nm = KIT.text(comp, S[i][0], { size: 30, font: F.bold, color: C.ink, x: 146, y: y, align: 'left' });
      var tk = KIT.rect(comp, 'Track ' + (i + 1), 340, 12, 6, C.ice, 860, y);
      var fl = KIT.rect(comp, 'Progress ' + (i + 1), 340, 12, 6, C.signal, 690, y);
      fl.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-170, 0]);
      var ct = KIT.text(comp, S[i][1] + ' lessons', { size: 24, font: F.semi, color: C.muted, x: 1210, y: y, align: 'right' });
      arrive([nc, nn, nm, tk, fl, ct], t, 18);
      var tf = t + beat * 2;
      KIT.keys(fl.property('ADBE Transform Group').property('ADBE Scale'), [[t, [0, 100, 100]], [tf, [0, 100, 100]], [tf + 0.5, [100, 100, 100]]], 70);
      var ck = KIT.icon(comp, 'check', 1060, y, 34, C.white, C.good);
      KIT.pop(ck, tf + 0.45);
    }
    var K = p.kpis || [['Lessons', 34, ''], ['Languages', 7, ''], ['Exam practice', 0, '3 sets + 6 drills']];
    for (i = 0; i < K.length; i++) {
      var tw = T + 0.5 + i * beat;
      var W = widget(comp, K[i][0], 1300, 312 + i * 254, 580, 230, tw);
      var n = KIT.text(comp, K[i][1] ? '0' : K[i][2], { size: K[i][1] ? 88 : 52, font: F.black, color: C.navy, x: W.x + 28, y: W.y + 140, align: 'left' });
      if (K[i][1]) KIT.countUp(n, tw + 0.1, tw + 1.1, K[i][1], '');
      arrive([n], tw + 0.08);
    }
  };

  // Query mode: SAQL typed in the editor, Run, the results land.
  SCENES.queryMode = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var bar = beat * 4;
    shell(comp, p, T);
    pageHead(comp, p.kicker || 'Query mode', p.title || 'Then go past clicks: write SAQL', T);
    widget(comp, 'SAQL', 40, 312, 1100, 738, T + 0.2, { fill: C.code, dark: true });
    var run = button(comp, 'Run', 1060, 360, 120, true);
    arrive(run, T + 0.3);
    var lines = p.lines || [
      'q = load "academy_signups";',
      'q = filter q by \'Source\' != "Direct";',
      'q = group q by \'Source\';',
      'q = foreach q generate \'Source\', count() as \'Signups\';',
      'q = order q by \'Signups\' desc;',
      'q = limit q 3;'
    ];
    var i;
    for (i = 0; i < lines.length; i++) {
      var y = 440 + i * 62;
      var no = KIT.text(comp, String(i + 1), { size: 24, font: F.mono, color: C.frost, x: 92, y: y, align: 'right' });
      KIT.fade(no, T + 0.3, T + 0.5, 0, 60);
      var L = KIT.text(comp, lines[i], { size: 27, font: F.mono, color: i % 2 ? C.frost : C.white, x: 120, y: y, align: 'left' });
      typeOn(L, T + 0.5 + i * 0.6, 75);
    }
    var tq = T + bar * 2;
    KIT.cursor(comp, [900, 980], [1060, 360], tq, C.signalBright, true);
    var R = widget(comp, 'Results', 1180, 312, 700, 738, T + 0.35);
    var empty = KIT.text(comp, 'Run the query to see rows', { size: 26, font: F.medium, color: C.muted, x: R.cx, y: R.cy });
    KIT.fade(empty, T + 0.6, T + 0.9, 0, 100);
    KIT.fade(empty, tq, tq + 0.15, 100, 0);
    var hd1 = KIT.text(comp, 'SOURCE', { size: 20, font: F.bold, color: C.muted, tracking: 140, x: 1220, y: 430, align: 'left' });
    var hd2 = KIT.text(comp, 'SIGNUPS', { size: 20, font: F.bold, color: C.muted, tracking: 140, x: 1818, y: 430, align: 'right' });
    arrive([hd1, hd2], tq + 0.1, 10);
    var res = p.results || [['Google', 412], ['YouTube', 268], ['LinkedIn', 141]];
    for (i = 0; i < res.length; i++) {
      var ry = 510 + i * 110;
      var tt = tq + 0.2 + i * 0.15;
      var rb = box(comp, 'Result row ' + (i + 1), 640, 90, 8, 1530, ry, { fill: C.paper });
      var rn = KIT.text(comp, res[i][0], { size: 30, font: F.bold, color: C.ink, x: 1236, y: ry, align: 'left' });
      var rv = KIT.text(comp, String(res[i][1]), { size: 32, font: F.black, color: C.navy, x: 1820, y: ry, align: 'right' });
      var mb = KIT.rect(comp, 'Result bar ' + (i + 1), 260 * res[i][1] / res[0][1], 14, 7, C.signal, 1440, ry);
      mb.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-130 * res[i][1] / res[0][1], 0]);
      KIT.at(mb, 1440, ry);
      arrive([rb, rn, rv], tt, 20);
      KIT.keys(mb.property('ADBE Transform Group').property('ADBE Scale'), [[tt + 0.1, [0, 100, 100]], [tt + 0.5, [100, 100, 100]]], 70);
    }
    toast(comp, p.toast || '3 rows · 0.04 s', tq + 0.5, 1.4);
  };

  // Prove it: a practice exam score, interview questions, the capstone certificate.
  SCENES.proveIt = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var bar = beat * 4;
    shell(comp, p, T);
    pageHead(comp, p.kicker || 'Prove it', p.title || 'Practise the exam. Ship a capstone.', T);
    // 1. the exam
    var t1 = T + 0.25;
    var A = widget(comp, 'Practice exam', 40, 312, 590, 738, t1);
    var gs = gauge(comp, 'Score', A.cx, 700, 210, p.score || 86, t1 + 0.4);
    fadeAll(gs, t1, t1 + 0.25, 0, 100);
    var sc = KIT.text(comp, '0', { size: 96, font: F.black, color: C.navy, x: A.cx, y: 640 });
    KIT.countUp(sc, t1 + 0.4, t1 + 1.6, p.score || 86, '%');
    KIT.fade(sc, t1 + 0.3, t1 + 0.5, 0, 100);
    var sl = KIT.text(comp, 'Consultant exam · full set', { size: 25, font: F.semi, color: C.muted, x: A.cx, y: 760 });
    KIT.fade(sl, t1 + 0.6, t1 + 0.9, 0, 100);
    var sets = ['Set 1', 'Set 2', 'Set 3', '6 drills'];
    var sx = [105, 225, 345, 480];
    for (var i = 0; i < sets.length; i++) {
      var sp = pill(comp, sets[i], A.x + sx[i], 900, { size: 22 });
      KIT.pop(sp[0], t1 + 1.0 + i * 0.12);
      KIT.pop(sp[1], t1 + 1.04 + i * 0.12);
    }
    // 2. interview questions
    var t2 = T + beat * 2;
    var B = widget(comp, 'Interview Q&A', 665, 312, 590, 738, t2);
    var qs = p.questions || ['When do you use a left join?', 'How does a security predicate work?', 'What is a results binding?', 'How do you speed up a dashboard?'];
    for (i = 0; i < qs.length; i++) {
      var qy = 440 + i * 145;
      var tq = t2 + 0.3 + i * beat / 2;
      var qb = box(comp, 'Question ' + (i + 1), 534, 120, 8, B.cx, qy, { stroke: C.line, fill: C.paper });
      var qt = KIT.text(comp, wrap(qs[i], 30), { size: 26, font: F.bold, color: C.ink, x: B.x + 52, y: qy, align: 'left', leading: 32 });
      var qi = KIT.icon(comp, 'chat', B.x + B.w - 70, qy, 54, C.signal, C.ice);
      arrive([qb, qt, qi], tq, 24);
    }
    // 3. the certificate
    var t3 = T + beat * 4;
    var Cc = widget(comp, 'Capstone', 1290, 312, 590, 738, t3);
    var cert = box(comp, 'Certificate', 500, 520, 10, Cc.cx, 700, { stroke: C.frost, fill: C.ice, width: 3 });
    var inner = box(comp, 'Certificate border', 460, 480, 6, Cc.cx, 700, { stroke: C.frost, width: 2, dash: 10 });
    var aw = KIT.icon(comp, 'award', Cc.cx, 540, 130, C.sun, C.white);
    var ct = KIT.text(comp, 'Certificate of completion', { size: 30, font: F.black, color: C.navy, x: Cc.cx, y: 650 });
    var cs = KIT.text(comp, 'CRM Analytics capstone', { size: 24, font: F.semi, color: C.muted, x: Cc.cx, y: 698 });
    var nl = KIT.rect(comp, 'Name line', 320, 3, 1, C.frost, Cc.cx, 820);
    var nm = KIT.text(comp, p.name || 'Your name here', { size: 38, font: F.bold, color: C.signal, x: Cc.cx, y: 790 });
    arrive([cert, inner, aw, ct, cs, nl], t3 + 0.2, 30);
    typeOn(nm, t3 + 0.9, 22);
    var stamp = KIT.icon(comp, 'check', Cc.cx + 190, 900, 110, C.white, C.good);
    stamp.property('ADBE Transform Group').property('ADBE Rotate Z').setValue(-12);
    KIT.pop(stamp, T + bar * 2.4);
  };

  // ---- your camera clip --------------------------------------------------------------------------
  // With p._clip (the build found the file): the clip full frame, with a lower third.
  // Without it: a placeholder that says exactly what to record.
  SCENES.clipSlot = function (comp, p, T, dur) {
    KIT.enter(comp, p._transition || 'slices', C.navy, T);
    if (p._clip) {
      KIT.footage = KIT.footage || {};
      var it = KIT.footage[p._clip];
      if (!it) {
        it = app.project.importFile(new ImportOptions(new File(p._clip)));
        it.parentFolder = KIT.folder('Camera', KIT.screensFolder ? KIT.screensFolder.parentFolder : null);
        KIT.footage[p._clip] = it;
      }
      var V = comp.layers.add(it);
      V.name = 'Camera ' + (p.n || 1);
      V.startTime = T;
      var s = Math.max(comp.width / it.width, comp.height / it.height) * 100;
      V.property('ADBE Transform Group').property('ADBE Scale').setValue([s, s]);
      KIT.at(V, 960, 540);
      KIT.fade(V, T - 0.25, T - 0.05, 0, 100);
    } else {
      KIT.blobs(comp, C.frost, 5, 40 + (p.n || 1), 6);
      var fr = box(comp, 'Placeholder frame', 1560, 800, 22, 960, 500, { stroke: C.frost, width: 4, dash: 18, fill: C.white, opacity: 5 });
      var nn = ('0' + (p.n || 1)).slice(-2);
      var eb = KIT.eyebrow(comp, 'Your clip ' + nn + ' · drop it in, rebuild', 960, 190, C.frost);
      var tt = KIT.text(comp, p.title || 'Your clip', { size: 92, font: F.black, color: C.white, y: 300 });
      var sy = KIT.text(comp, '“' + wrap(p.say || '', 52) + '”', { size: 38, font: F.medium, color: C.frost, y: 470, leading: 52 });
      var notes = p.notes || [];
      var nt = KIT.text(comp, notes.join('\r'), { size: 24, font: F.mono, color: C.frost, y: 720, leading: 36 });
      var fl = KIT.text(comp, 'studio/workspace/01-camera/' + (p._film || 'trailer') + '/' + (p.file || 'clip-' + nn + '.mov'), { size: 26, font: F.monoBold, color: C.white, y: 860 });
      var ph = [fr, eb, tt, sy, nt, fl];
      for (var i = 0; i < ph.length; i++) ph[i].name = 'Placeholder ' + ph[i].name;
      arrive(ph, T, 24);
    }
    if (p.lower) {
      var tl = T + 0.6;
      var name = KIT.text(comp, p.lower.name || 'Swarnil Singhai', { size: 40, font: F.black, color: C.navy, x: 112, y: 930, align: 'left' });
      var role = KIT.text(comp, p.lower.role || 'CRM Analytics Academy', { size: 26, font: F.semi, color: C.muted, x: 112, y: 978, align: 'left' });
      var lw = Math.max(width(name), width(role)) + 110;
      var card = box(comp, 'Lower third', lw, 140, 10, 60 + lw / 2, 952, { fill: C.white });
      var acc = KIT.rect(comp, 'Lower third accent', 10, 140, 0, C.signal, 65, 952);
      name.moveBefore(card);
      role.moveBefore(card);
      acc.moveBefore(card);
      var lt3 = [card, acc, name, role];
      for (var k = 0; k < lt3.length; k++) {
        KIT.moveFrom(lt3[k], tl + k * 0.04, -lw - 120, 0, 0.5);
        KIT.fade(lt3[k], T + dur - 0.9, T + dur - 0.6, 100, 0);
      }
    }
  };
  // The parts, for the other scene files (kinetic.jsx).
  KIT.ui = { box: box, ring: ring, width: width, arrive: arrive, fadeAll: fadeAll, exitUp: exitUp, wrap: wrap, typeOn: typeOn, widget: widget, bars: bars, lineChart: lineChart, donut: donut, toast: toast, button: button, pill: pill, gauge: gauge };
}());
