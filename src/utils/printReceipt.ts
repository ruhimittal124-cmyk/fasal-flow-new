import { 
  TransactionRecord, 
  TransportBooking, 
  PoolSettlementBatch, 
  FarmerPoolParticipant,
  AggregationLotPassport,
  DigitalPoolContract,
  WdraWarehouseReceipt
} from '../types';

/**
 * Cleanly prints a formatted HTML document using an isolated iframe
 * to avoid iframe sandbox/cross-origin or UI styling interference.
 */
function printHtmlDocument(htmlContent: string, documentTitle: string) {
  try {
    // 1. Try to open a popup window for clean printing
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.document.title = documentTitle;
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 250);
      };
      return;
    }
  } catch (e) {
    console.warn('Popup window print blocked, falling back to hidden iframe:', e);
  }

  // 2. Fallback to hidden iframe
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.id = 'fasalflow-print-frame';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 350);
    }
  } catch (err) {
    console.error('Failed to print document:', err);
    window.print();
  }
}

/**
 * Formats and triggers printing for a Commodity Trade Deal Tax Invoice & Escrow Receipt
 */
export function printTradeReceipt(txn: TransactionRecord) {
  const isCompleted = txn.status === 'completed';
  const issueDate = new Date(txn.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const issueTime = new Date(txn.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const settlementDate = txn.completedAt 
    ? new Date(txn.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Pending Inspection / Staged Escrow';

  const sellerFee = Math.round(txn.amount * 0.01);
  const buyerFee = Math.round(txn.amount * 0.01);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${txn.invoiceNumber}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #fff;
      color: #0f172a;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-title span {
      color: #059669;
    }
    .sub-brand {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 500;
    }
    .gov-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 8px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }
    .invoice-number {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #059669;
      margin-top: 2px;
    }
    .meta-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .party-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
    }
    .party-label {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .party-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .party-detail {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }
    .status-completed {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .status-escrow {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }
    .table-container {
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 10px 14px;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      font-size: 12px;
    }
    .text-right {
      text-align: right;
    }
    .fee-row {
      background: #fafafa;
      color: #64748b;
      font-size: 11px;
    }
    .total-row {
      background: #ecfdf5;
      color: #064e3b;
      font-weight: 800;
      font-size: 13px;
    }
    .escrow-section {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      align-items: center;
    }
    .escrow-text {
      font-size: 11px;
      color: #475569;
    }
    .escrow-qr-sim {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 8px;
      border-radius: 6px;
      text-align: center;
    }
    .qr-title {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .qr-box {
      font-family: monospace;
      font-size: 10px;
      background: #f1f5f9;
      padding: 4px;
      margin: 4px 0;
      word-break: break-all;
      border-radius: 4px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 10px;
      color: #94a3b8;
    }
    .signature-box {
      text-align: center;
      width: 180px;
    }
    .signature-line {
      border-bottom: 1px solid #0f172a;
      margin-bottom: 6px;
      height: 35px;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .invoice-card {
        border: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

<div class="invoice-card" id="printable-tax-invoice">
  
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-title">Fasal<span>Flow</span></div>
      <div class="sub-brand">Direct Farmgate Agri-Trade & Escrow Clearing Network</div>
      <div class="gov-badge">e-NAM & APMC Clearing Compliant</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">Tax Invoice & Passbook</div>
      <div class="invoice-number">${txn.invoiceNumber}</div>
      <div class="meta-date">Date: <strong>${issueDate}</strong>, ${issueTime}</div>
      <div class="meta-date">Txn Ref: <strong>${txn.id}</strong></div>
    </div>
  </div>

  <!-- Parties Grid -->
  <div class="grid-2">
    <div class="party-box">
      <div class="party-label">
        <span>Seller / Consignor (Farmer / FPO)</span>
        <span style="color:#059669; font-weight: bold;">Aadhaar KYC Verified</span>
      </div>
      <div class="party-name">${txn.sellerName}</div>
      <div class="party-detail">District / APMC: <strong>${txn.pickupDistrict || 'Osmanabad'}, Maharashtra</strong></div>
      <div class="party-detail">Payment Method: <strong>${txn.paymentMethod}</strong></div>
      <div class="party-detail">Settlement Reference: <strong>${txn.paymentRef}</strong></div>
    </div>

    <div class="party-box">
      <div class="party-label">
        <span>Buyer / Consignee (Trader / Mill)</span>
        <span class="status-badge ${isCompleted ? 'status-completed' : 'status-escrow'}">
          ${isCompleted ? 'Settled & Released' : 'Escrow Locked'}
        </span>
      </div>
      <div class="party-name">${txn.buyerName}</div>
      <div class="party-detail">Destination: <strong>${txn.dropDistrict || 'Latur'}, Maharashtra</strong></div>
      <div class="party-detail">Clearing Status: <strong>${isCompleted ? '100% Paid to Farmer' : '100% Escrow Protected'}</strong></div>
      <div class="party-detail">Settlement Date: <strong>${settlementDate}</strong></div>
    </div>
  </div>

  <!-- Items Table -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Item Description & Quality</th>
          <th class="text-right">Quantity (Qtl)</th>
          <th class="text-right">Rate / Quintal</th>
          <th class="text-right">Total Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${txn.crop || 'Agricultural Harvest Batch'}</strong> (Certified Grade A)
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              Direct farmgate clearing from ${txn.pickupDistrict || 'Osmanabad'} to ${txn.dropDistrict || 'Latur'}
            </div>
          </td>
          <td class="text-right"><strong>${txn.quantityQuintals || '-'}</strong></td>
          <td class="text-right">₹${txn.pricePerQuintal?.toLocaleString('en-IN') || '-'}</td>
          <td class="text-right"><strong>₹${txn.amount.toLocaleString('en-IN')}</strong></td>
        </tr>

        <tr class="fee-row">
          <td colspan="3">
            FasalFlow Platform Service Fee (2% Flat: ₹${sellerFee} Seller + ₹${buyerFee} Buyer)
          </td>
          <td class="text-right">₹${txn.platformFee.toLocaleString('en-IN')}</td>
        </tr>

        <tr class="total-row">
          <td colspan="3">
            Net Farmer Bank Payout (Direct Bank Transfer via Escrow)
          </td>
          <td class="text-right">
            ₹${txn.farmerPayout.toLocaleString('en-IN')}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Escrow Verification -->
  <div class="escrow-section">
    <div class="escrow-text">
      <strong>e-NAM Digital Clearing Assurance:</strong><br>
      This digital invoice certifies that the transaction was executed through FasalFlow's 100% Escrow Protection. Buyer funds are held in zero-risk escrow and disbursed immediately upon physical moisture and purity confirmation at the unloading dock. No intermediate middlemen commission deducted.
    </div>
    <div class="escrow-qr-sim">
      <div class="qr-title">Digital Verification</div>
      <div class="qr-box">${txn.paymentRef}</div>
      <div style="font-size: 8px; color: #059669; font-weight: bold;">AUTHENTIC & VERIFIED</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      <div>FasalFlow Technologies India Pvt Ltd • GSTIN: 27AABCF1234F1Z5</div>
      <div>Support & Mandi Grievance: +91 98221 00000 • support@fasalflow.in</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div style="font-weight: 700; color: #334155;">Authorized Signatory</div>
      <div style="font-size: 9px;">e-NAM Clearing Officer</div>
    </div>
  </div>

</div>

</body>
</html>
  `;

  printHtmlDocument(html, `Invoice_${txn.invoiceNumber}`);
}

/**
 * Formats and triggers printing for an Agricultural Logistics & Transport Waybill
 */
export function printTransportReceipt(booking: TransportBooking) {
  const issueDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transport Waybill - ${booking.id}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #fff;
      color: #0f172a;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .waybill-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
    }
    .brand-title span {
      color: #7c3aed;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
    }
    .label {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .value {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

<div class="waybill-card">
  <div class="header">
    <div>
      <div class="brand-title">Fasal<span>Flow</span> Logistics</div>
      <div style="font-size: 11px; color: #64748b;">Rural Agricultural Freight & e-Waybill</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 800; font-size: 16px; text-transform: uppercase;">Consignment Waybill</div>
      <div style="color: #7c3aed; font-family: monospace; font-weight: bold;">${booking.id}</div>
      <div style="font-size: 11px; color: #64748b;">Date: ${issueDate}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="box">
      <div class="label">Pickup Location (Farm Gate)</div>
      <div class="value">${booking.pickupLocation}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Corridor Distance: <strong>${booking.distanceKm} km</strong></div>
    </div>
    <div class="box">
      <div class="label">Delivery Drop Location</div>
      <div class="value">${booking.dropLocation}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Driver Contact: <strong>${booking.driverPhone}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Commodity</th>
        <th>Quantity (Quintals)</th>
        <th>Transporter Name</th>
        <th style="text-align: right;">Total Haulage Fare</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${booking.crop}</strong></td>
        <td>${booking.quantityQuintals} Qtl</td>
        <td>${booking.transporterName}</td>
        <td style="text-align: right; font-weight: bold; color: #7c3aed;">₹${booking.totalFare.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="box" style="margin-bottom: 24px;">
    <div class="label">Transit Terms & Safety</div>
    <p style="font-size: 11px; color: #475569;">
      Goods covered under rural transit clearance. Driver is authorized to transport the agricultural lot from the registered farmgate to designated buyer warehouse.
    </p>
  </div>

  <div class="footer">
    <div>FasalFlow Regional Transport Clearing • Toll-Free Help: 1800-FASAL-LOG</div>
    <div style="text-align: center;">
      <div style="border-bottom: 1px solid #000; height: 30px; width: 140px; margin-bottom: 4px;"></div>
      <div>Driver / Receiver Signature</div>
    </div>
  </div>
</div>

</body>
</html>
  `;

  printHtmlDocument(html, `Waybill_${booking.id}`);
}

/**
 * Formats and triggers printing for a FPO/Farmer Crop Pool Settlement Slip with exact mathematical terms & deduction evidence
 */
export function printPoolSettlementSlip(batch: PoolSettlementBatch, participant: FarmerPoolParticipant) {
  const settlementDate = batch.settlementDate
    ? new Date(batch.settlementDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Pre-Lock Simulation / Escrow Pending';

  const grossCropValue = participant.acceptedKg * batch.finalPoolUnitPrice * participant.gradeFactor;
  const totalDeductions = participant.deductions.reduce((acc, d) => acc + d.rupeeAmount, 0);
  const totalIncentives = participant.incentives.reduce((acc, i) => acc + i.rupeeAmount, 0);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Settlement Slip - ${batch.id} - ${participant.farmerName}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #fff;
      color: #0f172a;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .settlement-card {
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-title span {
      color: #059669;
    }
    .formula-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #059669;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #1e293b;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 8px;
    }
    .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .val {
      font-weight: 600;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
      font-weight: 700;
    }
    .evidence-card {
      background: #f0fdf4;
      border: 1px dashed #16a34a;
      border-radius: 8px;
      padding: 14px;
      margin-top: 8px;
      margin-bottom: 20px;
      font-size: 11px;
    }
    .evidence-title {
      font-weight: 800;
      color: #166534;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .total-box {
      background: #ecfdf5;
      border: 2px solid #059669;
      padding: 18px;
      border-radius: 10px;
      margin-top: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-val {
      font-size: 24px;
      font-weight: 900;
      color: #065f46;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

<div class="settlement-card">
  <div class="header">
    <div>
      <div class="brand-title">Fasal<span>Flow</span></div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Transparent Pooled Crop Settlement & Assaying Engine</div>
      <div style="display: inline-block; margin-top: 6px; padding: 3px 8px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 4px; font-weight: 700; font-size: 11px;">
        ✓ Zero Hidden Deductions Mandate
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 18px; font-weight: 800; color: #0f172a;">SETTLEMENT SLIP</div>
      <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Batch: <strong>${batch.id}</strong></div>
      <div style="color: #64748b; font-size: 11px;">Contract: <strong>${batch.contractId}</strong></div>
      <div style="color: #64748b; font-size: 11px;">Date: <strong>${settlementDate}</strong></div>
    </div>
  </div>

  <div class="formula-banner">
    <strong>Mandated Formula:</strong> payout_i = (accepted kg_i × final pool unit price × grade factor_i) − allocated logistics_i − allocated storage_i − contractually agreed deductions_i + eligible incentives/adjustments
  </div>

  <div class="grid-2">
    <div class="box">
      <div class="label">Farmer (Participant i) Details</div>
      <div class="val" style="font-size: 14px; font-weight: 800;">${participant.farmerName}</div>
      <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Phone: ${participant.phone} • District: ${participant.district}</div>
      <div style="color: #059669; font-size: 11px; font-weight: 600; margin-top: 4px;">Payout Target: ${participant.upiOrBank}</div>
      ${participant.payoutRef ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">Bank UTR / Ref: <strong>${participant.payoutRef}</strong></div>` : ''}
    </div>
    <div class="box">
      <div class="label">Pool Aggregation & Buyer Details</div>
      <div class="val" style="font-size: 14px; font-weight: 800;">${batch.crop} (${batch.variety})</div>
      <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Aggregator / FPO: ${batch.fpoName}</div>
      <div style="color: #64748b; font-size: 11px;">Offtaker / Buyer: ${batch.buyerName}</div>
      <div style="color: #475569; font-size: 11px; font-weight: 600; margin-top: 4px;">Total Pool Volume: ${batch.totalAcceptedKg.toLocaleString('en-IN')} kg</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Settlement Term (Formula Variable)</th>
        <th>Input Values & Basis</th>
        <th style="text-align: right;">Calculated Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>Accepted Quantity × Pool Price</strong><br>
          <span style="font-size: 10px; color: #64748b;">(accepted kg_i × final pool unit price)</span>
        </td>
        <td>${participant.acceptedKg.toLocaleString('en-IN')} kg @ ₹${batch.finalPoolUnitPrice.toFixed(2)} / kg</td>
        <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${(participant.acceptedKg * batch.finalPoolUnitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>
          <strong>Grade Factor Multiplier</strong><br>
          <span style="font-size: 10px; color: #64748b;">(grade factor_i: ${participant.gradeFactorReason})</span>
        </td>
        <td>Factor: <strong>${participant.gradeFactor.toFixed(2)}×</strong></td>
        <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${grossCropValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Gross)</td>
      </tr>
      <tr>
        <td>
          <strong>Allocated Freight & Logistics</strong><br>
          <span style="font-size: 10px; color: #64748b;">(allocated logistics_i)</span>
        </td>
        <td>${participant.acceptedKg.toLocaleString('en-IN')} kg @ ₹${batch.unitLogisticsCost.toFixed(2)}/kg</td>
        <td style="text-align: right; font-weight: 700; color: #dc2626;">- ₹${participant.allocatedLogistics.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>
          <strong>Allocated Storage & Warehouse</strong><br>
          <span style="font-size: 10px; color: #64748b;">(allocated storage_i)</span>
        </td>
        <td>${participant.acceptedKg.toLocaleString('en-IN')} kg @ ₹${batch.unitStorageCost.toFixed(2)}/kg</td>
        <td style="text-align: right; font-weight: 700; color: #dc2626;">- ₹${participant.allocatedStorage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr style="background: #f8fafc; font-weight: bold;">
        <td>
          <strong>Estimated Net Before Adjustments</strong><br>
          <span style="font-size: 10px; color: #64748b;">Formula Subtotal: kg × (Price - Freight - Storage)</span>
        </td>
        <td>${participant.acceptedKg} kg × ₹${(batch.finalPoolUnitPrice * participant.gradeFactor - batch.unitLogisticsCost - batch.unitStorageCost).toFixed(2)}</td>
        <td style="text-align: right; font-weight: 800; color: #059669;">₹${participant.preAdjustmentNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      ${participant.deductions.map(d => `
        <tr>
          <td>
            <strong style="color: #dc2626;">Contractually Agreed Deduction: ${d.title}</strong><br>
            <span style="font-size: 10px; color: #64748b;">Report #${d.evidence.reportId} • ${d.percentage ? `${d.percentage}% agreed rate` : ''}</span>
          </td>
          <td>${d.evidence.testedMetric}: ${d.evidence.measuredValue}</td>
          <td style="text-align: right; font-weight: 700; color: #dc2626;">- ₹${d.rupeeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
      ${participant.incentives.map(inc => `
        <tr>
          <td>
            <strong style="color: #16a34a;">Eligible Incentive: ${inc.title}</strong><br>
            <span style="font-size: 10px; color: #64748b;">${inc.reason}</span>
          </td>
          <td>Quality & Aggregation Bonus</td>
          <td style="text-align: right; font-weight: 700; color: #16a34a;">+ ₹${inc.rupeeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${participant.deductions.length > 0 ? `
    <div class="evidence-card">
      <div class="evidence-title">
        <span>🔬 VERIFIED DEDUCTION EVIDENCE & DIGITAL ASSAY REPORT</span>
        <span>Report: ${participant.deductions[0].evidence.reportId}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
        <div><strong>Lab & Inspector:</strong> ${participant.deductions[0].evidence.labName} (${participant.deductions[0].evidence.inspectorName})</div>
        <div><strong>Test Date & Timestamp:</strong> ${participant.deductions[0].evidence.testDate}</div>
        <div><strong>Measured Result:</strong> ${participant.deductions[0].evidence.measuredValue} (Baseline: ${participant.deductions[0].evidence.agreedBaseline})</div>
        <div><strong>Assaying Method:</strong> ${participant.deductions[0].evidence.opticalScore || 'Digital NIR Moisture Analyzer'}</div>
      </div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #86efac; color: #14532d;">
        <strong>Contractual Justification:</strong> ${participant.deductions[0].evidence.contractClause}
      </div>
    </div>
  ` : ''}

  <div class="total-box">
    <div>
      <div style="font-size: 12px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">Final Net Payout to Farmer i</div>
      <div style="font-size: 11px; color: #047857; margin-top: 2px;">Direct Escrow Bank Transfer • 100% Zero Unsolicited Deductions</div>
    </div>
    <div class="total-val">₹${participant.finalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
  </div>

  <div class="footer">
    <div>FasalFlow Fair Agri Trade Network • Verified by APMC e-NAM Standard</div>
    <div>Digital Escrow Authenticated: <strong>SHA-256 Verified</strong></div>
  </div>
</div>

</body>
</html>
  `;

  printHtmlDocument(html, `Settlement_${batch.id}_${participant.farmerId}`);
}

/**
 * Print individual QR-Coded Lot Passport (Stage 1)
 */
export function printLotPassport(lot: AggregationLotPassport, fpoName?: string) {
  const qrSvg = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(lot.qrCodeData)}&bgcolor=ffffff&color=064e3b`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lot Passport - ${lot.lotId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #fff; color: #0f172a; font-size: 12px; line-height: 1.4; }
    .passport-card { max-width: 680px; margin: 0 auto; border: 2px solid #059669; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; }
    .badge { background: #ecfdf5; color: #047857; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-size: 10px; border: 1px solid #a7f3d0; text-transform: uppercase; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .section-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
    .data-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #f1f5f9; }
    .data-label { color: #64748b; font-weight: 500; }
    .data-val { font-weight: 700; color: #0f172a; }
    .qr-block { display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 16px; }
    .lab-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-top: 14px; font-size: 11px; }
    .consent-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; margin-top: 14px; font-size: 11px; color: #14532d; }
  </style>
</head>
<body>
  <div class="passport-card">
    <div class="header">
      <div>
        <div style="font-size: 18px; font-weight: 900; color: #065f46;">Fasal<span style="color:#059669;">Flow</span> Digital Lot Passport</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">FPO Verified Farmer Produce Identity & Traceability Document</div>
        <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 4px;">FPO: ${fpoName || 'Sahyadri Krishi Vikas Producer Co.'}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">QR Verified Lot</span>
        <div style="font-family: monospace; font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 6px;">${lot.lotId}</div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="section-title">Farmer & Origin Details</div>
        <div class="data-row"><span class="data-label">Farmer Name:</span><span class="data-val">${lot.farmerName}</span></div>
        <div class="data-row"><span class="data-label">Contact:</span><span class="data-val">${lot.farmerPhone}</span></div>
        <div class="data-row"><span class="data-label">Village & District:</span><span class="data-val">${lot.village}, ${lot.district}</span></div>
        <div class="data-row"><span class="data-label">GPS Geotag:</span><span class="data-val" style="font-family: monospace; font-size: 10px;">${lot.gpsLocation.lat.toFixed(4)}° N, ${lot.gpsLocation.lng.toFixed(4)}° E</span></div>
      </div>

      <div>
        <div class="section-title">Commodity & Harvest Parameters</div>
        <div class="data-row"><span class="data-label">Crop & Variety:</span><span class="data-val">${lot.crop} (${lot.variety})</span></div>
        <div class="data-row"><span class="data-label">Net Harvest Quantity:</span><span class="data-val" style="color: #047857; font-size: 13px;">${lot.quantityQuintals} Quintals (${lot.quantityKg.toLocaleString()} kg)</span></div>
        <div class="data-row"><span class="data-label">Harvest Date:</span><span class="data-val">${lot.harvestDate}</span></div>
        <div class="data-row"><span class="data-label">Declared Grade & Moisture:</span><span class="data-val">${lot.declaredGrade} • ${lot.declaredMoisture}% Moisture</span></div>
      </div>
    </div>

    ${lot.testReportAttached ? `
      <div class="lab-box">
        <div style="font-weight: 800; color: #1e40af; margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>🔬 ATTACHED ACCREDITED TEST REPORT (${lot.testReportAttached.accreditationType})</span>
          <span>Cert #${lot.testReportAttached.reportNo}</span>
        </div>
        <div><strong>Laboratory:</strong> ${lot.testReportAttached.labName} (Dated ${lot.testReportAttached.testDate})</div>
        <div style="margin-top: 6px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          ${lot.testReportAttached.parameters.map(p => `
            <div style="background: #fff; padding: 4px 6px; border-radius: 4px; border: 1px solid #dbeafe;">
              <span style="color:#64748b;">${p.name}:</span> <strong>${p.value}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="qr-block">
      <img src="${qrSvg}" alt="Lot QR" width="100" height="100" style="border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; padding: 4px;" />
      <div>
        <div style="font-weight: 800; font-size: 12px; color: #0f172a;">Collection & Dispatch Verification QR Code</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Field agents scan this code during farmgate weighment to confirm chain of custody and transfer into pool lot manifest.</div>
        <div style="font-family: monospace; font-size: 9px; color: #047857; margin-top: 6px; word-break: break-all;">${lot.qrCodeData}</div>
      </div>
    </div>

    <div class="consent-box">
      <strong>Farmer Consent & Pooling Agreement:</strong> Farmer ${lot.farmerName} has explicitly consented to pool this lot with FPO standards. Farmer retains ownership entitlement and net settlement rights until full buyer escrow clearance.
    </div>
  </div>
</body>
</html>
  `;

  printHtmlDocument(html, `Lot_Passport_${lot.lotId}`);
}

/**
 * Print Digital Aggregation Contract (Stage 5)
 */
export function printDigitalContract(contract: DigitalPoolContract) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Digital Aggregation Contract - ${contract.contractNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #fff; color: #0f172a; font-size: 11px; line-height: 1.5; }
    .contract-page { max-width: 720px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 8px; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 18px; font-weight: 900; color: #065f46; }
    .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
    .clause-title { font-weight: 800; font-size: 12px; color: #0f172a; margin-top: 14px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; font-size: 11px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: 800; color: #334155; }
    .formula-banner { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 6px; font-family: monospace; font-weight: 700; color: #065f46; margin: 10px 0; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center; }
  </style>
</head>
<body>
  <div class="contract-page">
    <div class="header">
      <div class="title">LEGAL DIGITAL CROP AGGREGATION & POOL SALE CONTRACT</div>
      <div class="subtitle">Compliant with e-NAM Trade Framework, APMC Act & Farmer Producer Organization Guidelines</div>
      <div style="margin-top: 6px; font-family: monospace; font-weight: 800; color: #059669;">Contract Ref: ${contract.contractNumber}</div>
    </div>

    <div class="parties-grid">
      <div>
        <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Party A: Aggregating FPO</div>
        <div style="font-weight: 800; font-size: 13px; color: #065f46; margin-top: 2px;">${contract.fpoName}</div>
        <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Acting on behalf of participating verified smallholder pool members.</div>
      </div>
      <div>
        <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Party B: Verified Buyer / Offtaker</div>
        <div style="font-weight: 800; font-size: 13px; color: #1e40af; margin-top: 2px;">${contract.buyerName}</div>
        <div style="color: #64748b; font-size: 10px; margin-top: 2px;">100% Escrow Collateral Deposited with RBI Authorized Trustee.</div>
      </div>
    </div>

    <div class="clause-title">1. Pricing & Settlement Formula</div>
    <div>The total locked pool price is <strong>₹${contract.lockedUnitPricePerKg.toFixed(2)} / kg</strong> (Total Contract Value: <strong>₹${contract.totalContractValue.toLocaleString('en-IN')}</strong> for ${contract.agreedTotalKg.toLocaleString('en-IN')} kg). Member payouts shall strictly follow the transparent statutory settlement formula:</div>
    <div class="formula-banner">${contract.pricingFormula}</div>

    <div class="clause-title">2. Grade Tolerance & Quality Assaying (Clause 4.2)</div>
    <div>${contract.gradeToleranceClause} All sampling shall be conducted strictly as per <strong>${contract.samplingStandard}</strong> by accredited laboratories.</div>

    <div class="clause-title">3. Contractual Deduction & Penalty Schedule</div>
    <table>
      <thead>
        <tr>
          <th>Defect / Parameter Condition</th>
          <th>Agreed Deduction %</th>
          <th>Estimated Maximum Impact</th>
        </tr>
      </thead>
      <tbody>
        ${contract.deductionSchedule.map(d => `
          <tr>
            <td>${d.condition}</td>
            <td style="font-weight: 700; color: #dc2626;">${d.penaltyPercent}%</td>
            <td>₹${d.rupeeImpactEstimate.toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="clause-title">4. Weighment Authority & Source of Truth</div>
    <div>Weighment shall be governed by <strong>${contract.weighmentSource}</strong>. Tare and gross weight slips generated at dispatch shall serve as the primary volume basis.</div>

    <div class="clause-title">5. Payment Milestones & Escrow Release</div>
    <table>
      <thead>
        <tr>
          <th>Milestone</th>
          <th>Weightage</th>
          <th>Escrow Status</th>
        </tr>
      </thead>
      <tbody>
        ${contract.paymentMilestones.map(m => `
          <tr>
            <td>${m.milestone}</td>
            <td style="font-weight: 700;">${m.percent}%</td>
            <td style="font-weight: 700; color: #059669; text-transform: uppercase;">${m.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="clause-title">6. Dispute Resolution & Arbitration</div>
    <div>${contract.disputeProcess}</div>

    <div style="margin-top: 14px; font-size: 10px; color: #64748b; font-family: monospace;">
      Cryptographic Contract Digest: ${contract.contractHash} • Executed: ${contract.executedAt}
    </div>

    <div class="signatures">
      <div>
        <div style="height: 35px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px;"></div>
        <strong>Authorized Signatory - FPO</strong><br>
        <span style="font-size: 10px; color: #64748b;">${contract.fpoName}</span>
      </div>
      <div>
        <div style="height: 35px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px;"></div>
        <strong>Authorized Signatory - Buyer</strong><br>
        <span style="font-size: 10px; color: #64748b;">${contract.buyerName}</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  printHtmlDocument(html, `Contract_${contract.contractNumber}`);
}

/**
 * Print WDRA e-NWR Storage Certificate (Stage 6)
 */
export function printWarehouseReceipt(receipt: WdraWarehouseReceipt) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WDRA e-NWR Warehouse Receipt - ${receipt.eNwrNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #fff; color: #0f172a; font-size: 11px; line-height: 1.5; }
    .receipt-card { max-width: 700px; margin: 0 auto; border: 2px solid #1e3a8a; padding: 24px; border-radius: 10px; }
    .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px; }
    .badge { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-weight: 800; padding: 4px 10px; border-radius: 4px; font-size: 11px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .collateral-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 8px; text-align: center; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div style="font-size: 16px; font-weight: 900; color: #1e3a8a;">WAREHOUSING DEVELOPMENT AND REGULATORY AUTHORITY (WDRA)</div>
      <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">Electronic Negotiable Warehouse Receipt (e-NWR)</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Issued via Repository: <strong>${receipt.repositoryName} (National E-Repository)</strong> • WDRA Reg: ${receipt.wdraRegistrationNo}</div>
      <div style="margin-top: 6px;"><span class="badge">Official e-NWR #${receipt.eNwrNumber}</span></div>
    </div>

    <div class="grid-2">
      <div>
        <div style="font-weight: 800; font-size: 11px; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Warehouse & Storage Facility</div>
        <div class="row"><span>Facility:</span><strong>${receipt.warehouseName}</strong></div>
        <div class="row"><span>Location:</span><strong>${receipt.storageHubLocation}</strong></div>
        <div class="row"><span>Check-in Timestamp:</span><strong>${receipt.checkInTimestamp}</strong></div>
        <div class="row"><span>Insurance Policy:</span><strong>${receipt.insurancePolicyNo}</strong></div>
      </div>

      <div>
        <div style="font-weight: 800; font-size: 11px; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Commodity Inventory Details</div>
        <div class="row"><span>Grade Assigned:</span><strong>${receipt.commodityGradeAssigned}</strong></div>
        <div class="row"><span>Quantity Stored:</span><strong style="color: #047857;">${receipt.storedQuantityQuintals} Qtl (${receipt.storedQuantityKg.toLocaleString()} kg)</strong></div>
        <div class="row"><span>Storage Validity:</span><strong>Until ${receipt.validUntil}</strong></div>
        <div class="row"><span>Repository Platform:</span><strong>${receipt.repositoryName} Live Portal</strong></div>
      </div>
    </div>

    <div class="collateral-box">
      <div style="font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase;">Pledgeable Bank Collateral Value (e-NWR Financing Ready)</div>
      <div style="font-size: 20px; font-weight: 900; color: #064e3b; margin-top: 4px;">₹${receipt.pledgeableCollateralValue.toLocaleString('en-IN')}</div>
      <div style="font-size: 10px; color: #047857; margin-top: 2px;">Eligible for immediate RBI priority agricultural pledge finance at 7% concessional interest.</div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
      <div style="font-size: 10px; color: #64748b;">
        Authenticated by WDRA Digital Registry.<br>
        Negotiable document transferable under the Warehousing (Development and Regulation) Act, 2007.
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800; color: #0f172a;">${receipt.warehouseManagerSignature}</div>
        <div style="font-size: 10px; color: #64748b;">Certified Warehouse Superintendent</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  printHtmlDocument(html, `eNWR_${receipt.eNwrNumber}`);
}


