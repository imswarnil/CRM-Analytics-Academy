// CRM Analytics Academy · YouTube thumbnail from a lesson
//
// File → Scripts → Browse… → this file → pick
// studio/out/<section>/<lesson>/thumbnail.json.
//
// Builds a 1280×720 layered PSD in the channel's one style — navy field,
// faint grid, section label, the lesson title huge in two lines, a blue
// accent bar and a "PRO" tag when the lesson is Pro — then saves
// thumbnail.psd and thumbnail.png beside the JSON. Every element is its own
// layer, so swapping in a screenshot or your face cut-out is a drag and drop:
// put it on the "PHOTO goes here" layer's position.

(function () {
  var file = File.openDialog('Choose the lesson\'s thumbnail.json', 'JSON:*.json')
  if (!file) return
  file.encoding = 'UTF-8'
  file.open('r')
  var raw = file.read()
  file.close()
  var t = (typeof JSON !== 'undefined') ? JSON.parse(raw) : eval('(' + raw + ')')

  var brandFile = new File(file.parent.parent.parent.parent.fsName + '/brand.json')
  brandFile.open('r')
  var brandRaw = brandFile.read()
  brandFile.close()
  var brand = (typeof JSON !== 'undefined') ? JSON.parse(brandRaw) : eval('(' + brandRaw + ')')

  function rgb(h) {
    var c = new SolidColor()
    h = h.replace('#', '')
    c.rgb.red = parseInt(h.substr(0, 2), 16)
    c.rgb.green = parseInt(h.substr(2, 2), 16)
    c.rgb.blue = parseInt(h.substr(4, 2), 16)
    return c
  }
  function rect(doc, name, x, y, w, h, color) {
    var l = doc.artLayers.add()
    l.name = name
    doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])
    doc.selection.fill(rgb(color))
    doc.selection.deselect()
    return l
  }
  function txt(doc, name, contents, x, y, size, color, font) {
    var l = doc.artLayers.add()
    l.kind = LayerKind.TEXT
    l.name = name
    var ti = l.textItem
    ti.contents = contents
    ti.size = new UnitValue(size, 'px')
    ti.color = rgb(color)
    ti.font = font
    ti.position = [new UnitValue(x, 'px'), new UnitValue(y, 'px')]
    return l
  }

  var prefs = app.preferences.rulerUnits
  app.preferences.rulerUnits = Units.PIXELS
  var W = brand.thumbnail.width
  var H = brand.thumbnail.height
  var doc = app.documents.add(W, H, 72, 'Thumbnail', NewDocumentMode.RGB, DocumentFill.WHITE)

  rect(doc, 'Navy field', 0, 0, W, H, brand.colors.navy)
  for (var g = 0; g < W; g += 64) {
    var gl = rect(doc, 'grid', g, 0, 1, H, brand.colors.frost)
    gl.opacity = 10
  }
  rect(doc, 'Accent bar', 64, 150, 14, 330, brand.colors.signalBright)
  txt(doc, 'Section', t.section.toUpperCase(), 104, 180, 34, brand.colors.frost, brand.fonts.bold)

  // Split the title into at most two lines of roughly equal length.
  var words = t.title.split(' ')
  var half = Math.ceil(t.title.length / 2)
  var a = ''
  var b = ''
  for (var i = 0; i < words.length; i++) {
    if ((a + ' ' + words[i]).length <= half || !a) a = (a ? a + ' ' : '') + words[i]
    else b = (b ? b + ' ' : '') + words[i]
  }
  var size = Math.max(72, Math.min(120, Math.floor(1050 / Math.max(a.length, b.length) * 1.7)))
  txt(doc, 'Title line 1', a, 104, 310, size, brand.colors.white, brand.fonts.bold)
  if (b) txt(doc, 'Title line 2', b, 104, 310 + size * 1.05, size, brand.colors.signalBright, brand.fonts.bold)

  if (t.pro) {
    rect(doc, 'PRO tag', 104, 600, 150, 64, brand.colors.white)
    txt(doc, 'PRO', 'PRO', 128, 645, 40, brand.colors.navy, brand.fonts.bold)
  }
  var photo = rect(doc, 'PHOTO goes here (replace this layer)', 840, 120, 400, 480, brand.colors.navyDeep)
  photo.opacity = 60

  var dir = file.parent.fsName
  doc.saveAs(new File(dir + '/thumbnail.psd'), new PhotoshopSaveOptions(), true)
  var png = new ExportOptionsSaveForWeb()
  png.format = SaveDocumentType.PNG
  png.PNG8 = false
  doc.exportDocument(new File(dir + '/thumbnail.png'), ExportType.SAVEFORWEB, png)
  app.preferences.rulerUnits = prefs
  alert('Saved thumbnail.psd and thumbnail.png in\n' + dir)
})()
