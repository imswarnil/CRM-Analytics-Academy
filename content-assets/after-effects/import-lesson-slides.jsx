/* eslint-disable -- ExtendScript (ES3) for After Effects, not linted as modern JS. */
// CRM Analytics Academy — import a lesson slide deck into After Effects.
//
// 1. node scripts/lesson-slides.mjs /saql/grouping-and-windowing
// 2. After Effects: File → Scripts → Run Script File… → import-lesson-slides.jsx
// 3. Pick the deck's slides.json (content-assets/slides/<lesson>/slides.json)
//
// Builds a "Lesson — <title>" comp: every slide PNG on its own layer, timed
// from slides.json, with a crossfade between slides and a comp marker per
// slide carrying its speaker notes (Composition → marker → double-click).
// Each slide also gets a disabled guide text layer holding its title, so a
// title can be retyped natively: turn the layer on, hide the PNG's own title
// with a mask, or rebuild that slide from the SVG beside the PNG.
//
// Re-running replaces the comp of the same name. Slide durations: drag layer
// out-points, or edit slides.json and run again.

//@include "lib.jsxinc"

(function () {
  var jsonFile = File.openDialog('Choose a lesson deck’s slides.json', 'slides.json:*.json');
  if (!jsonFile) return;
  var deck = BP.parseJSON(BP.readText(jsonFile));
  var dir = jsonFile.parent;
  var fps = deck.fps || 30;
  var xfade = deck.crossfade === undefined ? 0.5 : deck.crossfade;
  var total = 0;
  for (var i = 0; i < deck.slides.length; i++) total += deck.slides[i].duration;

  var cfgText = BP.readText(new File(BP.here().fsName + '/brand-kit.config.json'));
  var cfg = cfgText ? BP.parseJSON(cfgText) : null;
  var monoFont = cfg ? BP.pickFont(cfg.fonts.mono) : 'Menlo-Regular';
  var displayFont = cfg ? BP.pickFont(cfg.fonts.display) : 'Arial-BoldMT';

  app.beginUndoGroup('Import lesson slides');
  var root = BP.folder('CRM Analytics Academy — Lessons');
  var footage = BP.folder('Slides — ' + deck.lesson, root);

  var comp = BP.replaceComp('Lesson — ' + deck.lesson, deck.width || 1920, deck.height || 1080, total + xfade, fps, root);
  comp.comment = deck.route + ' · ' + deck.slides.length + ' slides · built from slides.json';

  var t = 0;
  var missing = [];
  // Added in reverse so slide 1 ends up on top of the layer stack.
  var layers = [];
  for (var s = 0; s < deck.slides.length; s++) {
    var slide = deck.slides[s];
    var f = new File(dir.fsName + '/' + slide.file);
    if (!f.exists) {
      missing.push(slide.file);
      t += slide.duration;
      continue;
    }
    var item = app.project.importFile(new ImportOptions(f));
    item.parentFolder = footage;
    layers.push({ item: item, slide: slide, start: t });
    t += slide.duration;
  }

  for (var k = layers.length - 1; k >= 0; k--) {
    var L = layers[k];
    var layer = comp.layers.add(L.item);
    layer.name = ('0' + L.slide.order).slice(-2) + ' · ' + L.slide.type + ' · ' + L.slide.title;
    layer.startTime = L.start;
    layer.outPoint = Math.min(comp.duration, L.start + L.slide.duration + xfade);
    // Crossfade: each slide fades in over the one before it.
    if (k > 0 && xfade > 0) {
      var op = layer.property('ADBE Transform Group').property('ADBE Opacity');
      op.setValueAtTime(L.start, 0);
      op.setValueAtTime(L.start + xfade, 100);
      BP.ease(op, 60);
    }

    var guide = BP.text(comp, 'Title (guide) · ' + L.slide.title, L.slide.title, 160, 300, { font: displayFont, size: 72, color: '#0C1B33', tracking: -20 });
    guide.startTime = L.start;
    guide.outPoint = Math.min(comp.duration, L.start + L.slide.duration);
    guide.guideLayer = true;
    guide.enabled = false;
    guide.moveBefore(layer);

    var mv = new MarkerValue(('0' + L.slide.order).slice(-2) + ' ' + L.slide.title);
    mv.comment = String(L.slide.notes || '').substr(0, 900);
    mv.duration = L.slide.duration;
    comp.markerProperty.setValueAtTime(L.start, mv);
  }

  // A small mono credit strip, off by default, for social cuts.
  var credit = BP.text(comp, 'Credit (optional)', 'crmanalytics.imswarnil.com' + deck.route, 96, (deck.height || 1080) - 34, { font: monoFont, size: 17, color: '#4A5B78', tracking: 100 });
  credit.enabled = false;

  app.endUndoGroup();
  comp.openInViewer();
  alert('Imported ' + layers.length + ' slides (' + Math.round(total) + ' s) into "' + comp.name + '".' + (missing.length ? '\n\nMissing PNGs (run the generator without --no-png): ' + missing.join(', ') : ''));
})();
