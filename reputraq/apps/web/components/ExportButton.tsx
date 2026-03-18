'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { exportService, ExportData, ExportFormat } from '@/services/exportService';
import styles from './ExportButton.module.scss';

interface ExportButtonProps {
  data: ExportData;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  targetElementRef?: React.RefObject<HTMLElement>;
  dropdownPlacement?: 'auto' | 'up' | 'down';
}

const formatIcons = {
  pdf: FileText,
  csv: FileSpreadsheet,
  xls: File
};

export default function ExportButton({ 
  data, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  showLabel = true,
  targetElementRef,
  dropdownPlacement = 'down'
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    console.log('🚀 ExportButton: Starting export with format:', format, 'data:', data);
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      switch (format) {
        case 'pdf':
          console.log('📄 Exporting to PDF...');
          // Wait for dropdown to close and UI to stabilize
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Try to use target element if available, otherwise fallback to data-only PDF
          if (targetElementRef?.current) {
            console.log('🎯 Using target element for PDF export');
            await exportService.exportToPDF(data, targetElementRef.current);
          } else {
            console.log('📊 Using data-only PDF export');
            await exportService.exportToPDF(data);
          }
          console.log('✅ PDF export completed');
          break;
        case 'csv':
          console.log('📊 Exporting to CSV...');
          const csvBlob = await exportService.exportToCSV(data, { 
            format: 'csv', 
            includeMetadata: true 
          });
          const csvFilename = exportService.generateFilename(data, { format: 'csv' });
          console.log('💾 Downloading CSV file:', csvFilename);
          exportService.downloadFile(csvBlob, csvFilename);
          console.log('✅ CSV export completed');
          break;
        case 'xls':
          console.log('📈 Exporting to XLS...');
          await exportService.exportToXLS(data);
          console.log('✅ XLS export completed');
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Export failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = useMemo(
    () => exportService.getExportOptions(data.metadata?.section || 'data'),
    [data.metadata?.section]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (dropdownPlacement !== 'auto') {
      setOpenDirection(dropdownPlacement);
      return;
    }

    const updateDirection = () => {
      const container = containerRef.current;
      const dropdown = dropdownRef.current;
      if (!container || !dropdown) return;

      const containerRect = container.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();

      const gap = 8;
      const spaceBelow = window.innerHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;
      const dropdownHeight = dropdownRect.height || 280;

      // Be conservative about opening upward: prefer "down" and let the dropdown
      // scroll if needed. Only flip "up" when there's clearly insufficient space.
      const shouldOpenUp =
        spaceBelow < Math.min(dropdownHeight + gap, 180) && spaceAbove > spaceBelow;

      setOpenDirection(shouldOpenUp ? 'up' : 'down');
    };

    // Wait a tick so dropdown has real height
    const raf = requestAnimationFrame(updateDirection);
    window.addEventListener('resize', updateDirection);
    window.addEventListener('scroll', updateDirection, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateDirection);
      window.removeEventListener('scroll', updateDirection, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const btn = buttonRef.current;
      const dropdown = dropdownRef.current;
      if (!btn || !dropdown) return;

      const btnRect = btn.getBoundingClientRect();
      const ddRect = dropdown.getBoundingClientRect();
      const gap = 8;

      const width = ddRect.width || 280;
      const height = ddRect.height || 280;

      // Align dropdown's right edge with button's right edge
      let left = btnRect.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

      let top =
        openDirection === 'up'
          ? btnRect.top - height - gap
          : btnRect.bottom + gap;

      // Keep within viewport (prefer staying below, but clamp if needed)
      top = Math.max(8, Math.min(top, window.innerHeight - height - 8));

      setDropdownPos({ top, left });
    };

    // Initial placement after mount so we can measure dropdown
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, openDirection]);

  return (
    <div ref={containerRef} className={`${styles.exportContainer} ${className}`}>
      <button
        ref={buttonRef}
        className={`${styles.exportButton} ${styles[variant]} ${styles[size]}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
      >
        <Download size={16} />
        {showLabel && (
          <span>
            {isExporting ? 'Exporting...' : 'Export'}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {createPortal(
            <>
              <div className={styles.overlay} onClick={() => setIsOpen(false)} />
              <div
                ref={dropdownRef}
                className={`${styles.dropdown} ${openDirection === 'up' ? styles.dropdownUp : ''}`}
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
              >
                <div className={styles.dropdownHeader}>
                  <h4>Export Data</h4>
                  <p>Choose your preferred format</p>
                </div>

                <div className={styles.exportOptions}>
                  {exportOptions.map((option) => {
                    const IconComponent = formatIcons[option.format];
                    return (
                      <button
                        key={option.format}
                        className={styles.exportOption}
                        onClick={() => handleExport(option.format)}
                        disabled={isExporting}
                      >
                        <IconComponent size={18} />
                        <div className={styles.optionContent}>
                          <span className={styles.optionLabel}>{option.label}</span>
                          <span className={styles.optionDescription}>
                            {option.format.toUpperCase()} format
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {data.metadata && (
                  <div className={styles.exportInfo}>
                    <p>Total Records: {data.metadata.totalRecords}</p>
                    <p>
                      Generated:{' '}
                      {new Date(
                        data.metadata.generatedAt || data.metadata.exportDate || Date.now()
                      ).toLocaleString()}
                    </p>
                    {data.metadata.searchQuery && (
                      <p>Search Query: "{data.metadata.searchQuery}"</p>
                    )}
                    {data.metadata.platform && <p>Platform: {data.metadata.platform}</p>}
                  </div>
                )}
              </div>
            </>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
