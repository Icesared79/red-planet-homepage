/* Resolves the Red Planet component namespace.
   1) already on window  2) the compiled _ds_bundle.js  3) fallback: transpile component sources in-browser (needs Babel). */
(function () {
  var FILES = ['core/Icon', 'core/Eyebrow', 'actions/Button', 'forms/Input', 'forms/Select', 'navigation/Tabs', 'navigation/TopBar', 'shell/SidebarShell', 'data/DataTable', 'data/Metric', 'charts/RunChart', 'charts/TrendChart', 'status/Badge', 'status/StatusIndicator', 'surfaces/Card', 'surfaces/Panel', 'surfaces/Section', 'overlays/Drawer', 'feedback/EmptyState', 'geo/MapFrame', 'diagrams/FlowDiagram'];
  function find() {
    if (window.RedPlanetDS) return window.RedPlanetDS;
    var keys = Object.keys(window);
    for (var i = 0; i < keys.length; i++) {
      try { var v = window[keys[i]]; if (v && typeof v === 'object' && v.Button && v.StatusIndicator && v.FlowDiagram) return v; } catch (e) {}
    }
    return null;
  }
  function script(src) {
    return new Promise(function (res) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  }
  window.loadDS = async function (root) {
    root = root || './';
    var ns = find(); if (ns) return ns;
    await script(root + '_ds_bundle.js');
    ns = find(); if (ns) return ns;
    var srcs = await Promise.all(FILES.map(function (f) { return fetch(root + 'components/' + f + '.jsx').then(function (r) { return r.text(); }); }));
    var body = 'var out = {};\n';
    srcs.forEach(function (src) {
      var names = Array.from(src.matchAll(/^export function (\w+)/mg)).map(function (m) { return m[1]; });
      var code = src.replace(/^import .*$/mg, '').replace(/^export function/mg, 'function');
      body += 'Object.assign(out, (function(){\n' + code + '\nreturn {' + names.join(',') + '};})());\n';
    });
    var js = window.Babel.transform('(function(React){' + body + 'return out;})', { presets: ['react'] }).code;
    ns = (0, eval)(js)(window.React);
    window.RedPlanetDS = ns;
    return ns;
  };
})();
