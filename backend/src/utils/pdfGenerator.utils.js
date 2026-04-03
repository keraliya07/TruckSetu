const PDFDocument = require('pdfkit');

const collectPdfBuffer = async (builder) => {
  const doc = new PDFDocument({ margin: 44, size: 'A4' });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  const bufferPromise = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  builder(doc);
  doc.end();

  return bufferPromise;
};

const writeLabelValue = (doc, label, value) => {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(String(value ?? 'N/A'));
};

const writeSectionTitle = (doc, title) => {
  doc.moveDown(0.6);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text(title);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11).fillColor('#334155');
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const generateInvoicePDF = async (tripData) =>
  collectPdfBuffer((doc) => {
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(22).text('STLOS Invoice');
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(11).fillColor('#475569');
    doc.text(`Generated on ${new Date().toISOString()}`);

    writeSectionTitle(doc, 'Trip Summary');
    writeLabelValue(doc, 'Trip ID', tripData.tripId);
    writeLabelValue(doc, 'Booking ID', tripData.bookingId);
    writeLabelValue(doc, 'Truck', tripData.truckRegistration);
    writeLabelValue(doc, 'Dealer', tripData.dealerName);
    writeLabelValue(doc, 'Warehouse', tripData.warehouseName);
    writeLabelValue(doc, 'Status', tripData.status);

    writeSectionTitle(doc, 'Commercial Breakdown');
    tripData.lineItems.forEach((item, index) => {
      doc.font('Helvetica-Bold').text(`${index + 1}. ${item.label}`);
      doc.font('Helvetica').text(`${item.description}`);
      doc.text(`${item.quantityLabel} • ${formatCurrency(item.amount)}`);
      doc.moveDown(0.2);
    });

    writeLabelValue(doc, 'Subtotal', formatCurrency(tripData.subtotal));
    writeLabelValue(doc, 'Platform fee', formatCurrency(tripData.platformFee));
    writeLabelValue(doc, 'Total', formatCurrency(tripData.total));

    writeSectionTitle(doc, 'Shipment Stops');
    tripData.stops.forEach((stop) => {
      doc
        .font('Helvetica-Bold')
        .text(`${stop.sequence}. ${stop.type} • ${stop.city}`);
      doc.font('Helvetica').text(stop.address || 'Address not provided');
      if (stop.shipmentTitle) {
        doc.text(`Shipment: ${stop.shipmentTitle}`);
      }
      doc.moveDown(0.2);
    });
  });

const generateCO2ReportPDF = async (tripData) =>
  collectPdfBuffer((doc) => {
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(22).text('STLOS CO2 Report');
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(11).fillColor('#475569');
    doc.text(`Generated on ${new Date().toISOString()}`);

    writeSectionTitle(doc, 'Trip Summary');
    writeLabelValue(doc, 'Trip ID', tripData.tripId);
    writeLabelValue(doc, 'Truck', tripData.truckRegistration);
    writeLabelValue(doc, 'Dealer', tripData.dealerName);
    writeLabelValue(doc, 'Warehouse', tripData.warehouseName);
    writeLabelValue(doc, 'Distance', `${tripData.distanceKm} km`);
    writeLabelValue(doc, 'Load', `${tripData.weightTons} tons`);

    writeSectionTitle(doc, 'Emissions Summary');
    writeLabelValue(doc, 'Trip CO2', `${tripData.tripCo2Kg} kg`);
    writeLabelValue(doc, 'Baseline CO2', `${tripData.baselineCo2Kg} kg`);
    writeLabelValue(doc, 'CO2 Saved', `${tripData.co2SavedKg} kg`);
    writeLabelValue(doc, 'Reduction', `${tripData.savedPct}%`);
    writeLabelValue(doc, 'Utilization', `${tripData.utilizationPct}%`);

    writeSectionTitle(doc, 'Environmental Equivalents');
    writeLabelValue(doc, 'Trees equivalent', tripData.equivalents.treesEquivalent);
    writeLabelValue(doc, 'Car km avoided', tripData.equivalents.carKmAvoided);
    writeLabelValue(doc, 'Flights avoided', tripData.equivalents.flightsAvoided);

    writeSectionTitle(doc, 'Shipment Breakdown');
    tripData.shipments.forEach((shipment, index) => {
      doc
        .font('Helvetica-Bold')
        .text(`${index + 1}. ${shipment.title}`);
      doc.font('Helvetica').text(
        `${shipment.originCity} -> ${shipment.destCity} • ${shipment.weightKg} kg`
      );
      doc.moveDown(0.2);
    });
  });

module.exports = {
  generateCO2ReportPDF,
  generateInvoicePDF,
};
