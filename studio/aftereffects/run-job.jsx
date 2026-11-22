// Runs the job in studio/workspace/.job.json (written by studio/build-film.mjs
// or studio/comp.mjs) and writes the outcome to studio/workspace/.job.log.
// ExtendScript cannot take command-line arguments, hence the file.
#include "kit/lib.jsx"
#include "kit/scenes.jsx"
#include "kit/story.jsx"
#include "kit/concepts.jsx"
#include "kit/platform.jsx"
#include "kit/kinetic.jsx"
#include "kit/film.jsx"

(function () {
  var ws = KIT.root.fsName + '/workspace';
  var log = [];
  app.beginSuppressDialogs();
  app.beginUndoGroup('CRMA job');
  try {
    var job = KIT.readJSON(ws + '/.job.json');
    if (job.action === 'film') KIT.buildFilm(job, log);
    else if (job.action === 'comp') KIT.buildComp(job, log);
    else if (job.action === 'mogrt') KIT.exportMogrt(job, log);
    else throw new Error('Unknown action ' + job.action);
    log.push('OK');
  } catch (e) {
    log.push('ERROR ' + e.toString() + (e.line ? ' (line ' + e.line + ')' : '') + (e.fileName ? ' in ' + e.fileName : ''));
  }
  app.endUndoGroup();
  app.endSuppressDialogs(false);
  var f = new File(ws + '/.job.log');
  f.encoding = 'UTF-8';
  f.lineFeed = 'Unix';
  f.open('w');
  f.write(log.join('\n'));
  f.close();
}());
