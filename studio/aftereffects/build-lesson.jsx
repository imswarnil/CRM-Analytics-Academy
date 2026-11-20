// CRM Analytics Academy · build one lesson's After Effects project
//
// File → Scripts → Run Script File… → this file, then pick the lesson's
// studio/out/<section>/<lesson>/ae.json (made by lesson-to-shots.mjs).
//
// It creates, in a fresh project, under one folder per kind:
//   01 Title Card          5 s, navy, kicker + title rising in
//   02 Lower Thirds        one 4 s comp per on-screen line
//   03 Motion              one comp per MOTION shot, from concepts.jsx
//   04 End Screen          20 s, "Next:" + two YouTube end-screen guides
// and saves <lesson>.aep next to ae.json. Every comp has a transparent
// background except the motion ones, so titles drop straight onto footage.
//
// Fonts: Figtree and JetBrains Mono (installed on the machine).

#include "concepts.jsx"

(function () {
  var file = File.openDialog('Choose the lesson\'s ae.json', 'JSON:*.json')
  if (!file) return
  file.encoding = 'UTF-8'
  file.open('r')
  var raw = file.read()
  file.close()
  var data = (typeof JSON !== 'undefined') ? JSON.parse(raw) : eval('(' + raw + ')')
  var brand = data.brand

  app.beginUndoGroup('Build lesson')
  app.newProject()
  var folders = {}
  var names = ['01 Title Card', '02 Lower Thirds', '03 Motion', '04 End Screen']
  for (var i = 0; i < names.length; i++) folders[names[i]] = app.project.items.addFolder(names[i])

  function titleComp(name, seconds) {
    return app.project.items.addComp(name, brand.frame.width, brand.frame.height, 1, seconds, brand.frame.fps)
  }
  function text(comp, str, size, color, font, pos, just) {
    var t = comp.layers.addText(str)
    var p = t.property('Source Text')
    var d = p.value
    d.fontSize = size
    d.fillColor = hex(color)
    d.font = font
    d.justification = just || ParagraphJustification.LEFT_JUSTIFY
    p.setValue(d)
    t.property('Position').setValue(pos)
    return t
  }
  function rise(layer, t0) {
    var p = layer.property('Position')
    var v = p.value
    p.setValueAtTime(t0, [v[0], v[1] + 40])
    p.setValueAtTime(t0 + brand.motion['in'], v)
    ease(p)
    var o = layer.property('Opacity')
    o.setValueAtTime(t0, 0)
    o.setValueAtTime(t0 + brand.motion['in'], 100)
  }

  // 01 Title card
  var tc = titleComp('Title — ' + data.lesson.title, 5)
  tc.parentFolder = folders['01 Title Card']
  tc.layers.addSolid(hex(brand.colors.navy), 'Navy', brand.frame.width, brand.frame.height, 1)
  var bar = box(tc, 'Accent bar', 12, 220, [180, 540], hex(brand.colors.signalBright), 6)
  var k = text(tc, data.titleCard.kicker.toUpperCase(), brand.type.label, brand.colors.frost, brand.fonts.bold, [220, 470])
  var ti = text(tc, data.titleCard.title, brand.type.title, brand.colors.white, brand.fonts.bold, [220, 600])
  rise(bar, 0.1)
  rise(k, 0.2)
  rise(ti, 0.35)

  // 02 Lower thirds
  for (var l = 0; l < data.lowerThirds.length; l++) {
    var lt = data.lowerThirds[l]
    var c = titleComp('LT ' + (lt.shot < 10 ? '0' : '') + lt.shot + ' — ' + lt.text.substr(0, 40), 4)
    c.parentFolder = folders['02 Lower Thirds']
    var plate = box(c, 'Plate', 1100, 110, [700, 900], hex(brand.colors.navy), 12)
    var line = text(c, lt.text, brand.type.lowerThird, brand.colors.white, brand.fonts.semibold, [190, 915])
    rise(plate, 0)
    rise(line, 0.1)
    var o1 = plate.property('Opacity')
    o1.setValueAtTime(4 - brand.motion.out, 100)
    o1.setValueAtTime(4, 0)
    var o2 = line.property('Opacity')
    o2.setValueAtTime(4 - brand.motion.out, 100)
    o2.setValueAtTime(4, 0)
  }

  // 03 Motion concepts
  for (var m = 0; m < data.motion.length; m++) {
    var mo = data.motion[m]
    var build = Concepts[mo.concept] || Concepts.generic
    var mc = build('MOTION ' + (mo.shot < 10 ? '0' : '') + mo.shot + ' — ' + mo.name + ' [' + mo.concept + ']', Math.max(6, mo.seconds), brand, mo.brief)
    mc.parentFolder = folders['03 Motion']
    mc.comment = mo.brief
    var brief = mc.layers.addText(mo.brief)
    brief.guideLayer = true
    brief.name = 'BRIEF (guide)'
  }

  // 04 End screen
  var es = titleComp('End Screen', brand.endScreenSeconds)
  es.parentFolder = folders['04 End Screen']
  es.layers.addSolid(hex(brand.colors.navy), 'Navy', brand.frame.width, brand.frame.height, 1)
  var nx = text(es, 'NEXT', brand.type.label, brand.colors.frost, brand.fonts.bold, [140, 200])
  var nt = text(es, data.endScreen.next || 'The next lesson', 84, brand.colors.white, brand.fonts.bold, [140, 310])
  rise(nx, 0.2)
  rise(nt, 0.35)
  // YouTube end-screen element safe areas (video + subscribe), as guides
  var g1 = box(es, 'GUIDE video element', 760, 428, [1360, 640], hex(brand.colors.signal), 16)
  var g2 = box(es, 'GUIDE subscribe element', 260, 260, [420, 700], hex(brand.colors.signal), 130)
  g1.guideLayer = true
  g2.guideLayer = true

  var aep = new File(file.parent.fsName + '/' + file.parent.name + '.aep')
  app.project.save(aep)
  app.endUndoGroup()
  alert('Built ' + (data.lowerThirds.length + data.motion.length + 2) + ' comps.\nSaved ' + aep.fsName)
})()
