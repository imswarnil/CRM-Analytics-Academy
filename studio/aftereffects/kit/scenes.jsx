// CRM Analytics Academy — scene builders.
//
// SCENES.<type>(comp, props, T, dur): draws one scene into `comp`.
//   T    — when the scene's own action starts (its entrance runs just before T)
//   dur  — how long the scene lasts after T
//   props._transition — 'reveal' | 'bars' | 'push' | 'none' (set from the film spec)
// Add a scene: write a function here, list it in SCENES_INFO (the panel and
// studio/comp.mjs read that), and use its name as `type` in a film spec.

var SCENES = SCENES || {};
var SCENES_INFO = [
  { type: 'barsHello', label: 'The Bars say hello (opener)', props: { line1: 'CRM Analytics?', line2: 'End to end.' } },
  { type: 'logoTitle', label: 'Logo + title', props: { title: 'CRM Analytics Academy', line: 'Learn to build it. End to end.' } },
  { type: 'titleCard', label: 'Title card (navy)', props: { title: 'Lesson title', kicker: 'LESSON 1', sub: 'One line on what you will learn' } },
  { type: 'browserShot', label: 'Site screenshot in a browser', props: { screen: 'home-tall', url: 'crmanalytics.imswarnil.com', pan: [0, 0.2], chips: [{ text: 'Free to start', icon: 'check', at: [0.2, 0.4] }] } },
  { type: 'screenDeck', label: 'Screens deck (feature tour)', props: { cards: [{ screen: 'cert', label: 'Exam practice', icon: 'badge' }, { screen: 'jobs', label: 'Jobs', icon: 'brief' }] } },
  { type: 'coursePath', label: 'Course path (sections road)', props: { sections: [{ icon: 'db', label: 'Foundations' }, { icon: 'broom', label: 'Data Prep' }, { icon: 'out', label: 'Visualization' }] } },
  { type: 'dataflow', label: 'Dataflow / recipe run', props: { nodes: ['Opportunities', 'Accounts', 'Join', 'Clean', 'Output'], label: 'RECIPE RUN' } },
  { type: 'saqlTyping', label: 'SAQL typing', props: { lines: ['q = load "opportunities";', 'q = group q by \'Region\';'] } },
  { type: 'executionOrder', label: 'Execution order (a Bar hops)', props: { steps: ['load', 'filter', 'group', 'foreach', 'order', 'limit'] } },
  { type: 'bindings', label: 'Dashboard + binding click', props: { bars: [62, 88, 45, 74], labels: ['AMER', 'EMEA', 'APAC', 'LATAM'] } },
  { type: 'joins', label: 'Join two tables (lookup / left / inner)', props: { kind: 'left', left: { title: 'Accounts', cols: ['Id', 'Name'], rows: [['A1', 'Acme'], ['A2', 'Globex'], ['A3', 'Initech']] }, right: { title: 'Opportunities', cols: ['AccountId', 'Amount'], rows: [['A1', '$40K'], ['A3', '$25K'], ['A1', '$10K']] } } },
  { type: 'lowerThird', label: 'Lower third', props: { name: 'Swarnil Singhai', role: 'CRM Analytics Academy' } },
  { type: 'quote', label: 'Big statement', props: { text: 'Joins decide your numbers.', kicker: 'REMEMBER' } },
  { type: 'endCard', label: 'End card', props: { url: 'crmanalytics.imswarnil.com', cta: 'Start free' } }
];

(function () {
  var C = KIT.C;
  var F = KIT.F;

  function header(comp, kicker, title, T, dark) {
    if (kicker) KIT.pop(KIT.eyebrow(comp, kicker, 960, 130, dark ? C.frost : C.signal), T + 0.05);
    if (title) {
      var t = KIT.text(comp, title, { size: 64, font: F.black, color: dark ? C.white : C.navy, y: 205 });
      KIT.fade(t, T + 0.15, T + 0.45, 0, 100);
      KIT.moveFrom(t, T + 0.15, 0, 30, 0.45);
    }
  }
  function enter(comp, p, color, T, x, y) {
    return KIT.enter(comp, p._transition || 'reveal', color, T, x, y);
  }
  // A Bar peeking up from the bottom edge, and ducking back down at the end.
  function peek(comp, which, x, T, dur, size) {
    var c = KIT.CREW[which];
    var h = 320 * (size || 0.7) * (0.5 + c.h / 2);
    var b = KIT.bar(comp, x, comp.height + h, { w: 90 * (size || 0.7) / 0.7, h: h, color: c.color, name: c.name + ' (peek)' });
    KIT.keys(b.property('ADBE Transform Group').property('ADBE Position'), [[T, [x, comp.height + h]], [T + 0.4, [x, comp.height + h * 0.42]], [T + dur - 0.5, [x, comp.height + h * 0.42]], [T + dur - 0.15, [x, comp.height + h]]], 75);
    KIT.blink(b, [T + 1.0, T + 2.6]);
    return b;
  }

  // ---- opener: the Bars say hello ----------------------------------------------------
  SCENES.barsHello = function (comp, p, T, dur) {
    enter(comp, p, C.navy, T);
    KIT.blobs(comp, C.frost, 6, 41, 8);
    var crew = KIT.crew(comp, 960, 900, 1.15, { arm: true });
    KIT.springUp(crew, T + 0.2, 0.25);
    KIT.blink(crew[0], [T + 1.3, T + 3.4]);
    KIT.blink(crew[1], [T + 1.6, T + 3.1]);
    KIT.blink(crew[2], [T + 1.9]);
    KIT.pop(KIT.text(comp, p.line1 || 'CRM Analytics?', { size: 128, font: F.black, color: C.white, y: 250 }), T + 1.0);
    KIT.pop(KIT.text(comp, p.line2 || 'End to end.', { size: 72, font: F.black, color: C.frost, y: 380 }), T + 2.7);
    // The tall one jumps for joy.
    var x2 = crew[2].property('ADBE Transform Group').property('ADBE Position').value;
    KIT.hop(crew[2], T + 2.55, x2[0], x2[1], 140, 0.42);
  };

  // ---- logo + title ------------------------------------------------------------------------
  SCENES.logoTitle = function (comp, p, T, dur) {
    enter(comp, p, C.ice, T);
    KIT.blobs(comp, C.frost, 6, 9, 22);
    var crew = KIT.crew(comp, 960, 520, 0.82);
    KIT.springUp(crew, T + 0.05, 0.12);
    KIT.blink(crew[1], [T + 1.8]);
    KIT.blink(crew[2], [T + 2.6]);
    KIT.pop(KIT.text(comp, p.title || 'CRM Analytics Academy', { size: 116, font: F.black, color: C.navy, y: 655 }), T + 0.5);
    var l = KIT.text(comp, p.line || 'Learn to build it. End to end.', { size: 50, font: F.bold, color: C.signal, y: 770 });
    KIT.fade(l, T + 0.9, T + 1.2, 0, 100);
    KIT.moveFrom(l, T + 0.9, 0, 30, 0.4);
    KIT.chip(comp, 'Free course', 'check', 960, 880, T + 1.6, { bg: C.good });
  };

  // ---- generic title card --------------------------------------------------------------------
  SCENES.titleCard = function (comp, p, T, dur) {
    enter(comp, p, C.navy, T);
    KIT.blobs(comp, C.frost, 6, 5, 8);
    var crew = KIT.crew(comp, 960, 400, 0.5);
    KIT.springUp(crew, T + 0.1, 0.1);
    KIT.pop(KIT.eyebrow(comp, p.kicker || 'LESSON', 960, 470, C.frost), T + 0.45);
    var t = KIT.text(comp, p.title || 'Title', { size: 110, font: F.black, color: C.white, y: 580 });
    KIT.fade(t, T + 0.55, T + 0.9, 0, 100);
    KIT.moveFrom(t, T + 0.55, 0, 60, 0.6);
    if (p.sub) {
      var s = KIT.text(comp, p.sub, { size: 42, font: F.medium, color: C.frost, y: 690 });
      KIT.fade(s, T + 1.0, T + 1.4, 0, 100);
    }
  };

  // ---- a real page in a browser window ------------------------------------------------------
  SCENES.browserShot = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T, 960, 1080);
    KIT.blobs(comp, C.frost, 5, 13, 20);
    var B = KIT.browser(comp, p.screen || 'home', { w: 1420, h: 820, x: 960, y: 560, url: p.url, pan: p.pan, t0: T + 0.7, t1: T + dur - 0.2 });
    KIT.moveFrom(B.frame, T + 0.05, 0, 260, 0.6);
    KIT.fade(B.frame, T + 0.05, T + 0.3, 0, 100);
    if (p.click) KIT.cursor(comp, [1500, 1150], [B.x - B.w / 2 + p.click[0] * B.w, B.y - B.h / 2 + p.click[1] * B.h + 26], T + 1.9);
    var chips = p.chips || [];
    for (var i = 0; i < chips.length; i++) {
      KIT.chip(comp, chips[i].text, chips[i].icon || 'check', B.x - B.w / 2 + chips[i].at[0] * B.w, B.y - B.h / 2 + chips[i].at[1] * B.h, T + (p.click ? 2.6 : 1.2) + i * 0.6);
    }
    peek(comp, 1, 1770, T + 0.9, dur - 0.6, 0.8);
  };

  // ---- a deck of screens: one feature after another ----------------------------------------------
  SCENES.screenDeck = function (comp, p, T, dur) {
    enter(comp, p, C.signal, T);
    KIT.blobs(comp, C.white, 5, 29, 8);
    var cards = p.cards || [];
    var n = cards.length;
    var step = (dur - 0.6) / Math.max(1, n);
    for (var i = 0; i < n; i++) {
      var t0 = T + i * step;
      var B = KIT.browser(comp, cards[i].screen, { w: 1240, h: 720, x: 960, y: 600, url: 'crmanalytics.imswarnil.com', pan: [0, 0.06], t0: t0, t1: t0 + step });
      var pos = B.frame.property('ADBE Transform Group').property('ADBE Position');
      var rot = B.frame.property('ADBE Transform Group').property('ADBE Rotate Z');
      var keysP = [[t0 - 0.35, [2700, 640]], [t0 + 0.15, [960, 600]]];
      var keysR = [[t0 - 0.35, 9], [t0 + 0.15, 0]];
      if (i < n - 1) {
        keysP.push([t0 + step - 0.35, [960, 600]], [t0 + step + 0.15, [-800, 640]]);
        keysR.push([t0 + step - 0.35, 0], [t0 + step + 0.15, -9]);
      }
      KIT.keys(pos, keysP, 85);
      KIT.keys(rot, keysR, 85);
      // The feature's name, big, above the window.
      var lab = KIT.text(comp, cards[i].label, { size: 70, font: F.black, color: C.white, x: 1000, y: 140, name: 'Label ' + cards[i].label });
      var ic = KIT.icon(comp, cards[i].icon || 'check', 1000 - lab.sourceRectAtTime(0, false).width / 2 - 70, 140, 90, C.signal, C.white);
      var outT = i < n - 1 ? t0 + step - 0.2 : T + dur + 5;
      var parts = [lab, ic];
      for (var k = 0; k < parts.length; k++) {
        KIT.keys(parts[k].property('ADBE Transform Group').property('ADBE Opacity'), [[0, 0], [t0, 0], [t0 + 0.2, 100], [outT, 100], [outT + 0.15, 0]], 40);
      }
    }
    peek(comp, 0, 170, T + 0.6, dur - 0.3, 0.8);
  };

  // ---- the course as a road ------------------------------------------------------------------------
  SCENES.coursePath = function (comp, p, T, dur) {
    enter(comp, p, C.white, T, 0, 800);
    header(comp, p.kicker || 'THE COURSE', p.title || 'Seven sections. One path.', T);
    var secs = p.sections || [];
    var n = secs.length;
    var pts = [];
    var ins = [];
    var outs = [];
    for (var i = 0; i < n; i++) {
      pts.push([190 + i * (1540 / Math.max(1, n - 1)), i % 2 ? 560 : 780]);
      ins.push([-90, 0]);
      outs.push([90, 0]);
    }
    var road = KIT.shapeLayer(comp, 'Road');
    var g = KIT.group(road, 'Road');
    KIT.pathIn(g, pts, false, ins, outs);
    KIT.stroke(g, C.ice, 46);
    KIT.keys(KIT.trim(g).property('ADBE Vector Trim End'), [[T + 0.2, 0], [T + 1.3, 100]], 70);
    KIT.at(road, 0, 0);
    var dash = KIT.shapeLayer(comp, 'Road line');
    var g2 = KIT.group(dash, 'Line');
    KIT.pathIn(g2, pts, false, ins, outs);
    var st = KIT.stroke(g2, C.frost, 6);
    try {
      st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(22);
    } catch (e) {
      // decoration only
    }
    KIT.keys(KIT.trim(g2).property('ADBE Vector Trim End'), [[T + 0.3, 0], [T + 1.4, 100]], 70);
    KIT.at(dash, 0, 0);
    var first = T + 1.5;
    var each = Math.max(0.45, (dur - 2.4) / n);
    for (i = 0; i < n; i++) {
      var t = first + i * each;
      KIT.pop(KIT.icon(comp, secs[i].icon, pts[i][0], pts[i][1], 120, C.white, C.signal), t);
      KIT.pop(KIT.text(comp, secs[i].label, { size: 30, font: F.bold, color: C.navy, x: pts[i][0], y: pts[i][1] + 100 }), t + 0.08);
      KIT.pop(KIT.text(comp, String(i + 1), { size: 24, font: F.bold, color: C.signal, x: pts[i][0], y: pts[i][1] - 82 }), t + 0.05);
    }
    // Big Blue walks the road, one section at a time.
    var w = KIT.bar(comp, pts[0][0] - 150, pts[0][1] - 60, { w: 70, h: 120, color: 'signal', name: 'Walker' });
    KIT.pop(w, T + 1.0);
    for (i = 0; i < n; i++) KIT.hop(w, first + i * each - 0.1, pts[i][0], pts[i][1] - 62, 90, 0.36);
    KIT.blink(w, [first + n * each]);
  };

  // ---- dataflow / recipe run ---------------------------------------------------------------------
  SCENES.dataflow = function (comp, p, T, dur) {
    enter(comp, p, C.ice, T, 120, 540);
    header(comp, p.label || 'RECIPE RUN', p.title || 'Bring it in. Shape it. Run it.', T);
    var names = p.nodes || ['Opportunities', 'Accounts', 'Join', 'Clean', 'Output'];
    var icons = ['db', 'db', 'join', 'broom', 'out'];
    var at = [[300, 450], [300, 770], [790, 610], [1220, 610], [1650, 610]];
    var edges = [[0, 2], [1, 2], [2, 3], [3, 4]];
    var i;
    for (i = 0; i < edges.length; i++) {
      var a = at[edges[i][0]];
      var b = at[edges[i][1]];
      var pa = [a[0] + 165, a[1]];
      var pb = [b[0] - 165, b[1]];
      KIT.wire(comp, 'Wire ' + (i + 1), pa, pb, C.signalBright, 7, T + 0.6 + i * 0.12, T + 1.1 + i * 0.12, false);
      for (var k = 0; k < 2; k++) {
        var pk = KIT.circle(comp, 'Packet ' + (i + 1) + '.' + (k + 1), 20, C.signal, pa[0], pa[1]);
        var t0 = T + 1.2 + k * 0.45 + i * 0.1;
        var pos = pk.property('ADBE Transform Group').property('ADBE Position');
        pos.setValueAtTime(t0, pa);
        pos.setValueAtTime(t0 + 0.9, pb);
        pos.expression = 'loopOut("cycle")';
        KIT.fade(pk, t0, t0 + 0.15, 0, 100);
      }
    }
    for (i = 0; i < names.length; i++) {
      KIT.pop(KIT.card(comp, 'Node ' + names[i], 330, 120, at[i][0], at[i][1]), T + 0.2 + i * 0.1);
      KIT.pop(KIT.icon(comp, icons[i], at[i][0] - 110, at[i][1], 76, C.signal, C.ice), T + 0.3 + i * 0.1);
      KIT.fade(KIT.text(comp, names[i], { size: 30, font: F.semi, color: C.navy, x: at[i][0] - 58, y: at[i][1], align: 'left' }), T + 0.35 + i * 0.1, T + 0.6 + i * 0.1, 0, 100);
    }
    var tRun = Math.min(T + 2.2, T + dur * 0.4);
    var btn = KIT.rect(comp, 'Run button', 240, 78, 39, C.signal, 960, 900);
    KIT.pop(btn, T + 1.2);
    KIT.pop(KIT.text(comp, 'Run recipe', { size: 32, font: F.bold, color: C.white, x: 960, y: 900 }), T + 1.25);
    KIT.cursor(comp, [1400, 1100], [985, 915], tRun);
    KIT.keys(btn.property('ADBE Transform Group').property('ADBE Scale'), [[tRun, [100, 100, 100]], [tRun + 0.06, [92, 92, 100]], [tRun + 0.2, [100, 100, 100]]], 60);
    var gap = Math.max(0.15, Math.min(0.42, (dur - (tRun - T) - 1.6) / names.length));
    for (i = 0; i < names.length; i++) KIT.pop(KIT.icon(comp, 'check', at[i][0] + 160, at[i][1] - 58, 52, C.white, C.good), tRun + 0.35 + i * gap);
    var tDone = tRun + 0.4 + names.length * gap;
    KIT.pop(KIT.rect(comp, 'Done chip', 420, 64, 32, C.good, 1650, 760), tDone);
    KIT.pop(KIT.text(comp, 'Succeeded · 412,880 rows', { size: 28, font: F.bold, color: C.white, x: 1650, y: 760 }), tDone + 0.05);
    var fan = KIT.bar(comp, 1780, 1080, { w: 80, h: 150, color: 'frost', name: 'Frosty (cheers)', mood: 'o' });
    KIT.springUp([fan], tDone - 0.1);
    KIT.hop(fan, tDone + 0.4, 1780, 1080, 80, 0.36);
  };

  // ---- SAQL typing ---------------------------------------------------------------------------------
  SCENES.saqlTyping = function (comp, p, T, dur) {
    enter(comp, p, C.navyDeep, T, 960, 1080);
    KIT.blobs(comp, C.signal, 4, 17, 10);
    KIT.pop(KIT.eyebrow(comp, p.kicker || 'SAQL', 960, 130, C.frost), T + 0.05);
    var lines = p.lines || ['q = load "opportunities";'];
    KIT.pop(KIT.rect(comp, 'Editor', 1360, 640, 24, C.code, 960, 570), T + 0.1);
    var bar = KIT.shapeLayer(comp, 'Window dots');
    var dots = [C.bad, C.warn, C.good];
    for (var i = 0; i < 3; i++) {
      var g = KIT.group(bar, 'dot' + i);
      KIT.ellipseIn(g, 22, 22, i * 36, 0);
      KIT.fill(g, dots[i]);
    }
    KIT.at(bar, 330, 295);
    KIT.fade(bar, T + 0.3, T + 0.5, 0, 100);
    KIT.fade(KIT.text(comp, p.file || 'opportunities.saql', { size: 26, font: F.mono, color: C.frost, x: 960, y: 295 }), T + 0.3, T + 0.5, 0, 100);
    var nums = [];
    for (i = 0; i < lines.length; i++) nums.push(String(i + 1));
    var ln = KIT.text(comp, nums.join('\r'), { size: 36, font: F.mono, color: C.muted, x: 345, y: 360, align: 'left', leading: 64, name: 'Line numbers' });
    ln.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([ln.sourceRectAtTime(0, false).left, ln.sourceRectAtTime(0, false).top]);
    KIT.fade(ln, T + 0.35, T + 0.6, 0, 100);
    var code = KIT.text(comp, lines.join('\r'), { size: 36, font: F.mono, color: C.white, x: 410, y: 360, align: 'left', leading: 64, name: 'Code' });
    var r = code.sourceRectAtTime(0, false);
    code.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([r.left, r.top]);
    var chars = lines.join('\r').length;
    var cps = Math.max(14, chars / Math.max(1.5, dur - 2.0));
    KIT.typeOn(code, T + 0.5, cps);
    var end = T + 0.5 + chars / cps;
    KIT.pop(KIT.rect(comp, 'Result chip', 330, 64, 32, C.good, 960, 960), end + 0.2);
    KIT.pop(KIT.text(comp, p.result || '4 rows · 0.21 s', { size: 30, font: F.bold, color: C.white, x: 960, y: 960 }), end + 0.25);
    var coder = KIT.bar(comp, 1760, 1080, { w: 90, h: 200, color: 'signalBright', name: 'Bright (coding)' });
    KIT.springUp([coder], T + 0.6);
    KIT.blink(coder, [T + 1.6, end + 0.3]);
  };

  // ---- execution order: a Bar hops along the pipeline ------------------------------------------------
  SCENES.executionOrder = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T, 1800, 540);
    header(comp, p.kicker || 'HOW SAQL RUNS', p.title || 'The order it really runs in', T);
    var steps = p.steps || ['load', 'filter', 'group', 'foreach', 'order', 'limit'];
    var n = steps.length;
    var gap = Math.min(280, 1600 / n);
    var y = 640;
    var xs = [];
    var each = Math.min(0.7, (dur - 1.5) / n);
    for (var i = 0; i < n; i++) {
      var x = 960 + (i - (n - 1) / 2) * gap;
      xs.push(x);
      var land = T + 0.5 + i * each + 0.42;
      KIT.pop(KIT.card(comp, 'Step ' + (i + 1), gap - 40, 150, x, y), T + 0.2 + i * 0.08);
      var lit = KIT.rect(comp, 'Step ' + (i + 1) + ' lit', gap - 40, 150, 18, C.signal, x, y);
      KIT.keys(lit.property('ADBE Transform Group').property('ADBE Opacity'), [[0, 0], [land, 0], [land + 0.08, 100]], 30);
      KIT.pop(KIT.text(comp, String(i + 1), { size: 28, font: F.bold, color: C.muted, x: x, y: y - 40 }), T + 0.3 + i * 0.08);
      KIT.pop(KIT.text(comp, steps[i], { size: 40, font: F.monoBold, color: C.navy, x: x, y: y + 18 }), T + 0.3 + i * 0.08);
      var kw2 = KIT.text(comp, steps[i], { size: 40, font: F.monoBold, color: C.white, x: x, y: y + 18, name: steps[i] + ' (lit)' });
      KIT.keys(kw2.property('ADBE Transform Group').property('ADBE Opacity'), [[0, 0], [land, 0], [land + 0.08, 100]], 30);
    }
    var top = y - 75;
    var hopper = KIT.bar(comp, xs[0] - gap, top, { w: 70, h: 120, color: 'signalBright', name: 'Bright (hopping)' });
    KIT.pop(hopper, T + 0.1);
    for (i = 0; i < n; i++) KIT.hop(hopper, T + 0.5 + i * each, xs[i], top, 110, 0.42);
    KIT.pop(KIT.text(comp, p.result || 'Right numbers, first time', { size: 48, font: F.bold, color: C.good, y: 880 }), T + 0.5 + n * each);
  };

  // ---- dashboard with a binding ------------------------------------------------------------------------
  SCENES.bindings = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T, 960, 1080);
    header(comp, p.kicker || 'BINDINGS', p.title || 'Every click answers the next question', T);
    var bars = p.bars || [62, 88, 45, 74];
    var labels = p.labels || ['AMER', 'EMEA', 'APAC', 'LATAM'];
    var pick = p.pick === undefined ? 1 : p.pick;
    KIT.pop(KIT.card(comp, 'Chart card', 840, 600, 560, 620), T + 0.1);
    KIT.fade(KIT.text(comp, p.chartTitle || 'Revenue by region', { size: 34, font: F.bold, color: C.navy, x: 190, y: 370, align: 'left' }), T + 0.3, T + 0.5, 0, 100);
    var base = 840;
    var bx = [];
    var barLayers = [];
    for (var i = 0; i < bars.length; i++) {
      var x = 560 + (i - (bars.length - 1) / 2) * 180;
      bx.push(x);
      var h = bars[i] / 100 * 380;
      var b = KIT.bar(comp, x, base, { w: 120, h: h, color: i === pick ? 'signal' : 'signalBright', name: 'Bar ' + labels[i] });
      KIT.springUp([b], T + 0.4 + i * 0.12);
      KIT.blink(b, [T + 1.4 + i * 0.3]);
      barLayers.push(b);
      KIT.fade(KIT.text(comp, labels[i], { size: 26, font: F.bold, color: C.muted, x: x, y: base + 40 }), T + 0.5 + i * 0.12, T + 0.8 + i * 0.12, 0, 100);
    }
    KIT.pop(KIT.card(comp, 'KPI card', 560, 380, 1400, 620), T + 0.25);
    KIT.pop(KIT.eyebrow(comp, 'PIPELINE', 1400, 500), T + 0.45);
    var v1 = KIT.text(comp, p.before || '$4.2M', { size: 120, font: F.black, color: C.navy, x: 1400, y: 630, name: 'KPI before' });
    KIT.pop(v1, T + 0.5);
    var tClick = T + Math.min(2.4, dur * 0.45);
    KIT.cursor(comp, [1000, 1050], [bx[pick] + 10, base - 120], tClick);
    for (i = 0; i < barLayers.length; i++) {
      if (i !== pick) KIT.keys(barLayers[i].property('ADBE Transform Group').property('ADBE Opacity'), [[tClick + 0.05, 100], [tClick + 0.3, 30]], 60);
    }
    KIT.hop(barLayers[pick], tClick + 0.1, bx[pick], base, 40, 0.3);
    KIT.keys(v1.property('ADBE Transform Group').property('ADBE Opacity'), [[tClick + 0.5, 100], [tClick + 0.65, 0]], 60);
    var v2 = KIT.text(comp, p.after || '$1.6M', { size: 120, font: F.black, color: C.signal, x: 1400, y: 630, name: 'KPI after' });
    KIT.from(v2, tClick + 0.55);
    KIT.pop(v2, tClick + 0.6);
    KIT.pop(KIT.rect(comp, 'Filter chip', 200, 54, 27, C.ice, 1400, 730), tClick + 0.7);
    KIT.pop(KIT.text(comp, labels[pick], { size: 26, font: F.bold, color: C.signal, x: 1400, y: 730 }), tClick + 0.72);
    KIT.wire(comp, 'Binding wire', [bx[pick] + 70, base - bars[pick] / 100 * 380 + 30], [1120, 620], C.signal, 5, tClick + 0.1, tClick + 0.55, true);
    KIT.pop(KIT.rect(comp, 'Binding label', 190, 50, 25, C.navy, 960, 450), tClick + 0.5);
    KIT.pop(KIT.text(comp, 'binding', { size: 26, font: F.mono, color: C.white, x: 960, y: 450 }), tClick + 0.52);
  };


  // ---- joins: two tables, the key lights up, matches connect, the result builds ----------------------
  // props.kind: 'lookup' (first match) | 'left' (every match: fan-out) | 'inner' (matched rows only)
  function table(comp, name, cols, rows, x, y, colW, t, keyCol, color) {
    var rowH = 58;
    var w = cols.length * colW;
    var out = { rows: [], x: x, y: y, w: w, rowH: rowH };
    var head = KIT.rect(comp, name + ' header', w, rowH, 12, color || C.navy, x, y);
    KIT.pop(head, t);
    for (var c = 0; c < cols.length; c++) {
      KIT.pop(KIT.text(comp, cols[c], { size: 24, font: F.bold, color: C.white, x: x - w / 2 + colW * (c + 0.5), y: y }), t + 0.05);
    }
    for (var r = 0; r < rows.length; r++) {
      var ry = y + (r + 1) * (rowH + 6);
      var row = KIT.rect(comp, name + ' row ' + (r + 1), w, rowH, 10, C.white, x, ry);
      KIT.pop(row, t + 0.1 + r * 0.06);
      var cells = [];
      for (c = 0; c < cols.length; c++) {
        var v = rows[r][c];
        var empty = v === null || v === undefined || v === '';
        var tx = KIT.text(comp, empty ? '—' : String(v), { size: 26, font: c === keyCol ? F.monoBold : F.semi, color: empty ? C.frost : (c === keyCol ? C.signal : C.navy), x: x - w / 2 + colW * (c + 0.5), y: ry });
        KIT.pop(tx, t + 0.15 + r * 0.06);
        cells.push(tx);
      }
      out.rows.push({ layer: row, y: ry, cells: cells });
    }
    return out;
  }
  SCENES.joins = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    var kind = p.kind || 'left';
    header(comp, p.kicker || 'JOINS', p.title || ({ lookup: 'Lookup: one match each', left: 'Left join: every match', inner: 'Inner join: matches only' })[kind], T);
    var L = p.left;
    var R = p.right;
    var lk = p.leftKey || 0;
    var rk = p.rightKey || 0;
    var lt = table(comp, L.title, L.cols, L.rows, 520, 330, 200, T + 0.2, lk, C.navy);
    var rt = table(comp, R.title, R.cols, R.rows, 1400, 330, 220, T + 0.35, rk, C.signal);
    KIT.pop(KIT.eyebrow(comp, L.title, 520, 280, C.navy), T + 0.2);
    KIT.pop(KIT.eyebrow(comp, R.title, 1400, 280, C.signal), T + 0.35);
    // Matches: a wire from each right row to its left row.
    var tm = T + 1.1;
    var result = [];
    var i;
    var j;
    for (i = 0; i < L.rows.length; i++) {
      var hits = [];
      for (j = 0; j < R.rows.length; j++) if (String(R.rows[j][rk]) === String(L.rows[i][lk])) hits.push(j);
      if (kind === 'lookup' && hits.length > 1) hits = [hits[0]];
      for (j = 0; j < hits.length; j++) {
        var a = [lt.x + lt.w / 2 + 8, lt.rows[i].y];
        var b = [rt.x - rt.w / 2 - 8, rt.rows[hits[j]].y];
        KIT.wire(comp, 'Match ' + (i + 1) + '-' + (hits[j] + 1), a, b, hits.length > 1 && kind === 'left' ? C.warn : C.signal, 5, tm + result.length * 0.18, tm + result.length * 0.18 + 0.35, true);
        var row = [];
        for (var c = 0; c < L.cols.length; c++) row.push(L.rows[i][c]);
        for (c = 0; c < R.cols.length; c++) if (c !== rk) row.push(R.rows[hits[j]][c]);
        result.push(row);
      }
      if (!hits.length && kind !== 'inner') {
        var row2 = [];
        for (var c2 = 0; c2 < L.cols.length; c2++) row2.push(L.rows[i][c2]);
        for (c2 = 0; c2 < R.cols.length; c2++) if (c2 !== rk) row2.push(null);
        result.push(row2);
      }
    }
    var cols = [];
    for (i = 0; i < L.cols.length; i++) cols.push(L.cols[i]);
    for (i = 0; i < R.cols.length; i++) if (i !== rk) cols.push(R.cols[i]);
    var tr = tm + result.length * 0.18 + 0.6;
    var resY = 330 + (Math.max(L.rows.length, R.rows.length) + 1) * 64 + 90;
    KIT.pop(KIT.eyebrow(comp, 'RESULT · ' + result.length + ' ROWS', 960, resY - 50, C.good), tr);
    table(comp, 'Result', cols, result, 960, resY, 210, tr + 0.1, -1, C.good);
    var judge = KIT.bar(comp, 1790, 1080, { w: 80, h: 150, color: kind === 'left' && result.length > L.rows.length ? 'warn' : 'signalBright', name: 'Bright (watching)', mood: kind === 'left' && result.length > L.rows.length ? 'o' : undefined });
    KIT.springUp([judge], tr + 0.4);
  };

  // ---- end card -------------------------------------------------------------------------------------------
  SCENES.endCard = function (comp, p, T, dur) {
    enter(comp, p, C.navy, T);
    KIT.blobs(comp, C.frost, 6, 31, 8);
    var crew = KIT.crew(comp, 960, 470, 0.72, { arm: true });
    KIT.springUp(crew, T + 0.1, 0.15);
    for (var i = 0; i < 3; i++) {
      var v = crew[i].property('ADBE Transform Group').property('ADBE Position').value;
      KIT.hop(crew[i], T + 1.9 + i * 0.12, v[0], v[1], 70, 0.36);
      KIT.blink(crew[i], [T + 2.8 + i * 0.3]);
    }
    KIT.fade(KIT.text(comp, p.title || 'CRM Analytics Academy', { size: 60, font: F.black, color: C.white, y: 545 }), T + 0.3, T + 0.6, 0, 100);
    KIT.pop(KIT.rect(comp, 'URL pill', 1060, 124, 62, C.white, 960, 690), T + 0.5);
    KIT.pop(KIT.text(comp, p.url || 'crmanalytics.imswarnil.com', { size: 58, font: F.bold, color: C.navy, y: 690 }), T + 0.55);
    var btn = KIT.rect(comp, 'CTA button', 400, 104, 52, C.signal, 960, 860);
    KIT.pop(btn, T + 1.0);
    btn.property('ADBE Transform Group').property('ADBE Scale').expression = 'time > ' + (T + 1.7).toFixed(2) + ' ? value * (1 + 0.04 * Math.max(0, Math.sin((time - ' + (T + 1.7).toFixed(2) + ') * 4))) : value';
    KIT.pop(KIT.text(comp, (p.cta || 'Start free') + '  →', { size: 44, font: F.bold, color: C.white, y: 860 }), T + 1.05);
    if (p._credit) KIT.fade(KIT.text(comp, p._credit, { size: 22, font: F.medium, color: C.frost, y: 1035 }), T + 1.2, T + 1.6, 0, 70);
  };

  // ---- extras -----------------------------------------------------------------------------------------------
  SCENES.lowerThird = function (comp, p, T, dur) {
    var bar = KIT.rect(comp, 'Lower third bar', 760, 130, 18, C.white, 520, 900);
    KIT.moveFrom(bar, T, -900, 0, 0.5);
    var acc = KIT.rect(comp, 'Accent', 14, 90, 7, C.signal, 170, 900);
    KIT.moveFrom(acc, T + 0.05, -900, 0, 0.5);
    var n = KIT.text(comp, p.name || 'Name', { size: 46, font: F.bold, color: C.navy, x: 200, y: 878, align: 'left' });
    KIT.moveFrom(n, T + 0.1, -900, 0, 0.5);
    var r = KIT.text(comp, p.role || 'Role', { size: 30, font: F.medium, color: C.signal, x: 200, y: 930, align: 'left' });
    KIT.moveFrom(r, T + 0.15, -900, 0, 0.5);
    var out = T + Math.max(1.5, dur - 0.6);
    var all = [bar, acc, n, r];
    for (var i = 0; i < all.length; i++) KIT.fade(all[i], out, out + 0.3, 100, 0);
  };
  SCENES.quote = function (comp, p, T, dur) {
    enter(comp, p, C.navy, T);
    if (p.kicker) KIT.pop(KIT.eyebrow(comp, p.kicker, 960, 400, C.frost), T + 0.1);
    KIT.pop(KIT.text(comp, p.text || 'A big statement.', { size: 96, font: F.black, color: C.white, y: 540 }), T + 0.25);
    var b = KIT.bar(comp, 1650, 1080, { w: 100, h: 220, color: 'signalBright', name: 'Bright (nods)' });
    KIT.springUp([b], T + 0.5);
  };
}());
