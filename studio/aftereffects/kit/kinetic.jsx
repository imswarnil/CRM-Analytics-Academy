// CRM Analytics Academy — kinetic scenes for the trailer.
//
// Type leads. `slam`: one big word per beat-pair, the colour cutting with it.
// `concept`: the concept's name hits the screen, then shrinks into the
// heading while a canvas rises under it and the concept is built there
// (a recipe that runs, a join, SAQL, charts, a binding, row-level security).
// `chapter`: a few lines slam in on the beat over a giant ghost numeral, then
// fly off: the words are the transition into the next part.
// `aboutMe`: two columns, your photo and who you are. Uses the widget parts
// from platform.jsx (KIT.ui). Concept kinds: recipe, join, saql (also a longer,
// multi-step query), function, execute, chart, bind, secure, and the dashboards
// conversion, adoption, snapshot, plus ai.

SCENES_INFO.push(
  { type: 'slam', label: 'Kinetic slam: one big word per beat pair, colour cuts', props: { words: ['Data.', 'Dashboards.', 'Decisions.'], icons: ['db', 'out', 'spark'] } },
  { type: 'concept', label: 'A concept: the word becomes the heading, then it is built', props: { kind: 'recipe', word: 'PREP', line: 'Recipes turn raw data into datasets.', n: 1 } },
  { type: 'chapter', label: 'Chapter card: lines slam in on the beat, then fly off', props: { lines: ['First,', '*the fundamentals.*'], n: '01', kicker: 'PART ONE' } },
  { type: 'aboutMe', label: 'About me: photo and who you are, two columns', props: { name: 'Swarnil Singhai', role: 'Your role', years: 0, companies: ['Company'] } }
);

(function () {
  var C = KIT.C;
  var F = KIT.F;
  var U = KIT.ui;
  var PALETTE = { navy: C.navy, signal: C.signal, paper: C.paper, navyDeep: C.navyDeep };

  // Text no wider than maxW: made again at a smaller size when it would be.
  function fitText(comp, str, o, maxW) {
    var L = KIT.text(comp, str, o);
    var w = U.width(L);
    if (w <= maxW) return L;
    var o2 = {};
    for (var k in o) if (o.hasOwnProperty(k)) o2[k] = o[k];
    o2.size = Math.floor(o.size * maxW / w);
    L.remove();
    return KIT.text(comp, str, o2);
  }
  // The scene's entrance; a hard cut ('none') lands exactly on T, not in the overlap before it.
  function enterBG(comp, tr, color, T) {
    var bg = KIT.enter(comp, tr, color, T);
    if (tr === 'none') bg.inPoint = T;
    return bg;
  }

  function slamIn(L, t, style, size) {
    var sc = L.property('ADBE Transform Group').property('ADBE Scale');
    if (style === 'slam') KIT.keys(sc, [[t, [170, 170, 100]], [t + 0.16, [96, 96, 100]], [t + 0.3, [100, 100, 100]]], 70);
    else if (style === 'rise') KIT.moveFrom(L, t, 0, size * 0.6, 0.3);
    else if (style === 'slide') KIT.moveFrom(L, t, -size * 1.4, 0, 0.3);
    else KIT.moveFrom(L, t, 0, -size * 0.7, 0.3);
    KIT.fade(L, t, t + 0.08, 0, 100);
  }

  // ---- slam -------------------------------------------------------------------------------------
  SCENES.slam = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var per = (p.per || 2) * beat;
    var W = p.words || ['Data.'];
    var cols = p.colors || ['navy', 'signal', 'paper', 'navyDeep'];
    var styles = ['slam', 'rise', 'slide', 'drop'];
    var size = p.size || 210;
    for (var i = 0; i < W.length; i++) {
      var ti = T + i * per;
      var cn = cols[i % cols.length];
      var light = cn === 'paper';
      var bg;
      if (i === 0) {
        bg = KIT.enter(comp, p._transition || 'none', PALETTE[cn], T);
        // A hard cut lands on the first word, not half a second before it.
        if ((p._transition || 'none') === 'none') bg.inPoint = T;
      }
      else {
        bg = KIT.rect(comp, 'BG ' + (i + 1), 1920, 1080, 0, PALETTE[cn], 960, 540);
        bg.inPoint = ti;
      }
      var acc = W[i].charAt(0) === '*';
      var txt = W[i].replace(/\*/g, '');
      var color = acc ? (light ? C.signal : C.frost) : (light ? C.navy : C.white);
      var L = fitText(comp, txt, { size: size, font: F.black, color: color, y: 560 }, p.maxWidth || 1680);
      slamIn(L, ti, styles[(i + (p.seed || 0)) % styles.length], size);
      var ln = KIT.rect(comp, 'Underline ' + (i + 1), Math.min(1500, U.width(L) * 0.4), 14, 7, light ? C.signal : C.frost, 960, 560 + size * 0.62);
      KIT.keys(ln.property('ADBE Transform Group').property('ADBE Scale'), [[ti + 0.15, [0, 100, 100]], [ti + 0.15 + beat, [100, 100, 100]]], 85);
      if (p.icons && p.icons[i]) {
        var I = KIT.icon(comp, p.icons[i], 960, 290, 150, light ? C.white : C.navy, light ? C.signal : C.frost);
        KIT.pop(I, ti + 0.08);
        I.property('ADBE Transform Group').property('ADBE Rotate Z').expression = '10 * Math.sin(time * 3 + ' + i + ')';
      }
    }
  };

  // ---- concept: the word, then the build -----------------------------------------------------------
  SCENES.concept = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var cn = p.color || 'navy';
    enterBG(comp, p._transition || 'slices', PALETTE[cn], T);
    // How long the word holds the screen before it becomes the heading (beats).
    var ts = T + beat * (p.intro || 3);
    // The canvas rises from the bottom; the panel's colour stays as the header band.
    var cv = KIT.rect(comp, 'Canvas', 1920, 850, 0, C.paper, 960, 1080);
    cv.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 425]);
    KIT.keys(cv.property('ADBE Transform Group').property('ADBE Scale'), [[ts, [100, 0, 100]], [ts + 0.45, [100, 100, 100]]], 85);
    var nn = ('0' + (p.n || 1)).slice(-2);
    var k = KIT.text(comp, p.kicker || 'CONCEPT ' + nn, { size: 28, font: F.bold, color: C.frost, tracking: 260, y: 330 });
    KIT.pop(k, T);
    KIT.fade(k, ts, ts + 0.2, 100, 0);
    var w = fitText(comp, p.word || 'PREP', { size: 270, font: F.black, color: C.white, y: 540 }, 1640);
    slamIn(w, T + 0.05, 'slam', 270);
    KIT.keys(w.property('ADBE Transform Group').property('ADBE Position'), [[ts, [960, 540]], [ts + 0.45, [960, 92]]], 85);
    var sc = w.property('ADBE Transform Group').property('ADBE Scale');
    KIT.keys(sc, [[ts, [100, 100, 100]], [ts + 0.45, [36, 36, 100]]], 85);
    var ln = KIT.text(comp, p.line || '', { size: 38, font: F.semi, color: C.frost, y: 720 });
    var tl = T + beat * Math.min(1, (p.intro || 3) / 3);
    KIT.fade(ln, tl, tl + 0.25, 0, 100);
    KIT.moveFrom(ln, tl, 0, 30, 0.4);
    KIT.keys(ln.property('ADBE Transform Group').property('ADBE Position'), [[ts, [960, 720]], [ts + 0.45, [960, 176]]], 85);
    KIT.keys(ln.property('ADBE Transform Group').property('ADBE Scale'), [[ts, [100, 100, 100]], [ts + 0.45, [84, 84, 100]]], 85);
    var build = BUILD[p.kind] || BUILD.recipe;
    build(comp, p, ts + 0.45, beat, T + dur);
  };

  // A small table: navy header, white rows. Returns rows of layers and their y.
  function table(comp, name, cols, rows, x, y, cw, t) {
    var Wd = 0;
    var i;
    var j;
    for (i = 0; i < cw.length; i++) Wd += cw[i];
    var hd = [U.box(comp, name + ' header', Wd, 58, 8, x + Wd / 2, y + 29, { fill: C.navy })];
    var cx = x;
    for (i = 0; i < cols.length; i++) {
      hd.push(KIT.text(comp, String(cols[i]).toUpperCase(), { size: 19, font: F.bold, color: C.white, tracking: 120, x: cx + 22, y: y + 29, align: 'left' }));
      cx += cw[i];
    }
    var title = KIT.text(comp, name, { size: 26, font: F.black, color: C.navy, x: x, y: y - 34, align: 'left' });
    hd.push(title);
    U.arrive(hd, t, 24);
    var out = [];
    var ys = [];
    for (i = 0; i < rows.length; i++) {
      var ry = y + 58 + 12 + 33 + i * 76;
      var r = [U.box(comp, name + ' row ' + (i + 1), Wd, 66, 8, x + Wd / 2, ry, { stroke: C.line, fill: C.white })];
      cx = x;
      for (j = 0; j < rows[i].length; j++) {
        var v = rows[i][j];
        var isNull = v === null;
        r.push(KIT.text(comp, isNull ? 'null' : String(v), { size: 26, font: j === 0 ? F.bold : F.semi, color: isNull ? C.bad : (j === 0 ? C.ink : C.muted), x: cx + 22, y: ry, align: 'left' }));
        cx += cw[j];
      }
      U.arrive(r, t + 0.12 + i * 0.08, 20);
      out.push(r);
      ys.push(ry);
    }
    return { rows: out, ys: ys, x: x, w: Wd };
  }
  function fadeRow(row, t, to) {
    for (var i = 0; i < row.length; i++) KIT.fade(row[i], t, t + 0.25, 100, to);
  }

  var BUILD = {};
  // Load → Join → Clean → Output, then Run.
  BUILD.recipe = function (comp, p, t, beat) {
    var S = p.nodes || [['db', 'Load', 'traffic + sign-ups'], ['join', 'Join', 'on Source'], ['broom', 'Clean', 'dates, blanks'], ['out', 'Output', 'a dataset']];
    var y = 600;
    var xs = [];
    var i;
    for (i = 0; i < S.length; i++) xs.push(330 + i * (1260 / (S.length - 1)));
    for (i = 0; i < S.length; i++) {
      var tn = t + i * beat * 0.75;
      var rg = U.ring(comp, 'Node ring ' + S[i][1], 180, xs[i], y, C.frost, 4);
      var ic = KIT.icon(comp, S[i][0], xs[i], y, 150, C.signal, C.ice);
      KIT.pop(rg, tn);
      KIT.pop(ic, tn + 0.05);
      var nm = KIT.text(comp, S[i][1], { size: 40, font: F.black, color: C.navy, x: xs[i], y: y + 140 });
      var sb = KIT.text(comp, S[i][2], { size: 26, font: F.medium, color: C.muted, x: xs[i], y: y + 188 });
      U.arrive([nm, sb], tn + 0.1, 20);
      if (i < S.length - 1) KIT.wire(comp, 'Link ' + (i + 1), [xs[i] + 100, y], [xs[i + 1] - 100, y], C.frost, 6, tn + beat * 0.4, tn + beat * 0.9, false);
    }
    var tr = t + beat * 4;
    var run = U.button(comp, 'Run', 1790, 300, 120, true);
    U.arrive(run, t + 0.2, 14);
    KIT.cursor(comp, [1400, 900], [1790, 300], tr, C.signal, true);
    var pk = KIT.circle(comp, 'Packet', 34, C.signalBright, xs[0], y);
    var pp = [];
    var tick = 0.36;
    for (i = 0; i < S.length; i++) pp.push([tr + 0.25 + i * tick, [xs[i], y]]);
    KIT.keys(pk.property('ADBE Transform Group').property('ADBE Position'), pp, 50);
    KIT.keys(pk.property('ADBE Transform Group').property('ADBE Opacity'), [[tr + 0.2, 0], [tr + 0.3, 100], [tr + 0.25 + (S.length - 1) * tick, 100], [tr + 0.4 + (S.length - 1) * tick, 0]], 40);
    for (i = 0; i < S.length; i++) KIT.pop(KIT.icon(comp, 'check', xs[i] + 66, y - 66, 56, C.white, C.good), tr + 0.25 + i * tick);
    U.toast(comp, p.toast || 'Recipe ran · dataset ready', tr + 0.45 + S.length * tick, 1.4);
  };

  // A left join: keys match across, the unmatched right row drops, the result builds.
  BUILD.join = function (comp, p, t, beat) {
    var ty = p.tableY || 400;
    var L = table(comp, 'Visits', ['Source', 'Visits'], [['Google', '4.2K'], ['YouTube', '2.7K'], ['LinkedIn', '1.4K']], 80, ty, [220, 180], t);
    var R = table(comp, 'Sign-ups', ['Source', 'Sign-ups'], [['YouTube', '268'], ['Google', '412'], ['Reddit', '35']], 600, ty, [220, 180], t + 0.15);
    var tk = t + beat * 2;
    var match = [[0, 1], [1, 0]];
    for (var i = 0; i < match.length; i++) {
      var a = [480, L.ys[match[i][0]]];
      var b = [600, R.ys[match[i][1]]];
      KIT.wire(comp, 'Key match ' + (i + 1), a, b, C.signal, 5, tk + i * 0.15, tk + i * 0.15 + 0.35);
      KIT.pop(KIT.circle(comp, 'Key dot L' + i, 18, C.signal, a[0], a[1]), tk + i * 0.15);
      KIT.pop(KIT.circle(comp, 'Key dot R' + i, 18, C.signal, b[0], b[1]), tk + i * 0.15 + 0.35);
    }
    fadeRow(R.rows[2], tk + 0.6, 25);
    var x = KIT.text(comp, '✕', { size: 40, font: F.black, color: C.bad, x: 1030, y: R.ys[2] });
    KIT.pop(x, tk + 0.7);
    var tr = tk + beat * 1.5;
    var J = table(comp, 'Left join', ['Source', 'Visits', 'Sign-ups'], [['Google', '4.2K', '412'], ['YouTube', '2.7K', '268'], ['LinkedIn', '1.4K', null]], 1130, ty, [240, 210, 260], tr);
    var pl = U.pill(comp, 'Every visit kept · no match = null', 1485, ty + 410, { size: 26, fill: C.navy, ink: C.white });
    KIT.pop(pl[0], tr + beat * 2);
    KIT.pop(pl[1], tr + beat * 2 + 0.05);
    return J;
  };

  // SAQL: typed line by line, Run, ranked results. A longer query (p.lines) can
  // set a wider editor (editorW), smaller code (codeSize, lineH) and a faster
  // line step (lineStep, seconds); Run follows the last line. Results:
  // [name, value, label?] with bars scaled to the first value.
  BUILD.saql = function (comp, p, t, beat) {
    var ew = p.editorW || 1120;
    var cs = p.codeSize || 28;
    var lh = p.lineH || 72;
    var y0 = p.lineY0 || 410;
    U.widget(comp, p.editorTitle || 'SAQL', 40, 260, ew, 790, t, { fill: C.code, dark: true });
    var run = U.button(comp, 'Run', 40 + ew - 80, 306, 120, true);
    U.arrive(run, t + 0.1);
    var lines = p.lines || [
      'q = load "academy_traffic";',
      'q = group q by \'Source\';',
      'q = foreach q generate \'Source\', sum(\'Visits\') as \'Visits\';',
      'q = order q by \'Visits\' desc;',
      'q = limit q 3;'
    ];
    var step = p.lineStep || 0.5;
    for (var i = 0; i < lines.length; i++) {
      var y = y0 + i * lh;
      KIT.fade(KIT.text(comp, String(i + 1), { size: cs - 4, font: F.mono, color: C.frost, x: 96, y: y, align: 'right' }), t, t + 0.2, 0, 60);
      U.typeOn(KIT.text(comp, lines[i], { size: cs, font: F.mono, color: /^\s/.test(lines[i]) || i % 2 ? C.frost : C.white, x: 126, y: y, align: 'left' }), t + 0.15 + i * step, p.cps || 90);
    }
    var tq = p.lineStep ? t + 0.15 + lines.length * step + 0.35 : t + beat * 5;
    var rx = 40 + ew + 40;
    var rw = 1880 - rx;
    KIT.cursor(comp, [rx - 200, 980], [40 + ew - 80, 306], tq, C.signalBright, true);
    var Rw = U.widget(comp, p.resultsTitle || 'Results', rx, 260, rw, 790, t + 0.2);
    var res = p.results || [['Google', 4210], ['YouTube', 2730], ['LinkedIn', 1420]];
    for (i = 0; i < res.length; i++) {
      var ry = 400 + i * 140;
      var tt = tq + 0.2 + i * 0.15;
      var rn = KIT.text(comp, res[i][0], { size: 34, font: F.black, color: C.navy, x: rx + 40, y: ry, align: 'left' });
      var label = res[i][2] || String(res[i][1]).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      var rv = KIT.text(comp, label, { size: 34, font: F.black, color: C.signal, x: rx + rw - 40, y: ry, align: 'right' });
      var bw = (rw - 80) * res[i][1] / res[0][1];
      var mb = KIT.rect(comp, 'Result bar ' + (i + 1), bw, 18, 9, C.signal, rx + 40, ry + 50);
      mb.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-bw / 2, 0]);
      KIT.at(mb, rx + 40, ry + 50);
      U.arrive([rn, rv], tt, 20);
      KIT.keys(mb.property('ADBE Transform Group').property('ADBE Scale'), [[tt + 0.1, [0, 100, 100]], [tt + 0.6, [100, 100, 100]]], 70);
    }
    var hint = KIT.text(comp, 'Run it →', { size: 30, font: F.semi, color: C.muted, x: Rw.cx, y: Rw.cy });
    KIT.opacityKeys(hint, [[t + 0.3, 0], [t + 0.5, 100], [tq + 0.05, 100], [tq + 0.15, 0]]);
    if (p.note) {
      var nt = U.pill(comp, p.note, Rw.cx, 980, { size: 24, fill: C.navy, ink: C.white });
      KIT.pop(nt[0], tq + 0.8);
      KIT.pop(nt[1], tq + 0.85);
    }
  };

  // Visualize: one chart, the type switching bar → donut → line.
  BUILD.chart = function (comp, p, t, beat) {
    U.widget(comp, 'Visits by source', 40, 260, 1840, 790, t);
    var px = [1700, 1764, 1828];
    var hl = U.box(comp, 'Picker highlight', 56, 56, 6, px[0], 316, { stroke: C.signal, width: 3, fill: C.ice });
    U.arrive([hl], t + 0.1, 10);
    var kinds = ['bar', 'donut', 'line'];
    var i;
    for (i = 0; i < 3; i++) {
      var L = KIT.shapeLayer(comp, 'Chart type ' + kinds[i]);
      var g = KIT.group(L, 'Glyph');
      if (i === 0) {
        KIT.rectIn(g, 7, 12, 1, -9, 5);
        KIT.rectIn(g, 7, 20, 1, 0, 1);
        KIT.rectIn(g, 7, 28, 1, 9, -3);
        KIT.fill(g, C.navy);
      } else if (i === 1) {
        KIT.ellipseIn(g, 24, 24);
        KIT.stroke(g, C.navy, 6, false);
      } else {
        KIT.pathIn(g, [[-14, 10], [-4, 0], [4, 6], [14, -10]], false);
        KIT.stroke(g, C.navy, 4);
      }
      var fr = KIT.group(L, 'Frame');
      KIT.rectIn(fr, 56, 56, 6);
      KIT.stroke(fr, C.line, 2);
      KIT.at(L, px[i], 316);
      U.arrive([L], t + 0.1, 10);
    }
    var hp = hl.property('ADBE Transform Group').property('ADBE Position');
    var labels = ['Google', 'YouTube', 'LinkedIn', 'Direct', 'Other'];
    var vals = [42, 27, 14, 11, 6];
    // A short step lands the bars sooner, so their labels are in before the chart switches.
    var quick = p.step && p.step < 3;
    var b1 = U.bars(comp, 'Visits', 200, 950, 1520, 540, vals, quick ? t + 0.02 : t + 0.2, { labels: labels, values: ['42%', '27%', '14%', '11%', '6%'], max: 150, labelSize: 26, stagger: quick ? 0.04 : 0.07 });
    // p.step: beats between the chart type switches (3 by default).
    var t1 = t + beat * (p.step || 3);
    KIT.cursor(comp, [1500, 800], [px[1], 316], t1, C.signal, true);
    KIT.keys(hp, [[t1, [px[0], 316]], [t1 + 0.2, [px[1], 316]]], 80);
    U.fadeAll(b1, t1, t1 + 0.2, 100, 0);
    var cols = [C.navy, C.signal, C.signalBright, C.frost, C.line];
    var d1 = U.donut(comp, 'Share', 760, 640, 480, vals, cols, t1 + 0.15);
    var lg = [];
    for (i = 0; i < labels.length; i++) {
      var ly = 480 + i * 80;
      var dot = KIT.circle(comp, 'Legend ' + labels[i], 28, cols[i], 1160, ly);
      var lt = KIT.text(comp, labels[i], { size: 32, font: F.semi, color: C.ink, x: 1196, y: ly, align: 'left' });
      var lv = KIT.text(comp, vals[i] + '%', { size: 32, font: F.black, color: C.navy, x: 1560, y: ly, align: 'right' });
      lg.push(dot, lt, lv);
      U.arrive([dot, lt, lv], t1 + 0.2 + i * 0.07, 16);
    }
    var t2 = t + beat * 2 * (p.step || 3);
    KIT.cursor(comp, [1500, 800], [px[2], 316], t2, C.signal, true);
    KIT.keys(hp, [[t2, [px[1], 316]], [t2 + 0.2, [px[2], 316]]], 80);
    U.fadeAll(d1.concat(lg), t2, t2 + 0.2, 100, 0);
    U.lineChart(comp, 'Weekly visits', 160, 400, 1600, 460, [120, 160, 150, 210, 260, 250, 330, 410], t2 + 0.15, { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], d: p.step && p.step < 3 ? 0.7 : 1.0 });
  };

  // Bind: click a bar, the other widget answers for that selection.
  BUILD.bind = function (comp, p, t, beat) {
    U.widget(comp, 'Visits by source', 40, 260, 900, 790, t);
    var out = U.bars(comp, 'Src', 100, 960, 780, 520, [42, 27, 14, 11, 6], t + 0.2, { labels: ['Google', 'YouTube', 'LinkedIn', 'Direct', 'Other'], labelSize: 24 });
    var R = U.widget(comp, 'Sign-ups', 980, 260, 900, 790, t + 0.15);
    var k1 = KIT.text(comp, '1,284', { size: 110, font: F.black, color: C.navy, x: 1020, y: 400, align: 'left' });
    var k2 = KIT.text(comp, '268', { size: 110, font: F.black, color: C.signal, x: 1020, y: 400, align: 'left' });
    var sub1 = KIT.text(comp, 'all sources', { size: 28, font: F.semi, color: C.muted, x: 1020, y: 480, align: 'left' });
    var sub2 = KIT.text(comp, 'from YouTube', { size: 28, font: F.bold, color: C.signal, x: 1020, y: 480, align: 'left' });
    U.arrive([k1, sub1], t + 0.3);
    var l1 = U.lineChart(comp, 'All', 1040, 560, 780, 360, [120, 160, 150, 210, 260, 250, 330, 410], t + 0.4, { color: C.navy, dot: 14 });
    var tc = t + beat * (p.click || 3);
    var hit = [328, 800];
    KIT.cursor(comp, [700, 1000], hit, tc, C.signal, false);
    for (var i = 0; i < out.length; i++) {
      if (/ bar (1|3|4|5)$/.test(out[i].name)) KIT.fade(out[i], tc, tc + 0.25, 100, 25);
    }
    KIT.fade(k1, tc, tc + 0.15, 100, 0);
    KIT.fade(sub1, tc, tc + 0.15, 100, 0);
    KIT.fade(k2, tc + 0.1, tc + 0.3, 0, 100);
    KIT.moveFrom(k2, tc + 0.1, 0, 30, 0.35);
    KIT.fade(sub2, tc + 0.15, tc + 0.35, 0, 100);
    U.fadeAll(l1, tc, tc + 0.2, 100, 0);
    U.lineChart(comp, 'YouTube', 1040, 560, 780, 360, [20, 35, 30, 48, 60, 72, 90, 120], tc + 0.25, { color: C.signal, dot: 14 });
    var pl = U.pill(comp, 'Selection binding', R.cx, 990, { size: 26, fill: C.navy, ink: C.white });
    var tp = tc + beat * Math.min(2, p.click || 3);
    KIT.pop(pl[0], tp);
    KIT.pop(pl[1], tp + 0.05);
  };

  // Secure: the same rows, seen as a leader, a manager, a rep.
  BUILD.secure = function (comp, p, t, beat) {
    var rows = [['Acme', '$40K', 'Asha'], ['Globex', '$25K', 'Ben'], ['Initech', '$18K', 'Asha'], ['Umbrella', '$32K', 'Chen'], ['Stark', '$12K', 'Ben'], ['Wayne', '$27K', 'Asha']];
    var T1 = table(comp, 'Opportunities', ['Account', 'Amount', 'Owner'], rows, 80, 330, [400, 300, 400], t);
    var px = 1500;
    var roles = [['Leader', 'sees every row'], ['Manager', 'sees the team'], ['Rep · Asha', 'sees own rows']];
    var head = KIT.text(comp, 'VIEWING AS', { size: 22, font: F.bold, color: C.muted, tracking: 160, x: 1300, y: 300, align: 'left' });
    U.arrive([head], t + 0.1);
    var ys = [];
    var i;
    var hl = U.box(comp, 'Role highlight', 520, 110, 10, px + 60, 400, { stroke: C.signal, width: 4, fill: C.ice });
    U.arrive([hl], t + 0.2);
    for (i = 0; i < roles.length; i++) {
      var y = 400 + i * 134;
      ys.push(y);
      var b = U.box(comp, 'Role ' + roles[i][0], 520, 110, 10, px + 60, y, { stroke: C.line });
      var ic = KIT.icon(comp, i === 2 ? 'user' : (i === 1 ? 'share' : 'award'), 1360, y, 70, C.signal, C.white);
      var n1 = KIT.text(comp, roles[i][0], { size: 32, font: F.black, color: C.navy, x: 1414, y: y - 16, align: 'left' });
      var n2 = KIT.text(comp, roles[i][1], { size: 24, font: F.semi, color: C.muted, x: 1414, y: y + 22, align: 'left' });
      U.arrive([b, ic, n1, n2], t + 0.2 + i * 0.1, 20);
    }
    var hp = hl.property('ADBE Transform Group').property('ADBE Position');
    var t1 = t + beat * 2.5;
    var t2 = t + beat * 4.5;
    KIT.cursor(comp, [1700, 900], [1600, ys[1]], t1, C.signal, true);
    KIT.keys(hp, [[t1, [px + 60, ys[0]]], [t1 + 0.2, [px + 60, ys[1]]]], 80);
    fadeRow(T1.rows[3], t1 + 0.1, 15);
    KIT.cursor(comp, [1700, 1000], [1600, ys[2]], t2, C.signal, true);
    KIT.keys(hp, [[t2, [px + 60, ys[1]]], [t2 + 0.2, [px + 60, ys[2]]]], 80);
    fadeRow(T1.rows[1], t2 + 0.1, 15);
    fadeRow(T1.rows[4], t2 + 0.1, 15);
    var code = U.box(comp, 'Predicate', 1760, 96, 10, 960, 960, { fill: C.code });
    var ct = KIT.text(comp, '\'Owner\' == "$User.Name"', { size: 34, font: F.monoBold, color: C.frost, x: 960, y: 960 });
    var cl = KIT.text(comp, 'SECURITY PREDICATE', { size: 20, font: F.bold, color: C.signalBright, tracking: 160, x: 140, y: 960, align: 'left' });
    U.arrive([code, ct, cl], t2 + 0.3, 30);
  };

  function pct(a, b) {
    return (a / b * 100).toFixed(1).replace(/\.0$/, '') + '%';
  }
  function popPill(pl, t) {
    KIT.pop(pl[0], t);
    KIT.pop(pl[1], t + 0.05);
    return pl;
  }
  // Crossfade a stack of layers: shown[i] from times[i] until times[i + 1].
  function cycle(layers, times) {
    for (var i = 0; i < layers.length; i++) {
      var keys = [[times[i], 0], [times[i] + 0.15, 100]];
      if (i < layers.length - 1) keys.push([times[i + 1], 100], [times[i + 1] + 0.12, 0]);
      KIT.opacityKeys(layers[i], keys, 50);
    }
  }

  // Functions: each row's value flies into sum(); one answer comes out; then the
  // same rows give avg(), count(), max().
  BUILD['function'] = function (comp, p, t, beat) {
    var rows = p.rows || [['Acme', '$40K'], ['Globex', '$25K'], ['Initech', '$61K'], ['Umbrella', '$22K'], ['Stark', '$12K'], ['Wayne', '$24K']];
    U.widget(comp, 'Opportunities · Amount', 40, 260, 560, 790, t);
    var ys = [];
    var chips = [];
    var i;
    for (i = 0; i < rows.length; i++) {
      var y = 380 + i * 110;
      ys.push(y);
      var nm = KIT.text(comp, rows[i][0], { size: 32, font: F.bold, color: C.ink, x: 84, y: y, align: 'left' });
      var ch = KIT.rect(comp, 'Value ' + rows[i][0], 170, 64, 32, C.code, 470, y);
      var tx = KIT.text(comp, rows[i][1], { size: 30, font: F.bold, color: C.frost, x: 470, y: y });
      tx.parent = ch;
      U.arrive([nm], t + 0.1 + i * 0.06, 18);
      KIT.pop(ch, t + 0.15 + i * 0.06);
      if (i < rows.length - 1) KIT.fade(KIT.rect(comp, 'Row line ' + (i + 1), 480, 2, 0, C.line, 320, y + 55), t + 0.2, t + 0.4, 0, 100);
      chips.push(ch);
    }
    // The function: a block in the middle, wires fanning in from the rows.
    var fx = 960;
    var fy = 655;
    var tIn = t + 0.75;
    for (i = 0; i < rows.length; i++) KIT.wire(comp, 'Feed ' + (i + 1), [560, ys[i]], [728, fy], C.frost, 3, tIn - 0.35, tIn + 0.05);
    var box = KIT.rect(comp, 'Function', 470, 210, 28, C.signal, fx, fy);
    KIT.pop(box, t + 0.3);
    var fns = p.fns || [["sum('Amount')", '$184K'], ["avg('Amount')", '$30.7K'], ['count()', '6'], ["max('Amount')", '$61K']];
    var step = beat / 3;
    for (i = 0; i < chips.length; i++) {
      var ti = tIn + i * step;
      var pos = chips[i].property('ADBE Transform Group').property('ADBE Position');
      KIT.keys(pos, [[ti, [470, ys[i]]], [ti + 0.4, [740, fy]]], 80);
      KIT.keys(chips[i].property('ADBE Transform Group').property('ADBE Scale'), [[t + 0.15 + i * 0.06, [0, 0, 100]], [t + 0.35 + i * 0.06, [110, 110, 100]], [t + 0.5 + i * 0.06, [100, 100, 100]], [ti + 0.25, [100, 100, 100]], [ti + 0.4, [30, 30, 100]]], 60);
      KIT.opacityKeys(chips[i], [[ti + 0.32, 100], [ti + 0.42, 0]], 40);
      KIT.keys(box.property('ADBE Transform Group').property('ADBE Scale'), [[ti + 0.38, [100, 100, 100]], [ti + 0.46, [106, 106, 100]], [ti + 0.58, [100, 100, 100]]], 60);
    }
    var tOut = tIn + rows.length * step + 0.35;
    // The answer widget, and an arrow out of the function into it.
    var A = U.widget(comp, 'One answer', 1320, 260, 560, 790, t + 0.2);
    KIT.wire(comp, 'Out', [fx + 240, fy], [1300, fy], C.signal, 8, tOut - 0.2, tOut + 0.1, false);
    var times = [];
    for (i = 0; i < fns.length; i++) times.push(i === 0 ? t + 0.4 : tOut + i * beat * (p.cycle || 1.4));
    var fl = [];
    var rl = [];
    var ll = [];
    for (i = 0; i < fns.length; i++) {
      fl.push(KIT.text(comp, fns[i][0], { size: 38, font: F.monoBold, color: C.white, x: fx, y: fy }));
      rl.push(fitText(comp, fns[i][1], { size: 150, font: F.black, color: i ? C.signal : C.navy, x: A.cx, y: 620 }, 480));
      ll.push(KIT.text(comp, fns[i][0], { size: 28, font: F.monoBold, color: C.muted, x: A.cx, y: 740 }));
    }
    cycle(fl, times);
    var rt = [tOut];
    for (i = 1; i < fns.length; i++) rt.push(times[i]);
    cycle(rl, rt);
    cycle(ll, rt);
    KIT.moveFrom(rl[0], tOut, -120, 0, 0.45);
    for (i = 1; i < fns.length; i++) KIT.moveFrom(rl[i], rt[i], 0, 40, 0.35);
    var nt = U.pill(comp, p.note || 'Many rows in. One answer out.', A.cx, 960, { size: 24, fill: C.navy, ink: C.white });
    popPill(nt, tOut + 0.3);
  };

  // How a query executes: the steps light in order and the rows under each
  // step shrink: 12 loaded, 7 kept, 4 groups, a column added, sorted, top 3.
  BUILD.execute = function (comp, p, t, beat) {
    var steps = p.steps || ['load', 'filter', 'group', 'foreach', 'order', 'limit'];
    var counts = p.counts || ['12 rows', '7 rows', '4 groups', '+1 column', 'sorted', 'top 3'];
    var n = steps.length;
    var gap = 296;
    var cw = 256;
    var xs = [];
    var i;
    var k;
    for (i = 0; i < n; i++) xs.push(960 + (i - (n - 1) / 2) * gap);
    var grp = [150, 205, 110, 175];
    var srt = [205, 175, 150, 110];
    var cols = [];
    for (i = 0; i < n; i++) {
      var c = [];
      if (i === 0) for (k = 0; k < 12; k++) c.push([205, C.navy]);
      else if (i === 1) for (k = 0; k < 7; k++) c.push([205, C.signalBright]);
      else if (i === 2) for (k = 0; k < 4; k++) c.push([grp[k], C.signal]);
      else if (i === 3) for (k = 0; k < 4; k++) c.push([grp[k], C.signal, true]);
      else if (i === 4) for (k = 0; k < 4; k++) c.push([srt[k], C.signal, true]);
      else for (k = 0; k < 3; k++) c.push([srt[k], C.good, true]);
      cols.push(c);
    }
    var each = beat * (p.each || 0.95);
    for (i = 0; i < n; i++) {
      var tl = t + 0.45 + i * each;
      var chip = U.box(comp, 'Step ' + steps[i], cw, 86, 10, xs[i], 330, { stroke: C.line, fill: C.white });
      var kw = KIT.text(comp, steps[i], { size: 34, font: F.monoBold, color: C.navy, x: xs[i], y: 330 });
      U.arrive([chip, kw], t + i * 0.05, 20);
      var lit = U.box(comp, 'Step ' + steps[i] + ' lit', cw, 86, 10, xs[i], 330, { fill: C.signal });
      var kw2 = KIT.text(comp, steps[i], { size: 34, font: F.monoBold, color: C.white, x: xs[i], y: 330, name: steps[i] + ' (lit)' });
      KIT.opacityKeys(lit, [[0, 0], [tl, 0], [tl + 0.08, 100]], 30);
      KIT.opacityKeys(kw2, [[0, 0], [tl, 0], [tl + 0.08, 100]], 30);
      KIT.keys(lit.property('ADBE Transform Group').property('ADBE Scale'), [[tl, [100, 100, 100]], [tl + 0.08, [108, 108, 100]], [tl + 0.25, [100, 100, 100]]], 60);
      var no = KIT.text(comp, String(i + 1), { size: 22, font: F.bold, color: C.muted, x: xs[i] - cw / 2 + 4, y: 268, align: 'left' });
      U.arrive([no], t + i * 0.05, 12);
      // The rows this step hands on.
      var left = xs[i] - 103;
      for (k = 0; k < cols[i].length; k++) {
        var w = cols[i][k][0];
        var ry = 420 + k * 31;
        var blk = KIT.rect(comp, 'Rows ' + steps[i] + ' ' + (k + 1), w, 22, 5, cols[i][k][1], left + w / 2, ry);
        var tb = tl + 0.1 + k * 0.025;
        KIT.moveFrom(blk, tb, 0, -24, 0.3);
        KIT.fade(blk, tb, tb + 0.12, 0, 100);
        if (cols[i][k][2]) {
          var cap = KIT.rect(comp, 'Column ' + steps[i] + ' ' + (k + 1), 36, 22, 5, C.frost, left + w + 22, ry);
          KIT.moveFrom(cap, tb, 0, -24, 0.3);
          KIT.fade(cap, tb, tb + 0.12, 0, 100);
        }
      }
      var cl = KIT.text(comp, counts[i], { size: 30, font: F.black, color: i === n - 1 ? C.good : C.navy, x: xs[i], y: 830 });
      U.arrive([cl], tl + 0.2, 16);
      if (i < n - 1) {
        var ar = KIT.text(comp, '›', { size: 56, font: F.black, color: C.frost, x: xs[i] + gap / 2, y: 326 });
        KIT.fade(ar, tl + 0.1, tl + 0.3, 0, 100);
      }
    }
    var te = t + 0.45 + n * each;
    popPill(U.pill(comp, p.note || 'Every step hands fewer rows to the next.', 960, 950, { size: 28, fill: C.navy, ink: C.white }), te);
  };

  // ---- dashboards a business needs -------------------------------------------------------------
  // Conversion: the funnel, stage by stage, with the rate between each.
  BUILD.conversion = function (comp, p, t, beat) {
    U.widget(comp, p.title || 'Conversion funnel · last 30 days', 40, 260, 1840, 790, t);
    var st = p.stages || [['Visits', 12400], ['Sign-ups', 1284], ['Active', 642], ['Paying', 96]];
    var cols = [C.frost, C.signalBright, C.signal, C.navy];
    var ws = [1000, 720, 480, 260];
    var ys = [];
    var i;
    var eb = KIT.text(comp, 'CONVERTS', { size: 22, font: F.bold, color: C.muted, tracking: 180, x: 1650, y: 330 });
    U.arrive([eb], t + 0.2, 12);
    for (i = 0; i < st.length; i++) {
      var y = 410 + i * 140;
      ys.push(y);
      var tt = t + 0.2 + i * beat / 2;
      var b = KIT.rect(comp, 'Stage ' + st[i][0], ws[i], 108, 10, cols[i % cols.length], 960, y);
      KIT.keys(b.property('ADBE Transform Group').property('ADBE Scale'), [[tt, [0, 100, 100]], [tt + 0.4, [100, 100, 100]]], 80);
      var v = KIT.text(comp, '0', { size: 44, font: F.black, color: i === 0 ? C.navy : C.white, x: 960, y: y });
      KIT.countUp(v, tt + 0.1, tt + 0.7, st[i][1], '');
      KIT.fade(v, tt + 0.1, tt + 0.25, 0, 100);
      var lb = KIT.text(comp, st[i][0], { size: 36, font: F.black, color: C.navy, x: 110, y: y, align: 'left' });
      U.arrive([lb], tt, 16);
      if (i > 0) {
        var pl = U.pill(comp, pct(st[i][1], st[i - 1][1]), 1650, y - 70, { size: 28, fill: C.ice, ink: C.signal });
        popPill(pl, tt + 0.35);
      }
    }
    var all = pct(st[st.length - 1][1], st[0][1]);
    var tA = t + 0.2 + st.length * beat / 2 + 0.4;
    popPill(U.pill(comp, st[0][0] + ' to ' + st[st.length - 1][0].toLowerCase() + ': ' + all, 960, 980, { size: 28, fill: C.good, ink: C.white }), tA);
  };

  // Adoption: weekly active users, the adoption gauge, the features people use.
  BUILD.adoption = function (comp, p, t, beat) {
    U.widget(comp, 'Weekly active users', 40, 260, 900, 400, t);
    var k = KIT.text(comp, '0', { size: 84, font: F.black, color: C.navy, x: 80, y: 390, align: 'left' });
    KIT.countUp(k, t + 0.3, t + 1.2, p.wau || 1284, '');
    U.arrive([k], t + 0.2, 20);
    var up = KIT.text(comp, p.wauNote || '+18% in 12 weeks', { size: 26, font: F.bold, color: C.good, x: 84, y: 460, align: 'left' });
    U.arrive([up], t + 0.5, 14);
    U.lineChart(comp, 'WAU', 420, 340, 470, 250, [610, 650, 700, 690, 760, 820, 860, 900, 980, 1050, 1160, 1284], t + 0.3, { color: C.signal, dot: 12, d: 1.0 });
    var B = U.widget(comp, 'Adoption', 970, 260, 910, 400, t + 0.1);
    U.fadeAll(U.gauge(comp, 'Adoption', B.cx, 600, 200, p.adoption || 68, t + 0.4), t + 0.2, t + 0.4, 0, 100);
    var g = KIT.text(comp, '0', { size: 84, font: F.black, color: C.navy, x: B.cx, y: 545 });
    KIT.countUp(g, t + 0.4, t + 1.6, p.adoption || 68, '%');
    U.arrive([g], t + 0.3, 14);
    var gs = KIT.text(comp, 'of licensed users, every week', { size: 24, font: F.semi, color: C.muted, x: B.cx, y: 628 });
    U.arrive([gs], t + 0.6, 10);
    U.widget(comp, 'Most used', 40, 690, 1840, 360, t + 0.2);
    var f = p.features || [['Dashboards', 92], ['Lenses', 74], ['Recipes', 51], ['Exports', 38], ['Mobile', 27], ['Alerts', 15]];
    var vals = [];
    var labels = [];
    var vl = [];
    for (var i = 0; i < f.length; i++) {
      vals.push(f[i][1]);
      labels.push(f[i][0]);
      vl.push(f[i][1] + '%');
    }
    U.bars(comp, 'Feature', 120, 990, 1720, 190, vals, t + 0.5, { labels: labels, values: vl, max: 120, labelSize: 24, colors: [C.signal, C.signal, C.signalBright, C.signalBright, C.frost, C.frost] });
  };

  // Snapshotting: a scheduled recipe captures the pipeline every day, the
  // history builds day by day, and "what changed since last week" falls out.
  BUILD.snapshot = function (comp, p, t, beat) {
    U.widget(comp, 'Daily snapshot recipe', 40, 260, 700, 790, t);
    var nodes = p.nodes || [['db', 'Opportunities', 'today\'s open pipeline'], ['spark', 'Add Snapshot Date', 'a column = today()'], ['out', 'Append', 'to Pipeline History']];
    var i;
    for (i = 0; i < nodes.length; i++) {
      var y = 420 + i * 200;
      var tn = t + 0.15 + i * beat / 2;
      KIT.pop(KIT.icon(comp, nodes[i][0], 150, y, 110, C.signal, C.ice), tn);
      var a = KIT.text(comp, nodes[i][1], { size: 32, font: F.black, color: C.navy, x: 230, y: y - 18, align: 'left' });
      var b = KIT.text(comp, nodes[i][2], { size: 24, font: F.semi, color: C.muted, x: 230, y: y + 22, align: 'left' });
      U.arrive([a, b], tn + 0.05, 16);
      if (i < nodes.length - 1) KIT.wire(comp, 'Recipe link ' + (i + 1), [150, y + 64], [150, y + 136], C.frost, 6, tn + 0.2, tn + 0.45, false);
    }
    var sch = U.pill(comp, 'Scheduled · every day, 6:00', 390, 980, { size: 26, fill: C.navy, ink: C.white });
    popPill(sch, t + 0.15 + nodes.length * beat / 2);
    U.widget(comp, 'Pipeline history · $M', 770, 260, 1110, 400, t + 0.1);
    var days = p.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var vals = p.history || [3.1, 3.3, 3.2, 3.6, 3.8, 3.7, 4.1];
    var shown = [];
    for (i = 0; i < vals.length; i++) shown.push(vals[i].toFixed(1));
    var tD = t + 0.9;
    U.bars(comp, 'Day', 820, 600, 1020, 210, vals, tD, { labels: days, values: shown, stagger: beat / 2, max: 84, colors: [C.signalBright] });
    // Each day's run: a pulse down the recipe as that day's bar lands.
    var appendY = 420 + (nodes.length - 1) * 200;
    for (i = 0; i < vals.length; i++) {
      var rg = U.ring(comp, 'Run ' + days[i], 110, 150, appendY, C.signal, 5);
      var tp = tD + i * beat / 2;
      KIT.keys(rg.property('ADBE Transform Group').property('ADBE Scale'), [[tp, [100, 100, 100]], [tp + 0.35, [160, 160, 100]]], 40);
      KIT.opacityKeys(rg, [[0, 0], [tp, 0], [tp + 0.02, 90], [tp + 0.35, 0]], 40);
    }
    var tW = tD + vals.length * beat / 2 + 0.2;
    U.widget(comp, 'What changed since last week', 770, 690, 1110, 360, tW - 0.5);
    var ch = p.changes || [['New deals', '+$1.6M', 'good'], ['Won, left the pipeline', '-$0.3M', 'muted'], ['Lost', '-$0.3M', 'bad'], ['Net change', '+$1.0M', 'signal']];
    for (i = 0; i < ch.length; i++) {
      var cy = 790 + i * 62;
      var tc = tW + i * 0.15;
      var last = i === ch.length - 1;
      var nm = KIT.text(comp, ch[i][0], { size: 28, font: last ? F.black : F.semi, color: last ? C.navy : C.ink, x: 810, y: cy, align: 'left' });
      var vv = KIT.text(comp, ch[i][1], { size: 32, font: F.black, color: C[ch[i][2]] || C.navy, x: 1840, y: cy, align: 'right' });
      U.arrive([nm, vv], tc, 16);
      if (!last) KIT.fade(KIT.rect(comp, 'Change line ' + (i + 1), 1030, 2, 0, C.line, 1325, cy + 31), tc, tc + 0.2, 0, 100);
    }
  };

  // AI: a prompt types, a dashboard mockup sketches itself and fills in; the
  // data is checked (nulls, duplicates, outliers); a prediction is explained.
  BUILD.ai = function (comp, p, t, beat) {
    U.widget(comp, 'Ask AI', 40, 260, 1000, 790, t);
    U.arrive([U.box(comp, 'Prompt', 920, 76, 38, 540, 360, { fill: C.paper, stroke: C.line })], t + 0.1, 16);
    KIT.pop(KIT.icon(comp, 'spark', 122, 360, 52, C.white, C.signal), t + 0.15);
    var pr = KIT.text(comp, p.prompt || 'Build me an adoption dashboard for my sales team', { size: 26, font: F.medium, color: C.ink, x: 162, y: 360, align: 'left' });
    U.typeOn(pr, t + 0.3, 60);
    var tS = t + 1.25;
    var wf = [[295, 480, 430, 90], [785, 480, 430, 90], [540, 660, 920, 210], [295, 890, 430, 190], [785, 890, 430, 190]];
    var i;
    for (i = 0; i < wf.length; i++) {
      var r = KIT.shapeLayer(comp, 'Sketch ' + (i + 1));
      var g = KIT.group(r, 'Box');
      KIT.rectIn(g, wf[i][2], wf[i][3], 10);
      var st = KIT.stroke(g, C.signalBright, 3);
      try {
        st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(14);
      } catch (e) {
        // decoration
      }
      KIT.keys(KIT.trim(g).property('ADBE Vector Trim End'), [[tS + i * 0.12, 0], [tS + 0.45 + i * 0.12, 100]], 60);
      KIT.at(r, wf[i][0], wf[i][1]);
    }
    var tF = tS + 1.0;
    var k1 = KIT.text(comp, 'Active reps  42', { size: 30, font: F.black, color: C.navy, x: 295, y: 480 });
    var k2 = KIT.text(comp, 'Adoption  68%', { size: 30, font: F.black, color: C.signal, x: 785, y: 480 });
    U.arrive([k1, k2], tF, 14);
    U.lineChart(comp, 'Mock trend', 120, 590, 840, 140, [20, 28, 26, 38, 44, 52, 61, 70], tF + 0.1, { color: C.signal, dot: 10, d: 0.6 });
    U.bars(comp, 'Mock bars', 110, 960, 370, 120, [9, 7, 5, 3], tF + 0.2, { axis: false, max: 50 });
    U.donut(comp, 'Mock donut', 785, 890, 140, [68, 32], [C.signal, C.ice], tF + 0.25, 26);
    // Checks run against the data.
    U.widget(comp, 'Validate the data', 1070, 260, 810, 470, t + 0.15);
    var checks = p.checks || [['No nulls in Owner', 'ok'], ['3 duplicate emails, merged', 'warn'], ['1 outlier flagged: a $9.9M deal', 'warn'], ['Totals match Salesforce', 'ok']];
    var tC = t + 1.6;
    for (i = 0; i < checks.length; i++) {
      var cy = 375 + i * 95;
      var tc = tC + i * beat / 2;
      KIT.pop(KIT.icon(comp, checks[i][1] === 'ok' ? 'check' : 'spark', 1132, cy, 54, C.white, checks[i][1] === 'ok' ? C.good : C.warn), tc);
      U.arrive([KIT.text(comp, checks[i][0], { size: 27, font: F.semi, color: C.navy, x: 1178, y: cy, align: 'left' })], tc, 12);
    }
    // A prediction, and why.
    var tP = tC + checks.length * beat / 2 + 0.3;
    U.widget(comp, 'Predict and explain', 1070, 760, 810, 290, tP - 0.3);
    var pl = KIT.text(comp, 'Likely to adopt', { size: 32, font: F.black, color: C.navy, x: 1110, y: 870, align: 'left' });
    var pv = KIT.text(comp, '0', { size: 80, font: F.black, color: C.signal, x: 1840, y: 880, align: 'right' });
    KIT.countUp(pv, tP, tP + 0.8, p.prediction || 82, '%');
    var pw = KIT.text(comp, 'Top factor: logged in during week one', { size: 23, font: F.semi, color: C.muted, x: 1110, y: 920, align: 'left' });
    U.arrive([pl, pv, pw], tP, 16);
    var pb = KIT.rect(comp, 'Prediction bar', 730, 14, 7, C.ice, 1475, 995);
    var pf = KIT.rect(comp, 'Prediction fill', 730 * (p.prediction || 82) / 100, 14, 7, C.signal, 1110 + 730 * (p.prediction || 82) / 200, 995);
    pf.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-730 * (p.prediction || 82) / 200, 0]);
    KIT.at(pf, 1110, 995);
    U.arrive([pb], tP, 10);
    KIT.keys(pf.property('ADBE Transform Group').property('ADBE Scale'), [[tP + 0.1, [0, 100, 100]], [tP + 0.9, [100, 100, 100]]], 70);
  };

  // ---- chapter: lines slam in, then fly off (the transition) ------------------------------------
  // p.lines (a line wrapped in *…* takes the accent colour), p.n (a ghost numeral),
  // p.kicker, p.color (navyDeep | navy | signal | paper), p.per (beats between lines).
  SCENES.chapter = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    var cn = p.color || 'navyDeep';
    var light = cn === 'paper';
    enterBG(comp, p._transition || 'none', PALETTE[cn], T);
    var lines = p.lines || ['First,', '*the fundamentals.*'];
    var size = p.size || 150;
    var lh = size * 1.12;
    var x0 = p.x || 170;
    var y0 = 540 - (lines.length - 1) * lh / 2 + (p.kicker ? 40 : 0);
    var per = (p.per || 1) * beat;
    var accent = light ? C.signal : (cn === 'signal' ? C.navyDeep : C.frost);
    var base = light ? C.navy : C.white;
    var made = [];
    var i;
    if (p.n) {
      var gh = KIT.text(comp, String(p.n), { size: 720, font: F.black, color: light ? C.ice : (cn === 'signal' ? C.signalBright : C.navy), x: 1900, y: 560, align: 'right' });
      KIT.keys(gh.property('ADBE Transform Group').property('ADBE Position'), [[T, [1980, 560]], [T + dur - beat * 0.6, [1900, 560]]], 20);
      KIT.fade(gh, T, T + 0.2, 0, 100);
      made.push(gh);
    }
    var bar = KIT.rect(comp, 'Chapter bar', 14, (lines.length - 1) * lh + size, 7, accent, x0 - 50, y0 + (lines.length - 1) * lh / 2);
    KIT.keys(bar.property('ADBE Transform Group').property('ADBE Scale'), [[T, [100, 0, 100]], [T + 0.35, [100, 100, 100]]], 85);
    made.push(bar);
    if (p.kicker) {
      var kk = KIT.text(comp, String(p.kicker).toUpperCase(), { size: 30, font: F.bold, color: accent, tracking: 260, x: x0, y: y0 - lh / 2 - 46, align: 'left' });
      KIT.fade(kk, T, T + 0.15, 0, 100);
      KIT.moveFrom(kk, T, -40, 0, 0.35);
      made.push(kk);
    }
    for (i = 0; i < lines.length; i++) {
      var acc = lines[i].charAt(0) === '*';
      var L = fitText(comp, lines[i].replace(/\*/g, ''), { size: size, font: F.black, color: acc ? accent : base, x: x0, y: y0 + i * lh, align: 'left' }, 1920 - x0 - 90);
      var tl = T + i * per;
      KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[tl, [122, 122, 100]], [tl + 0.18, [97, 97, 100]], [tl + 0.3, [100, 100, 100]]], 70);
      KIT.moveFrom(L, tl, -90, 0, 0.3);
      KIT.fade(L, tl, tl + 0.07, 0, 100);
      made.push(L);
    }
    // The words leave fast, alternating sides, on the last half-beat: the cut follows.
    if (p.exit !== false) {
      var tx = T + dur - beat * 0.55;
      for (i = 0; i < made.length; i++) {
        var pp = made[i].property('ADBE Transform Group').property('ADBE Position');
        var v = pp.valueAtTime(tx, false);
        var dx = (i % 2 ? 1 : -1) * 2300;
        pp.setValueAtTime(tx + i * 0.02, v);
        pp.setValueAtTime(tx + i * 0.02 + beat * 0.5, [v[0] + dx, v[1]]);
        var ki = pp.nearestKeyIndex(tx + i * 0.02 + beat * 0.5);
        try {
          pp.setTemporalEaseAtKey(ki - 1, [new KeyframeEase(0, 85)], [new KeyframeEase(0, 85)]);
          pp.setTemporalEaseAtKey(ki, [new KeyframeEase(0, 10)], [new KeyframeEase(0, 10)]);
        } catch (e) {
          // linear is fine
        }
      }
    }
  };

  // ---- about me: photo | who you are ----------------------------------------------------------------
  // p._photo (found by the build in workspace/01-camera/<film>/) fills the frame;
  // without it, a placeholder. Empty fields show as dashed placeholders to fill in the spec.
  SCENES.aboutMe = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    // p.light: on white (the trailer's world), navy and signal instead of white and frost.
    var K = p.light ? { bg: C.white, ph: C.ice, phLine: C.signal, ink: C.navy, accent: C.signal, soft: C.muted, line: C.line, chip: C.ice } : { bg: C.navy, ph: C.navyDeep, phLine: C.frost, ink: C.white, accent: C.frost, soft: C.frost, line: C.frost, chip: C.white };
    KIT.enter(comp, p._transition || 'diag', K.bg, T);
    if (!p.light) KIT.blobs(comp, C.frost, 5, 77, 6);
    var fx = 470;
    var fy = 540;
    var fw = 640;
    var fh = 780;
    var ph = [];
    if (p._photo) {
      KIT.footage = KIT.footage || {};
      var it = KIT.footage[p._photo];
      if (!it) {
        it = app.project.importFile(new ImportOptions(new File(p._photo)));
        KIT.footage[p._photo] = it;
      }
      var Lp = comp.layers.add(it);
      Lp.name = 'Photo';
      var s = Math.max(fw / it.width, fh / it.height) * 100;
      Lp.property('ADBE Transform Group').property('ADBE Scale').setValue([s, s]);
      KIT.at(Lp, fx, fy);
      var mk = Lp.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
      var hw = fw / 2 * 100 / s;
      var hh = fh / 2 * 100 / s;
      var cx = it.width / 2;
      var cy = it.height / 2;
      var shp = new Shape();
      shp.vertices = [[cx - hw, cy - hh], [cx + hw, cy - hh], [cx + hw, cy + hh], [cx - hw, cy + hh]];
      shp.closed = true;
      mk.property('ADBE Mask Shape').setValue(shp);
      ph.push(Lp);
      ph.push(U.box(comp, 'Photo border', fw, fh, 18, fx, fy, { stroke: C.white, width: 6 }));
    } else {
      ph.push(U.box(comp, 'Photo placeholder', fw, fh, 18, fx, fy, { stroke: K.phLine, width: 4, dash: 18, fill: K.ph }));
      ph.push(KIT.icon(comp, 'user', fx, fy - 60, 220, p.light ? C.white : C.navy, p.light ? C.signal : C.frost));
      ph.push(KIT.text(comp, 'YOUR PHOTO', { size: 30, font: F.bold, color: K.accent, tracking: 200, x: fx, y: fy + 120 }));
      ph.push(KIT.text(comp, 'studio/workspace/01-camera/' + (p._film || 'trailer') + '/' + (p.photo || 'photo') + '.jpg', { size: 20, font: F.mono, color: K.soft, x: fx, y: fy + 170 }));
    }
    var accent = KIT.rect(comp, 'Photo accent', fw, fh, 18, C.signal, fx + 26, fy + 26);
    accent.moveAfter(ph[0]);
    ph.push(accent);
    for (var i = 0; i < ph.length; i++) {
      KIT.moveFrom(ph[i], T, -260, 0, 0.55);
      KIT.fade(ph[i], T, T + 0.2, 0, 100);
    }
    // The right column.
    var x0 = 890;
    var eb = KIT.text(comp, p.hello || 'HI, I\'M', { size: 28, font: F.bold, color: K.accent, tracking: 240, x: x0, y: 230, align: 'left' });
    U.arrive([eb], T + 0.2, 16);
    var nm = String(p.name || 'Swarnil Singhai').split(' ');
    var nx = x0;
    for (i = 0; i < nm.length; i++) {
      var w = KIT.text(comp, nm[i], { size: 110, font: F.black, color: i ? K.accent : K.ink, x: nx, y: 330, align: 'left' });
      slamIn(w, T + beat * (0.5 + i * 0.5), 'rise', 110);
      nx += U.width(w) + 30;
    }
    var role = p.role;
    var rl = KIT.text(comp, role || '[ your role ]', { size: 38, font: F.semi, color: role ? K.ink : K.soft, x: x0, y: 430, align: 'left' });
    if (!role) rl.property('ADBE Transform Group').property('ADBE Opacity').setValue(70);
    U.arrive([rl], T + beat * 2, 20);
    var dv = KIT.rect(comp, 'Divider', 900, 3, 1, K.line, x0 + 450, 500);
    dv.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-450, 0]);
    KIT.at(dv, x0, 500);
    KIT.keys(dv.property('ADBE Transform Group').property('ADBE Scale'), [[T + beat * 2.2, [0, 100, 100]], [T + beat * 3, [100, 100, 100]]], 85);
    var stats = p.stats || [{ value: p.years, suffix: '+', label: 'years of experience' }, { value: p.companies && p.companies.length ? p.companies.length : null, suffix: '', label: 'companies' }];
    for (i = 0; i < stats.length && i < 3; i++) {
      var sx = x0 + i * 330;
      var ts = T + beat * (3 + i);
      var has = stats[i].value !== null && stats[i].value !== undefined && stats[i].value !== 0;
      var nmb = KIT.text(comp, has ? '0' : 'X' + (stats[i].suffix || ''), { size: 120, font: F.black, color: has ? K.ink : K.accent, x: sx, y: 610, align: 'left' });
      if (has) KIT.countUp(nmb, ts, ts + 1.0, stats[i].value, stats[i].suffix || '');
      var lb = KIT.text(comp, stats[i].label, { size: 26, font: F.semi, color: K.soft, x: sx + 4, y: 700, align: 'left' });
      U.arrive([nmb, lb], ts, 30);
    }
    var we = KIT.text(comp, p.workedLabel || 'WORKED WITH', { size: 24, font: F.bold, color: K.soft, tracking: 220, x: x0, y: 790, align: 'left' });
    U.arrive([we], T + beat * 5, 14);
    var cos = p.companies && p.companies.length ? p.companies : ['[ company ]', '[ company ]', '[ company ]'];
    var cx2 = x0;
    var cy2 = 860;
    for (i = 0; i < cos.length; i++) {
      var real = !!(p.companies && p.companies.length);
      var tx = KIT.text(comp, cos[i], { size: 30, font: F.black, color: real ? C.navy : K.accent, x: 0, y: cy2 });
      var pw = U.width(tx) + 56;
      if (cx2 + pw > 1840) {
        cx2 = x0;
        cy2 += 84;
      }
      var bx = U.box(comp, 'Company ' + (i + 1), pw, 66, 33, cx2 + pw / 2, cy2, real ? { fill: K.chip } : { stroke: K.accent, width: 3, dash: 10 });
      KIT.at(tx, cx2 + pw / 2, cy2);
      tx.moveBefore(bx);
      KIT.pop(bx, T + beat * (5.5 + i * 0.5));
      KIT.pop(tx, T + beat * (5.5 + i * 0.5) + 0.05);
      cx2 += pw + 18;
    }
  };
}());
