/*!
 * Twocales.IA — Cerebro digital interactivo
 * Canvas 2D. Sin dependencias. Sin build step.
 *
 *   const brain = new TwocalesBrain(document.querySelector('.tw-brain'), { contour: 'suave' });
 *   brain.destroy();
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    // --- variante de contorno: 'trazado' | 'suave' | 'ninguno'
    contour: 'suave',
    // --- interaccion: 'magnet' (iman de proximidad) | 'cascade' (activacion en cascada)
    interaction: 'magnet',
    // --- 0..100. Frecuencia de pulsos y brillo general. 35-50 recomendado en produccion.
    intensity: 40,
    // --- 50..150 (%). Numero de nodos. 100-120 recomendado en produccion.
    density: 100,
    // --- elemento sobre el que se centra el cerebro. Si es null, se centra en el contenedor.
    stage: null,
    // --- etiquetas contextuales que aparecen al posarse sobre un nodo primario
    labels: ['AI AGENT', 'WORKFLOW', 'AUTOMATION', 'CRM', 'API', 'CHATBOT', 'DATA', 'WEB', 'INTEGRATION', 'WHATSAPP', 'N8N'],
    showLabels: true,
    // --- geometria y rendimiento
    step: { desktop: 0.062, tablet: 0.08, mobile: 0.11 },
    brainRatio: 0.72,
    maxBrainW: 1080,
    connect: { maxDist: 0.070, k: [5, 3, 2], prob: 0.8, crossMidline: 0.12 },
    cursor: { radius: 200, hover: 24, pull: 10, cascadeDelay: 0.075, touchHold: 1.7 },
    idle: { amp: 2.4, breath: 0.06 },
    pulse: { every: 1.45, speed: 2.2, hops: 6 },
    // --- paleta Twocales.IA
    col: { indigo: [116, 102, 240], amber: [240, 169, 62], stone: [139, 141, 152], cream: [247, 244, 238] }
  };

  // Silueta cerebral, hemisferio derecho, normalizada: x 0..1, y -1..1
  var CEREB = [[0.04,-1.00],[0.34,-0.96],[0.60,-0.86],[0.80,-0.67],[0.93,-0.42],[1.00,-0.14],[1.00,0.10],[0.96,0.30],[0.88,0.44],[0.74,0.52],[0.56,0.54],[0.36,0.48],[0.20,0.38],[0.08,0.26]];
  var CBELL = [[0.05,0.52],[0.26,0.50],[0.44,0.56],[0.55,0.68],[0.52,0.80],[0.36,0.88],[0.16,0.90],[0.05,0.84]];
  var STEM  = [[0.05,0.28],[0.075,0.55],[0.085,0.78],[0.065,1.00]];
  var ARCS = [
    [[0.06,-0.84],[0.30,-0.80],[0.52,-0.68],[0.68,-0.50]],
    [[0.07,-0.62],[0.33,-0.57],[0.58,-0.44],[0.76,-0.24]],
    [[0.07,-0.38],[0.35,-0.33],[0.62,-0.19],[0.82,0.02]],
    [[0.08,-0.14],[0.36,-0.08],[0.64,0.06],[0.84,0.24]],
    [[0.09,0.10],[0.34,0.17],[0.58,0.30],[0.74,0.44]],
    [[0.14,0.28],[0.30,0.34],[0.48,0.40],[0.64,0.47]],
    [[0.30,-0.90],[0.46,-0.80],[0.64,-0.64],[0.78,-0.44]],
    [[0.20,-0.52],[0.44,-0.46],[0.66,-0.32],[0.86,-0.12]],
    [[0.08,0.58],[0.26,0.57],[0.42,0.62],[0.52,0.70]],
    [[0.08,0.70],[0.24,0.70],[0.38,0.74],[0.46,0.80]]
  ];

  function merge(base, extra) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    if (extra) for (k in extra) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base[k] && typeof base[k] === 'object') out[k] = merge(base[k], extra[k]);
      else out[k] = extra[k];
    }
    return out;
  }

  function TwocalesBrain(container, options) {
    if (!container) throw new Error('TwocalesBrain: falta el contenedor.');
    this.o = merge(DEFAULTS, options);
    this.box = container;
    this.stage = this.o.stage ? (typeof this.o.stage === 'string' ? container.querySelector(this.o.stage) : this.o.stage) : null;

    var c = document.createElement('canvas');
    c.className = 'tw-brain-canvas';
    c.setAttribute('aria-hidden', 'true');
    container.insertBefore(c, container.firstChild);
    this.canvas = c;

    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mode = this.o.interaction;
    this.t = 0; this.last = 0; this.nextPulse = 1.2;
    this.pointer = { x: -9999, y: -9999, on: false, hold: 0 };
    this.nodes = []; this.edges = []; this.adj = []; this.pulses = []; this.focus = -1; this.waves = null;
    this.visible = true; this.raf = null;

    var self = this;
    this._move = function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.pointer.x = e.clientX - r.left;
      self.pointer.y = e.clientY - r.top;
      self.pointer.on = true;
      self.pointer.hold = e.pointerType === 'mouse' ? 0 : self.o.cursor.touchHold;
    };
    this._leave = function () { self.pointer.on = false; self.pointer.hold = 0; };
    this._vis = function () { self.run(self.visible && !document.hidden); };
    this._tick = function (ts) {
      self.raf = requestAnimationFrame(self._tick);
      var dt = Math.min(0.05, (ts - self.last) / 1000) || 0.016;
      self.last = ts; self.t += dt;
      self.step(dt); self.draw();
    };

    container.addEventListener('pointermove', this._move, { passive: true });
    container.addEventListener('pointerdown', this._move, { passive: true });
    container.addEventListener('pointerleave', this._leave);
    document.addEventListener('visibilitychange', this._vis);

    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(function () {
        if (self._roRaf) return;
        self._roRaf = requestAnimationFrame(function () { self._roRaf = 0; self.resize(); });
      });
      this.ro.observe(container);
    } else {
      this._win = function () { self.resize(); };
      window.addEventListener('resize', this._win);
    }
    if (window.IntersectionObserver) {
      this.io = new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        self.run(self.visible && !document.hidden);
      }, { threshold: 0.01 });
      this.io.observe(container);
    }

    this.resize();
    this.run(true);
  }

  TwocalesBrain.prototype.destroy = function () {
    this.run(false);
    this.box.removeEventListener('pointermove', this._move);
    this.box.removeEventListener('pointerdown', this._move);
    this.box.removeEventListener('pointerleave', this._leave);
    document.removeEventListener('visibilitychange', this._vis);
    if (this.ro) this.ro.disconnect();
    if (this.io) this.io.disconnect();
    if (this._win) window.removeEventListener('resize', this._win);
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  };

  TwocalesBrain.prototype.set = function (key, value) {
    this.o[key] = value;
    if (key === 'interaction') { this.mode = value; this.waves = null; }
    if (key === 'contour' || key === 'density') this.resize();
  };

  TwocalesBrain.prototype.run = function (on) {
    if (on && !this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this._tick); }
    else if (!on && this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  };

  TwocalesBrain.prototype.resize = function () {
    var w = this.box.clientWidth;
    if (!w) return;
    var o = this.o;
    var bw = Math.min(w * (w < 640 ? 0.94 : o.brainRatio), o.maxBrainW);
    if (this.stage) {
      var need = Math.round(bw * 0.8 * 1.06);
      var cur = parseFloat(this.stage.style.minHeight);
      if (isNaN(cur) || Math.abs(cur - need) > 2) this.stage.style.minHeight = need + 'px';
    }
    var h = this.box.clientHeight;
    if (!h) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
    var cx = w * 0.5, cy = h * 0.5;
    if (this.stage) {
      var br = this.box.getBoundingClientRect(), sr = this.stage.getBoundingClientRect();
      cx = sr.left - br.left + sr.width * 0.5;
      cy = sr.top - br.top + sr.height * 0.5;
    }
    this.build(w, bw, cx, cy);
  };

  TwocalesBrain.prototype.inPoly = function (p, x, y) {
    var hit = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      var xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) hit = !hit;
    }
    return hit;
  };

  TwocalesBrain.prototype.inside = function (x, y) {
    return this.inPoly(CEREB, x, y) || this.inPoly(CBELL, x, y) || (x < 0.1 && y > 0.28 && y < 1.0);
  };

  TwocalesBrain.prototype.densify = function (p, sub) {
    var at = function (i) { return p[Math.max(0, Math.min(p.length - 1, i))]; };
    var out = [];
    for (var i = 0; i < p.length - 1; i++) {
      var a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2);
      for (var s = 0; s < sub; s++) {
        var t = s / sub, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * b[0] + (-a[0] + c[0]) * t + (2 * a[0] - 5 * b[0] + 4 * c[0] - d[0]) * t2 + (-a[0] + 3 * b[0] - 3 * c[0] + d[0]) * t3),
          0.5 * (2 * b[1] + (-a[1] + c[1]) * t + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 + (-a[1] + 3 * b[1] - 3 * c[1] + d[1]) * t3)
        ]);
      }
    }
    out.push(p[p.length - 1]);
    return out;
  };

  TwocalesBrain.prototype.resample = function (p, step) {
    var d = this.densify(p, 16), out = [d[0]], acc = 0;
    for (var i = 1; i < d.length; i++) {
      acc += Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]);
      if (acc >= step) { out.push(d[i]); acc = 0; }
    }
    return out;
  };

  TwocalesBrain.prototype.build = function (w, bw, cx, cy) {
    var o = this.o;
    var mobile = w < 640, tablet = w < 1024;
    var dens = (o.density || 100) / 100;
    var step = (mobile ? o.step.mobile : tablet ? o.step.tablet : o.step.desktop) / dens;
    var bh = bw * 0.80, ux = bw * 0.5, uy = bh * 0.5;
    var nodes = [], chains = [];

    function push(nx, ny, tier, jit, rs) {
      var x = nx + (Math.random() - 0.5) * jit, y = ny + (Math.random() - 0.5) * jit;
      var z = 1 - Math.pow(Math.min(1, Math.abs(x)), 1.35) * 0.78 + (Math.random() - 0.5) * 0.16;
      z = Math.max(0.1, Math.min(1, z));
      var sc = rs || 1;
      nodes.push({
        x0: cx + x * ux, y0: cy + y * uy, x: cx + x * ux, y: cy + y * uy,
        nx: x, tier: tier, z: z,
        r: (tier === 0 ? 2.8 : tier === 1 ? 1.4 : 0.82) * sc * (0.7 + z * 0.5),
        a: (tier === 0 ? 1 : tier === 1 ? 0.8 : 0.3) * (0.5 + z * 0.58),
        ph: Math.random() * 6.283, ph2: Math.random() * 6.283,
        fq: 0.15 + Math.random() * 0.28, act: 0, tag: null
      });
      return nodes.length - 1;
    }

    var cm = o.contour || 'suave';
    var cb = cm === 'trazado' ? 1.8 : cm === 'suave' ? 0.5 : 0.14;
    var cj = cm === 'trazado' ? 0.007 : cm === 'suave' ? 0.022 : 0.038;
    var dust = cm === 'ninguno';
    var strokes = [
      { p: CEREB, s: 0.55, b: cb, rs: dust ? 0.8 : 0.85, jit: cj, wav: 0.006, dust: dust },
      { p: CBELL, s: 0.6, b: cb * 0.9, rs: dust ? 0.8 : 0.85, jit: cj, wav: 0.01, dust: dust },
      { p: STEM, s: 0.9, b: 1.4, rs: 0.9, jit: 0.01, wav: 0 }
    ];
    for (var q = 0; q < ARCS.length; q++) strokes.push({ p: ARCS[q], s: 0.95, b: 1.15, rs: 0.95, jit: 0.011, wav: 0.028, spur: true });

    for (var si = 0; si < strokes.length; si++) {
      var st = strokes[si];
      var pts = this.resample(st.p, step * st.s);
      for (var k = 0; k < 2; k++) {
        var side = k === 0 ? 1 : -1;
        var ph = Math.random() * 6.283;
        var idx = [];
        for (var i = 0; i < pts.length; i++) {
          var pa = pts[Math.max(0, i - 1)], pb = pts[Math.min(pts.length - 1, i + 1)];
          var tx = pb[0] - pa[0], ty = pb[1] - pa[1];
          var tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
          var off = st.wav ? Math.sin(i * 0.82 + ph) * st.wav : 0;
          var qx = pts[i][0] - ty * off, qy = pts[i][1] + tx * off;
          var end = i === 0 || i === pts.length - 1;
          var tier = end ? (Math.random() < 0.4 ? 0 : 1) : (Math.random() < 0.045 ? 0 : 1);
          if (st.dust) tier = Math.random() < 0.12 ? 1 : 2;
          var here = push(qx * side, qy, tier, st.jit, st.rs);
          idx.push(here);
          if (st.spur && !end && Math.random() < 0.32) {
            var dir = Math.random() < 0.5 ? 1 : -1;
            var ax1 = qx - ty * 0.05 * dir, ay1 = qy + tx * 0.05 * dir;
            var ax2 = qx - ty * 0.092 * dir, ay2 = qy + tx * 0.092 * dir;
            if (this.inside(Math.abs(ax1), ay1) && this.inside(Math.abs(ax2), ay2) && Math.abs(ax2) > 0.06) {
              var s1 = push(ax1 * side, ay1, 2, 0.009, 0.95);
              var s2 = push(ax2 * side, ay2, 2, 0.011, 0.85);
              chains.push({ idx: [here, s1, s2], b: 0.95 });
            }
          }
        }
        chains.push({ idx: idx, b: st.b });
      }
    }

    var fill = Math.round(nodes.length * 0.55), guard = 0;
    for (var f = 0; f < fill && guard < fill * 30;) {
      guard++;
      var rx = Math.random(), ry = Math.random() * 2.04 - 1.02;
      if (!this.inside(rx, ry)) continue;
      if (rx < (ry < 0.5 ? 0.07 : 0.035)) continue;
      push(rx * (Math.random() < 0.5 ? -1 : 1), ry, 2, 0.008, 1);
      f++;
    }

    var maxD = o.connect.maxDist * bw, cell = maxD;
    var grid = new Map();
    for (var n1 = 0; n1 < nodes.length; n1++) {
      var kk = ((nodes[n1].x0 / cell) | 0) + ':' + ((nodes[n1].y0 / cell) | 0);
      if (!grid.has(kk)) grid.set(kk, []);
      grid.get(kk).push(n1);
    }
    this.grid = grid; this.cell = cell;

    var seen = new Set(), edges = [], adj = [];
    for (var z1 = 0; z1 < nodes.length; z1++) adj.push([]);
    function add(a, b, boost) {
      if (a === b) return false;
      var id = a < b ? a + '-' + b : b + '-' + a;
      if (seen.has(id)) return false;
      seen.add(id);
      var az = (nodes[a].z + nodes[b].z) * 0.5;
      edges.push({ a: a, b: b, base: (0.055 + 0.105 * az) * boost });
      adj[a].push(b); adj[b].push(a);
      return true;
    }
    for (var ci = 0; ci < chains.length; ci++) for (var cj2 = 1; cj2 < chains[ci].idx.length; cj2++) add(chains[ci].idx[cj2 - 1], chains[ci].idx[cj2], chains[ci].b);

    for (var i2 = 0; i2 < nodes.length; i2++) {
      var nd = nodes[i2], gi = (nd.x0 / cell) | 0, gj = (nd.y0 / cell) | 0, cand = [];
      for (var a2 = -1; a2 <= 1; a2++) for (var b2 = -1; b2 <= 1; b2++) {
        var arr = grid.get((gi + a2) + ':' + (gj + b2));
        if (!arr) continue;
        for (var p2 = 0; p2 < arr.length; p2++) {
          var j2 = arr[p2];
          if (j2 === i2) continue;
          var dd = Math.hypot(nodes[j2].x0 - nd.x0, nodes[j2].y0 - nd.y0);
          if (dd < maxD) cand.push([dd, j2]);
        }
      }
      cand.sort(function (p, q2) { return p[0] - q2[0]; });
      var kmax = o.connect.k[nd.tier], made = adj[i2].length;
      for (var c2 = 0; c2 < cand.length && made < kmax; c2++) {
        var jj = cand[c2][1], dj = cand[c2][0];
        if ((nd.nx < 0) !== (nodes[jj].nx < 0) && Math.random() > o.connect.crossMidline) continue;
        if (Math.random() > o.connect.prob * (1 - (dj / maxD) * 0.6)) continue;
        if (add(i2, jj, 0.55)) made++;
      }
    }

    var prim = [];
    for (var t1 = 0; t1 < nodes.length; t1++) if (nodes[t1].tier === 0 && adj[t1].length > 1) prim.push(t1);
    if (prim.length && o.labels && o.labels.length) {
      var chosen = [prim[(Math.random() * prim.length) | 0]];
      while (chosen.length < Math.min(o.labels.length, prim.length)) {
        var best = -1, bestD = -1;
        for (var pq = 0; pq < prim.length; pq++) {
          var pi = prim[pq];
          if (chosen.indexOf(pi) >= 0) continue;
          var md = Infinity;
          for (var cq = 0; cq < chosen.length; cq++) md = Math.min(md, Math.hypot(nodes[pi].x0 - nodes[chosen[cq]].x0, nodes[pi].y0 - nodes[chosen[cq]].y0));
          if (md > bestD) { bestD = md; best = pi; }
        }
        if (best < 0) break;
        chosen.push(best);
      }
      for (var ch = 0; ch < chosen.length; ch++) nodes[chosen[ch]].tag = o.labels[ch % o.labels.length];
    }

    this.nodes = nodes; this.edges = edges; this.adj = adj;
    this.pulses = []; this.waves = null; this.focus = -1;
  };

  TwocalesBrain.prototype.near = function (x, y, radius) {
    var out = [], cell = this.cell, grid = this.grid;
    if (!grid) return out;
    var span = Math.ceil(radius / cell), gi = (x / cell) | 0, gj = (y / cell) | 0;
    for (var a = -span; a <= span; a++) for (var b = -span; b <= span; b++) {
      var arr = grid.get((gi + a) + ':' + (gj + b));
      if (arr) for (var q = 0; q < arr.length; q++) out.push(arr[q]);
    }
    return out;
  };

  TwocalesBrain.prototype.buildWaves = function (focus) {
    var d = this.o.cursor.cascadeDelay, m = new Map();
    m.set(focus, { v: 1, at: this.t });
    var levels = [[1, 0.64], [2, 0.32], [3, 0.14]], frontier = [focus];
    for (var l = 0; l < levels.length; l++) {
      var next = [];
      for (var i = 0; i < frontier.length; i++) {
        var ns = this.adj[frontier[i]];
        for (var j = 0; j < ns.length; j++) {
          if (m.has(ns[j])) continue;
          m.set(ns[j], { v: levels[l][1], at: this.t + levels[l][0] * d });
          next.push(ns[j]);
        }
      }
      frontier = next;
    }
    return m;
  };

  TwocalesBrain.prototype.spawnPulse = function (from) {
    var adj = this.adj;
    if (!adj || !adj.length) return;
    var cur = from != null && from >= 0 ? from : (Math.random() * this.nodes.length) | 0;
    var path = [cur];
    for (var i = 0; i < this.o.pulse.hops; i++) {
      var ns = adj[cur];
      if (!ns || !ns.length) break;
      var nx = ns[(Math.random() * ns.length) | 0], tries = 0;
      while (path.indexOf(nx) >= 0 && tries++ < 5) nx = ns[(Math.random() * ns.length) | 0];
      if (path.indexOf(nx) >= 0) break;
      path.push(nx); cur = nx;
    }
    if (path.length < 3) return;
    this.pulses.push({ path: path, t: 0, sp: this.o.pulse.speed * (0.8 + Math.random() * 0.5) });
  };

  TwocalesBrain.prototype.step = function (dt) {
    var o = this.o, N = this.nodes;
    if (!N.length) return;
    var I = o.intensity / 40, P = this.pointer;
    if (P.hold > 0) { P.hold -= dt; if (P.hold <= 0) P.on = false; }

    var focus = -1;
    if (P.on) {
      var bd = o.cursor.hover * o.cursor.hover, cands = this.near(P.x, P.y, o.cursor.hover);
      for (var q = 0; q < cands.length; q++) {
        var nn = N[cands[q]], dx0 = nn.x - P.x, dy0 = nn.y - P.y, d2 = dx0 * dx0 + dy0 * dy0;
        if (d2 < bd) { bd = d2; focus = cands[q]; }
      }
    }
    if (this.mode === 'cascade' && focus !== this.focus) {
      this.waves = focus >= 0 ? this.buildWaves(focus) : null;
      if (focus >= 0 && !this.reduced) this.spawnPulse(focus);
    }
    this.focus = focus;

    var R = o.cursor.radius, amp = this.reduced ? 0 : o.idle.amp, tgt = new Map();
    if (P.on) {
      var inR = this.near(P.x, P.y, R);
      for (var w = 0; w < inR.length; w++) {
        var ii = inR[w], nq = N[ii], dq = Math.hypot(nq.x0 - P.x, nq.y0 - P.y);
        if (dq > R) continue;
        var ff = 1 - dq / R;
        tgt.set(ii, this.mode === 'magnet' ? ff * ff * 0.88 : ff * ff * 0.18);
      }
    }
    if (this.mode === 'cascade' && this.waves) {
      var self = this;
      this.waves.forEach(function (wv, i) { if (self.t >= wv.at) tgt.set(i, Math.max(tgt.get(i) || 0, wv.v)); });
    }

    for (var i2 = 0; i2 < N.length; i2++) {
      var n = N[i2], want = tgt.get(i2) || 0;
      n.act += (want - n.act) * (1 - Math.exp(-dt * (want > n.act ? 9 : 3.1)));
      var a = amp * (0.5 + n.z * 0.8);
      var x = n.x0 + Math.sin(this.t * n.fq + n.ph) * a + Math.cos(this.t * n.fq * 0.62 + n.ph2) * a * 0.55;
      var y = n.y0 + Math.cos(this.t * n.fq * 0.87 + n.ph) * a * 0.9;
      if (this.mode === 'magnet' && n.act > 0.01 && !this.reduced) {
        var dx = P.x - n.x0, dy = P.y - n.y0, d = Math.hypot(dx, dy) || 1;
        var pull = n.act * o.cursor.pull * (0.4 + n.z * 0.7);
        x += (dx / d) * pull; y += (dy / d) * pull;
      }
      n.x = x; n.y = y;
    }

    if (!this.reduced) {
      this.nextPulse -= dt * I;
      if (this.nextPulse <= 0) { this.nextPulse = o.pulse.every * (0.6 + Math.random()); this.spawnPulse(-1); }
      for (var p = this.pulses.length - 1; p >= 0; p--) {
        this.pulses[p].t += dt * this.pulses[p].sp;
        if (this.pulses[p].t >= this.pulses[p].path.length - 1) this.pulses.splice(p, 1);
      }
    }
  };

  TwocalesBrain.prototype.draw = function () {
    var ctx = this.ctx, o = this.o, N = this.nodes;
    if (!ctx || !N.length) return;
    ctx.clearRect(0, 0, this.w, this.h);
    var I = o.intensity / 40, LV = 5, MAXA = 0.8, i, lv;

    var calm = [], hot = [];
    for (i = 0; i < LV; i++) { calm.push([]); hot.push([]); }
    for (var e = 0; e < this.edges.length; e++) {
      var ed = this.edges[e], a = N[ed.a], b = N[ed.b];
      var act = (a.act + b.act) * 0.5;
      var alpha = Math.min(MAXA, ed.base * (0.85 + 0.5 * I) + act * 0.5);
      lv = Math.min(LV - 1, (alpha / MAXA * LV) | 0);
      (act > 0.34 ? hot : calm)[lv].push(a.x, a.y, b.x, b.y);
    }
    for (var pass = 0; pass < 2; pass++) {
      var src = pass === 0 ? calm : hot, col = pass === 0 ? o.col.indigo : o.col.amber;
      ctx.lineWidth = pass === 0 ? 0.8 : 1.2;
      for (lv = 0; lv < LV; lv++) {
        var seg = src[lv];
        if (!seg.length) continue;
        ctx.beginPath();
        for (i = 0; i < seg.length; i += 4) { ctx.moveTo(seg[i], seg[i + 1]); ctx.lineTo(seg[i + 2], seg[i + 3]); }
        ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (((lv + 0.6) / LV) * MAXA).toFixed(3) + ')';
        ctx.stroke();
      }
    }

    ctx.lineCap = 'round';
    for (var q = 0; q < this.pulses.length; q++) {
      var pl = this.pulses[q];
      var sg = Math.min(pl.path.length - 2, pl.t | 0), fr = pl.t - (pl.t | 0);
      var pa = N[pl.path[sg]], pb = N[pl.path[sg + 1]];
      if (!pa || !pb) continue;
      var px = pa.x + (pb.x - pa.x) * fr, py = pa.y + (pb.y - pa.y) * fr;
      var tf = Math.max(0, fr - 0.36);
      var tx = pa.x + (pb.x - pa.x) * tf, ty = pa.y + (pb.y - pa.y) * tf;
      var fade = Math.sin(Math.min(1, pl.t / (pl.path.length - 1)) * Math.PI);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(240,169,62,' + (0.55 * fade).toFixed(3) + ')';
      ctx.lineWidth = 1.6; ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 2, 0, 6.283);
      ctx.fillStyle = 'rgba(247,244,238,' + (0.9 * fade).toFixed(3) + ')';
      ctx.fill();
    }
    ctx.lineCap = 'butt';

    var fam = [o.col.indigo, o.col.stone, o.col.cream, o.col.amber], bins = [];
    for (var fi = 0; fi < 4; fi++) { var row = []; for (lv = 0; lv < LV; lv++) row.push([]); bins.push(row); }
    for (var nq = 0; nq < N.length; nq++) {
      var n = N[nq];
      var br = this.reduced ? 1 : 1 + Math.sin(this.t * n.fq * 1.6 + n.ph2) * o.idle.breath;
      var r = n.r * br * (1 + n.act * (n.tier === 0 ? 1.1 : 0.8));
      var al = Math.min(1, n.a * (0.82 + 0.3 * I) + n.act * 0.55);
      var fam_i = n.act > 0.45 ? 3 : n.tier === 0 ? 2 : n.tier === 1 ? 0 : 1;
      bins[fam_i][Math.min(LV - 1, (al * LV) | 0)].push(n.x, n.y, r);
    }
    for (var f2 = 0; f2 < 4; f2++) for (lv = 0; lv < LV; lv++) {
      var arr = bins[f2][lv];
      if (!arr.length) continue;
      ctx.beginPath();
      for (i = 0; i < arr.length; i += 3) { ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]); ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, 6.283); }
      ctx.fillStyle = 'rgba(' + fam[f2][0] + ',' + fam[f2][1] + ',' + fam[f2][2] + ',' + ((lv + 0.6) / LV).toFixed(3) + ')';
      ctx.fill();
    }

    if (this.focus >= 0 && o.showLabels) {
      var fn = N[this.focus];
      if (fn.tag && fn.act > 0.2) {
        var la = Math.min(1, (fn.act - 0.2) / 0.5);
        var dir = fn.x > this.w * 0.5 ? 1 : -1;
        var lx = fn.x + dir * 28, ly = fn.y - 22;
        ctx.beginPath(); ctx.moveTo(fn.x + dir * 7, fn.y - 5); ctx.lineTo(lx - dir * 5, ly + 5);
        ctx.strokeStyle = 'rgba(240,169,62,' + (0.6 * la).toFixed(3) + ')';
        ctx.lineWidth = 0.8; ctx.stroke();
        ctx.font = '600 12px "Space Grotesk", system-ui, sans-serif';
        try { ctx.letterSpacing = '0.16em'; } catch (err) { }
        ctx.textAlign = dir > 0 ? 'left' : 'right';
        ctx.fillStyle = 'rgba(240,169,62,' + la.toFixed(3) + ')';
        ctx.fillText(fn.tag, lx, ly);
        try { ctx.letterSpacing = '0px'; } catch (err) { }
        ctx.textAlign = 'left';
      }
    }
  };

  global.TwocalesBrain = TwocalesBrain;
})(window);
