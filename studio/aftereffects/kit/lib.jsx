// CRM Analytics Academy — After Effects motion kit: the core library.
//
// Flat 2D, soft round shapes, bouncy overshoot, friendly mascot ("Dot"),
// circle reveals — in the Academy's colours (studio/brand.json) and Figtree.
// ExtendScript (ES3): no let/const, no arrow functions, no Array.map/forEach.
//
// Everything here is a plain function that adds layers to a comp, so scenes
// (scenes.jsx), the film builder (film.jsx), the panel (CRMA Kit.jsx) and
// one-off comps (studio/comp.mjs) all draw the same way.

var KIT = KIT || {};

KIT.root = (function () {
  // studio/aftereffects/kit/lib.jsx → studio/
  return new File($.fileName).parent.parent.parent;
}());

KIT.readJSON = function (file) {
  var f = file instanceof File ? file : new File(file);
  if (!f.exists) throw new Error('Missing ' + f.fsName);
  f.encoding = 'UTF-8';
  f.open('r');
  var s = f.read();
  f.close();
  return eval('(' + s + ')');
};

KIT.brand = KIT.readJSON(new File(KIT.root.fsName + '/brand.json'));

KIT.hex = function (h) {
  h = String(h).replace('#', '');
  return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
};
KIT.C = {};
(function () {
  var c = KIT.brand.colors;
  for (var k in c) if (c.hasOwnProperty(k)) KIT.C[k] = KIT.hex(c[k]);
  KIT.C.line = KIT.hex('#DDDBDA');
  KIT.C.muted = KIT.hex('#706E6B');
  KIT.C.code = KIT.hex('#0B2447');
  KIT.C.blush = KIT.hex('#FF8FA3');
  KIT.C.sun = KIT.hex('#FFC94D');
}());

KIT.F = { bold: 'Figtree-Bold', black: 'Figtree-ExtraBold', semi: 'Figtree-SemiBold', medium: 'Figtree-Medium', mono: 'GeistMono-Regular', monoBold: 'GeistMono-Medium' };

// ---- comps ---------------------------------------------------------------------
KIT.comp = function (name, seconds, bg, folder) {
  var b = KIT.brand.frame;
  var c = app.project.items.addComp(name, b.width, b.height, 1, Math.max(0.1, seconds), b.fps);
  c.bgColor = bg || KIT.C.paper;
  if (folder) c.parentFolder = folder;
  return c;
};
KIT.folder = function (name, parent) {
  for (var i = 1; i <= app.project.numItems; i++) {
    var it = app.project.item(i);
    if (it instanceof FolderItem && it.name === name && (!parent || it.parentFolder === parent)) return it;
  }
  var f = app.project.items.addFolder(name);
  if (parent) f.parentFolder = parent;
  return f;
};

// ---- easing and keyframes -------------------------------------------------------
KIT.easeAll = function (prop, influence) {
  influence = influence || 75;
  var dims = 1;
  if (prop.propertyValueType === PropertyValueType.TwoD) dims = 2;
  if (prop.propertyValueType === PropertyValueType.ThreeD) dims = 3;
  // Spatial properties (position) take a single ease.
  if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) dims = 1;
  for (var k = 1; k <= prop.numKeys; k++) {
    var e = [];
    for (var d = 0; d < dims; d++) e.push(new KeyframeEase(0, influence));
    try {
      prop.setTemporalEaseAtKey(k, e, e);
    } catch (err) {
      // Some properties refuse custom ease; linear is fine for them.
    }
  }
};
// keys(prop, [[t, v], [t, v], …], influence)
KIT.keys = function (prop, list, influence) {
  for (var i = 0; i < list.length; i++) prop.setValueAtTime(list[i][0], list[i][1]);
  KIT.easeAll(prop, influence);
};
// A bouncy entrance: scale 0 → overshoot → settle (the signature move).
KIT.pop = function (layer, t, size) {
  var s = size || 100;
  KIT.keys(layer.property('ADBE Transform Group').property('ADBE Scale'), [
    [t, [0, 0, 100]], [t + 0.2, [s * 1.14, s * 1.14, 100]], [t + 0.32, [s * 0.94, s * 0.94, 100]], [t + 0.44, [s, s, 100]]
  ], 70);
};
KIT.popOut = function (layer, t) {
  var sc = layer.property('ADBE Transform Group').property('ADBE Scale');
  var v = sc.valueAtTime(t, false);
  KIT.keys(sc, [[t, v], [t + 0.12, [v[0] * 1.08, v[1] * 1.08, 100]], [t + 0.3, [0, 0, 100]]], 70);
};
// Squash on landing, stretch on take-off (anchor at the bottom for this).
KIT.squash = function (layer, t, s) {
  s = s || 100;
  KIT.keys(layer.property('ADBE Transform Group').property('ADBE Scale'), [
    [t, [s, s, 100]], [t + 0.08, [s * 1.18, s * 0.8, 100]], [t + 0.2, [s * 0.9, s * 1.12, 100]], [t + 0.34, [s * 1.04, s * 0.97, 100]], [t + 0.46, [s, s, 100]]
  ], 60);
};
KIT.moveFrom = function (layer, t, dx, dy, d) {
  var p = layer.property('ADBE Transform Group').property('ADBE Position');
  var v = p.value;
  KIT.keys(p, [[t, [v[0] + dx, v[1] + dy]], [t + (d || 0.55), [v[0], v[1]]]], 85);
};
KIT.fade = function (layer, t0, t1, a, b) {
  KIT.keys(layer.property('ADBE Transform Group').property('ADBE Opacity'), [[t0, a], [t1, b]], 60);
};
KIT.at = function (layer, x, y) {
  layer.property('ADBE Transform Group').property('ADBE Position').setValue([x, y]);
  return layer;
};
KIT.from = function (layer, t) {
  // Layer exists from t (keeps the timeline readable when editing by hand).
  layer.inPoint = Math.max(0, t);
  return layer;
};

// ---- shapes -----------------------------------------------------------------------
// Each shape is one shape layer with one group: easy to find and edit by hand.
KIT.shapeLayer = function (comp, name) {
  var L = comp.layers.addShape();
  L.name = name;
  return L;
};
KIT.group = function (L, name) {
  var g = L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group');
  g.name = name || 'Group';
  return g;
};
KIT.fill = function (g, color, opacity) {
  var f = g.property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Fill');
  f.property('ADBE Vector Fill Color').setValue(color);
  if (opacity !== undefined) f.property('ADBE Vector Fill Opacity').setValue(opacity);
  return f;
};
KIT.stroke = function (g, color, width, round) {
  var s = g.property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Stroke');
  s.property('ADBE Vector Stroke Color').setValue(color);
  s.property('ADBE Vector Stroke Width').setValue(width);
  if (round !== false) {
    s.property('ADBE Vector Stroke Line Cap').setValue(2);
    s.property('ADBE Vector Stroke Line Join').setValue(2);
  }
  return s;
};
KIT.rectIn = function (g, w, h, r, x, y) {
  var p = g.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Rect');
  p.property('ADBE Vector Rect Size').setValue([w, h]);
  p.property('ADBE Vector Rect Roundness').setValue(r || 0);
  if (x !== undefined) p.property('ADBE Vector Rect Position').setValue([x, y]);
  return p;
};
KIT.ellipseIn = function (g, w, h, x, y) {
  var p = g.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Ellipse');
  p.property('ADBE Vector Ellipse Size').setValue([w, h]);
  if (x !== undefined) p.property('ADBE Vector Ellipse Position').setValue([x, y]);
  return p;
};
KIT.pathIn = function (g, pts, closed, inT, outT) {
  var p = g.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Group');
  var s = new Shape();
  s.vertices = pts;
  s.inTangents = inT || [];
  s.outTangents = outT || [];
  s.closed = !!closed;
  p.property('ADBE Vector Shape').setValue(s);
  return p;
};
KIT.trim = function (g) {
  return g.property('ADBE Vectors Group').addProperty('ADBE Vector Filter - Trim');
};
KIT.groupXform = function (g) {
  return g.property('ADBE Vector Transform Group');
};

KIT.rect = function (comp, name, w, h, r, color, x, y) {
  var L = KIT.shapeLayer(comp, name);
  var g = KIT.group(L, name);
  KIT.rectIn(g, w, h, r);
  KIT.fill(g, color);
  return KIT.at(L, x, y);
};
KIT.circle = function (comp, name, d, color, x, y) {
  var L = KIT.shapeLayer(comp, name);
  var g = KIT.group(L, name);
  KIT.ellipseIn(g, d, d);
  KIT.fill(g, color);
  return KIT.at(L, x, y);
};
// A white card with a hairline border and a soft flat shadow.
KIT.card = function (comp, name, w, h, x, y, color) {
  var L = KIT.shapeLayer(comp, name);
  // In a shape layer the first group is in front: card first, shadow behind.
  var g = KIT.group(L, 'card');
  KIT.rectIn(g, w, h, 18);
  KIT.fill(g, color || KIT.C.white);
  KIT.stroke(g, KIT.C.line, 2);
  var sh = KIT.group(L, 'shadow');
  KIT.rectIn(sh, w, h, 18, 0, 10);
  KIT.fill(sh, KIT.C.navy, 10);
  return KIT.at(L, x, y);
};
// A line from a to b (stroke), drawn on with trim paths between t0 and t1.
KIT.wire = function (comp, name, a, b, color, width, t0, t1, curve) {
  var L = KIT.shapeLayer(comp, name);
  var g = KIT.group(L, name);
  var dx = (b[0] - a[0]) * (curve === false ? 0 : 0.5);
  KIT.pathIn(g, [a, b], false, [[0, 0], [-dx, 0]], [[dx, 0], [0, 0]]);
  KIT.stroke(g, color, width || 6);
  if (t0 !== undefined) {
    var tr = KIT.trim(g);
    KIT.keys(tr.property('ADBE Vector Trim End'), [[t0, 0], [t1, 100]], 70);
  }
  // The path is in comp coordinates: put the layer's origin at the comp's.
  return KIT.at(L, 0, 0);
};

// ---- text ------------------------------------------------------------------------------
// text(comp, 'Hello', {size, color, font, x, y, align: 'center'|'left'|'right', tracking, leading})
KIT.text = function (comp, str, o) {
  o = o || {};
  var L = comp.layers.addText(str);
  L.name = o.name || String(str).replace(/[\r\n]+/g, ' ').substr(0, 28);
  var st = L.property('ADBE Text Properties').property('ADBE Text Document');
  var td = st.value;
  td.resetCharStyle();
  td.resetParagraphStyle();
  td.font = o.font || KIT.F.bold;
  td.fontSize = o.size || 64;
  td.applyFill = true;
  td.fillColor = o.color || KIT.C.ink;
  td.applyStroke = false;
  td.tracking = o.tracking || 0;
  if (o.leading) {
    td.autoLeading = false;
    td.leading = o.leading;
  }
  td.justification = o.align === 'left' ? ParagraphJustification.LEFT_JUSTIFY : (o.align === 'right' ? ParagraphJustification.RIGHT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY);
  st.setValue(td);
  // Anchor at the visual centre (left edge for left-aligned), so pops scale from the middle.
  var r = L.sourceRectAtTime(0, false);
  var ax = o.align === 'left' ? r.left : r.left + r.width / 2;
  L.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([ax, r.top + r.height / 2]);
  return KIT.at(L, o.x === undefined ? comp.width / 2 : o.x, o.y === undefined ? comp.height / 2 : o.y);
};
// Uppercase tracked label (the site's eyebrow style).
KIT.eyebrow = function (comp, str, x, y, color) {
  return KIT.text(comp, String(str).toUpperCase(), { size: 30, font: KIT.F.bold, color: color || KIT.C.signal, tracking: 180, x: x, y: y });
};
// Typing: reveals the text a character at a time from t, `cps` characters a second, with a cursor.
KIT.typeOn = function (layer, t, cps) {
  var st = layer.property('ADBE Text Properties').property('ADBE Text Document');
  st.expression = 'var n = Math.max(0, Math.floor((time - ' + t.toFixed(3) + ') * ' + (cps || 24) + '));\n' +
    'var s = String(value);\n' +
    'var shown = s.substr(0, n);\n' +
    'shown + ((n < s.length && time >= ' + t.toFixed(3) + ') || Math.floor(time * 2) % 2 ? "\\u258D" : " ");';
};
// A number counting up between t0 and t1 (e.g. 0 → 400,000), with thousands separators.
KIT.countUp = function (layer, t0, t1, to, suffix) {
  var st = layer.property('ADBE Text Properties').property('ADBE Text Document');
  st.expression = 'var p = Math.min(1, Math.max(0, (time - ' + t0 + ') / ' + (t1 - t0) + '));\n' +
    'p = 1 - Math.pow(1 - p, 3);\n' +
    'var n = Math.round(' + to + ' * p);\n' +
    'n.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",") + "' + (suffix || '') + '";';
};

// ---- backgrounds and transitions ----------------------------------------------------------
// The scene's flat colour, revealed as a circle growing from a point (the soft "morph" wipe).
KIT.reveal = function (comp, color, t, x, y) {
  var L = KIT.circle(comp, 'BG reveal', 100, color, x === undefined ? comp.width / 2 : x, y === undefined ? comp.height / 2 : y);
  KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[t, [0, 0, 100]], [t + 0.6, [4600, 4600, 100]]], 85);
  return L;
};
// Soft decorative circles drifting slowly (depth without clutter).
KIT.blobs = function (comp, color, n, seed, opacity) {
  var out = [];
  var r = seed || 3;
  for (var i = 0; i < (n || 5); i++) {
    r = (r * 9301 + 49297) % 233280;
    var x = (r / 233280) * comp.width;
    r = (r * 9301 + 49297) % 233280;
    var y = (r / 233280) * comp.height;
    var d = 160 + (i * 97) % 360;
    var L = KIT.circle(comp, 'Blob ' + (i + 1), d, color, x, y);
    L.property('ADBE Transform Group').property('ADBE Opacity').setValue(opacity || 12);
    L.property('ADBE Transform Group').property('ADBE Position').expression = 'seedRandom(' + (i + 1) + ', true); wiggle(0.25, 60)';
    out.push(L);
  }
  return out;
};

// ---- the mascot: the Bars ---------------------------------------------------------------
// The Academy logo's three bars, alive: each bar is a character with a face.
// bar(comp, x, y, {h, w, color, name, arm, mood}) — anchored at its feet, so
// squash/stretch and hops read right. crew(comp, x, y, scale) = the logo trio.
KIT.CREW = [
  { name: 'Frosty', color: 'frost', h: 0.42 },
  { name: 'Bright', color: 'signalBright', h: 0.7 },
  { name: 'Big Blue', color: 'signal', h: 1 }
];
KIT.bar = function (comp, x, y, o) {
  o = o || {};
  var w = o.w || 120;
  var h = o.h || 320;
  var L = KIT.shapeLayer(comp, o.name || 'Bar');
  var fy = -h + Math.min(h * 0.32, w * 0.75);
  // First group = front.
  if (o.arm) {
    var arm = KIT.group(L, 'Arm');
    KIT.pathIn(arm, [[w / 2 - 6, fy + w * 0.55], [w / 2 + w * 0.42, fy + w * 0.05]], false);
    KIT.stroke(arm, KIT.C[o.color] || o.color || KIT.C.signal, w * 0.16);
    var at = KIT.groupXform(arm);
    at.property('ADBE Vector Anchor').setValue([w / 2 - 6, fy + w * 0.55]);
    at.property('ADBE Vector Position').setValue([w / 2 - 6, fy + w * 0.55]);
    at.property('ADBE Vector Rotation').expression = '18 * Math.sin(time * 9)';
  }
  var mouth = KIT.group(L, 'Mouth');
  if (o.mood === 'talk') {
    KIT.ellipseIn(mouth, w * 0.26, w * 0.2, 0, fy + w * 0.3);
    KIT.fill(mouth, KIT.C.navyDeep);
    var tongue = KIT.group(L, 'Tongue');
    KIT.ellipseIn(tongue, w * 0.14, w * 0.07, 0, fy + w * 0.36);
    KIT.fill(tongue, KIT.C.blush);
  } else if (o.mood === 'o') {
    KIT.ellipseIn(mouth, w * 0.14, w * 0.16, 0, fy + w * 0.3);
    KIT.fill(mouth, KIT.C.navyDeep);
  } else {
    KIT.pathIn(mouth, [[-w * 0.12, fy + w * 0.26], [w * 0.12, fy + w * 0.26]], false, [[0, 0], [w * 0.04, w * 0.09]], [[w * 0.04, w * 0.09], [0, 0]]);
    KIT.stroke(mouth, KIT.C.navyDeep, Math.max(4, w * 0.045));
  }
  var pupils = KIT.group(L, 'Pupils');
  KIT.ellipseIn(pupils, w * 0.12, w * 0.14, -w * 0.15, fy + w * 0.02);
  KIT.ellipseIn(pupils, w * 0.12, w * 0.14, w * 0.19, fy + w * 0.02);
  KIT.fill(pupils, KIT.C.navyDeep);
  var eyes = KIT.group(L, 'Eyes');
  KIT.ellipseIn(eyes, w * 0.26, w * 0.3, -w * 0.17, fy);
  KIT.ellipseIn(eyes, w * 0.26, w * 0.3, w * 0.17, fy);
  KIT.fill(eyes, KIT.C.white);
  var blush = KIT.group(L, 'Blush');
  KIT.ellipseIn(blush, w * 0.18, w * 0.1, -w * 0.32, fy + w * 0.2);
  KIT.ellipseIn(blush, w * 0.18, w * 0.1, w * 0.32, fy + w * 0.2);
  KIT.fill(blush, KIT.C.blush, 65);
  var shine = KIT.group(L, 'Shine');
  KIT.rectIn(shine, w * 0.12, h * 0.42, w * 0.06, -w * 0.28, -h * 0.5);
  KIT.fill(shine, KIT.C.white, 22);
  var body = KIT.group(L, 'Body');
  KIT.rectIn(body, w, h, Math.min(24, w * 0.2), 0, -h / 2);
  KIT.fill(body, KIT.C[o.color] || o.color || KIT.C.signal);
  KIT.at(L, x, y);
  KIT.faceAnchor(L, w, h);
  var tr = L.property('ADBE Transform Group');
  tr.property('ADBE Scale').expression = 'var b = 1 + 0.018 * Math.sin(time * 3 + ' + (x % 7) + '); [value[0] * (2 - b), value[1] * b]';
  L.property('ADBE Root Vectors Group').property('Pupils').property('ADBE Vector Transform Group').property('ADBE Vector Position').expression = 'seedRandom(' + Math.round(x) + ', true); wiggle(0.7, ' + Math.round(w * 0.03) + ')';
  return L;
};
// The trio standing like the logo, bottoms aligned at y. Returns [small, mid, tall].
KIT.crew = function (comp, x, y, scale, o) {
  o = o || {};
  var s = scale || 1;
  var w = 120 * s;
  var gap = 26 * s;
  var out = [];
  for (var i = 0; i < 3; i++) {
    var c = KIT.CREW[i];
    out.push(KIT.bar(comp, x + (i - 1) * (w + gap), y, { w: w, h: 400 * s * c.h, color: c.color, name: c.name, arm: o.arm && i === 2, mood: i === 2 && o.talk ? 'talk' : o.mood }));
  }
  return out;
};
// Lip sync: the mouth opens with the voice. vo = props._vo ({at, env, fps}); T = when the scene starts.
KIT.talk = function (layer, vo, T) {
  if (!vo || !vo.env || !vo.env.length) return;
  var root = layer.property('ADBE Root Vectors Group');
  var parts = ['Mouth', 'Tongue'];
  for (var p = 0; p < parts.length; p++) {
    var g = root.property(parts[p]);
    if (!g) continue;
    var tr = g.property('ADBE Vector Transform Group');
    // Scale the mouth around its own centre.
    var c = g.property('ADBE Vectors Group').property(1).property('ADBE Vector Ellipse Position').value;
    tr.property('ADBE Vector Anchor').setValue(c);
    tr.property('ADBE Vector Position').setValue(c);
    var sc = tr.property('ADBE Vector Scale');
    var t0 = T + vo.at;
    sc.setValueAtTime(Math.max(0, t0 - 0.1), [100, 12]);
    for (var i = 0; i < vo.env.length; i++) {
      var o = vo.env[i];
      sc.setValueAtTime(t0 + i / vo.fps, [80 + o * 30, 12 + o * 100]);
    }
    sc.setValueAtTime(t0 + vo.env.length / vo.fps + 0.08, [100, 12]);
  }
};
// Blink at each time in `times`.
KIT.blink = function (layer, times) {
  var names = ['Eyes', 'Pupils'];
  for (var n = 0; n < names.length; n++) {
    var sc = layer.property('ADBE Root Vectors Group').property(names[n]).property('ADBE Vector Transform Group').property('ADBE Vector Scale');
    for (var i = 0; i < times.length; i++) {
      sc.setValueAtTime(times[i], [100, 100]);
      sc.setValueAtTime(times[i] + 0.06, [100, 8]);
      sc.setValueAtTime(times[i] + 0.14, [100, 100]);
    }
  }
};
// Eyes and pupils scale around the face, not the layer origin.
KIT.faceAnchor = function (layer, w, h) {
  var fy = -h + Math.min(h * 0.32, w * 0.75);
  var names = ['Eyes', 'Pupils'];
  for (var n = 0; n < names.length; n++) {
    var t = layer.property('ADBE Root Vectors Group').property(names[n]).property('ADBE Vector Transform Group');
    t.property('ADBE Vector Anchor').setValue([0, fy]);
    t.property('ADBE Vector Position').setValue([0, fy]);
  }
};
// A hop from where it is to (x, y), with an arc and a squash on landing.
KIT.hop = function (layer, t, x, y, height, d) {
  d = d || 0.42;
  var p = layer.property('ADBE Transform Group').property('ADBE Position');
  var a = p.valueAtTime(t, false);
  p.setValueAtTime(t, a);
  p.setValueAtTime(t + d / 2, [(a[0] + x) / 2, Math.min(a[1], y) - (height || 120)]);
  p.setValueAtTime(t + d, [x, y]);
  KIT.easeAll(p, 50);
};
// A whole-crew entrance: each bar springs up out of the floor in turn.
KIT.springUp = function (layers, t, stagger) {
  for (var i = 0; i < layers.length; i++) {
    var sc = layers[i].property('ADBE Transform Group').property('ADBE Scale');
    var tt = t + i * (stagger || 0.25);
    KIT.keys(sc, [[tt, [100, 0, 100]], [tt + 0.18, [88, 122, 100]], [tt + 0.32, [110, 90, 100]], [tt + 0.46, [97, 103, 100]], [tt + 0.58, [100, 100, 100]]], 60);
  }
};

// ---- screens: real site screenshots in a browser window ------------------------------------
KIT.footage = {};
KIT.importStill = function (path, folder) {
  if (KIT.footage[path]) return KIT.footage[path];
  var f = new File(path);
  if (!f.exists) throw new Error('Missing screenshot ' + path + ' (run node studio/screens.mjs)');
  var it = app.project.importFile(new ImportOptions(f));
  if (folder) it.parentFolder = folder;
  KIT.footage[path] = it;
  return it;
};
// browser(comp, 'home-tall', {x, y, w, h, url, pan: [from, to] (0–1 down the page), t0, t1, zoom})
// → { frame, view, rect } ; `view` is the precomp holding the page (pan/zoom inside it).
KIT.browser = function (comp, screen, o) {
  o = o || {};
  var w = o.w || 1380;
  var h = o.h || 800;
  var bar = 52;
  var x = o.x === undefined ? comp.width / 2 : o.x;
  var y = o.y === undefined ? comp.height / 2 : o.y;
  var foot = KIT.importStill(KIT.screensDir + '/' + screen + '.png', KIT.screensFolder);
  var view = app.project.items.addComp('Screen ' + screen, Math.round(w), Math.round(h - bar), 1, comp.duration, comp.frameRate);
  view.parentFolder = KIT.screensFolder;
  view.bgColor = KIT.C.white;
  var img = view.layers.add(foot);
  var s = w / foot.width * 100 * (o.zoom || 1);
  img.property('ADBE Transform Group').property('ADBE Scale').setValue([s, s]);
  img.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([foot.width / 2, 0]);
  var travel = Math.max(0, foot.height * s / 100 - (h - bar));
  var pan = o.pan || [0, 0];
  var p = img.property('ADBE Transform Group').property('ADBE Position');
  var fx = view.width / 2 + (o.zoomX || 0);
  p.setValue([fx, -travel * pan[0]]);
  if (pan[1] !== pan[0]) KIT.keys(p, [[o.t0 || 0, [fx, -travel * pan[0]]], [o.t1 || comp.duration, [fx, -travel * pan[1]]]], 60);

  // Window chrome: shadow, body, title bar with dots and an address pill.
  var F = KIT.shapeLayer(comp, 'Browser ' + screen);
  var dots = KIT.group(F, 'Dots');
  KIT.ellipseIn(dots, 14, 14, -w / 2 + 26, -h / 2 + bar / 2);
  KIT.ellipseIn(dots, 14, 14, -w / 2 + 48, -h / 2 + bar / 2);
  KIT.ellipseIn(dots, 14, 14, -w / 2 + 70, -h / 2 + bar / 2);
  KIT.fill(dots, KIT.C.line);
  var pill = KIT.group(F, 'Address');
  KIT.rectIn(pill, Math.min(620, w * 0.5), 30, 15, 0, -h / 2 + bar / 2);
  KIT.fill(pill, KIT.C.paper);
  var top = KIT.group(F, 'Title bar');
  KIT.rectIn(top, w, bar, 0, 0, -h / 2 + bar / 2);
  KIT.fill(top, KIT.C.white);
  var body = KIT.group(F, 'Window');
  KIT.rectIn(body, w, h, 16);
  KIT.fill(body, KIT.C.white);
  var sh = KIT.group(F, 'Shadow');
  KIT.rectIn(sh, w, h, 16, 0, 18);
  KIT.fill(sh, KIT.C.navyDeep, 16);
  KIT.at(F, x, y);
  var V = comp.layers.add(view);
  V.name = 'Page ' + screen;
  KIT.at(V, x, y + bar / 2);
  V.parent = F;
  var url = KIT.text(comp, o.url || 'crmanalytics.imswarnil.com', { size: 20, font: KIT.F.medium, color: KIT.C.muted, x: x, y: y - h / 2 + bar / 2 });
  url.parent = F;
  // Window chrome over the page edges so the page never shows outside the frame.
  return { frame: F, page: V, url: url, view: view, img: img, w: w, h: h, x: x, y: y };
};
// A callout chip: icon + label, popping at t, with a little pointer dot.
KIT.chip = function (comp, text, icon, x, y, t, o) {
  o = o || {};
  var w = 60 + text.length * 17;
  var bg = KIT.rect(comp, 'Chip ' + text, w + 50, 72, 36, o.bg || KIT.C.navy, x, y);
  KIT.pop(bg, t);
  var ic = KIT.icon(comp, icon, x - (w + 50) / 2 + 38, y, 50, o.bg || KIT.C.navy, KIT.C.white);
  KIT.pop(ic, t + 0.05);
  var tx = KIT.text(comp, text, { size: 28, font: KIT.F.bold, color: KIT.C.white, x: x - (w + 50) / 2 + 76, y: y, align: 'left' });
  KIT.pop(tx, t + 0.08);
  return [bg, ic, tx];
};

// ---- transitions (how a scene comes in) -------------------------------------------------------
// The brand sweep: three bars in the logo colours rise over the old scene, the
// new colour lands underneath, and the bars carry on up and away.
KIT.barsWipe = function (comp, color, t) {
  var bg = KIT.rect(comp, 'BG', comp.width, comp.height, 0, color, comp.width / 2, comp.height / 2);
  KIT.fade(bg, t + 0.22, t + 0.23, 0, 100);
  var cols = [KIT.C.frost, KIT.C.signalBright, KIT.C.signal];
  var w = comp.width / 3;
  for (var i = 0; i < 3; i++) {
    var b = KIT.rect(comp, 'Sweep ' + (i + 1), w + 4, comp.height * 1.3, 0, cols[i], w * i + w / 2, comp.height * 1.85);
    var p = b.property('ADBE Transform Group').property('ADBE Position');
    var tt = t + i * 0.06;
    KIT.keys(p, [[tt - 0.25, [w * i + w / 2, comp.height * 1.85]], [tt + 0.05, [w * i + w / 2, comp.height / 2]], [tt + 0.18, [w * i + w / 2, comp.height / 2]], [tt + 0.48, [w * i + w / 2, -comp.height * 0.85]]], 80);
  }
  return bg;
};
// A push: the new colour slides in from the right as a solid panel.
KIT.push = function (comp, color, t) {
  var bg = KIT.rect(comp, 'BG push', comp.width, comp.height, 0, color, comp.width * 1.5, comp.height / 2);
  KIT.keys(bg.property('ADBE Transform Group').property('ADBE Position'), [[t - 0.45, [comp.width * 1.5, comp.height / 2]], [t + 0.05, [comp.width / 2, comp.height / 2]]], 90);
  return bg;
};
// Pick the entrance by name (film spec `transition`).
KIT.enter = function (comp, kind, color, T, x, y) {
  if (kind === 'bars') return KIT.barsWipe(comp, color, T - 0.5);
  if (kind === 'push') return KIT.push(comp, color, T);
  if (kind === 'none') return KIT.rect(comp, 'BG', comp.width, comp.height, 0, color, comp.width / 2, comp.height / 2);
  return KIT.reveal(comp, color, T - 0.5, x, y);
};
// Content that should arrive with a push slides in with it.
KIT.slideIn = function (layers, T, dx) {
  for (var i = 0; i < layers.length; i++) KIT.moveFrom(layers[i], T - 0.45, dx || 1920, 0, 0.5);
};

// ---- icons (line icons in a round badge) ------------------------------------------------------
// icon(comp, 'play'|'check'|'flame'|'badge'|'chat'|'brief'|'award'|'db'|'join'|'broom'|'out'|'cloud', x, y, size, color, bg)
KIT.icon = function (comp, name, x, y, size, color, bg) {
  var s = (size || 140) / 100;
  var L = KIT.shapeLayer(comp, 'Icon ' + name);
  var g = KIT.group(L, 'Glyph');
  var c = color || KIT.C.signal;
  var w = 6 * s;
  var P = function (pts, closed) { KIT.pathIn(g, scalePts(pts), closed); };
  function scalePts(pts) {
    var o = [];
    for (var i = 0; i < pts.length; i++) o.push([pts[i][0] * s, pts[i][1] * s]);
    return o;
  }
  if (name === 'play') {
    P([[-12, -18], [20, 0], [-12, 18]], true);
    KIT.fill(g, c);
  } else if (name === 'check') {
    P([[-18, 0], [-5, 14], [20, -14]], false);
    KIT.stroke(g, c, w * 1.3);
  } else if (name === 'flame') {
    KIT.pathIn(g, scalePts([[0, -24], [16, 4], [0, 22], [-16, 4]]), true, scalePts([[-4, 0], [0, -14], [10, 0], [0, 10]]), scalePts([[4, 0], [0, 12], [-10, 0], [0, -10]]));
    KIT.fill(g, KIT.C.warn);
  } else if (name === 'badge') {
    KIT.ellipseIn(g, 40 * s, 40 * s);
    KIT.stroke(g, c, w);
    var g2 = KIT.group(L, 'Tick');
    KIT.pathIn(g2, scalePts([[-9, 0], [-2, 7], [10, -7]]), false);
    KIT.stroke(g2, c, w);
  } else if (name === 'chat') {
    KIT.rectIn(g, 44 * s, 32 * s, 8 * s, 0, -4 * s);
    P([[-8, 12], [-14, 22], [2, 12]], true);
    KIT.fill(g, c);
  } else if (name === 'brief') {
    KIT.rectIn(g, 44 * s, 30 * s, 6 * s, 0, 4 * s);
    KIT.fill(g, c);
    var h = KIT.group(L, 'Handle');
    KIT.rectIn(h, 18 * s, 12 * s, 4 * s, 0, -14 * s);
    KIT.stroke(h, c, w * 0.8);
  } else if (name === 'award') {
    KIT.ellipseIn(g, 30 * s, 30 * s, 0, -6 * s);
    P([[-10, 6], [-14, 24], [0, 18], [14, 24], [10, 6]], true);
    KIT.fill(g, KIT.C.sun);
  } else if (name === 'db') {
    KIT.ellipseIn(g, 40 * s, 14 * s, 0, -14 * s);
    KIT.rectIn(g, 40 * s, 28 * s, 0, 0, 0);
    KIT.ellipseIn(g, 40 * s, 14 * s, 0, 14 * s);
    KIT.fill(g, c);
  } else if (name === 'join') {
    KIT.ellipseIn(g, 30 * s, 30 * s, -8 * s, 0);
    KIT.ellipseIn(g, 30 * s, 30 * s, 8 * s, 0);
    KIT.stroke(g, c, w);
  } else if (name === 'broom') {
    P([[-16, -18], [6, 4]], false);
    KIT.stroke(g, c, w);
    var br = KIT.group(L, 'Bristles');
    KIT.pathIn(br, scalePts([[0, 2], [14, 16], [6, 22], [-8, 10]]), true);
    KIT.fill(br, c);
  } else if (name === 'out') {
    KIT.rectIn(g, 40 * s, 30 * s, 6 * s, 0, 0);
    KIT.stroke(g, c, w);
    var bars = KIT.group(L, 'Bars');
    KIT.rectIn(bars, 6 * s, 10 * s, 0, -10 * s, 4 * s);
    KIT.rectIn(bars, 6 * s, 16 * s, 0, 0, 1 * s);
    KIT.rectIn(bars, 6 * s, 22 * s, 0, 10 * s, -2 * s);
    KIT.fill(bars, c);
  } else if (name === 'user') {
    KIT.ellipseIn(g, 22 * s, 22 * s, 0, -10 * s);
    KIT.pathIn(g, scalePts([[-20, 22], [-20, 16], [0, 6], [20, 16], [20, 22]]), true, scalePts([[0, 0], [0, -8], [-12, 0], [0, -8], [0, 0]]), scalePts([[0, -8], [12, 0], [0, 8], [0, 0], [0, 0]]));
    KIT.fill(g, c);
  } else if (name === 'lock') {
    KIT.rectIn(g, 36 * s, 28 * s, 6 * s, 0, 8 * s);
    KIT.fill(g, c);
    var sh2 = KIT.group(L, 'Shackle');
    KIT.pathIn(sh2, scalePts([[-11, -4], [-11, -14], [11, -14], [11, -4]]), false, scalePts([[0, 0], [0, 0], [0, -12], [0, 0]]), scalePts([[0, 0], [0, -12], [0, 0], [0, 0]]));
    KIT.stroke(sh2, c, w);
  } else if (name === 'sync') {
    KIT.ellipseIn(g, 40 * s, 40 * s);
    KIT.stroke(g, c, w);
    var tr3 = KIT.trim(g);
    tr3.property('ADBE Vector Trim Start').setValue(8);
    tr3.property('ADBE Vector Trim End').setValue(78);
    var ar = KIT.group(L, 'Arrow');
    KIT.pathIn(ar, scalePts([[14, -24], [24, -14], [10, -10]]), true);
    KIT.fill(ar, c);
  } else if (name === 'code') {
    P([[-8, -14], [-22, 0], [-8, 14]], false);
    KIT.stroke(g, c, w);
    var g3 = KIT.group(L, 'Right');
    KIT.pathIn(g3, scalePts([[8, -14], [22, 0], [8, 14]]), false);
    KIT.stroke(g3, c, w);
  } else if (name === 'link') {
    KIT.rectIn(g, 30 * s, 16 * s, 8 * s, -9 * s, 0);
    KIT.rectIn(g, 30 * s, 16 * s, 8 * s, 9 * s, 0);
    KIT.stroke(g, c, w * 0.8);
  } else if (name === 'share') {
    KIT.ellipseIn(g, 14 * s, 14 * s, -14 * s, 0);
    KIT.ellipseIn(g, 14 * s, 14 * s, 14 * s, -14 * s);
    KIT.ellipseIn(g, 14 * s, 14 * s, 14 * s, 14 * s);
    KIT.fill(g, c);
    var ln = KIT.group(L, 'Lines');
    KIT.pathIn(ln, scalePts([[14, -14], [-14, 0], [14, 14]]), false);
    KIT.stroke(ln, c, w * 0.7);
  } else if (name === 'spark') {
    KIT.pathIn(g, scalePts([[0, -24], [6, -6], [24, 0], [6, 6], [0, 24], [-6, 6], [-24, 0], [-6, -6]]), true);
    KIT.fill(g, c);
  } else {
    KIT.ellipseIn(g, 30 * s, 30 * s);
    KIT.fill(g, c);
  }
  // The badge last, so it sits behind the glyph.
  if (bg !== false) {
    var b = KIT.group(L, 'Badge');
    KIT.ellipseIn(b, 100 * s, 100 * s);
    KIT.fill(b, bg || KIT.C.white);
  }
  return KIT.at(L, x, y);
};

// The Academy mark: three rising bars (brand/mark.svg), growing in from t.
KIT.mark = function (comp, x, y, size, t) {
  var s = (size || 160) / 512;
  var cols = [KIT.C.frost, KIT.C.signalBright, KIT.C.signal];
  var xs = [108, 256, 404];
  var hs = [168, 280, 400];
  var out = [];
  for (var i = 0; i < 3; i++) {
    var L = KIT.rect(comp, 'Mark bar ' + (i + 1), 104 * s, hs[i] * s, 20 * s, cols[i], x + (xs[i] - 256) * s, y + (456 - 256) * s);
    L.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, hs[i] * s / 2]);
    if (t !== undefined) KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[t + i * 0.1, [100, 0, 100]], [t + i * 0.1 + 0.3, [100, 112, 100]], [t + i * 0.1 + 0.45, [100, 100, 100]]], 70);
    out.push(L);
  }
  return out;
};

// A mouse pointer that glides to (x, y) by t and clicks (with a ripple).
KIT.cursor = function (comp, from, to, t, color, hide) {
  var L = KIT.shapeLayer(comp, 'Cursor');
  var g = KIT.group(L, 'Arrow');
  KIT.pathIn(g, [[0, 0], [0, 44], [12, 33], [21, 52], [29, 48], [20, 30], [36, 30]], true);
  KIT.fill(g, KIT.C.ink);
  KIT.stroke(g, KIT.C.white, 4);
  var p = L.property('ADBE Transform Group').property('ADBE Position');
  KIT.keys(p, [[t - 0.8, from], [t, to]], 85);
  KIT.keys(L.property('ADBE Transform Group').property('ADBE Scale'), [[t, [100, 100, 100]], [t + 0.06, [82, 82, 100]], [t + 0.16, [100, 100, 100]]], 60);
  var r = KIT.shapeLayer(comp, 'Click ripple');
  var rg = KIT.group(r, 'Ring');
  KIT.ellipseIn(rg, 30, 30);
  KIT.stroke(rg, color || KIT.C.signal, 5);
  KIT.at(r, to[0], to[1]);
  KIT.keys(r.property('ADBE Transform Group').property('ADBE Scale'), [[t, [0, 0, 100]], [t + 0.4, [300, 300, 100]]], 40);
  KIT.keys(r.property('ADBE Transform Group').property('ADBE Opacity'), [[t, 100], [t + 0.4, 0]], 40);
  r.moveAfter(L);
  // hide: the pointer leaves after the click (for several clicks in one scene).
  if (hide) KIT.keys(L.property('ADBE Transform Group').property('ADBE Opacity'), [[t - 0.8, 0], [t - 0.7, 100], [t + 0.3, 100], [t + 0.45, 0]], 40);
  return L;
};

// ---- 3D: camera, depth, grouping ----------------------------------------------------------------
// Build a scene flat (2D keys are simpler), then KIT.to3D(comp) turns every
// layer 3D except the backdrop (names starting BG / Blob / Sweep), and
// KIT.camera adds a two-node camera that starts where a 2D view would.
KIT.ZOOM = 2666.7;
KIT.to3D = function (comp) {
  var flat = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    var L = comp.layer(i);
    if (L instanceof CameraLayer || L instanceof LightLayer) continue;
    if (L.comment === 'keep2d') flat.push(L);
    if (/^(BG|Blob|Sweep)/.test(L.name) || L.comment === 'keep2d') continue;
    try {
      L.threeDLayer = true;
    } catch (e) {
      // audio and the like stay as they are
    }
  }
  // Flat titles go on top of everything the camera moves.
  for (i = flat.length - 1; i >= 0; i--) flat[i].moveToBeginning();
};
KIT.front = function (layers, z) {
  for (var i = 0; i < layers.length; i++) KIT.setZ(layers[i], z === undefined ? -150 : z);
};
// keys: [[t, [x, y, z], [poiX, poiY, poiZ]], …]
KIT.camera = function (comp, keys, influence) {
  var cam = comp.layers.addCamera('Camera', [comp.width / 2, comp.height / 2]);
  cam.property('ADBE Camera Options Group').property('ADBE Camera Zoom').setValue(KIT.ZOOM);
  var p = cam.property('ADBE Transform Group').property('ADBE Position');
  var poi = cam.property('ADBE Transform Group').property('ADBE Anchor Point');
  if (!keys || !keys.length) keys = [[0, [comp.width / 2, comp.height / 2, -KIT.ZOOM], [comp.width / 2, comp.height / 2, 0]]];
  if (keys.length === 1) {
    p.setValue(keys[0][1]);
    poi.setValue(keys[0][2]);
  } else {
    for (var i = 0; i < keys.length; i++) {
      p.setValueAtTime(keys[i][0], keys[i][1]);
      poi.setValueAtTime(keys[i][0], keys[i][2]);
    }
    KIT.easeAll(p, influence || 70);
    KIT.easeAll(poi, influence || 70);
  }
  return cam;
};
// A camera position orbiting (cx, cy, 0) by `yaw` degrees left/right and `pitch` up/down.
KIT.orbitPos = function (cx, cy, yaw, pitch, dist) {
  var d = dist || KIT.ZOOM;
  var a = yaw * Math.PI / 180;
  var b = pitch * Math.PI / 180;
  return [cx + Math.sin(a) * Math.cos(b) * d, cy - Math.sin(b) * d, -Math.cos(a) * Math.cos(b) * d];
};
// Several layers moved as one: a null at (x, y) becomes their parent.
KIT.bundle = function (comp, name, layers, x, y) {
  var n = comp.layers.addNull();
  n.name = name;
  n.enabled = false;
  KIT.at(n, x, y);
  for (var i = 0; i < layers.length; i++) layers[i].parent = n;
  return n;
};
// After KIT.to3D: fly a 3D layer in from depth z (and a tilt) to its place.
KIT.flyIn = function (layer, t, z, tilt, d) {
  var p = layer.property('ADBE Transform Group').property('ADBE Position');
  var v = p.value;
  KIT.keys(p, [[t, [v[0], v[1], z === undefined ? 800 : z]], [t + (d || 0.7), [v[0], v[1], v[2] || 0]]], 85);
  if (tilt) KIT.keys(layer.property('ADBE Transform Group').property('ADBE Rotate X'), [[t, tilt], [t + (d || 0.7), 0]], 85);
  KIT.keys(layer.property('ADBE Transform Group').property('ADBE Opacity'), [[t, 0], [t + 0.2, 100]], 50);
};
KIT.setZ = function (layer, z) {
  var p = layer.property('ADBE Transform Group').property('ADBE Position');
  var v = p.value;
  p.setValue([v[0], v[1], z]);
};

// ---- props ------------------------------------------------------------------------------------------
// A person: coloured circle with initials.
KIT.avatar = function (comp, initials, x, y, d, color) {
  var c = KIT.circle(comp, 'Avatar ' + initials, d || 90, color || KIT.C.signal, x, y);
  var t = KIT.text(comp, initials, { size: (d || 90) * 0.38, font: KIT.F.black, color: KIT.C.white, x: x, y: y });
  t.parent = c;
  return c;
};
// A soft cloud (a generic cloud, never a company's logo).
KIT.cloud = function (comp, name, x, y, w, color) {
  var L = KIT.shapeLayer(comp, name || 'Cloud');
  var g = KIT.group(L, 'Cloud');
  var s = (w || 420) / 420;
  KIT.ellipseIn(g, 200 * s, 200 * s, -80 * s, -10 * s);
  KIT.ellipseIn(g, 240 * s, 240 * s, 40 * s, -40 * s);
  KIT.ellipseIn(g, 170 * s, 170 * s, 140 * s, 20 * s);
  KIT.ellipseIn(g, 150 * s, 150 * s, -150 * s, 30 * s);
  KIT.rectIn(g, 300 * s, 110 * s, 55 * s, 0, 50 * s);
  var m = g.property('ADBE Vectors Group').addProperty('ADBE Vector Filter - Merge');
  m.property('ADBE Vector Merge Type').setValue(2);
  KIT.fill(g, color || KIT.C.white);
  return KIT.at(L, x, y);
};
// A Salesforce-style record card: object label, title, field rows. Returns its bundle (null).
KIT.record = function (comp, obj, title, fields, x, y, w, t, color) {
  w = w || 460;
  var rowH = 52;
  var h = 120 + fields.length * rowH;
  var layers = [];
  var card = KIT.card(comp, obj + ' card', w, h, x, y);
  layers.push(card);
  var strip = KIT.rect(comp, obj + ' strip', w, 10, 4, color || KIT.C.signal, x, y - h / 2 + 5);
  layers.push(strip);
  var ic = KIT.icon(comp, obj === 'Lead' ? 'user' : obj === 'Opportunity' ? 'brief' : obj === 'Contact' ? 'user' : 'db', x - w / 2 + 50, y - h / 2 + 62, 64, KIT.C.white, color || KIT.C.signal);
  layers.push(ic);
  layers.push(KIT.text(comp, obj.toUpperCase(), { size: 20, font: KIT.F.bold, color: color || KIT.C.signal, tracking: 120, x: x - w / 2 + 96, y: y - h / 2 + 46, align: 'left' }));
  layers.push(KIT.text(comp, title, { size: 32, font: KIT.F.black, color: KIT.C.navy, x: x - w / 2 + 96, y: y - h / 2 + 80, align: 'left' }));
  for (var i = 0; i < fields.length; i++) {
    var fy = y - h / 2 + 130 + i * rowH;
    var k = KIT.text(comp, fields[i][0], { size: 22, font: KIT.F.medium, color: KIT.C.muted, x: x - w / 2 + 30, y: fy, align: 'left' });
    var v = KIT.text(comp, fields[i][1], { size: 26, font: KIT.F.bold, color: KIT.C.navy, x: x + w / 2 - 30, y: fy, align: 'right' });
    if (t !== undefined) {
      KIT.fade(k, t + 0.3 + i * 0.12, t + 0.45 + i * 0.12, 0, 100);
      KIT.fade(v, t + 0.35 + i * 0.12, t + 0.5 + i * 0.12, 0, 100);
    }
    layers.push(k, v);
  }
  var b = KIT.bundle(comp, obj + ': ' + title, layers, x, y);
  if (t !== undefined) KIT.pop(b, t);
  return b;
};
// A phone with a little dashboard on it. Returns its bundle.
KIT.phone = function (comp, x, y, h, t) {
  var w = h * 0.5;
  var layers = [];
  layers.push(KIT.rect(comp, 'Phone body', w, h, w * 0.16, KIT.C.navyDeep, x, y));
  layers.push(KIT.rect(comp, 'Phone screen', w - 22, h - 22, w * 0.12, KIT.C.paper, x, y));
  layers.push(KIT.rect(comp, 'Phone notch', w * 0.32, 18, 9, KIT.C.navyDeep, x, y - h / 2 + 22));
  layers.push(KIT.text(comp, 'Academy Leads', { size: h * 0.04, font: KIT.F.black, color: KIT.C.navy, x: x, y: y - h * 0.36 }));
  layers.push(KIT.text(comp, '1,284', { size: h * 0.085, font: KIT.F.black, color: KIT.C.signal, x: x, y: y - h * 0.24 }));
  var hs = [0.5, 0.85, 0.35, 0.65];
  for (var i = 0; i < 4; i++) {
    var bh = h * 0.28 * hs[i];
    var b = KIT.rect(comp, 'Phone bar ' + (i + 1), w * 0.13, bh, 6, [KIT.C.frost, KIT.C.signal, KIT.C.signalBright, KIT.C.signal][i], x - w * 0.3 + i * w * 0.2, y + h * 0.2 - bh / 2);
    layers.push(b);
  }
  layers.push(KIT.rect(comp, 'Phone line', w * 0.7, 10, 5, KIT.C.line, x, y + h * 0.3));
  layers.push(KIT.rect(comp, 'Phone line 2', w * 0.5, 10, 5, KIT.C.line, x - w * 0.1, y + h * 0.36));
  var n = KIT.bundle(comp, 'Phone', layers, x, y);
  if (t !== undefined) KIT.pop(n, t);
  return n;
};
// A small dashboard card (for stations, embeds). Returns its bundle.
KIT.miniDash = function (comp, name, x, y, w, h, t) {
  var layers = [KIT.card(comp, name + ' card', w, h, x, y)];
  layers.push(KIT.rect(comp, name + ' header', w * 0.5, 14, 7, KIT.C.navy, x - w * 0.18, y - h * 0.36));
  layers.push(KIT.rect(comp, name + ' kpi', w * 0.26, h * 0.2, 8, KIT.C.ice, x + w * 0.3, y - h * 0.3));
  var hs = [0.45, 0.8, 0.3, 0.62, 0.95];
  for (var i = 0; i < 5; i++) {
    var bh = h * 0.42 * hs[i];
    layers.push(KIT.rect(comp, name + ' bar ' + (i + 1), w * 0.1, bh, 5, i === 4 ? KIT.C.signal : KIT.C.signalBright, x - w * 0.32 + i * w * 0.16, y + h * 0.34 - bh / 2));
  }
  var n = KIT.bundle(comp, name, layers, x, y);
  if (t !== undefined) KIT.pop(n, t);
  return n;
};
