// CRM Analytics Academy · motion concept library (After Effects ExtendScript)
//
// Every lesson's "MOTION:" shots map to one of these templates
// (studio/lesson-to-shots.mjs picks the concept). Each function builds a
// self-contained, editable comp from shape layers only, in the brand colours,
// so a new lesson starts from a working animation instead of a blank comp.
// Change a template here once and every future lesson gets it.
//
// ExtendScript is ES3: var, function, no arrows, no template strings.

function hex(h) {
  h = h.replace('#', '')
  return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]
}

function ease(prop) {
  var e = new KeyframeEase(0, 80)
  for (var k = 1; k <= prop.numKeys; k++) {
    try {
      var dims = prop.value instanceof Array ? prop.value.length : 1
      var arr = []
      for (var d = 0; d < (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL ? 1 : dims); d++) arr.push(e)
      prop.setTemporalEaseAtKey(k, arr, arr)
    } catch (err) {}
  }
}

// A rounded rectangle shape layer: the atom of every concept (cells, rows, cards).
function box(comp, name, w, h, pos, fill, radius) {
  var l = comp.layers.addShape()
  l.name = name
  var g = l.property('Contents').addProperty('ADBE Vector Group')
  var r = g.property('Contents').addProperty('ADBE Vector Shape - Rect')
  r.property('Size').setValue([w, h])
  r.property('Roundness').setValue(radius === undefined ? 10 : radius)
  var f = g.property('Contents').addProperty('ADBE Vector Graphic - Fill')
  f.property('Color').setValue(fill)
  l.property('Position').setValue(pos)
  return l
}

function label(comp, text, pos, size, color, font) {
  var t = comp.layers.addText(text)
  var p = t.property('Source Text')
  var d = p.value
  d.fontSize = size
  d.fillColor = color
  d.font = font
  d.justification = ParagraphJustification.CENTER_JUSTIFY
  p.setValue(d)
  t.property('Position').setValue(pos)
  return t
}

function moveIn(layer, from, to, t0, t1) {
  var p = layer.property('Position')
  p.setValueAtTime(t0, from)
  p.setValueAtTime(t1, to)
  ease(p)
}

function fade(layer, t0, t1, a, b) {
  var o = layer.property('Opacity')
  o.setValueAtTime(t0, a)
  o.setValueAtTime(t1, b)
}

// A table: `rows` rows of cells, returns the row layers (top to bottom).
function table(comp, prefix, cols, rows, origin, colors) {
  var out = []
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      out.push(box(comp, prefix + ' r' + (r + 1) + 'c' + (c + 1), 150, 56, [origin[0] + c * 160, origin[1] + r * 66], r === 0 ? colors.head : colors.cell, 8))
    }
  }
  return out
}

function newComp(name, seconds, brand) {
  var c = app.project.items.addComp(name, brand.frame.width, brand.frame.height, 1, seconds, brand.frame.fps)
  c.layers.addSolid(hex(brand.colors.paper), 'Background', brand.frame.width, brand.frame.height, 1)
  return c
}

var Concepts = {
  // Two tables slide in, matching keys glow, right columns attach.
  join: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    var cl = { head: hex(brand.colors.navy), cell: hex(brand.colors.ice) }
    var left = table(comp, 'Left', 2, 4, [360, 380], cl)
    var right = table(comp, 'Right', 2, 4, [1240, 380], cl)
    for (var i = 0; i < left.length; i++) moveIn(left[i], [left[i].property('Position').value[0] - 600, left[i].property('Position').value[1]], left[i].property('Position').value, 0, 0.8)
    for (var j = 0; j < right.length; j++) moveIn(right[j], [right[j].property('Position').value[0] + 600, right[j].property('Position').value[1]], right[j].property('Position').value, 0.2, 1)
    for (var k = 1; k < 4; k++) {
      var key = box(comp, 'Key glow ' + k, 150, 56, [360, 380 + k * 66], hex(brand.colors.signalBright), 8)
      fade(key, 1.2 + k * 0.3, 1.5 + k * 0.3, 0, 100)
    }
    for (var m = 0; m < right.length; m++) moveIn(right[m], right[m].property('Position').value, [right[m].property('Position').value[0] - 560, right[m].property('Position').value[1]], 2.8, 3.6)
    label(comp, 'matched on AccountId', [960, 820], 40, hex(brand.colors.navy), brand.fonts.semibold)
    return comp
  },

  // One row splits into three; the amount cell pulses red on each copy.
  fanout: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    var rows = []
    for (var i = 0; i < 3; i++) {
      var r = box(comp, 'Row copy ' + (i + 1), 620, 64, [960, 400], hex(brand.colors.ice), 10)
      moveIn(r, [960, 400], [960, 400 + i * 84], 1 + i * 0.25, 1.6 + i * 0.25)
      var amt = box(comp, 'Amount ' + (i + 1), 160, 48, [1180, 400 + i * 84], hex(brand.colors.bad), 8)
      fade(amt, 1.8 + i * 0.3, 2.1 + i * 0.3, 0, 100)
      rows.push(r)
    }
    label(comp, '1 deal → 3 rows → Amount × 3', [960, 760], 48, hex(brand.colors.bad), brand.fonts.bold)
    return comp
  },

  // Many rows stack and merge into one summary row.
  collapse: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    for (var i = 0; i < 5; i++) {
      var r = box(comp, 'Detail row ' + (i + 1), 560, 52, [960, 300 + i * 70], hex(brand.colors.ice), 8)
      moveIn(r, [960, 300 + i * 70], [960, 520], 1 + i * 0.1, 1.8 + i * 0.1)
      fade(r, 1.8, 2.1, 100, 0)
    }
    var sum = box(comp, 'Summary row', 600, 72, [960, 520], hex(brand.colors.navy), 10)
    fade(sum, 1.9, 2.3, 0, 100)
    label(comp, 'one row per key', [960, 680], 44, hex(brand.colors.navy), brand.fonts.semibold)
    return comp
  },

  // Dots travel along a line of stages (sync → recipe → dataset → dashboard).
  flow: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    var stages = ['Source', 'Recipe', 'Dataset', 'Dashboard']
    for (var i = 0; i < stages.length; i++) {
      box(comp, 'Stage ' + stages[i], 300, 120, [300 + i * 440, 540], hex(brand.colors.navy), 14)
      label(comp, stages[i], [300 + i * 440, 552], 40, hex(brand.colors.white), brand.fonts.semibold)
    }
    for (var d = 0; d < 6; d++) {
      var dot = box(comp, 'Data dot ' + (d + 1), 24, 24, [300, 540], hex(brand.colors.signalBright), 12)
      moveIn(dot, [300, 640], [1620, 640], d * 0.5, d * 0.5 + 2.4)
    }
    return comp
  },

  // A highlighted frame slides down a column; a running value grows beside it.
  window: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    for (var i = 0; i < 6; i++) box(comp, 'Month ' + (i + 1), 220, 60, [760, 240 + i * 76], hex(brand.colors.ice), 8)
    var frame = box(comp, 'Window frame', 240, 220, [760, 316], hex(brand.colors.ice), 12)
    var parts = frame.property('Contents').property(1).property('Contents')
    parts.property('ADBE Vector Graphic - Fill').property('Opacity').setValue(0)
    var stroke = parts.addProperty('ADBE Vector Graphic - Stroke')
    stroke.property('Color').setValue(hex(brand.colors.signal))
    stroke.property('Stroke Width').setValue(6)
    moveIn(frame, [760, 316], [760, 620], 0.5, 4)
    label(comp, 'over ([-2..0] order by month)', [960, 900], 40, hex(brand.colors.navy), brand.fonts.mono)
    return comp
  },

  // A selected chip leaves one widget and lands in another's query.
  chip: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    box(comp, 'Source widget', 520, 420, [460, 540], hex(brand.colors.white), 14)
    box(comp, 'Target widget', 620, 420, [1380, 540], hex(brand.colors.white), 14)
    var chip = box(comp, 'Selected chip', 180, 56, [460, 540], hex(brand.colors.signal), 28)
    label(comp, 'EMEA', [460, 552], 32, hex(brand.colors.white), brand.fonts.bold)
    moveIn(chip, [460, 540], [1380, 470], 1, 2.2)
    label(comp, "'Region' == {{ … }}", [1380, 620], 34, hex(brand.colors.navy), brand.fonts.mono)
    return comp
  },

  // Wide headers peel off and drop into one long column.
  rotate: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    var heads = ['New', 'Expansion', 'Contraction', 'Churned']
    for (var i = 0; i < heads.length; i++) {
      var h = box(comp, 'Header ' + heads[i], 200, 60, [520 + i * 220, 300], hex(brand.colors.navy), 8)
      moveIn(h, [520 + i * 220, 300], [1100, 420 + i * 76], 1 + i * 0.3, 1.9 + i * 0.3)
    }
    label(comp, 'wide → long', [960, 860], 48, hex(brand.colors.navy), brand.fonts.bold)
    return comp
  },

  // Rows drop out of a list (filters, nulls being filled, fades).
  filter: function (name, seconds, brand) {
    var comp = newComp(name, seconds, brand)
    for (var i = 0; i < 6; i++) {
      var r = box(comp, 'Row ' + (i + 1), 620, 56, [960, 260 + i * 76], hex(brand.colors.ice), 8)
      if (i % 2) {
        fade(r, 1 + i * 0.15, 1.5 + i * 0.15, 100, 15)
      }
    }
    return comp
  },

  // No template fits: a titled guide comp with the brief, to animate by hand.
  generic: function (name, seconds, brand, brief) {
    var comp = newComp(name, seconds, brand)
    var g = label(comp, brief || name, [960, 540], 36, hex(brand.colors.navy), brand.fonts.regular)
    g.guideLayer = true
    return comp
  }
}
