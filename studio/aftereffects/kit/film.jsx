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

KIT.onlyKitItems = function () {
  for (var i = 1; i <= app.project.numItems; i++) {
    var it = app.project.item(i);
    var top = it;
    while (top.parentFolder && top.parentFolder !== app.project.rootFolder) top = top.parentFolder;
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
  if (app.project.dirty && app.project.file && app.project.file.fsName === target.fsName) {
    // The film being rebuilt has unsaved changes (maybe yours): keep them as a copy.
    var d = new Date();
    var stamp = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2);
    var keep = new File(tl.workspace + '/06-graphics/' + tl.slug + '-edited-' + stamp + '.aep');
    app.project.save(keep);
    log.push('kept your unsaved changes as ' + keep.fsName);
  } else if (app.project.numItems > 0 && (app.project.file === null || app.project.dirty) && !KIT.onlyKitItems()) {
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
  for (i = 0; i < tl.scenes.length; i++) {
    var s = tl.scenes[i];
    var props = s.props || {};
    // 3D transitions happen in MASTER; the scene then draws its own full background.
    props._transition = KIT.MASTER_T[s.transition] ? 'none' : (s.transition || 'reveal');
    props._credit = tl.credit;
    props._beat = tl.beat || 0.585;
    // The scene's own voice, for lip sync: starts voStart after the scene does, 15 values a second.
    props._vo = { at: s.voStart, env: s.voEnv || [], fps: 15 };
    var sc = KIT.buildScene(s.type, props, s.duration, fScenes, (i < 9 ? '0' : '') + (i + 1) + ' ' + s.id);
    var L = master.layers.add(sc);
    L.startTime = s.start - KIT.OVERLAP;
    L.name = sc.name;
    layers.push(L);
    log.push('scene ' + sc.name + ' @ ' + s.start.toFixed(2));
  }
  KIT.masterTransitions(master, layers, tl.scenes);
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
