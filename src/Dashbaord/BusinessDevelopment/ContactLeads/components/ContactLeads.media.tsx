// Contact Leads: feature UI logic and helpers
import { useEffect, useRef, useState } from "react";
import { LuUpload, LuCamera, LuTrash2, LuX, LuEye, LuFileImage } from "react-icons/lu";
import { Button } from "../../../../components/ui/button";
import { useUserStore } from "../../../../Store/UserStore";

function SecureImage({ src, alt, className, style }: { src: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useUserStore();

  useEffect(() => {
    let urlToRevoke: string | null = null;
    let isMounted = true;

    const fetchImage = async () => {
      if (!src) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http') === false) {
        if (isMounted) {
          setObjectUrl(src);
          setIsLoading(false);
        }
        return;
      }

      try {
        const headers: HeadersInit = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        
        const response = await fetch(src, { headers });
        if (!response.ok) throw new Error('Image fetch failed');
        
        const blob = await response.blob();
        if (isMounted) {
          urlToRevoke = URL.createObjectURL(blob);
          setObjectUrl(urlToRevoke);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setObjectUrl(src); 
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [src, accessToken]);

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-200 ${className || ''}`} style={style} />;
  }

  return <img src={objectUrl || src} alt={alt || ""} className={className} style={style} />;
}

// Media helpers for business card capture, preview, and upload.
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-3xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white bg-none border-none cursor-pointer flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <LuX className="text-lg" /> Close
        </button>
        <SecureImage src={src} alt="Business Card" className="max-w-full max-h-[85vh] rounded-xl object-contain " />
      </div>
    </div>
  );
}

function CameraModal({ onCapture, onClose }: { onCapture: (img: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Request camera access and stream to the video element.
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() => setError("Camera access denied. Please allow camera permissions and try again."));

    return () => {
      // Stop camera stream on unmount.
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    // Capture current frame into a data URL.
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    setCaptured(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const handleUse = () => {
    if (captured) onCapture(captured);
  };

  const handleRetake = () => {
    // Restart the camera feed for another capture.
    setCaptured(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl  w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Take Photo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 border-none bg-none cursor-pointer"><LuX className="text-lg" /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full rounded-lg object-cover" style={{ maxHeight: 320 }} />
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: 280 }}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full object-cover" style={{ maxHeight: 320 }} />
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">Initializing camera…</div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <div className="flex gap-3">
            {captured ? (
              <>
                <Button variant="outline" onClick={handleRetake}>Retake</Button>
                <Button variant="default" onClick={handleUse}>Use Photo</Button>
              </>
            ) : (
              <Button variant="primary" onClick={handleCapture} disabled={!ready} className="gap-2">
                <LuCamera className="text-sm" /> Capture
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessCardSection({
  image,
  onImageChange,
  readOnly = false,
}: {
  image: string | null;
  onImageChange: (img: string | null) => void;
  readOnly?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onImageChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      {showCamera && (
        <CameraModal
          onCapture={(img) => { onImageChange(img); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
      {showLightbox && image && (
        <ImageLightbox src={image} onClose={() => setShowLightbox(false)} />
      )}

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Business Card {readOnly ? "" : "(Optional)"}</p>

        {image ? (
          <div className="flex flex-col gap-3">
            <div
              className="relative border border-gray-200 rounded-xl overflow-hidden cursor-pointer group"
              style={{ maxWidth: 340, height: 200 }}
              onClick={() => setShowLightbox(true)}
            >
              <SecureImage src={image} alt="Business Card" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <LuEye className="text-white text-xl" />
                <span className="text-white text-sm font-medium">View full size</span>
              </div>
            </div>
            {!readOnly && (
              <div className="flex flex-wrap gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                  <LuUpload className="text-xs" /> Replace
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCamera(true)}>
                  <LuCamera className="text-xs" /> Retake
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => onImageChange(null)}>
                  <LuTrash2 className="text-xs" /> Remove
                </Button>
              </div>
            )}
            {readOnly && (
              <button onClick={() => setShowLightbox(true)}
                className="text-sm text-blue-600 cursor-pointer hover:underline border-none bg-none text-left w-fit flex items-center gap-1">
                <LuEye className="text-xs" /> View attached business card
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!readOnly ? (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <LuUpload className="text-sm" /> Upload Photo
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setShowCamera(true)}>
                    <LuCamera className="text-sm" /> Take Photo
                  </Button>
                </div>
              </>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <LuFileImage className="text-gray-400 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 m-0">No business card attached</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}



