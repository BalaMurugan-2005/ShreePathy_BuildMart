// src/utils/invoice.js
import jsPDF from 'jspdf'

export function generateInvoicePDF(order) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // ── Header ──────────────────────
  doc.setFillColor(26, 26, 26)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(245, 197, 24)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('BuildMart', 15, 22)

  doc.setTextColor(200, 200, 200)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Your Trusted Construction Material Platform', 15, 32)
  
  doc.setTextColor(245, 197, 24)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', pageWidth - 15, 22, { align: 'right' })
  
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice #BM-${String(order.id).padStart(6, '0')}`, pageWidth - 15, 32, { align: 'right' })

  // ── Order Info ──────────────────
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER DETAILS', 15, 55)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const info = [
    [`Order ID:`, `#${order.id}`],
    [`Date:`, new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
    [`Customer:`, order.customer_name || 'Customer'],
    [`Email:`, order.customer_email || '-'],
    [`Payment:`, order.payment_method || 'COD'],
    [`Status:`, order.status],
  ]
  info.forEach(([label, value], i) => {
    doc.setTextColor(120, 120, 120)
    doc.text(label, 15, 65 + i * 8)
    doc.setTextColor(30, 30, 30)
    doc.text(value, 65, 65 + i * 8)
  })

  // Delivery address on right
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(10)
  doc.text('DELIVERY ADDRESS', 120, 55)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(50, 50, 50)
  const addrLines = doc.splitTextToSize(order.delivery_address || '-', 70)
  doc.text(addrLines, 120, 65)

  // ── Items Table ─────────────────
  const tableY = 125
  doc.setFillColor(26, 26, 26)
  doc.rect(15, tableY, pageWidth - 30, 10, 'F')
  
  doc.setTextColor(245, 197, 24)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('#', 18, tableY + 7)
  doc.text('Item', 28, tableY + 7)
  doc.text('Qty', 115, tableY + 7)
  doc.text('Unit Price', 135, tableY + 7)
  doc.text('Amount', 168, tableY + 7, { align: 'right' })

  let yPos = tableY + 18
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'normal')
  
  order.items?.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(15, yPos - 6, pageWidth - 30, 10, 'F')
    }
    doc.setFontSize(9)
    doc.text(String(idx + 1), 18, yPos)
    doc.text(item.material_name || 'Product', 28, yPos)
    doc.text(String(item.quantity), 118, yPos)
    doc.text(`Rs.${parseFloat(item.price).toFixed(2)}`, 138, yPos)
    doc.text(`Rs.${(parseFloat(item.price) * item.quantity).toFixed(2)}`, 183 - 15, yPos, { align: 'right' })
    yPos += 12
  })

  // ── Price Summary ───────────────
  yPos += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(15, yPos, pageWidth - 15, yPos)
  yPos += 10

  const subtotal = parseFloat(order.total_price || 0)
  const discount = parseFloat(order.discount_amount || 0)
  const gst = parseFloat(order.gst_amount || 0)
  const final = parseFloat(order.final_price || order.total_price || 0)

  const drawRow = (label, value, bold = false, color = null) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 11 : 9)
    if (color) doc.setTextColor(...color)
    else doc.setTextColor(60, 60, 60)
    doc.text(label, pageWidth - 15 - 60, yPos, { align: 'right' })
    doc.text(value, pageWidth - 15, yPos, { align: 'right' })
    yPos += 9
  }
  
  drawRow('Subtotal:', `Rs.${subtotal.toFixed(2)}`)
  if (discount > 0) {
    drawRow(`Discount (${order.coupon_code || 'Coupon'}):`, `-Rs.${discount.toFixed(2)}`, false, [16, 185, 129])
  }
  drawRow('GST (18%):', `Rs.${gst.toFixed(2)}`, false, [249, 115, 22])
  yPos += 3
  doc.setFillColor(245, 197, 24)
  doc.setDrawColor(245, 197, 24)
  doc.roundedRect(pageWidth - 15 - 80, yPos - 7, 80, 14, 3, 3, 'F')
  doc.setTextColor(26, 26, 26)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', pageWidth - 15 - 5 - 80 + 15, yPos + 2)
  doc.text(`Rs.${final.toFixed(2)}`, pageWidth - 15 - 5, yPos + 2, { align: 'right' })

  // ── Footer ──────────────────────
  yPos += 30
  doc.setTextColor(160, 160, 160)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Thank you for shopping with BuildMart!', pageWidth / 2, yPos, { align: 'center' })
  doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, yPos + 7, { align: 'center' })
  
  doc.save(`BuildMart-Invoice-${order.id}.pdf`)
}
