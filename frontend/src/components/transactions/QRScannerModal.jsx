import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, KeyRound, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const QRScannerModal = ({
  isOpen,
  onClose,
  onConfirmHandover,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopScanner();
      return;
    }

    const scannerId = 'bbb-qr-reader';
    let html5QrCode = null;

    const startScanner = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);
        html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            // Found QR Code
            try {
              await stopScanner();
              await onConfirmHandover({ token: decodedText });
            } catch (err) {
              setSubmitError(err.message || 'Verification failed');
            }
          },
          () => {
            // QR code scanning frame tick - ignore
          }
        );
      } catch (err) {
        console.warn('Camera scan initialization failed:', err);
        setCameraError('Camera access unavailable or declined. Please use the 6-character manual backup code below.');
        setActiveTab('manual');
        setIsScanning(false);
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, activeTab]);

  const stopScanner = async () => {
    if (scannerRef.current && isScanning && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignore stop errors
      } finally {
        scannerRef.current = null;
        isStoppingRef.current = false;
        setIsScanning(false);
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setSubmitError(null);
    try {
      await onConfirmHandover({ manualCode: manualCode.trim().toUpperCase() });
    } catch (err) {
      setSubmitError(err.message || 'Invalid or expired code');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Item Handover" maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Tab Switcher */}
        <div className="flex w-full bg-paper-sand/40 dark:bg-paper-sandDark/40 p-1 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-paper-cardDark text-terracotta shadow-xs'
                : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Scan QR Code
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-paper-cardDark text-terracotta shadow-xs'
                : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Enter 6-Digit Code
          </button>
        </div>

        {/* Camera View */}
        {activeTab === 'camera' && (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-2xl overflow-hidden mb-3 border-2 border-paper-sand">
              <div id="bbb-qr-reader" className="w-full h-full" />
            </div>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted text-center">
              Point your camera at the lender&apos;s screen to scan the handover QR token.
            </p>
          </div>
        )}

        {/* Manual Code View */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="w-full space-y-4">
            {cameraError && (
              <div className="p-3 rounded-xl bg-marigold/10 border border-marigold/30 text-xs text-ink dark:text-ink-dark flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-marigold-darker shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1 text-center">
                6-Character Handover Code
              </label>
              <Input
                type="text"
                maxLength={6}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="e.g. 4B2A8C"
                className="text-center font-mono text-2xl tracking-widest uppercase font-bold"
                required
                autoFocus
              />
              <span className="text-[11px] text-ink-muted block text-center mt-1">
                Enter the code shown on the lender&apos;s phone.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isProcessing}
              disabled={manualCode.trim().length < 6 || isProcessing}
              className="w-full text-xs gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Code & Confirm Handover
            </Button>
          </form>
        )}

        {/* Submission Error Banner */}
        {submitError && (
          <div className="mt-4 p-3 rounded-xl bg-brick/10 border border-brick/30 text-xs text-brick w-full flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
