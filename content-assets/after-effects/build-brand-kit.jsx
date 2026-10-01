/* eslint-disable -- ExtendScript (ES3) for After Effects, not linted as modern JS. */
// CRM Analytics Academy — Blueprint brand kit for After Effects.
//
// File → Scripts → Run Script File… → build-brand-kit.jsx
//
// Builds these compositions natively (shape and text layers, nothing
// flattened), in a "CRM Analytics Academy — Brand Kit" folder:
//
//   BG — Graph Paper      grid + major grid + rulers (spacing = Repeater offset)
//   Crop-Mark Frame       transparent "+" marks around the safe area
//   Title Card            lesson opener: code, title, lead, logo
//   Chapter Card          big section number and title on navy
//   Lower Third           name + role, animated in and out (easy ease)
//   Subscribe · Next      transparent overlay, top right
//   End Card              closing CTA to the site
//
// Colours, fonts, durations and every placeholder string come from
// brand-kit.config.json beside this script: edit it and run again. Running it
// again replaces the comps of the same name (your other comps are untouched).
// Fonts: install Schibsted Grotesk and IBM Plex Mono (Google Fonts); if they
// are missing After Effects substitutes and the layers stay editable.

//@include "lib.jsxinc"

(function () {
  var cfgText = BP.readText(new File(BP.here().fsName + '/brand-kit.config.json'));
  if (!cfgText) {
    alert('brand-kit.config.json was not found next to this script.');
    return;
  }
  var cfg = BP.parseJSON(cfgText);
  var C = cfg.colors;
  var T = cfg.text;
  var D = cfg.durations;
  var W = cfg.comp.width;
  var H = cfg.comp.height;
  var FPS = cfg.comp.fps;
  var F = {
    display: BP.pickFont(cfg.fonts.display),
    body: BP.pickFont(cfg.fonts.body),
    mono: BP.pickFont(cfg.fonts.mono)
  };

  app.beginUndoGroup('Build CRM Analytics Academy brand kit');
  var root = BP.folder('CRM Analytics Academy — Brand Kit');
  var parts = BP.folder('Parts', root);

  /* ---------------------------------------------------- graph paper */

  function graphPaper(name, dark, dur, folder) {
    var comp = BP.replaceComp(name, W, H, dur, FPS, folder);
    var bg = comp.layers.addSolid(BP.rgb(dark ? C.navy : C.paper), 'Background', W, H, 1, dur);
    bg.locked = true;
    var grid = BP.shapeLayer(comp, 'Grid');
    var minor = cfg.grid.minor;
    var major = cfg.grid.major;
    var gridHex = dark ? C.frost : C.signal;
    BP.repeatedLine(grid, 'Minor verticals', [0, 0], [0, H], Math.ceil(W / minor) + 1, [minor, 0], gridHex, 1, dark ? 7 : 6);
    BP.repeatedLine(grid, 'Minor horizontals', [0, 0], [W, 0], Math.ceil(H / minor) + 1, [0, minor], gridHex, 1, dark ? 7 : 6);
    BP.repeatedLine(grid, 'Major verticals', [0, 0], [0, H], Math.ceil(W / major) + 1, [major, 0], gridHex, 1.25, dark ? 14 : 12);
    BP.repeatedLine(grid, 'Major horizontals', [0, 0], [W, 0], Math.ceil(H / major) + 1, [0, major], gridHex, 1.25, dark ? 14 : 12);

    var rulers = BP.shapeLayer(comp, 'Rulers');
    var ink = dark ? '#FFFFFF' : C.ink;
    BP.repeatedLine(rulers, 'Top ruler — short', [0, 0], [0, 7], Math.ceil(W / 8) + 1, [8, 0], ink, 1, 55);
    BP.repeatedLine(rulers, 'Top ruler — tall', [0, 0], [0, 14], Math.ceil(W / 40) + 1, [40, 0], ink, 1, 70);
    BP.repeatedLine(rulers, 'Left ruler — short', [0, 0], [7, 0], Math.ceil(H / 8) + 1, [0, 8], ink, 1, 55);
    BP.repeatedLine(rulers, 'Left ruler — tall', [0, 0], [14, 0], Math.ceil(H / 40) + 1, [0, 40], ink, 1, 70);
    return comp;
  }

  var bgNavy = graphPaper('BG — Graph Paper (navy)', true, D.background, root);
  var bgPaper = graphPaper('BG — Graph Paper (paper)', false, D.background, root);

  /* -------------------------------------------------- crop-mark frame */

  var crop = BP.replaceComp('Crop-Mark Frame', W, H, D.cropFrame, FPS, root);
  var marks = BP.shapeLayer(crop, 'Crop marks');
  BP.cropMarks(marks, 'Safe area', 96, 96, W - 192, H - 192, C.frost, 14);
  var cropInk = BP.shapeLayer(crop, 'Crop marks (ink)');
  BP.cropMarks(cropInk, 'Safe area', 96, 96, W - 192, H - 192, C.ink, 14);
  cropInk.enabled = false;
  crop.comment = 'Transparent. Two versions: frost (for navy) is on, ink (for paper) is off — toggle the eye.';

  /* ------------------------------------------------------ title card */

  var title = BP.replaceComp('Title Card', W, H, D.titleCard, FPS, root);
  title.layers.add(bgNavy).name = 'Background (precomp)';
  title.layers.add(crop).name = 'Crop marks (precomp)';
  var tLogo = BP.shapeLayer(title, 'Logo');
  BP.logo(tLogo, 96, 40, 36, '#FFFFFF', [C.frost, C.tide, C.signal]);
  BP.text(title, 'Header', 'CRM ANALYTICS ACADEMY  ·  ' + T.sectionName, 148, 66, { font: F.mono, size: 17, color: C.frost, tracking: 150 });
  var tCode = BP.text(title, 'Lesson code', T.lessonCode, 164, 300, { font: F.mono, size: 24, color: C.glow, tracking: 200 });
  var tTitle = BP.text(title, 'Lesson title', T.lessonTitle, 160, 440, { font: F.display, size: 104, color: '#FFFFFF', tracking: -30 });
  var tLead = BP.text(title, 'Lead', T.lessonLead, 164, 540, { font: F.body, size: 36, color: C.ice });
  BP.animateIn(tCode, 0.2, 0, 20, D.animIn);
  BP.animateIn(tTitle, 0.35, 0, 40, D.animIn);
  BP.animateIn(tLead, 0.6, 0, 30, D.animIn);

  /* ---------------------------------------------------- chapter card */

  var chapter = BP.replaceComp('Chapter Card', W, H, D.chapterCard, FPS, root);
  chapter.layers.add(bgNavy).name = 'Background (precomp)';
  var chBar = BP.shapeLayer(chapter, 'Signal bar');
  BP.rect(chBar, 'Bar', 160, 330, 16, 300, C.glow);
  var chNum = BP.text(chapter, 'Section number', T.chapterNumber, 210, 560, { font: F.display, size: 300, color: C.signal, tracking: -40 });
  var chTitle = BP.text(chapter, 'Section title', T.chapterTitle, 220, 700, { font: F.display, size: 96, color: '#FFFFFF', tracking: -20 });
  BP.text(chapter, 'Label', 'SECTION', 222, 330, { font: F.mono, size: 22, color: C.glow, tracking: 300 });
  BP.animateIn(chNum, 0.1, -60, 0, D.animIn);
  BP.animateIn(chTitle, 0.35, -40, 0, D.animIn);

  /* ----------------------------------------------------- lower third */

  var lt = BP.replaceComp('Lower Third', W, H, D.lowerThird, FPS, root);
  lt.comment = 'Transparent. Animates in at 0s and out ' + D.animOut + 's before the end — drag the out keys to retime.';
  var ltBox = BP.shapeLayer(lt, 'Plate');
  BP.rect(ltBox, 'Shadow', 128, 858, 760, 124, C.ink);
  BP.rect(ltBox, 'Card', 120, 850, 760, 124, C.card, C.ink, 2);
  BP.rect(ltBox, 'Signal bar', 120, 850, 12, 124, C.signal);
  var ltName = BP.text(lt, 'Name', T.speakerName, 164, 908, { font: F.display, size: 44, color: C.ink, tracking: -10 });
  var ltRole = BP.text(lt, 'Role', T.speakerRole, 166, 948, { font: F.mono, size: 18, color: C.ink2, tracking: 150 });
  var outAt = D.lowerThird - D.animOut - 0.1;
  BP.animateIn(ltBox, 0, -80, 0, D.animIn, outAt, D.animOut);
  BP.animateIn(ltName, 0.12, -60, 0, D.animIn, outAt - 0.05, D.animOut);
  BP.animateIn(ltRole, 0.2, -60, 0, D.animIn, outAt - 0.1, D.animOut);

  /* ------------------------------------------ subscribe · next lesson */

  var ov = BP.replaceComp('Subscribe · Next Lesson', W, H, D.overlay, FPS, root);
  ov.comment = 'Transparent overlay for the last seconds of a lesson video.';
  var ovPlate = BP.shapeLayer(ov, 'Next lesson plate');
  BP.rect(ovPlate, 'Shadow', W - 640 + 8, 108, 520, 170, C.ink);
  BP.rect(ovPlate, 'Card', W - 640, 100, 520, 170, C.card, C.ink, 2);
  var ovLabel = BP.text(ov, 'Next label', T.nextLabel, W - 610, 150, { font: F.mono, size: 18, color: C.signal, tracking: 200 });
  var ovTitle = BP.text(ov, 'Next title', T.nextTitle, W - 610, 214, { font: F.display, size: 36, color: C.ink, tracking: -10 });
  var subBtn = BP.shapeLayer(ov, 'Subscribe button');
  BP.rect(subBtn, 'Shadow', W - 640 + 6, 300 + 6, 260, 64, C.ink);
  BP.rect(subBtn, 'Button', W - 640, 300, 260, 64, C.signal, C.ink, 2);
  var subText = BP.text(ov, 'Subscribe text', T.subscribe, W - 610, 342, { font: F.mono, size: 22, color: '#FFFFFF', tracking: 200 });
  var ovOut = D.overlay - D.animOut - 0.1;
  BP.animateIn(ovPlate, 0, 60, 0, D.animIn, ovOut, D.animOut);
  BP.animateIn(ovLabel, 0.1, 60, 0, D.animIn, ovOut, D.animOut);
  BP.animateIn(ovTitle, 0.15, 60, 0, D.animIn, ovOut, D.animOut);
  BP.animateIn(subBtn, 0.35, 0, 30, D.animIn, ovOut, D.animOut);
  BP.animateIn(subText, 0.4, 0, 30, D.animIn, ovOut, D.animOut);

  /* -------------------------------------------------------- end card */

  var end = BP.replaceComp('End Card', W, H, D.endCard, FPS, root);
  end.layers.add(bgNavy).name = 'Background (precomp)';
  end.layers.add(crop).name = 'Crop marks (precomp)';
  var endHead = BP.text(end, 'Headline', T.endHeadline, 160, 420, { font: F.display, size: 140, color: '#FFFFFF', tracking: -40 });
  var endBtn = BP.shapeLayer(end, 'Site button');
  BP.rect(endBtn, 'Glow shadow', 172, 572, 820, 110, C.glow);
  BP.rect(endBtn, 'Button', 160, 560, 820, 110, C.signal, '#FFFFFF', 2);
  var endUrl = BP.text(end, 'Site', T.site, 200, 632, { font: F.display, size: 46, color: '#FFFFFF', tracking: -10 });
  var endLogo = BP.shapeLayer(end, 'Logo');
  BP.logo(endLogo, W - 96 - 120, H - 96 - 120, 120, '#FFFFFF', [C.frost, C.tide, C.signal]);
  BP.animateIn(endHead, 0.2, 0, 40, D.animIn);
  BP.animateIn(endBtn, 0.5, 0, 30, D.animIn);
  BP.animateIn(endUrl, 0.55, 0, 30, D.animIn);

  // Parts folder keeps the precomps findable; paper variant for light videos.
  bgPaper.parentFolder = parts;

  app.endUndoGroup();
  alert('Brand kit built: 8 compositions in "CRM Analytics Academy — Brand Kit".\n\nFonts used: ' + F.display + ', ' + F.body + ', ' + F.mono + '.');
})();
