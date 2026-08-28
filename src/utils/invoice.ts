import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadInvoicePDF = async (element: HTMLElement | null, orderId: string) => {
  if (!element) return;
  
  const originalStyle = element.getAttribute('style') || '';
  
  try {
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.zIndex = '-9999';
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      width: 794,
      windowWidth: 794,
      windowHeight: element.scrollHeight
    });
    
    element.setAttribute('style', originalStyle);

    const imgData = canvas.toDataURL('image/png');
    // A4 aspect ratio
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add subsequent pages if the content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // This moves the image up
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`Bhakt_Bhakti_Invoice_${String(orderId).slice(0, 8).toUpperCase()}.pdf`);
  } catch (error) {
    element.setAttribute('style', originalStyle);
    console.error('Failed to generate PDF:', error);
    alert('Failed to download invoice. Please try again.');
  }
};
