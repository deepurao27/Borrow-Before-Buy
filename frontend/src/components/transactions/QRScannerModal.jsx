import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, KeyRound, AlertCircle, CheckCircle, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const QRScannerModal = ({
  isOpen,
  onClose,
  onConfirmHandover,
  isProcessing,
  transaction
}) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setSuccessData(null);
      setSubmitError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera' || successData) {
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
              await triggerVerification({ token: decodedText });
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
        setCameraError('Camera access unavailable or declined. You can use the instant simulation or manual code below.');
        setActiveTab('manual');
        setIsScanning(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, activeTab, successData]);

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

  const triggerVerification = async (payload) => {
    setSubmitError(null);
    try {
      await onConfirmHandover(payload);
      setSuccessData({
        itemTitle: transaction?.item?.title || 'Campus Equipment',
        borrowerName: transaction?.borrower?.name || 'Borrower',
        deposit: transaction?.securityAmount || 300,
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    } catch (err) {
      setSubmitError(err.message || 'Verification failed');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await triggerVerification({ manualCode: manualCode.trim().toUpperCase(), method: 'MANUAL_CODE' });
  };

  const handleSimulateScan = async () => {
    await triggerVerification({ method: 'QR_SCAN', token: 'bbb_simulated_in_person_token' });
  };

  // Figure 6.2 Handover Verification Success Display
  if (successData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Handover Confirmed" maxWidth="max-w-md">
        <div className="flex flex-col items-center text-center p-4 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
              Handover Verification Success!
            </h3>
            <p className="text-xs text-emerald-400 font-bold mt-1">
              QR Scan Verified by Server - Handover Confirmed!
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Item:</span>
              <span className="font-bold text-slate-100">{successData.itemTitle}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Borrower:</span>
              <span className="font-bold text-slate-100">{successData.borrowerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Offline Deposit Exchanged:</span>
              <span className="font-bold text-amber-400">₹{successData.deposit}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Status transitioned to:</span>
              <span className="font-mono font-bold text-emerald-400">BORROWED</span>
            </div>
            <div className="flex justify-between pt-0.5 text-[11px] text-slate-400">
              <span>Verified at:</span>
              <span>{successData.timestamp}</span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full font-bold shadow-md"
            onClick={onClose}
          >
            Go to Active Loans
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Item Handover" maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Tab Switcher */}
        <div className="flex w-full bg-paper-sand/40 dark:bg-paper-sandDark/40 p-1 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-paper-cardDark text-amber-500 shadow-xs'
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
                ? 'bg-white dark:bg-paper-cardDark text-amber-500 shadow-xs'
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
            <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-2xl overflow-hidden mb-3 border-2 border-slate-700">
              <div id="bbb-qr-reader" className="w-full h-full" />
            </div>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted text-center mb-3">
              Point your camera at the lender&apos;s screen to scan the handover QR token.
            </p>
          </div>
        )}

        {/* Manual Code View */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="w-full space-y-4">
            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
              disabled={manualCode.trim().length < 4 || isProcessing}
              className="w-full text-xs gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Code & Confirm Handover
            </Button>
          </form>
        )}

        {/* 1-Click Fast In-Person Scan Simulation for Demo / Examiners */}
        <div className="mt-4 pt-3 border-t border-paper-sand dark:border-paper-sandDark w-full">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSimulateScan}
            isLoading={isProcessing}
            className="w-full text-xs gap-2 font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Instant In-Person QR Scan (Evaluation Demo)
          </Button>
          <p className="text-[10px] text-ink-muted text-center mt-1">
            Simulates scanning the lender&apos;s single-use cryptographic QR token on campus.
          </p>
        </div>

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
