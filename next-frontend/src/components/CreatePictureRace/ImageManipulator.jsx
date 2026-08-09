"use client";
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';


export default function ImageManipulator({ imageSrc, onCropComplete, onAccept, initialZoom = 1, initialCrop = { x: 0, y: 0 } }) {
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedPixels, setCroppedPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
    if (onCropComplete) {
      onCropComplete(croppedArea, croppedAreaPixels, zoom);
    }
  }, [onCropComplete, zoom]);

  const handleAccept = async () => {
    if (!croppedPixels) return;
    try {
      const image = new Image();
      const imageLoadPromise = new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      image.src = imageSrc;
      await imageLoadPromise;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = croppedPixels.width;
      canvas.height = croppedPixels.height;

      ctx.drawImage(
        image,
        croppedPixels.x,
        croppedPixels.y,
        croppedPixels.width,
        croppedPixels.height,
        0,
        0,
        croppedPixels.width,
        croppedPixels.height
      );

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (onAccept) {
        onAccept(croppedDataUrl, crop, zoom);
      }
    } catch (e) {
      console.error("Failed to crop image", e);
    }
  };

  return (
    <div className="relative w-full h-[400px] bg-zk-bg rounded-xl overflow-hidden border-[3px] border-zk-border">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={16 / 9} // or whatever aspect ratio is needed
        onCropChange={setCrop}
        onCropComplete={onCropCompleteHandler}
        onZoomChange={setZoom}
        restrictPosition={false} // allows zooming in/out beyond image boundaries if desired
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] bg-white/90 p-3 rounded-lg border-[2px] border-zk-border flex items-center gap-4 z-10 shadow-lg">
        <span className="font-bold text-sm text-zk-text min-w-[40px]">Zoom</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={10}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-zk-purple cursor-pointer"
        />
        <span className="font-bold text-sm text-zk-text min-w-[40px] text-right">{zoom.toFixed(1)}x</span>
        
        <div className="w-[2px] h-8 bg-zk-border/20 mx-2"></div>
        
        <button 
          onClick={handleAccept}
          className="bg-[#00D06C] text-white font-black px-4 py-1.5 rounded-lg border-[2px] border-[#00A355] hover:bg-[#00E576] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_4px_0_0_#00A355] active:shadow-none shrink-0"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
