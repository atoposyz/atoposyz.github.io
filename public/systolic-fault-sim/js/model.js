/* ============================================================================
 * web/js/model.js —— 脉动阵列（Systolic Array）故障传播模拟器  (v2)
 *
 * 规格来源：web/CONTRACT.md §9（v2 定稿，覆盖 §8）。
 * 纯浏览器端、无依赖、无 ES module、无构建；加载后挂载 window.SA.Model。
 *
 * 物理模型（作者纠正版）
 * ---------------------
 * 一个 tile = 一次 N×N×N 方阵乘，K ≡ N，总周期 3N-2。
 *
 *   WS（weight stationary）：PE(r,c) 驻留 B[r][c]；
 *       输入按行 skew：A[t][r] 在 cycle t+r 进入 row r 左边界，每拍右移一格；
 *       psum 自上而下：s = psum(上一行, 上一拍) + A[t][r]·B[r][c]，其中 t = τ-r-c；
 *       底行 r=N-1 在 cycle τ 写出 C[t][c]，t = τ-(N-1)-c。
 *
 *   IS（input stationary）= WS 的转置：PE(r,c) 驻留 A[r][c]；
 *       权重按列 skew：B[c][t] 在 cycle t+c 进入 column c 顶部，每拍下移一格；
 *       psum 自左向右：s = psum(左邻, 上一拍) + A[r][c]·B[c][t]，t = τ-r-c；
 *       右边界 c=N-1 在 cycle τ 写出 C[r][t]，t = τ-r-(N-1)。
 *
 *   OS（output stationary）：psum 驻留；A[r][k] 沿行右流、B[k][c] 沿列下流，
 *       在 τ = k+r+c 对齐，本地累加，k=N-1 时写出 C[r][c]。
 *
 * 为什么这样才对
 * --------------
 * psum 是"自上而下流经每一个 PE 的部分和流"（WS/IS）。故障 PE(m,n) 在相邻 cycle 里
 * 承载的是**不同输出行**的部分和，所以该 PE 寄存器一旦被改写，经过它的每一个部分和
 * 都错 → 该列（WS）/该行（IS）的**所有输出行/列**都错；同时被永久改写的输入/权重值
 * 还会沿通道继续流，污染下游所有 PE。因此必须区分：
 *   阵列空间 affectedPEs —— 哪些 PE 的累加器被污染（= 阵列行/列是归约下标）
 *   输出空间 affected    —— 输出矩阵 C 的哪些元素算错（t 是被归约的输入下标）
 * WS/IS 下两者不是同一套坐标（这正是 v1 的错误来源）。
 *
 * 故障注入
 * --------
 * 单比特 stuck-at（fp32：31=sign, 30..23=exponent, 22..0=mantissa）。
 * permanent：寄存器每次被写入都施加；transient：只在指定 cycle 施加。
 * 被改写的流动值会继续沿通道移位（物理正确）；驻留寄存器的 transient 只影响那一拍。
 * ==========================================================================*/
(function (global) {
  'use strict';

  /* ==================================================================== *
   * 0. 常量
   * ==================================================================== */
  var VERSION = '2.0';
  var DATAFLOWS = Object.freeze(['WS', 'OS', 'IS']);
  var REGISTERS = Object.freeze(['input', 'weight', 'psum']);
  var DEFAULT_LAMBDA = 0.8;
  // 受影响判据：只要输出与金标准有可分辨的差异就算"算错"。
  // 注意：无故障两遍仿真的计算完全一致，结果是逐位相同的，所以阈值只需过滤浮点噪声，
  // 不能设成 1e-6 这类绝对阈值（否则低位尾数故障会被误判成"完全掩蔽"）。
  // "完全掩蔽"另由"寄存器写入是否有任何一次真的被改写"来判定（metrics.changedWrites === 0）。
  var AFFECT_TOL_REL = 1e-12;
  var MAX_LOG = 200;
  var BIG = 1e30;

  // 论文正文（§2.3）口径 —— 这是**阵列空间**的表述
  var PAPER_SHAPES = {
    WS: { input: 'rect', weight: 'column', psum: 'column' },
    OS: { input: 'rect', weight: 'rect', psum: 'column' },
    IS: { input: 'row', weight: 'rect', psum: 'row' }
  };

  var REGION_TEXT = {
    rect: '右下矩形',
    row: '行',
    column: '列',
    cell: '单点',
    none: '无',
    irregular: '不规则区域'
  };

  // fp32 位视图（复用同一块内存）
  var F32 = new Float32Array(1);
  var U32 = new Uint32Array(F32.buffer);

  /* ==================================================================== *
   * 1. 基础工具
   * ==================================================================== */
  function clampInt(value, fallback, min, max) {
    var n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    n = Math.round(n);
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function clampNumber(value, fallback, min, max) {
    var n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function makeZero2D(n) {
    var m = new Array(n);
    for (var i = 0; i < n; i++) {
      var row = new Array(n);
      for (var j = 0; j < n; j++) row[j] = 0;
      m[i] = row;
    }
    return m;
  }

  function fmt(x) {
    if (typeof x !== 'number' || !Number.isFinite(x)) return String(x);
    var a = Math.abs(x);
    if (a !== 0 && (a < 1e-4 || a >= 1e6)) return x.toExponential(3);
    return String(Math.round(x * 1e6) / 1e6);
  }

  function pushLog(log, t, text) {
    if (log.length >= MAX_LOG) return;
    log.push({ t: t, text: text });
  }

  function mulberry32(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cellKey(r, c) {
    return r + ',' + c;
  }

  function sameCellSet(a, b) {
    if (a.length !== b.length) return false;
    var sa = new Set(), sb = new Set(), i;
    for (i = 0; i < a.length; i++) sa.add(cellKey(a[i][0], a[i][1]));
    for (i = 0; i < b.length; i++) sb.add(cellKey(b[i][0], b[i][1]));
    var same = true;
    sa.forEach(function (k) { if (!sb.has(k)) same = false; });
    return same;
  }

  /* ==================================================================== *
   * 2. fp32 位操作
   * ==================================================================== */
  function bitField() {
    return { sign: [31, 31], exponent: [30, 23], mantissa: [22, 0] };
  }

  function applyStuckAt(x, bit, dir) {
    if (!Number.isFinite(x) || x === 0) return x;
    var b = clampInt(bit, 0, 0, 31);
    F32[0] = x;
    var u = U32[0];
    if (dir) {
      u = (u | (1 << b)) >>> 0;
    } else {
      u = (u & ~(1 << b)) >>> 0;
    }
    U32[0] = u;
    return F32[0];
  }

  /* ==================================================================== *
   * 3. 数据生成（确定性）
   * ==================================================================== */
  // 幅值区间：全部为正、0.090 ≤ x < 0.120。
  // fp32 指数落在 120~123，bit25 恒为 0；乘积 0.0081~0.0144、部分和 0.008~0.115 也都 < 0.125，
  // 因此默认 bit=25 / stuck-at-1 会改变**每一个**操作数与部分和，传播区域是完整形状；
  // 换成 stuck-at-0 则恰好演示"完全掩蔽"。若想要正负混合的数据，可在 UI 里换一组随机数据。
  var MAG_RANGES = [
    [0.090, 0.120]
  ];

  function generateAB(N, seed) {
    var rnd = mulberry32(seed);
    var A = new Array(N), B = new Array(N);
    var r, k, c, mag, v, w;
    mag = MAG_RANGES[0];
    for (r = 0; r < N; r++) {
      A[r] = new Array(N);
      for (k = 0; k < N; k++) {
        v = mag[0] + rnd() * (mag[1] - mag[0]);
        A[r][k] = Math.fround(v);
      }
    }
    for (k = 0; k < N; k++) {
      B[k] = new Array(N);
      for (c = 0; c < N; c++) {
        w = mag[0] + rnd() * (mag[1] - mag[0]);
        B[k][c] = Math.fround(w);
      }
    }
    return { A: A, B: B };
  }

  function normalizeValues(values, N) {
    if (!values || typeof values !== 'object') return null;
    var srcA = values.A, srcB = values.B;
    if (!Array.isArray(srcA) || !Array.isArray(srcB)) return null;
    if (srcA.length < N || srcB.length < N) return null;
    var A = new Array(N), B = new Array(N), r, k, c, row, v;
    for (r = 0; r < N; r++) {
      row = srcA[r];
      if (!row || row.length < N) return null;
      A[r] = new Array(N);
      for (k = 0; k < N; k++) {
        v = Number(row[k]);
        A[r][k] = Number.isFinite(v) ? Math.fround(v) : 0;
      }
    }
    for (k = 0; k < N; k++) {
      row = srcB[k];
      if (!row || row.length < N) return null;
      B[k] = new Array(N);
      for (c = 0; c < N; c++) {
        v = Number(row[c]);
        B[k][c] = Number.isFinite(v) ? Math.fround(v) : 0;
      }
    }
    return { A: A, B: B };
  }

  /* ==================================================================== *
   * 4. 区域几何（论文正文口径：阵列空间）
   * ==================================================================== */
  function buildRegionCells(type, N, m, n) {
    var cells = [], r, c;
    if (type === 'cell') {
      cells.push([m, n]);
    } else if (type === 'row') {
      for (c = n; c < N; c++) cells.push([m, c]);
    } else if (type === 'column') {
      for (r = m; r < N; r++) cells.push([r, n]);
    } else if (type === 'rect') {
      for (r = m; r < N; r++) for (c = n; c < N; c++) cells.push([r, c]);
    }
    return cells;
  }

  function classifyCells(cells) {
    var len = cells.length;
    if (len === 0) return 'none';
    var r0 = Infinity, r1 = -Infinity, c0 = Infinity, c1 = -Infinity, i;
    for (i = 0; i < len; i++) {
      if (cells[i][0] < r0) r0 = cells[i][0];
      if (cells[i][0] > r1) r1 = cells[i][0];
      if (cells[i][1] < c0) c0 = cells[i][1];
      if (cells[i][1] > c1) c1 = cells[i][1];
    }
    if (len === 1) return 'cell';
    if (r0 === r1) return 'row';
    if (c0 === c1) return 'column';
    if ((r1 - r0 + 1) * (c1 - c0 + 1) === len) return 'rect';
    return 'irregular';
  }

  // 依据实际集合给出中文描述（区分"整列/列段"、"右侧整块/右下矩形"）
  function describeRegion(cells, N) {
    var type = classifyCells(cells);
    if (type === 'none') return REGION_TEXT.none;
    if (type === 'cell') return REGION_TEXT.cell;
    var r0 = Infinity, r1 = -Infinity, c0 = Infinity, c1 = -Infinity, i;
    for (i = 0; i < cells.length; i++) {
      if (cells[i][0] < r0) r0 = cells[i][0];
      if (cells[i][0] > r1) r1 = cells[i][0];
      if (cells[i][1] < c0) c0 = cells[i][1];
      if (cells[i][1] > c1) c1 = cells[i][1];
    }
    if (type === 'row') return (c0 === 0 ? '整行' : '行段');
    if (type === 'column') return (r0 === 0 ? '整列' : '列段');
    if (r0 === 0 && c0 > 0) return '右侧整块（全高）';
    if (c0 === 0 && r0 > 0) return '下侧整块';
    return REGION_TEXT.rect;
  }

  function paperRegion(opts) {
    var o = opts || {};
    var N = clampInt(o.N, 8, 1, 64);
    var m = clampInt(o.m, 2, 0, N - 1);
    var n = clampInt(o.n, 3, 0, N - 1);
    var dataflow = DATAFLOWS.indexOf(o.dataflow) >= 0 ? o.dataflow : 'WS';
    var register = REGISTERS.indexOf(o.register) >= 0 ? o.register : 'input';
    var type = PAPER_SHAPES[dataflow][register];
    var cells = buildRegionCells(type, N, m, n);
    return { type: type, cells: cells, p: cells.length, text: describeRegion(cells, N) };
  }

  /* ==================================================================== *
   * 5. 故障配置
   * ==================================================================== */
  function normalizeFault(raw, N) {
    var f = (raw && typeof raw === 'object') ? raw : {};
    var enabled = !!raw && f.enabled !== false;
    var m = clampInt(f.m, 2, 0, N - 1);
    var n = clampInt(f.n, 3, 0, N - 1);
    var register = REGISTERS.indexOf(f.register) >= 0 ? f.register : 'input';
    var bit = clampInt(f.bit, 25, 0, 31);
    var dir = Number(f.dir) === 0 ? 0 : 1;
    var mode = (f.mode === 'transient') ? 'transient' : 'permanent';
    var lastCycle = 3 * N - 3;
    var cycle = null;
    if (mode === 'transient') {
      var given = (f.cycle === null || f.cycle === undefined || f.cycle === '') ? NaN : Number(f.cycle);
      if (Number.isFinite(given)) {
        cycle = Math.round(given);
        if (cycle < 0 || cycle > lastCycle) cycle = null;
      }
      if (cycle === null) cycle = m + n + Math.floor((N - 1) / 2);
    }
    return {
      enabled: enabled, m: m, n: n, register: register,
      bit: bit, dir: dir, mode: mode, cycle: cycle
    };
  }

  /* ==================================================================== *
   * 6. 单遍仿真（v2 核心）
   *
   * WS：驻留 B[r][c]；a 按行 skew 右移；psum 向下；底行写 C[t][c]
   * IS：驻留 A[r][c]；w 按列 skew 下移；psum 向右；右边界写 C[r][t]
   * OS：psum 驻留；a 右移、w 下移；k=N-1 时写 C[r][c]
   *
   * 返回 { C, cycles, dirtyCells, stats, log }
   *   dirtyCells：阵列空间里累加器被污染的 PE 列表
   * ==================================================================== */
  function runPass(N, dataflow, A, B, fault, withFault, record) {
    var NN = N * N;
    var T = 3 * N - 2;
    var isWS = dataflow === 'WS';
    var isIS = dataflow === 'IS';
    var isOS = dataflow === 'OS';

    var prevA = new Float64Array(NN);
    var prevW = new Float64Array(NN);
    var prevS = new Float64Array(NN);
    var nextA = new Float64Array(NN);
    var nextW = new Float64Array(NN);
    var nextS = new Float64Array(NN);

    var dirtyA = new Uint8Array(NN);
    var dirtyW = new Uint8Array(NN);
    var dirtyS = new Uint8Array(NN);
    var nextDA = new Uint8Array(NN);
    var nextDW = new Uint8Array(NN);
    var nextDS = new Uint8Array(NN);

    var C = makeZero2D(N);
    var written = makeZero2D(N);
    var dirtyMap = {};
    var cycles = record ? new Array(T) : null;
    var log = [];
    var stats = { writes: 0, changed: 0, ratioSum: 0 };
    var injectedLogged = false;
    var targetI = (withFault && fault.enabled) ? (fault.m * N + fault.n) : -1;
    var reg = fault.register;
    var permanent = fault.mode === 'permanent';
    var injectCycle = fault.cycle;

    var t, r, c, i, tau, k, aIn, wIn, sIn, s, dA, dW, dS, prod;
    var isTarget, injectHere, changed, before;

    pushLog(log, 0, 'v2 仿真：' + dataflow + '，' + N + '×' + N + ' 阵列，K=N=' + N +
      '，共 ' + T + ' 周期。');

    for (tau = 0; tau < T; tau++) {
      var out = [];
      var pes = record ? new Array(NN) : null;

      for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++) {
          i = r * N + c;
          aIn = 0; wIn = 0; sIn = 0;
          dA = 0; dW = 0; dS = 0;

          if (isWS) {
            /* 输入：按行 skew 右移（第 r 行晚 r 拍进入） */
            var ka = tau - r;
            if (c === 0) {
              aIn = (ka >= 0 && ka < N) ? A[ka][r] : 0;
            } else {
              aIn = prevA[i - 1];
              dA = dirtyA[i - 1];
            }
            /* 权重：驻留 */
            wIn = B[r][c];
            dW = 0;
            /* 故障注入（在目标 PE 上，与列位置无关） */
            isTarget = (i === targetI);
            injectHere = isTarget && (permanent || tau === injectCycle);
            if (injectHere && reg === 'input' && aIn !== 0) {
              before = aIn;
              aIn = applyStuckAt(aIn, fault.bit, fault.dir);
              stats.writes++;
              if (aIn !== before) { stats.changed++; stats.ratioSum += ratio(before, aIn); dA = 1; }
            }
            if (injectHere && reg === 'weight') {
              before = wIn;
              wIn = applyStuckAt(wIn, fault.bit, fault.dir);
              stats.writes++;
              if (wIn !== before) { stats.changed++; stats.ratioSum += ratio(before, wIn); dW = 1; }
            }
            /* psum：自上一行、上一拍传来 */
            sIn = (r === 0) ? 0 : prevS[i - N];
            dS = (r === 0) ? 0 : dirtyS[i - N];

            prod = Math.fround(aIn * wIn);
            s = Math.fround(sIn + prod);

            if (dA || dW) dS = 1;

            isTarget = (i === targetI);
            injectHere = isTarget && (permanent || tau === injectCycle);
            if (injectHere && reg === 'psum') {
              before = s;
              s = applyStuckAt(s, fault.bit, fault.dir);
              stats.writes++;
              if (s !== before) { stats.changed++; stats.ratioSum += ratio(before, s); dS = 1; }
            }

            nextA[i] = aIn; nextW[i] = wIn; nextS[i] = s;
            nextDA[i] = dA ? 1 : 0; nextDW[i] = dW ? 1 : 0; nextDS[i] = dS ? 1 : 0;
            if (dS) dirtyMap[cellKey(r, c)] = 1;

            if (r === N - 1) {
              t = tau - (N - 1) - c;
              if (t >= 0 && t < N) {
                C[t][c] = s;
                written[t][c] = 1;
                out.push({ r: r, c: c, t: t, value: s });
              }
            }
            if (record) pes[i] = { r: r, c: c, a: aIn, w: wIn, s: s, faulted: !!(dA || dW || dS), dirty: !!dS };

          } else if (isIS) {
            /* 输入：驻留（与行/列位置无关，恒为 A[r][c]） */
            aIn = A[r][c];
            /* 权重：按列 skew 下移（第 c 列晚 c 拍进入） */
            var kw = tau - c;
            if (r === 0) {
              wIn = (kw >= 0 && kw < N) ? B[c][kw] : 0;
            } else {
              wIn = prevW[i - N];
              dW = dirtyW[i - N];
            }
            /* 故障注入（在目标 PE 上，与行位置无关） */
            isTarget = (i === targetI);
            injectHere = isTarget && (permanent || tau === injectCycle);
            if (injectHere && reg === 'input') {
              before = aIn;
              aIn = applyStuckAt(aIn, fault.bit, fault.dir);
              stats.writes++;
              if (aIn !== before) { stats.changed++; stats.ratioSum += ratio(before, aIn); dA = 1; }
            }
            if (injectHere && reg === 'weight' && wIn !== 0) {
              before = wIn;
              wIn = applyStuckAt(wIn, fault.bit, fault.dir);
              stats.writes++;
              if (wIn !== before) { stats.changed++; stats.ratioSum += ratio(before, wIn); dW = 1; }
            }
            /* psum：自左邻、上一拍传来 */
            sIn = (c === 0) ? 0 : prevS[i - 1];
            dS = (c === 0) ? 0 : dirtyS[i - 1];

            prod = Math.fround(aIn * wIn);
            s = Math.fround(sIn + prod);
            if (dA || dW) dS = 1;

            isTarget = (i === targetI);
            injectHere = isTarget && (permanent || tau === injectCycle);
            if (injectHere && reg === 'psum') {
              before = s;
              s = applyStuckAt(s, fault.bit, fault.dir);
              stats.writes++;
              if (s !== before) { stats.changed++; stats.ratioSum += ratio(before, s); dS = 1; }
            }

            nextA[i] = aIn; nextW[i] = wIn; nextS[i] = s;
            nextDA[i] = dA ? 1 : 0; nextDW[i] = dW ? 1 : 0; nextDS[i] = dS ? 1 : 0;
            if (dS) dirtyMap[cellKey(r, c)] = 1;

            if (c === N - 1) {
              t = tau - r - (N - 1);
              if (t >= 0 && t < N) {
                C[r][t] = s;
                written[r][t] = 1;
                out.push({ r: r, c: c, t: t, value: s });
              }
            }
            if (record) pes[i] = { r: r, c: c, a: aIn, w: wIn, s: s, faulted: !!(dA || dW || dS), dirty: !!dS };

          } else { /* OS */
            k = tau - r - c;
            var active = (k >= 0 && k < N);
            /* 输入右移 */
            if (c === 0) {
              aIn = active ? A[r][k] : 0;
              dA = 0;
            } else {
              aIn = prevA[i - 1];
              dA = dirtyA[i - 1];
            }
            /* 权重下移 */
            if (r === 0) {
              wIn = active ? B[k][c] : 0;
              dW = 0;
            } else {
              wIn = prevW[i - N];
              dW = dirtyW[i - N];
            }
            isTarget = (i === targetI);
            injectHere = active && isTarget && (permanent || tau === injectCycle);
            if (injectHere && reg === 'input') {
              before = aIn;
              aIn = applyStuckAt(aIn, fault.bit, fault.dir);
              stats.writes++;
              if (aIn !== before) { stats.changed++; stats.ratioSum += ratio(before, aIn); dA = 1; }
            }
            if (injectHere && reg === 'weight') {
              before = wIn;
              wIn = applyStuckAt(wIn, fault.bit, fault.dir);
              stats.writes++;
              if (wIn !== before) { stats.changed++; stats.ratioSum += ratio(before, wIn); dW = 1; }
            }

            s = prevS[i];
            dS = dirtyS[i];
            if (active) {
              s = Math.fround(s + Math.fround(aIn * wIn));
              if (dA || dW) dS = 1;
            }
            if (injectHere && reg === 'psum') {
              before = s;
              s = applyStuckAt(s, fault.bit, fault.dir);
              stats.writes++;
              if (s !== before) { stats.changed++; stats.ratioSum += ratio(before, s); dS = 1; }
            }

            nextA[i] = aIn; nextW[i] = wIn; nextS[i] = s;
            nextDA[i] = dA ? 1 : 0; nextDW[i] = dW ? 1 : 0; nextDS[i] = dS ? 1 : 0;
            if (dS) dirtyMap[cellKey(r, c)] = 1;

            if (active && k === N - 1) {
              C[r][c] = s;
              written[r][c] = 1;
              out.push({ r: r, c: c, t: c, value: s });
            }
            if (record) pes[i] = { r: r, c: c, a: aIn, w: wIn, s: s, faulted: !!(dA || dW || dS), dirty: !!dS };
          }
        }
      }

      if (record) cycles[tau] = { t: tau, pes: pes, out: out };

      var tmp;
      tmp = prevA; prevA = nextA; nextA = tmp;
      tmp = prevW; prevW = nextW; nextW = tmp;
      tmp = prevS; prevS = nextS; nextS = tmp;
      tmp = dirtyA; dirtyA = nextDA; nextDA = tmp;
      tmp = dirtyW; dirtyW = nextDW; nextDW = tmp;
      tmp = dirtyS; dirtyS = nextDS; nextDS = tmp;
    }

    if (withFault && fault.enabled && !injectedLogged) {
      pushLog(log, 0, '注入未生效（该寄存器的目标位在本次数据下未被改写）。');
    }

    var dirtyCells = Object.keys(dirtyMap).map(function (key) {
      var parts = key.split(',');
      return [Number(parts[0]), Number(parts[1])];
    });

    return { C: C, cycles: cycles, dirtyCells: dirtyCells, stats: stats, log: log, written: written };
  }

  function ratio(before, after) {
    var denom = Math.abs(before) + 1e-12;
    var v = Math.abs(after - before) / denom;
    return Number.isFinite(v) ? v : 1;
  }

  /* ==================================================================== *
   * 7. 对外主接口
   * ==================================================================== */
  function simulateOnce(opts) {
    var o = (opts && typeof opts === 'object') ? opts : {};
    var N = clampInt(o.N, 8, 1, 64);
    var dataflow = DATAFLOWS.indexOf(o.dataflow) >= 0 ? o.dataflow : 'WS';
    // 固定默认种子 37：保证同一配置在任何时候打开都得到同一组 A、B（可复现）。
    var seed = (o.seed === undefined || o.seed === null) ? 37 : (Math.floor(Number(o.seed)) >>> 0);
    var recordCycles = o.recordCycles !== false;
    var lambda = clampNumber(o.lambda, DEFAULT_LAMBDA, 0, 2);
    var totalCycles = 3 * N - 2;

    var values = normalizeValues(o.values, N);
    var ab = values || generateAB(N, seed);
    var A = ab.A, B = ab.B;
    var fault = normalizeFault(o.fault, N);

    // 金标准：同一 schedule，不注入
    var goldenPass = runPass(N, dataflow, A, B, fault, false, false);
    var faultyPass = runPass(N, dataflow, A, B, fault, true, recordCycles);

    var goldenC = goldenPass.C;
    var faultyC = faultyPass.C;

    /* ---- 误差与受影响输出（输出空间） ---- */
    var maxAbsGolden = 0, r, c;
    for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
      var gv = Math.abs(goldenC[r][c]);
      if (gv > maxAbsGolden) maxAbsGolden = gv;
    }
    var tol = AFFECT_TOL_REL * Math.max(1, maxAbsGolden);

    var abs = makeZero2D(N), rel = makeZero2D(N);
    var cells = [], maxAbsErr = 0, frobG2 = 0, frobD2 = 0;
    for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
      var g = goldenC[r][c], fv = faultyC[r][c], ad;
      if (g === fv) ad = 0;
      else if (Number.isNaN(g) && Number.isNaN(fv)) ad = 0;
      else if (Number.isFinite(g) && Number.isFinite(fv)) ad = Math.abs(fv - g);
      else ad = BIG;
      abs[r][c] = ad;
      var rl = ad / (Math.abs(g) + 1e-12);
      rel[r][c] = Number.isFinite(rl) ? rl : BIG;
      if (ad > maxAbsErr) maxAbsErr = ad;
      if (ad > tol) cells.push([r, c]);
      var gs = Number.isFinite(g) ? g : 0;
      var ds = Number.isFinite(fv) ? (fv - g) : BIG;
      frobG2 += gs * gs;
      frobD2 += ds * ds;
    }

    var relErr = Math.sqrt(frobD2) / Math.max(Math.sqrt(frobG2), 1e-30);
    if (!Number.isFinite(relErr)) relErr = BIG;

    /* ---- 指标 ---- */
    var dirtyCells = (fault.enabled && faultyPass.stats.changed > 0) ? faultyPass.dirtyCells : [];
    if (!fault.enabled) dirtyCells = [];
    var pPe = dirtyCells.length;                 // 阵列空间
    var pOut = cells.length;                     // 输出空间
    var pMac = pPe * N;
    var pMin = N, pMax = N * N * N;
    var Cnorm = (pMax > pMin) ? (pMac - pMin) / (pMax - pMin) : 0;
    if (!Number.isFinite(Cnorm)) Cnorm = 0;
    Cnorm = Math.min(1, Math.max(0, Cnorm));

    var M = 0, R = 0;
    if (fault.enabled && faultyPass.stats.changed > 0) {
      M = faultyPass.stats.ratioSum / faultyPass.stats.changed;
      if (!Number.isFinite(M)) M = 0;
    }
    if (fault.enabled && faultyPass.stats.writes > 0) {
      R = faultyPass.stats.changed / faultyPass.stats.writes;
      if (!Number.isFinite(R)) R = 0;
    }
    R = Math.min(1, Math.max(0, R));

    var S = M + lambda * Cnorm * M;
    var Shat = R * M * (1 + lambda * Cnorm);

    /* ---- 两套掩码 ---- */
    var affectedPEs = {
      cells: dirtyCells,
      p_pe: pPe,
      type: classifyCells(dirtyCells),
      text: describeRegion(dirtyCells, N)
    };
    var affected = {
      cells: cells,
      p_pe: pOut,
      p_mac: pOut * N,
      type: classifyCells(cells),
      text: describeRegion(cells, N)
    };

    /* ---- 论文正文口径（阵列空间）对照 ---- */
    var paperBase = paperRegion({ N: N, m: fault.m, n: fault.n, dataflow: dataflow, register: fault.register });
    var paper = {
      type: paperBase.type,
      cells: paperBase.cells,
      p: paperBase.p,
      text: paperBase.text,
      matches: sameCellSet(dirtyCells, paperBase.cells)
    };

    var log = faultyPass.log;
    if (o.values && !values) {
      log.unshift({ t: 0, text: 'values 维度不合法（需要 A、B 均为 N×N），已回退到 seed 生成数据。' });
    }
    pushLog(log, totalCycles - 1,
      '结束：阵列空间 p_pe=' + pPe + '，输出空间 p_out=' + pOut +
      '，M=' + fmt(M) + '，R=' + fmt(R) + '，C(' + pPe + ')=' + fmt(Cnorm) +
      '，S=' + fmt(S) + '，Ŝ=' + fmt(Shat) + '，relErr=' + fmt(relErr) + '。');

    var metrics = {
      M: M, R: R, Cnorm: Cnorm, lambda: lambda, S: S, Shat: Shat,
      relErr: relErr, maxAbsErr: maxAbsErr,
      p_pe: pPe, p_mac: pMac, p_out: pOut, p_numeric: pOut, masked: false,
      // 寄存器层面的统计：writes = 故障寄存器被真正写入的次数，
      // changedWrites = 其中被 stuck-at 真正改写的次数（=0 才是"完全掩蔽"）
      writes: fault.enabled ? faultyPass.stats.writes : 0,
      changedWrites: fault.enabled ? faultyPass.stats.changed : 0
    };

    return {
      config: {
        N: N, K: N, dataflow: dataflow, fault: fault, seed: seed
      },
      totalCycles: totalCycles,
      cycles: recordCycles ? faultyPass.cycles : [],
      golden: { C: goldenC },
      faulty: { C: faultyC },
      delta: { abs: abs, rel: rel },
      affected: affected,
      affectedPEs: affectedPEs,
      paper: paper,
      metrics: metrics,
      log: log,
      usedSeed: seed,
      faultWindow: {
        start: fault.m + fault.n,
        end: fault.m + fault.n + N - 1,
        count: N
      },
      cellInfo: function (row, col) {
        var rr = Math.floor(Number(row)), cc = Math.floor(Number(col));
        if (!(rr >= 0 && rr < N && cc >= 0 && cc < N)) return null;
        return {
          golden: goldenC[rr][cc],
          faulty: faultyC[rr][cc],
          absErr: abs[rr][cc],
          affected: abs[rr][cc] > tol
        };
      }
    };
  }

  /* ---- 包装层：换种子重试 / masked ---- */
  function cloneOpts(o) {
    var c = {};
    if (o && typeof o === 'object') {
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k];
    }
    return c;
  }

  function simulate(opts) {
    var o = (opts && typeof opts === 'object') ? opts : {};
    var res = simulateOnce(o);

    // 数据种子固定（默认 37）。被掩蔽时**不再自动换种子**：
    // 换数据会让不同 bit / 不同配置的结果不在同一组 A、B 上，破坏可复现性。
    // 掩蔽是数据巧合（该位本来就等于 stuck 值），如实报告，由用户换 bit / 方向 / 数据。
    var masked = !!res.config.fault.enabled && res.metrics.changedWrites === 0;
    res.usedSeed = res.config.seed;
    res.metrics.masked = masked;
    return res;
  }

  /* ==================================================================== *
   * 8. 自检（v2：18 个形状断言）
   * ==================================================================== */
  function fixedValues(N) {
    var A = new Array(N), B = new Array(N), r, k, c;
    for (r = 0; r < N; r++) {
      A[r] = new Array(N);
      for (k = 0; k < N; k++) A[r][k] = Math.fround(0.090 + 0.0005 * ((r * 13 + k * 29) % 60));
    }
    for (k = 0; k < N; k++) {
      B[k] = new Array(N);
      for (c = 0; c < N; c++) B[k][c] = Math.fround(0.090 + 0.00045 * ((k * 17 + c * 23) % 70));
    }
    return { A: A, B: B };
  }

  function referenceC(A, B, N) {
    var C = makeZero2D(N), r, c, k, s;
    for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
      s = 0;
      for (k = 0; k < N; k++) s += A[r][k] * B[k][c];
      C[r][c] = s;
    }
    return C;
  }

  function selfTest() {
    var results = [];
    var N = 8, M_PE = 2, M_COL = 3;
    var V = fixedValues(N);
    var baseFault = { enabled: true, m: M_PE, n: M_COL, bit: 25, dir: 1, mode: 'permanent' };

    function check(name, fn) {
      try {
        var r = fn();
        results.push({ name: name, ok: !!(r && r.ok), detail: String((r && r.detail) !== undefined ? r.detail : '') });
      } catch (err) {
        results.push({ name: name, ok: false, detail: '内部异常：' + (err && err.message ? err.message : String(err)) });
      }
    }

    /* 1. golden = A·B */
    check('1. 三种 dataflow 的 golden 都等于 A·B（误差 < 1e-5）', function () {
      var ref = referenceC(V.A, V.B, N);
      var maxRef = 1, r, c, di, df, res, diff, norm, worst = 0, worstDf = '-';
      for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
        if (Math.abs(ref[r][c]) > maxRef) maxRef = Math.abs(ref[r][c]);
      }
      for (di = 0; di < DATAFLOWS.length; di++) {
        df = DATAFLOWS[di];
        res = simulate({ N: N, dataflow: df, values: V, fault: { enabled: false }, recordCycles: false });
        diff = 0;
        for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
          var d = Math.abs(res.golden.C[r][c] - ref[r][c]);
          var d2 = Math.abs(res.faulty.C[r][c] - ref[r][c]);
          if (d > diff) diff = d;
          if (d2 > diff) diff = d2;
        }
        norm = diff / maxRef;
        if (norm > worst) { worst = norm; worstDf = df; }
      }
      return {
        ok: worst < 1e-5,
        detail: '最大归一化误差 = ' + worst.toExponential(3) + '（最大者 ' + worstDf + '）'
      };
    });

    /* 2. 18 个形状/计数（阵列空间 + 输出空间） */
    check('2. 九种组合的两套掩码（阵列空间 / 输出空间）符合 CONTRACT §9.6', function () {
      var EXPECT = {
        WS: {
          input: { pe: ['rect', 30], out: ['rect', 40] },
          weight: { pe: ['column', 6], out: ['column', 8] },
          psum: { pe: ['column', 6], out: ['column', 8] }
        },
        OS: {
          input: { pe: ['row', 5], out: ['row', 5] },
          weight: { pe: ['column', 6], out: ['column', 6] },
          psum: { pe: ['cell', 1], out: ['cell', 1] }
        },
        IS: {
          input: { pe: ['row', 5], out: ['row', 8] },
          weight: { pe: ['rect', 30], out: ['rect', 48] },
          psum: { pe: ['row', 5], out: ['row', 8] }
        }
      };
      var problems = [], good = 0, di, ri, df, rg, exp, res, fa, oa;
      for (di = 0; di < DATAFLOWS.length; di++) {
        df = DATAFLOWS[di];
        for (ri = 0; ri < REGISTERS.length; ri++) {
          rg = REGISTERS[ri];
          exp = EXPECT[df][rg];
          res = simulate({
            N: N, dataflow: df, values: V,
            fault: { enabled: true, m: M_PE, n: M_COL, register: rg, bit: 25, dir: 1, mode: 'permanent' },
            recordCycles: false
          });
          fa = res.affectedPEs; oa = res.affected;
          var okPe = (fa.type === exp.pe[0]) && (fa.p_pe === exp.pe[1]);
          var okOut = (oa.type === exp.out[0]) && (oa.p_pe === exp.out[1]);
          if (okPe && okOut) good++;
          else problems.push(df + '/' + rg + '：阵列期望 ' + exp.pe.join('/') + ' 实测 ' +
            fa.type + '/' + fa.p_pe + '；输出期望 ' + exp.out.join('/') + ' 实测 ' + oa.type + '/' + oa.p_pe);
        }
      }
      return {
        ok: problems.length === 0,
        detail: problems.length === 0
          ? '18/18 断言通过（阵列空间 9 + 输出空间 9；N=8, (m,n)=(2,3), bit=25, dir=1）'
          : problems.join('；')
      };
    });

    /* 3. fp32 位操作 */
    check('3. applyStuckAt 的符号位、幂等性与位域映射', function () {
      var bad = [];
      var neg = applyStuckAt(1.0, 31, 1);
      if (!(neg < 0)) bad.push('bit31 stuck-at-1 未变成负数');
      if (applyStuckAt(neg, 31, 1) !== neg) bad.push('bit31 不幂等');
      var y = applyStuckAt(0.1, 25, 1);
      if (y === 0.1) bad.push('0.1 的 bit25 stuck-at-1 未改变');
      if (applyStuckAt(y, 25, 1) !== y) bad.push('bit25 不幂等');
      if (applyStuckAt(1.0, 23, 0) !== 0.5) bad.push('bit23 清 0 未把 1.0 变成 0.5');
      if (applyStuckAt(0, 25, 1) !== 0) bad.push('0 被改变');
      if (!Number.isNaN(applyStuckAt(NaN, 25, 1))) bad.push('NaN 被改变');
      if (applyStuckAt(Infinity, 25, 1) !== Infinity) bad.push('Infinity 被改变');
      var bf = bitField();
      if (!bf || bf.sign[0] !== 31 || bf.exponent[0] !== 30 || bf.exponent[1] !== 23 || bf.mantissa[1] !== 0) {
        bad.push('bitField 字段错误');
      }
      return { ok: bad.length === 0, detail: bad.length === 0 ? '符号位/幂等/特殊值/位域均正确' : bad.join('；') };
    });

    /* 4. 指标自洽 */
    check('4. 指标自洽（p_pe/p_mac/p_out/Cnorm/relErr/S/Ŝ）', function () {
      var res = simulate({
        N: N, dataflow: 'WS', values: V,
        fault: Object.assign({}, baseFault, { register: 'input' }),
        recordCycles: false, lambda: 0.8
      });
      var m = res.metrics, a = res.affected, p = res.affectedPEs, bad = [];
      if (p.p_pe !== p.cells.length) bad.push('affectedPEs.p_pe 不等于 cells 长度');
      if (a.p_pe !== a.cells.length) bad.push('affected.p_pe 不等于 cells 长度');
      if (m.p_pe !== p.p_pe) bad.push('metrics.p_pe 与 affectedPEs 不一致');
      if (m.p_out !== a.p_pe) bad.push('metrics.p_out 与 affected 不一致');
      if (m.p_mac !== m.p_pe * N) bad.push('p_mac 不等于 p_pe*N');
      if (!(m.Cnorm >= 0 && m.Cnorm <= 1)) bad.push('Cnorm 越界');
      if (!(Number.isFinite(m.relErr) && m.relErr >= 0)) bad.push('relErr 非法');
      if (!(Number.isFinite(m.M) && m.M >= 0)) bad.push('M 非法');
      if (!(m.R >= 0 && m.R <= 1)) bad.push('R 越界');
      if (Math.abs(m.S - (m.M + m.lambda * m.Cnorm * m.M)) > 1e-12) bad.push('S 公式不自洽');
      if (Math.abs(m.Shat - (m.R * m.M * (1 + m.lambda * m.Cnorm))) > 1e-12) bad.push('Ŝ 公式不自洽');
      if (m.lambda !== 0.8) bad.push('默认 λ 不是 0.8');
      if (res.totalCycles !== 3 * N - 2) bad.push('totalCycles 不等于 3N-2');
      if (p.p_pe < 1) bad.push('阵列空间 p_pe 小于 1');
      if (!(a.p_pe > p.p_pe)) bad.push('WS/input 下输出空间应大于阵列空间');
      return {
        ok: bad.length === 0,
        detail: bad.length === 0
          ? ('p_pe=' + p.p_pe + '，p_out=' + a.p_pe + '，p_mac=' + m.p_mac +
            '，Cnorm=' + fmt(m.Cnorm) + '，M=' + fmt(m.M) + '，R=' + fmt(m.R) +
            '，S=' + fmt(m.S) + '，Ŝ=' + fmt(m.Shat) + '，relErr=' + fmt(m.relErr))
          : bad.join('；')
      };
    });

    /* 5. 注入必生效 */
    check('5. 九种组合的故障都至少影响 1 个输出', function () {
      var bad = [], di, ri, res;
      for (di = 0; di < DATAFLOWS.length; di++) {
        for (ri = 0; ri < REGISTERS.length; ri++) {
          res = simulate({
            N: N, dataflow: DATAFLOWS[di], values: V,
            fault: { enabled: true, m: M_PE, n: M_COL, register: REGISTERS[ri], bit: 25, dir: 1, mode: 'permanent' },
            recordCycles: false
          });
          if (!(res.affected.p_pe >= 1)) bad.push(DATAFLOWS[di] + '/' + REGISTERS[ri]);
        }
      }
      return {
        ok: bad.length === 0,
        detail: bad.length === 0 ? '9 种组合均至少影响 1 个输出元素' : ('未生效：' + bad.join('、'))
      };
    });

    /* 6. 关闭故障时两套掩码归零 */
    check('6. fault.enabled=false 时两套掩码与指标归零', function () {
      var bad = [], di, res;
      for (di = 0; di < DATAFLOWS.length; di++) {
        res = simulate({ N: N, dataflow: DATAFLOWS[di], values: V, fault: { enabled: false }, recordCycles: false });
        if (res.affected.p_pe !== 0 || res.affectedPEs.p_pe !== 0) bad.push(DATAFLOWS[di] + ' 掩码非空');
        if (res.metrics.p_pe !== 0 || res.metrics.p_mac !== 0 || res.metrics.p_out !== 0) bad.push(DATAFLOWS[di] + ' metrics 非零');
        if (res.metrics.Cnorm !== 0 || res.metrics.S !== 0 || res.metrics.Shat !== 0) bad.push(DATAFLOWS[di] + ' 归一化指标非零');
      }
      return { ok: bad.length === 0, detail: bad.length === 0 ? '三种 dataflow 均归零' : bad.join('；') };
    });

    var pass = true;
    for (var i = 0; i < results.length; i++) if (!results[i].ok) pass = false;
    return { pass: pass, results: results };
  }

  /* ==================================================================== *
   * 9. 导出
   * ==================================================================== */
  global.SA = global.SA || {};
  global.SA.Model = {
    VERSION: VERSION,
    DATAFLOWS: DATAFLOWS,
    REGISTERS: REGISTERS,
    applyStuckAt: applyStuckAt,
    bitField: bitField,
    paperRegion: paperRegion,
    classifyCells: classifyCells,
    describeRegion: describeRegion,
    simulate: simulate,
    selfTest: selfTest
  };
})(typeof window !== 'undefined' ? window : this);
