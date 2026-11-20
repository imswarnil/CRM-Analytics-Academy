// CRM Analytics Academy · JOINS — motion scenes (After Effects ExtendScript)
//
// Six finished, editable scenes that teach recipe joins with real tables of
// Academy data: cells with values, the key column lighting up, connector
// lines drawing between matches, rows travelling, fan-out pulsing red.
//
//   01 Join — the idea         lookup on unordered tables, 4 rows in → 4 out
//   02 Lookup — no match       a missing account leaves an empty cell
//   03 Left join — fan-out     one deal becomes three rows, Amount triples
//   04 Inner join              the unmatched row drops out
//   05 Outer join              an account with no deal appears with empty cells
//   06 The fix                 aggregate the products first, then join safely
//
// Run: File → Scripts → Run Script File… → this file. Or from a terminal:
//   osascript -e 'tell application "Adobe After Effects 2027" to DoScriptFile "…/joins.jsx"'
// It builds a project in a "JOINS" folder and saves it as
// studio/out/motion/joins.aep. Change data, colours or timing below; every
// scene is built from the same helpers, so a new join scene is ~30 lines.
//
// Needs Settings → Scripting & Expressions → "Allow Scripts to Write Files
// and Access Network" (to save the project). Fonts: Figtree, JetBrains Mono.

(function () {
  // ---------------------------------------------------------------- style
  var C = {
    bgTop: '#0A2A55', bgBottom: '#001A3E',
    head: '#0B3B7A', cell: '#F4F8FC', cellInk: '#0B1F3A', headInk: '#9FD0FF',
    key: '#1B96FF', keyInk: '#FFFFFF', line: '#1B96FF', moved: '#2E844A',
    bad: '#E5484D', nul: '#7CBEFF', white: '#FFFFFF', dim: '#5B7BA6'
  }
  var F = { bold: 'Figtree-Bold', semi: 'Figtree-SemiBold', reg: 'Figtree-Regular', mono: 'JetBrainsMono-Regular' }
  var W = 1920
  var H = 1080
  var FPS = 30
  var ROW_H = 64
  var GAP = 10
  var COL_GAP = 8

  function hex(h) {
    h = h.replace('#', '')
    return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]
  }

  // Easy-ease every keyframe of a property, whatever its dimension.
  function smooth(prop, influence) {
    var e = new KeyframeEase(0, influence || 85)
    for (var k = 1; k <= prop.numKeys; k++) {
      var done = false
      for (var n = 1; n <= 3 && !done; n++) {
        try {
          var arr = []
          for (var i = 0; i < n; i++) arr.push(e)
          prop.setTemporalEaseAtKey(k, arr, arr)
          done = true
        } catch (err) { done = false }
      }
    }
  }
  function keys(prop, list, influence) {
    for (var i = 0; i < list.length; i++) prop.setValueAtTime(list[i][0], list[i][1])
    smooth(prop, influence)
  }

  // ------------------------------------------------------------ primitives
  function comp(name, seconds, folder) {
    var c = app.project.items.addComp(name, W, H, 1, seconds, FPS)
    c.parentFolder = folder
    var bg = c.layers.addSolid(hex(C.bgBottom), 'Background', W, H, 1)
    var ramp = bg.property('Effects').addProperty('ADBE Ramp')
    ramp.property('Start of Ramp').setValue([W / 2, 0])
    ramp.property('Start Color').setValue(hex(C.bgTop))
    ramp.property('End of Ramp').setValue([W / 2, H])
    ramp.property('End Color').setValue(hex(C.bgBottom))
    bg.locked = true
    return c
  }

  function rect(c, name, w, h, x, y, fill, opts) {
    opts = opts || {}
    var l = c.layers.addShape()
    l.name = name
    var g = l.property('Contents').addProperty('ADBE Vector Group')
    var r = g.property('Contents').addProperty('ADBE Vector Shape - Rect')
    r.property('Size').setValue([w, h])
    r.property('Roundness').setValue(opts.round === undefined ? 10 : opts.round)
    var fl = g.property('Contents').addProperty('ADBE Vector Graphic - Fill')
    fl.property('Color').setValue(hex(fill))
    if (opts.noFill) fl.property('Opacity').setValue(0)
    if (opts.stroke) {
      var st = g.property('Contents').addProperty('ADBE Vector Graphic - Stroke')
      st.property('Color').setValue(hex(opts.stroke))
      st.property('Stroke Width').setValue(opts.strokeW || 3)
      if (opts.dash) st.property('Dashes').addProperty('ADBE Vector Stroke Dash 1').setValue(opts.dash)
    }
    l.property('Position').setValue([x, y])
    return l
  }

  function text(c, str, size, color, font, x, y, just) {
    var t = c.layers.addText(str)
    var p = t.property('Source Text')
    var d = p.value
    d.resetCharStyle()
    d.fontSize = size
    d.fillColor = hex(color)
    d.font = font
    d.applyFill = true
    d.applyStroke = false
    d.justification = just || ParagraphJustification.CENTER_JUSTIFY
    p.setValue(d)
    t.property('Position').setValue([x, y + size * 0.35])
    t.name = str
    return t
  }

  // A cell is a rect + its text, parented to a null so they move as one.
  function cell(c, label, val, w, x, y, kind) {
    var fill = kind === 'head' ? C.head : kind === 'key' ? C.cell : C.cell
    var ink = kind === 'head' ? C.headInk : C.cellInk
    var opts = kind === 'null' ? { stroke: C.nul, dash: 10, noFill: true, strokeW: 2 } : {}
    var r = rect(c, label + ' box', w, ROW_H, x, y, kind === 'null' ? C.bgBottom : fill, opts)
    var shown = kind === 'null' ? 'empty' : String(val)
    var t = text(c, shown, kind === 'head' ? 22 : 26, kind === 'null' ? C.nul : ink,
      kind === 'head' ? F.bold : (/^(OPP|ACC)-/.test(shown) ? F.mono : F.semi), x, y)
    var n = c.layers.addNull()
    n.name = label
    n.property('Position').setValue([x, y])
    n.source.name = label
    r.parent = n
    t.parent = n
    n.enabled = false // nulls are handles, not visible
    return { null: n, box: r, text: t, x: x, y: y, w: w }
  }

  // A table: header + rows. cols = [{name, w}], rows = [[v, v, …]].
  // Returns { cells: [rowIndex][colIndex], left, colX: [] }.
  function table(c, title, cols, rows, left, top, keyCol) {
    var colX = []
    var x = left
    for (var i = 0; i < cols.length; i++) {
      colX.push(x + cols[i].w / 2)
      x += cols[i].w + COL_GAP
    }
    var cap = text(c, title.toUpperCase(), 20, C.headInk, F.bold, left, top - 64, ParagraphJustification.LEFT_JUSTIFY)
    var out = { cells: [], colX: colX, left: left, right: x - COL_GAP, title: cap, rowY: [] }
    var head = []
    for (var h = 0; h < cols.length; h++) head.push(cell(c, title + ' · ' + cols[h].name, cols[h].name, cols[h].w, colX[h], top, 'head'))
    out.cells.push(head)
    out.rowY.push(top)
    for (var r = 0; r < rows.length; r++) {
      var y = top + (r + 1) * (ROW_H + GAP)
      var line = []
      for (var k = 0; k < cols.length; k++) {
        var v = rows[r][k]
        line.push(cell(c, title + ' r' + (r + 1) + ' ' + cols[k].name, v, cols[k].w, colX[k], y, v === null ? 'null' : (k === keyCol ? 'key' : 'cell')))
      }
      out.cells.push(line)
      out.rowY.push(y)
    }
    return out
  }

  // Animations on a cell's null (position/scale/opacity live on the null's
  // children, so we animate the children through a shared offset).
  function each(cellObj, fn) { fn(cellObj.box); fn(cellObj.text) }
  function slideIn(cellObj, t, dx, dy) {
    each(cellObj, function (l) {
      var p = l.property('Position')
      var v = p.value
      keys(p, [[t, [v[0] + dx, v[1] + dy]], [t + 0.6, v]])
      keys(l.property('Opacity'), [[t, 0], [t + 0.4, 100]], 60)
    })
  }
  function moveBy(cellObj, t0, t1, dx, dy) {
    each(cellObj, function (l) {
      var p = l.property('Position')
      var v = p.valueAtTime(t0, false)
      keys(p, [[t0, v], [t1, [v[0] + dx, v[1] + dy]]])
    })
  }
  function fadeTo(cellObj, t0, t1, a, b) {
    each(cellObj, function (l) { keys(l.property('Opacity'), [[t0, a], [t1, b]], 60) })
  }
  function pulse(cellObj, t) {
    each(cellObj, function (l) { keys(l.property('Scale'), [[t, [100, 100]], [t + 0.15, [112, 112]], [t + 0.4, [100, 100]]], 70) })
  }
  // Recolour a cell's box over time (key highlight, red alert, green success).
  function tint(cellObj, t, color, back) {
    var fill = cellObj.box.property('Contents').property(1).property('Contents').property('ADBE Vector Graphic - Fill').property('Color')
    var from = fill.value
    var list = [[t, from], [t + 0.3, hex(color)]]
    if (back) list.push([back, hex(color)], [back + 0.3, from])
    keys(fill, list, 60)
    var tc = cellObj.text.property('Source Text')
    var d = tc.value
    d.fillColor = hex(C.keyInk)
    tc.setValueAtTime(t + 0.15, d)
  }
  function tableIn(tbl, t, dx) {
    tbl.title.property('Opacity').setValueAtTime(t, 0)
    tbl.title.property('Opacity').setValueAtTime(t + 0.5, 100)
    for (var r = 0; r < tbl.cells.length; r++) {
      for (var k = 0; k < tbl.cells[r].length; k++) slideIn(tbl.cells[r][k], t + r * 0.07 + k * 0.03, dx, 0)
    }
  }

  // A curved connector from (x1,y1) to (x2,y2), drawn on with trim paths.
  function connector(c, name, x1, y1, x2, y2, t, color) {
    var l = c.layers.addShape()
    l.name = name
    l.property('Position').setValue([0, 0])
    l.property('Anchor Point').setValue([0, 0])
    var g = l.property('Contents').addProperty('ADBE Vector Group')
    var pth = g.property('Contents').addProperty('ADBE Vector Shape - Group')
    var s = new Shape()
    var dx = (x2 - x1) * 0.45
    s.vertices = [[x1, y1], [x2, y2]]
    s.inTangents = [[0, 0], [-dx, 0]]
    s.outTangents = [[dx, 0], [0, 0]]
    s.closed = false
    pth.property('Path').setValue(s)
    var st = g.property('Contents').addProperty('ADBE Vector Graphic - Stroke')
    st.property('Color').setValue(hex(color || C.line))
    st.property('Stroke Width').setValue(4)
    st.property('Line Cap').setValue(2)
    var trim = g.property('Contents').addProperty('ADBE Vector Filter - Trim')
    keys(trim.property('End'), [[t, 0], [t + 0.7, 100]])
    l.moveBefore(c.layer('Background')) // under every cell, above the background
    return l
  }

  function caption(c, kicker, line, t) {
    var k = text(c, kicker, 26, C.key, F.bold, W / 2, 96)
    var m = text(c, line, 46, C.white, F.bold, W / 2, 150)
    keys(k.property('Opacity'), [[t, 0], [t + 0.5, 100]])
    keys(m.property('Opacity'), [[t + 0.15, 0], [t + 0.65, 100]])
    var kp = m.property('Position')
    var v = kp.value
    keys(kp, [[t + 0.15, [v[0], v[1] + 24]], [t + 0.65, v]])
    return m
  }

  // A counter at the bottom: holds each label from its time.
  function counter(c, steps) {
    var t0 = steps[0]
    var l = text(c, t0[1], 40, C.white, F.semi, W / 2, H - 120)
    var src = l.property('Source Text')
    for (var i = 0; i < steps.length; i++) {
      var d = src.value
      d.text = steps[i][1]
      d.fillColor = hex(steps[i][2] || C.white)
      src.setValueAtTime(steps[i][0], d)
    }
    keys(l.property('Opacity'), [[steps[0][0] - 0.3, 0], [steps[0][0], 100]])
    return l
  }

  function note(c, str, t, color) {
    var l = text(c, str, 30, color || C.headInk, F.semi, W / 2, H - 190)
    keys(l.property('Opacity'), [[t, 0], [t + 0.4, 100]])
    return l
  }

  // ---------------------------------------------------------------- data
  var OPP_COLS = [{ name: 'OpportunityId', w: 230 }, { name: 'AccountId', w: 190 }, { name: 'Amount', w: 160 }]
  var ACC_COLS = [{ name: 'AccountId', w: 190 }, { name: 'Industry', w: 270 }]
  var OPPS = [
    ['OPP-20001', 'ACC-1066', '2,500'],
    ['OPP-20002', 'ACC-1108', '400'],
    ['OPP-20003', 'ACC-1038', '59,100'],
    ['OPP-20004', 'ACC-1110', '76,000']
  ]
  // deliberately not in the same order: matching is by key, not by position
  var ACCS = [
    ['ACC-1038', 'Financial Services'],
    ['ACC-1066', 'Retail'],
    ['ACC-1110', 'Technology'],
    ['ACC-1108', 'Manufacturing']
  ]
  var LEFT_X = 150
  var RIGHT_X = 1290
  var TOP = 330

  function indexOfKey(rows, col, key) {
    for (var i = 0; i < rows.length; i++) if (rows[i][col] === key) return i
    return -1
  }

  // Shared choreography for lookup / inner: highlight keys, draw lines,
  // fly the Industry cell of each match onto its left row.
  function matchAndAttach(c, L, R, lrows, rrows, t) {
    var attachX = L.right + COL_GAP + ACC_COLS[1].w / 2
    var head = cell(c, 'Joined · Industry', 'Industry', ACC_COLS[1].w, attachX, TOP, 'head')
    fadeTo(head, 0, 0.01, 0, 0)
    fadeTo(head, t + 2.6, t + 3.0, 0, 100)
    var missing = []
    for (var i = 0; i < lrows.length; i++) {
      var key = lrows[i][1]
      var j = indexOfKey(rrows, 0, key)
      tint(L.cells[i + 1][1], t + i * 0.12, C.key)
      if (j < 0) {
        missing.push(i)
        continue
      }
      tint(R.cells[j + 1][0], t + 0.3 + i * 0.12, C.key)
      connector(c, 'link ' + key, L.cells[i + 1][1].x + 95, L.rowY[i + 1], R.cells[j + 1][0].x - 95, R.rowY[j + 1], t + 0.9 + i * 0.25)
      // the travelling copy of the matched Industry cell
      var src = R.cells[j + 1][1]
      var fly = cell(c, 'Joined r' + (i + 1) + ' Industry', rrows[j][1], ACC_COLS[1].w, src.x, src.y, 'cell')
      fadeTo(fly, 0, 0.01, 0, 0)
      fadeTo(fly, t + 2.5 + i * 0.15, t + 2.6 + i * 0.15, 0, 100)
      moveBy(fly, t + 2.6 + i * 0.15, t + 3.5 + i * 0.15, attachX - src.x, L.rowY[i + 1] - src.y)
      tint(fly, t + 3.5 + i * 0.15, C.moved)
    }
    return { attachX: attachX, missing: missing }
  }

  function dimTable(T, t) {
    for (var r = 0; r < T.cells.length; r++) for (var k = 0; k < T.cells[r].length; k++) fadeTo(T.cells[r][k], t, t + 0.6, 100, 25)
    keys(T.title.property('Opacity'), [[t, 100], [t + 0.6, 25]])
  }

  // -------------------------------------------------------------- scenes
  function sceneIdea(folder) {
    var c = comp('01 Join — the idea', 14, folder)
    caption(c, 'RECIPE · JOIN', 'Match rows on a key, bring the columns across', 0.2)
    var L = table(c, 'Opportunities', OPP_COLS, OPPS, LEFT_X, TOP, 1)
    var R = table(c, 'Accounts', ACC_COLS, ACCS, RIGHT_X, TOP, 0)
    tableIn(L, 0.6, -120)
    tableIn(R, 0.9, 120)
    matchAndAttach(c, L, R, OPPS, ACCS, 2.4)
    dimTable(R, 7.2)
    counter(c, [[7.4, '4 rows in  →  4 rows out', C.white]])
    note(c, 'Order does not matter. The key does.', 8.4)
    return c
  }

  function sceneLookupMissing(folder) {
    var c = comp('02 Lookup — no match', 13, folder)
    caption(c, 'LOOKUP', 'No match? The row stays, the new column is empty', 0.2)
    var accs = [ACCS[0], ACCS[1], ACCS[3]] // ACC-1110 is missing
    var L = table(c, 'Opportunities', OPP_COLS, OPPS, LEFT_X, TOP, 1)
    var R = table(c, 'Accounts', ACC_COLS, accs, RIGHT_X, TOP, 0)
    tableIn(L, 0.6, -120)
    tableIn(R, 0.9, 120)
    var m = matchAndAttach(c, L, R, OPPS, accs, 2.4)
    for (var i = 0; i < m.missing.length; i++) {
      var r = m.missing[i]
      var e = cell(c, 'Empty r' + (r + 1), null, ACC_COLS[1].w, m.attachX, L.rowY[r + 1], 'null')
      fadeTo(e, 0, 0.01, 0, 0)
      fadeTo(e, 6.2, 6.6, 0, 100)
      pulse(e, 6.7)
    }
    dimTable(R, 7.4)
    counter(c, [[7.6, '4 rows in  →  4 rows out  ·  1 empty', C.white]])
    return c
  }

  function sceneFanOut(folder) {
    var c = comp('03 Left join — fan-out', 16, folder)
    caption(c, 'LEFT JOIN', 'One deal with three products becomes three rows', 0.2)
    var cols = [{ name: 'OpportunityId', w: 230 }, { name: 'Amount', w: 170 }]
    var opps = [['OPP-20003', '59,100'], ['OPP-20001', '2,500']]
    var pcols = [{ name: 'OpportunityId', w: 230 }, { name: 'Product', w: 300 }]
    var prods = [
      ['OPP-20003', 'Classroom Seat-Days'],
      ['OPP-20003', 'Certification Vouchers'],
      ['OPP-20003', 'Academy Pro'],
      ['OPP-20001', 'Certification Vouchers']
    ]
    var L = table(c, 'Opportunities', cols, opps, LEFT_X, TOP, 0)
    var R = table(c, 'Opportunity products', pcols, prods, RIGHT_X - 120, TOP, 0)
    tableIn(L, 0.6, -120)
    tableIn(R, 0.9, 120)
    var t = 2.4
    tint(L.cells[1][0], t, C.key)
    for (var p = 0; p < 3; p++) {
      tint(R.cells[p + 1][0], t + 0.3 + p * 0.1, C.key)
      connector(c, 'link p' + (p + 1), L.cells[1][0].x + 115, L.rowY[1], R.cells[p + 1][0].x - 115, R.rowY[p + 1], t + 0.8 + p * 0.25)
    }
    // OPP-20001 moves down to make room, OPP-20003 clones twice
    var step = ROW_H + GAP
    moveBy(L.cells[2][0], 4.4, 5.2, 0, step * 2)
    moveBy(L.cells[2][1], 4.4, 5.2, 0, step * 2)
    var clones = []
    for (var k = 1; k <= 2; k++) {
      var a = cell(c, 'Clone ' + k + ' OpportunityId', 'OPP-20003', 230, L.cells[1][0].x, L.rowY[1], 'cell')
      var b = cell(c, 'Clone ' + k + ' Amount', '59,100', 170, L.cells[1][1].x, L.rowY[1], 'cell')
      fadeTo(a, 0, 0.01, 0, 0)
      fadeTo(b, 0, 0.01, 0, 0)
      fadeTo(a, 4.9, 5.0, 0, 100)
      fadeTo(b, 4.9, 5.0, 0, 100)
      moveBy(a, 5.0, 5.8 + k * 0.1, 0, step * k)
      moveBy(b, 5.0, 5.8 + k * 0.1, 0, step * k)
      clones.push(b)
    }
    // the trap: the same amount three times
    var amounts = [L.cells[1][1], clones[0], clones[1]]
    for (var q = 0; q < amounts.length; q++) {
      tint(amounts[q], 7.0 + q * 0.2, C.bad)
      pulse(amounts[q], 7.2 + q * 0.2)
    }
    counter(c, [
      [6.4, 'SUM(Amount)   61,600', C.white],
      [8.0, 'SUM(Amount)   179,800   ×2.9', C.bad]
    ])
    note(c, 'Not a bug: you asked for one row per product. Sum a product-level measure instead.', 9.4)
    return c
  }

  function sceneInner(folder) {
    var c = comp('04 Inner join', 12, folder)
    caption(c, 'INNER JOIN', 'Only rows that match on both sides survive', 0.2)
    var accs = [ACCS[0], ACCS[1], ACCS[3]]
    var L = table(c, 'Opportunities', OPP_COLS, OPPS, LEFT_X, TOP, 1)
    var R = table(c, 'Accounts', ACC_COLS, accs, RIGHT_X, TOP, 0)
    tableIn(L, 0.6, -120)
    tableIn(R, 0.9, 120)
    var m = matchAndAttach(c, L, R, OPPS, accs, 2.4)
    for (var i = 0; i < m.missing.length; i++) {
      var r = m.missing[i] + 1
      for (var k = 0; k < L.cells[r].length; k++) {
        tint(L.cells[r][k], 6.4, C.bad)
        moveBy(L.cells[r][k], 7.0, 7.6, -60, 0)
        fadeTo(L.cells[r][k], 7.0, 7.6, 100, 0)
      }
    }
    dimTable(R, 7.6)
    counter(c, [[7.8, '4 rows in  →  3 rows out', C.white]])
    return c
  }

  function sceneOuter(folder) {
    var c = comp('05 Outer join', 13, folder)
    caption(c, 'OUTER JOIN', 'Keep everything. Gaps show what does not match', 0.2)
    var opps = [OPPS[0], OPPS[1], OPPS[2]]
    var accs = [ACCS[0], ACCS[1], ACCS[3], ['ACC-1079', 'Retail']]
    var L = table(c, 'Opportunities', OPP_COLS, opps, LEFT_X, TOP, 1)
    var R = table(c, 'Accounts', ACC_COLS, accs, RIGHT_X, TOP, 0)
    tableIn(L, 0.6, -120)
    tableIn(R, 0.9, 120)
    var m = matchAndAttach(c, L, R, opps, accs, 2.4)
    // the account nobody bought from arrives as a new row with empty deal cells
    var y = TOP + 4 * (ROW_H + GAP)
    var cells = [
      cell(c, 'Orphan OpportunityId', null, OPP_COLS[0].w, L.colX[0], y, 'null'),
      cell(c, 'Orphan AccountId', 'ACC-1079', OPP_COLS[1].w, L.colX[1], y, 'key'),
      cell(c, 'Orphan Amount', null, OPP_COLS[2].w, L.colX[2], y, 'null'),
      cell(c, 'Orphan Industry', 'Retail', ACC_COLS[1].w, m.attachX, y, 'cell')
    ]
    for (var i = 0; i < cells.length; i++) {
      fadeTo(cells[i], 0, 0.01, 0, 0)
      fadeTo(cells[i], 6.6 + i * 0.1, 7.0 + i * 0.1, 0, 100)
    }
    tint(R.cells[4][0], 6.2, C.moved)
    dimTable(R, 7.6)
    counter(c, [[7.8, 'Unmatched rows from both sides are kept', C.white]])
    note(c, 'Use it to find accounts with no deals, or deals with no account.', 8.8)
    return c
  }

  function sceneFix(folder) {
    var c = comp('06 The fix — aggregate first', 15, folder)
    caption(c, 'THE FIX', 'Collapse the many side to one row per key, then join', 0.2)
    var pcols = [{ name: 'OpportunityId', w: 230 }, { name: 'Product', w: 300 }, { name: 'ARR', w: 150 }]
    var prods = [
      ['OPP-20003', 'Classroom Seat-Days', '18,800'],
      ['OPP-20003', 'Certification Vouchers', '22,800'],
      ['OPP-20003', 'Academy Pro', '17,500']
    ]
    var P = table(c, 'Opportunity products', pcols, prods, 620, TOP, 0)
    tableIn(P, 0.6, 0)
    var step = ROW_H + GAP
    // rows 2 and 3 slide up into row 1 and vanish
    for (var r = 2; r <= 3; r++) {
      for (var k = 0; k < 3; k++) {
        moveBy(P.cells[r][k], 2.6, 3.4, 0, -step * (r - 1))
        fadeTo(P.cells[r][k], 3.2, 3.5, 100, 0)
      }
    }
    // row 1 becomes the summary
    fadeTo(P.cells[1][1], 3.2, 3.5, 100, 0)
    fadeTo(P.cells[1][2], 3.2, 3.5, 100, 0)
    var sumP = cell(c, 'Summary Products', '3 products', 300, P.colX[1], P.rowY[1], 'cell')
    var sumA = cell(c, 'Summary ARR', '59,100', 150, P.colX[2], P.rowY[1], 'cell')
    fadeTo(sumP, 0, 0.01, 0, 0)
    fadeTo(sumA, 0, 0.01, 0, 0)
    fadeTo(sumP, 3.4, 3.8, 0, 100)
    fadeTo(sumA, 3.4, 3.8, 0, 100)
    tint(sumA, 3.9, C.moved)
    pulse(sumA, 4.0)
    // relabel the headers
    var hd = P.cells[0][1].text.property('Source Text')
    var d = hd.value
    d.text = 'COUNT()'
    hd.setValueAtTime(3.4, d)
    var hd2 = P.cells[0][2].text.property('Source Text')
    var d2 = hd2.value
    d2.text = 'SUM(ARR)'
    hd2.setValueAtTime(3.4, d2)
    counter(c, [
      [2.4, '3 rows', C.white],
      [3.8, '1 row per opportunity  ·  safe to join', C.moved]
    ])
    note(c, 'Aggregate node: group by OpportunityId, then Lookup. Rows in = rows out.', 5.0)
    return c
  }

  // ---------------------------------------------------------------- build
  app.beginUndoGroup('Joins scenes')
  if (!app.project) app.newProject()
  var folder = app.project.items.addFolder('JOINS')
  var built = [sceneIdea(folder), sceneLookupMissing(folder), sceneFanOut(folder), sceneInner(folder), sceneOuter(folder), sceneFix(folder)]
  app.endUndoGroup()

  // A new, untitled project is saved as studio/out/motion/joins.aep. If you
  // ran this inside a project of your own, the scenes are added to it and it
  // is left for you to save: never re-pointed at another file.
  if (app.project.file) return
  var here = new File($.fileName).parent // studio/aftereffects/scenes
  var outDir = new Folder(here.parent.parent.fsName + '/out/motion')
  try {
    if (!outDir.exists) outDir.create()
    app.project.save(new File(outDir.fsName + '/joins.aep'))
  } catch (e) {
    alert('Built ' + built.length + ' scenes. Could not save automatically: enable Settings → Scripting & Expressions → Allow Scripts to Write Files. ' + e)
  }
})()
