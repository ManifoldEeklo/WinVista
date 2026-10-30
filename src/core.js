/* ===== Core: product model, sample price book, pricing, drawing (pure, no DOM) ===== */
const CORE = (() => {
  const MAT_BASE = { PVC: { fixed: 110, rate: 235 }, ALU: { fixed: 240, rate: 335 }, WOOD: { fixed: 190, rate: 360 } };
  const RAL = { '9016': '#F1F0EA', '9010': '#F1ECE1', '9001': '#E9E0D2', '1015': '#E6D2B5', '7035': '#C5C7C4', '7039': '#6C6960', '7012': '#575D5E', '7016': '#383E42', '7021': '#2E3234', '7022': '#4B4D46', '9006': '#A1A1A0', '9007': '#878581', '9005': '#0E0E10', '8017': '#45322E', '8019': '#3D3635', '6009': '#27352A', '6005': '#0F4336', '5011': '#1A2B3C', '3004': '#6A1A22', '3009': '#6D3F33' };
  const kindOf = c => !c ? 'std' : c.kind || (c.material === 'PVC' && c.pct >= 8 ? 'foil' : 'std');
  const colHex = (pb, cfg, side) => { const id = side === 'in' && !cfg.sameColour ? cfg.colIn : cfg.colOut, c = byId(pb.colours, id); if (!c) return '#EEEEEE';
    if (kindOf(c) === 'lacq') { const r = side === 'in' && !cfg.sameColour ? cfg.ralIn : cfg.ralOut; return RAL[String(r || '').trim()] || c.hex; } return c.hex; };
  const colName = (pb, cfg, side) => { const id = side === 'in' && !cfg.sameColour ? cfg.colIn : cfg.colOut, c = byId(pb.colours, id); if (!c) return '-';
    if (kindOf(c) === 'lacq') { const r = side === 'in' && !cfg.sameColour ? cfg.ralIn : cfg.ralOut; return `Lacquer RAL ${r || '?'}`; } return (kindOf(c) === 'foil' ? 'Foil ' : '') + c.name; };
  const MATS = ['PVC', 'ALU'], MAT_NAME = { PVC: 'PVC', ALU: 'ALU', WOOD: 'Wood' };
  const PROFILE_KG = { PVC: 1.7, ALU: 1.5, WOOD: 2.1 };

  // Product types. cols: cells left→right; s = F fixed, DK tilt-turn, D turn, K tilt, DOOR entrance leaf, SL lift-slide sash, PSK tilt-slide sash
  // h = hinge side of that cell (L/R) before mirroring; w = width share. top = top light (fixed) share of height.
  const TYPES = [
    { id: 'W-F',   code: 'WS-W10', cat: 'window', name: 'Fixed window', cols: [{ s: 'F' }], k: [0.6, 0.72], r: [400, 2400, 400, 2400, 200] },
    { id: 'W-DK',  code: 'WS-W20', cat: 'window', name: 'Tilt-turn window', cols: [{ s: 'DK', h: 'L' }], k: [1, 1], r: [400, 1600, 400, 2400, 200] },
    { id: 'W-D',   code: 'WS-W21', cat: 'window', name: 'Turn window', cols: [{ s: 'D', h: 'L' }], k: [0.95, 0.97], r: [400, 1600, 400, 2400, 200] },
    { id: 'W-K',   code: 'WS-W22', cat: 'window', name: 'Tilt window (bottom-hung)', cols: [{ s: 'K' }], k: [0.9, 0.95], r: [400, 2000, 300, 1100, 100] },
    { id: 'W-2S',  code: 'WS-W30', cat: 'window', name: 'Double sash, no mullion', cols: [{ s: 'D', h: 'L' }, { s: 'DK', h: 'R' }], k: [1.8, 1.15], r: [800, 2400, 600, 2400, 200] },
    { id: 'W-FDK', code: 'WS-W31', cat: 'window', name: 'Fixed + tilt-turn', cols: [{ s: 'F' }, { s: 'DK', h: 'R' }], k: [1.5, 1.0], r: [800, 3000, 400, 2400, 200] },
    { id: 'W-3P',  code: 'WS-W40', cat: 'window', name: 'Three-part window', cols: [{ s: 'DK', h: 'L' }, { s: 'F' }, { s: 'DK', h: 'R' }], k: [2.3, 1.05], r: [1200, 3600, 600, 2400, 200] },
    { id: 'W-TL',  code: 'WS-W50', cat: 'window', name: 'Tilt-turn with top light', cols: [{ s: 'DK', h: 'L' }], top: 0.25, k: [1.5, 1.1], r: [400, 1600, 1200, 2800, 200] },
    { id: 'D-ENT', code: 'WS-D10', cat: 'door', name: 'Entrance door', cols: [{ s: 'DOOR', h: 'L' }], k: [8, 1.6], r: [800, 1300, 1900, 2500, 100] },
    { id: 'D-SL',  code: 'WS-D11', cat: 'door', name: 'Entrance door + side light', cols: [{ s: 'DOOR', h: 'L', w: 0.68 }, { s: 'F', w: 0.32 }], k: [9, 1.5], r: [1200, 2200, 1900, 2500, 100] },
    { id: 'D-TER', code: 'WS-D20', cat: 'door', name: 'Terrace door (tilt-turn)', cols: [{ s: 'DK', h: 'L' }], door: true, k: [1.6, 1.15], r: [600, 1200, 1800, 2500, 100] },
    { id: 'D-FR',  code: 'WS-D30', cat: 'door', name: 'French door, double', cols: [{ s: 'D', h: 'L' }, { s: 'DK', h: 'R' }], door: true, k: [2.6, 1.2], r: [1000, 2000, 1800, 2500, 100] },
    { id: 'S-HS',  code: 'WS-S10', cat: 'slide', name: 'Lift & slide door', cols: [{ s: 'F' }, { s: 'SL', h: 'R' }], k: [9, 1.1], r: [2000, 6000, 1800, 2800, 200] },
    { id: 'S-PSK', code: 'WS-S20', cat: 'slide', name: 'Tilt & slide door', cols: [{ s: 'PSK', h: 'L' }, { s: 'F' }], k: [4, 1.0], r: [1400, 3000, 1800, 2400, 200], materials: ['PVC'] },
  ];
  const typeById = id => TYPES.find(t => t.id === id);
  const CATS = { window: 'Windows', door: 'Doors', slide: 'Sliding doors' };

  const round5 = x => Math.round(x / 5) * 5;
  const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(v); return o; };

  function sampleGrid(sys, type) {
    const [w0, w1, h0, h1, st] = type.r;
    const ws = range(w0, w1, st), hs = range(h0, h1, st);
    const b = MAT_BASE[sys.material];
    const p = hs.map(H => ws.map(W => round5((b.fixed * type.k[0] + b.rate * type.k[1] * (W * H / 1e6)) * sys.factor)));
    return { w: ws, h: hs, p };
  }
  function sampleGrids(pb) {
    const out = {};
    for (const s of pb.systems) {
      out[s.id] = {};
      for (const t of TYPES) if (!t.materials || t.materials.includes(s.material)) out[s.id][t.id] = sampleGrid(s, t);
    }
    return out;
  }

  // Sample price book: every number here is a placeholder until the real grids are uploaded.
  function samplePricebook() {
    return {
      sample: true, currency: 'EUR', updatedAt: null,
      company: { name: 'Winsol', line: 'Windows · Doors · Sun protection', validityDays: 30 },
      systems: [
        { id: 'P70', material: 'PVC', name: 'Winsol PVC Classic 70', supplier: '', depth: 70, uw: 1.3, factor: 1.0, enabled: true, maxSashW: 1300, maxSashH: 2300, maxSashKg: 90, maxSlideKg: 250, maxGlassM2: 5 },
        { id: 'P82', material: 'PVC', name: 'Winsol PVC Premium 82', supplier: '', depth: 82, uw: 1.0, factor: 1.15, enabled: true, maxSashW: 1400, maxSashH: 2400, maxSashKg: 120, maxSlideKg: 300, maxGlassM2: 6 },
        { id: 'A75', material: 'ALU', name: 'Winsol ALU Comfort 75', supplier: '', depth: 75, uw: 1.4, factor: 1.0, enabled: true, maxSashW: 1500, maxSashH: 2600, maxSashKg: 150, maxSlideKg: 400, maxGlassM2: 8 },
        { id: 'A90', material: 'ALU', name: 'Winsol ALU Thermo 90', supplier: '', depth: 90, uw: 1.1, factor: 1.18, enabled: true, maxSashW: 1600, maxSashH: 2800, maxSashKg: 180, maxSlideKg: 450, maxGlassM2: 9 },
      ],
      // pct = surcharge on the grid price, per side
      // kind: std = standard colour, foil = foil (PVC/ALU decor), lacq = lacquer in any RAL code (priced with the lacquer coefficient)
      colours: [
        { id: 'p-white', material: 'PVC', kind: 'std', name: 'White (RAL 9016)', hex: '#F4F5F2', pct: 0 },
        { id: 'p-cream', material: 'PVC', kind: 'std', name: 'Cream white', hex: '#EEE6CF', pct: 3 },
        { id: 'p-7016', material: 'PVC', kind: 'foil', name: 'Anthracite grey (RAL 7016)', hex: '#3A4045', pct: 11 },
        { id: 'p-7016s', material: 'PVC', kind: 'foil', name: 'Anthracite grey smooth', hex: '#3D4246', pct: 12 },
        { id: 'p-9005', material: 'PVC', kind: 'foil', name: 'Black structure', hex: '#1E1F21', pct: 11 },
        { id: 'p-basalt', material: 'PVC', kind: 'foil', name: 'Basalt grey', hex: '#5B5E5E', pct: 11 },
        { id: 'p-quartz', material: 'PVC', kind: 'foil', name: 'Quartz grey', hex: '#6E6B66', pct: 11 },
        { id: 'p-silver', material: 'PVC', kind: 'foil', name: 'Silver grey', hex: '#9A9C9B', pct: 11 },
        { id: 'p-cremef', material: 'PVC', kind: 'foil', name: 'Cream white foil', hex: '#E8DFC6', pct: 10 },
        { id: 'p-green', material: 'PVC', kind: 'foil', name: 'Dark green', hex: '#29372E', pct: 12 },
        { id: 'p-oak', material: 'PVC', kind: 'foil', name: 'Golden oak', hex: '#A8692C', pct: 12 },
        { id: 'p-irish', material: 'PVC', kind: 'foil', name: 'Irish oak', hex: '#8E6A45', pct: 13 },
        { id: 'p-winch', material: 'PVC', kind: 'foil', name: 'Winchester oak', hex: '#A0784B', pct: 13 },
        { id: 'p-mahog', material: 'PVC', kind: 'foil', name: 'Mahogany', hex: '#6B3A2A', pct: 12 },
        { id: 'p-lacq', material: 'PVC', kind: 'lacq', name: 'Lacquer, any RAL colour', hex: '#7D8471', pct: 0 },
        { id: 'a-9016', material: 'ALU', kind: 'std', name: 'Traffic white matt (RAL 9016)', hex: '#F1F2EE', pct: 0 },
        { id: 'a-7016', material: 'ALU', kind: 'std', name: 'Anthracite structure (RAL 7016)', hex: '#383E42', pct: 0 },
        { id: 'a-9005', material: 'ALU', kind: 'std', name: 'Black structure (RAL 9005)', hex: '#1C1C1D', pct: 0 },
        { id: 'a-anod', material: 'ALU', kind: 'std', name: 'Anodised natural', hex: '#B8B9B6', pct: 9 },
        { id: 'a-wood', material: 'ALU', kind: 'foil', name: 'Wood decor', hex: '#8B5A2B', pct: 12 },
        { id: 'a-oakf', material: 'ALU', kind: 'foil', name: 'Oak decor', hex: '#A57A4C', pct: 12 },
        { id: 'a-lacq', material: 'ALU', kind: 'lacq', name: 'Lacquer, any RAL colour', hex: '#7D8471', pct: 0 },
      ],
      // Lacquer coefficient on the grid price, per lacquered side. Kept in the price book, not shown to the client.
      lacquer: { PVC: 1.22, ALU: 1.06 },
      bicolourPct: { PVC: 0, ALU: 4 },
      uwTarget: 1.5,
      glazing: [
        { id: 'g-dbl', name: 'Double HR++ 4/16/4, Ug 1.0', perM2: 0, ug: 1.0 , kg: 20 },
        { id: 'g-tri', name: 'Triple 4/14/4/14/4, Ug 0.6', perM2: 48, ug: 0.6 , kg: 30 },
        { id: 'g-safe', name: 'Double safety 44.2/16/4, Ug 1.0', perM2: 42, ug: 1.0 , kg: 30 },
        { id: 'g-safe3', name: 'Triple safety 44.2/12/4/12/4, Ug 0.6', perM2: 92, ug: 0.6 , kg: 40 },
        { id: 'g-acou', name: 'Acoustic 39 dB', perM2: 58, ug: 1.0 , kg: 30 },
        { id: 'g-matt', name: 'Satin / obscure glass', perM2: 26, ug: 1.0 , kg: 20 },
        { id: 'g-sun', name: 'Solar control', perM2: 24, ug: 1.0 , kg: 20 },
      ],
      // perSash = per opening sash
      handles: [
        { id: 'h-std', name: 'Standard handle', perSash: 0 },
        { id: 'h-lock', name: 'Lockable handle', perSash: 22 },
        { id: 'h-design', name: 'Design handle, stainless', perSash: 36 },
      ],
      security: [
        { id: 's-std', name: 'Standard fittings', perSash: 0 },
        { id: 's-rc1', name: 'RC1 (mushroom cams)', perSash: 48 },
        { id: 's-rc2', name: 'RC2 burglary resistant', perSash: 125 },
      ],
      hinges: [
        { id: 'hi-vis', name: 'Visible hinges', perSash: 0 },
        { id: 'hi-hid', name: 'Concealed hinges', perSash: 65 },
      ],
      doorPanels: [
        { id: 'dp-glass', name: 'Glass with transom', price: 0 },
        { id: 'dp-flat', name: 'Insulated panel, smooth', price: 185 },
        { id: 'dp-groove', name: 'Panel with grooves', price: 290 },
        { id: 'dp-deco', name: 'Panel with decorative glass', price: 420 },
      ],
      doorLocks: [
        { id: 'dl-3', name: '3-point mechanical lock', price: 0 },
        { id: 'dl-5', name: '5-point automatic lock', price: 265 },
        { id: 'dl-fp', name: 'Electronic lock with fingerprint', price: 790 },
      ],
      doorHandles: [
        { id: 'dh-lever', name: 'Lever / lever', price: 0 },
        { id: 'dh-bar6', name: 'Pull bar 600 mm outside', price: 190 },
        { id: 'dh-bar12', name: 'Pull bar 1200 mm outside', price: 275 },
      ],
      thresholds: [
        { id: 'th-std', name: 'Standard aluminium threshold', price: 0 },
        { id: 'th-low', name: 'Low threshold 20 mm (accessible)', price: 92 },
      ],
      // unit: pc | m (element width) | m2 (element area); fixed = start cost; min = minimum charge; group = only one per group
      options: [
        { id: 'v-std', group: 'vent', cat: 'Ventilation', name: 'Ventilation grille, self-regulating', unit: 'm', price: 78, fixed: 0, min: 0, for: ['window', 'door'] },
        { id: 'v-acou', group: 'vent', cat: 'Ventilation', name: 'Ventilation grille, acoustic', unit: 'm', price: 135, fixed: 0, min: 0, for: ['window', 'door'] },
        { id: 'v-hid', group: 'vent', cat: 'Ventilation', name: 'Concealed vent in frame', unit: 'm', price: 118, fixed: 0, min: 0, for: ['window'] },
        { id: 'i-fix', group: 'insect', cat: 'Insect screens', name: 'Insect screen, fixed frame', unit: 'm2', price: 58, fixed: 0, min: 70, for: ['window'] },
        { id: 'i-roll', group: 'insect', cat: 'Insect screens', name: 'Insect screen, roller', unit: 'm2', price: 96, fixed: 0, min: 125, for: ['window'] },
        { id: 'i-hinge', group: 'insect', cat: 'Insect screens', name: 'Insect screen door, hinged', unit: 'pc', price: 245, fixed: 0, min: 0, for: ['door'] },
        { id: 'i-plis', group: 'insect', cat: 'Insect screens', name: 'Insect screen, pleated (plissé)', unit: 'm2', price: 142, fixed: 0, min: 185, for: ['door', 'slide'] },
        { id: 'r-strap', group: 'shutter', cat: 'Roller shutters', name: 'Roller shutter, top-mounted, strap', unit: 'm2', price: 112, fixed: 0, min: 220, for: ['window', 'door'] },
        { id: 'r-motor', group: 'shutter', cat: 'Roller shutters', name: 'Roller shutter, radio motor', unit: 'm2', price: 118, fixed: 195, min: 0, for: ['window', 'door', 'slide'] },
        { id: 'sl-out', group: 'sillout', cat: 'Sills', name: 'Outside sill, aluminium', unit: 'm', price: 44, fixed: 0, min: 0, for: ['window'] },
        { id: 'sl-in', group: 'sillin', cat: 'Sills', name: 'Inside sill, natural stone', unit: 'm', price: 68, fixed: 0, min: 0, for: ['window'] },
        { id: 'gb', group: 'bars', cat: 'Glass', name: 'Glazing bars (per field)', unit: 'pc', price: 38, fixed: 0, min: 0, for: ['window', 'door'], qty: true },
        { id: 'd-letter', group: 'letter', cat: 'Door accessories', name: 'Letterbox', unit: 'pc', price: 88, fixed: 0, min: 0, for: ['door'], doorOnly: true },
        { id: 'd-closer', group: 'closer', cat: 'Door accessories', name: 'Door closer', unit: 'pc', price: 148, fixed: 0, min: 0, for: ['door'], doorOnly: true },
        { id: 'd-kick', group: 'kick', cat: 'Door accessories', name: 'Kick plate, stainless', unit: 'pc', price: 76, fixed: 0, min: 0, for: ['door'], doorOnly: true },
      ],
      // Finishing around the element, priced per metre of reveal (2 × height + width)
      finishIn: [
        { id: 'fi-none', name: 'No inside finishing', perM: 0 },
        { id: 'fi-plaster', name: 'Plaster', perM: 38 },
        { id: 'fi-pvc', name: 'PVC finishing profiles', perM: 24 },
        { id: 'fi-wood', name: 'MDF casing, primed', perM: 29 },
      ],
      finishOut: [
        { id: 'fo-none', name: 'No outside finishing', perM: 0 },
        { id: 'fo-seal', name: 'Sealant joint', perM: 6 },
        { id: 'fo-alu', name: 'Aluminium cover profiles', perM: 22 },
        { id: 'fo-plaster', name: 'Outside plaster repair', perM: 34 },
      ],
      // Loose articles sold with the offer (sun protection, accessories, service)
      articles: [
        { id: 'ar-zip', cat: 'Sun protection', name: 'Zip screen, motorised, up to 2.5 m²', unit: 'pc', price: 690 },
        { id: 'ar-blind', cat: 'Sun protection', name: 'Exterior venetian blind, motorised', unit: 'pc', price: 820 },
        { id: 'ar-awning', cat: 'Sun protection', name: 'Folding-arm awning 4 m', unit: 'pc', price: 1890 },
        { id: 'ar-pergola', cat: 'Sun protection', name: 'Louvred pergola, per m²', unit: 'm2', price: 640 },
        { id: 'ar-remote', cat: 'Controls', name: 'Remote control, 5 channels', unit: 'pc', price: 85 },
        { id: 'ar-sensor', cat: 'Controls', name: 'Wind and sun sensor', unit: 'pc', price: 165 },
        { id: 'ar-maint', cat: 'Service', name: 'Maintenance kit', unit: 'pc', price: 29 },
        { id: 'ar-service', cat: 'Service', name: 'Yearly service visit', unit: 'pc', price: 95 },
      ],
      // Placement: person-hours per element, priced at offer level
      labour: { rate: 55, crew: 2, hoursPerDay: 8, base: { window: 1.5, door: 3, slide: 5 }, perM2: 0.4, breakout: { window: 0.8, door: 1.5, slide: 2.5 }, disposal: 15 },
      oldFrames: [
        { id: 'wood', name: 'Wood', factor: 1 },
        { id: 'pvc', name: 'PVC', factor: 0.9 },
        { id: 'alu', name: 'Aluminium', factor: 1.1 },
        { id: 'steel', name: 'Steel', factor: 1.6 },
      ],
      // Site costs for the whole offer. unit: pc | h | day. perDay = quantity follows the estimated days unless set by hand
      siteItems: [
        { id: 'cont6', name: 'Waste container 6 m³', unit: 'pc', price: 285, min: 0 },
        { id: 'cont10', name: 'Waste container 10 m³', unit: 'pc', price: 360, min: 0 },
        { id: 'crane', name: 'Crane', unit: 'h', price: 115, min: 460 },
        { id: 'lift', name: 'Glass lifter / vacuum lift', unit: 'day', price: 140, min: 0 },
        { id: 'travel', name: 'Travel and mobilisation', unit: 'day', price: 45, min: 0, perDay: true },
      ],
    };
  }

  // Person-hours to place one element (before quantity)
  function hoursFor(pb, cfg) {
    if (cfg.hours != null && cfg.hours !== '' && !isNaN(cfg.hours)) return Math.max(0, +cfg.hours);
    const t = typeById(cfg.type), L = pb.labour; if (!t || !L) return 0;
    const cat = t.cat === 'window' && !t.door ? 'window' : t.cat === 'slide' ? 'slide' : 'door';
    const area = (+cfg.W || 0) * (+cfg.H || 0) / 1e6;
    let h = 0;
    if (cfg.place !== false) h += (L.base[cat] || 0) + (L.perM2 || 0) * area;
    if (cfg.breakout) { const of = byId(pb.oldFrames || [], cfg.oldFrame) || { factor: 1 }; h += (L.breakout[cat] || 0) * of.factor; }
    return Math.round(h * 4) / 4;
  }

  const isOpening = s => s !== 'F';
  const isEntrance = t => t.cols.some(c => c.s === 'DOOR');

  function defaultConfig(pb, material) {
    const m = material || 'PVC';
    const sys = pb.systems.find(s => s.material === m && s.enabled) || pb.systems[0];
    const col = pb.colours.find(c => c.material === sys.material);
    return {
      material: sys.material, system: sys.id, type: 'W-DK', W: 1000, H: 1400, topH: 400, mirror: false,
      colOut: col.id, colIn: col.id, sameColour: true, ralOut: '9016', ralIn: '9016',
      glazing: pb.glazing[0].id, handle: pb.handles[0].id, security: pb.security[0].id, hinges: pb.hinges[0].id,
      doorPanel: pb.doorPanels[0].id, doorLock: pb.doorLocks[0].id, doorHandle: pb.doorHandles[0].id, threshold: pb.thresholds[0].id,
      options: {}, label: '', qty: 1, discount: 0,
      finishIn: (pb.finishIn || [])[0] ? pb.finishIn[0].id : '', finishOut: (pb.finishOut || [])[0] ? pb.finishOut[0].id : '',
      place: true, breakout: false, oldFrame: 'wood', hours: null,
    };
  }

  function lookup(grid, W, H) {
    if (!grid) return { err: 'No price grid for this system and product type.' };
    const wi = grid.w.findIndex(v => v >= W), hi = grid.h.findIndex(v => v >= H);
    const minW = grid.w[0], maxW = grid.w[grid.w.length - 1], minH = grid.h[0], maxH = grid.h[grid.h.length - 1];
    if (W < minW || H < minH || wi < 0 || hi < 0) return { err: `Size outside the price grid: width ${minW}–${maxW} mm, height ${minH}–${maxH} mm.` };
    const v = grid.p[hi] && grid.p[hi][wi];
    if (v == null || v === '' || isNaN(v)) return { err: 'This size has no price in the grid.' };
    return { price: +v, gw: grid.w[wi], gh: grid.h[hi] };
  }

  const byId = (list, id) => list.find(x => x.id === id);

  function price(pb, grids, cfg) {
    const t = typeById(cfg.type), sys = byId(pb.systems, cfg.system);
    const out = { items: [], errors: [], unit: 0 };
    if (!t || !sys) { out.errors.push('Choose a system and product type.'); return out; }
    const grid = grids[sys.id] && grids[sys.id][t.id];
    const lk = lookup(grid, cfg.W, cfg.H);
    if (lk.err) { out.errors.push(lk.err); return out; }
    const area = cfg.W * cfg.H / 1e6, widthM = cfg.W / 1000;
    const nOpen = t.cols.filter(c => isOpening(c.s) && c.s !== 'DOOR').length;
    const add = (label, amount, note) => { amount = Math.round(amount * 100) / 100; if (amount) out.items.push({ label, amount, note }); return amount; };
    add(`${t.code} ${t.name} · grid ${lk.gw}×${lk.gh}`, lk.price);
    const co = byId(pb.colours, cfg.colOut), ci = byId(pb.colours, cfg.sameColour ? cfg.colOut : cfg.colIn);
    const coef = (pb.lacquer && pb.lacquer[sys.material]) || 1;
    for (const [c, side] of [[co, 'out'], [ci, 'in']]) {
      if (!c) continue;
      if (kindOf(c) === 'lacq') add(`${colName(pb, cfg, side)} ${side === 'out' ? 'outside' : 'inside'}`, lk.price * (coef - 1));
      else if (c.pct) add(`Colour ${side === 'out' ? 'outside' : 'inside'}: ${colName(pb, cfg, side)}`, lk.price * c.pct / 100, `+${c.pct}%`);
    }
    const two = co && ci && (co.id !== ci.id || (kindOf(co) === 'lacq' && String(cfg.ralOut) !== String(cfg.sameColour ? cfg.ralOut : cfg.ralIn)));
    if (two && pb.bicolourPct[sys.material]) add('Bicolour execution', lk.price * pb.bicolourPct[sys.material] / 100, `+${pb.bicolourPct[sys.material]}%`);
    const g = byId(pb.glazing, cfg.glazing); if (g && g.perM2) add(`Glazing: ${g.name}`, g.perM2 * area, `${area.toFixed(2)} m²`);
    if (nOpen) {
      for (const [list, key] of [[pb.handles, 'handle'], [pb.security, 'security'], [pb.hinges, 'hinges']]) {
        const o = byId(list, cfg[key]); if (o && o.perSash) add(o.name, o.perSash * nOpen, `${nOpen} × sash`);
      }
    }
    if (isEntrance(t)) {
      for (const [list, key] of [[pb.doorPanels, 'doorPanel'], [pb.doorLocks, 'doorLock'], [pb.doorHandles, 'doorHandle'], [pb.thresholds, 'threshold']]) {
        const o = byId(list, cfg[key]); if (o && o.price) add(o.name, o.price);
      }
    }
    for (const [id, v] of Object.entries(cfg.options || {})) {
      if (!v) continue;
      const o = byId(pb.options, id); if (!o || !optionAllowed(o, t)) continue;
      const n = o.qty ? Math.max(1, +v || 1) : 1;
      let base = o.unit === 'm' ? o.price * widthM : o.unit === 'm2' ? o.price * area : o.price * n;
      base = Math.max(base + (o.fixed || 0), o.min || 0);
      add(o.name, base, o.unit === 'm' ? `${widthM.toFixed(2)} m` : o.unit === 'm2' ? `${area.toFixed(2)} m²` : (n > 1 ? `${n} pc` : ''));
    }
    const reveal = (2 * cfg.H + cfg.W) / 1000;
    const fi = byId(pb.finishIn || [], cfg.finishIn), fo = byId(pb.finishOut || [], cfg.finishOut);
    if (fi && fi.perM) add(`Inside finishing: ${fi.name}`, fi.perM * reveal, `${reveal.toFixed(2)} m`);
    if (fo && fo.perM) add(`Outside finishing: ${fo.name}`, fo.perM * reveal, `${reveal.toFixed(2)} m`);
    if (cfg.breakout && pb.labour && pb.labour.disposal) add('Disposal of old frame', pb.labour.disposal);
    out.unit = Math.round(out.items.reduce((s, i) => s + i.amount, 0) * 100) / 100;
    out.area = area; out.uw = uwEstimate(pb, cfg); out.hours = hoursFor(pb, cfg);
    return out;
  }

  function optionAllowed(o, t) {
    const cat = t.door ? 'door' : t.cat;
    if (o.doorOnly && !isEntrance(t)) return false;
    return (o.for || []).includes(cat) || (o.for || []).includes(t.cat);
  }

  function uwEstimate(pb, cfg) {
    const sys = byId(pb.systems, cfg.system), g = byId(pb.glazing, cfg.glazing);
    if (!sys) return null;
    const d = g && g.ug != null ? (g.ug - 1.0) * 0.7 : 0;
    return Math.max(0.6, Math.round((sys.uw + d) * 10) / 10);
  }

  function describe(pb, cfg) {
    const t = typeById(cfg.type), sys = byId(pb.systems, cfg.system);
    const co = byId(pb.colours, cfg.colOut), ci = byId(pb.colours, cfg.sameColour ? cfg.colOut : cfg.colIn);
    const g = byId(pb.glazing, cfg.glazing);
    const parts = [
      `${sys ? sys.name : ''}`,
      (n => n.o === n.i ? `Colour ${n.o}` : `Colour ${n.o} outside / ${n.i} inside`)({ o: colName(pb, cfg, 'out'), i: colName(pb, cfg, 'in') }),
      g ? g.name : '',
    ];
    if (t && t.cols.some(c => isOpening(c.s) && c.s !== 'DOOR')) {
      parts.push([byId(pb.handles, cfg.handle), byId(pb.security, cfg.security)].filter(Boolean).map(x => x.name).join(', '));
    }
    if (t && isEntrance(t)) parts.push([byId(pb.doorPanels, cfg.doorPanel), byId(pb.doorLocks, cfg.doorLock), byId(pb.thresholds, cfg.threshold)].filter(Boolean).map(x => x.name).join(', '));
    const opts = Object.entries(cfg.options || {}).filter(([, v]) => v).map(([id, v]) => { const o = byId(pb.options, id); return o ? o.name + (o.qty && +v > 1 ? ` ×${v}` : '') : null; }).filter(Boolean);
    if (opts.length) parts.push(opts.join(', '));
    const fi = byId(pb.finishIn || [], cfg.finishIn), fo = byId(pb.finishOut || [], cfg.finishOut);
    const fin = [fi && fi.perM ? 'inside ' + fi.name.toLowerCase() : '', fo && fo.perM ? 'outside ' + fo.name.toLowerCase() : ''].filter(Boolean);
    if (fin.length) parts.push('Finishing: ' + fin.join(', '));
    const of = byId(pb.oldFrames || [], cfg.oldFrame);
    parts.push([cfg.place !== false ? 'Placement' : 'Supply only', cfg.breakout ? `breakout of old ${of ? of.name.toLowerCase() : ''} frame` : ''].filter(Boolean).join(', '));
    return parts.filter(Boolean);
  }

  // ---------- Drawing ----------
  function layoutCells(cfg) {
    const t = typeById(cfg.type); if (!t) return { t: null, cells: [] };
    let cols = t.cols.map(c => ({ ...c }));
    if (cfg.mirror) cols = cols.reverse().map(c => ({ ...c, h: c.h === 'L' ? 'R' : c.h === 'R' ? 'L' : c.h }));
    return { t, cols };
  }

  function draw(pb, cfg, opt = {}) {
    const { t, cols } = layoutCells(cfg); if (!t) return '';
    const W = Math.max(200, +cfg.W || 1000), H = Math.max(200, +cfg.H || 1000);
    const frame = colHex(pb, cfg, 'out'), M = Math.max(W, H);
    const sw = M / 260, fs = M / 17, f = Math.min(70, W / 8, H / 8), mul = Math.min(60, W / 14);
    const dims = !opt.noDims;
    const pad = dims ? fs * 2.6 : M * 0.02;
    const vb = `${-M * 0.02} ${-M * 0.02} ${W + pad + M * 0.02} ${H + pad + M * 0.02}`;
    const glass = 'var(--glass, #CFE3EE)', ink = 'var(--draw-ink, #22313A)', light = luminance(frame) > 0.55;
    const edge = light ? '#8B979E' : '#0E1418';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="drawing" role="img" aria-label="${esc(t.name)} ${W} by ${H} millimetres">`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="${frame}" stroke="${edge}" stroke-width="${sw}"/>`;
    const ix = f, iy = f, iw = W - 2 * f, ih = H - 2 * f;
    let rowY = iy, rowH = ih;
    if (t.top) {
      const th = Math.min(Math.max(+cfg.topH || H * t.top, 200), H - 400) - f;
      s += glassRect(ix + 10, iy + 10, iw - 20, th - 20, glass, edge, sw);
      s += `<text x="${ix + iw / 2}" y="${iy + th / 2}" font-size="${fs * 0.6}" text-anchor="middle" dominant-baseline="middle" fill="${ink}" opacity=".55">F</text>`;
      s += `<rect x="${ix}" y="${iy + th}" width="${iw}" height="${mul}" fill="${frame}" stroke="${edge}" stroke-width="${sw}"/>`;
      rowY = iy + th + mul; rowH = ih - th - mul;
    }
    const totalShare = cols.reduce((a, c) => a + (c.w || 1), 0);
    const nM = cols.length - 1, stulp = t.id === 'W-2S' || t.id === 'D-FR';
    const usable = iw - (stulp ? 0 : nM * mul);
    let x = ix;
    cols.forEach((c, i) => {
      const cw = usable * (c.w || 1) / totalShare;
      s += cell(c, x, rowY, cw, rowH, { frame, edge, glass, ink, sw, fs, f, W, H });
      x += cw;
      if (i < nM) {
        if (!stulp) { s += `<rect x="${x}" y="${rowY}" width="${mul}" height="${rowH}" fill="${frame}" stroke="${edge}" stroke-width="${sw}"/>`; x += mul; }
        else s += `<line x1="${x}" y1="${rowY}" x2="${x}" y2="${rowY + rowH}" stroke="${edge}" stroke-width="${sw * 2}"/>`;
      }
    });
    if (t.cat !== 'window' || t.door) s += `<rect x="0" y="${H - f * 0.35}" width="${W}" height="${f * 0.35}" fill="#9AA3A8" stroke="${edge}" stroke-width="${sw * 0.6}"/>`;
    if (dims) {
      const y = H + fs * 1.3, xr = W + fs * 1.3, tk = fs * 0.35;
      s += `<g stroke="${ink}" stroke-width="${sw * 0.8}" fill="none">`;
      s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/><line x1="0" y1="${y - tk}" x2="0" y2="${y + tk}"/><line x1="${W}" y1="${y - tk}" x2="${W}" y2="${y + tk}"/>`;
      s += `<line x1="${xr}" y1="0" x2="${xr}" y2="${H}"/><line x1="${xr - tk}" y1="0" x2="${xr + tk}" y2="0"/><line x1="${xr - tk}" y1="${H}" x2="${xr + tk}" y2="${H}"/></g>`;
      s += `<text x="${W / 2}" y="${y - fs * 0.3}" font-size="${fs}" text-anchor="middle" fill="${ink}" class="dimtxt">${W}</text>`;
      s += `<text x="${xr - fs * 0.3}" y="${H / 2}" font-size="${fs}" text-anchor="middle" fill="${ink}" class="dimtxt" transform="rotate(-90 ${xr - fs * 0.3} ${H / 2})">${H}</text>`;
    }
    return s + '</svg>';
  }

  function glassRect(x, y, w, h, glass, edge, sw) {
    return `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" fill="${glass}" stroke="${edge}" stroke-width="${sw * 0.7}"/>`;
  }

  function cell(c, x, y, w, h, o) {
    const { frame, edge, glass, ink, sw, fs } = o;
    let s = '';
    if (c.s === 'F') {
      s += glassRect(x + 12, y + 12, w - 24, h - 24, glass, edge, sw);
      s += `<text x="${x + w / 2}" y="${y + h / 2}" font-size="${fs * 0.6}" text-anchor="middle" dominant-baseline="middle" fill="${ink}" opacity=".55">F</text>`;
      return s;
    }
    const sa = Math.min(60, w / 7, h / 7);
    s += `<rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" fill="${frame}" stroke="${edge}" stroke-width="${sw}"/>`;
    const gx = x + 6 + sa, gy = y + 6 + sa, gw = w - 12 - 2 * sa, gh = h - 12 - 2 * sa;
    if (c.s === 'DOOR') {
      s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${frame}" stroke="${edge}" stroke-width="${sw * 0.7}" opacity=".9"/>`;
      s += glassRect(gx + gw * 0.2, gy + gh * 0.08, gw * 0.6, gh * 0.42, glass, edge, sw);
      const hx = c.h === 'L' ? gx + gw - gw * 0.1 : gx + gw * 0.1;
      s += `<rect x="${hx - sa * 0.25}" y="${gy + gh * 0.52}" width="${sa * 0.5}" height="${gh * 0.08}" rx="${sa * 0.2}" fill="#C9CED1" stroke="${edge}" stroke-width="${sw * 0.5}"/>`;
      s += openLines('D', c.h, gx, gy, gw, gh, ink, sw);
      return s;
    }
    s += glassRect(gx, gy, gw, gh, glass, edge, sw);
    if (c.s === 'SL' || c.s === 'PSK') {
      const ay = gy + gh * 0.55, dir = c.h === 'R' ? -1 : 1, x0 = gx + gw * (dir > 0 ? 0.25 : 0.75), x1 = gx + gw * (dir > 0 ? 0.75 : 0.25);
      s += `<g stroke="${ink}" stroke-width="${sw * 1.4}" fill="none"><line x1="${x0}" y1="${ay}" x2="${x1}" y2="${ay}"/><polyline points="${x1 - dir * fs * 0.6},${ay - fs * 0.45} ${x1},${ay} ${x1 - dir * fs * 0.6},${ay + fs * 0.45}"/></g>`;
      if (c.s === 'PSK') s += openLines('K', c.h, gx, gy, gw, gh, ink, sw);
    } else s += openLines(c.s, c.h, gx, gy, gw, gh, ink, sw);
    if (c.s !== 'K') {
      const hx = c.s === 'SL' || c.s === 'PSK' ? (c.h === 'R' ? gx - sa * 0.55 : gx + gw + sa * 0.05) : (c.h === 'L' ? gx + gw + sa * 0.05 : gx - sa * 0.55);
      s += `<rect x="${hx}" y="${gy + gh / 2 - sa * 0.9}" width="${sa * 0.5}" height="${sa * 1.8}" rx="${sa * 0.2}" fill="#D3D7DA" stroke="${edge}" stroke-width="${sw * 0.5}"/>`;
    } else s += `<rect x="${gx + gw / 2 - sa * 0.9}" y="${gy - sa * 0.55}" width="${sa * 1.8}" height="${sa * 0.5}" rx="${sa * 0.2}" fill="#D3D7DA" stroke="${edge}" stroke-width="${sw * 0.5}"/>`;
    return s;
  }

  // Apex of the triangle points to the hinge side (European convention, seen from inside).
  function openLines(s, h, x, y, w, ht, ink, sw) {
    const st = `stroke="${ink}" stroke-width="${sw * 0.9}" fill="none" stroke-dasharray="${sw * 6} ${sw * 3}"`;
    let o = '';
    if (s === 'D' || s === 'DK') {
      const hx = h === 'L' ? x : x + w, ox = h === 'L' ? x + w : x;
      o += `<polyline ${st} points="${ox},${y} ${hx},${y + ht / 2} ${ox},${y + ht}"/>`;
    }
    if (s === 'K' || s === 'DK') o += `<polyline ${st} points="${x},${y} ${x + w / 2},${y + ht} ${x + w},${y}"/>`;
    return o;
  }

  function luminance(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 1;
    const n = parseInt(m[1], 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // Labour and site costs for the whole offer
  function siteCalc(q, pb) {
    const L = pb.labour || { rate: 0, crew: 2, hoursPerDay: 8 }, site = q.inst || {};
    const autoHours = (q.lines || []).reduce((s, l) => s + (+l.hours || 0) * (+l.qty || 0), 0);
    const hours = site.hours != null && site.hours !== '' ? +site.hours : autoHours;
    const crew = Math.max(1, +site.crew || L.crew || 1), perDay = L.hoursPerDay || 8;
    const autoDays = hours ? Math.ceil(hours / (crew * perDay) * 2) / 2 : 0;
    const days = site.days != null && site.days !== '' ? +site.days : autoDays;
    const labour = Math.round(hours * (L.rate || 0) * 100) / 100;
    const items = [];
    for (const it of pb.siteItems || []) {
      const set = site.items && site.items[it.id];
      const qty = set != null && set !== '' ? +set : (it.perDay ? days : 0);
      if (!qty) continue;
      const amount = Math.round(Math.max(qty * it.price, it.min || 0) * 100) / 100;
      items.push({ id: it.id, name: it.name, unit: it.unit, qty, price: it.price, amount });
    }
    const siteTotal = items.reduce((s, i) => s + i.amount, 0);
    return { autoHours, hours, crew, autoDays, days, rate: L.rate || 0, labour, items, site: Math.round(siteTotal * 100) / 100 };
  }

  function quoteTotals(q, pb) {
    const lines = q.lines || [];
    const sc = pb ? siteCalc(q, pb) : { labour: 0, site: 0, hours: 0, days: 0, items: [] };
    const products = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const lineDisc = lines.reduce((s, l) => s + l.unitPrice * l.qty * (l.discount || 0) / 100, 0);
    const gross = products + sc.labour + sc.site;
    const afterLine = gross - lineDisc;
    const qDisc = afterLine * (q.discount || 0) / 100;
    const net = afterLine - qDisc;
    const vat = net * (q.vat || 0) / 100;
    const r = v => Math.round(v * 100) / 100;
    return { products: r(products), labour: sc.labour, siteCost: sc.site, sc, gross: r(gross), lineDisc: r(lineDisc), qDisc: r(qDisc), net: r(net), vat: r(vat), total: r(net + vat), units: lines.reduce((s, l) => s + (+l.qty || 0), 0) };
  }

  // Approximate geometry in mm (visible frame 70, mullion 80, sash glass inset 55, fixed glass inset 15)
  function geometry(cfg) {
    const t = typeById(cfg.type); if (!t) return null;
    const F = 70, M = 80, W = +cfg.W || 0, H = +cfg.H || 0;
    let cols = t.cols.map(c => ({ ...c })); if (cfg.mirror) cols = cols.reverse().map(c => ({ ...c, h: c.h === 'L' ? 'R' : c.h === 'R' ? 'L' : c.h }));
    const stulp = t.id === 'W-2S' || t.id === 'D-FR';
    const innerW = W - 2 * F; let mainH = H - 2 * F, top = null;
    if (t.top) { const th = Math.min(Math.max(+cfg.topH || H * t.top, 200), H - 400) - F; top = { w: innerW, h: th, gw: innerW - 30, gh: th - 30 }; mainH = H - 2 * F - th - M; }
    const share = cols.reduce((a, c) => a + (c.w || 1), 0), usable = innerW - (stulp ? 0 : (cols.length - 1) * M);
    const out = cols.map(c => { const w = usable * (c.w || 1) / share, open = c.s !== 'F', ins = open ? 55 : 15; return { s: c.s, h: c.h, w: Math.round(w), hgt: Math.round(mainH), gw: Math.round(w - 2 * ins), gh: Math.round(mainH - 2 * ins) }; });
    return { t, F, M, W, H, cols: out, top, stulp, mullions: stulp ? 0 : cols.length - 1 };
  }
  const SASH_NAME = { DK: 'tilt-turn sash', D: 'turn sash', K: 'tilt sash', DOOR: 'door leaf', SL: 'lift & slide sash', PSK: 'tilt & slide sash' };

  // Technical checks: sash size and weight, glass size, Uw target, security
  function checks(pb, cfg) {
    const out = [], g = geometry(cfg), sys = byId(pb.systems, cfg.system), gl = byId(pb.glazing, cfg.glazing);
    if (!g || !sys) return out;
    const kg = gl && gl.kg ? gl.kg : 20, pk = PROFILE_KG[sys.material] || 1.7; let heaviest = 0, limitH = 0;
    g.cols.forEach((c, i) => {
      if (c.s === 'F') return;
      const slide = c.s === 'SL' || c.s === 'PSK';
      const w = Math.round(c.gw * c.gh / 1e6 * kg + 2 * (c.w + c.hgt) / 1000 * pk);
      const lim = slide ? sys.maxSlideKg : sys.maxSashKg;
      if (w > heaviest) { heaviest = w; limitH = lim; }
      const nm0 = `${SASH_NAME[c.s] || 'Sash'}${g.cols.length > 1 ? ' ' + (i + 1) : ''}`, nm = nm0.charAt(0).toUpperCase() + nm0.slice(1);
      if (lim && w > lim) out.push({ level: 'err', text: `${nm} weighs about ${w} kg; ${sys.name} allows ${lim} kg. Split the element or choose lighter glass.` });
      if (!slide && c.s !== 'DOOR' && sys.maxSashW && c.w > sys.maxSashW) out.push({ level: 'err', text: `${nm} is ${c.w} mm wide; maximum ${sys.maxSashW} mm for ${sys.name}.` });
      if (!slide && c.s !== 'DOOR' && sys.maxSashH && c.hgt > sys.maxSashH) out.push({ level: 'err', text: `${nm} is ${c.hgt} mm high; maximum ${sys.maxSashH} mm for ${sys.name}.` });
    });
    const panes = g.cols.map(c => c.gw * c.gh / 1e6).concat(g.top ? [g.top.gw * g.top.gh / 1e6] : []);
    const big = Math.max(0, ...panes);
    if (sys.maxGlassM2 && big > sys.maxGlassM2) out.push({ level: 'warn', text: `Largest glass pane is ${big.toFixed(2)} m²; above ${sys.maxGlassM2} m² needs a check by the glass supplier.` });
    const uw = uwEstimate(pb, cfg);
    if (pb.uwTarget && uw != null && uw > pb.uwTarget) out.push({ level: 'warn', text: `Uw about ${uw} W/m²K is above the target of ${pb.uwTarget}. Choose triple glass or a better system.` });
    if (cfg.security === 's-rc2' && !(gl && /safe/.test(gl.id))) out.push({ level: 'warn', text: 'RC2 security needs safety glass (44.2) to count.' });
    if (heaviest && (!limitH || heaviest <= limitH)) out.push({ level: 'ok', text: `Heaviest sash about ${heaviest} kg of ${limitH} kg allowed.` });
    if (!out.some(x => x.level !== 'ok')) out.unshift({ level: 'ok', text: 'All technical checks passed.' });
    return out;
  }

  // Bill of materials per unit (approximate, for planning and ordering)
  function bom(pb, cfg) {
    const g = geometry(cfg); if (!g) return [];
    const sys = byId(pb.systems, cfg.system) || {}, gl = byId(pb.glazing, cfg.glazing), rows = [];
    const r1 = v => Math.round(v * 100) / 100, add = (group, item, qty, unit) => { if (qty) rows.push({ group, item, qty: r1(qty), unit }); };
    add('Profiles', `Outer frame ${sys.name || ''}`, 2 * (g.W + g.H) / 1000, 'm');
    add('Profiles', 'Mullion', g.mullions * g.cols[0].hgt / 1000, 'm');
    if (g.top) add('Profiles', 'Transom', g.top.w / 1000, 'm');
    const open = g.cols.filter(c => c.s !== 'F');
    add('Profiles', 'Sash profile', open.reduce((a, c) => a + 2 * (c.w + c.hgt), 0) / 1000, 'm');
    const panes = g.cols.map(c => [c.gw, c.gh]).concat(g.top ? [[g.top.gw, g.top.gh]] : []);
    panes.forEach(([w, h]) => add('Glass', `${gl ? gl.name.split(',')[0] : 'Glass'} ${w} × ${h} mm`, 1, 'pc'));
    add('Glass', 'Glass area', panes.reduce((a, [w, h]) => a + w * h / 1e6, 0), 'm²');
    add('Glass', 'Glazing bead', panes.reduce((a, [w, h]) => a + 2 * (w + h), 0) / 1000, 'm');
    const count = {}; open.forEach(c => { count[c.s] = (count[c.s] || 0) + 1; });
    for (const [k, n] of Object.entries(count)) add('Hardware', `Hardware set, ${SASH_NAME[k] || k}`, n, 'pc');
    const nh = open.filter(c => c.s !== 'DOOR').length, hd = byId(pb.handles, cfg.handle);
    if (nh && hd) add('Hardware', hd.name, nh, 'pc');
    if (count.DOOR) { const l = byId(pb.doorLocks, cfg.doorLock); if (l) add('Hardware', l.name, count.DOOR, 'pc'); }
    for (const [id, v] of Object.entries(cfg.options || {})) { if (!v) continue; const o = byId(pb.options, id); if (!o) continue;
      add('Options', o.name, o.unit === 'm' ? g.W / 1000 : o.unit === 'm2' ? g.W * g.H / 1e6 : (o.qty ? +v || 1 : 1), o.unit === 'm2' ? 'm²' : o.unit); }
    const rev = (2 * g.H + g.W) / 1000, fi = byId(pb.finishIn || [], cfg.finishIn), fo = byId(pb.finishOut || [], cfg.finishOut);
    if (fi && fi.perM) add('Finishing', fi.name, rev, 'm'); if (fo && fo.perM) add('Finishing', fo.name, rev, 'm');
    add('Placement', 'Labour', hoursFor(pb, cfg), 'h');
    return rows;
  }

  // Convert one configuration to the other material: same rank of system, closest colour, same type where possible
  const COLOUR_MAP = { 'p-white': 'a-9016', 'p-cream': 'a-9016', 'p-7016': 'a-7016', 'p-9005': 'a-9005', 'p-oak': 'a-wood', 'p-quartz': 'a-lacq', 'p-lacq': 'a-lacq', 'a-lacq': 'p-lacq', 'w-lacq': 'p-lacq',
    'a-9016': 'p-white', 'a-7016': 'p-7016', 'a-9005': 'p-9005', 'a-wood': 'p-oak', 'a-oakf': 'p-irish', 'a-anod': 'p-silver' };
  const TYPE_MAP = { 'S-PSK': 'S-HS' };
  function hexDist(a, b) {
    const p = h => { const n = parseInt((h || '#000000').slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const x = p(a), y = p(b); return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
  }
  function mapColour(pb, id, to) {
    const tgt = pb.colours.filter(c => c.material === to);
    const sc = byId(pb.colours, id); if (sc && kindOf(sc) === 'lacq') { const l = tgt.find(c => kindOf(c) === 'lacq'); if (l) return l.id; }
    const m = COLOUR_MAP[id] && tgt.find(c => c.id === COLOUR_MAP[id]); if (m) return m.id;
    const src = byId(pb.colours, id); if (!src || !tgt.length) return tgt[0] && tgt[0].id;
    return tgt.slice().sort((a, b) => hexDist(a.hex, src.hex) - hexDist(b.hex, src.hex))[0].id;
  }
  function convertCfg(pb, cfg, to) {
    const c = JSON.parse(JSON.stringify(cfg)), notes = [];
    if (c.material === to) return { cfg: c, notes };
    const from = pb.systems.filter(s => s.material === c.material && s.enabled !== false);
    const tgt = pb.systems.filter(s => s.material === to && s.enabled !== false);
    const rank = Math.max(0, from.findIndex(s => s.id === c.system));
    c.material = to; c.system = (tgt[Math.min(rank, tgt.length - 1)] || tgt[0] || {}).id;
    c.colOut = mapColour(pb, c.colOut, to); c.colIn = c.sameColour ? c.colOut : mapColour(pb, c.colIn, to);
    const t = typeById(c.type);
    if (t && t.materials && !t.materials.includes(to)) { const nt = TYPE_MAP[c.type] || 'W-DK'; notes.push(`${t.name} is not available in ${to}; changed to ${typeById(nt).name}.`); c.type = nt; }
    return { cfg: c, notes };
  }

  return { TYPES, CATS, MATS, MAT_NAME, RAL, kindOf, colHex, colName, typeById, convertCfg, mapColour, geometry, checks, bom, samplePricebook, sampleGrids, sampleGrid, defaultConfig, price, describe, draw, lookup, optionAllowed, isEntrance, isOpening, quoteTotals, siteCalc, hoursFor, esc, byId };
})();
if (typeof module !== 'undefined') module.exports = CORE;
