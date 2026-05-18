import { Download } from 'lucide-react';
import { useState } from 'react';

import * as tripApi from '../../api/trip.api';
import { useToastStore } from '../../store/toastStore';
import { saveBlob } from '../../utils/downloads';

export default function InvoiceDownloadButton({
  tripId,
  className = 'btn-secondary',
  compact = false,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToastStore();

  if (!tripId) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const invoiceBlob = await tripApi.downloadInvoice(tripId);
      saveBlob(invoiceBlob, `trucksetu-invoice-${tripId.slice(0, 8)}.pdf`);
      toast.success('Invoice downloaded', 'The trip invoice PDF is ready.');
    } catch (error) {
      toast.error('Invoice download failed', error.message || 'Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      className={className}
      disabled={isDownloading}
      onClick={handleDownload}
      type="button"
    >
      <Download className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {isDownloading ? 'Preparing...' : 'Download Invoice'}
    </button>
  );
}
