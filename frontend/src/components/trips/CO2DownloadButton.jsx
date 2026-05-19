import { Leaf } from 'lucide-react';
import { useState } from 'react';

import * as tripApi from '../../api/trip.api';
import { useToastStore } from '../../store/toastStore';
import { saveBlob } from '../../utils/downloads';

export default function CO2DownloadButton({
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
      const pdfBlob = await tripApi.downloadCO2Report(tripId);
      saveBlob(pdfBlob, `co2-report-${tripId.slice(0, 8)}.pdf`);
      toast.success('CO2 Report downloaded', 'Your sustainability report is ready.');
    } catch (error) {
      toast.error('Download failed', error.message || 'Please try again.');
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
      <Leaf className={compact ? 'h-3.5 w-3.5 text-emerald-600' : 'h-4 w-4 text-emerald-600'} />
      {isDownloading ? 'Preparing...' : 'Download CO2 Report'}
    </button>
  );
}
