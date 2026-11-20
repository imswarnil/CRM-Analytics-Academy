// CRM Analytics Academy · every lesson's thumbnail in one run
//
// File → Scripts → Browse… → this file (or from a terminal:
//   osascript -e 'tell application id "com.adobe.Photoshop" to do javascript file "…/thumbnails-all.jsx"')
// Walks studio/out/<section>/<lesson>/thumbnail.json (run
// `node studio/lesson-to-shots.mjs --all` first) and writes thumbnail.psd +
// thumbnail.png beside each. No dialogs; a log is written to
// studio/out/thumbnails.log.
var CRMA_BATCH = true
#include "thumbnail.jsx"

(function () {
  var out = new Folder(new File($.fileName).parent.parent.fsName + '/out')
  var log = []
  app.displayDialogs = DialogModes.NO
  var sections = out.getFiles(function (f) { return f instanceof Folder && f.name !== 'motion' })
  for (var i = 0; i < sections.length; i++) {
    var lessons = sections[i].getFiles(function (f) { return f instanceof Folder })
    for (var j = 0; j < lessons.length; j++) {
      var json = new File(lessons[j].fsName + '/thumbnail.json')
      if (!json.exists) continue
      try {
        makeThumb(json, true)
        log.push('ok   ' + sections[i].name + '/' + lessons[j].name)
      } catch (e) {
        log.push('FAIL ' + sections[i].name + '/' + lessons[j].name + ' : ' + e)
      }
    }
  }
  var lf = new File(out.fsName + '/thumbnails.log')
  lf.open('w')
  lf.write(log.join('\n'))
  lf.close()
})()
