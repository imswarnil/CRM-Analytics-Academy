// CRM Analytics Academy · drop the shot list onto a Premiere Pro sequence
//
// 1. Open (or create) the lesson's sequence and make it active.
// 2. File → Scripts → Run Script… (or the ExtendScript / UXP script runner)
//    → this file → pick studio/out/<section>/<lesson>/markers.json.
//
// Adds one marker per shot at its planned start time, spanning its planned
// length, named "N. Shot", with the screen path, on-screen text and the edit
// note in the marker comment. Colours: green = talking head, blue = screen
// recording, red = motion graphics (build it in After Effects first).
//
// Record against the teleprompter, drop takes under the markers, then nudge
// markers to the real cut: they are a plan, not a lock.

(function () {
  var seq = app.project.activeSequence
  if (!seq) {
    alert('Open the lesson\'s sequence first.')
    return
  }
  var file = File.openDialog('Choose the lesson\'s markers.json', 'JSON:*.json')
  if (!file) return
  file.encoding = 'UTF-8'
  file.open('r')
  var raw = file.read()
  file.close()
  var shots = (typeof JSON !== 'undefined') ? JSON.parse(raw) : eval('(' + raw + ')')

  for (var i = 0; i < shots.length; i++) {
    var s = shots[i]
    var m = seq.markers.createMarker(s.seconds)
    m.name = s.name
    m.comments = s.comment
    m.end = s.seconds + s.duration
    try { m.setColorByIndex(s.color) } catch (e) {}
  }
  alert('Added ' + shots.length + ' shot markers to "' + seq.name + '".')
})()
