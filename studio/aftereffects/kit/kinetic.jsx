// CRM Analytics Academy — kinetic scenes for the trailer.
//
// Type leads. `slam`: one big word per beat-pair, the colour cutting with it.
// `concept`: the concept's name hits the screen, then shrinks into the
// heading while a canvas rises under it and the concept is built there
// (a recipe that runs, a join, SAQL, charts, a binding, row-level security).
// `aboutMe`: two columns, your photo and who you are. Uses the widget parts
// from platform.jsx (KIT.ui).

SCENES_INFO.push(
  { type: 'slam', label: 'Kinetic slam: one big word per beat pair, colour cuts', props: { words: ['Data.', 'Dashboards.', 'Decisions.'], icons: ['db', 'out', 'spark'] } },
  { type: 'concept', label: 'A concept: the word becomes the heading, then it is built', props: { kind: 'recipe', word: 'PREP', line: 'Recipes turn raw data into datasets.', n: 1 } },
  { type: 'aboutMe', label: 'About me: photo and who you are, two columns', props: { name: 'Swarnil Singhai', role: 'Your role', years: 0, companies: ['Company'] } }
);

(function () {
  var C = KIT.C;
  var F = KIT.F;
  var U = KIT.ui;
  var PALETTE = { navy: C.navy, signal: C.signal, paper: C.paper, navyDeep: C.navyDeep };

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
      var L = KIT.text(comp, txt, { size: size, font: F.black, color: color, y: 560 });
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
    KIT.enter(comp, p._transition || 'slices', PALETTE[cn], T);
    var ts = T + beat * 3;
    // The canvas rises from the bottom; the panel's colour stays as the header band.
    var cv = KIT.rect(comp, 'Canvas', 1920, 850, 0, C.paper, 960, 1080);
    cv.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 425]);
    KIT.keys(cv.property('ADBE Transform Group').property('ADBE Scale'), [[ts, [100, 0, 100]], [ts + 0.45, [100, 100, 100]]], 85);
    var nn = ('0' + (p.n || 1)).slice(-2);
    var k = KIT.text(comp, 'CONCEPT ' + nn, { size: 28, font: F.bold, color: C.frost, tracking: 260, y: 330 });
    KIT.pop(k, T);
    KIT.fade(k, ts, ts + 0.2, 100, 0);
    var w = KIT.text(comp, p.word || 'PREP', { size: 270, font: F.black, color: C.white, y: 540 });
    slamIn(w, T + 0.05, 'slam', 270);
    KIT.keys(w.property('ADBE Transform Group').property('ADBE Position'), [[ts, [960, 540]], [ts + 0.45, [960, 92]]], 85);
    var sc = w.property('ADBE Transform Group').property('ADBE Scale');
    KIT.keys(sc, [[ts, [100, 100, 100]], [ts + 0.45, [36, 36, 100]]], 85);
    var ln = KIT.text(comp, p.line || '', { size: 38, font: F.semi, color: C.frost, y: 720 });
    KIT.fade(ln, T + beat, T + beat + 0.25, 0, 100);
    KIT.moveFrom(ln, T + beat, 0, 30, 0.4);
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
    var L = table(comp, 'Visits', ['Source', 'Visits'], [['Google', '4.2K'], ['YouTube', '2.7K'], ['LinkedIn', '1.4K']], 80, 470, [220, 180], t);
    var R = table(comp, 'Sign-ups', ['Source', 'Sign-ups'], [['YouTube', '268'], ['Google', '412'], ['Reddit', '35']], 600, 470, [220, 180], t + 0.15);
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
    var J = table(comp, 'Left join', ['Source', 'Visits', 'Sign-ups'], [['Google', '4.2K', '412'], ['YouTube', '2.7K', '268'], ['LinkedIn', '1.4K', null]], 1130, 470, [240, 210, 260], tr);
    var pl = U.pill(comp, 'Every visit kept · no match = null', 1485, 880, { size: 26, fill: C.navy, ink: C.white });
    KIT.pop(pl[0], tr + beat * 2);
    KIT.pop(pl[1], tr + beat * 2 + 0.05);
    return J;
  };

  // SAQL: typed line by line, Run, ranked results.
  BUILD.saql = function (comp, p, t, beat) {
    U.widget(comp, 'SAQL', 40, 260, 1120, 790, t, { fill: C.code, dark: true });
    var run = U.button(comp, 'Run', 1080, 306, 120, true);
    U.arrive(run, t + 0.1);
    var lines = p.lines || [
      'q = load "academy_traffic";',
      'q = group q by \'Source\';',
      'q = foreach q generate \'Source\', sum(\'Visits\') as \'Visits\';',
      'q = order q by \'Visits\' desc;',
      'q = limit q 3;'
    ];
    for (var i = 0; i < lines.length; i++) {
      var y = 410 + i * 72;
      KIT.fade(KIT.text(comp, String(i + 1), { size: 24, font: F.mono, color: C.frost, x: 96, y: y, align: 'right' }), t, t + 0.2, 0, 60);
      U.typeOn(KIT.text(comp, lines[i], { size: 28, font: F.mono, color: i % 2 ? C.frost : C.white, x: 126, y: y, align: 'left' }), t + 0.15 + i * 0.5, 90);
    }
    var tq = t + beat * 5;
    KIT.cursor(comp, [900, 980], [1080, 306], tq, C.signalBright, true);
    var Rw = U.widget(comp, 'Results', 1200, 260, 680, 790, t + 0.2);
    var res = p.results || [['Google', 4210], ['YouTube', 2730], ['LinkedIn', 1420]];
    for (i = 0; i < res.length; i++) {
      var ry = 400 + i * 140;
      var tt = tq + 0.2 + i * 0.15;
      var rn = KIT.text(comp, res[i][0], { size: 34, font: F.black, color: C.navy, x: 1240, y: ry, align: 'left' });
      var rv = KIT.text(comp, String(res[i][1]).replace(/\B(?=(\d{3})+(?!\d))/g, ','), { size: 34, font: F.black, color: C.signal, x: 1840, y: ry, align: 'right' });
      var bw = 600 * res[i][1] / res[0][1];
      var mb = KIT.rect(comp, 'Result bar ' + (i + 1), bw, 18, 9, C.signal, 1240, ry + 50);
      mb.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-bw / 2, 0]);
      KIT.at(mb, 1240, ry + 50);
      U.arrive([rn, rv], tt, 20);
      KIT.keys(mb.property('ADBE Transform Group').property('ADBE Scale'), [[tt + 0.1, [0, 100, 100]], [tt + 0.6, [100, 100, 100]]], 70);
    }
    KIT.fade(KIT.text(comp, 'Run it →', { size: 30, font: F.semi, color: C.muted, x: Rw.cx, y: Rw.cy }), t + 0.3, t + 0.5, 0, 100);
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
    var b1 = U.bars(comp, 'Visits', 200, 950, 1520, 540, vals, t + 0.2, { labels: labels, values: ['42%', '27%', '14%', '11%', '6%'], max: 150, labelSize: 26 });
    var t1 = t + beat * 3;
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
    var t2 = t + beat * 6;
    KIT.cursor(comp, [1500, 800], [px[2], 316], t2, C.signal, true);
    KIT.keys(hp, [[t2, [px[1], 316]], [t2 + 0.2, [px[2], 316]]], 80);
    U.fadeAll(d1.concat(lg), t2, t2 + 0.2, 100, 0);
    U.lineChart(comp, 'Weekly visits', 160, 400, 1600, 460, [120, 160, 150, 210, 260, 250, 330, 410], t2 + 0.15, { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], d: 1.0 });
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
    var tc = t + beat * 3;
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
    KIT.pop(pl[0], tc + beat * 2);
    KIT.pop(pl[1], tc + beat * 2 + 0.05);
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

  // ---- about me: photo | who you are ----------------------------------------------------------------
  // p._photo (found by the build in workspace/01-camera/<film>/) fills the frame;
  // without it, a placeholder. Empty fields show as dashed placeholders to fill in the spec.
  SCENES.aboutMe = function (comp, p, T, dur) {
    var beat = p._beat || 0.585;
    KIT.enter(comp, p._transition || 'diag', C.navy, T);
    KIT.blobs(comp, C.frost, 5, 77, 6);
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
      ph.push(U.box(comp, 'Photo placeholder', fw, fh, 18, fx, fy, { stroke: C.frost, width: 4, dash: 18, fill: C.navyDeep }));
      ph.push(KIT.icon(comp, 'user', fx, fy - 60, 220, C.navy, C.frost));
      ph.push(KIT.text(comp, 'YOUR PHOTO', { size: 30, font: F.bold, color: C.frost, tracking: 200, x: fx, y: fy + 120 }));
      ph.push(KIT.text(comp, 'studio/workspace/01-camera/' + (p._film || 'trailer') + '/' + (p.photo || 'photo') + '.jpg', { size: 20, font: F.mono, color: C.frost, x: fx, y: fy + 170 }));
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
    var eb = KIT.text(comp, p.hello || 'HI, I\'M', { size: 28, font: F.bold, color: C.frost, tracking: 240, x: x0, y: 230, align: 'left' });
    U.arrive([eb], T + 0.2, 16);
    var nm = String(p.name || 'Swarnil Singhai').split(' ');
    var nx = x0;
    for (i = 0; i < nm.length; i++) {
      var w = KIT.text(comp, nm[i], { size: 110, font: F.black, color: i ? C.frost : C.white, x: nx, y: 330, align: 'left' });
      slamIn(w, T + beat * (0.5 + i * 0.5), 'rise', 110);
      nx += U.width(w) + 30;
    }
    var role = p.role;
    var rl = KIT.text(comp, role || '[ your role ]', { size: 38, font: F.semi, color: role ? C.white : C.frost, x: x0, y: 430, align: 'left' });
    if (!role) rl.property('ADBE Transform Group').property('ADBE Opacity').setValue(70);
    U.arrive([rl], T + beat * 2, 20);
    var dv = KIT.rect(comp, 'Divider', 900, 3, 1, C.frost, x0 + 450, 500);
    dv.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-450, 0]);
    KIT.at(dv, x0, 500);
    KIT.keys(dv.property('ADBE Transform Group').property('ADBE Scale'), [[T + beat * 2.2, [0, 100, 100]], [T + beat * 3, [100, 100, 100]]], 85);
    var stats = p.stats || [{ value: p.years, suffix: '+', label: 'years of experience' }, { value: p.companies && p.companies.length ? p.companies.length : null, suffix: '', label: 'companies' }];
    for (i = 0; i < stats.length && i < 3; i++) {
      var sx = x0 + i * 330;
      var ts = T + beat * (3 + i);
      var has = stats[i].value !== null && stats[i].value !== undefined && stats[i].value !== 0;
      var nmb = KIT.text(comp, has ? '0' : 'X' + (stats[i].suffix || ''), { size: 120, font: F.black, color: has ? C.white : C.frost, x: sx, y: 610, align: 'left' });
      if (has) KIT.countUp(nmb, ts, ts + 1.0, stats[i].value, stats[i].suffix || '');
      var lb = KIT.text(comp, stats[i].label, { size: 26, font: F.semi, color: C.frost, x: sx + 4, y: 700, align: 'left' });
      U.arrive([nmb, lb], ts, 30);
    }
    var we = KIT.text(comp, p.workedLabel || 'WORKED WITH', { size: 24, font: F.bold, color: C.frost, tracking: 220, x: x0, y: 790, align: 'left' });
    U.arrive([we], T + beat * 5, 14);
    var cos = p.companies && p.companies.length ? p.companies : ['[ company ]', '[ company ]', '[ company ]'];
    var cx2 = x0;
    var cy2 = 860;
    for (i = 0; i < cos.length; i++) {
      var real = !!(p.companies && p.companies.length);
      var tx = KIT.text(comp, cos[i], { size: 30, font: F.black, color: real ? C.navy : C.frost, x: 0, y: cy2 });
      var pw = U.width(tx) + 56;
      if (cx2 + pw > 1840) {
        cx2 = x0;
        cy2 += 84;
      }
      var bx = U.box(comp, 'Company ' + (i + 1), pw, 66, 33, cx2 + pw / 2, cy2, real ? { fill: C.white } : { stroke: C.frost, width: 3, dash: 10 });
      KIT.at(tx, cx2 + pw / 2, cy2);
      tx.moveBefore(bx);
      KIT.pop(bx, T + beat * (5.5 + i * 0.5));
      KIT.pop(tx, T + beat * (5.5 + i * 0.5) + 0.05);
      cx2 += pw + 18;
    }
  };
}());
