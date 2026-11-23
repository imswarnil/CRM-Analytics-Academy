// CRMA Kit — a dockable After Effects panel (Window → CRMA Kit.jsx).
// Installed by `node studio/install-adobe.mjs`, which puts a one-line loader in
// After Effects' ScriptUI Panels folder pointing here, so edits to the kit
// show up the next time the panel opens.
//
//   Scene   pick a scene type, length and props → Create comp (into the open project)
//   Quick   add Dot, a colour reveal, a lower third or an icon to the ACTIVE comp at the playhead
#include "kit/lib.jsx"
#include "kit/scenes.jsx"
#include "kit/story.jsx"
#include "kit/concepts.jsx"
#include "kit/platform.jsx"
#include "kit/kinetic.jsx"
#include "kit/canvas.jsx"
#include "kit/film.jsx"

(function (thisObj) {
  function toSource(o) {
    // ExtendScript has toSource(); keep the props readable.
    return o.toSource().replace(/^\(|\)$/g, '');
  }
  function activeComp() {
    var c = app.project.activeItem;
    if (!(c instanceof CompItem)) {
      alert('Select a composition first.');
      return null;
    }
    return c;
  }
  function undo(name, fn) {
    app.beginUndoGroup(name);
    try {
      fn();
    } catch (e) {
      alert('CRMA Kit: ' + e.toString() + (e.line ? ' (line ' + e.line + ')' : ''));
    }
    app.endUndoGroup();
  }

  var w = thisObj instanceof Panel ? thisObj : new Window('palette', 'CRMA Kit', undefined, { resizeable: true });
  w.orientation = 'column';
  w.alignChildren = ['fill', 'top'];
  w.spacing = 8;
  w.margins = 10;

  var head = w.add('statictext', undefined, 'CRM Analytics Academy — motion kit');
  head.graphics.font = ScriptUI.newFont(head.graphics.font.name, 'BOLD', 13);

  // ---- scene comps ----
  var p1 = w.add('panel', undefined, 'New scene comp');
  p1.alignChildren = ['fill', 'top'];
  var labels = [];
  for (var i = 0; i < SCENES_INFO.length; i++) labels.push(SCENES_INFO[i].label);
  var type = p1.add('dropdownlist', undefined, labels);
  type.selection = 0;
  var row = p1.add('group');
  row.add('statictext', undefined, 'Seconds');
  var secs = row.add('edittext', undefined, '6');
  secs.characters = 4;
  p1.add('statictext', undefined, 'Props (edit the text, keep the braces):');
  var props = p1.add('edittext', [0, 0, 300, 140], toSource(SCENES_INFO[0].props), { multiline: true, scrolling: true });
  type.onChange = function () {
    props.text = toSource(SCENES_INFO[type.selection.index].props);
  };
  var make = p1.add('button', undefined, 'Create comp');
  make.onClick = function () {
    undo('CRMA scene', function () {
      var info = SCENES_INFO[type.selection.index];
      var pr = eval('(' + props.text + ')');
      var comp = KIT.buildScene(info.type, pr, parseFloat(secs.text) || 6, KIT.folder('CRMA Comps'), info.label);
      comp.openInViewer();
    });
  };

  // ---- quick adds into the active comp ----
  var p2 = w.add('panel', undefined, 'Add to the active comp (at the playhead)');
  p2.alignChildren = ['fill', 'top'];
  var g1 = p2.add('group');
  var bDot = g1.add('button', undefined, 'The Bars');
  var bCap = g1.add('button', undefined, 'One Bar');
  var bReveal = g1.add('button', undefined, 'Colour reveal');
  var g2 = p2.add('group');
  var colors = g2.add('dropdownlist', undefined, ['navy', 'signal', 'ice', 'paper', 'navyDeep', 'white']);
  colors.selection = 0;
  var bLower = g2.add('button', undefined, 'Lower third');
  var g3 = p2.add('group');
  var icons = g3.add('dropdownlist', undefined, ['play', 'check', 'flame', 'badge', 'chat', 'brief', 'award', 'db', 'join', 'broom', 'out', 'code', 'link', 'share', 'spark']);
  icons.selection = 0;
  var bIcon = g3.add('button', undefined, 'Icon');

  bDot.onClick = function () {
    undo('CRMA Dot', function () {
      var c = activeComp();
      if (!c) return;
      var crew = KIT.crew(c, c.width / 2, c.height * 0.85, 0.8, { arm: true });
      KIT.springUp(crew, c.time, 0.2);
      for (var i = 0; i < crew.length; i++) KIT.blink(crew[i], [c.time + 1.2 + i * 0.3]);
    });
  };
  bCap.onClick = function () {
    undo('CRMA Dot', function () {
      var c = activeComp();
      if (!c) return;
      var b = KIT.bar(c, c.width / 2, c.height * 0.85, { w: 110, h: 260, color: 'signal', name: 'Big Blue' });
      KIT.springUp([b], c.time);
      KIT.blink(b, [c.time + 1.2]);
    });
  };
  bReveal.onClick = function () {
    undo('CRMA reveal', function () {
      var c = activeComp();
      if (!c) return;
      KIT.reveal(c, KIT.C[colors.selection.text], c.time);
    });
  };
  var g4 = p2.add('group');
  var bSweep = g4.add('button', undefined, 'Bars sweep');
  var bPush = g4.add('button', undefined, 'Push');
  bSweep.onClick = function () {
    undo('CRMA sweep', function () {
      var c = activeComp();
      if (c) KIT.barsWipe(c, KIT.C[colors.selection.text], c.time);
    });
  };
  bPush.onClick = function () {
    undo('CRMA push', function () {
      var c = activeComp();
      if (c) KIT.push(c, KIT.C[colors.selection.text], c.time + 0.45);
    });
  };
  bLower.onClick = function () {
    undo('CRMA lower third', function () {
      var c = activeComp();
      if (!c) return;
      SCENES.lowerThird(c, { name: 'Swarnil Singhai', role: 'CRM Analytics Academy' }, c.time, 4);
    });
  };
  bIcon.onClick = function () {
    undo('CRMA icon', function () {
      var c = activeComp();
      if (!c) return;
      KIT.pop(KIT.icon(c, icons.selection.text, c.width / 2, c.height / 2, 180), c.time);
    });
  };

  var tip = w.add('statictext', undefined, 'Or ask Claude: node studio/comp.mjs <type> \'{…}\'', { multiline: true });
  tip.graphics.foregroundColor = tip.graphics.newPen(tip.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);

  w.onResizing = w.onResize = function () {
    this.layout.resize();
  };
  if (w instanceof Window) {
    w.center();
    w.show();
  } else {
    w.layout.layout(true);
  }
}(this));
