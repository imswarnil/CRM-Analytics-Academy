// CRM Analytics Academy — builds a whole film, or one comp, from a job file.
//
// film:  every scene as its own precomp (Scenes folder), a MASTER comp that
//        overlaps them by half a second so each scene's colour reveal wipes
//        over the last, the voice-over, the music with ducking keyframes, the
//        sound effects. Saved as workspace/06-graphics/<slug>.aep.
// comp:  one scene type into the OPEN project (what `node studio/comp.mjs` asks for).

KIT.OVERLAP = 0.5;

KIT.importAudio = function (path, folder) {
  var f = new File(path);
  if (!f.exists) throw new Error('Missing audio ' + path);
  var it = app.project.importFile(new ImportOptions(f));
  if (folder) it.parentFolder = folder;
  return it;
};

// Transitions between scenes that move the scenes themselves in 3D (in MASTER).
KIT.MASTER_T = { flip3d: true, zoom3d: true, swing3d: true };
KIT.masterTransitions = function (master, layers, scenes) {
  var any = false;
  var i;
  for (i = 1; i < scenes.length; i++) if (KIT.MASTER_T[scenes[i].transition]) any = true;
  if (!any) return;
  for (i = 0; i < layers.length; i++) layers[i].threeDLayer = true;
  KIT.camera(master);
  var cx = master.width / 2;
  var cy = master.height / 2;
  for (i = 1; i < scenes.length; i++) {
    var kind = scenes[i].transition;
    if (!KIT.MASTER_T[kind]) continue;
    var A = layers[i - 1].property('ADBE Transform Group');
    var B = layers[i].property('ADBE Transform Group');
    var t1 = scenes[i].start;
    var t0 = t1 - KIT.OVERLAP;
    var mid = t0 + KIT.OVERLAP / 2;
    if (kind === 'zoom3d') {
      // The old scene flies past the camera; the new one rushes up from depth.
      KIT.keys(A.property('ADBE Position'), [[t0, [cx, cy, 0]], [t1, [cx, cy, -1500]]], 70);
      KIT.keys(A.property('ADBE Opacity'), [[t0 + 0.1, 100], [t1, 0]], 40);
      KIT.keys(B.property('ADBE Position'), [[t0, [cx, cy, 2600]], [t1, [cx, cy, 0]]], 85);
      KIT.keys(B.property('ADBE Opacity'), [[t0, 0], [t0 + 0.2, 100]], 40);
    } else if (kind === 'flip3d') {
      // A card flip: the old scene turns away, the new one turns in.
      KIT.keys(A.property('ADBE Rotate Y'), [[t0, 0], [mid, 90]], 80);
      A.property('ADBE Opacity').setValueAtTime(mid, 100);
      A.property('ADBE Opacity').setValueAtTime(mid + 0.01, 0);
      KIT.keys(B.property('ADBE Rotate Y'), [[mid, -90], [t1, 0]], 80);
      B.property('ADBE Opacity').setValueAtTime(mid - 0.01, 0);
      B.property('ADBE Opacity').setValueAtTime(mid, 100);
    } else if (kind === 'swing3d') {
      // A door: the new scene swings in from its left edge over the old one.
      B.property('ADBE Anchor Point').setValue([0, cy, 0]);
      B.property('ADBE Position').setValue([0, cy, 0]);
      // Swings toward the camera, so it passes in front of the old scene.
      KIT.keys(B.property('ADBE Rotate Y'), [[t0, 80], [t1, 0]], 60);
      KIT.keys(A.property('ADBE Opacity'), [[t0 + 0.2, 100], [t1, 40]], 40);
    }
  }
};

// ---- the canvas layout (spec "layout": "canvas") -------------------------------------------------
// The film is one big flat canvas. Every scene is a card at its own place
// (scene `at`: [column, row] in cells of `canvas.cell` px), parented to a VIEW
// null; moving the view (2D position + scale, never 3D) travels from card to
// card. Between two scenes a connector line draws from one card's edge to the
// next card's (scene `link`: {from, to, bend}), the view follows it, zooming out
// a little so both cards and the line share the frame, and lands just before
// the downbeat. A scene's `overview: true` pulls back to the whole canvas on
// the way in. Cards hold their first frame before they play and their last
// frame after, so earlier scenes stay on the canvas as you pass them.
KIT.canvasMaster = function (master, tl, comps) {
  var C = KIT.C;
  var cv = tl.canvas || {};
  var cell = cv.cell || [2500, 1500];
  var beat = tl.beat || 0.585;
  var fps = tl.fps || 30;
  var W = 1920;
  var H = 1080;
  var n = tl.scenes.length;
  var ws = [];
  var i;
  var auto = [0, 0];
  for (i = 0; i < n; i++) {
    var at = tl.scenes[i].at || auto;
    ws.push([at[0] * cell[0], at[1] * cell[1]]);
    auto = [at[0] + 1, at[1]];
  }
  var bx0 = 1e9;
  var by0 = 1e9;
  var bx1 = -1e9;
  var by1 = -1e9;
  for (i = 0; i < n; i++) {
    bx0 = Math.min(bx0, ws[i][0] - W / 2);
    bx1 = Math.max(bx1, ws[i][0] + W / 2);
    by0 = Math.min(by0, ws[i][1] - H / 2);
    by1 = Math.max(by1, ws[i][1] + H / 2);
  }
  var floor = KIT.rect(master, 'Canvas floor', W, H, 0, cv.floor ? KIT.hex(cv.floor) : C.navyDeep, W / 2, H / 2);
  var view = master.layers.addNull();
  view.name = 'VIEW (move this to travel the canvas)';
  view.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 0]);
  function hang(L, x, y) {
    L.parent = view;
    L.property('ADBE Transform Group').property('ADBE Position').setValue([x, y]);
    return L;
  }
  // The dot grid, drawn with two repeaters.
  var gap = cv.grid || 150;
  var cols = Math.ceil((bx1 - bx0 + 3000) / gap);
  var rows = Math.ceil((by1 - by0 + 2000) / gap);
  var g = KIT.shapeLayer(master, 'Canvas grid');
  var gg;
  gg = KIT.group(g, 'Dots');
  KIT.ellipseIn(gg, 9, 9);
  KIT.fill(gg, C.frost, 22);
  gg.property('ADBE Vectors Group').addProperty('ADBE Vector Filter - Repeater');
  gg.property('ADBE Vectors Group').addProperty('ADBE Vector Filter - Repeater');
  var rr1 = gg.property('ADBE Vectors Group').property(3);
  rr1.property('ADBE Vector Repeater Copies').setValue(cols);
  rr1.property('ADBE Vector Repeater Transform').property('ADBE Vector Repeater Position').setValue([gap, 0]);
  var rr2 = gg.property('ADBE Vectors Group').property(4);
  rr2.property('ADBE Vector Repeater Copies').setValue(rows);
  rr2.property('ADBE Vector Repeater Transform').property('ADBE Vector Repeater Position').setValue([0, gap]);
  g.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 0]);
  hang(g, Math.floor((bx0 - 1500) / gap) * gap, Math.floor((by0 - 1000) / gap) * gap);

  // Where a link leaves and enters a card.
  function edge(w, side) {
    if (side === 'left') return [[w[0] - W / 2, w[1]], [-1, 0]];
    if (side === 'right') return [[w[0] + W / 2, w[1]], [1, 0]];
    if (side === 'top') return [[w[0], w[1] - H / 2], [0, -1]];
    return [[w[0], w[1] + H / 2], [0, 1]];
  }
  function sides(a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    if (Math.abs(dx) / cell[0] >= Math.abs(dy) / cell[1]) return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
    return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'];
  }
  function ease(u) {
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }
  var moves = [];
  for (i = 1; i < n; i++) {
    var sc = tl.scenes[i];
    var M = (sc.move || cv.move || 1.5) * beat;
    var t1 = sc.start - 0.05;
    moves.push({ i: i, t0: t1 - M, t1: t1 });
  }
  // Connector lines (under the cards).
  var lineCol = cv.line ? KIT.hex(cv.line) : C.signalBright;
  for (var m = 0; m < moves.length; m++) {
    var b = moves[m].i;
    var a = b - 1;
    var lk = tl.scenes[b].link || {};
    var sd = sides(ws[a], ws[b]);
    var ea = edge(ws[a], lk.from || sd[0]);
    var eb = edge(ws[b], lk.to || sd[1]);
    var dist = Math.sqrt(Math.pow(eb[0][0] - ea[0][0], 2) + Math.pow(eb[0][1] - ea[0][1], 2));
    var bend = lk.bend || Math.max(220, dist * 0.45);
    var Lk = KIT.shapeLayer(master, 'Link ' + tl.scenes[a].id + ' > ' + tl.scenes[b].id);
    var lg = KIT.group(Lk, 'Line');
    KIT.pathIn(lg, [ea[0], eb[0]], false, [[0, 0], [eb[1][0] * bend, eb[1][1] * bend]], [[ea[1][0] * bend, ea[1][1] * bend], [0, 0]]);
    KIT.stroke(lg, lineCol, cv.lineWidth || 10);
    var tr = KIT.trim(lg);
    var d0 = moves[m].t0;
    var d1 = moves[m].t0 + (moves[m].t1 - moves[m].t0) * 0.8;
    KIT.keys(tr.property('ADBE Vector Trim End'), [[d0, 0], [d1, 100]], 70);
    Lk.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 0]);
    hang(Lk, 0, 0);
    var da = KIT.circle(master, 'Link start ' + b, 34, lineCol, 0, 0);
    hang(da, ea[0][0], ea[0][1]);
    KIT.pop(da, d0 - 0.1);
    var db = KIT.shapeLayer(master, 'Link end ' + b);
    var dg = KIT.group(db, 'Ring');
    KIT.ellipseIn(dg, 40, 40);
    KIT.stroke(dg, lineCol, 8);
    KIT.fill(dg, C.navyDeep);
    hang(db, eb[0][0], eb[0][1]);
    KIT.pop(db, d1 - 0.05);
  }
  // The cards: each scene holds its first frame until it plays, its last after.
  var dt = 1 / fps;
  for (i = 0; i < n; i++) {
    var s = tl.scenes[i];
    var Lc = master.layers.add(comps[i]);
    Lc.name = comps[i].name;
    Lc.startTime = 0;
    Lc.timeRemapEnabled = true;
    var rm = Lc.property('ADBE Time Remapping');
    var a0 = s.start - KIT.OVERLAP;
    var D = comps[i].duration - dt;
    var k0 = Math.max(0, a0);
    // Ours first, then the two default keys go (removing every key would hide the property).
    rm.setValueAtTime(k0, k0 - a0);
    rm.setValueAtTime(a0 + D, D);
    for (var z = rm.numKeys; z >= 1; z--) {
      var kt = rm.keyTime(z);
      if (Math.abs(kt - k0) > dt / 2 && Math.abs(kt - (a0 + D)) > dt / 2) rm.removeKey(z);
    }
    for (var q = 1; q <= rm.numKeys; q++) rm.setInterpolationTypeAtKey(q, KeyframeInterpolationType.LINEAR);
    Lc.outPoint = tl.total;
    Lc.inPoint = 0;
    hang(Lc, ws[i][0], ws[i][1]);
    var ol = KIT.shapeLayer(master, 'Card edge ' + s.id);
    var og = KIT.group(ol, 'Edge');
    KIT.rectIn(og, W + 6, H + 6, 0);
    KIT.stroke(og, C.frost, 6);
    hang(ol, ws[i][0], ws[i][1]);
    ol.property('ADBE Transform Group').property('ADBE Opacity').setValue(55);
  }
  view.moveToBeginning();
  floor.moveToEnd();
  // The view: keyed every frame through each move (exact, linear between frames).
  var vp = view.property('ADBE Transform Group').property('ADBE Position');
  vp.dimensionsSeparated = true;
  var VX = view.property('ADBE Transform Group').property('ADBE Position_0');
  var VY = view.property('ADBE Transform Group').property('ADBE Position_1');
  var VS = view.property('ADBE Transform Group').property('ADBE Scale');
  var CX = W / 2;
  var CY = H / 2;
  function put(t, w, sc2) {
    VX.setValueAtTime(t, CX - sc2 * w[0]);
    VY.setValueAtTime(t, CY - sc2 * w[1]);
    VS.setValueAtTime(t, [sc2 * 100, sc2 * 100]);
  }
  put(0, ws[0], 1);
  var mid = [(bx0 + bx1) / 2, (by0 + by1) / 2];
  var fit = Math.min(W / (bx1 - bx0 + 900), H / (by1 - by0 + 700));
  for (m = 0; m < moves.length; m++) {
    var wa = ws[moves[m].i - 1];
    var wb = ws[moves[m].i];
    var over = !!tl.scenes[moves[m].i].overview;
    var dd = Math.sqrt(Math.pow(wb[0] - wa[0], 2) + Math.pow(wb[1] - wa[1], 2));
    var smin = over ? fit : Math.max(0.36, Math.min(0.8, 1 / (1 + 0.55 * dd / W)));
    var N = Math.max(2, Math.round((moves[m].t1 - moves[m].t0) * fps));
    for (var f = 0; f <= N; f++) {
      var u = f / N;
      var w;
      var sv;
      if (over) {
        // Out to the whole canvas, hold there, then in: scale eased in log space.
        var ph = u < 0.38 ? ease(u / 0.38) : (u > 0.62 ? ease((u - 0.62) / 0.38) : 1);
        var A = u <= 0.62 ? wa : mid;
        var B = u <= 0.62 ? mid : wb;
        var sa = u <= 0.62 ? 1 : fit;
        var sb = u <= 0.62 ? fit : 1;
        w = [A[0] + (B[0] - A[0]) * ph, A[1] + (B[1] - A[1]) * ph];
        sv = Math.exp(Math.log(sa) + (Math.log(sb) - Math.log(sa)) * ph);
      } else {
        var e = ease(u);
        w = [wa[0] + (wb[0] - wa[0]) * e, wa[1] + (wb[1] - wa[1]) * e];
        sv = 1 - (1 - smin) * Math.sin(Math.PI * u);
      }
      put(moves[m].t0 + f / fps, w, sv);
    }
  }
  var props3 = [VX, VY, VS];
  for (var pi = 0; pi < props3.length; pi++) {
    for (var kk = 1; kk <= props3[pi].numKeys; kk++) props3[pi].setInterpolationTypeAtKey(kk, KeyframeInterpolationType.LINEAR);
  }
};

KIT.onlyKitItems = function () {
  for (var i = 1; i <= app.project.numItems; i++) {
    var it = app.project.item(i);
    var top = it;
    while (top.parentFolder && top.parentFolder !== app.project.rootFolder) top = top.parentFolder;
    // "Solids" is where After Effects files the kit's null layers.
    if (top instanceof FolderItem && top.name === 'Solids') continue;
    if (!(top instanceof FolderItem) || top.name.indexOf('CRMA') !== 0) return false;
  }
  return true;
};

KIT.buildScene = function (type, props, seconds, folder, name) {
  if (!SCENES[type]) throw new Error('Unknown scene type "' + type + '"');
  var comp = KIT.comp(name || type, seconds + KIT.OVERLAP, KIT.C.paper, folder);
  SCENES[type](comp, props || {}, KIT.OVERLAP, seconds);
  return comp;
};

KIT.buildFilm = function (job, log) {
  var tl = KIT.readJSON(job.timeline);
  // Never throw away someone's work: only replace an empty project, a saved
  // one, or one holding nothing but what this kit made (folders named "CRMA …").
  var target = new File(tl.workspace + '/06-graphics/' + tl.slug + '.aep');
  var kitOnly = app.project.numItems > 0 && KIT.onlyKitItems();
  if (app.project.dirty && app.project.file && (app.project.file.fsName === target.fsName || kitOnly)) {
    // The film being rebuilt has unsaved changes (maybe yours): keep them as a copy.
    var d = new Date();
    var stamp = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2);
    var keep = new File(app.project.file.fsName.replace(/\.aep$/i, '') + '-edited-' + stamp + '.aep');
    app.project.save(keep);
    log.push('kept your unsaved changes as ' + keep.fsName);
  } else if (app.project.numItems > 0 && (app.project.file === null || app.project.dirty) && !kitOnly) {
    throw new Error('The open After Effects project has unsaved work. Save or close it, then run again.');
  }
  if (app.project.numItems > 0) app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
  app.newProject();
  var root = KIT.folder('CRMA ' + tl.slug);
  var fScenes = KIT.folder('Scenes', root);
  var fAudio = KIT.folder('Audio', root);
  var fVo = KIT.folder('Voice-over', fAudio);
  var fSfx = KIT.folder('SFX', fAudio);

  KIT.screensDir = tl.screens;
  KIT.screensFolder = KIT.folder('Screens', root);
  KIT.footage = {};
  var master = KIT.comp('MASTER', tl.total, KIT.C.navyDeep, root);
  var i;
  var layers = [];
  var canvas = tl.layout === 'canvas';
  var comps = [];
  for (i = 0; i < tl.scenes.length; i++) {
    var s = tl.scenes[i];
    var props = s.props || {};
    // 3D transitions happen in MASTER; the scene then draws its own full background.
    // On a canvas every scene is a card whose background is always there.
    props._transition = canvas ? 'canvas' : (KIT.MASTER_T[s.transition] ? 'none' : (s.transition || 'reveal'));
    props._credit = tl.credit;
    props._film = tl.slug;
    props._beat = tl.beat || 0.585;
    // The scene's own voice, for lip sync: starts voStart after the scene does, 15 values a second.
    props._vo = { at: s.voStart, env: s.voEnv || [], fps: 15 };
    var sc = KIT.buildScene(s.type, props, s.duration, fScenes, (i < 9 ? '0' : '') + (i + 1) + ' ' + s.id);
    comps.push(sc);
    log.push('scene ' + sc.name + ' @ ' + s.start.toFixed(2));
    if (canvas) continue;
    var L = master.layers.add(sc);
    L.startTime = s.start - KIT.OVERLAP;
    L.name = sc.name;
    layers.push(L);
  }
  if (canvas) KIT.canvasMaster(master, tl, comps);
  else KIT.masterTransitions(master, layers, tl.scenes);
  // Audio: VO per scene, music with the same duck keyframes as the mix, SFX at their cues.
  for (i = 0; i < tl.scenes.length; i++) {
    if (!tl.scenes[i].voFile) continue;
    var v = master.layers.add(KIT.importAudio(tl.scenes[i].voFile, fVo));
    v.startTime = tl.scenes[i].start + tl.scenes[i].voStart;
    v.name = 'VO ' + tl.scenes[i].id;
    v.label = 9;
  }
  var mus = master.layers.add(KIT.importAudio(tl.music.file, fAudio));
  mus.name = tl.music.duck.length ? 'Music (ducked)' : 'Music';
  mus.label = 11;
  var lv = mus.property('ADBE Audio Group').property('ADBE Audio Levels');
  if (!tl.music.duck.length) lv.setValue([0, 0]);
  else lv.setValueAtTime(0, [tl.music.duck[0][1], tl.music.duck[0][1]]);
  for (i = 0; i < tl.music.duck.length; i++) {
    var d = tl.music.duck[i];
    if (d[0] > 0) lv.setValueAtTime(d[0], [d[1], d[1]]);
  }
  var cache = {};
  for (i = 0; i < tl.sfx.length; i++) {
    var c = tl.sfx[i];
    if (!cache[c.name]) cache[c.name] = KIT.importAudio(c.file, fSfx);
    var sl = master.layers.add(cache[c.name]);
    sl.startTime = c.at;
    sl.name = 'SFX ' + c.name;
    sl.label = 13;
    sl.property('ADBE Audio Group').property('ADBE Audio Levels').setValue([-8, -8]);
  }
  // The finished mix, muted: switch it on to hear exactly what the render uses.
  var mx = master.layers.add(KIT.importAudio(tl.mix, fAudio));
  mx.name = 'MIX (reference, muted)';
  mx.audioEnabled = false;
  mx.moveToEnd();

  master.openInViewer();
  var out = new File(tl.workspace + '/06-graphics/' + tl.slug + '.aep');
  app.project.save(out);
  log.push('saved ' + out.fsName);
};

// One scene comp into whatever project is open (creates a "CRMA Comps" folder).
KIT.buildComp = function (job, log) {
  var folder = KIT.folder('CRMA Comps');
  KIT.screensDir = KIT.root.fsName + '/workspace/04-clips/screens';
  KIT.screensFolder = folder;
  var comp = KIT.buildScene(job.type, job.props, job.seconds || 6, folder, job.name || job.type);
  comp.openInViewer();
  log.push('comp ' + comp.name + ' (' + comp.duration.toFixed(1) + ' s)');
  if (job.save && app.project.file) app.project.save();
};

// Motion Graphics templates for Premiere: text fields exposed in Essential Graphics.
KIT.exportMogrt = function (job, log) {
  var dir = new Folder(job.out);
  if (!dir.exists) dir.create();
  // Built in a scratch project, then whatever was open is reopened.
  if (app.project.numItems > 0 && (app.project.file === null || app.project.dirty) && !KIT.onlyKitItems()) {
    throw new Error('The open After Effects project has unsaved work. Save it, then run again.');
  }
  var previous = app.project.file;
  if (app.project.numItems > 0) app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
  app.newProject();
  // Exporting a template saves the project; save it here first so After
  // Effects never picks a folder of its own.
  app.project.save(new File(KIT.root.fsName + '/workspace/06-graphics/mogrt-build.aep'));
  var folder = KIT.folder('CRMA MOGRTs');
  for (var i = 0; i < job.items.length; i++) {
    var it = job.items[i];
    // Re-fetched each time: exporting a template invalidates earlier item references.
    folder = KIT.folder('CRMA MOGRTs');
    var comp = KIT.buildScene(it.type, it.props, it.seconds || 5, folder, 'CRMA ' + it.label);
    for (var l = 1; l <= comp.numLayers; l++) {
      var layer = comp.layer(l);
      if (layer instanceof TextLayer && !layer.property('ADBE Text Properties').property('ADBE Text Document').expressionEnabled) {
        try {
          layer.property('ADBE Text Properties').property('ADBE Text Document').addToMotionGraphicsTemplateAs(comp, layer.name);
        } catch (e) {
          layer.property('ADBE Text Properties').property('ADBE Text Document').addToMotionGraphicsTemplate(comp);
        }
      }
    }
    comp.motionGraphicsTemplateName = 'CRMA ' + it.label;
    // Takes the folder; the file is named after the template.
    comp.exportAsMotionGraphicsTemplate(true, dir.fsName);
    log.push('mogrt ' + dir.fsName + '/CRMA ' + it.label + '.mogrt');
  }
  app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
  if (previous && previous.exists) app.open(previous);
};
