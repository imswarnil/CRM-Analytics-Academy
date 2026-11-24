// CRM Analytics Academy — scenes for films laid out on one canvas (the trailer).
//
// The trailer sells the way the course teaches, not the content: kinetic type
// asks the questions, then short glimpses show concepts turning into motion
// graphics. Every scene here is a card on the film's canvas (film.jsx
// KIT.canvasMaster); the view travels between cards along a drawn line.
//
//   typeLine     one line of kinetic type, a different treatment per `style`:
//                welcome (per-character rise, tracking opening, a line drawing),
//                question (small type-on, big wipe reveal, "?" slams on the downbeat),
//                swap (the last word swaps on every beat, slot-machine, masked),
//                underline (type-on, small/big contrast, a word on a drawn line),
//                tracking (characters fall in random order as the tracking opens)
//   method       a caption (a statement about how you learn) over a board where
//                one or two glimpses play: venn, binding, flow, trend, build, quiz, realdata
//   buildMontage what you will build: three dashboards slide in on the beat
//   aiFlash      a prompt types, a mockup sketches itself, the data is checked
//
// Text animators: KIT.animator(layer, spec) adds an After Effects Text Animator
// with a Range Selector (per-character offsets, staggered by the selector).

SCENES_INFO.push(
  { type: 'typeLine', label: 'Kinetic type line (welcome, question, swap, underline, tracking)', props: { style: 'question', small: 'Want to learn', big: 'CRM Analytics', mark: '?' } },
  { type: 'method', label: 'How you learn: a caption, then glimpses (venn, binding, flow, trend, build, quiz, realdata)', props: { caption: 'Every concept, drawn.', glimpses: [{ kind: 'venn', term: 'LEFT JOIN' }, { kind: 'binding', term: 'BINDING' }] } },
  { type: 'buildMontage', label: 'What you will build: three dashboards slide in', props: { caption: 'What you’ll build.' } },
  { type: 'aiFlash', label: 'AI: prompt, mockup sketch, data checks', props: { caption: 'With AI at your side.' } }
);

// ---- text animators -----------------------------------------------------------------------------
// spec.props: { pos: [x, y], scale: n, rot: deg, opacity: n, tracking: n } — the values a fully
// selected character gets. spec.shape: 1 square, 2 ramp up (default), 3 ramp down, 6 smooth.
// spec.based: 1 characters, 2 characters without spaces, 3 words. spec.random: random order.
// spec.end: the selector's End (the width of the ramp, %). spec.offset: [[t, v], …] keys on Offset.
// spec.keys: { pos|scale|rot|opacity|tracking: [[t, v], …] } keys on the animator's values.
KIT.animator = function (L, spec) {
  var MN = { pos: 'ADBE Text Position 3D', scale: 'ADBE Text Scale 3D', rot: 'ADBE Text Rotation', opacity: 'ADBE Text Opacity', tracking: 'ADBE Text Tracking Amount' };
  var anims = L.property('ADBE Text Properties').property('ADBE Text Animators');
  anims.addProperty('ADBE Text Animator');
  var idx = anims.numProperties;
  function get() {
    return L.property('ADBE Text Properties').property('ADBE Text Animators').property(idx);
  }
  function val(k, v) {
    if (k === 'pos') return [v[0], v[1], 0];
    if (k === 'scale') return v instanceof Array ? v : [v, v, 100];
    return v;
  }
  var P = spec.props || {};
  var k;
  var used = [];
  for (k in P) if (P.hasOwnProperty(k)) used.push(k);
  if (spec.keys) for (k in spec.keys) if (spec.keys.hasOwnProperty(k) && !P.hasOwnProperty(k)) used.push(k);
  var i;
  for (i = 0; i < used.length; i++) get().property('ADBE Text Animator Properties').addProperty(MN[used[i]]);
  for (i = 0; i < used.length; i++) {
    var pr = get().property('ADBE Text Animator Properties').property(MN[used[i]]);
    if (P.hasOwnProperty(used[i])) pr.setValue(val(used[i], P[used[i]]));
    if (spec.keys && spec.keys[used[i]]) {
      var ks = spec.keys[used[i]];
      for (var j = 0; j < ks.length; j++) pr.setValueAtTime(ks[j][0], val(used[i], ks[j][1]));
      KIT.easeAll(pr, spec.ease || 70);
    }
  }
  get().property('ADBE Text Selectors').addProperty('ADBE Text Selector');
  var sel = get().property('ADBE Text Selectors').property(1);
  var adv = sel.property('ADBE Text Range Advanced');
  adv.property('ADBE Text Range Shape').setValue(spec.shape || 2);
  if (spec.based) adv.property('ADBE Text Range Type2').setValue(spec.based);
  if (spec.random) adv.property('ADBE Text Randomize Order').setValue(1);
  sel = get().property('ADBE Text Selectors').property(1);
  if (spec.end !== undefined) sel.property('ADBE Text Percent End').setValue(spec.end);
  if (spec.offset) KIT.keys(get().property('ADBE Text Selectors').property(1).property('ADBE Text Percent Offset'), spec.offset, spec.ease || 40);
  return get;
};
// Characters arrive one after another from t over d seconds, offset by `from` while hidden.
KIT.charsIn = function (L, t, d, from, o) {
  o = o || {};
  var spread = o.spread || 22;
  var P = { opacity: 0 };
  if (from.pos) P.pos = from.pos;
  if (from.scale !== undefined) P.scale = from.scale;
  if (from.rot !== undefined) P.rot = from.rot;
  return KIT.animator(L, { props: P, shape: 2, end: spread, offset: [[t, -spread], [t + d, 100]], based: o.based || 2, random: o.random, ease: o.ease || 30 });
};
// A rectangular mask in the layer's own space (x0, y0)-(x1, y1); returns its path property.
KIT.maskRect = function (L, x0, y0, x1, y1) {
  var mk = L.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
  var sh = new Shape();
  sh.vertices = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  sh.closed = true;
  mk.property('ADBE Mask Shape').setValue(sh);
  return mk.property('ADBE Mask Shape');
};
// Wipe a text layer on from left to right inside its own bounds.
KIT.wipeIn = function (L, t, d) {
  var r = L.sourceRectAtTime(0, false);
  var x0 = r.left - 20;
  var x1 = r.left + r.width + 30;
  var y0 = r.top - 40;
  var y1 = r.top + r.height + 40;
  var path = KIT.maskRect(L, x0, y0, x0, y1);
  var a = new Shape();
  a.vertices = [[x0, y0], [x0 + 1, y0], [x0 + 1, y1], [x0, y1]];
  a.closed = true;
  var b = new Shape();
  b.vertices = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  b.closed = true;
  path.setValueAtTime(t, a);
  path.setValueAtTime(t + d, b);
  KIT.easeAll(path, 80);
};

(function () {
  var C = KIT.C;
  var F = KIT.F;
  var U = KIT.ui;
  var BG = { navy: C.navy, navyDeep: C.navyDeep, signal: C.signal, paper: C.paper, white: C.white };

  function width(L) {
    return L.sourceRectAtTime(0, false).width;
  }
  function fit(comp, str, o, maxW) {
    var L = KIT.text(comp, str, o);
    var w = width(L);
    if (w <= maxW) return L;
    var o2 = {};
    for (var k in o) if (o.hasOwnProperty(k)) o2[k] = o[k];
    o2.size = Math.floor(o.size * maxW / w);
    L.remove();
    return KIT.text(comp, str, o2);
  }
  // A line drawn left to right under something (anchored at its left end).
  function rule(comp, name, x, y, w, h, color, t, d) {
    var L = KIT.rect(comp, name, w, h, h / 2, color, x + w / 2, y);
    L.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-w / 2, 0]);
    KIT.at(L, x, y);
    KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[t, [0, 100, 100]], [t + (d || 0.4), [100, 100, 100]]], 85);
    return L;
  }
  // A punctuation mark that lands hard on a downbeat.
  function slamMark(L, t) {
    var pre = KIT.PRE;
    KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[t - pre, [320, 320, 100]], [t, [92, 92, 100]], [t + 0.12, [104, 104, 100]], [t + 0.24, [100, 100, 100]]], KIT.EASE.pop);
    KIT.keys(L.property('ADBE Transform Group').property('ADBE Rotate Z'), [[t - pre, -24], [t, 4], [t + 0.24, 0]], KIT.EASE.pop);
    KIT.opacityKeys(L, [[0, 0], [t - pre, 0], [t - pre + 0.04, 100]], 30);
  }
  function dark(name) {
    return name === 'navy' || name === 'navyDeep' || name === 'signal';
  }

  // ---- kinetic type lines --------------------------------------------------------------------------
  SCENES.typeLine = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    var bgName = p.bg || 'navy';
    KIT.enter(comp, p._transition || 'canvas', BG[bgName], T);
    var dk = dark(bgName);
    var ink = dk ? C.white : C.navy;
    var acc = bgName === 'signal' ? C.navyDeep : (dk ? C.frost : C.signal);
    var st = p.style || 'welcome';
    var L;
    var x0;
    if (st === 'welcome') {
      if (p.mark !== false) KIT.mark(comp, 960, 250, 120, T);
      L = fit(comp, p.text || 'Welcome.', { size: p.size || 270, font: F.black, color: ink, y: 560 }, 1700);
      KIT.charsIn(L, T, 0.5, { pos: [0, 160], rot: 12 }, { spread: 30 });
      // On the next beat the word opens up and a line draws under it.
      KIT.animator(L, { props: {}, shape: 1, keys: { tracking: [[T + b, 0], [T + b * 3.2, 40]] }, ease: 60 });
      var w = width(L) + 120;
      rule(comp, 'Welcome line', 960 - w / 2, 760, w, 12, acc, T + b, 0.5);
    } else if (st === 'question') {
      // Small type-on, then the big words wiped on, then "?" on the downbeat.
      var big = KIT.text(comp, p.big || 'CRM Analytics', { size: p.size || 190, font: F.black, color: acc, x: 0, y: 620, align: 'left' });
      var mk = KIT.text(comp, p.mark || '?', { size: (p.size || 190) * 1.25, font: F.black, color: ink, x: 0, y: 600, align: 'left' });
      var total = width(big) + 24 + width(mk);
      if (total > 1720) {
        big.remove();
        mk.remove();
        var sz = Math.floor((p.size || 190) * 1720 / total);
        big = KIT.text(comp, p.big || 'CRM Analytics', { size: sz, font: F.black, color: acc, x: 0, y: 620, align: 'left' });
        mk = KIT.text(comp, p.mark || '?', { size: sz * 1.25, font: F.black, color: ink, x: 0, y: 600, align: 'left' });
        total = width(big) + 24 + width(mk);
      }
      x0 = 960 - total / 2;
      KIT.at(big, x0, 620);
      KIT.at(mk, x0 + width(big) + 24, 600);
      var sm = KIT.text(comp, p.small || 'Want to learn', { size: 84, font: F.bold, color: ink, x: x0 + 8, y: 420, align: 'left' });
      U.typeOn(sm, T, 34);
      KIT.wipeIn(big, T + b * 1.5, b * 1.3);
      KIT.animator(big, { props: { pos: [0, 40] }, shape: 1, keys: { pos: [[T + b * 1.5, [0, 40]], [T + b * 2.6, [0, 0]]] } });
      var lead = KIT.rect(comp, 'Wipe edge', 14, 230, 7, acc, x0, 620);
      KIT.keys(lead.property('ADBE Transform Group').property('ADBE Position'), [[T + b * 1.5, [x0 - 20, 620]], [T + b * 2.8, [x0 + width(big) + 10, 620]]], 80);
      KIT.opacityKeys(lead, [[0, 0], [T + b * 1.5, 0], [T + b * 1.55, 100], [T + b * 2.8, 100], [T + b * 3.0, 0]], 40);
      slamMark(mk, T + b * 4);
    } else if (st === 'swap') {
      // "Write" stays; the last word changes on every beat, slot-machine style.
      var words = p.words || ['SAQL?', 'recipes?', 'bindings?', 'dashboards?', 'SAQL?'];
      var size = p.size || 190;
      var longest = 0;
      var tmp;
      var i;
      for (i = 0; i < words.length; i++) {
        tmp = KIT.text(comp, words[i], { size: size, font: F.black, color: acc, x: 0, y: 560, align: 'left' });
        longest = Math.max(longest, width(tmp));
        tmp.remove();
      }
      var ld = KIT.text(comp, p.lead || 'Write', { size: size, font: F.black, color: ink, x: 0, y: 560, align: 'left' });
      var lw = width(ld);
      if (lw + 40 + longest > 1720) size = Math.floor(size * 1720 / (lw + 40 + longest));
      ld.remove();
      ld = KIT.text(comp, p.lead || 'Write', { size: size, font: F.black, color: ink, x: 0, y: 560, align: 'left' });
      lw = width(ld);
      longest = longest * size / (p.size || 190);
      x0 = 960 - (lw + 40 + longest) / 2;
      KIT.at(ld, x0, 560);
      KIT.charsIn(ld, T, 0.35, { pos: [-60, 0] }, { spread: 40 });
      var wx = x0 + lw + 40;
      var hop = size * 1.6;
      var swaps = p.at || [0, 1, 2, 3, 4];
      for (i = 0; i < words.length; i++) {
        var wd = KIT.text(comp, words[i], { size: size, font: F.black, color: i === words.length - 1 ? ink : acc, x: wx, y: 560, align: 'left' });
        var r = wd.sourceRectAtTime(0, false);
        KIT.maskRect(wd, r.left - 30, r.top - size * 0.18, r.left + r.width + 40, r.top + r.height + size * 0.18);
        var ti = T + b * swaps[i];
        var keys = [[ti, [0, hop]], [ti + 0.16, [0, 0]]];
        if (i < words.length - 1) {
          var tn = T + b * swaps[i + 1];
          keys.push([tn, [0, 0]], [tn + 0.16, [0, -hop]]);
        }
        KIT.animator(wd, { props: {}, shape: 1, keys: { pos: keys }, ease: 75 });
        if (i === words.length - 1) {
          rule(comp, 'Swap line', wx, 560 + size * 0.55, width(wd), 12, acc, ti + 0.1, 0.4);
        }
      }
    } else if (st === 'underline') {
      // Type-on, then small and big words, the big ones sitting on a line that draws under them.
      x0 = p.x || 180;
      var l1 = KIT.text(comp, p.line1 || 'Build dashboards', { size: 130, font: F.black, color: ink, x: x0, y: 400, align: 'left' });
      U.typeOn(l1, T, 30);
      var small = KIT.text(comp, p.small || 'people', { size: 70, font: F.bold, color: dk ? C.frost : C.muted, x: x0 + 6, y: 640, align: 'left' });
      KIT.charsIn(small, T + b * 1.2, 0.3, { pos: [0, 40] }, { spread: 40 });
      var bx = x0 + width(small) + 36;
      var bigU = fit(comp, p.big || 'actually use', { size: 170, font: F.black, color: acc, x: bx, y: 620, align: 'left' }, 1920 - bx - 220);
      // Measured before the animator: at time 0 its characters are scaled to nothing.
      var bw = width(bigU);
      var bh = bigU.sourceRectAtTime(0, false).height;
      KIT.charsIn(bigU, T + b * 2, 0.45, { scale: 0, pos: [0, 30] }, { spread: 30 });
      rule(comp, 'Under line', bx, 620 + bh * 0.62, bw, 16, acc, T + b * 3, 0.45);
      var q = KIT.text(comp, p.mark || '?', { size: 200, font: F.black, color: ink, x: bx + bw + 24, y: 600, align: 'left' });
      slamMark(q, T + b * (4 + (p._lead || 0)));
    } else {
      // tracking: a small line opens up; the big line's characters drop in, random order.
      if (p.mark !== false) KIT.mark(comp, 960, 830, 110, T + b * 4);
      var s1 = KIT.text(comp, p.small || 'You’re in the', { size: 80, font: F.bold, color: dk ? C.ice : C.muted, y: 380 });
      KIT.animator(s1, { props: { opacity: 0 }, shape: 1, keys: { opacity: [[T, 0], [T + 0.3, 100]] } });
      KIT.animator(s1, { props: {}, shape: 1, keys: { tracking: [[T, 0], [T + b * 4, 28]] }, ease: 30 });
      var s2 = fit(comp, p.big || 'right place.', { size: 250, font: F.black, color: acc, y: 590 }, 1700);
      KIT.charsIn(s2, T + b, 0.6, { pos: [0, -220], rot: -30 }, { spread: 18, random: true });
    }
  };

  // ---- method: caption + glimpses on a board -----------------------------------------------------
  var BX = 960;
  var BY = 650;
  // The term is typed big, then moves up and shrinks into a label as the drawing starts.
  function term(comp, str, t) {
    var L = KIT.text(comp, str, { size: 110, font: F.monoBold, color: C.navy, x: BX, y: BY });
    KIT.charsIn(L, t, 0.35, { pos: [0, 30] }, { spread: 30 });
    KIT.keys(L.property('ADBE Transform Group').property('ADBE Position'), [[t + 0.55, [BX, BY]], [t + 0.85, [BX, 395]]], 85);
    KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[t + 0.55, [100, 100, 100]], [t + 0.85, [46, 46, 100]]], 85);
    return t + 0.75;
  }
  var GL = {};
  // Overlapping circles: the left one fills, the right stays an outline.
  GL.venn = function (comp, g, t) {
    var t1 = term(comp, g.term || 'LEFT JOIN', t);
    var a = KIT.shapeLayer(comp, 'Venn A');
    var ga = KIT.group(a, 'A');
    KIT.ellipseIn(ga, 400, 400);
    KIT.stroke(ga, C.signal, 8);
    var fa = KIT.fill(ga, C.signal, 0);
    // Fill keys first: adding the trim invalidates the fill reference.
    KIT.keys(fa.property('ADBE Vector Fill Opacity'), [[t1 + 0.5, 0], [t1 + 0.8, 85]], 60);
    KIT.keys(KIT.trim(ga).property('ADBE Vector Trim End'), [[t1, 0], [t1 + 0.45, 100]], 70);
    KIT.at(a, BX - 130, 700);
    var bb = KIT.shapeLayer(comp, 'Venn B');
    var gb = KIT.group(bb, 'B');
    KIT.ellipseIn(gb, 400, 400);
    KIT.stroke(gb, C.navy, 8);
    KIT.keys(KIT.trim(gb).property('ADBE Vector Trim End'), [[t1 + 0.1, 0], [t1 + 0.55, 100]], 70);
    KIT.at(bb, BX + 130, 700);
    var la = KIT.text(comp, 'A', { size: 60, font: F.black, color: C.white, x: BX - 220, y: 700 });
    KIT.fade(la, t1 + 0.6, t1 + 0.8, 0, 100);
    var lb = KIT.text(comp, 'B', { size: 60, font: F.black, color: C.navy, x: BX + 240, y: 700 });
    KIT.fade(lb, t1 + 0.4, t1 + 0.6, 0, 100);
  };
  // A click on one chart; a line carries the selection; the number answers.
  GL.binding = function (comp, g, t) {
    var t1 = term(comp, g.term || 'BINDING', t);
    U.arrive([U.box(comp, 'Chart', 440, 360, 12, BX - 330, 710, { stroke: C.line, fill: C.paper })], t1 - 0.2, 20);
    var bs = U.bars(comp, 'Bind', BX - 520, 850, 380, 260, [80, 52, 34], t1 - 0.1, { axis: false, max: 80 });
    U.arrive([U.box(comp, 'Number', 440, 360, 12, BX + 330, 710, { stroke: C.line, fill: C.paper })], t1 - 0.1, 20);
    var n1 = KIT.text(comp, '1,284', { size: 110, font: F.black, color: C.navy, x: BX + 330, y: 710 });
    KIT.fade(n1, t1, t1 + 0.2, 0, 100);
    var tc = t1 + 0.5;
    var hit = [BX - 457, 760];
    KIT.cursor(comp, [BX - 200, 980], hit, tc, C.signal, true);
    KIT.fade(bs[1], tc, tc + 0.2, 100, 30);
    KIT.fade(bs[2], tc, tc + 0.2, 100, 30);
    KIT.wire(comp, 'Bind line', [BX - 110, 710], [BX + 110, 710], C.signal, 8, tc + 0.1, tc + 0.35);
    KIT.fade(n1, tc + 0.35, tc + 0.45, 100, 0);
    var n2 = KIT.text(comp, '412', { size: 110, font: F.black, color: C.signal, x: BX + 330, y: 710 });
    KIT.opacityKeys(n2, [[0, 0], [tc + 0.4, 0], [tc + 0.55, 100]], 50);
    KIT.pop(n2, tc + 0.4);
  };
  // Data flows through three nodes; at the middle one some of it is filtered out.
  GL.flow = function (comp, g, t) {
    var t1 = g.term ? term(comp, g.term, t) : t;
    var xs = [BX - 480, BX, BX + 480];
    var y = 700;
    var ic = ['db', 'broom', 'out'];
    var i;
    for (i = 0; i < 3; i++) {
      if (i < 2) KIT.wire(comp, 'Pipe ' + i, [xs[i] + 80, y], [xs[i + 1] - 80, y], C.frost, 6, t1 - 0.2 + i * 0.1, t1 + 0.1 + i * 0.1, false);
      KIT.pop(KIT.icon(comp, ic[i], xs[i], y, 150, C.signal, C.ice), t1 - 0.3 + i * 0.1);
    }
    for (i = 0; i < 10; i++) {
      var d = KIT.circle(comp, 'Row dot ' + (i + 1), 26, i % 3 === 1 ? C.warn : C.signalBright, xs[0], y);
      var ts = t1 + 0.15 + i * 0.12;
      var keep = i % 3 !== 1;
      var pp = d.property('ADBE Transform Group').property('ADBE Position');
      var oy = (i % 2 ? 1 : -1) * 14;
      if (keep) KIT.keys(pp, [[ts, [xs[0] + 80, y + oy]], [ts + 0.5, [xs[1], y + oy]], [ts + 1.0, [xs[2] - 80, y + oy]]], 30);
      else KIT.keys(pp, [[ts, [xs[0] + 80, y + oy]], [ts + 0.5, [xs[1] - 40, y + oy]], [ts + 0.85, [xs[1] - 20, y + 220]]], 30);
      KIT.opacityKeys(d, keep ? [[0, 0], [ts, 0], [ts + 0.05, 100], [ts + 0.95, 100], [ts + 1.05, 0]] : [[0, 0], [ts, 0], [ts + 0.05, 100], [ts + 0.6, 100], [ts + 0.85, 0]], 40);
    }
  };
  // A trend line drawn one day at a time, each day captured.
  GL.trend = function (comp, g, t) {
    var t1 = term(comp, g.term || 'SNAPSHOT', t);
    var vals = [40, 48, 44, 58, 63, 60, 74, 82];
    var x0 = BX - 560;
    var w = 1120;
    var y0 = 900;
    var h = 360;
    var pts = [];
    var i;
    for (i = 0; i < vals.length; i++) pts.push([x0 + w * i / (vals.length - 1), y0 - h * (vals[i] - 30) / 60]);
    KIT.fade(KIT.rect(comp, 'Trend axis', w + 40, 3, 0, C.line, BX, y0 + 20), t1 - 0.2, t1, 0, 100);
    var L = KIT.shapeLayer(comp, 'Trend');
    var lg = KIT.group(L, 'Line');
    KIT.pathIn(lg, pts, false);
    KIT.stroke(lg, C.signal, 8);
    var step = 0.13;
    KIT.keys(KIT.trim(lg).property('ADBE Vector Trim End'), [[t1, 0], [t1 + step * (vals.length - 1), 100]], 20);
    KIT.at(L, 0, 0);
    for (i = 0; i < vals.length; i++) {
      var td = t1 + step * i;
      KIT.pop(KIT.circle(comp, 'Day ' + (i + 1), 22, C.navy, pts[i][0], pts[i][1]), td);
      var fl = KIT.rect(comp, 'Capture ' + (i + 1), 4, y0 + 20 - pts[i][1], 0, C.frost, pts[i][0], (y0 + 20 + pts[i][1]) / 2);
      KIT.opacityKeys(fl, [[0, 0], [td, 0], [td + 0.02, 100], [td + 0.3, 30]], 40);
    }
  };
  // A cursor drags a widget onto the grid; its chart grows.
  GL.build = function (comp, g, t) {
    var grid = KIT.shapeLayer(comp, 'Build grid');
    var gg = KIT.group(grid, 'Dots');
    for (var gx = 0; gx < 10; gx++) for (var gy = 0; gy < 4; gy++) KIT.ellipseIn(gg, 8, 8, BX - 300 + gx * 90, 470 + gy * 110);
    KIT.fill(gg, C.line);
    KIT.at(grid, 0, 0);
    KIT.fade(grid, t, t + 0.2, 0, 100);
    var pal = ['out', 'badge', 'db'];
    for (var i = 0; i < pal.length; i++) KIT.pop(KIT.icon(comp, pal[i], BX - 560, 500 + i * 140, 90, C.white, C.signal), t + i * 0.06);
    var src = [BX - 560, 500];
    var dst = [BX + 105, 640];
    var tg = t + 0.35;
    var box = U.box(comp, 'Dragged widget', 620, 360, 12, src[0], src[1], { stroke: C.signal, width: 4, fill: C.ice });
    KIT.keys(box.property('ADBE Transform Group').property('ADBE Position'), [[tg, src], [tg + 0.55, dst]], 80);
    KIT.keys(box.property('ADBE Transform Group').property('ADBE Scale'), [[tg, [16, 16, 100]], [tg + 0.55, [104, 104, 100]], [tg + 0.68, [100, 100, 100]]], 70);
    KIT.opacityKeys(box, [[0, 0], [tg, 0], [tg + 0.05, 100]]);
    KIT.cursor(comp, [src[0] + 30, src[1] + 30], [dst[0] + 200, dst[1] + 120], tg + 0.55, C.signal, true);
    U.bars(comp, 'Built', dst[0] - 260, dst[1] + 140, 520, 260, [40, 62, 55, 84, 70], tg + 0.75, { axis: false, max: 60, colors: [C.signal] });
    var ok = U.pill(comp, 'Your build', dst[0], dst[1] + 245, { size: 24, fill: C.navy, ink: C.white });
    KIT.pop(ok[0], tg + 1.2);
    KIT.pop(ok[1], tg + 1.25);
  };
  // A quiz: a question, three answers, the right one ticked.
  GL.quiz = function (comp, g, t) {
    var qq = KIT.text(comp, g.q || 'Which one is a SAQL statement?', { size: 50, font: F.black, color: C.navy, x: BX, y: 440 });
    U.arrive([qq], t, 20);
    var opts = g.options || ['select', 'foreach', 'where'];
    var right = g.answer === undefined ? 1 : g.answer;
    var tc = t + 0.9;
    for (var i = 0; i < opts.length; i++) {
      var x = BX + (i - 1) * 400;
      var bx = U.box(comp, 'Option ' + opts[i], 340, 120, 14, x, 680, { stroke: C.line, width: 3, fill: C.white });
      var tx = KIT.text(comp, opts[i], { size: 46, font: F.monoBold, color: C.navy, x: x, y: 680 });
      U.arrive([bx, tx], t + 0.2 + i * 0.1, 24);
      if (i === right) {
        var on = U.box(comp, 'Option right', 340, 120, 14, x, 680, { fill: C.good });
        var tx2 = KIT.text(comp, opts[i], { size: 46, font: F.monoBold, color: C.white, x: x, y: 680 });
        KIT.opacityKeys(on, [[0, 0], [tc + 0.05, 0], [tc + 0.15, 100]]);
        KIT.opacityKeys(tx2, [[0, 0], [tc + 0.05, 0], [tc + 0.15, 100]]);
        KIT.cursor(comp, [x + 300, 900], [x + 60, 700], tc, C.signal, true);
        KIT.pop(KIT.icon(comp, 'check', x + 160, 620, 70, C.white, C.good), tc + 0.2);
        var cr = U.pill(comp, 'Correct', BX, 860, { size: 30, fill: C.good, ink: C.white });
        KIT.pop(cr[0], tc + 0.35);
        KIT.pop(cr[1], tc + 0.4);
      }
    }
  };
  // Real rows stream in; the row count climbs; a chart draws from them.
  GL.realdata = function (comp, g, t) {
    var hd = KIT.text(comp, g.dataset || 'academy_traffic', { size: 34, font: F.monoBold, color: C.navy, x: BX - 640, y: 420, align: 'left' });
    U.arrive([hd], t, 16);
    var rows = g.rows || [['2026-11-02', 'YouTube', '412'], ['2026-11-02', 'Google', '688'], ['2026-11-03', 'LinkedIn', '131'], ['2026-11-03', 'YouTube', '455'], ['2026-11-04', 'Google', '702'], ['2026-11-04', 'Direct', '96'], ['2026-11-05', 'YouTube', '498'], ['2026-11-05', 'Google', '731']];
    var shown = 6;
    for (var i = 0; i < rows.length; i++) {
      var tr = t + 0.15 + i * 0.22;
      var y = 490 + Math.min(i, shown - 1) * 72;
      var parts = [U.box(comp, 'Data row ' + (i + 1), 640, 60, 8, BX - 320, y, { stroke: C.line, fill: i % 2 ? C.white : C.paper })];
      parts.push(KIT.text(comp, rows[i][0], { size: 24, font: F.mono, color: C.muted, x: BX - 620, y: y, align: 'left' }));
      parts.push(KIT.text(comp, rows[i][1], { size: 26, font: F.bold, color: C.navy, x: BX - 400, y: y, align: 'left' }));
      parts.push(KIT.text(comp, rows[i][2], { size: 26, font: F.black, color: C.signal, x: BX - 30, y: y, align: 'right' }));
      for (var k = 0; k < parts.length; k++) {
        var pp = parts[k].property('ADBE Transform Group').property('ADBE Position');
        var v = pp.value;
        var keys = [[tr, [v[0], v[1] + 40]], [tr + 0.2, [v[0], v[1]]]];
        // Once the list is full, every new row pushes the others up and the top one leaves.
        for (var j = i + 1; j < rows.length; j++) {
          if (j < shown) continue;
          var tj = t + 0.15 + j * 0.22;
          var up = (j - Math.max(i, shown - 1)) * 72;
          if (up <= 0) continue;
          keys.push([tj, [v[0], v[1] - up + 72]], [tj + 0.2, [v[0], v[1] - up]]);
        }
        KIT.keys(pp, keys, 70);
        var leave = i + shown < rows.length ? t + 0.15 + (i + shown) * 0.22 : null;
        KIT.opacityKeys(parts[k], leave ? [[0, 0], [tr, 0], [tr + 0.15, 100], [leave, 100], [leave + 0.15, 0]] : [[0, 0], [tr, 0], [tr + 0.15, 100]], 40);
      }
    }
    var cnt = KIT.text(comp, '0', { size: 150, font: F.black, color: C.navy, x: BX + 380, y: 560 });
    KIT.countUp(cnt, t + 0.1, t + 1.9, g.count || 12400, '');
    U.arrive([cnt], t, 20);
    var lb = KIT.text(comp, 'rows, real and yours to query', { size: 30, font: F.semi, color: C.muted, x: BX + 380, y: 650 });
    U.arrive([lb], t + 0.2, 16);
    U.lineChart(comp, 'Real trend', BX + 130, 730, 500, 180, [412, 455, 430, 498, 520, 560, 610], t + 0.6, { color: C.signal, dot: 12, d: 1.0 });
  };

  SCENES.method = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    var bgName = p.bg || 'navy';
    KIT.enter(comp, p._transition || 'canvas', BG[bgName], T);
    var dk = dark(bgName);
    var cap = KIT.text(comp, p.caption || 'Every concept, drawn.', { size: 96, font: F.black, color: dk ? C.white : C.navy, x: 210, y: 200, align: 'left' });
    KIT.charsIn(cap, T, 0.45, { pos: [0, 70], rot: 8 }, { spread: 25 });
    var board = U.box(comp, 'Board', 1500, 660, 22, BX, BY, { fill: C.white, stroke: dk ? undefined : C.line, width: 2 });
    KIT.moveFrom(board, T + 0.05, 0, 60, 0.45);
    KIT.fade(board, T + 0.05, T + 0.3, 0, 100);
    var gs = p.glimpses || [{ kind: 'venn', term: 'LEFT JOIN' }];
    var swapAt = T + b * (p.swap || 4);
    var folder = KIT.folder('Glimpses', comp.parentFolder);
    for (var i = 0; i < gs.length; i++) {
      var gc = KIT.comp(comp.name + ' · ' + gs[i].kind, comp.duration, C.white, folder);
      var t0 = i === 0 ? T + 0.25 : swapAt + 0.1;
      (GL[gs[i].kind] || GL.venn)(gc, gs[i], t0);
      var L = comp.layers.add(gc);
      L.name = 'Glimpse ' + gs[i].kind;
      var pos = L.property('ADBE Transform Group').property('ADBE Position');
      // Glimpses slide within the board: the first leaves left as the next comes in from the right.
      if (i > 0) {
        KIT.keys(pos, [[swapAt - 0.05, [960 + 1600, 540]], [swapAt + 0.3, [960, 540]]], 85);
        L.inPoint = swapAt - 0.06;
      } else if (gs.length > 1) {
        KIT.keys(pos, [[swapAt - 0.05, [960, 540]], [swapAt + 0.3, [960 - 1600, 540]]], 85);
      }
    }
    // The board's own mask: nothing slides outside it.
    var gl = [];
    for (var k = 1; k <= comp.numLayers; k++) if (comp.layer(k).name.indexOf('Glimpse ') === 0) gl.push(comp.layer(k));
    if (gl.length > 1) {
      var pre = comp.layers.precompose(collectIdx(gl), comp.name + ' · board', true);
      var bl = comp.layer(1);
      for (k = 1; k <= comp.numLayers; k++) if (comp.layer(k).source === pre) bl = comp.layer(k);
      var mk = bl.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
      var sh2 = new Shape();
      sh2.vertices = [[BX - 740, BY - 320], [BX + 740, BY - 320], [BX + 740, BY + 320], [BX - 740, BY + 320]];
      sh2.closed = true;
      mk.property('ADBE Mask Shape').setValue(sh2);
      pre.parentFolder = folder;
    }
  };
  function collectIdx(layers) {
    var out = [];
    for (var i = 0; i < layers.length; i++) out.push(layers[i].index);
    return out;
  }

  // ---- what you'll build -------------------------------------------------------------------------
  SCENES.buildMontage = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    var bgName = p.bg || 'paper';
    KIT.enter(comp, p._transition || 'canvas', BG[bgName], T);
    var dk = dark(bgName);
    var cap = KIT.text(comp, p.caption || 'What you’ll build.', { size: 96, font: F.black, color: dk ? C.white : C.navy, x: 210, y: 200, align: 'left' });
    KIT.charsIn(cap, T, 0.45, { pos: [0, 70] }, { spread: 25 });
    var names = p.names || ['Conversion', 'Adoption', 'Snapshots'];
    for (var i = 0; i < 3; i++) {
      var x = 480 + i * 480;
      var ti = T + 0.3 + i * b;
      var made = [U.box(comp, 'Dash ' + names[i], 440, 560, 16, x, 660, { fill: C.white, stroke: C.line, width: 2 })];
      made.push(KIT.text(comp, names[i], { size: 40, font: F.black, color: C.navy, x: x - 190, y: 430, align: 'left' }));
      var j;
      if (i === 0) {
        var fw = [360, 270, 180, 100];
        var fc = [C.frost, C.signalBright, C.signal, C.navy];
        for (j = 0; j < 4; j++) {
          var st = KIT.rect(comp, 'Funnel ' + j, fw[j], 76, 8, fc[j], x, 530 + j * 96);
          KIT.keys(st.property('ADBE Transform Group').property('ADBE Scale'), [[ti + 0.2 + j * 0.08, [0, 100, 100]], [ti + 0.5 + j * 0.08, [100, 100, 100]]], 80);
        }
      } else if (i === 1) {
        var gg = U.gauge(comp, 'Adopt', x, 760, 150, 68, ti + 0.2);
        U.fadeAll(gg, ti, ti + 0.2, 0, 100);
        var pc = KIT.text(comp, '0', { size: 80, font: F.black, color: C.navy, x: x, y: 720 });
        KIT.countUp(pc, ti + 0.2, ti + 1.2, 68, '%');
        KIT.fade(pc, ti, ti + 0.2, 0, 100);
      } else {
        U.lineChart(comp, 'Snap', x - 170, 520, 340, 280, [30, 36, 33, 45, 52, 50, 64], ti + 0.2, { color: C.signal, dot: 12, d: 0.8 });
      }
      for (j = 0; j < made.length; j++) {
        KIT.moveFrom(made[j], ti, 260, 0, 0.45);
        KIT.fade(made[j], ti, ti + 0.2, 0, 100);
      }
    }
  };

  // ---- AI at your side -----------------------------------------------------------------------------
  SCENES.aiFlash = function (comp, p, T, dur) {
    var b = p._beat || 0.585;
    var bgName = p.bg || 'navy';
    KIT.enter(comp, p._transition || 'canvas', BG[bgName], T);
    var dk = dark(bgName);
    var cap = KIT.text(comp, p.caption || 'With AI at your side.', { size: 96, font: F.black, color: dk ? C.white : C.navy, x: 210, y: 200, align: 'left' });
    KIT.charsIn(cap, T, 0.45, { pos: [0, 70] }, { spread: 25 });
    var board = U.box(comp, 'Board', 1500, 660, 22, BX, BY, { fill: C.white });
    KIT.moveFrom(board, T + 0.05, 0, 60, 0.45);
    KIT.fade(board, T + 0.05, T + 0.3, 0, 100);
    U.arrive([U.box(comp, 'Prompt', 880, 76, 38, 700, 400, { fill: C.paper, stroke: C.line })], T + 0.2, 16);
    KIT.pop(KIT.icon(comp, 'spark', 305, 400, 52, C.white, C.signal), T + 0.25);
    var pr = KIT.text(comp, p.prompt || 'Mock up an adoption dashboard', { size: 30, font: F.medium, color: C.ink, x: 345, y: 400, align: 'left' });
    U.typeOn(pr, T + 0.35, 50);
    var tS = T + 1.0;
    var wf = [[460, 540, 400, 90], [900, 540, 400, 90], [680, 760, 840, 260]];
    for (var i = 0; i < wf.length; i++) {
      var r = KIT.shapeLayer(comp, 'Sketch ' + (i + 1));
      var g = KIT.group(r, 'Box');
      KIT.rectIn(g, wf[i][2], wf[i][3], 10);
      var st = KIT.stroke(g, C.signalBright, 3);
      try {
        st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(14);
      } catch (e) {
        // decoration
      }
      KIT.keys(KIT.trim(g).property('ADBE Vector Trim End'), [[tS + i * 0.1, 0], [tS + 0.4 + i * 0.1, 100]], 60);
      KIT.at(r, wf[i][0], wf[i][1]);
    }
    U.arrive([KIT.text(comp, 'Active reps  42', { size: 30, font: F.black, color: C.navy, x: 460, y: 540 }), KIT.text(comp, 'Adoption  68%', { size: 30, font: F.black, color: C.signal, x: 900, y: 540 })], tS + 0.5, 14);
    U.lineChart(comp, 'Mock', 300, 660, 760, 190, [20, 28, 26, 38, 44, 52, 61, 70], tS + 0.55, { color: C.signal, dot: 10, d: 0.6 });
    var checks = p.checks || [['Nulls', 'ok'], ['Duplicates', 'ok'], ['Outliers flagged', 'warn']];
    for (i = 0; i < checks.length; i++) {
      var cy = 470 + i * 130;
      var tc = T + 1.4 + i * b / 2;
      KIT.pop(KIT.icon(comp, checks[i][1] === 'ok' ? 'check' : 'spark', 1290, cy, 70, C.white, checks[i][1] === 'ok' ? C.good : C.warn), tc);
      U.arrive([KIT.text(comp, checks[i][0], { size: 38, font: F.black, color: C.navy, x: 1350, y: cy, align: 'left' })], tc, 12);
    }
  };
}());
