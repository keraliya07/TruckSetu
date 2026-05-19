const PDFDocument = require('pdfkit');
const path = require('path');

const FONT_R = path.join(__dirname, '..', '..', 'fonts', 'NotoSans-Regular.ttf');
const FONT_B = path.join(__dirname, '..', '..', 'fonts', 'NotoSans-Bold.ttf');

// ── Palette ──────────────────────────────────────────────────────────────────
const BLUE      = '#1D4ED8';
const BLUE_SOFT = '#EFF6FF';
const BLUE_LINE = '#BFDBFE';
const PICKUP_DOT = '#1E293B';  // dark slate for PICKUP dot
const GREEN_D   = '#15803D';
const GREEN_L   = '#DCFCE7';
const RED_D     = '#B91C1C';
const RED_L     = '#FEE2E2';
const TXT_D     = '#111827';
const TXT_M     = '#4B5563';
const TXT_L     = '#9CA3AF';
const BORDER    = '#E5E7EB';
const WHITE     = '#FFFFFF';

const PW = 595.28;
const PH = 841.89;
const ML = 44;          // margin left / right
const CW = PW - ML * 2; // content width

// ── Utils ────────────────────────────────────────────────────────────────────
const collectPdfBuffer = async (builder) => {
  const doc = new PDFDocument({ margin: 0, size: 'A4' });
  try { doc.registerFont('R', FONT_R); doc.registerFont('B', FONT_B); }
  catch (_) { doc.registerFont('R', 'Helvetica'); doc.registerFont('B', 'Helvetica-Bold'); }
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((res) => doc.on('end', () => res(Buffer.concat(chunks))));
  builder(doc);
  doc.end();
  return done;
};

const fmt = (v) =>
  '\u20B9' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(v || 0));

const fmtDate = (d) =>
  (d instanceof Date ? d : new Date(d)).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const fill  = (doc, x, y, w, h, r, color) => doc.roundedRect(x, y, w, h, r).fill(color);
const hrule = (doc, y, c = BORDER) =>
  doc.moveTo(ML, y).lineTo(PW - ML, y).strokeColor(c).lineWidth(0.5).stroke();

// ── Invoice PDF ───────────────────────────────────────────────────────────────
const generateInvoicePDF = async (td) =>
  collectPdfBuffer((doc) => {
    const co = td.company || {};
    const invNo  = td.invoiceNumber || `INV-${(td.tripId || '').slice(0, 8).toUpperCase()}`;
    const invDate = td.invoiceDate ? fmtDate(td.invoiceDate) : fmtDate(new Date());
    const dueDate = td.dueDate     ? fmtDate(td.dueDate)     : 'N/A';
    const status  = (td.status || 'UNKNOWN').replace(/_/g, ' ');

    /* ── 1. Blue top accent bar ── */
    doc.rect(0, 0, PW, 5).fill(BLUE);

    /* ── 2. Company info block (left) + Invoice block (right) ── */
    // Company name
    doc.font('B').fontSize(16).fillColor(BLUE)
       .text(co.legalName || 'TruckSetu Logistics Pvt. Ltd.', ML, 18, { lineBreak: false });

    // Company address & contacts (small, stacked)
    let cy = 38;
    const compLines = [
      co.address,
      co.gstin  ? `GSTIN: ${co.gstin}` : null,
      co.pan    ? `PAN: ${co.pan}`     : null,
      [co.email, co.phone].filter(Boolean).join('  |  '),
      co.website,
    ].filter(Boolean);

    compLines.forEach((line) => {
      doc.font('R').fontSize(8).fillColor(TXT_M).text(line, ML, cy, { lineBreak: false });
      cy += 11;
    });

    // INVOICE block (right column)
    doc.font('B').fontSize(24).fillColor(TXT_D)
       .text('INVOICE', 0, 16, { align: 'right', width: PW - ML, lineBreak: false });

    const metaRight = [
      { label: 'Invoice No.', value: invNo,    bold: true  },
      { label: 'Date',        value: invDate,  bold: false },
      { label: 'Due Date',    value: dueDate,  bold: true  },
    ];
    let ry = 46;
    metaRight.forEach(({ label, value, bold }) => {
      doc.font('R').fontSize(8).fillColor(TXT_L)
         .text(`${label}:`, 0, ry, { align: 'right', width: PW - ML, lineBreak: false });
      doc.font(bold ? 'B' : 'R').fontSize(9).fillColor(bold ? BLUE : TXT_D)
         .text(value, 0, ry + 10, { align: 'right', width: PW - ML, lineBreak: false });
      ry += 24;
    });

    // Status badge
    const badgeW = status.length * 7 + 28;
    fill(doc, ML, cy + 4, badgeW, 17, 4, GREEN_L);
    doc.font('B').fontSize(8).fillColor(GREEN_D)
       .text(status, ML + 8, cy + 8, { width: badgeW - 16, align: 'center', lineBreak: false });

    // Divider
    const divY = Math.max(cy + 28, ry + 10);
    hrule(doc, divY);

    /* ── 3. Horizontal Route Bar ── */
    const routeTop = divY + 10;
    fill(doc, ML - 4, routeTop, CW + 8, 96, 6, BLUE_SOFT);

    doc.font('B').fontSize(8).fillColor(BLUE)
       .text('SHIPMENT ROUTE', ML + 6, routeTop + 8, { characterSpacing: 1 });

    const stops = td.stops || [];
    const lineY  = routeTop + 46;
    const lineX1 = ML + 18;
    const lineX2 = PW - ML - 18;
    const lineW  = lineX2 - lineX1;
    const segW   = stops.length > 1 ? lineW / (stops.length - 1) : lineW;

    // dashed line
    doc.moveTo(lineX1, lineY).lineTo(lineX2, lineY)
       .strokeColor(BLUE_LINE).lineWidth(2).dash(6, { space: 4 }).stroke();
    doc.undash();

    stops.forEach((stop, i) => {
      const cx  = lineX1 + i * segW;
      const isP = stop.type === 'PICKUP';
      const dc  = isP ? PICKUP_DOT : BLUE;
      // dot
      doc.circle(cx, lineY, 9).fill(WHITE);
      doc.circle(cx, lineY, 9).strokeColor(dc).lineWidth(2).stroke();
      doc.circle(cx, lineY, 4).fill(dc);
      // type label above
      doc.font('B').fontSize(7).fillColor(dc)
         .text(stop.type.replace(/_/g, ' '), cx - 30, lineY - 20, { width: 60, align: 'center', lineBreak: false });
      // city below
      doc.font('B').fontSize(9).fillColor(TXT_D)
         .text(stop.city, cx - 40, lineY + 13, { width: 80, align: 'center', lineBreak: false });
      // address below city
      const addr = (stop.address || '').length > 20 ? stop.address.slice(0, 20) + '\u2026' : (stop.address || '');
      doc.font('R').fontSize(7).fillColor(TXT_L)
         .text(addr, cx - 40, lineY + 25, { width: 80, align: 'center', lineBreak: false });
    });

    /* ── 4. Trip Info Grid ── */
    let y = routeTop + 108;
    const cardW = CW / 3;
    [
      { label: 'Truck',     value: td.truckRegistration },
      { label: 'Dealer',    value: td.dealerName },
      { label: 'Warehouse', value: td.warehouseName },
    ].forEach((c, i) => {
      const cx = ML + i * cardW;
      doc.roundedRect(cx, y, cardW - 10, 46, 5)
         .strokeColor(BORDER).lineWidth(0.6).stroke();
      doc.font('R').fontSize(7.5).fillColor(TXT_L)
         .text(c.label.toUpperCase(), cx + 10, y + 9, { characterSpacing: 0.7 });
      doc.font('B').fontSize(10).fillColor(TXT_D)
         .text(c.value || 'N/A', cx + 10, y + 22, { width: cardW - 22 });
    });
    y += 56;

    // IDs row
    [
      { label: 'Trip ID',    value: td.tripId },
      { label: 'Booking ID', value: td.bookingId },
    ].forEach((item, i) => {
      const cx = ML + i * (CW / 2);
      doc.font('R').fontSize(7.5).fillColor(TXT_L).text(item.label.toUpperCase(), cx, y, { characterSpacing: 0.7 });
      doc.font('R').fontSize(8).fillColor(TXT_M).text(item.value || 'N/A', cx, y + 11, { width: CW / 2 - 10 });
    });
    y += 34;

    /* ── 5. Commercial Breakdown ── */
    hrule(doc, y);
    y += 10;
    doc.font('B').fontSize(11).fillColor(TXT_D).text('Commercial Breakdown', ML, y);
    y += 16;

    // Table header
    fill(doc, ML, y, CW, 21, 4, BLUE);
    const C1 = ML + 8, C2 = ML + CW * 0.48, C3 = ML + CW * 0.73;
    doc.font('B').fontSize(8).fillColor(WHITE);
    doc.text('DESCRIPTION', C1, y + 6, { width: C2 - C1 - 8, lineBreak: false });
    doc.text('DETAIL',      C2, y + 6, { width: C3 - C2 - 8, lineBreak: false });
    doc.text('AMOUNT',      C3, y + 6, { width: PW - ML - C3 - 8, align: 'right', lineBreak: false });
    y += 27;

    (td.lineItems || []).forEach((item, idx) => {
      const rowH = 44;
      fill(doc, ML, y, CW, rowH, 3, idx % 2 === 0 ? WHITE : BLUE_SOFT);
      doc.font('B').fontSize(9).fillColor(TXT_D)
         .text(item.label, C1, y + 7, { width: C2 - C1 - 16, lineBreak: false });
      doc.font('R').fontSize(7.5).fillColor(TXT_M)
         .text(item.description, C1, y + 20, { width: C2 - C1 - 16 });
      doc.font('R').fontSize(8).fillColor(TXT_M)
         .text(item.quantityLabel, C2, y + 17, { width: C3 - C2 - 8 });
      doc.font('B').fontSize(11).fillColor(TXT_D)
         .text(fmt(item.amount), C3, y + 14, { width: PW - ML - C3 - 8, align: 'right', lineBreak: false });
      y += rowH + 2;
    });

    /* ── 6. Totals ── */
    y += 8;
    const sx = PW - ML - 210;
    doc.font('R').fontSize(9).fillColor(TXT_M).text('Subtotal', sx, y, { width: 120, lineBreak: false });
    doc.font('R').fontSize(9).fillColor(TXT_D).text(fmt(td.subtotal), sx + 120, y, { width: 90, align: 'right', lineBreak: false });
    y += 16;
    doc.font('R').fontSize(9).fillColor(TXT_M).text('Platform Fee', sx, y, { width: 120, lineBreak: false });
    doc.font('R').fontSize(9).fillColor(TXT_D).text(fmt(td.platformFee), sx + 120, y, { width: 90, align: 'right', lineBreak: false });
    y += 14;
    hrule(doc, y);
    y += 10;
    // Total bar
    fill(doc, sx - 10, y, 220, 34, 6, BLUE);
    doc.font('B').fontSize(9.5).fillColor(WHITE).text('TOTAL DUE', sx, y + 11, { width: 110, lineBreak: false });
    doc.font('B').fontSize(15).fillColor(WHITE).text(fmt(td.total), sx + 110, y + 8, { width: 100, align: 'right', lineBreak: false });
    y += 46;

    /* ── 7. Cargo Details ── */
    if (td.shipmentDetails && td.shipmentDetails.length > 0) {
      y += 6;
      hrule(doc, y);
      y += 10;
      doc.font('B').fontSize(11).fillColor(TXT_D).text('Cargo Details', ML, y);

      // Summary strip
      y += 16;
      fill(doc, ML, y, CW, 24, 4, BLUE_SOFT);
      doc.font('R').fontSize(8.5).fillColor(TXT_M)
         .text(
           `Total: ${(td.totalWeightKg || 0).toFixed(0)} kg  \u2022  ${td.shipmentDetails.length} shipment(s)`,
           ML + 10, y + 7, { lineBreak: false }
         );
      y += 30;

      // Shipment rows
      td.shipmentDetails.forEach((s, idx) => {
        fill(doc, ML, y, CW, 30, 3, idx % 2 === 0 ? WHITE : BLUE_SOFT);
        // title + route
        doc.font('B').fontSize(8.5).fillColor(TXT_D)
           .text(`${idx + 1}. ${s.title}`, ML + 8, y + 5, { width: CW * 0.5 - 8, lineBreak: false });
        doc.font('R').fontSize(7.5).fillColor(TXT_M)
           .text(`${s.originCity} \u2192 ${s.destCity}`, ML + 8, y + 17, { width: CW * 0.5 - 8 });
        // weight
        doc.font('B').fontSize(9).fillColor(BLUE)
           .text(`${s.weightKg.toFixed(0)} kg`, ML + CW * 0.5, y + 10, { width: CW * 0.22, align: 'center', lineBreak: false });
        // flags
        const flags = [];
        if (s.fragile)   flags.push({ text: 'FRAGILE',   bg: RED_L,   fg: RED_D  });
        if (s.hazardous) flags.push({ text: 'HAZARDOUS', bg: '#FEF3C7', fg: '#92400E' });
        let fx = ML + CW * 0.72;
        flags.forEach((f) => {
          fill(doc, fx, y + 8, f.text.length * 5.5 + 10, 14, 3, f.bg);
          doc.font('B').fontSize(7).fillColor(f.fg)
             .text(f.text, fx + 5, y + 11, { lineBreak: false });
          fx += f.text.length * 5.5 + 16;
        });
        y += 36;
      });
    }

    /* ── 8. Signature Block ── */
    y += 10;
    hrule(doc, y);
    y += 14;

    const sigBoxW = 200;
    const sigBoxX = PW - ML - sigBoxW;
    // dashed border box
    doc.roundedRect(sigBoxX, y, sigBoxW, 58, 5)
       .dash(4, { space: 3 }).strokeColor(BORDER).lineWidth(0.8).stroke();
    doc.undash();

    doc.font('R').fontSize(7.5).fillColor(TXT_L)
       .text('Authorized Signatory', sigBoxX, y + 6, { width: sigBoxW, align: 'center' });
    // signature line
    doc.moveTo(sigBoxX + 20, y + 46).lineTo(sigBoxX + sigBoxW - 20, y + 46)
       .strokeColor(BORDER).lineWidth(0.8).stroke();
    doc.font('B').fontSize(8).fillColor(TXT_M)
       .text(`For ${co.legalName || 'TruckSetu Logistics Pvt. Ltd.'}`, sigBoxX, y + 48, { width: sigBoxW, align: 'center' });

    // Left: payment note
    doc.font('R').fontSize(8).fillColor(TXT_M)
       .text('Payment Terms:', ML, y + 4);
    doc.font('R').fontSize(7.5).fillColor(TXT_L)
       .text(`Due within 30 days of invoice date.\nPlease transfer to: ${co.email || 'billing@trucksetu.com'}`, ML, y + 16, { width: sigBoxX - ML - 10 });

    y += 72;

    /* ── 9. Footer ── */
    const footY = PH - 52;
    doc.rect(0, footY, PW, 52).fill(BLUE);
    doc.font('B').fontSize(9).fillColor(WHITE)
       .text("Thank you for choosing TruckSetu \u2014 India\u2019s Trusted Logistics Platform",
             0, footY + 10, { align: 'center', width: PW });
    doc.font('R').fontSize(8).fillColor('#93C5FD')
       .text(`${co.email || ''}  |  ${co.phone || ''}  |  ${co.website || ''}`,
             0, footY + 24, { align: 'center', width: PW });
    doc.font('R').fontSize(7).fillColor('#60A5FA')
       .text(`${invNo}  \u00B7  Generated ${invDate}  \u00B7  Computer-generated document. Not valid without authorised signature.`,
             0, footY + 38, { align: 'center', width: PW });
  });

// ── CO2 Report PDF ────────────────────────────────────────────────────────────
const generateCO2ReportPDF = async (td) =>
  collectPdfBuffer((doc) => {
    const GD  = '#14532D'; const GM  = '#16A34A';
    const GL  = '#DCFCE7'; const GXL = '#F0FDF4';

    doc.rect(0, 0, PW, 5).fill(GD);

    doc.font('B').fontSize(16).fillColor(GD).text('TruckSetu Logistics', ML, 18, { lineBreak: false });
    doc.font('R').fontSize(8).fillColor(TXT_L).text('CO\u2082 EMISSIONS REPORT', ML, 38, { characterSpacing: 1 });

    doc.font('B').fontSize(22).fillColor(TXT_D).text('ECO REPORT', 0, 16, { align: 'right', width: PW - ML, lineBreak: false });
    doc.font('R').fontSize(9).fillColor(TXT_M)
       .text(`Date: ${fmtDate(new Date())}`, 0, 44, { align: 'right', width: PW - ML, lineBreak: false });

    hrule(doc, 70);

    // Meta grid
    let y = 84;
    const cw2 = CW / 2;
    [
      { label: 'Truck',  value: td.truckRegistration },
      { label: 'Dealer', value: td.dealerName },
    ].forEach((c, i) => {
      const cx = ML + i * cw2;
      doc.roundedRect(cx, y, cw2 - 10, 44, 5).strokeColor(BORDER).lineWidth(0.6).stroke();
      doc.font('R').fontSize(7.5).fillColor(TXT_L).text(c.label.toUpperCase(), cx + 10, y + 9, { characterSpacing: 0.7 });
      doc.font('B').fontSize(10).fillColor(TXT_D).text(c.value || 'N/A', cx + 10, y + 22, { width: cw2 - 22 });
    });
    y += 54;

    [
      { label: 'Trip ID',   value: td.tripId },
      { label: 'Warehouse', value: td.warehouseName },
    ].forEach((item, i) => {
      const cx = ML + i * cw2;
      doc.font('R').fontSize(7.5).fillColor(TXT_L).text(item.label.toUpperCase(), cx, y, { characterSpacing: 0.7 });
      doc.font('R').fontSize(8).fillColor(TXT_M).text(item.value || 'N/A', cx, y + 12, { width: cw2 - 10 });
    });
    y += 34;

    // Stats
    hrule(doc, y);
    y += 10;
    doc.font('B').fontSize(11).fillColor(TXT_D).text('Emissions Summary', ML, y);
    y += 16;

    const sw = CW / 3;
    [
      { label: 'Distance',    value: `${td.distanceKm} km` },
      { label: 'Load',        value: `${td.weightTons} t`  },
      { label: 'Utilization', value: `${td.utilizationPct}%` },
    ].forEach((s, i) => {
      const cx = ML + i * sw;
      fill(doc, cx, y, sw - 10, 50, 6, GL);
      doc.font('B').fontSize(16).fillColor(GM).text(s.value, cx + 6, y + 8, { width: sw - 22, align: 'center' });
      doc.font('R').fontSize(7.5).fillColor(TXT_M).text(s.label.toUpperCase(), cx + 6, y + 32, { width: sw - 22, align: 'center', characterSpacing: 0.7 });
    });
    y += 60;

    // CO2 table
    fill(doc, ML, y, CW, 21, 4, GD);
    doc.font('B').fontSize(8).fillColor(WHITE);
    doc.text('METRIC', ML + 8, y + 6, { width: 160, lineBreak: false });
    doc.text('VALUE',  ML + 180, y + 6, { width: 100, lineBreak: false });
    doc.text('NOTE',   ML + 300, y + 6, { width: CW - 308, lineBreak: false });
    y += 27;

    [
      { label: 'Trip CO\u2082',     value: `${td.tripCo2Kg} kg`,     note: 'Actual emissions for this trip', hl: false },
      { label: 'Baseline CO\u2082', value: `${td.baselineCo2Kg} kg`, note: 'Industry standard benchmark',   hl: false },
      { label: 'CO\u2082 Saved',    value: `${td.co2SavedKg} kg`,    note: `${td.savedPct}% reduction achieved`, hl: true  },
    ].forEach((row, idx) => {
      fill(doc, ML, y, CW, 36, 3, row.hl ? GL : idx % 2 === 0 ? WHITE : GXL);
      doc.font('B').fontSize(9).fillColor(row.hl ? GD : TXT_D).text(row.label, ML + 8, y + 12, { width: 160, lineBreak: false });
      doc.font('B').fontSize(10).fillColor(row.hl ? GM : TXT_D).text(row.value, ML + 180, y + 12, { width: 100, lineBreak: false });
      doc.font('R').fontSize(8).fillColor(TXT_M).text(row.note, ML + 300, y + 12, { width: CW - 308 });
      y += 42;
    });

    // Equivalents
    y += 8;
    hrule(doc, y);
    y += 10;
    doc.font('B').fontSize(11).fillColor(TXT_D).text('Environmental Equivalents', ML, y);
    y += 16;

    const ew = CW / 3;
    [
      { label: 'Trees Equivalent', value: String(td.equivalents.treesEquivalent) },
      { label: 'Car km Avoided',   value: String(td.equivalents.carKmAvoided)    },
      { label: 'Flights Avoided',  value: String(td.equivalents.flightsAvoided)  },
    ].forEach((e, i) => {
      const cx = ML + i * ew;
      fill(doc, cx, y, ew - 10, 56, 6, GL);
      doc.font('B').fontSize(18).fillColor(GM).text(e.value, cx + 6, y + 8, { width: ew - 22, align: 'center' });
      doc.font('R').fontSize(7.5).fillColor(TXT_M).text(e.label, cx + 6, y + 34, { width: ew - 22, align: 'center' });
    });
    y += 66;

    // Shipments
    hrule(doc, y);
    y += 10;
    doc.font('B').fontSize(11).fillColor(TXT_D).text('Shipment Breakdown', ML, y);
    y += 16;

    (td.shipments || []).forEach((s, idx) => {
      fill(doc, ML, y, CW, 32, 3, idx % 2 === 0 ? WHITE : GXL);
      doc.font('B').fontSize(9).fillColor(TXT_D).text(`${idx + 1}. ${s.title}`, ML + 8, y + 5, { width: CW * 0.55 - 8 });
      doc.font('R').fontSize(8).fillColor(TXT_M).text(`${s.originCity} \u2192 ${s.destCity}`, ML + 8, y + 19, { width: CW * 0.55 - 8 });
      doc.font('B').fontSize(9).fillColor(GM).text(`${s.weightKg} kg`, ML + CW * 0.55, y + 11, { width: CW * 0.45 - 8, align: 'right', lineBreak: false });
      y += 38;
    });

    // Footer
    const footY = PH - 52;
    doc.rect(0, footY, PW, 52).fill(GD);
    doc.font('B').fontSize(9).fillColor(WHITE)
       .text('TruckSetu \u2014 Committed to Greener Logistics Across India', 0, footY + 12, { align: 'center', width: PW });
    doc.font('R').fontSize(7.5).fillColor('#86EFAC')
       .text(`Generated ${fmtDate(new Date())}  \u00B7  Computer-generated document.`, 0, footY + 30, { align: 'center', width: PW });
  });

module.exports = { generateCO2ReportPDF, generateInvoicePDF };
