/* =============================================================================
 * app.js — 脉动阵列错误传播模拟器（UI 层）· CONTRACT v1.1
 *
 * 依赖：window.SA.Model（由 js/model.js 提供，经典 <script> 先加载）
 * 本文件不实现仿真，只负责：参数装配 → SA.Model.simulate → 防御性读取 →
 * Canvas / DOM 渲染 → 播放控制 → 可测钩子。
 *
 * v1.1 关键点：
 *   · 一个 tile = N×N×N 方阵乘，K ≡ N（无 K 控件）
 *   · affectedPEs（阵列空间，dirty 传播）→ 阵列动画着色 / 口径对照右栏
 *   · affected（输出空间，数值比较）  → 输出热图边框 / p_pe 指标
 *   · metrics.masked → 完全掩蔽提示条；usedSeed → 种子显示
 *
 * 模块分区：
 *   §0  Utils       工具函数
 *   §1  State       状态与默认配置
 *   §2  Engine      模型加载、参数组装、仿真调用
 *   §3  Metrics     指标派生（S / Ŝ 按当前 λ 本地计算）
 *   §4  Render.Array   阵列动画 Canvas
 *   §5  Render.Matrix  输出矩阵 / 误差热图 / 悬停
 *   §6  Render.Tiling  分块重复视图
 *   §7  Render.Cards   指标卡与口径对照卡
 *   §8  Controls    控件绑定与状态回写
 *   §9  Animation   播放 / 暂停 / 单步
 *   §10 Hooks       window.__SA_APP
 *   §11 Boot        初始化与引擎轮询
 * ========================================================================== */
(function () {
  'use strict';

  /* =========================================================================
   * §0 Utils
   * ======================================================================= */
  var JS_FONT = '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif';
  var JS_MONO = '"Cascadia Mono", Consolas, ui-monospace, monospace';
  var TAU = Math.PI * 2;

  function $(id) { return document.getElementById(id); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function num(v) { return isNum(v) ? v : null; }
  function nowMs() {
    return (window.performance && typeof performance.now === 'function') ? performance.now() : Date.now();
  }
  function setTxt(id, text) {
    var el = $(id);
    if (el && el.textContent !== text) el.textContent = text;
  }
  function trimZero(s) {
    if (s.indexOf('.') < 0) return s;
    s = s.replace(/0+$/, '');
    if (s.charAt(s.length - 1) === '.') s = s.slice(0, -1);
    return s;
  }
  function fmtSig(v, sig) {
    if (!isNum(v)) return '—';
    if (v === 0) return '0';
    var a = Math.abs(v);
    if (a >= 1e-3 && a < 1e6) {
      var dec = clamp(sig - Math.floor(Math.log10(a)) - 1, 0, 8);
      return trimZero(v.toFixed(dec));
    }
    return trimZero(v.toExponential(Math.max(0, sig - 1)));
  }
  function fmtInt(v) { return isNum(v) ? String(Math.round(v)) : '—'; }
  function fmtFixed(v, d, fallback) { return isNum(v) ? v.toFixed(d) : (fallback || '—'); }
  /* 阵列格子 / 矩阵格子里的紧凑数字 */
  function shortNum(v, maxLen) {
    if (v === null || v === undefined) return '';
    if (!isNum(v)) return 'NaN';
    var a = Math.abs(v), s;
    if (a === 0) s = '0';
    else if (a >= 1000) s = v.toFixed(0);
    else if (a >= 10) s = v.toFixed(1);
    else if (a >= 1) s = v.toFixed(2);
    else if (a >= 0.01) s = v.toFixed(3);
    else s = v.toExponential(0);
    if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
    return s;
  }

  function mixc(a, b, t) {
    t = clamp(t, 0, 1);
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }
  function rgba(c, a) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a === undefined ? 1 : a) + ')';
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* devicePixelRatio 缩放，保证 Canvas 不发虚 */
  function ctxFor(canvas, w, h) {
    var dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
    var pw = Math.max(1, Math.round(w * dpr));
    var ph = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== pw) canvas.width = pw;
    if (canvas.height !== ph) canvas.height = ph;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function drawTri(ctx, x, y, dir, s, color) {
    ctx.beginPath();
    if (dir === 'right') {
      ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x - s, y + s);
    } else {
      ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y - s); ctx.lineTo(x, y + s);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* 单元格列表 → {set, list, bbox}；兼容 [[r,c],...] 与 [{r,c},...] */
  function cellMask(cellsObj, fallbackCells) {
    if (!cellsObj || typeof cellsObj !== 'object') cellsObj = null;
    var cells = (cellsObj && Array.isArray(cellsObj.cells)) ? cellsObj.cells : fallbackCells;
    var set = {}, list = [], r0 = Infinity, c0 = Infinity, r1 = -1, c1 = -1;
    if (!Array.isArray(cells)) cells = [];
    if (Array.isArray(cells)) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (!cell) continue;
        var r = Array.isArray(cell) ? cell[0] : cell.r;
        var c = Array.isArray(cell) ? cell[1] : cell.c;
        r = Number(r); c = Number(c);
        if (!isFinite(r) || !isFinite(c)) continue;
        r = Math.round(r); c = Math.round(c);
        set[r + ',' + c] = true;
        list.push([r, c]);
        if (r < r0) r0 = r;
        if (c < c0) c0 = c;
        if (r > r1) r1 = r;
        if (c > c1) c1 = c;
      }
    }
    var count = num(cellsObj && cellsObj.p_pe);
    if (count === null) count = list.length;
    return {
      set: set,
      list: list,
      count: count,
      text: (cellsObj && cellsObj.text) ? String(cellsObj.text) : '',
      type: (cellsObj && cellsObj.type) ? String(cellsObj.type) : '',
      bbox: list.length ? { r0: r0, c0: c0, r1: r1, c1: c1 } : null
    };
  }

  /* =========================================================================
   * §1 State
   * ======================================================================= */
  var DATAFLOWS = ['WS', 'OS', 'IS'];
  var REGISTERS = ['input', 'weight', 'psum'];
  var REG_KEY = { input: 'a', weight: 'w', psum: 's' };
  var DEFAULT_BIT_FIELD = { sign: [31, 31], exponent: [30, 23], mantissa: [22, 0] };

  var DATAFLOW_DESC = {
    WS: '权重驻留：权重固定在各 PE 内，输入自左向右流动，部分和自上向下流动。',
    OS: '输出驻留：部分和驻留本地不再流动，输入沿行向右、权重沿列向下流入。',
    IS: '输入驻留：输入固定在各 PE 内，权重自上向下流动，部分和自左向右流动（WS 的转置）。'
  };
  var REGISTER_DESC = {
    input: '输入寄存器 a：承载 A 的行数据，随数据流在阵列中流动。',
    weight: '权重寄存器 w：承载 B 的列数据，WS 下驻留、OS/IS 下沿列流动。',
    psum: '部分和寄存器 s：累积乘加结果，并携带已污染的累加量向下/向右传播。'
  };
  /* 流动方向（仅用于阵列动画的箭头示意） */
  var FLOWS = {
    WS: { right: true, down: true },
    OS: { right: true, down: true },
    IS: { right: true, down: true }
  };

  /* v2：WS / IS 下阵列空间与输出空间不是同一套坐标，面板需随 dataflow 标注 */
  var AXES_NOTE = {
    WS: '坐标 PE(r,c)：r 是归约下标（驻留权重 B[r][c]），c 是输出列；psum 自上而下流经每个 PE，'
      + '所以阵列的 r 不是输出行号。',
    OS: '坐标 PE(r,c)：直接持有输出 C[r][c]，r 是输出行、c 是输出列；psum 驻留不流动。',
    IS: '坐标 PE(r,c)：c 是归约下标（驻留输入 A[r][c]），r 是输出行；psum 自左向右流经每个 PE，'
      + '所以阵列的 c 不是输出列号。'
  };
  var MTX_COORD = {
    WS: 'C[t][c] · t = 输出行',
    OS: 'C[r][c] · 行 = 输出行',
    IS: 'C[r][t] · t = 输出列'
  };
  var MTX_HINT = {
    WS: 'WS：输入按行 skew 右流、psum 自上而下；底行第 c 列在 cycle τ 写出 C[t][c]，'
      + 't = τ − (N−1) − c（仅 0 ≤ t < N）。',
    OS: 'OS：psum 驻留，input 与 weight 在 τ = k + r + c 对齐，热图坐标 (r,c) 与 PE(r,c) 一一对应。',
    IS: 'IS：权重按列 skew 下流、psum 向右；右边界写出 C[r][t]，'
      + 't = τ − r − (N−1)（仅 0 ≤ t < N）。'
  };

  var state = {
    dataflow: 'WS',
    register: 'input',
    bit: 25,
    dir: 1,
    mode: 'permanent',
    faultCycle: null,
    N: 8,
    m: 2,
    n: 3,
    lambda: 0.8,
    seed: 37,          // 固定默认种子，保证可复现；"换一组随机数据"才会改变它
    playing: false,
    cycle: 0,
    speed: 320,
    tiling: true,
    engineReady: false,
    simMs: 0,
    cyclesRecorded: 0,
    summary: null
  };

  var lastResult = null;
  var lastAff = cellMask(null);   // 输出空间（数值受影响）
  var lastPath = cellMask(null);  // 阵列空间（污染路径）
  var engine = { ok: false, version: '—' };
  var errors = [];
  var playTimer = null;
  var pulseOn = 0;
  var hoverPE = null;
  var hoverCell = null;
  var matGeo = {};
  var arrayGeo = null;
  var matrixHoverTimer = null;
  var renderQueued = false;

  /* =========================================================================
   * §2 Engine
   * ======================================================================= */
  function getModel() { return (window.SA && window.SA.Model) || null; }
  function simEngine() {
    var M = getModel();
    return (M && typeof M.simulate === 'function') ? M : null;
  }
  function modelList(key, fallback) {
    var M = getModel();
    var list = M && M[key];
    return (Array.isArray(list) && list.length) ? list : fallback;
  }

  function totalCycleCount() {
    if (lastResult && Array.isArray(lastResult.cycles) && lastResult.cycles.length) return lastResult.cycles.length;
    if (lastResult && isNum(lastResult.totalCycles) && lastResult.totalCycles > 0) return Math.round(lastResult.totalCycles);
    return Math.max(1, 3 * state.N - 2);
  }

  function defaultFaultCycle() {
    return clamp(state.m + state.n + Math.floor(state.N / 2), 0, Math.max(0, 3 * state.N - 3));
  }
  function faultCycleValue() {
    var total = totalCycleCount();
    var c = state.faultCycle;
    if (!isNum(c)) c = defaultFaultCycle();
    return Math.round(clamp(c, 0, Math.max(0, total - 1)));
  }

  function buildFault() {
    var f = {
      enabled: true,
      m: state.m,
      n: state.n,
      register: state.register,
      bit: state.bit,
      dir: state.dir,
      mode: state.mode,
      cycle: null
    };
    if (state.mode === 'transient') f.cycle = faultCycleValue();
    return f;
  }

  /* v1.1：不再传 K；lambda 按 §7.4 传入 */
  function buildOpts() {
    return {
      N: state.N,
      dataflow: state.dataflow,
      seed: state.seed,
      lambda: state.lambda,
      fault: buildFault(),
      recordCycles: true
    };
  }

  function recompute(opt) {
    opt = opt || {};
    var M = simEngine();
    if (!M) return null;

    pausePlayback();
    var t0 = nowMs();
    var res;
    try {
      res = M.simulate(buildOpts());
    } catch (e) {
      pushError('仿真调用失败（' + state.dataflow + ' / ' + state.register + '）：'
        + (e && e.message ? e.message : String(e)));
      setEngineStatus('bad', '仿真异常');
      return null;
    }
    state.simMs = Math.max(0, Math.round((nowMs() - t0) * 100) / 100);

    if (!res || typeof res !== 'object') {
      pushError('仿真返回了非法结果（非对象）');
      return null;
    }

    lastResult = res;
    lastAff = readAffected(res);
    /* v1.1 的 affectedPEs；若模型尚未提供（过渡期），退回 affected 以免阵列没有任何污染标记 */
    lastPath = cellMask(res.affectedPEs || res.affected);
    state.cyclesRecorded = Array.isArray(res.cycles) ? res.cycles.length : 0;

    var total = totalCycleCount();
    if (opt.cycleTo === 'keep') state.cycle = clamp(state.cycle, 0, Math.max(0, total - 1));
    else state.cycle = Math.max(0, total - 1);

    bootOverlay(false);
    syncControlsFromState();
    renderAll();
    return res;
  }

  /* 输出空间 affected：优先模型给的 cells，缺失时用 |ΔC| 自行比较兜底 */
  function readAffected(res) {
    var aff = (res && res.affected) || null;
    if (aff && Array.isArray(aff.cells) && aff.cells.length) return cellMask(aff);
    var d = matOf(res && res.delta && res.delta.abs);
    if (!d) d = diffMat(matOf(res && res.golden && res.golden.C), matOf(res && res.faulty && res.faulty.C));
    if (d) {
      var cells = [];
      for (var r = 0; r < d.length; r++) {
        for (var c = 0; c < d[r].length; c++) {
          if (num(d[r][c]) !== null && d[r][c] > 1e-9) cells.push([r, c]);
        }
      }
      if (cells.length) return cellMask(null, cells);
    }
    return cellMask(aff);
  }

  /* =========================================================================
   * §3 Metrics
   * ======================================================================= */
  function metricsView() {
    var m = (lastResult && lastResult.metrics) || {};
    var aff = (lastResult && lastResult.affected) || {};
    var pathObj = (lastResult && lastResult.affectedPEs) || {};
    var M = num(m.M);
    var R = num(m.R);
    var C = num(m.Cnorm);
    var lam = isNum(state.lambda) ? state.lambda : 0.8;
    var N = state.N;

    /* p_pe：优先取模型给的拓扑口径；没有 metrics.p_pe 时退到 affectedPEs / affected */
    var ppe = num(m.p_pe);
    if (ppe === null) ppe = num(pathObj.p_pe);
    if (ppe === null) ppe = num(aff.p_pe);
    if (ppe === null) ppe = lastPath.count;

    /* p_out：输出空间（v2 首选 metrics.p_out，缺失回退 p_numeric / affected） */
    var pout = num(m.p_out);
    if (pout === null) pout = num(m.p_numeric);
    if (pout === null) pout = num(aff.p_pe);
    if (pout === null) pout = lastAff.count;

    var pmac = num(m.p_mac);
    if (pmac === null && ppe !== null) pmac = ppe * N;

    if (C === null && pmac !== null) {
      var pMax = N * N * N;
      C = (pMax > N) ? clamp((pmac - N) / (pMax - N), 0, 1) : 0;
    }

    /* S / Ŝ：模型已按拓扑 p 算好，λ 与当前滑块一致时直接取用；
       拖动 λ 滑块（尚未重跑仿真）时用同一公式本地预估，保证即时反馈。 */
    var lamModel = num(m.lambda);
    var useModel = (num(m.S) !== null) && (lamModel === null || Math.abs(lamModel - lam) < 1e-9);
    var S, Shat;
    if (useModel) {
      S = num(m.S);
      Shat = num(m.Shat);
    } else {
      S = (M !== null && C !== null) ? (M + lam * C * M) : num(m.S);
      Shat = (M !== null && R !== null && C !== null) ? (R * M * (1 + lam * C)) : num(m.Shat);
    }

    return {
      ppe: ppe,
      pout: pout,
      pnum: num(m.p_numeric),
      pmac: pmac,
      pathPpe: (num(pathObj.p_pe) !== null) ? pathObj.p_pe : ppe,
      Cnorm: C,
      M: M,
      R: R,
      S: S,
      Shat: Shat,
      relErr: num(m.relErr),
      maxAbsErr: num(m.maxAbsErr),
      masked: m.masked === true,
      lambda: lam
    };
  }

  /* =========================================================================
   * §4 Render.Array
   * ======================================================================= */
  var BG_INACTIVE = [12, 20, 33];
  var ACCENT_FILL = [30, 96, 138];

  function currentCycleObj() {
    if (!lastResult || !Array.isArray(lastResult.cycles) || !lastResult.cycles.length) return null;
    var idx = clamp(Math.round(state.cycle), 0, lastResult.cycles.length - 1);
    return lastResult.cycles[idx];
  }

  function buildPEMap(cyc, N) {
    if (!cyc || !Array.isArray(cyc.pes)) return null;
    var map = new Array(N);
    for (var r = 0; r < N; r++) {
      map[r] = new Array(N);
      for (var c = 0; c < N; c++) map[r][c] = null;
    }
    var pes = cyc.pes;
    for (var i = 0; i < pes.length; i++) {
      var p = pes[i];
      if (!p || !isNum(p.r) || !isNum(p.c)) continue;
      var pr = p.r | 0, pc = p.c | 0;
      if (pr >= 0 && pr < N && pc >= 0 && pc < N) map[pr][pc] = p;
    }
    return map;
  }

  function arrayHit(x, y) {
    if (!arrayGeo) return null;
    var g = arrayGeo;
    var c = Math.floor((x - g.pad) / (g.cell + g.gap));
    var r = Math.floor((y - g.pad) / (g.cell + g.gap));
    if (r < 0 || r >= g.N || c < 0 || c >= g.N) return null;
    var cx = g.pad + c * (g.cell + g.gap);
    var cy = g.pad + r * (g.cell + g.gap);
    if (x < cx || x > cx + g.cell || y < cy || y > cy + g.cell) return null;
    return { r: r, c: c };
  }

  function cellActivity(pe) {
    if (!pe) return null;
    var ks = ['a', 'w', 's'], best = null;
    for (var i = 0; i < 3; i++) {
      var v = num(pe[ks[i]]);
      if (v === null) continue;
      var a = Math.abs(v);
      if (best === null || a > best) best = a;
    }
    return best;
  }

  function renderArray() {
    var canvas = $('array-canvas');
    if (!canvas) return;
    var wrap = $('array-wrap');
    var availW = (wrap && wrap.clientWidth) ? wrap.clientWidth : 360;
    var maxH = clamp(window.innerHeight * 0.42, 250, 460);
    var size = Math.max(200, Math.min(availW - 2, maxH));
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    var ctx = ctxFor(canvas, size, size);
    ctx.clearRect(0, 0, size, size);

    var N = state.N;
    var pad = 4;
    var gap = N <= 8 ? 3 : (N <= 16 ? 2 : 1);
    var cell = (size - pad * 2 - gap * (N - 1)) / N;
    var focus = REG_KEY[state.register] || 'a';
    var cyc = currentCycleObj();
    var map = buildPEMap(cyc, N);
    var path = lastPath;

    var maxAbs = 1e-9, r, c;
    if (map) {
      for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++) {
          var p0 = map[r][c];
          if (!p0) continue;
          var v0 = cellActivity(p0);
          if (v0 !== null && v0 > maxAbs) maxAbs = v0;
        }
      }
    }
    var logMax = Math.log10(1 + maxAbs);
    arrayGeo = { pad: pad, gap: gap, cell: cell, N: N, size: size };

    var mode = cell >= 34 ? 'three' : (cell >= 18 ? 'one' : 'color');
    var chip = $('array-reg-chip');
    if (chip) {
      var chipTxt = mode === 'three' ? '显示 a / w / s' : (mode === 'one' ? '显示 ' + focus : '仅颜色深浅');
      if (chip.textContent !== chipTxt) chip.textContent = chipTxt;
    }

    var tri = clamp(cell * 0.30, 3, 9);

    for (r = 0; r < N; r++) {
      for (c = 0; c < N; c++) {
        var x = pad + c * (cell + gap);
        var y = pad + r * (cell + gap);
        var pe = map ? map[r][c] : null;
        var val = pe ? num(pe[focus]) : null;

        var t = 0;
        var act = pe ? cellActivity(pe) : null;
        if (act !== null && logMax > 0) t = clamp(Math.log10(1 + act) / logMax, 0, 1);
        var fill = mixc(BG_INACTIVE, [34, 110, 158], Math.pow(t, 0.60) * 0.9);

        /* v2：affectedPEs = 累加器被污染的 PE（阵列空间），给整格加一层红调，便于一眼看出形状 */
        var isPath = !!(path.set && path.set[r + ',' + c]);
        if (isPath) fill = mixc(fill, [150, 40, 45], 0.30);

        /* v1.1：faulted = 注入瞬间（整格红闪，仅标在故障 PE 上）；dirty = 本 cycle 污染（红环） */
        var dirty = !!(pe && pe.dirty);
        var faulted = !!(pe && pe.faulted) && (r === state.m && c === state.n);
        if (faulted) fill = pulseOn ? [188, 44, 48] : [146, 30, 34];

        roundRect(ctx, x, y, cell, cell, Math.max(2, cell * 0.10));
        ctx.fillStyle = rgba(fill, 1);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(64, 92, 134, 0.5)';
        ctx.stroke();

        /* 本 cycle 被污染：红色脉冲描边 */
        if (dirty && !faulted) {
          ctx.save();
          ctx.strokeStyle = pulseOn ? 'rgba(255, 110, 114, 0.88)' : 'rgba(198, 46, 52, 0.72)';
          ctx.lineWidth = Math.max(1.2, Math.min(2.0, cell * 0.06));
          roundRect(ctx, x + 1.4, y + 1.4, cell - 2.8, cell - 2.8, Math.max(2, cell * 0.10));
          ctx.stroke();
          ctx.restore();
        }

        /* 数据流动箭头：只画在阵列边界（左列 / 顶行），避免每格都堆箭头 */
        if (pe && cell >= 20) {
          var fl = FLOWS[state.dataflow] || FLOWS.WS;
          if (fl.right && c === 0) drawTri(ctx, x + cell * 0.09, y + cell * 0.5, 'right', cell * 0.06, 'rgba(125, 211, 252, 0.6)');
          if (fl.down && r === 0) drawTri(ctx, x + cell * 0.5, y + cell * 0.09, 'down', cell * 0.06, 'rgba(253, 164, 175, 0.6)');
        }

        /* 数值文字 */
        if (mode === 'three' && pe) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = clamp(cell / 4.8, 6.5, 10).toFixed(1) + 'px ' + JS_MONO;
          var lines = [
            { k: 'a', v: num(pe.a), col: '#9adcff' },
            { k: 'w', v: num(pe.w), col: '#cbb9ff' },
            { k: 's', v: num(pe.s), col: '#ffb0b8' }
          ];
          for (var li = 0; li < 3; li++) {
            var L = lines[li];
            ctx.fillStyle = (L.k === focus) ? L.col : 'rgba(214, 227, 245, 0.5)';
            ctx.fillText(L.k + ' ' + shortNum(L.v, 5), x + cell / 2, y + cell * (0.24 + li * 0.26), cell - 4);
          }
        } else if (mode === 'one' && pe && val !== null) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = clamp(cell * 0.32, 7, 12).toFixed(1) + 'px ' + JS_MONO;
          ctx.fillStyle = (dirty || faulted) ? '#ffe3e4' : 'rgba(232, 242, 255, 0.92)';
          ctx.fillText(shortNum(val, 6), x + cell / 2, y + cell / 2, cell - 4);
        }

        /* 故障 PE：琥珀色描边 + 右上角标 */
        if (r === state.m && c === state.n) {
          ctx.save();
          ctx.strokeStyle = '#f5b942';
          ctx.lineWidth = Math.max(1.5, Math.min(2.4, cell * 0.08));
          roundRect(ctx, x + 1, y + 1, cell - 2, cell - 2, Math.max(2, cell * 0.10));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + cell - tri, y + 2);
          ctx.lineTo(x + cell - 2, y + 2);
          ctx.lineTo(x + cell - 2, y + tri);
          ctx.closePath();
          ctx.fillStyle = '#f5b942';
          ctx.fill();
          ctx.restore();
        }

        /* 污染路径 PE（affectedPEs）：底部红条（不压文字） */
        if (isPath) {
          ctx.fillStyle = 'rgba(255, 90, 95, 0.95)';
          ctx.fillRect(x + Math.max(2, cell * 0.12), y + cell - Math.max(2.5, cell * 0.07),
            cell - Math.max(4, cell * 0.24), Math.max(2, cell * 0.05));
        }

        if (hoverPE && hoverPE.r === r && hoverPE.c === c) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 1.6;
          roundRect(ctx, x + 1, y + 1, cell - 2, cell - 2, Math.max(2, cell * 0.10));
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    /* 论文正文口径（阵列空间）虚线框：仅在与实测量化结果不一致时叠加 */
    var paper = lastResult && lastResult.paper;
    if (paper && paper.matches === false && Array.isArray(paper.cells) && paper.cells.length) {
      var pb = bboxOfCells(paper.cells);
      if (pb && pb.c1 < N && pb.r1 < N) {
        var ax = pad + pb.c0 * (cell + gap) - 2.5;
        var ay = pad + pb.r0 * (cell + gap) - 2.5;
        var aw = (pb.c1 - pb.c0 + 1) * (cell + gap) - gap + 5;
        var ah = (pb.r1 - pb.r0 + 1) * (cell + gap) - gap + 5;
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(245, 185, 66, 0.95)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(ax, ay, aw, ah);
        ctx.restore();
      }
    }

    if (!map) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px ' + JS_FONT;
      ctx.fillStyle = 'rgba(147, 163, 189, 0.9)';
      ctx.fillText('模型未返回逐周期状态（cycles）', size / 2, size - 16, size - 24);
      setTxt('array-hover', '⚠ 模型未返回 cycles，阵列动画不可用');
    } else if (!hoverPE) {
      setTxt('array-hover', '悬停查看 PE 坐标，点击设为故障点');
    }
  }

  function scheduleArrayRender() {
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(function () {
      renderQueued = false;
      renderArray();
    });
  }

  function renderTimeline() {
    var total = totalCycleCount();
    var last = Math.max(0, total - 1);
    var idx = clamp(Math.round(state.cycle), 0, last);
    var pct = last > 0 ? (idx / last) * 100 : 0;

    var fill = $('tl-fill');
    if (fill) fill.style.width = pct + '%';
    var knob = $('tl-knob');
    if (knob) knob.style.left = pct + '%';

    var cyc = currentCycleObj();
    var label = (cyc && isNum(cyc.t)) ? cyc.t : idx;
    var text = 'cycle ' + label + ' / ' + last;
    setTxt('timeline-label', text);
    setTxt('array-time-chip', text);
    var tl = $('timeline');
    if (tl) tl.title = '点击时间轴可跳转 cycle（共 ' + total + ' 拍）';
  }

  /* =========================================================================
   * §5 Render.Matrix
   * ======================================================================= */
  var HEAT_STOPS = [
    [10, 16, 28], [20, 58, 120], [37, 99, 235], [124, 58, 237],
    [219, 39, 119], [249, 115, 22], [253, 224, 71]
  ];
  var VAL_POS = [249, 115, 22];
  var VAL_NEG = [59, 130, 246];
  var VAL_ZERO = [15, 25, 41];

  function heatColor(t) {
    t = clamp(t, 0, 1);
    var n = HEAT_STOPS.length - 1;
    var f = t * n;
    var i = Math.floor(f);
    if (i >= n) return rgba(HEAT_STOPS[n], 1);
    return rgba(mixc(HEAT_STOPS[i], HEAT_STOPS[i + 1], f - i), 1);
  }
  function valueColor(t) {
    t = clamp(t, -1, 1);
    var k = Math.pow(Math.abs(t), 0.72);
    return t >= 0 ? rgba(mixc(VAL_ZERO, VAL_POS, k), 1) : rgba(mixc(VAL_ZERO, VAL_NEG, k), 1);
  }

  /* 金标准 / 故障 C 的配色：按两张图共同的 min–max 归一（仅影响观感，不改任何数据）。
     全正或全负时用单色顺序标，跨零时才用发散标，避免把"小正数"染成蓝色。 */
  function valueRange(gold, fault) {
    var lo = Infinity, hi = -Infinity;
    [gold, fault].forEach(function (m) {
      if (!m) return;
      for (var r = 0; r < m.length; r++) {
        for (var c = 0; c < m[r].length; c++) {
          var v = num(m[r][c]);
          if (v === null) continue;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
    });
    if (!isFinite(lo) || !isFinite(hi)) return { mode: 'abs', lo: 0, hi: 1, span: 1, maxAbs: 1 };
    var span = hi - lo;
    if (span < 1e-12) return { mode: 'abs', lo: lo, hi: hi, span: 1, maxAbs: Math.max(Math.abs(lo), 1e-12) };
    var mode = (lo >= 0) ? 'pos' : ((hi <= 0) ? 'neg' : 'div');
    return {
      mode: mode,
      lo: lo,
      hi: hi,
      span: span,
      maxAbs: Math.max(Math.abs(lo), Math.abs(hi)) || 1
    };
  }

  function valueT(v, sc) {
    if (!sc || !isNum(v)) return 0;
    if (sc.mode === 'pos') return clamp((v - sc.lo) / (sc.span || 1), 0, 1);
    if (sc.mode === 'neg') return -clamp((sc.hi - v) / (sc.span || 1), 0, 1);
    return clamp(v / (sc.maxAbs || 1), -1, 1);
  }

  function matOf(x) {
    if (!Array.isArray(x) || !x.length) return null;
    if (!Array.isArray(x[0]) || !x[0].length) return null;
    return x;
  }
  function diffMat(g, f) {
    if (!g || !f) return null;
    var rows = Math.min(g.length, f.length), out = [];
    for (var r = 0; r < rows; r++) {
      var cols = Math.min(g[r].length, f[r].length), row = [];
      for (var c = 0; c < cols; c++) {
        var gv = num(g[r][c]), fv = num(f[r][c]);
        row.push((gv !== null && fv !== null) ? Math.abs(fv - gv) : 0);
      }
      out.push(row);
    }
    return out.length ? out : null;
  }
  function maxAbsOf(m) {
    if (!m) return 0;
    var mx = 0;
    for (var r = 0; r < m.length; r++) {
      for (var c = 0; c < m[r].length; c++) {
        var v = num(m[r][c]);
        if (v !== null && Math.abs(v) > mx) mx = Math.abs(v);
      }
    }
    return mx;
  }
  function matrixData() {
    var r = lastResult;
    var gold = matOf(r && r.golden && r.golden.C);
    var fault = matOf(r && r.faulty && r.faulty.C);
    var d = matOf(r && r.delta && r.delta.abs);
    if (!d) d = diffMat(gold, fault);
    return { gold: gold, fault: fault, delta: d };
  }

  function bboxOfCells(cells) {
    if (!Array.isArray(cells) || !cells.length) return null;
    var r0 = Infinity, c0 = Infinity, r1 = -1, c1 = -1;
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (!cell) continue;
      var r = Array.isArray(cell) ? cell[0] : cell.r;
      var c = Array.isArray(cell) ? cell[1] : cell.c;
      r = Number(r); c = Number(c);
      if (!isFinite(r) || !isFinite(c)) continue;
      if (r < r0) r0 = r;
      if (c < c0) c0 = c;
      if (r > r1) r1 = r;
      if (c > c1) c1 = c;
    }
    return r1 < 0 ? null : { r0: r0, c0: c0, r1: r1, c1: c1 };
  }

  /* L-5：数值误差空态。完全掩蔽时 |ΔC| 为 0，热图不能画成"出错区域"。
     判定口径：p_out === 0（模型按 1e-12 相对容差逐元素比较得出），
     或 maxAbsErr <= 1e-12 * max(1, max|C_golden|)。
     注意：不要用 1e-6 这类粗容差——低位尾数故障（如 bit10）只改变 ~1e-6 量级，
     会被误判成"完全掩蔽"，但它确实已经传播了。 */
  var errState = { none: false, maxD: 0, tol: 0, pout: null };

  function computeErrState(dat) {
    var maxD = maxAbsOf(dat.delta);
    var maxGold = maxAbsOf(dat.gold);
    var tol = 1e-12 * Math.max(1, maxGold);
    var mv = metricsView();
    var pout = (mv.pout === undefined) ? null : mv.pout;
    var none = !!lastResult && ((pout === 0) || (maxD <= tol));
    return { none: none, maxD: maxD, tol: tol, pout: pout, maxGold: maxGold };
  }

  function drawMatrixCanvas(canvas, mat, kind, sharedMax) {
    if (!canvas) return;
    var w = Math.max(80, canvas.clientWidth || 200);
    var h = w;
    var ctx = ctxFor(canvas, w, h);
    ctx.clearRect(0, 0, w, h);

    if (!mat) {
      matGeo[canvas.id] = null;
      ctx.fillStyle = 'rgba(120, 140, 168, 0.75)';
      ctx.font = '12px ' + JS_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('无数据', w / 2, h / 2);
      return;
    }

    /* |ΔC| 空态：深色底 + 中性文案，不画色块、不画 affected 框 */
    if (kind === 'heat' && errState.none) {
      matGeo[canvas.id] = null;
      ctx.fillStyle = 'rgb(9, 14, 24)';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(48, 66, 94, 0.9)';
      ctx.lineWidth = 1;
      ctx.strokeRect(6.5, 6.5, w - 13, h - 13);
      ctx.restore();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(160, 178, 200, 0.95)';
      ctx.font = '10.5px ' + JS_FONT;
      ctx.fillText('无数值误差（被完全掩蔽）', w / 2, h / 2 - 8, w - 16);
      ctx.fillStyle = 'rgba(107, 125, 151, 0.95)';
      ctx.font = '9px ' + JS_MONO;
      ctx.fillText('max|ΔC| = ' + fmtSig(errState.maxD, 3) + ' < 容差', w / 2, h / 2 + 10, w - 16);
      return;
    }

    var rows = mat.length, cols = mat[0].length;
    var pad = 3;
    var gap = rows <= 8 ? 2 : (rows <= 16 ? 1 : 0.5);
    var cell = Math.min(
      (w - pad * 2 - gap * (cols - 1)) / cols,
      (h - pad * 2 - gap * (rows - 1)) / rows
    );
    var ox = (w - (cell * cols + gap * (cols - 1))) / 2;
    var oy = (h - (cell * rows + gap * (rows - 1))) / 2;
    matGeo[canvas.id] = { ox: ox, oy: oy, cell: cell, gap: gap, rows: rows, cols: cols, kind: kind };

    var maxV = (kind === 'heat') ? (maxAbsOf(mat) || 1) : 0;
    var showText = cell >= 15;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var v = num(mat[r][c]);
        var x = ox + c * (cell + gap);
        var y = oy + r * (cell + gap);
        var t;
        if (v === null) t = 0;
        else if (kind === 'heat') t = clamp(v / (maxV || 1), 0, 1);
        else t = valueT(v, sharedMax);
        var color = (kind === 'heat') ? heatColor(Math.pow(t, 0.62)) : valueColor(t);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cell, cell);

        if (showText && v !== null) {
          if (kind === 'heat' && !(v > 0)) continue;
          ctx.font = (kind === 'heat' ? 'bold ' : '') + clamp(cell * 0.34, 7, 11).toFixed(1) + 'px ' + JS_MONO;
          var bright = kind === 'heat' && Math.pow(clamp(t, 0, 1), 0.62) > 0.55;
          ctx.fillStyle = bright ? 'rgba(12, 16, 24, 0.92)' : 'rgba(236, 244, 255, 0.92)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(shortNum(v, 6), x + cell / 2, y + cell / 2, cell - 3);
        }
      }
    }

    /* 热图：输出空间 affected 的边框 */
    if (kind === 'heat') {
      for (var i = 0; i < lastAff.list.length; i++) {
        var p = lastAff.list[i];
        var px = ox + p[1] * (cell + gap);
        var py = oy + p[0] * (cell + gap);
        ctx.strokeStyle = 'rgba(56, 217, 245, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
      }
      if (lastAff.bbox) {
        var b = lastAff.bbox;
        ctx.strokeStyle = '#38d9f5';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(
          ox + b.c0 * (cell + gap) - 1.5,
          oy + b.r0 * (cell + gap) - 1.5,
          (b.c1 - b.c0 + 1) * (cell + gap) - gap + 3,
          (b.r1 - b.r0 + 1) * (cell + gap) - gap + 3
        );
      }
    }

    if (hoverCell && hoverCell.r < rows && hoverCell.c < cols) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(
        ox + hoverCell.c * (cell + gap) + 0.5,
        oy + hoverCell.r * (cell + gap) + 0.5,
        cell - 1, cell - 1
      );
    }
  }

  function renderMatrices() {
    var dat = matrixData();
    var vsc = valueRange(dat.gold, dat.fault);
    errState = computeErrState(dat);

    drawMatrixCanvas($('mtx-golden'), dat.gold, 'value', vsc);
    drawMatrixCanvas($('mtx-faulty'), dat.fault, 'value', vsc);
    drawMatrixCanvas($('mtx-heat'), dat.delta, 'heat', null);

    setTxt('legend-max', errState.maxD > 0 ? fmtSig(errState.maxD, 3) : '0');

    /* 空态：隐藏色标 / affected 框图例，改显示 max|ΔC| 与容差 */
    var scaleEl = $('legend-scale');
    var sepEl = $('legend-sep');
    var affEl = $('legend-affected-item');
    var noteEl = $('legend-note');
    var emptyEl = $('legend-empty');
    if (errState.none) {
      if (scaleEl) scaleEl.hidden = true;
      if (sepEl) sepEl.hidden = true;
      if (affEl) affEl.hidden = true;
      if (noteEl) noteEl.hidden = true;
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = 'max|ΔC| = ' + fmtSig(errState.maxD, 3)
          + ' < 容差 ' + fmtSig(errState.tol, 2);
      }
    } else {
      if (scaleEl) scaleEl.hidden = false;
      if (sepEl) sepEl.hidden = false;
      if (affEl) affEl.hidden = false;
      if (noteEl) noteEl.hidden = false;
      if (emptyEl) emptyEl.hidden = true;
    }

    var cnt = dat.gold ? (dat.gold.length + ' × ' + dat.gold[0].length) : (state.N + ' × ' + state.N);
    setTxt('matrix-count-chip', cnt);
  }

  function bindMatrixHover() {
    ['mtx-golden', 'mtx-faulty', 'mtx-heat'].forEach(function (id) {
      var cv = $(id);
      if (!cv) return;
      cv.addEventListener('mousemove', function (ev) {
        var g = matGeo[id];
        if (!g) return;
        var rect = cv.getBoundingClientRect();
        var x = ev.clientX - rect.left;
        var y = ev.clientY - rect.top;
        var c = Math.floor((x - g.ox) / (g.cell + g.gap));
        var r = Math.floor((y - g.oy) / (g.cell + g.gap));
        if (r < 0 || r >= g.rows || c < 0 || c >= g.cols) { hideTooltip(); hoverCell = null; return; }
        var cx = g.ox + c * (g.cell + g.gap);
        var cy = g.oy + r * (g.cell + g.gap);
        if (x < cx || x > cx + g.cell || y < cy || y > cy + g.cell) { hideTooltip(); hoverCell = null; return; }
        hoverCell = { r: r, c: c };
        showMatrixTooltip(ev, r, c);
        scheduleMatrixHoverRender();
      });
      cv.addEventListener('mouseleave', function () {
        hideTooltip();
        hoverCell = null;
        scheduleMatrixHoverRender();
      });
    });
  }

  function scheduleMatrixHoverRender() {
    if (matrixHoverTimer) return;
    matrixHoverTimer = window.setTimeout(function () {
      matrixHoverTimer = null;
      renderMatrices();
    }, 50);
  }

  function showMatrixTooltip(ev, r, c) {
    var dat = matrixData();
    var gv = dat.gold && dat.gold[r] ? num(dat.gold[r][c]) : null;
    var fv = dat.fault && dat.fault[r] ? num(dat.fault[r][c]) : null;
    var dv = dat.delta && dat.delta[r] ? num(dat.delta[r][c]) : null;
    var isAff = !!lastAff.set[r + ',' + c];

    var tt = $('tooltip');
    if (!tt) return;
    tt.innerHTML =
      '<div class="tt-head">C[' + r + '][' + c + ']</div>' +
      '<div class="tt-row"><span>金标准</span><b>' + fmtSig(gv, 5) + '</b></div>' +
      '<div class="tt-row"><span>故障值</span><b>' + fmtSig(fv, 5) + '</b></div>' +
      '<div class="tt-row' + (isAff ? ' is-affected' : '') + '"><span>|ΔC|</span><b>' + fmtSig(dv, 4) + '</b></div>' +
      '<div class="tt-row"><span>状态</span><b>' + (isAff ? '数值受影响' : '数值未变') + '</b></div>';
    tt.hidden = false;

    var pad = 14;
    var w = tt.offsetWidth || 170;
    var h = tt.offsetHeight || 100;
    var x = ev.clientX + pad;
    var y = ev.clientY + pad;
    if (x + w > window.innerWidth - 8) x = ev.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = ev.clientY - h - pad;
    tt.style.left = Math.max(6, x) + 'px';
    tt.style.top = Math.max(6, y) + 'px';
  }
  function hideTooltip() {
    var tt = $('tooltip');
    if (tt) tt.hidden = true;
  }

  /* =========================================================================
   * §6 Render.Tiling
   * ======================================================================= */
  function renderTiling() {
    var body = $('tiling-body');
    if (body) body.hidden = !state.tiling;
    var btn = $('btn-tiling');
    if (btn) btn.textContent = state.tiling ? '隐藏' : '展开';
    if (!state.tiling) return;

    var canvas = $('tiling-canvas');
    if (!canvas) return;
    var w = canvas.clientWidth || (canvas.parentNode ? canvas.parentNode.clientWidth : 0) || 260;
    var h = w;
    var ctx = ctxFor(canvas, w, h);
    ctx.clearRect(0, 0, w, h);

    var dat = matrixData();
    if (!dat.delta) {
      ctx.fillStyle = 'rgba(120, 140, 168, 0.75)';
      ctx.font = '12px ' + JS_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('无数据', w / 2, h / 2);
      return;
    }
    /* 与 |ΔC| 热图保持一致：完全掩蔽时不展示噪声块的"块级重复" */
    if (errState.none) {
      ctx.fillStyle = 'rgb(9, 14, 24)';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(48, 66, 94, 0.9)';
      ctx.lineWidth = 1;
      ctx.strokeRect(6.5, 6.5, w - 13, h - 13);
      ctx.restore();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(160, 178, 200, 0.95)';
      ctx.font = '10.5px ' + JS_FONT;
      ctx.fillText('无数值误差，无块级重复可展示', w / 2, h / 2, w - 20);
      return;
    }

    var N = dat.delta.length;
    var M = N * 2;
    var pad = 3;
    var gap = N <= 8 ? 1.5 : 0.5;
    var cell = (w - pad * 2 - gap * (M - 1)) / M;
    var ox = (w - (cell * M + gap * (M - 1))) / 2;
    var oy = (h - (cell * M + gap * (M - 1))) / 2;
    var maxD = maxAbsOf(dat.delta) || 1;

    for (var br = 0; br < 2; br++) {
      for (var bc = 0; bc < 2; bc++) {
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            var v = (dat.delta[r] && num(dat.delta[r][c]) !== null) ? dat.delta[r][c] : 0;
            var t = Math.pow(clamp(v / maxD, 0, 1), 0.62);
            var x = ox + (bc * N + c) * (cell + gap);
            var y = oy + (br * N + r) * (cell + gap);
            ctx.fillStyle = v > 0 ? heatColor(t) : 'rgb(16, 26, 43)';
            ctx.fillRect(x, y, cell, cell);
          }
        }
      }
    }

    var midX = ox + N * (cell + gap) - gap / 2;
    var midY = oy + N * (cell + gap) - gap / 2;
    var endX = ox + M * (cell + gap) - gap;
    var endY = oy + M * (cell + gap) - gap;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(56, 217, 245, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(midX, oy); ctx.lineTo(midX, endY);
    ctx.moveTo(ox, midY); ctx.lineTo(endX, midY);
    ctx.stroke();
    ctx.restore();

    if (cell * N > 56) {
      ctx.font = '9px ' + JS_MONO;
      ctx.fillStyle = 'rgba(147, 163, 189, 0.8)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      var lab = ['B00', 'B01', 'B10', 'B11'], k = 0;
      for (var lr = 0; lr < 2; lr++) {
        for (var lc = 0; lc < 2; lc++) {
          ctx.fillText(lab[k++], ox + lc * N * (cell + gap) + 2, oy + lr * N * (cell + gap) + 2);
        }
      }
    }
  }

  /* =========================================================================
   * §7 Render.Cards
   * ======================================================================= */
  var METRIC_IDS = ['m-ppe', 'm-pout', 'm-pmac', 'm-cnorm', 'm-M', 'm-R', 'm-S', 'm-Shat', 'm-relerr', 'm-maxerr'];
  var METRIC_NOTE_EMPTY =
    '污染 ≠ 必然数值出错（掩蔽）：阵列空间 p_pe = — 个 PE（被污染的累加器），输出空间 p_out = — 个 C 元素（算错的）。';

  function renderMetrics() {
    if (!lastResult) {
      METRIC_IDS.forEach(function (id) { setTxt(id, '—'); });
      setTxt('seed-chip', 'seed —');
      setTxt('metric-note', METRIC_NOTE_EMPTY);
      var b0 = $('mask-banner');
      if (b0) b0.hidden = true;
      return;
    }
    var mv = metricsView();
    setTxt('m-ppe', fmtInt(mv.ppe));
    setTxt('m-pout', fmtInt(mv.pout));
    setTxt('m-pmac', fmtInt(mv.pmac));
    setTxt('m-cnorm', fmtSig(mv.Cnorm, 4));
    setTxt('m-M', fmtSig(mv.M, 4));
    setTxt('m-R', fmtSig(mv.R, 4));
    setTxt('m-S', fmtSig(mv.S, 4));
    setTxt('m-Shat', fmtSig(mv.Shat, 4));
    setTxt('m-relerr', fmtSig(mv.relErr, 4));
    setTxt('m-maxerr', fmtSig(mv.maxAbsErr, 4));

    var S = $('m-S');
    if (S) { if (mv.masked) S.classList.add('warn'); else S.classList.remove('warn'); }

    var usedSeed = num(lastResult && lastResult.usedSeed);
    setTxt('seed-chip', lastResult ? ('seed ' + (usedSeed === null ? state.seed : usedSeed)) : 'seed —');

    var banner = $('mask-banner');
    if (banner) banner.hidden = !(lastResult && mv.masked);

    setTxt('metric-note',
      '污染 ≠ 必然数值出错（掩蔽）：阵列空间 p_pe = ' + fmtInt(mv.ppe) + ' 个 PE（被污染的累加器），'
      + '输出空间 p_out = ' + fmtInt(mv.pout) + ' 个 C 元素（算错的）。');
  }

  function typeText(t) {
    switch (String(t || '').toLowerCase()) {
      case 'rect': return '矩形块';
      case 'row': return '行段';
      case 'column': return '列段';
      case 'point': case 'cell': case 'single': return '单点';
      case '': return '—';
      default: return String(t);
    }
  }

  function renderScope() {
    var p = (lastResult && lastResult.paper) || {};
    var path = lastPath;

    if (!lastResult) {
      setTxt('paper-type', '—');
      setTxt('paper-text', '—');
      setTxt('paper-p', '—');
      setTxt('measured-type', '—');
      setTxt('measured-text', '—');
      setTxt('measured-p', '—');
      setTxt('scope-note', '等待仿真结果…');
      var bd0 = $('scope-badge');
      if (bd0) { bd0.classList.remove('ok', 'warn'); bd0.classList.add('neutral'); bd0.textContent = '口径 —'; }
      var pi0 = $('array-paper-item');
      if (pi0) pi0.hidden = true;
      return;
    }

    setTxt('paper-type', typeText(p.type));
    setTxt('paper-text', p.text ? String(p.text) : '（模型未提供正文口径文本）');
    setTxt('paper-p', isNum(p.p) ? ('受影响 PE 数 p = ' + fmtInt(p.p)) : '—');

    setTxt('measured-type', typeText(path.type));
    setTxt('measured-text', path.text || '（模型未提供 affectedPEs 文本）');
    setTxt('measured-p', '受影响 PE 数 p_pe = ' + fmtInt(path.count));

    var matches = (typeof p.matches === 'boolean') ? p.matches : null;
    var badge = $('scope-badge');
    if (badge) {
      badge.classList.remove('ok', 'warn', 'neutral');
      if (matches === true) { badge.classList.add('ok'); badge.textContent = '口径一致'; }
      else if (matches === false) { badge.classList.add('warn'); badge.textContent = '口径不一致'; }
      else { badge.classList.add('neutral'); badge.textContent = '口径待确认'; }
    }
    var note = $('scope-note');
    if (note) {
      if (matches === true) {
        note.textContent = '论文正文表述与本例 affectedPEs（阵列空间）的污染形状一致。';
      } else if (matches === false) {
        note.textContent = '两套口径并列展示，待作者确认：左侧为论文正文的解析几何描述，右侧为本次仿真按 dirty 传播实测的 PE 集合；两者差异不影响本页指标计算。';
      } else {
        note.textContent = '本轮结果未提供一致性标记，两套口径并列展示，待作者确认。';
      }
    }

    var paperItem = $('array-paper-item');
    if (paperItem) paperItem.hidden = !(matches === false);
  }

  /* =========================================================================
   * §8 Controls
   * ======================================================================= */
  function setEngineStatus(kind, text) {
    var el = $('engine-status');
    if (!el) return;
    el.classList.remove('loading', 'bad', 'ok');
    if (kind === 'loading') el.classList.add('loading');
    else if (kind === 'bad') el.classList.add('bad');
    else el.classList.add('ok');
    setTxt('engine-text', text);
  }

  function bootOverlay(show, text, isErr) {
    var el = $('array-boot');
    if (!el) return;
    if (!show) { el.hidden = true; return; }
    el.hidden = false;
    if (text) el.textContent = text;
    if (isErr) el.classList.add('error'); else el.classList.remove('error');
  }

  function bitFieldOf(bit) {
    var M = getModel();
    var bf = (M && typeof M.bitField === 'function') ? M.bitField() : null;
    if (!bf || typeof bf !== 'object') bf = DEFAULT_BIT_FIELD;
    var fields = [
      { cls: 'sign', name: '符号位 sign', pair: bf.sign },
      { cls: 'exponent', name: '指数位 exponent', pair: bf.exponent },
      { cls: 'mantissa', name: '尾数位 mantissa', pair: bf.mantissa }
    ];
    for (var i = 0; i < fields.length; i++) {
      var pair = fields[i].pair;
      if (!Array.isArray(pair) || pair.length < 2) continue;
      var lo = Math.min(pair[0], pair[1]);
      var hi = Math.max(pair[0], pair[1]);
      if (bit >= lo && bit <= hi) {
        return {
          cls: fields[i].cls,
          name: fields[i].name,
          range: (lo === hi) ? ('bit ' + lo) : ('bit ' + hi + '..' + lo)
        };
      }
    }
    return { cls: 'mantissa', name: '尾数位 mantissa', range: '—' };
  }

  function syncControlsFromState() {
    all('[data-df]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-df') === state.dataflow);
    });
    all('[data-reg]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-reg') === state.register);
    });
    all('[data-dir]').forEach(function (b) {
      b.classList.toggle('active', Number(b.getAttribute('data-dir')) === state.dir);
    });
    all('[data-mode]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-mode') === state.mode);
    });

    setTxt('df-desc', DATAFLOW_DESC[state.dataflow] || '');
    setTxt('reg-desc', REGISTER_DESC[state.register] || '');
    setTxt('fault-pos', 'PE(' + state.m + ',' + state.n + ')');
    setTxt('array-axes', AXES_NOTE[state.dataflow] || '');
    setTxt('mtx-coord', MTX_COORD[state.dataflow] || 'C[r][c]');
    setTxt('mtx-hint', MTX_HINT[state.dataflow] || '');

    var br = $('bit-range');
    if (br && Number(br.value) !== state.bit) br.value = String(state.bit);
    var bn = $('bit-num');
    if (bn && Number(bn.value) !== state.bit) bn.value = String(state.bit);
    setTxt('bit-val', String(state.bit));
    var bf = bitFieldOf(state.bit);
    var bfe = $('bit-field');
    if (bfe) {
      bfe.className = 'field-tag ' + bf.cls;
      if (bfe.textContent !== bf.name) bfe.textContent = bf.name;
    }
    setTxt('bit-range-txt', bf.range);

    var cw = $('cycle-wrap');
    if (cw) cw.hidden = state.mode !== 'transient';
    var ci = $('cycle-input');
    if (ci) {
      var cv = state.mode === 'transient' ? faultCycleValue()
        : (isNum(state.faultCycle) ? state.faultCycle : defaultFaultCycle());
      if (document.activeElement !== ci && Number(ci.value) !== cv) ci.value = String(cv);
    }

    var selN = $('sel-N');
    if (selN && Number(selN.value) !== state.N) selN.value = String(state.N);
    setTxt('k-chip', 'K = ' + state.N);

    var lr = $('lambda-range');
    if (lr && Number(lr.value) !== state.lambda) lr.value = String(state.lambda);
    setTxt('lambda-val', fmtFixed(state.lambda, 2, '0.80'));

    var sr = $('speed-range');
    if (sr && Number(sr.value) !== state.speed) sr.value = String(state.speed);
    setTxt('speed-val', Math.round(state.speed) + 'ms');

    updatePlayBtn();
  }

  function applyDataflow(df) {
    var d = String(df || '').toUpperCase();
    if (modelList('DATAFLOWS', DATAFLOWS).indexOf(d) >= 0) state.dataflow = d;
    return state.dataflow;
  }
  function applyRegister(reg) {
    var rg = String(reg || '').toLowerCase();
    if (modelList('REGISTERS', REGISTERS).indexOf(rg) >= 0) state.register = rg;
    return state.register;
  }

  function setDataflow(df) {
    applyDataflow(df);
    syncControlsFromState();
    return recompute({});
  }
  function setFault(m, n) {
    var mm = Math.round(Number(m)), nn = Math.round(Number(n));
    if (!isFinite(mm) || !isFinite(nn)) return null;
    state.m = clamp(mm, 0, state.N - 1);
    state.n = clamp(nn, 0, state.N - 1);
    syncControlsFromState();
    return recompute({});
  }

  function bindControls() {
    all('[data-df]').forEach(function (b) {
      b.addEventListener('click', function () { setDataflow(b.getAttribute('data-df')); });
    });
    all('[data-reg]').forEach(function (b) {
      b.addEventListener('click', function () {
        applyRegister(b.getAttribute('data-reg'));
        syncControlsFromState();
        recompute({});
      });
    });
    all('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.dir = Number(b.getAttribute('data-dir')) === 1 ? 1 : 0;
        syncControlsFromState();
        recompute({});
      });
    });
    all('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-mode');
        if (mode !== 'permanent' && mode !== 'transient') return;
        state.mode = mode;
        if (mode === 'transient' && !isNum(state.faultCycle)) state.faultCycle = defaultFaultCycle();
        syncControlsFromState();
        recompute({});
      });
    });

    /* bit：滑块与数字框共用同一落点，值未变则不重复仿真 */
    function applyBit(v) {
      var raw = String(v === null || v === undefined ? '' : v).trim();
      if (raw === '') return;                 /* 输入框被清空时不动 */
      var b = Math.round(Number(raw));
      if (!isFinite(b)) b = state.bit;
      b = clamp(b, 0, 31);
      if (b === state.bit) { syncControlsFromState(); return; }
      state.bit = b;
      syncControlsFromState();
      recompute({});
    }
    var br = $('bit-range');
    if (br) {
      br.addEventListener('input', function () { applyBit(br.value); });
      br.addEventListener('change', function () { applyBit(br.value); });
    }
    var bn = $('bit-num');
    if (bn) {
      bn.addEventListener('input', function () { applyBit(bn.value); });
      bn.addEventListener('change', function () { applyBit(bn.value); });
    }

    var ci = $('cycle-input');
    if (ci) {
      ci.addEventListener('change', function () {
        var v = Math.round(Number(ci.value));
        if (!isFinite(v) || v < 0) v = defaultFaultCycle();
        state.faultCycle = v;
        syncControlsFromState();
        recompute({});
      });
    }

    var selN = $('sel-N');
    if (selN) {
      selN.addEventListener('change', function () {
        var v = Math.round(Number(selN.value));
        if (!isFinite(v) || v <= 0) return;
        state.N = v;
        state.m = clamp(state.m, 0, v - 1);
        state.n = clamp(state.n, 0, v - 1);
        syncControlsFromState();
        recompute({});
      });
    }

    /* λ：只重算指标显示，不重跑仿真（λ 不改变 C，只改变 S / Ŝ） */
    var lr = $('lambda-range');
    if (lr) {
      lr.addEventListener('input', function () {
        state.lambda = clamp(Number(lr.value) || 0, 0, 2);
        setTxt('lambda-val', fmtFixed(state.lambda, 2, '0.80'));
        renderMetrics();
        updateHookSummary();
      });
      lr.addEventListener('change', function () {
        /* 松手后按契约重跑一次，把 lambda 传给 simulate 保持一致性 */
        if (lastResult) recompute({ cycleTo: 'keep' });
      });
    }

    var bp = $('btn-play');
    if (bp) bp.addEventListener('click', function () { if (state.playing) pausePlayback(); else startPlayback(); });
    var bs = $('btn-step');
    if (bs) bs.addEventListener('click', function () { nextCycle(); });
    var brs = $('btn-reset');
    if (brs) {
      brs.addEventListener('click', function () {
        pausePlayback();
        state.cycle = 0;
        renderArray();
        renderTimeline();
        updateHookSummary();
      });
    }
    var sr = $('speed-range');
    if (sr) {
      sr.addEventListener('input', function () {
        state.speed = clamp(Number(sr.value) || 320, 60, 900);
        setTxt('speed-val', Math.round(state.speed) + 'ms');
      });
    }
    var bd = $('btn-data');
    if (bd) {
      bd.addEventListener('click', function () {
        state.seed = Math.floor(Math.random() * 1000000000) + 1;
        recompute({});
      });
    }
    var bt = $('btn-tiling');
    if (bt) {
      bt.addEventListener('click', function () {
        state.tiling = !state.tiling;
        renderTiling();
      });
    }

    var cv = $('array-canvas');
    if (cv) {
      cv.addEventListener('mousemove', function (ev) {
        var rect = cv.getBoundingClientRect();
        var hit = arrayHit(ev.clientX - rect.left, ev.clientY - rect.top);
        var changed = (hit ? (hit.r + ',' + hit.c) : '') !== (hoverPE ? (hoverPE.r + ',' + hoverPE.c) : '');
        hoverPE = hit;
        var read = $('array-hover');
        if (read) {
          if (hit) {
            var pe = null;
            var map = buildPEMap(currentCycleObj(), state.N);
            if (map) pe = map[hit.r][hit.c];
            var txt = 'PE(' + hit.r + ',' + hit.c + ')';
            if (pe) {
              txt += '  a=' + shortNum(num(pe.a), 7) + '  w=' + shortNum(num(pe.w), 7) + '  s=' + shortNum(num(pe.s), 7);
              if (pe.faulted) txt += '  ← 注入瞬间';
              else if (pe.dirty) txt += '  ← 本 cycle 已污染';
            }
            read.textContent = txt + '　（点击设为故障点）';
          } else {
            read.textContent = '悬停查看 PE 坐标，点击设为故障点';
          }
        }
        if (changed) scheduleArrayRender();
      });
      cv.addEventListener('mouseleave', function () {
        hoverPE = null;
        var read = $('array-hover');
        if (read) read.textContent = '悬停查看 PE 坐标，点击设为故障点';
        scheduleArrayRender();
      });
      cv.addEventListener('click', function (ev) {
        var rect = cv.getBoundingClientRect();
        var hit = arrayHit(ev.clientX - rect.left, ev.clientY - rect.top);
        if (hit) setFault(hit.r, hit.c);
      });
    }

    var tl = $('timeline');
    if (tl) {
      tl.addEventListener('click', function (ev) {
        var rect = tl.getBoundingClientRect();
        var ratio = clamp((ev.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
        seekCycle(Math.round(ratio * (totalCycleCount() - 1)));
      });
    }

    bindMatrixHover();
  }

  /* =========================================================================
   * §9 Animation
   * ======================================================================= */
  function updatePlayBtn() {
    var b = $('btn-play');
    if (!b) return;
    b.textContent = state.playing ? '暂停' : '播放';
    if (state.playing) b.classList.add('playing');
    else b.classList.remove('playing');
  }
  function clearPlayTimer() {
    if (playTimer) { window.clearTimeout(playTimer); playTimer = null; }
  }
  function pausePlayback() {
    state.playing = false;
    clearPlayTimer();
    updatePlayBtn();
  }
  function tickPlayback() {
    clearPlayTimer();
    if (!state.playing) return;
    var last = Math.max(0, totalCycleCount() - 1);
    if (state.cycle >= last) { pausePlayback(); return; }
    playTimer = window.setTimeout(function () {
      if (!state.playing) return;
      state.cycle = Math.min(state.cycle + 1, Math.max(0, totalCycleCount() - 1));
      renderArray();
      renderTimeline();
      updateHookSummary();
      if (state.cycle >= totalCycleCount() - 1) { pausePlayback(); return; }
      tickPlayback();
    }, state.speed);
  }
  function startPlayback() {
    if (!lastResult || state.playing) return;
    if (state.cycle >= totalCycleCount() - 1) state.cycle = 0;
    state.playing = true;
    updatePlayBtn();
    renderArray();
    renderTimeline();
    tickPlayback();
  }
  function seekCycle(t) {
    pausePlayback();
    state.cycle = clamp(Math.round(t), 0, Math.max(0, totalCycleCount() - 1));
    renderArray();
    renderTimeline();
    updateHookSummary();
  }
  function nextCycle() {
    if (!lastResult) return 0;
    pausePlayback();
    state.cycle = Math.min(state.cycle + 1, Math.max(0, totalCycleCount() - 1));
    renderArray();
    renderTimeline();
    updateHookSummary();
    return state.cycle;
  }
  function prevCycle() {
    if (!lastResult) return 0;
    pausePlayback();
    state.cycle = Math.max(state.cycle - 1, 0);
    renderArray();
    renderTimeline();
    updateHookSummary();
    return state.cycle;
  }

  function startPulseLoop() {
    var lastTick = 0;
    function loop(ts) {
      if (ts - lastTick > 420) {
        lastTick = ts;
        pulseOn = pulseOn ? 0 : 1;
        if (lastResult) renderArray();
      }
      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
  }

  /* =========================================================================
   * §10 Hooks
   * ======================================================================= */
  function updateHookSummary() {
    if (!window.__SA_APP) return;
    if (!lastResult) { state.summary = null; return; }
    var mv = metricsView();
    var p = lastResult.paper || {};
    state.summary = {
      p_pe: mv.ppe,
      p_out: mv.pout,
      p_numeric: mv.pnum,
      p_mac: mv.pmac,
      path_p_pe: mv.pathPpe,
      Cnorm: mv.Cnorm,
      M: mv.M,
      R: mv.R,
      S: mv.S,
      Shat: mv.Shat,
      relErr: mv.relErr,
      maxAbsErr: mv.maxAbsErr,
      lambda: mv.lambda,
      masked: mv.masked,
      usedSeed: num(lastResult.usedSeed),
      affectedType: (lastResult.affected && lastResult.affected.type) || null,
      affectedPEType: (lastResult.affectedPEs && lastResult.affectedPEs.type) || null,
      paperType: p.type || null,
      paperMatches: (typeof p.matches === 'boolean') ? p.matches : null,
      totalCycles: totalCycleCount(),
      cycle: state.cycle,
      cyclesRecorded: state.cyclesRecorded,
      simMs: state.simMs
    };
  }

  function run(config) {
    var cfg = (config && typeof config === 'object') ? config : {};
    if (typeof config === 'string') cfg = { dataflow: config };
    var f = (cfg.fault && typeof cfg.fault === 'object') ? cfg.fault : {};

    function pick(k) {
      if (cfg[k] !== undefined && cfg[k] !== null) return cfg[k];
      if (f[k] !== undefined && f[k] !== null) return f[k];
      return undefined;
    }

    var v;
    v = pick('dataflow'); if (v !== undefined) applyDataflow(v);
    v = pick('register'); if (v !== undefined) applyRegister(v);
    v = pick('N');
    if (v !== undefined) {
      var nN = Math.round(Number(v));
      if (isFinite(nN) && nN > 0) {
        state.N = nN;
        state.m = clamp(state.m, 0, nN - 1);
        state.n = clamp(state.n, 0, nN - 1);
      }
    }
    v = pick('m');
    if (v !== undefined && isFinite(Number(v))) state.m = clamp(Math.round(Number(v)), 0, state.N - 1);
    v = pick('n');
    if (v !== undefined && isFinite(Number(v))) state.n = clamp(Math.round(Number(v)), 0, state.N - 1);
    v = pick('bit');
    if (v !== undefined && isFinite(Number(v))) state.bit = clamp(Math.round(Number(v)), 0, 31);
    v = pick('dir');
    if (v !== undefined) state.dir = (Number(v) === 1) ? 1 : 0;
    v = pick('mode');
    if (v !== undefined) {
      var mo = String(v).toLowerCase();
      if (mo === 'permanent' || mo === 'transient') state.mode = mo;
    }
    v = pick('cycle');
    if (v !== undefined && isFinite(Number(v)) && Number(v) >= 0) state.faultCycle = Math.round(Number(v));
    v = pick('lambda');
    if (v !== undefined && isFinite(Number(v))) state.lambda = clamp(Number(v), 0, 2);
    v = pick('seed');
    if (v !== undefined && isFinite(Number(v)) && Number(v) > 0) state.seed = Math.round(Number(v));

    if (state.mode === 'transient' && !isNum(state.faultCycle)) state.faultCycle = defaultFaultCycle();

    syncControlsFromState();
    var res = recompute({});
    updateHookSummary();
    return res;
  }

  function getLastResult() { return lastResult; }

  var APP = {
    ready: false,
    state: state,
    errors: errors,
    run: run,
    setFault: setFault,
    setDataflow: setDataflow,
    nextCycle: nextCycle,
    prevCycle: prevCycle,
    getLastResult: getLastResult,
    /* 非契约扩展，便于联调 */
    play: startPlayback,
    pause: pausePlayback,
    seek: seekCycle,
    recompute: recompute,
    render: function () { renderAll(); },
    engine: engine
  };
  window.__SA_APP = APP;

  /* =========================================================================
   * §11 Error 捕获 / Boot
   * ======================================================================= */
  function pushError(msg) {
    var text = String(msg === null || msg === undefined ? '未知错误' : msg);
    errors.push(text);
    if (errors.length > 50) errors.splice(0, errors.length - 50);
    var banner = $('err-banner');
    var t = $('err-text');
    if (banner && t) {
      t.textContent = text;
      banner.title = text;
      banner.hidden = false;
    }
  }
  APP.pushError = pushError;

  window.addEventListener('error', function (e) {
    /* 资源加载失败（如 model.js 缺失）由引擎轮询统一报告，避免重复入队 */
    if (e && e.target && e.target !== window && e.target.tagName) return;
    var msg = 'JS 运行时错误: ' + ((e && e.message) ? e.message : 'unknown');
    if (e && e.filename) msg += ' @' + String(e.filename).split('/').pop() + ':' + (e.lineno || 0);
    pushError(msg);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    pushError('未处理的 Promise 拒绝: ' + (r && r.message ? r.message : String(r)));
  });

  function renderAll() {
    renderArray();
    renderTimeline();
    renderMatrices();
    renderMetrics();
    renderScope();
    renderTiling();
    updateHookSummary();
  }

  function boot() {
    bindControls();
    syncControlsFromState();
    renderAll();               /* 先画占位，保证绝不白屏 */
    setEngineStatus('loading', '正在加载仿真引擎…');
    bootOverlay(true, '正在初始化仿真引擎…', false);
    startPulseLoop();
    pollEngine();
  }

  function pollEngine() {
    var tries = 0;
    function attempt() {
      if (simEngine()) {
        var M = getModel();
        engine.ok = true;
        engine.version = M.VERSION ? String(M.VERSION) : '—';
        state.engineReady = true;
        setEngineStatus('ok', 'SA.Model ' + engine.version);
        bootOverlay(false);
        var res = recompute({});
        APP.ready = !!res;
        if (!res) bootOverlay(true, '仿真引擎已加载，但首次仿真失败，请查看顶部错误横幅。', true);
        return;
      }
      if (tries >= 30) {        /* 3 秒 = 100ms × 30 */
        engine.ok = false;
        setEngineStatus('bad', '仿真引擎未加载');
        bootOverlay(true, '仿真引擎未加载：js/model.js 缺失或存在语法错误。控件可用，但无法仿真。', true);
        pushError('仿真引擎未加载：window.SA.Model 在 3 秒内未就绪（请确认 js/model.js 存在且无语法错误）。');
        APP.ready = false;
        return;
      }
      tries++;
      window.setTimeout(attempt, 100);
    }
    attempt();
  }

  window.addEventListener('resize', function () {
    window.clearTimeout(APP._rz);
    APP._rz = window.setTimeout(function () {
      renderArray();
      renderMatrices();
      renderTiling();
    }, 120);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
