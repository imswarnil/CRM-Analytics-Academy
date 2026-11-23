// CRM Analytics Academy — concept infographics and the closing scenes.
//
// Tables as props: rows are real bundles (a bar + cells) that move, tint and
// leave, so a filter, a function or a limit is something you watch happen.
// Plus: our own platform's data, the project's stack, the GitHub star, and the
// YouTube end screen. No characters.

SCENES_INFO.push(
  { type: 'filterViz', label: 'How a filter works (rows drop out)', props: {} },
  { type: 'functionViz', label: 'How a function works (sum, count, avg)', props: {} },
  { type: 'limitViz', label: 'Order + limit (sort, then cut)', props: {} },
  { type: 'techStack', label: 'The stack behind the project', props: { by: 'Swarnil Singhai' } },
  { type: 'githubStar', label: 'Star the project on GitHub', props: { repo: 'imswarnil/CRM-Analytics-Academy' } },
  { type: 'endScreen', label: 'YouTube end screen: start here + subscribe', props: { next: 'Lesson 1 · Objects, fields and relationships' } }
);

(function () {
  var C = KIT.C;
  var F = KIT.F;

  function header(comp, kicker, title, T, dark) {
    var k = KIT.eyebrow(comp, kicker, 960, 120, dark ? C.frost : C.signal);
    KIT.pop(k, T + 0.05);
    var t = KIT.text(comp, title, { size: 60, font: F.black, color: dark ? C.white : C.navy, y: 192 });
    KIT.fade(t, T + 0.15, T + 0.45, 0, 100);
    KIT.moveFrom(t, T + 0.15, 0, 30, 0.45);
    k.comment = 'keep2d';
    t.comment = 'keep2d';
  }
  function enter(comp, p, color, T, x, y) {
    return KIT.enter(comp, p._transition || 'reveal', color, T, x, y);
  }
  // A table row: a rounded bar with cells. Returns its bundle (a null at x, y).
  function row(comp, name, cells, widths, x, y, opts) {
    opts = opts || {};
    var w = 0;
    var i;
    for (i = 0; i < widths.length; i++) w += widths[i];
    var parts = [KIT.rect(comp, name + ' bar', w, 54, 12, opts.fill || C.white, x, y)];
    var cx = x - w / 2;
    for (i = 0; i < cells.length; i++) {
      parts.push(KIT.text(comp, cells[i], { size: opts.size || 24, font: i === 0 ? F.bold : F.semi, color: opts.ink || (i === 0 ? C.navy : C.muted), x: cx + 24, y: y, align: 'left' }));
      cx += widths[i];
    }
    return KIT.bundle(comp, name, parts, x, y);
  }
  function headRow(comp, name, cols, widths, x, y, color) {
    return row(comp, name + ' header', cols, widths, x, y, { fill: color || C.navy, ink: C.white, size: 20 });
  }

  // ---- our own platform's data: real tables, the tools they come from, the datasets ---------------
  SCENES.platformData = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    header(comp, p.kicker || 'THE PROJECT', p.title || "Built on our own platform's data", T);
    var beat = p._beat || 0.585;
    var tables = p.tables || [
      ['web_traffic', 'Cloudflare Web Analytics', ['Day', 'Page', 'Visits'], [['Nov 21', '/course', '1,204'], ['Nov 21', '/course/saql', '866'], ['Nov 22', '/', '2,310']]],
      ['signups', 'Neon Postgres', ['Day', 'Source', 'Sign-ups'], [['Nov 22', 'YouTube', '42'], ['Nov 22', 'LinkedIn', '18'], ['Nov 22', 'Website', '61']]],
      ['lesson_progress', 'Neon Postgres', ['Learner', 'Section', 'Done'], [['Priya', 'Data Prep', '8 / 8'], ['Rahul', 'SAQL', '3 / 6'], ['Ana', 'Foundations', '3 / 3']]],
      ['payments', 'Dodo Payments', ['Day', 'Plan', 'Amount'], [['Nov 22', 'Pro yearly', '$119'], ['Nov 22', 'Teams', '$4,800'], ['Nov 21', 'Pro monthly', '$19']]]
    ];
    var spots = [[470, 420], [1010, 420], [470, 740], [1010, 740]];
    var widths = [140, 190, 150];
    var cards = [];
    var n = 0;
    for (var i = 0; i < tables.length; i++) {
      var x = spots[i][0];
      var y = spots[i][1];
      var parts = [KIT.card(comp, 'Table ' + tables[i][0], 520, 290, x, y)];
      parts.push(KIT.text(comp, tables[i][0], { size: 26, font: F.monoBold, color: C.navy, x: x - 236, y: y - 108, align: 'left' }));
      var tag = KIT.rect(comp, 'Tool ' + tables[i][1], 24 + tables[i][1].length * 11, 34, 17, C.ice, x + 248 - (12 + tables[i][1].length * 5.5), y - 108);
      parts.push(tag);
      parts.push(KIT.text(comp, tables[i][1], { size: 17, font: F.bold, color: C.signal, x: x + 248 - (12 + tables[i][1].length * 5.5), y: y - 108 }));
      // Rows join the card before anything animates (parenting to a scale-0 parent misplaces them).
      var hr = headRow(comp, tables[i][0], tables[i][2], widths, x, y - 50, C.navy);
      parts.push(hr);
      var rws = [];
      for (var r = 0; r < tables[i][3].length; r++) {
        var rw = row(comp, tables[i][0] + ' row ' + (r + 1), tables[i][3][r], widths, x, y + 10 + r * 58, { fill: r % 2 ? C.white : C.paper });
        parts.push(rw);
        rws.push(rw);
      }
      var cb = KIT.bundle(comp, 'Table ' + tables[i][0] + ' group', parts, x, y);
      KIT.pop(cb, T + 0.2 + i * beat / 2);
      cards.push(cb);
      KIT.fade(hr, T + 0.5 + i * beat / 2, T + 0.7 + i * beat / 2, 0, 100);
      for (r = 0; r < rws.length; r++) {
        var tr = T + 0.9 + n * beat / 2;
        KIT.moveFrom(rws[r], tr, -30, 0, 0.35);
        KIT.fade(rws[r], tr, tr + 0.2, 0, 100);
        n++;
      }
      KIT.wire(comp, 'Feed ' + (i + 1), [x + 262, y], [1480, 470], C.signalBright, 5, T + 1.0 + i * 0.15, T + 1.5 + i * 0.15, true);
    }
    var org = KIT.cloud(comp, 'Salesforce + CRM Analytics', 1640, 470, 420, C.signal);
    KIT.pop(org, T + 1.4);
    var o1 = KIT.text(comp, 'Salesforce', { size: 32, font: F.black, color: C.white, x: 1640, y: 462 });
    var o2 = KIT.text(comp, '+ CRM Analytics', { size: 22, font: F.bold, color: C.ice, x: 1640, y: 500 });
    KIT.pop(o1, T + 1.45);
    KIT.pop(o2, T + 1.5);
    var ds = p.datasets || ['academy_traffic', 'academy_funnel', 'academy_revenue'];
    var dsl = [];
    for (i = 0; i < ds.length; i++) {
      var d = KIT.chip(comp, ds[i], 'db', 1640, 680 + i * 86, T + 2.0 + i * beat / 2, { bg: C.navy });
      dsl = dsl.concat(d);
    }
    KIT.to3D(comp);
    KIT.setZ(org, -100);
    KIT.setZ(o1, -105);
    KIT.setZ(o2, -105);
    KIT.front(dsl, -60);
    KIT.camera(comp, [[Math.max(0, T - 0.5), KIT.orbitPos(960, 560, -10, 8), [960, 560, 0]], [T + dur, KIT.orbitPos(960, 560, 5, 3, KIT.ZOOM - 80), [960, 560, 0]]], 60);
  };

  // ---- how a filter works --------------------------------------------------------------------------------
  SCENES.filterViz = function (comp, p, T, dur) {
    enter(comp, p, C.white, T);
    header(comp, p.kicker || 'HOW A FILTER WORKS', p.title || 'Keep the rows that match. Drop the rest.', T);
    var beat = p._beat || 0.585;
    var rows = p.rows || [['Acme', 'Closed Won', '$40K'], ['Globex', 'Prospecting', '$12K'], ['Initech', 'Closed Won', '$25K'], ['Umbrella', 'Negotiation', '$30K'], ['Stark', 'Closed Won', '$61K'], ['Wayne', 'Closed Lost', '$18K'], ['Hooli', 'Qualification', '$9K'], ['Piper', 'Closed Won', '$22K']];
    var keep = p.keep || 'Closed Won';
    var widths = [220, 300, 180];
    var x = 680;
    headRow(comp, 'Opportunities', ['Account', 'Stage', 'Amount'], widths, x, 300);
    var tF = T + Math.max(1.6, dur * 0.3);
    var kept = 0;
    for (var i = 0; i < rows.length; i++) {
      var y = 362 + i * 62;
      var match = rows[i][1] === keep;
      var r = row(comp, 'Row ' + rows[i][0], rows[i], widths, x, y, { fill: i % 2 ? C.white : C.paper });
      KIT.fade(r, T + 0.3 + i * beat / 4, T + 0.45 + i * beat / 4, 0, 100);
      var pos = r.property('ADBE Transform Group').property('ADBE Position');
      if (match) {
        var ok = KIT.icon(comp, 'check', x + 380, y, 44, C.white, C.good);
        ok.parent = r;
        KIT.pop(ok, tF + i * 0.05);
        KIT.keys(pos, [[tF + 0.8, [x, y]], [tF + 1.3, [x, 362 + kept * 62]]], 80);
        kept++;
      } else {
        var no = KIT.rect(comp, 'Drop ' + rows[i][0], 700, 54, 12, C.bad, x, y);
        KIT.keys(no.property('ADBE Transform Group').property('ADBE Opacity'), [[0, 0], [tF + i * 0.05, 0], [tF + 0.15 + i * 0.05, 18]], 40);
        no.parent = r;
        KIT.keys(pos, [[tF + 0.35 + i * 0.04, [x, y]], [tF + 0.8 + i * 0.04, [x + 260, y]]], 70);
        KIT.opacityKeys(r, [[tF + 0.35 + i * 0.04, 100], [tF + 0.75 + i * 0.04, 0]], 50);
      }
    }
    var code = KIT.rect(comp, 'Filter statement', 600, 76, 38, C.navy, 1440, 420);
    KIT.pop(code, T + 0.9);
    KIT.pop(KIT.text(comp, 'filter q by \'Stage\' == "' + keep + '"', { size: 24, font: F.monoBold, color: C.white, x: 1440, y: 420 }), T + 0.95);
    var tR = tF + 1.4;
    KIT.pop(KIT.rect(comp, 'Count chip', 360, 70, 35, C.good, 1440, 560), tR);
    KIT.pop(KIT.text(comp, rows.length + ' rows  →  ' + kept + ' rows', { size: 30, font: F.black, color: C.white, x: 1440, y: 560 }), tR + 0.05);
    var note = KIT.text(comp, 'Filter early: every step after it has less to do.', { size: 26, font: F.semi, color: C.muted, x: 1440, y: 650 });
    KIT.fade(note, tR + 0.4, tR + 0.7, 0, 100);
  };

  // ---- how a function works -------------------------------------------------------------------------------
  SCENES.functionViz = function (comp, p, T, dur) {
    enter(comp, p, C.navyDeep, T);
    header(comp, p.kicker || 'HOW A FUNCTION WORKS', p.title || 'Many rows in. One answer out.', T, true);
    var beat = p._beat || 0.585;
    var vals = p.values || ['$40K', '$25K', '$61K', '$22K', '$12K', '$24K'];
    var machine = KIT.rect(comp, 'Function', 440, 220, 30, C.signal, 960, 600);
    KIT.pop(machine, T + 0.3);
    KIT.pop(KIT.text(comp, p.fn || "sum('Amount')", { size: 40, font: F.monoBold, color: C.white, x: 960, y: 600 }), T + 0.35);
    var tIn = T + 0.9;
    for (var i = 0; i < vals.length; i++) {
      var y = 330 + i * 92;
      var ch = KIT.rect(comp, 'Value ' + (i + 1), 200, 64, 32, C.code, 330, y);
      var tx = KIT.text(comp, vals[i], { size: 30, font: F.bold, color: C.frost, x: 330, y: y });
      tx.parent = ch;
      KIT.pop(ch, T + 0.2 + i * beat / 4);
      var t = tIn + i * beat / 2;
      KIT.keys(ch.property('ADBE Transform Group').property('ADBE Position'), [[t, [330, y]], [t + 0.45, [800, 600]]], 80);
      KIT.keys(ch.property('ADBE Transform Group').property('ADBE Scale'), [[t + 0.3, [100, 100, 100]], [t + 0.45, [30, 30, 100]]], 60);
      KIT.opacityKeys(ch, [[t + 0.35, 100], [t + 0.46, 0]], 40);
      KIT.keys(machine.property('ADBE Transform Group').property('ADBE Scale'), [[t + 0.42, [100, 100, 100]], [t + 0.5, [106, 106, 100]], [t + 0.62, [100, 100, 100]]], 60);
    }
    var tOut = tIn + vals.length * beat / 2 + 0.4;
    var res = KIT.text(comp, p.result || '$184K', { size: 130, font: F.black, color: C.white, x: 1500, y: 580 });
    KIT.from(res, tOut);
    KIT.moveFrom(res, tOut, -380, 0, 0.5);
    KIT.fade(res, tOut, tOut + 0.2, 0, 100);
    var more = p.more || [["count()", '6'], ["avg('Amount')", '$30.7K'], ["max('Amount')", '$61K']];
    for (i = 0; i < more.length; i++) {
      var my = 730 + i * 80;
      var tm = tOut + 0.6 + i * beat / 2;
      KIT.pop(KIT.rect(comp, 'More ' + i, 440, 62, 31, C.code, 1500, my), tm);
      KIT.pop(KIT.text(comp, more[i][0] + '  =  ' + more[i][1], { size: 26, font: F.monoBold, color: C.frost, x: 1500, y: my }), tm + 0.05);
    }
  };

  // ---- order + limit ---------------------------------------------------------------------------------------
  SCENES.limitViz = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    header(comp, p.kicker || 'ORDER + LIMIT', p.title || 'Sort first. Then keep the top 5.', T);
    var beat = p._beat || 0.585;
    var data = p.data || [['Globex', 42], ['Acme', 88], ['Hooli', 30], ['Stark', 95], ['Initech', 61], ['Wayne', 54], ['Piper', 77], ['Umbrella', 23], ['Wonka', 69], ['Cyberdyne', 36]];
    var keep = p.limit || 5;
    var sorted = data.slice().sort(function (a, b) { return b[1] - a[1]; });
    var rankOf = {};
    for (var s = 0; s < sorted.length; s++) rankOf[sorted[s][0]] = s;
    var tSort = T + Math.max(1.2, dur * 0.25);
    var tCut = tSort + 1.2;
    for (var i = 0; i < data.length; i++) {
      var y0 = 300 + i * 66;
      var y1 = 300 + rankOf[data[i][0]] * 66;
      var w = data[i][1] / 100 * 760;
      var parts = [KIT.text(comp, data[i][0], { size: 26, font: F.bold, color: C.navy, x: 220, y: y0, align: 'left' })];
      var bar = KIT.rect(comp, 'Bar ' + data[i][0], w, 44, 10, C.signalBright, 420 + w / 2, y0);
      parts.push(bar);
      parts.push(KIT.text(comp, String(data[i][1]) + 'K', { size: 22, font: F.bold, color: C.muted, x: 440 + w, y: y0, align: 'left' }));
      var b = KIT.bundle(comp, 'Row ' + data[i][0], parts, 600, y0);
      KIT.moveFrom(b, T + 0.3 + i * beat / 4, -80, 0, 0.4);
      KIT.fade(b, T + 0.3 + i * beat / 4, T + 0.5 + i * beat / 4, 0, 100);
      KIT.keys(b.property('ADBE Transform Group').property('ADBE Position'), [[tSort + i * 0.04, [600, y0]], [tSort + 0.6 + i * 0.04, [600, y1]]], 80);
      if (rankOf[data[i][0]] >= keep) KIT.opacityKeys(b, [[tCut + 0.3, 100], [tCut + 0.6, 22]], 50);
    }
    var cutY = 300 + keep * 66 - 33;
    var cut = KIT.rect(comp, 'Cut line', 1000, 6, 3, C.warn, 700, cutY);
    KIT.keys(cut.property('ADBE Transform Group').property('ADBE Scale'), [[tCut, [0, 100, 100]], [tCut + 0.35, [100, 100, 100]]], 80);
    var code = KIT.text(comp, "q = order q by 'Revenue' desc;\rq = limit q " + keep + ';', { size: 28, font: F.monoBold, color: C.navy, x: 1260, y: 420, align: 'left', leading: 46 });
    KIT.fade(code, T + 0.8, T + 1.1, 0, 100);
    KIT.pop(KIT.rect(comp, 'Kept chip', 300, 64, 32, C.good, 1450, 600), tCut + 0.4);
    KIT.pop(KIT.text(comp, 'Top ' + keep + ' kept', { size: 28, font: F.black, color: C.white, x: 1450, y: 600 }), tCut + 0.45);
  };

  // ---- the stack behind this project -------------------------------------------------------------------------
  SCENES.techStack = function (comp, p, T, dur) {
    enter(comp, p, C.white, T);
    header(comp, p.kicker || ('BUILT BY ' + String(p.by || 'Swarnil Singhai').toUpperCase()), p.title || 'The stack behind this project', T);
    var beat = p._beat || 0.585;
    var tools = p.tools || [
      ['Salesforce', 'CRM · Web-to-Lead', C.signal], ['CRM Analytics', 'recipes · dashboards', C.signal], ['Nuxt 4 + Vue', 'the web app', C.good], ['Tailwind CSS', 'the design system', C.good],
      ['Cloudflare Workers', 'hosting at the edge', C.warn], ['Neon Postgres', 'accounts · progress', C.warn], ['GitHub Actions', 'CI · daily jobs feed', C.warn], ['Dodo Payments', 'checkout', C.navy],
      ['LibreTranslate', '7 languages', C.navy], ['After Effects', 'this motion kit', C.navy], ['Premiere Pro', 'the edit', C.navy], ['AI assistants', 'mockups · checks', C.navy]
    ];
    var tiles = [];
    for (var i = 0; i < tools.length; i++) {
      var col = i % 4;
      var rw = Math.floor(i / 4);
      var x = 960 + (col - 1.5) * 420;
      var y = 380 + rw * 175;
      var parts = [KIT.card(comp, 'Tool ' + tools[i][0], 390, 140, x, y)];
      parts.push(KIT.rect(comp, 'Tool accent ' + i, 10, 80, 5, tools[i][2], x - 170, y));
      parts.push(KIT.text(comp, tools[i][0], { size: 32, font: F.black, color: C.navy, x: x - 140, y: y - 18, align: 'left' }));
      parts.push(KIT.text(comp, tools[i][1], { size: 22, font: F.medium, color: C.muted, x: x - 140, y: y + 24, align: 'left' }));
      var tb = KIT.bundle(comp, 'Tool ' + tools[i][0] + ' group', parts, x, y);
      tiles.push([tb, T + 0.3 + i * beat / 2]);
    }
    var by = KIT.text(comp, 'Designed, built and taught by ' + (p.by || 'Swarnil Singhai'), { size: 30, font: F.bold, color: C.signal, y: 930 });
    KIT.fade(by, T + 0.4 + tools.length * beat / 2, T + 0.8 + tools.length * beat / 2, 0, 100);
    KIT.to3D(comp);
    for (i = 0; i < tiles.length; i++) {
      KIT.flyIn(tiles[i][0], tiles[i][1], 700, 0, 0.5);
      KIT.keys(tiles[i][0].property('ADBE Transform Group').property('ADBE Rotate X'), [[tiles[i][1], -70], [tiles[i][1] + 0.5, 0]], 80);
    }
    KIT.camera(comp, [[Math.max(0, T - 0.5), KIT.orbitPos(960, 560, 8, 10), [960, 560, 0]], [T + dur, KIT.orbitPos(960, 560, -4, 3, KIT.ZOOM - 80), [960, 560, 0]]], 60);
  };

  // ---- star the project on GitHub ---------------------------------------------------------------------------
  SCENES.githubStar = function (comp, p, T, dur) {
    enter(comp, p, C.navyDeep, T);
    header(comp, p.kicker || 'OPEN SOURCE', p.title || 'Star the project on GitHub', T, true);
    var repo = p.repo || 'imswarnil/CRM-Analytics-Academy';
    var card = [KIT.rect(comp, 'Repo card', 1100, 300, 26, C.code, 960, 560)];
    card.push(KIT.icon(comp, 'code', 520, 520, 100, C.white, C.signal));
    card.push(KIT.text(comp, repo.split('/')[0] + ' / ', { size: 40, font: F.medium, color: C.frost, x: 600, y: 500, align: 'left' }));
    card.push(KIT.text(comp, repo.split('/')[1], { size: 44, font: F.black, color: C.white, x: 600, y: 556, align: 'left' }));
    card.push(KIT.text(comp, 'Lessons, the site and this video kit, all open', { size: 24, font: F.medium, color: C.frost, x: 600, y: 610, align: 'left' }));
    var cb = KIT.bundle(comp, 'Repo group', card, 960, 560);
    KIT.pop(cb, T + 0.2);
    var btn = KIT.rect(comp, 'Star button', 220, 76, 38, C.white, 1310, 660);
    KIT.pop(btn, T + 0.5);
    var s0 = KIT.icon(comp, 'star', 1250, 660, 52, C.muted, C.white);
    KIT.pop(s0, T + 0.55);
    var bt = KIT.text(comp, 'Star', { size: 30, font: F.bold, color: C.navy, x: 1300, y: 660, align: 'left' });
    KIT.pop(bt, T + 0.6);
    var tc = T + Math.max(1.4, dur * 0.4);
    KIT.cursor(comp, [1600, 950], [1330, 672], tc);
    var s1 = KIT.icon(comp, 'star', 1250, 660, 52, C.sun, C.white);
    KIT.from(s1, tc + 0.05);
    KIT.pop(s1, tc + 0.05, 130);
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2;
      var sp = KIT.rect(comp, 'Sparkle ' + k, 14, 14, 3, C.sun, 1250, 660);
      sp.property('ADBE Transform Group').property('ADBE Rotate Z').setValue(45);
      KIT.keys(sp.property('ADBE Transform Group').property('ADBE Position'), [[tc + 0.05, [1250, 660]], [tc + 0.5, [1250 + Math.cos(a) * 110, 660 + Math.sin(a) * 110]]], 60);
      KIT.keys(sp.property('ADBE Transform Group').property('ADBE Opacity'), [[0, 0], [tc + 0.05, 0], [tc + 0.1, 100], [tc + 0.5, 0]], 40);
    }
    var url = KIT.text(comp, 'github.com/' + repo, { size: 32, font: F.monoBold, color: C.frost, y: 860 });
    KIT.fade(url, tc + 0.4, tc + 0.7, 0, 100);
  };

  // ---- YouTube end screen: start here + subscribe + the site ------------------------------------------------
  // The dashed slots are where YouTube's end-screen elements sit (video on the left,
  // subscribe on the right); add them in YouTube Studio over these places.
  SCENES.endScreen = function (comp, p, T, dur) {
    enter(comp, p, C.navy, T);
    KIT.blobs(comp, C.frost, 6, 71, 7);
    KIT.mark(comp, 170, 140, 90, T);
    KIT.pop(KIT.eyebrow(comp, p.kicker || 'START HERE', 600, 230, C.frost), T + 0.2);
    var slot = KIT.shapeLayer(comp, 'Video slot (YouTube end screen)');
    var g = KIT.group(slot, 'Slot');
    KIT.rectIn(g, 880, 495, 22);
    KIT.fill(g, C.white, 8);
    var st = KIT.stroke(g, C.frost, 4);
    try {
      st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(18);
    } catch (e) {
      // decoration
    }
    KIT.at(slot, 600, 540);
    KIT.pop(slot, T + 0.3);
    KIT.pop(KIT.icon(comp, 'play', 600, 520, 130, C.navy, C.white), T + 0.5);
    var nx = KIT.text(comp, p.next || 'Lesson 1 · Objects, fields and relationships', { size: 30, font: F.bold, color: C.white, x: 600, y: 850 });
    KIT.fade(nx, T + 0.6, T + 0.9, 0, 100);
    var sub = KIT.shapeLayer(comp, 'Subscribe slot (YouTube end screen)');
    var sg = KIT.group(sub, 'Slot');
    KIT.ellipseIn(sg, 300, 300);
    KIT.fill(sg, C.white, 8);
    var ss = KIT.stroke(sg, C.frost, 4);
    try {
      ss.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(18);
    } catch (e2) {
      // decoration
    }
    KIT.at(sub, 1440, 430);
    KIT.pop(sub, T + 0.45);
    KIT.pop(KIT.text(comp, 'Subscribe', { size: 40, font: F.black, color: C.white, x: 1440, y: 640 }), T + 0.7);
    KIT.pop(KIT.rect(comp, 'Visit pill', 640, 96, 48, C.white, 1440, 790), T + 0.9);
    KIT.pop(KIT.text(comp, p.url || 'crmanalytics.imswarnil.com', { size: 34, font: F.bold, color: C.navy, x: 1440, y: 790 }), T + 0.95);
    if (p._credit) KIT.fade(KIT.text(comp, p._credit, { size: 22, font: F.medium, color: C.frost, y: 1035 }), T + 1.2, T + 1.6, 0, 70);
  };
}());
