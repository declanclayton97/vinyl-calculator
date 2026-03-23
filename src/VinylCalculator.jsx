import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ─── Tutorial steps ─────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    target: null,
    title: "Welcome to the Vinyl Calculator",
    body: "This tool helps you calculate cost per print, selling prices and profit margins for vinyl printing jobs. Let's walk through how it works.",
  },
  {
    target: "vinyl-tabs",
    title: "Vinyl Types",
    body: "Choose the type of vinyl you're working with. Each type has its own roll size, cost and waste settings. UV Vinyl, White Sticker and Clear Sticker are available.",
  },
  {
    target: "settings-btn",
    title: "Settings",
    body: "Click here to adjust material settings like roll length, width, cost and waste. You can also manage markup multipliers and VAT rate here.",
  },
  {
    target: "print-job",
    title: "Print Job",
    body: "Enter the width and height of your print in millimeters, plus how many you need. The calculator will work out how many fit across the roll and flag any wasted space.",
  },
  {
    target: "vinyl-preview",
    title: "Layout Preview",
    body: "This shows how your prints will be laid out on the roll. Blue rectangles are prints, red areas are cut waste. It will rotate prints automatically if that fits more across.",
  },
  {
    target: "cost-breakdown",
    title: "Cost Breakdown",
    body: "See the material cost per print, how many fit per metre, how many fit across the roll width, and the total per full roll.",
  },
  {
    target: "pricing-table",
    title: "Pricing Table",
    body: "Your markup multipliers are applied to the cost price to give you selling prices. The table shows ex-VAT, inc-VAT and margin for each markup level, plus bulk discount tiers.",
  },
  {
    target: "order-summary",
    title: "Order Summary",
    body: "Based on your quantity, this shows total vinyl used, rolls needed, material cost, and revenue/profit at each markup level. Bulk discounts are applied automatically.",
  },
  {
    target: "custom-length",
    title: "Custom Length Estimator",
    body: "Got a specific length of vinyl? Enter it here to see how many prints you can fit. Handy for using up offcuts.",
  },
  {
    target: "bulk-discount",
    title: "Bulk Discounts",
    body: "Set up volume discount tiers based on metres of vinyl used. These automatically apply in the pricing and order summary sections.",
  },
];

const TutorialOverlay = ({ step, totalSteps, currentStep, onNext, onPrev, onClose }) => {
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipStyle, setTooltipStyle] = useState({});

  useEffect(() => {
    if (!step.target) {
      setPos({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }
    const el = document.getElementById(step.target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 8;
    setPos({
      top: rect.top + window.scrollY - padding,
      left: rect.left + window.scrollX - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step.target]);

  useEffect(() => {
    if (!tooltipRef.current) return;
    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();

    if (!step.target) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    const el = document.getElementById(step.target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;

    // Try below
    if (rect.bottom + tooltipRect.height + 16 < vh) {
      top = rect.bottom + 12;
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    }
    // Try above
    else if (rect.top - tooltipRect.height - 16 > 0) {
      top = rect.top - tooltipRect.height - 12;
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    }
    // Fallback: center
    else {
      top = vh / 2 - tooltipRect.height / 2;
      left = vw / 2 - tooltipRect.width / 2;
    }

    // Clamp horizontal
    left = Math.max(16, Math.min(left, vw - tooltipRect.width - 16));
    top = Math.max(16, top);

    setTooltipStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [pos, step.target]);

  const isWelcome = !step.target;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {!isWelcome && pos.width > 0 && (
              <rect
                x={pos.left}
                y={pos.top}
                width={pos.width}
                height={pos.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Highlight border */}
      {!isWelcome && pos.width > 0 && (
        <div
          className="absolute rounded-xl border-2 border-blue-400 pointer-events-none"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            height: pos.height,
            boxShadow: "0 0 0 4px rgba(59,130,246,0.2)",
          }}
        />
      )}

      {/* Click blocker */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="bg-white rounded-2xl shadow-2xl p-6 z-10 max-w-sm"
        style={{ ...tooltipStyle, pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none ml-4 -mt-1"
          >
            &times;
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">{step.body}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {currentStep + 1} / {totalSteps}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={onPrev}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={currentStep < totalSteps - 1 ? onNext : onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep < totalSteps - 1 ? "Next" : "Got it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Vinyl type defaults ─────────────────────────────────────────────
const VINYL_DEFAULTS = {
  uv: {
    label: "UV Vinyl",
    rollLength: 100,
    rollWidth: 280,
    costExVat: 195,
    wastePerCut: 300,
    gap: 4,
  },
  whiteSticker: {
    label: "White Sticker",
    rollLength: 50,
    rollWidth: 1500,
    costExVat: 127.61,
    wastePerCut: 100,
    gap: 4,
  },
  clearSticker: {
    label: "Clear Sticker",
    rollLength: 20,
    rollWidth: 1150,
    costExVat: 66,
    wastePerCut: 100,
    gap: 4,
  },
};

// ─── Tiny helpers ────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, unit, step, min }) => (
  <div className="flex items-center justify-between gap-2 py-1.5">
    <label className="text-sm text-gray-600 whitespace-nowrap">{label}</label>
    <div className="flex items-center gap-1">
      {unit === "£" && <span className="text-sm text-gray-400">£</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step || 1}
        min={min ?? 0}
        className="w-24 px-2 py-1 text-right text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
      />
      {unit && unit !== "£" && (
        <span className="text-sm text-gray-400 w-8">{unit}</span>
      )}
    </div>
  </div>
);

const StatCard = ({ label, value, sub }) => (
  <div className="bg-gray-50 rounded-xl p-3 text-center">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-xl font-bold text-gray-800">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

// ─── Vinyl layout preview ───────────────────────────────────────────
const VinylPreview = ({ mat, printWidth, printHeight, across, rotated, quantity }) => {
  if (across <= 0 || quantity <= 0 || printWidth <= 0 || printHeight <= 0) return null;

  const gap = mat.gap;
  const waste = mat.wastePerCut;
  const edgeMargin = 10;
  const rollW = mat.rollWidth;
  const physW = rollW + edgeMargin * 2;

  // Effective print dims (accounting for rotation)
  const pw = rotated ? printHeight : printWidth;
  const ph = rotated ? printWidth : printHeight;

  // Row height (print + gap, NO waste — waste is per metre cut, not per row)
  const rowH = ph + gap;
  const totalRows = across > 0 ? Math.ceil(quantity / across) : 0;

  // Build layout: continuous rows, one cut waste at the very end
  const elements = [];
  let yPos = 0;
  for (let i = 0; i < totalRows; i++) {
    const printsInRow = Math.min(across, quantity - i * across);
    elements.push({ type: "row", y: yPos, prints: printsInRow, idx: i });
    yPos += rowH;
  }
  // Single cut waste at the end of the job
  if (waste > 0 && totalRows > 0) {
    elements.push({ type: "waste", y: yPos });
    yPos += waste;
  }

  const totalLengthMm = yPos;

  // Split into first/last metre if job is long
  // Show enough length so preview isn't too squat for wide rolls
  const showMm = Math.max(1000, physW * 2);
  const needsSplit = totalLengthMm > showMm * 1.5;
  const breakH = needsSplit ? Math.max(40, physW * 0.08) : 0;
  const displayH = needsSplit
    ? showMm + breakH + showMm
    : Math.max(totalLengthMm, showMm);

  // Filter elements for first/last sections
  const firstEls = needsSplit ? elements.filter((e) => e.y < showMm) : elements;
  const lastSectionStart = totalLengthMm - showMm;
  const lastEls = needsSplit
    ? elements.filter((e) => {
        const h = e.type === "waste" ? waste : ph;
        return e.y + h > lastSectionStart;
      })
    : [];
  const lastOffset = needsSplit ? showMm + breakH - lastSectionStart : 0;

  // Adaptive sizes — larger text for readability at small preview size
  const fontSize = Math.max(18, physW * 0.07);
  const lineW = Math.max(0.5, physW * 0.003);

  const renderElement = (e, offsetY) => {
    const y = e.y + offsetY;
    if (e.type === "waste") {
      return (
        <g key={`w${e.y}`}>
          <rect x={edgeMargin} y={y} width={rollW} height={waste} fill="#ef4444" opacity={0.15} />
          <rect x={edgeMargin} y={y} width={rollW} height={waste} fill="none" stroke="#ef4444" strokeWidth={lineW} opacity={0.3} />
          {waste >= fontSize * 1.2 && (
            <text x={edgeMargin + rollW / 2} y={y + waste / 2 + fontSize * 0.35} fontSize={fontSize * 0.8} fill="#ef4444" opacity={0.5} textAnchor="middle" fontFamily="sans-serif" fontWeight="600">
              CUT WASTE
            </text>
          )}
        </g>
      );
    }
    const els = [];
    for (let j = 0; j < e.prints; j++) {
      els.push(
        <rect
          key={`p${e.idx}-${j}`}
          x={edgeMargin + j * (pw + gap)}
          y={y}
          width={pw}
          height={ph}
          fill="#3b82f6"
          opacity={0.75}
          rx={Math.max(1, pw * 0.02)}
        />
      );
    }
    return els;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Vinyl Layout Preview
      </h2>
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${physW} ${displayH}`}
          className="w-full border border-gray-100 rounded-lg"
          preserveAspectRatio="xMidYMin meet"
        >
          <defs>
            <clipPath id="vlp-first">
              <rect x={0} y={0} width={physW} height={showMm} />
            </clipPath>
            {needsSplit && (
              <clipPath id="vlp-last">
                <rect x={0} y={showMm + breakH} width={physW} height={showMm} />
              </clipPath>
            )}
          </defs>

          {/* Roll background (gray edges) + usable area (white) */}
          <rect x={0} y={0} width={physW} height={needsSplit ? showMm : displayH} fill="#e5e7eb" rx={2} />
          <rect x={edgeMargin} y={0} width={rollW} height={needsSplit ? showMm : displayH} fill="#fafafa" />

          {/* First section elements (clipped) */}
          <g clipPath={needsSplit ? "url(#vlp-first)" : undefined}>
            {firstEls.map((e) => renderElement(e, 0))}
          </g>

          {/* 1m marker */}
          {displayH >= 950 && (
            <>
              <line x1={0} y1={1000} x2={physW} y2={1000} stroke="#9ca3af" strokeWidth={lineW * 2} strokeDasharray={`${fontSize * 0.6},${fontSize * 0.3}`} />
              <text x={physW - fontSize * 0.3} y={1000 - fontSize * 0.4} fontSize={fontSize} fill="#9ca3af" textAnchor="end" fontFamily="sans-serif">1m</text>
            </>
          )}

          {/* Split break + last section */}
          {needsSplit && (
            <>
              <rect x={0} y={showMm} width={physW} height={breakH} fill="#f3f4f6" />
              <line x1={0} y1={showMm} x2={physW} y2={showMm} stroke="#d1d5db" strokeWidth={lineW} strokeDasharray={`${fontSize * 0.4},${fontSize * 0.3}`} />
              <line x1={0} y1={showMm + breakH} x2={physW} y2={showMm + breakH} stroke="#d1d5db" strokeWidth={lineW} strokeDasharray={`${fontSize * 0.4},${fontSize * 0.3}`} />
              <text x={physW / 2} y={showMm + breakH / 2 + fontSize * 0.35} fontSize={fontSize} fill="#9ca3af" textAnchor="middle" fontFamily="sans-serif">
                {((totalLengthMm - 2 * showMm) / 1000).toFixed(1)}m more
              </text>

              <rect x={0} y={showMm + breakH} width={physW} height={showMm} fill="#e5e7eb" />
              <rect x={edgeMargin} y={showMm + breakH} width={rollW} height={showMm} fill="#fafafa" />

              <g clipPath="url(#vlp-last)">
                {lastEls.map((e) => renderElement(e, lastOffset))}
              </g>
            </>
          )}

          {/* Width label */}
          <text x={physW / 2} y={displayH - fontSize * 0.3} fontSize={fontSize * 0.85} fill="#9ca3af" textAnchor="middle" fontFamily="sans-serif">
            {rollW}mm usable
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500 opacity-75" /> Prints
        </span>
        {waste > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-400 opacity-25" /> Cut waste
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-gray-300" /> Roll edge
        </span>
      </div>
      {rotated && (
        <div className="mt-1.5 text-xs text-blue-500 font-medium">Prints rotated 90° for optimal fit</div>
      )}
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────
export default function VinylCalculator() {
  // Active vinyl tab
  const [activeType, setActiveType] = useState("uv");

  // Material settings panel open/closed
  const [showSettings, setShowSettings] = useState(false);

  // Material settings per type (initialised from defaults)
  const [materials, setMaterials] = useState(() => {
    const m = {};
    for (const [key, def] of Object.entries(VINYL_DEFAULTS)) {
      m[key] = { ...def };
    }
    return m;
  });

  // Print job inputs (shared across types)
  const [printWidth, setPrintWidth] = useState(0);
  const [printHeight, setPrintHeight] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // VAT rate
  const [vatRate, setVatRate] = useState(20);

  // Markup multipliers (objects with value + optional label)
  const [multipliers, setMultipliers] = useState([
    { value: 5, label: "Competitive Price" },
    { value: 7, label: "Average Price" },
  ]);
  const [newMultiplier, setNewMultiplier] = useState("");
  const [newMultiplierLabel, setNewMultiplierLabel] = useState("");

  // Bulk discount tiers (based on metres of vinyl used)
  const [discountTiers, setDiscountTiers] = useState([
    { minMetres: 5, discount: 20 },
    { minMetres: 10, discount: 40 },
    { minMetres: 20, discount: 50 },
  ]);
  const [newTierMetres, setNewTierMetres] = useState("");
  const [newTierDiscount, setNewTierDiscount] = useState("");

  // Custom length estimator
  const [customLength, setCustomLength] = useState(1000);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem("vinyl-calc-tutorial-done");
  });
  const [tutorialStep, setTutorialStep] = useState(0);
  const prefsBeforeTutorial = useRef(null);

  const startTutorial = () => {
    // Save current values so we can restore after
    prefsBeforeTutorial.current = { printWidth, printHeight, quantity };
    // Set example values so the user can see real numbers
    setPrintWidth(90);
    setPrintHeight(150);
    setQuantity(6);
    setTutorialStep(0);
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("vinyl-calc-tutorial-done", "1");
    // Restore previous values
    if (prefsBeforeTutorial.current) {
      setPrintWidth(prefsBeforeTutorial.current.printWidth);
      setPrintHeight(prefsBeforeTutorial.current.printHeight);
      setQuantity(prefsBeforeTutorial.current.quantity);
      prefsBeforeTutorial.current = null;
    }
  };

  // Set example values on first-ever load (tutorial auto-shows)
  useEffect(() => {
    if (showTutorial && !prefsBeforeTutorial.current) {
      prefsBeforeTutorial.current = { printWidth: 0, printHeight: 0, quantity: 1 };
      setPrintWidth(90);
      setPrintHeight(150);
      setQuantity(6);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Current material shortcut
  const mat = materials[activeType];

  const updateMaterial = useCallback(
    (field, value) => {
      setMaterials((prev) => ({
        ...prev,
        [activeType]: { ...prev[activeType], [field]: value },
      }));
    },
    [activeType]
  );

  // ── Calculations ──────────────────────────────────────────────────
  const calc = useMemo(() => {
    const rollLengthMm = mat.rollLength * 1000;
    const vatMul = 1 + vatRate / 100;
    const rollCostIncVat = mat.costExVat * vatMul;

    // Each print's footprint includes the gap (space between prints)
    const effectiveWidth = printWidth + mat.gap;
    const effectiveHeight = printHeight + mat.gap;
    const printAreaMm2 = effectiveWidth * effectiveHeight;

    // ── Area-based cost formula ─────────────────────────────────────
    // Per metre of roll: some length is usable, some is lost to cuts
    const usableLengthPerM = 1000 - mat.wastePerCut; // mm usable per 1000mm
    const usableAreaPerM = mat.rollWidth * usableLengthPerM; // mm² usable per metre
    const wastageMultiplier = usableLengthPerM > 0 ? 1000 / usableLengthPerM : 0;

    // Cost per mm² of usable area, then apply wastage multiplier
    const costPerM_exVat = mat.rollLength > 0 ? mat.costExVat / mat.rollLength : 0;
    const costPerM_incVat = mat.rollLength > 0 ? rollCostIncVat / mat.rollLength : 0;

    const costPerMmSq_exVat = usableAreaPerM > 0
      ? (costPerM_exVat / usableAreaPerM) * wastageMultiplier : 0;
    const costPerMmSq_incVat = usableAreaPerM > 0
      ? (costPerM_incVat / usableAreaPerM) * wastageMultiplier : 0;

    const costPerPrintExVat = Math.round(printAreaMm2 * costPerMmSq_exVat * 100) / 100;
    const costPerPrintIncVat = Math.round(printAreaMm2 * costPerMmSq_incVat * 100) / 100;

    // ── Discrete layout helper ────────────────────────────────────────
    // Fits prints into a given width × length, trying both orientations.
    // Gap only applies BETWEEN adjacent prints, not as padding on the edges.
    // N items across: N * printW + (N-1) * gap <= available
    //   → N <= (available + gap) / (printW + gap)
    const gap = mat.gap;
    const fitPrints = (areaWidth, areaLength, pW, pH, waste) => {
      // Normal orientation
      const nAcross = pW + gap > 0 ? Math.floor((areaWidth + gap) / (pW + gap)) : 0;
      const nRowH = pH + gap + waste;
      const nRows = nRowH > 0 ? Math.floor((areaLength + gap) / nRowH) : 0;
      const nTotal = nAcross * nRows;
      const nPrintRowH = pH + gap; // row height without waste (just print + gap)

      // Rotated 90° (swap width/height)
      const rAcross = pH + gap > 0 ? Math.floor((areaWidth + gap) / (pH + gap)) : 0;
      const rRowH = pW + gap + waste;
      const rRows = rRowH > 0 ? Math.floor((areaLength + gap) / rRowH) : 0;
      const rTotal = rAcross * rRows;
      const rPrintRowH = pW + gap;

      if (rTotal > nTotal) {
        return { across: rAcross, rows: rRows, total: rTotal, rotated: true, printRowH: rPrintRowH };
      }
      return { across: nAcross, rows: nRows, total: nTotal, rotated: false, printRowH: nPrintRowH };
    };

    // Full roll layout
    const rollFit = fitPrints(mat.rollWidth, rollLengthMm, printWidth, printHeight, mat.wastePerCut);
    const printsAcross = rollFit.across;
    const rowsPerRoll = rollFit.rows;
    const totalPerRoll = rollFit.total;

    // Horizontal waste analysis — how much roll width is unused
    const effectivePw = rollFit.rotated ? printHeight : printWidth;
    const usedWidth = printsAcross > 0 ? printsAcross * (effectivePw + gap) - gap : 0;
    const horizontalWaste = mat.rollWidth - usedWidth;
    // Suggestion: shrink to fit one more across
    const fitOneMoreSize = printsAcross >= 0
      ? Math.floor((mat.rollWidth + gap) / (printsAcross + 1) - gap)
      : 0;
    // Suggestion: grow to fill the row
    const fillRowSize = printsAcross > 0
      ? Math.floor((mat.rollWidth + gap) / printsAcross - gap)
      : 0;
    // Which user dimension does this apply to? (width normally, height if rotated)
    const wasteDimension = rollFit.rotated ? "height" : "width";

    // Prints per metre (decimal, actual physical fit, no waste)
    const metrefit = fitPrints(mat.rollWidth, 1000, printWidth, printHeight, 0);
    const printsPerMetre = metrefit.across > 0 && metrefit.printRowH > 0
      ? metrefit.across * (1000 / metrefit.printRowH)
      : 0;

    // Total vinyl length used for this order (metres)
    // Rows print continuously (no cuts between rows), one cut waste at the end
    const orderPrintsAcross = rollFit.across > 0 ? rollFit.across : 1;
    const orderRows = Math.ceil(quantity / orderPrintsAcross);
    const orderLengthMm = orderRows * rollFit.printRowH + mat.wastePerCut;
    const orderMetres = orderLengthMm / 1000;

    // Order summary — find applicable discount based on metres used
    const sortedTiers = [...discountTiers].sort(
      (a, b) => b.minMetres - a.minMetres
    );
    const applicableTier = sortedTiers.find((t) => orderMetres >= t.minMetres);
    const appliedDiscount = applicableTier ? applicableTier.discount : 0;

    // Pricing rows for each multiplier
    const pricingRows = multipliers.map((mul) => {
      const unitPriceExVat = costPerPrintExVat * mul.value;
      const unitPriceIncVat = costPerPrintIncVat * mul.value;
      const marginPercent =
        unitPriceExVat > 0
          ? ((unitPriceExVat - costPerPrintExVat) / unitPriceExVat) * 100
          : 0;

      const bulkPrices = discountTiers.map((tier) => ({
        minMetres: tier.minMetres,
        discount: tier.discount,
        priceExVat: unitPriceExVat * (1 - tier.discount / 100),
        priceIncVat: unitPriceIncVat * (1 - tier.discount / 100),
      }));

      return { multiplier: mul.value, label: mul.label, unitPriceExVat, unitPriceIncVat, marginPercent, bulkPrices };
    });

    // Material cost = cost per print × quantity
    const rollsNeeded = totalPerRoll > 0 ? Math.ceil(quantity / totalPerRoll) : 0;
    const materialCostExVat = costPerPrintExVat * quantity;
    const materialCostIncVat = costPerPrintIncVat * quantity;

    // Custom length fitting — try both orientations, exact and +1 row each,
    // then pick the option whose actual length is closest to the target
    const targetMm = customLength;
    const maxMm = customLength * 1.1;
    const candidates = [];
    const addCandidates = (pW, pH, isRotated) => {
      const nAcross = pW + gap > 0 ? Math.floor((mat.rollWidth + gap) / (pW + gap)) : 0;
      if (nAcross === 0) return;
      const nRowH = pH + gap;
      if (nRowH <= 0) return;
      const exactRows = Math.floor((targetMm + gap) / nRowH);
      if (exactRows > 0) {
        const len = exactRows * nRowH - gap;
        candidates.push({ across: nAcross, rows: exactRows, total: nAcross * exactRows, length: len, rotated: isRotated });
      }
      const plusRows = exactRows + 1;
      const plusLen = plusRows * nRowH - gap;
      if (plusLen <= maxMm) {
        candidates.push({ across: nAcross, rows: plusRows, total: nAcross * plusRows, length: plusLen, rotated: isRotated });
      }
    };
    // Use the same orientation as the main roll fit for consistency
    if (rollFit.rotated) {
      addCandidates(printHeight, printWidth, true);
    } else {
      addCandidates(printWidth, printHeight, false);
    }
    // Sort by most prints first, then closest to target as tiebreak
    candidates.sort((a, b) => {
      if (a.total !== b.total) return b.total - a.total;
      return Math.abs(a.length - targetMm) - Math.abs(b.length - targetMm);
    });
    const best = candidates[0] || { across: 0, rows: 0, total: 0, length: 0, rotated: false };
    const customFit = { across: best.across, rows: best.rows, total: best.total, rotated: best.rotated };
    const customActualLength = best.length;

    return {
      rollLengthMm,
      rollCostIncVat,
      effectiveWidth,
      effectiveHeight,
      printAreaMm2,
      printsAcross,
      printsPerMetre,
      totalPerRoll,
      costPerPrintExVat,
      costPerPrintIncVat,
      orderMetres,
      pricingRows,
      appliedDiscount,
      rollsNeeded,
      materialCostExVat,
      materialCostIncVat,
      customFit,
      customActualLength,
      rollFitRotated: rollFit.rotated,
      horizontalWaste,
      fitOneMoreSize,
      fillRowSize,
      wasteDimension,
    };
  }, [mat, printWidth, printHeight, vatRate, multipliers, discountTiers, quantity, customLength]);

  // ── Multiplier helpers ────────────────────────────────────────────
  const addMultiplier = () => {
    const v = parseFloat(newMultiplier);
    if (v > 0 && !multipliers.some((m) => m.value === v)) {
      const label = newMultiplierLabel.trim() || null;
      setMultipliers((prev) =>
        [...prev, { value: v, label }].sort((a, b) => a.value - b.value)
      );
      setNewMultiplier("");
      setNewMultiplierLabel("");
    }
  };

  const removeMultiplier = (value) =>
    setMultipliers((prev) => prev.filter((x) => x.value !== value));

  // ── Discount tier helpers ─────────────────────────────────────────
  const addTier = () => {
    const metres = parseFloat(newTierMetres);
    const disc = parseFloat(newTierDiscount);
    if (metres > 0 && disc > 0 && disc < 100) {
      setDiscountTiers((prev) =>
        [...prev.filter((t) => t.minMetres !== metres), { minMetres: metres, discount: disc }].sort(
          (a, b) => a.minMetres - b.minMetres
        )
      );
      setNewTierMetres("");
      setNewTierDiscount("");
    }
  };

  const removeTier = (minMetres) =>
    setDiscountTiers((prev) => prev.filter((t) => t.minMetres !== minMetres));

  // ── Format helpers ────────────────────────────────────────────────
  const fmt = (v) => `£${v.toFixed(2)}`;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Tutorial overlay */}
      {showTutorial && (
        <TutorialOverlay
          step={TUTORIAL_STEPS[tutorialStep]}
          totalSteps={TUTORIAL_STEPS.length}
          currentStep={tutorialStep}
          onNext={() => setTutorialStep((s) => Math.min(s + 1, TUTORIAL_STEPS.length - 1))}
          onPrev={() => setTutorialStep((s) => Math.max(s - 1, 0))}
          onClose={closeTutorial}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Vinyl Printing Calculator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Calculate cost per print, selling prices and margins for vinyl jobs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startTutorial}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tutorial
          </button>
          <button
            id="settings-btn"
            onClick={() => setShowSettings((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showSettings
                ? "bg-gray-800 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Vinyl type tabs */}
      <div id="vinyl-tabs" className="flex gap-2">
        {Object.entries(VINYL_DEFAULTS).map(([key, def]) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeType === key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {def.label}
          </button>
        ))}
      </div>

      {/* Settings Panel — slides open */}
      {showSettings && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Settings
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              ×
            </button>
          </div>

          {/* Material Settings */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Material — {mat.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
              <InputField label="Roll length" value={mat.rollLength} onChange={(v) => updateMaterial("rollLength", v)} unit="m" step={1} />
              <InputField label="Roll width" value={mat.rollWidth} onChange={(v) => updateMaterial("rollWidth", v)} unit="mm" step={1} />
              <InputField label="Cost (ex-VAT)" value={mat.costExVat} onChange={(v) => updateMaterial("costExVat", v)} unit="£" step={0.01} />
              <InputField label="Waste per cut" value={mat.wastePerCut} onChange={(v) => updateMaterial("wastePerCut", v)} unit="mm" step={1} />
              <InputField label="Gap between prints" value={mat.gap} onChange={(v) => updateMaterial("gap", v)} unit="mm" step={1} />
              <InputField label="VAT rate" value={vatRate} onChange={setVatRate} unit="%" step={0.5} />
            </div>
          </div>

          {/* Markup Multipliers */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Markup Multipliers
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {multipliers.map((m) => (
                <span
                  key={m.value}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {m.label ? `${m.label} (${m.value}x)` : `${m.value}x`}
                  <button
                    onClick={() => removeMultiplier(m.value)}
                    className="ml-1 text-blue-400 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Multiplier"
                value={newMultiplier}
                onChange={(e) => setNewMultiplier(e.target.value)}
                step={0.5}
                min={1}
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Label (optional)"
                value={newMultiplierLabel}
                onChange={(e) => setNewMultiplierLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={addMultiplier}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout: fixed preview sidebar + two-column grid */}
      <div className="flex gap-6">
        {/* ── PREVIEW COLUMN (fixed width) ────────────────────── */}
        <div id="vinyl-preview" className="hidden md:block flex-shrink-0" style={{ width: 350 }}>
          <VinylPreview
            mat={mat}
            printWidth={printWidth}
            printHeight={printHeight}
            across={calc.printsAcross}
            rotated={calc.rollFitRotated}
            quantity={quantity}
          />
        </div>

        {/* ── MAIN CONTENT (two-column grid) ─────────────────── */}
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT COLUMN ────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Print Job */}
          <div id="print-job" className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Print Job
            </h2>
            <InputField label="Print width" value={printWidth} onChange={setPrintWidth} unit="mm" />
            <InputField label="Print height" value={printHeight} onChange={setPrintHeight} unit="mm" />
            <InputField label="Quantity" value={quantity} onChange={setQuantity} unit="pcs" min={1} />

            {/* Fill-the-row hint */}
            {calc.printsAcross > 0 && quantity > 0 && quantity % calc.printsAcross !== 0 && (
              <div className="text-xs text-gray-500 mt-1 ml-1">
                {Math.ceil(quantity / calc.printsAcross) * calc.printsAcross} would fill the last row ({calc.printsAcross} across)
              </div>
            )}

            {/* Horizontal waste warning */}
            {calc.horizontalWaste > 60 && calc.printsAcross > 0 && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <div className="font-semibold mb-1">
                  {calc.horizontalWaste}mm wasted across roll width
                </div>
                <div className="text-xs text-red-600 space-y-0.5">
                  {calc.fitOneMoreSize > 0 && (
                    <div>
                      Reduce {calc.wasteDimension} to <strong>{calc.fitOneMoreSize}mm</strong> to fit {calc.printsAcross + 1} across
                    </div>
                  )}
                  {calc.fillRowSize > 0 && calc.fillRowSize > (calc.rollFitRotated ? printHeight : printWidth) && (
                    <div>
                      Increase {calc.wasteDimension} to <strong>{calc.fillRowSize}mm</strong> to fill the row
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Length Estimator */}
          <div id="custom-length" className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Custom Length Estimator
            </h2>
            <InputField label="Vinyl length" value={customLength} onChange={setCustomLength} unit="mm" min={1} />
            {calc.costPerPrintExVat > 0 && (
              <div className="mt-3 space-y-2">
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {calc.customActualLength > customLength
                        ? `Uses ${Math.round(calc.customActualLength)}mm of vinyl`
                        : `Fits in ${customLength}mm x ${mat.rollWidth}mm`}
                    </span>
                    <span className="text-lg font-bold text-blue-800">{calc.customFit.total} prints</span>
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {calc.customFit.across} across x {calc.customFit.rows} rows
                    {calc.customFit.rotated && (
                      <span className="ml-2 bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                        Rotated 90°
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Discount Tiers */}
          <div id="bulk-discount" className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Bulk Discount (by vinyl used)
            </h2>
            <div className="text-xs text-gray-400 mb-2">Base price up to {discountTiers.length > 0 ? `${discountTiers[0].minMetres}m` : '...'}</div>
            {discountTiers.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {discountTiers.map((tier) => (
                  <div
                    key={tier.minMetres}
                    className="flex items-center justify-between bg-green-50 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span className="text-green-700 font-medium">
                      {tier.minMetres}m+ → {tier.discount}% off
                    </span>
                    <button
                      onClick={() => removeTier(tier.minMetres)}
                      className="text-green-400 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min metres"
                value={newTierMetres}
                onChange={(e) => setNewTierMetres(e.target.value)}
                min={0.1}
                step={0.5}
                className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                placeholder="Discount %"
                value={newTierDiscount}
                onChange={(e) => setNewTierDiscount(e.target.value)}
                min={1}
                max={99}
                className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={addTier}
                className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Roll Summary */}
          <div id="cost-breakdown" className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Cost Breakdown
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Cost per print"
                value={fmt(calc.costPerPrintIncVat)}
                sub={`${fmt(calc.costPerPrintExVat)} ex-VAT`}
              />
              <StatCard
                label="Per metre"
                value={calc.printsPerMetre % 1 === 0 ? calc.printsPerMetre : calc.printsPerMetre.toFixed(2)}
                sub="prints"
              />
              <StatCard label="Prints across" value={calc.printsAcross} />
              <StatCard label="Total per roll" value={calc.totalPerRoll} />
            </div>
            <div className="mt-3 text-xs text-gray-400 space-y-0.5">
              <div>
                Print footprint: {calc.effectiveWidth}mm x {calc.effectiveHeight}mm ({printWidth}+{mat.gap} x {printHeight}+{mat.gap})
              </div>
              <div>
                Print area: {(calc.printAreaMm2 / 100).toFixed(1)} cm² — Roll cost inc-VAT: {fmt(calc.rollCostIncVat)}
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div id="pricing-table" className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Pricing Table
            </h2>
            {calc.costPerPrintExVat === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Enter valid print dimensions to see pricing.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase">
                      <th className="py-2 pr-2">Markup</th>
                      <th className="py-2 pr-2">Unit (ex-VAT)</th>
                      <th className="py-2 pr-2">Unit (inc-VAT)</th>
                      <th className="py-2 pr-2">Margin</th>
                      {discountTiers.map((t) => (
                        <th key={t.minMetres} className="py-2 pr-2">
                          {t.minMetres}m+
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calc.pricingRows.map((row) => (
                      <tr
                        key={row.multiplier}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 pr-2 font-semibold text-gray-700">
                          {row.label ? <>{row.label} <span className="text-gray-400 font-normal">({row.multiplier}x)</span></> : `${row.multiplier}x`}
                        </td>
                        <td className="py-2 pr-2">{fmt(row.unitPriceExVat)}</td>
                        <td className="py-2 pr-2">{fmt(row.unitPriceIncVat)}</td>
                        <td className="py-2 pr-2 text-green-600 font-medium">
                          {row.marginPercent.toFixed(1)}%
                        </td>
                        {row.bulkPrices.map((bp) => (
                          <td key={bp.minMetres} className="py-2 pr-2 text-gray-500">
                            {fmt(bp.priceExVat)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div id="order-summary" className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Order Summary — {quantity} pcs
            </h2>
            {calc.costPerPrintExVat === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Enter valid print dimensions to see order summary.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <StatCard
                    label="Vinyl used"
                    value={`${calc.orderMetres.toFixed(1)}m`}
                  />
                  <StatCard
                    label="Rolls needed"
                    value={calc.rollsNeeded}
                  />
                  <StatCard
                    label="Material cost"
                    value={fmt(calc.materialCostIncVat)}
                    sub={`${fmt(calc.materialCostExVat)} ex-VAT`}
                  />
                </div>

                {calc.appliedDiscount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-4 text-sm text-green-700 font-medium">
                    Bulk discount applied: {calc.appliedDiscount}% off ({calc.orderMetres.toFixed(1)}m of vinyl used)
                  </div>
                )}

                {/* Revenue/profit per multiplier */}
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Revenue &amp; Profit by Markup
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase">
                        <th className="py-2 pr-2">Markup</th>
                        <th className="py-2 pr-2">Revenue (ex)</th>
                        <th className="py-2 pr-2">Profit (ex)</th>
                        <th className="py-2 pr-2">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.pricingRows.map((row) => {
                        const discountMul = 1 - calc.appliedDiscount / 100;
                        const unitSell = row.unitPriceExVat * discountMul;
                        const revenue = unitSell * quantity;
                        const profit = revenue - calc.materialCostExVat;
                        const margin =
                          revenue > 0 ? (profit / revenue) * 100 : 0;
                        return (
                          <tr
                            key={row.multiplier}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 pr-2 font-semibold text-gray-700">
                              {row.label ? <>{row.label} <span className="text-gray-400 font-normal">({row.multiplier}x)</span></> : `${row.multiplier}x`}
                            </td>
                            <td className="py-2 pr-2">{fmt(revenue)}</td>
                            <td
                              className={`py-2 pr-2 font-medium ${
                                profit >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {fmt(profit)}
                            </td>
                            <td
                              className={`py-2 pr-2 ${
                                margin >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {margin.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
        </div>{/* close grid wrapper */}
      </div>{/* close flex */}
    </div>
  );
}
