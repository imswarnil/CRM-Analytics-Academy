// CRM Analytics Academy — the end-to-end story scenes, in 3D.
//
// One real example the whole way through: the Academy itself. Someone signs
// up on the site, becomes a Lead in Salesforce, the data is synced, shaped and
// queried, lands on a dashboard, is locked down with a security predicate and
// shared where people work. Every scene is built flat, then turned 3D with a
// moving camera (KIT.to3D + KIT.camera). No characters on these: the data is the star.

SCENES_INFO.push(
  { type: 'signupStory', label: 'Sign-up becomes a Lead (3D browser)', props: { screen: 'home', name: 'Priya Sharma', company: 'Acme Retail' } },
  { type: 'learnSalesforce', label: 'Salesforce: a Lead, fields, convert (3D)', props: { name: 'Priya Sharma', company: 'Acme Retail', owner: 'Asha Rao' } },
  { type: 'integration', label: 'End-to-end pipeline, camera tracks along (3D)', props: {} },
  { type: 'dashboard3D', label: 'Dashboard example: KPIs, source, funnel (3D)', props: { title: 'Academy Leads' } },
  { type: 'securityPredicate', label: 'Security predicate: each rep sees their rows (3D)', props: {} },
  { type: 'sharingEmbed', label: 'Sharing and embedding: record page, mobile (3D)', props: { record: 'Account · Acme Retail' } },
  { type: 'salesforceModel', label: 'Salesforce objects, fields, relationships (3D)', props: {} },
  { type: 'aiAssist', label: 'AI for mockups and data validation', props: { prompt: 'Mock up an adoption dashboard' } },
  { type: 'designerCanvas', label: 'Dashboard designer: widgets snap onto the grid (3D)', props: {} },
  { type: 'dashboardTypes', label: 'Kinds of dashboards: pipeline, adoption, performance, traffic, snapshots (3D)', props: {} },
  { type: 'securityRoles', label: 'Who sees what: owner, manager, leader (3D)', props: {} },
  { type: 'gtmEngine', label: 'GTM engineering: funnel, scoring, routing (3D)', props: {} },
  { type: 'teamSeats', label: 'Teams: a company buys seats and upskills (3D)', props: { company: 'Acme Retail', seats: 25 } }
);

(function () {
  var C = KIT.C;
  var F = KIT.F;
  var CX = 960;
  var CY = 540;

  function header(comp, kicker, title, T) {
    var k = KIT.eyebrow(comp, kicker, 960, 120, C.signal);
    KIT.pop(k, T + 0.05);
    var t = KIT.text(comp, title, { size: 60, font: F.black, color: C.navy, y: 192 });
    KIT.fade(t, T + 0.15, T + 0.45, 0, 100);
    KIT.moveFrom(t, T + 0.15, 0, 30, 0.45);
    // Titles stay flat and still while the camera moves.
    k.comment = 'keep2d';
    t.comment = 'keep2d';
  }
  function enter(comp, p, color, T, x, y) {
    return KIT.enter(comp, p._transition || 'reveal', color, T, x, y);
  }
  function orbitCam(comp, T, dur, from, to, push) {
    var a = KIT.orbitPos(CX, CY, from[0], from[1], KIT.ZOOM);
    var b = KIT.orbitPos(CX, CY, to[0], to[1], KIT.ZOOM - (push || 0));
    return KIT.camera(comp, [[Math.max(0, T - 0.5), a, [CX, CY, 0]], [T + dur, b, [CX, CY, 0]]], 60);
  }

  // ---- someone signs up on the site, and a Lead is born ---------------------------------------
  SCENES.signupStory = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    KIT.blobs(comp, C.frost, 5, 51, 22);
    var B = KIT.browser(comp, p.screen || 'home', { w: 1120, h: 656, x: 760, y: 560, url: 'crmanalytics.imswarnil.com' });
    // "Start free" on the home page, in window coordinates.
    var bx = B.x - B.w / 2 + 0.083 * B.w;
    var by = B.y - B.h / 2 + 52 + 0.533 * (B.w * 1800 / 2880);
    var tClick = T + Math.min(1.6, dur * 0.3);
    KIT.cursor(comp, [1300, 1000], [bx + 30, by + 8], tClick);
    var toast = KIT.chip(comp, 'New sign-up', 'user', 1440, 300, tClick + 0.35, { bg: C.good });
    var lead = KIT.record(comp, 'Lead', p.name || 'Priya Sharma', [['Company', p.company || 'Acme Retail'], ['Lead Source', 'Website'], ['Status', 'New']], 1440, 600, 400, tClick + 0.55, C.signal);
    KIT.wire(comp, 'To Salesforce', [1130, 470], [1230, 520], C.signal, 6, tClick + 0.4, tClick + 0.7, true);
    KIT.to3D(comp);
    KIT.keys(B.frame.property('ADBE Transform Group').property('ADBE Rotate Y'), [[0, 24], [T + 1.0, 10]], 70);
    KIT.setZ(lead, -200);
    KIT.flyIn(lead, tClick + 0.5, 900, 0, 0.6);
    KIT.front(toast, -200);
    orbitCam(comp, T, dur, [-18, 8], [5, 2], 80);
  };

  // ---- learn Salesforce: the Lead, its fields, and convert --------------------------------------
  SCENES.learnSalesforce = function (comp, p, T, dur) {
    enter(comp, p, C.ice, T);
    header(comp, p.kicker || 'LEARN SALESFORCE', p.title || 'Objects, fields and relationships', T);
    var cloud = KIT.cloud(comp, 'Org cloud', 960, 640, 1500, C.white);
    KIT.fade(cloud, T, T + 0.4, 0, 70);
    var name = p.name || 'Priya Sharma';
    var co = p.company || 'Acme Retail';
    var owner = p.owner || 'Asha Rao';
    var lead = KIT.record(comp, 'Lead', name, [['Company', co], ['Lead Source', 'Website'], ['Status', 'Working'], ['Owner', owner]], 960, 600, 480, T + 0.2, C.signal);
    var tConv = T + Math.max(2.4, dur * 0.42);
    var btn = KIT.rect(comp, 'Convert button', 220, 70, 35, C.good, 960, 840);
    KIT.pop(btn, T + 1.2);
    var bt = KIT.text(comp, 'Convert', { size: 30, font: F.bold, color: C.white, x: 960, y: 840 });
    KIT.pop(bt, T + 1.25);
    KIT.cursor(comp, [1300, 1040], [975, 852], tConv);
    KIT.popOut(lead, tConv + 0.25);
    KIT.popOut(btn, tConv + 0.25);
    KIT.popOut(bt, tConv + 0.25);
    var acc = KIT.record(comp, 'Account', co, [['Industry', 'Retail'], ['Owner', owner]], 420, 640, 420, tConv + 0.45, C.navy);
    var con = KIT.record(comp, 'Contact', name, [['Account', co], ['Title', 'Head of Sales']], 960, 640, 420, tConv + 0.6, C.good);
    var opp = KIT.record(comp, 'Opportunity', 'Pro seats', [['Account', co], ['Amount', '$4,800'], ['Stage', 'Proposal']], 1500, 640, 420, tConv + 0.75, C.warn);
    KIT.wire(comp, 'Account to Contact', [632, 660], [748, 660], C.navy, 6, tConv + 0.9, tConv + 1.2, false);
    KIT.wire(comp, 'Account to Opportunity', [420, 500], [1500, 470], C.navy, 6, tConv + 1.0, tConv + 1.5, true);
    var tag = KIT.rect(comp, 'AccountId tag', 190, 46, 23, C.navy, 960, 470);
    KIT.pop(tag, tConv + 1.4);
    KIT.pop(KIT.text(comp, 'AccountId', { size: 22, font: F.monoBold, color: C.white, x: 960, y: 470 }), tConv + 1.45);
    KIT.to3D(comp);
    KIT.setZ(acc, -120);
    KIT.setZ(opp, -120);
    KIT.setZ(cloud, 300);
    orbitCam(comp, T, dur, [10, 5], [-5, 2], 60);
  };

  // ---- end to end: the camera travels along the pipeline -----------------------------------------
  SCENES.integration = function (comp, p, T, dur) {
    enter(comp, p, C.white, T, 0, 600);
    header(comp, p.kicker || 'END TO END', p.title || 'From Salesforce to the dashboard', T);
    var st = p.stations || [
      ['Salesforce', 'cloud', 'Leads, accounts, opportunities'],
      ['Data Sync', 'sync', 'every hour'],
      ['Recipe', 'join', 'join · clean · enrich'],
      ['Dataset', 'db', 'academy_leads'],
      ['Dashboard', 'out', 'KPIs and charts'],
      ['Lightning page', 'share', 'on the Lead record']
    ];
    var gap = 560;
    var x0 = 520;
    var y = 600;
    var each = (dur - 0.6) / st.length;
    var i;
    var track = KIT.rect(comp, 'Track', gap * (st.length - 1), 14, 7, C.ice, x0 + gap * (st.length - 1) / 2, y);
    KIT.fade(track, T, T + 0.3, 0, 100);
    for (i = 0; i < st.length - 1; i++) {
      var a = [x0 + i * gap + 110, y];
      var b = [x0 + (i + 1) * gap - 110, y];
      KIT.wire(comp, 'Link ' + (i + 1), a, b, C.signalBright, 8, T + i * each + 0.3, T + i * each + 0.8, false);
      for (var k = 0; k < 3; k++) {
        var pk = KIT.rect(comp, 'Row packet ' + (i + 1) + '.' + (k + 1), 34, 14, 7, C.signal, a[0], a[1]);
        var t0 = T + i * each + 0.6 + k * 0.3;
        var pos = pk.property('ADBE Transform Group').property('ADBE Position');
        pos.setValueAtTime(t0, a);
        pos.setValueAtTime(t0 + 0.8, b);
        pos.expression = 'loopOut("cycle")';
        KIT.fade(pk, t0, t0 + 0.1, 0, 100);
      }
    }
    var badges = [];
    for (i = 0; i < st.length; i++) {
      var x = x0 + i * gap;
      var t = T + i * each;
      var badge;
      if (st[i][1] === 'cloud') {
        badge = KIT.cloud(comp, 'Station Salesforce', x, y, 240, C.signal);
      } else if (st[i][1] === 'out') {
        badge = KIT.miniDash(comp, 'Station Dashboard', x, y, 230, 170);
      } else if (st[i][1] === 'share') {
        badge = KIT.shapeLayer(comp, 'Station page');
        var g = KIT.group(badge, 'Page');
        KIT.rectIn(g, 230, 40, 8, 0, -60);
        KIT.fill(g, C.navy);
        var g2 = KIT.group(badge, 'Body');
        KIT.rectIn(g2, 230, 170, 14);
        KIT.fill(g2, C.white);
        KIT.stroke(g2, C.line, 3);
        KIT.at(badge, x, y);
        var mini = KIT.miniDash(comp, 'Embedded', x + 40, y + 20, 120, 90);
        mini.parent = badge;
      } else {
        badge = KIT.icon(comp, st[i][1], x, y, 190, C.white, C.signal);
      }
      KIT.pop(badge, t);
      badges.push(badge);
      var lb = KIT.text(comp, st[i][0], { size: 40, font: F.black, color: C.navy, x: x, y: y + 150 });
      KIT.pop(lb, t + 0.1);
      var cap = KIT.text(comp, st[i][2], { size: 26, font: F.medium, color: C.muted, x: x, y: y + 200 });
      KIT.fade(cap, t + 0.2, t + 0.4, 0, 100);
      var n = KIT.text(comp, String(i + 1), { size: 24, font: F.bold, color: C.signal, x: x, y: y - 140 });
      KIT.pop(n, t + 0.05);
    }
    KIT.to3D(comp);
    for (i = 0; i < badges.length; i++) KIT.setZ(badges[i], i % 2 ? -60 : 60);
    // The camera rides along, looking slightly down the line.
    var xs = x0 + gap * 0.5;
    var xe = x0 + gap * (st.length - 1.5);
    KIT.camera(comp, [
      [Math.max(0, T - 0.5), [xs - 420, 400, -1900], [xs, 600, 0]],
      [T + dur, [xe + 260, 430, -2000], [xe + 120, 600, 0]]
    ], 40);
  };

  // ---- a real dashboard, assembled in 3D -----------------------------------------------------------
  SCENES.dashboard3D = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    var panel = KIT.card(comp, 'Dashboard panel', 1600, 880, 960, 560);
    var head = [KIT.text(comp, p.title || 'Academy Leads', { size: 44, font: F.black, color: C.navy, x: 200, y: 180, align: 'left' }),
      KIT.text(comp, 'CRM Analytics · updated hourly', { size: 22, font: F.medium, color: C.muted, x: 200, y: 222, align: 'left' })];
    var pills = ['Source: All', 'Region: All', 'Owner: All'];
    for (var i = 0; i < pills.length; i++) {
      head.push(KIT.rect(comp, 'Pill ' + pills[i], 190, 46, 23, C.ice, 1110 + i * 210, 196));
      head.push(KIT.text(comp, pills[i], { size: 20, font: F.bold, color: C.signal, x: 1110 + i * 210, y: 196 }));
    }
    var headB = KIT.bundle(comp, 'Dashboard header', head, 960, 200);
    // KPIs.
    var kpis = [['LEADS', '1,284', 1284, ''], ['CONVERTED', '18%', 18, '%'], ['PIPELINE', '$420K', 0, '']];
    var kpiB = [];
    for (i = 0; i < 3; i++) {
      var kx = 470 + i * 490;
      var ly = [KIT.card(comp, 'KPI ' + kpis[i][0], 450, 150, kx, 340, C.white)];
      ly.push(KIT.eyebrow(comp, kpis[i][0], kx, 300, C.signal));
      var v = KIT.text(comp, kpis[i][1], { size: 64, font: F.black, color: C.navy, x: kx, y: 362 });
      if (kpis[i][2]) KIT.countUp(v, T + 0.8 + i * 0.15, T + 2.2 + i * 0.15, kpis[i][2], kpis[i][3]);
      ly.push(v);
      kpiB.push(KIT.bundle(comp, 'KPI ' + kpis[i][0] + ' group', ly, kx, 340));
    }
    // Leads by source (bars).
    var src = p.sources || [['Website', 88], ['LinkedIn', 64], ['YouTube', 52], ['Referral', 30]];
    var bl = [KIT.card(comp, 'Source widget', 720, 440, 570, 700)];
    bl.push(KIT.text(comp, 'Leads by source', { size: 30, font: F.bold, color: C.navy, x: 240, y: 520, align: 'left' }));
    for (i = 0; i < src.length; i++) {
      var by = 590 + i * 76;
      bl.push(KIT.text(comp, src[i][0], { size: 24, font: F.semi, color: C.muted, x: 240, y: by, align: 'left' }));
      var w = src[i][1] / 100 * 400;
      var bar = KIT.rect(comp, 'Source bar ' + src[i][0], w, 40, 8, i ? C.signalBright : C.signal, 400 + w / 2, by);
      bar.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-w / 2, 0]);
      KIT.at(bar, 400, by);
      KIT.keys(bar.property('ADBE Transform Group').property('ADBE Scale'), [[T + 1.0 + i * 0.12, [0, 100, 100]], [T + 1.5 + i * 0.12, [100, 100, 100]]], 80);
      bl.push(bar);
      var num = KIT.text(comp, String(Math.round(src[i][1] * 4.1)), { size: 24, font: F.bold, color: C.navy, x: 420 + w, y: by, align: 'left' });
      KIT.fade(num, T + 1.4 + i * 0.12, T + 1.6 + i * 0.12, 0, 100);
      bl.push(num);
    }
    var srcB = KIT.bundle(comp, 'Source widget group', bl, 570, 700);
    // Conversion funnel.
    var fun = [['Leads', '1,284', 560], ['Qualified', '642', 440], ['Opportunities', '310', 320], ['Won', '231', 220]];
    var fl = [KIT.card(comp, 'Funnel widget', 720, 440, 1350, 700)];
    fl.push(KIT.text(comp, 'Conversion', { size: 30, font: F.bold, color: C.navy, x: 1020, y: 520, align: 'left' }));
    var fc = [C.frost, C.signalBright, C.signal, C.navy];
    for (i = 0; i < fun.length; i++) {
      var fy = 590 + i * 76;
      var seg = KIT.rect(comp, 'Funnel ' + fun[i][0], fun[i][2], 60, 12, fc[i], 1350, fy);
      KIT.keys(seg.property('ADBE Transform Group').property('ADBE Scale'), [[T + 1.2 + i * 0.15, [0, 100, 100]], [T + 1.6 + i * 0.15, [100, 100, 100]]], 80);
      fl.push(seg);
      var ft = KIT.text(comp, fun[i][0] + '  ' + fun[i][1], { size: 24, font: F.bold, color: i ? C.white : C.navy, x: 1350, y: fy });
      KIT.fade(ft, T + 1.5 + i * 0.15, T + 1.7 + i * 0.15, 0, 100);
      fl.push(ft);
    }
    var funB = KIT.bundle(comp, 'Funnel widget group', fl, 1350, 700);
    KIT.to3D(comp);
    var parts = [headB, kpiB[0], kpiB[1], kpiB[2], srcB, funB];
    KIT.flyIn(panel, T - 0.1, 600, 20, 0.7);
    for (i = 0; i < parts.length; i++) KIT.flyIn(parts[i], T + 0.2 + i * 0.12, 700, 0, 0.6);
    var cam = KIT.camera(comp, [
      [Math.max(0, T - 0.5), KIT.orbitPos(CX, CY, 28, 16), [CX, CY, 0]],
      [T + 1.8, KIT.orbitPos(CX, CY, 0, 3), [CX, CY, 0]],
      [T + dur, KIT.orbitPos(CX, CY, -6, 2, KIT.ZOOM - 260), [CX, CY, 0]]
    ], 70);
  };

  // ---- security predicate: the same dataset, two reps, two views ------------------------------------
  SCENES.securityPredicate = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    header(comp, p.kicker || 'SECURITY', p.title || 'Each rep sees only their own leads', T);
    var rows = p.rows || [['Priya Sharma', 'A'], ['Leo Martin', 'B'], ['Mei Chen', 'A'], ['Omar Ali', 'B'], ['Sara Kim', 'A'], ['Tom Reed', 'B']];
    var who = { A: ['AR', 'Asha Rao', C.signal], B: ['BK', 'Ben Kumar', C.warn] };
    var tl = [KIT.card(comp, 'Dataset card', 560, 560, 400, 640)];
    tl.push(KIT.icon(comp, 'db', 180, 405, 56, C.white, C.navy));
    tl.push(KIT.text(comp, 'academy_leads', { size: 28, font: F.monoBold, color: C.navy, x: 220, y: 405, align: 'left' }));
    var rowPos = [];
    var i;
    for (i = 0; i < rows.length; i++) {
      var ry = 480 + i * 66;
      rowPos.push([400, ry]);
      tl.push(KIT.rect(comp, 'Row ' + rows[i][0], 500, 54, 10, C.paper, 400, ry));
      tl.push(KIT.circle(comp, 'Owner dot ' + (i + 1), 18, who[rows[i][1]][2], 175, ry));
      tl.push(KIT.text(comp, rows[i][0], { size: 24, font: F.semi, color: C.navy, x: 200, y: ry, align: 'left' }));
      tl.push(KIT.text(comp, who[rows[i][1]][1], { size: 20, font: F.bold, color: who[rows[i][1]][2], x: 630, y: ry, align: 'right' }));
    }
    var table = KIT.bundle(comp, 'Dataset', tl, 400, 640);
    KIT.pop(table, T + 0.2);
    // The predicate.
    var pr = KIT.rect(comp, 'Predicate', 600, 76, 38, C.navy, 1010, 320);
    KIT.pop(pr, T + 0.8);
    var lk = KIT.icon(comp, 'lock', 745, 320, 56, C.navy, C.white);
    KIT.pop(lk, T + 0.85);
    var code = KIT.text(comp, "'OwnerId' == \"$User.Id\"", { size: 28, font: F.monoBold, color: C.white, x: 1040, y: 320 });
    KIT.pop(code, T + 0.9);
    // Two reps, two views.
    var panels = {};
    var keys = ['A', 'B'];
    for (i = 0; i < 2; i++) {
      var k = keys[i];
      var py = 560 + i * 300;
      var pl = [KIT.card(comp, 'View ' + who[k][1], 700, 260, 1340, py)];
      pl.push(KIT.avatar(comp, who[k][0], 1060, py - 70, 74, who[k][2]));
      pl.push(KIT.text(comp, who[k][1] + ' sees', { size: 28, font: F.bold, color: C.navy, x: 1110, y: py - 70, align: 'left' }));
      pl.push(KIT.icon(comp, 'lock', 1640, py - 70, 50, C.white, who[k][2]));
      var pn = KIT.bundle(comp, 'View ' + who[k][1] + ' group', pl, 1340, py);
      KIT.pop(pn, T + 1.1 + i * 0.15);
      panels[k] = { y: py, n: 0, layer: pn };
    }
    // Rows travel to the rep who owns them.
    var tGo = T + Math.max(1.9, dur * 0.35);
    for (i = 0; i < rows.length; i++) {
      var pnl = panels[rows[i][1]];
      var dest = [1150 + pnl.n * 205, pnl.y + 40];
      pnl.n++;
      var chip = KIT.rect(comp, 'Copy ' + rows[i][0], 190, 50, 25, who[rows[i][1]][2], rowPos[i][0], rowPos[i][1]);
      var ct = KIT.text(comp, rows[i][0].split(' ')[0], { size: 22, font: F.bold, color: C.white, x: rowPos[i][0], y: rowPos[i][1] });
      ct.parent = chip;
      var t0 = tGo + i * 0.16;
      KIT.keys(chip.property('ADBE Transform Group').property('ADBE Position'), [[t0, rowPos[i]], [t0 + 0.6, dest]], 85);
      KIT.opacityKeys(chip, [[0, 0], [t0, 0], [t0 + 0.08, 100]], 30);
    }
    KIT.to3D(comp);
    KIT.setZ(pr, -120);
    KIT.setZ(lk, -120);
    KIT.setZ(code, -120);
    orbitCam(comp, T, dur, [-12, 8], [6, 2], 120);
  };

  // ---- sharing and embedding: where people already work -----------------------------------------------
  SCENES.sharingEmbed = function (comp, p, T, dur) {
    enter(comp, p, C.ice, T);
    header(comp, p.kicker || 'SHARING AND EMBEDDING', p.title || 'Right where people already work', T);
    // A Lead record page with the dashboard embedded in it.
    var pg = [KIT.card(comp, 'Lead page', 1080, 620, 720, 620)];
    pg.push(KIT.rect(comp, 'Lead page header', 1080, 90, 16, C.navy, 720, 355));
    pg.push(KIT.icon(comp, p.icon || 'brief', 230, 355, 58, C.navy, C.white));
    pg.push(KIT.text(comp, p.record || 'Account · Acme Retail', { size: 32, font: F.bold, color: C.white, x: 280, y: 355, align: 'left' }));
    var fields = p.fields || [['Industry', 'Retail'], ['Seats', '25'], ['Plan', 'Teams'], ['Owner', 'Asha Rao']];
    for (var i = 0; i < fields.length; i++) {
      pg.push(KIT.text(comp, fields[i][0], { size: 20, font: F.medium, color: C.muted, x: 220, y: 450 + i * 90, align: 'left' }));
      pg.push(KIT.text(comp, fields[i][1], { size: 28, font: F.bold, color: C.navy, x: 220, y: 485 + i * 90, align: 'left' }));
    }
    var page = KIT.bundle(comp, 'Lead page group', pg, 720, 620);
    KIT.pop(page, T + 0.1);
    var emb = KIT.miniDash(comp, 'Embedded dashboard', 900, 640, 560, 420);
    KIT.pop(emb, T + 0.7);
    var ring = KIT.shapeLayer(comp, 'Highlight');
    var rg = KIT.group(ring, 'Ring');
    KIT.rectIn(rg, 590, 450, 20);
    KIT.stroke(rg, C.signal, 6);
    KIT.at(ring, 900, 640);
    KIT.keys(ring.property('ADBE Transform Group').property('ADBE Opacity'), [[0, 0], [T + 1.1, 0], [T + 1.3, 100], [T + 1.9, 100], [T + 2.3, 40]], 50);
    var tag = KIT.chip(comp, 'Embedded dashboard', 'out', 900, 880, T + 1.2);
    // Mobile.
    var ph = KIT.phone(comp, 1560, 610, 560, T + 1.5);
    var mob = KIT.chip(comp, 'On mobile', 'check', 1560, 945, T + 1.8, { bg: C.good });
    // Shared with the team.
    var tShare = T + Math.max(2.4, dur * 0.55);
    var av = [['AR', C.signal], ['BK', C.warn], ['MS', C.good], ['+5', C.navy]];
    var avl = [];
    for (i = 0; i < av.length; i++) {
      var a = KIT.avatar(comp, av[i][0], 250 + i * 52, 990, 70, av[i][1]);
      KIT.pop(a, tShare + i * 0.08);
      avl.push(a);
    }
    var sh = KIT.chip(comp, 'Shared with the Sales team', 'share', 640, 990, tShare + 0.4, { bg: C.navy });
    KIT.to3D(comp);
    KIT.keys(page.property('ADBE Transform Group').property('ADBE Rotate Y'), [[0, 14], [T + 1.2, 6]], 70);
    KIT.setZ(emb, -90);
    KIT.setZ(ring, -90);
    KIT.setZ(ph, -260);
    KIT.keys(ph.property('ADBE Transform Group').property('ADBE Rotate Y'), [[0, -24], [T + 1.8, -12]], 70);
    KIT.front(tag);
    KIT.front(mob, -300);
    KIT.front(sh);
    KIT.front(avl);
    orbitCam(comp, T, dur, [14, 6], [-5, 2], 80);
  };
  // ---- Salesforce: objects, fields and how records relate ---------------------------------------------
  SCENES.salesforceModel = function (comp, p, T, dur) {
    enter(comp, p, C.ice, T);
    header(comp, p.kicker || 'LEARN SALESFORCE', p.title || 'Objects, fields and relationships', T);
    var cloud = KIT.cloud(comp, 'Org cloud', 960, 650, 1500, C.white);
    KIT.fade(cloud, T, T + 0.4, 0, 70);
    var each = Math.max(0.5, (dur - 1.5) / 5);
    var acc = KIT.record(comp, 'Account', 'Acme Retail', [['Industry', 'Retail'], ['Seats', '25'], ['Owner', 'Asha Rao']], 960, 470, 440, T + 0.2, C.navy);
    var con = KIT.record(comp, 'Contact', 'Priya Sharma', [['Account', 'Acme Retail'], ['Role', 'Analyst']], 430, 760, 420, T + 0.2 + each, C.good);
    var opp = KIT.record(comp, 'Opportunity', 'Team seats', [['Amount', '$4,800'], ['Stage', 'Proposal']], 1490, 760, 420, T + 0.2 + each * 2, C.warn);
    var prog = KIT.record(comp, 'Course_Progress__c', 'Data Prep', [['Lessons', '8 of 8']], 960, 860, 420, T + 0.2 + each * 3, C.signal);
    KIT.wire(comp, 'AccountId → Contact', [740, 470], [430, 650], C.navy, 6, T + 0.3 + each, T + 0.8 + each, true);
    KIT.wire(comp, 'AccountId → Opportunity', [1180, 470], [1490, 660], C.navy, 6, T + 0.3 + each * 2, T + 0.8 + each * 2, true);
    KIT.wire(comp, 'Contact → Progress', [640, 790], [750, 850], C.signal, 6, T + 0.3 + each * 3, T + 0.8 + each * 3, true);
    var tags = [['Lookup', 600, 560, each], ['Lookup', 1330, 560, each * 2], ['Custom object', 700, 930, each * 3]];
    for (var i = 0; i < tags.length; i++) {
      var tg = KIT.rect(comp, 'Tag ' + tags[i][0] + ' ' + i, 30 + tags[i][0].length * 15, 44, 22, C.navy, tags[i][1], tags[i][2]);
      KIT.pop(tg, T + 0.8 + tags[i][3]);
      KIT.pop(KIT.text(comp, tags[i][0], { size: 20, font: F.bold, color: C.white, x: tags[i][1], y: tags[i][2] }), T + 0.85 + tags[i][3]);
    }
    KIT.to3D(comp);
    KIT.setZ(acc, -80);
    KIT.setZ(prog, -160);
    KIT.setZ(cloud, 300);
    orbitCam(comp, T, dur, [10, 6], [-6, 2], 60);
  };

  // ---- AI: mockups and data validation ----------------------------------------------------------------
  SCENES.aiAssist = function (comp, p, T, dur) {
    enter(comp, p, C.navyDeep, T);
    var k = KIT.eyebrow(comp, p.kicker || 'AI, USED WELL', 960, 120, C.frost);
    KIT.pop(k, T + 0.05);
    var tt = KIT.text(comp, p.title || 'Mock up faster. Validate every number.', { size: 56, font: F.black, color: C.white, y: 192 });
    KIT.fade(tt, T + 0.15, T + 0.45, 0, 100);
    // Left: a prompt, then a wireframe draws itself.
    KIT.pop(KIT.rect(comp, 'Prompt', 760, 84, 42, C.code, 520, 330), T + 0.3);
    KIT.pop(KIT.icon(comp, 'spark', 180, 330, 56, C.code, C.frost), T + 0.35);
    var pt = KIT.text(comp, p.prompt || 'Mock up an adoption dashboard', { size: 28, font: F.medium, color: C.white, x: 225, y: 330, align: 'left' });
    KIT.typeOn(pt, T + 0.5, 30);
    var wf = [[520, 470, 760, 70], [330, 640, 370, 230], [710, 640, 370, 230], [520, 830, 760, 110]];
    for (var i = 0; i < wf.length; i++) {
      var r = KIT.shapeLayer(comp, 'Wireframe ' + (i + 1));
      var g = KIT.group(r, 'Box');
      KIT.rectIn(g, wf[i][2], wf[i][3], 12);
      KIT.fill(g, C.white, 6);
      var st = KIT.stroke(g, C.frost, 3);
      try {
        st.property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(14);
      } catch (e) {
        // decoration
      }
      KIT.keys(KIT.trim(g).property('ADBE Vector Trim End'), [[T + 1.6 + i * 0.25, 0], [T + 2.1 + i * 0.25, 100]], 60);
      KIT.at(r, wf[i][0], wf[i][1]);
    }
    // Right: checks run against the data.
    var checks = p.checks || [['Row count matches the source', 'ok'], ['Every lead has an owner', 'ok'], ['Revenue reconciles to Salesforce', 'ok'], ['3 duplicate emails found, merged', 'warn']];
    var tC = T + Math.max(2.4, dur * 0.4);
    KIT.pop(KIT.card(comp, 'Checks card', 760, 520, 1420, 650, C.white), tC - 0.3);
    KIT.pop(KIT.text(comp, 'Data validation', { size: 32, font: F.black, color: C.navy, x: 1080, y: 440, align: 'left' }), tC - 0.2);
    for (i = 0; i < checks.length; i++) {
      var cy = 530 + i * 95;
      var t = tC + i * 0.35;
      KIT.pop(KIT.icon(comp, checks[i][1] === 'ok' ? 'check' : 'spark', 1110, cy, 56, C.white, checks[i][1] === 'ok' ? C.good : C.warn), t);
      var ct = KIT.text(comp, checks[i][0], { size: 26, font: F.semi, color: C.navy, x: 1155, y: cy, align: 'left' });
      KIT.fade(ct, t, t + 0.2, 0, 100);
    }
  };

  // ---- the dashboard designer ---------------------------------------------------------------------------
  SCENES.designerCanvas = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    header(comp, p.kicker || 'VISUAL DESIGNER', p.title || 'Build it widget by widget', T);
    var pal = [KIT.card(comp, 'Palette', 240, 640, 210, 640)];
    var kinds = [['Chart', 'out'], ['Number', 'badge'], ['Table', 'db'], ['Filter', 'link'], ['Text', 'chat']];
    var i;
    for (i = 0; i < kinds.length; i++) {
      pal.push(KIT.icon(comp, kinds[i][1], 150, 400 + i * 110, 60, C.white, C.signal));
      pal.push(KIT.text(comp, kinds[i][0], { size: 24, font: F.bold, color: C.navy, x: 195, y: 400 + i * 110, align: 'left' }));
    }
    var palB = KIT.bundle(comp, 'Palette group', pal, 210, 640);
    KIT.pop(palB, T + 0.2);
    // The canvas: a dotted grid.
    var cv = KIT.card(comp, 'Canvas', 1300, 640, 1100, 640, C.white);
    KIT.pop(cv, T + 0.1);
    var grid = KIT.shapeLayer(comp, 'Grid');
    var gg = KIT.group(grid, 'Dots');
    for (var gx = 0; gx < 12; gx++) for (var gy = 0; gy < 6; gy++) KIT.ellipseIn(gg, 6, 6, 520 + gx * 105, 380 + gy * 105);
    KIT.fill(gg, C.line);
    KIT.at(grid, 0, 0);
    KIT.fade(grid, T + 0.3, T + 0.6, 0, 100);
    // Widgets drag in from the palette and snap.
    var w = [[0, 'Leads 1,284', 640, 430, 300, 140], [0, 'Visits by week', 1110, 430, 560, 140], [1, 'Funnel', 640, 720, 300, 320], [2, 'Sources', 1110, 720, 560, 320], [3, 'Owner ▾', 1560, 430, 220, 140]];
    var step = Math.max(0.5, (dur - 1.6) / w.length);
    for (i = 0; i < w.length; i++) {
      var t0 = T + 0.8 + i * step;
      var src = [150, 400 + [0, 0, 1, 2, 3][i] * 110];
      var box = KIT.shapeLayer(comp, 'Widget ' + w[i][1]);
      var bg = KIT.group(box, 'Box');
      KIT.rectIn(bg, w[i][4], w[i][5], 12);
      KIT.fill(bg, C.ice);
      KIT.stroke(bg, C.signal, 3);
      KIT.at(box, src[0], src[1]);
      KIT.keys(box.property('ADBE Transform Group').property('ADBE Position'), [[t0, src], [t0 + 0.45, [w[i][2], w[i][3]]]], 80);
      KIT.keys(box.property('ADBE Transform Group').property('ADBE Scale'), [[t0, [20, 20, 100]], [t0 + 0.45, [104, 104, 100]], [t0 + 0.55, [100, 100, 100]]], 70);
      KIT.fade(box, t0, t0 + 0.1, 0, 100);
      var lb = KIT.text(comp, w[i][1], { size: 26, font: F.bold, color: C.navy, x: w[i][2], y: w[i][3] });
      KIT.fade(lb, t0 + 0.45, t0 + 0.6, 0, 100);
      KIT.cursor(comp, src, [w[i][2] + 20, w[i][3] + 20], t0 + 0.45, C.signal, true);
    }
    KIT.to3D(comp);
    KIT.setZ(palB, -100);
    orbitCam(comp, T, dur, [-10, 10], [4, 4], 80);
  };

  // ---- every kind of dashboard -------------------------------------------------------------------------
  SCENES.dashboardTypes = function (comp, p, T, dur) {
    enter(comp, p, C.white, T);
    header(comp, p.kicker || 'EVERY KIND OF DASHBOARD', p.title || 'Pipeline, adoption, performance, traffic, trends', T);
    var types = p.types || ['Pipeline', 'Adoption', 'Performance', 'Web traffic', 'Snapshots'];
    var each = Math.max(0.4, (dur - 1.2) / types.length);
    var cards = [];
    for (var i = 0; i < types.length; i++) {
      var x = 960 + (i - (types.length - 1) / 2) * 345;
      var y = 640;
      var l = [KIT.card(comp, 'Type ' + types[i], 310, 420, x, y)];
      l.push(KIT.text(comp, types[i], { size: 30, font: F.black, color: C.navy, x: x, y: y - 160 }));
      var kind = i % 5;
      if (kind === 0) {
        var fw = [240, 180, 120, 70];
        for (var f = 0; f < 4; f++) l.push(KIT.rect(comp, types[i] + ' stage ' + f, fw[f], 46, 10, [C.frost, C.signalBright, C.signal, C.navy][f], x, y - 70 + f * 58));
      } else if (kind === 1) {
        var ring = KIT.shapeLayer(comp, 'Adoption ring');
        var rg = KIT.group(ring, 'Track');
        KIT.ellipseIn(rg, 190, 190);
        KIT.stroke(rg, C.ice, 26);
        var rg2 = KIT.group(ring, 'Value');
        KIT.ellipseIn(rg2, 190, 190);
        KIT.stroke(rg2, C.good, 26);
        KIT.keys(KIT.trim(rg2).property('ADBE Vector Trim End'), [[T + 0.6 + i * each, 0], [T + 1.4 + i * each, 76]], 70);
        KIT.at(ring, x, y + 10);
        l.push(ring);
        l.push(KIT.text(comp, '76%', { size: 44, font: F.black, color: C.good, x: x, y: y + 10 }));
      } else if (kind === 2) {
        var ln = KIT.shapeLayer(comp, 'Performance line');
        var lg = KIT.group(ln, 'Line');
        KIT.pathIn(lg, [[x - 120, y + 80], [x - 60, y + 20], [x, y + 50], [x + 60, y - 40], [x + 120, y - 80]], false);
        KIT.stroke(lg, C.signal, 8);
        KIT.keys(KIT.trim(lg).property('ADBE Vector Trim End'), [[T + 0.6 + i * each, 0], [T + 1.3 + i * each, 100]], 60);
        KIT.at(ln, 0, 0);
        l.push(ln);
      } else if (kind === 3) {
        var hs = [40, 70, 55, 100, 85, 130, 120];
        for (var b = 0; b < hs.length; b++) l.push(KIT.rect(comp, 'Traffic ' + b, 26, hs[b], 6, b === 5 ? C.signal : C.signalBright, x - 105 + b * 35, y + 110 - hs[b] / 2));
      } else {
        for (var sn = 0; sn < 4; sn++) {
          var sx = x - 90 + sn * 60;
          l.push(KIT.rect(comp, 'Snap ' + sn, 44, 70 + sn * 30, 8, [C.frost, C.signalBright, C.signal, C.navy][sn], sx, y + 110 - (70 + sn * 30) / 2));
          l.push(KIT.text(comp, 'W' + (sn + 1), { size: 18, font: F.bold, color: C.muted, x: sx, y: y + 135 }));
        }
      }
      var cb = KIT.bundle(comp, 'Type ' + types[i] + ' group', l, x, y);
      cards.push([cb, T + 0.2 + i * each]);
    }
    KIT.to3D(comp);
    for (i = 0; i < cards.length; i++) {
      KIT.flyIn(cards[i][0], cards[i][1], 900, 0, 0.6);
      KIT.keys(cards[i][0].property('ADBE Transform Group').property('ADBE Rotate Y'), [[cards[i][1], 60], [cards[i][1] + 0.6, (i - 2) * -6]], 80);
    }
    KIT.camera(comp, [[Math.max(0, T - 0.5), KIT.orbitPos(CX, CY, 0, 12, KIT.ZOOM + 200), [CX, CY + 60, 0]], [T + dur, KIT.orbitPos(CX, CY, 0, 4, KIT.ZOOM - 100), [CX, CY + 60, 0]]], 60);
  };

  // ---- who sees what: owner, manager, leader -----------------------------------------------------------
  SCENES.securityRoles = function (comp, p, T, dur) {
    enter(comp, p, C.paper, T);
    header(comp, p.kicker || 'SECURITY', p.title || 'Who sees what', T);
    // The role hierarchy.
    var people = [['VP', 'Leader', 960, 330, C.navy], ['MK', 'Manager', 620, 520, C.signal], ['JS', 'Manager', 1300, 520, C.signal], ['AR', 'Owner', 470, 710, C.signalBright], ['BK', 'Owner', 770, 710, C.signalBright], ['LT', 'Owner', 1150, 710, C.signalBright], ['SO', 'Owner', 1450, 710, C.signalBright]];
    var links = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    var i;
    for (i = 0; i < links.length; i++) {
      var a = people[links[i][0]];
      var b = people[links[i][1]];
      KIT.wire(comp, 'Reports to ' + i, [a[2], a[3] + 45], [b[2], b[3] - 45], C.line, 5, T + 0.4 + i * 0.05, T + 0.8 + i * 0.05, false);
    }
    var av = [];
    for (i = 0; i < people.length; i++) {
      var A = KIT.avatar(comp, people[i][0], people[i][2], people[i][3], 88, people[i][4]);
      KIT.pop(A, T + 0.2 + i * 0.06);
      KIT.pop(KIT.text(comp, people[i][1], { size: 22, font: F.bold, color: C.muted, x: people[i][2], y: people[i][3] + 66 }), T + 0.3 + i * 0.06);
      av.push(A);
    }
    // What each level sees, lit in turn.
    var tiers = [['Owner', 'their own leads', '12 rows', 3, C.signalBright], ['Manager', 'their team', '48 rows', 1, C.signal], ['Leader', 'everything', '1,284 rows', 0, C.navy]];
    var each = Math.max(0.8, (dur - 2.2) / 3);
    for (i = 0; i < tiers.length; i++) {
      var t = T + 1.4 + i * each;
      var who = people[tiers[i][3]];
      var ring = KIT.shapeLayer(comp, 'Sees ' + tiers[i][0]);
      var rg = KIT.group(ring, 'Ring');
      KIT.ellipseIn(rg, 120, 120);
      KIT.stroke(rg, C.warn, 7);
      KIT.at(ring, who[2], who[3]);
      KIT.pop(ring, t);
      var chip = KIT.chip(comp, tiers[i][0] + ': ' + tiers[i][1] + ' · ' + tiers[i][2], 'lock', 960, 880 + 0, t + 0.1, { bg: tiers[i][4] });
      if (i < tiers.length - 1) {
        for (var c = 0; c < chip.length; c++) KIT.keys(chip[c].property('ADBE Transform Group').property('ADBE Opacity'), [[t + each - 0.15, 100], [t + each, 0]], 40);
        KIT.keys(ring.property('ADBE Transform Group').property('ADBE Opacity'), [[t + each - 0.15, 100], [t + each, 0]], 40);
      }
    }
    var code = KIT.text(comp, "'OwnerId' == \"$User.Id\" || 'Owner.ManagerId' == \"$User.Id\"", { size: 24, font: F.monoBold, color: C.navy, y: 985 });
    KIT.fade(code, T + 1.0, T + 1.3, 0, 80);
    KIT.to3D(comp);
    orbitCam(comp, T, dur, [-10, 10], [6, 3], 80);
  };

  // ---- GTM engineering -----------------------------------------------------------------------------------
  SCENES.gtmEngine = function (comp, p, T, dur) {
    enter(comp, p, C.navyDeep, T);
    var k = KIT.eyebrow(comp, p.kicker || 'GTM ENGINEERING', 960, 120, C.frost);
    KIT.pop(k, T + 0.05);
    var tt = KIT.text(comp, p.title || 'Turn traffic into pipeline', { size: 60, font: F.black, color: C.white, y: 192 });
    KIT.fade(tt, T + 0.15, T + 0.45, 0, 100);
    var stages = p.stages || [['Visits', '12,400'], ['Sign-ups', '318'], ['Activated', '204'], ['Team trials', '31'], ['Customers', '9']];
    var each = Math.max(0.35, (dur - 2.4) / stages.length);
    var i;
    for (i = 0; i < stages.length; i++) {
      var x = 960 + (i - (stages.length - 1) / 2) * 340;
      var h = 300 - i * 45;
      var t = T + 0.3 + i * each;
      var col = KIT.rect(comp, 'Stage ' + stages[i][0], 250, h, 18, [C.frost, C.signalBright, C.signal, C.navy, C.good][i], x, 560);
      KIT.pop(col, t);
      KIT.pop(KIT.text(comp, stages[i][1], { size: 46, font: F.black, color: i < 2 ? C.navyDeep : C.white, x: x, y: 545 }), t + 0.05);
      KIT.pop(KIT.text(comp, stages[i][0], { size: 26, font: F.bold, color: C.frost, x: x, y: 760 }), t + 0.1);
      if (i > 0) {
        var pct = Math.round(Number(String(stages[i][1]).replace(/,/g, '')) / Number(String(stages[i - 1][1]).replace(/,/g, '')) * 100);
        var pc = KIT.text(comp, pct + '%', { size: 24, font: F.bold, color: C.sun, x: x - 170, y: 445 });
        KIT.pop(pc, t + 0.15);
      }
    }
    var auto = p.automations || [['Enrich', 'spark'], ['Score', 'badge'], ['Route', 'share'], ['Alert', 'chat']];
    var tA = T + 0.5 + stages.length * each * 0.7;
    for (i = 0; i < auto.length; i++) {
      KIT.chip(comp, auto[i][0], auto[i][1], 960 + (i - 1.5) * 260, 900, tA + i * 0.15, { bg: C.signal });
    }
    KIT.to3D(comp);
    orbitCam(comp, T, dur, [12, 10], [-4, 3], 100);
  };

  // ---- teams: a company buys seats and its people upskill ----------------------------------------------
  SCENES.teamSeats = function (comp, p, T, dur) {
    enter(comp, p, C.ice, T);
    header(comp, p.kicker || 'FOR TEAMS', p.title || 'Upskill your whole team', T);
    var org = [KIT.card(comp, 'Company', 520, 260, 400, 440)];
    org.push(KIT.icon(comp, 'brief', 210, 380, 80, C.white, C.navy));
    org.push(KIT.text(comp, p.company || 'Acme Retail', { size: 36, font: F.black, color: C.navy, x: 270, y: 370, align: 'left' }));
    org.push(KIT.text(comp, (p.seats || 25) + ' seats', { size: 28, font: F.bold, color: C.signal, x: 270, y: 410, align: 'left' }));
    org.push(KIT.text(comp, 'One invoice · join code · admin view', { size: 22, font: F.medium, color: C.muted, x: 400, y: 500 }));
    var orgB = KIT.bundle(comp, 'Company group', org, 400, 440);
    KIT.pop(orgB, T + 0.2);
    // Seats fill up.
    var cols = [C.signal, C.good, C.warn, C.signalBright, C.navy];
    var initials = ['PS', 'RK', 'AM', 'JT', 'LN', 'DV', 'SO', 'KH', 'MP', 'TR'];
    for (var i = 0; i < 10; i++) {
      var a = KIT.avatar(comp, initials[i], 190 + (i % 5) * 105, 690 + Math.floor(i / 5) * 105, 84, cols[i % 5]);
      KIT.pop(a, T + 0.7 + i * 0.08);
    }
    // The manager's view: everyone's progress.
    var mv = [KIT.card(comp, 'Team progress', 760, 600, 1310, 640)];
    mv.push(KIT.text(comp, 'Team progress', { size: 32, font: F.black, color: C.navy, x: 970, y: 390, align: 'left' }));
    var members = [['Priya', 92], ['Rahul', 74], ['Ana', 61], ['James', 48], ['Lena', 83]];
    var bars = [];
    for (i = 0; i < members.length; i++) {
      var y = 470 + i * 80;
      mv.push(KIT.text(comp, members[i][0], { size: 24, font: F.semi, color: C.navy, x: 970, y: y, align: 'left' }));
      mv.push(KIT.rect(comp, 'Track ' + i, 440, 22, 11, C.ice, 1340, y));
      var w = 440 * members[i][1] / 100;
      var br = KIT.rect(comp, 'Progress ' + members[i][0], w, 22, 11, members[i][1] > 80 ? C.good : C.signal, 1120 + w / 2, y);
      br.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([-w / 2, 0]);
      KIT.at(br, 1120, y);
      bars.push(br);
      mv.push(br);
      mv.push(KIT.text(comp, members[i][1] + '%', { size: 22, font: F.bold, color: C.muted, x: 1600, y: y, align: 'left' }));
    }
    var mvB = KIT.bundle(comp, 'Manager view', mv, 1310, 640);
    KIT.pop(mvB, T + 1.2);
    for (i = 0; i < bars.length; i++) KIT.keys(bars[i].property('ADBE Transform Group').property('ADBE Scale'), [[T + 1.6 + i * 0.12, [0, 100, 100]], [T + 2.6 + i * 0.12, [100, 100, 100]]], 80);
    KIT.chip(comp, 'Teams and colleges', 'check', 1310, 990, T + 2.4, { bg: C.navy });
    KIT.to3D(comp);
    KIT.setZ(mvB, -100);
    orbitCam(comp, T, dur, [-12, 6], [5, 2], 80);
  };
}());
