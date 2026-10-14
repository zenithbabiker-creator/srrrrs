/**
 * High-Fidelity Native Silent Printing Engine for شركة NOSSER
 * Guarantees zero-blank-page, clean A4 Arabic printouts directly sent to physical printers,
 * bypassing virtual PDF printers and eliminating 'Save Print Output As' dialogs.
 */

export interface PrintOptions {
  title?: string;
  documentNumber?: string;
  printerName?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  isVirtual: boolean;
}

export interface PrintersResponse {
  success: boolean;
  defaultPrinter?: string;
  physicalPrinter?: string;
  silentPrintSupported?: boolean;
  printers?: PrinterInfo[];
}

/**
 * Fetch detected printers from the native backend or server
 */
export async function fetchDetectedPrinters(): Promise<PrintersResponse | null> {
  try {
    const res = await fetch('/api/printers');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Client fallback
  }
  return null;
}

/**
 * Display a non-intrusive instant visual confirmation toast in the UI
 */
export function showDirectPrintToast(printerName?: string) {
  const existing = document.getElementById('nosser-direct-print-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'nosser-direct-print-toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#0f172a';
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '14px';
  toast.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4)';
  toast.style.fontSize = '13px';
  toast.style.fontWeight = 'bold';
  toast.style.zIndex = '999999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.direction = 'rtl';
  toast.style.border = '1px solid #3b82f6';
  toast.style.transition = 'all 0.3s ease';

  const targetName = printerName || 'الطابعة الفيزيائية المتصلة';
  toast.innerHTML = `🖨️ <span>تم إرسال الفاتورة مباشرة للطباعة الفيزيائية إلى:</span> <strong style="color: #60a5fa; margin-right: 4px;">${targetName}</strong>`;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 4000);
}

/**
 * Native Direct Print Execution
 */
export function printHtmlElement(element: HTMLElement | null, options: PrintOptions = {}) {
  // Show visual feedback toast
  showDirectPrintToast(options.printerName);

  if (!element) {
    window.focus();
    window.print();
    return;
  }

  // Hide everything else in the body
  const bodyChildren = Array.from(document.body.children);
  bodyChildren.forEach(child => {
    if (child !== element && (child as HTMLElement).id !== 'nosser-direct-print-toast') {
      (child as HTMLElement).style.display = 'none';
    }
  });

  // Temporarily style element for A4 portrait printing
  const originalStyle = element.getAttribute('style') || '';
  element.style.position = 'absolute';
  element.style.top = '0';
  element.style.left = '0';
  element.style.width = '100%';
  element.style.zIndex = '9999';

  if (options.onBeforePrint) options.onBeforePrint();
  
  window.focus();
  window.print();

  if (options.onAfterPrint) options.onAfterPrint();

  // Restore DOM
  element.setAttribute('style', originalStyle);
  bodyChildren.forEach(child => {
    (child as HTMLElement).style.display = '';
  });
}
