import React, { useRef, useState, useEffect, useCallback } from 'react';
import Icon from './Icon';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCrop: (croppedImageUrl: string) => void;
}

const CROP_AREA_SIZE = 256; // The size of the circular crop area in pixels

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onClose, onCrop }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);

  const constrainCrop = useCallback((newCrop: {x: number, y: number}, currentZoom: number) => {
    if (!imageRef.current) return newCrop;

    const { naturalWidth, naturalHeight } = imageRef.current;
    const imageWidth = naturalWidth * currentZoom;
    const imageHeight = naturalHeight * currentZoom;
    
    // The image edges should not go inside the crop area.
    const minX = CROP_AREA_SIZE - imageWidth;
    const minY = CROP_AREA_SIZE - imageHeight;
    const maxX = 0;
    const maxY = 0;

    return {
      x: Math.min(maxX, Math.max(minX, newCrop.x)),
      y: Math.min(maxY, Math.max(minY, newCrop.y)),
    };
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { naturalWidth, naturalHeight } = img;

    if (naturalWidth > 0 && naturalHeight > 0) {
      // Determine the scale ('cover' behavior) to ensure the image fills the crop area
      const scale = Math.max(CROP_AREA_SIZE / naturalWidth, CROP_AREA_SIZE / naturalHeight);
      
      const initialZoom = scale;
      setMinZoom(initialZoom);
      setZoom(initialZoom);

      // Calculate the initial position to center the image
      const initialX = (CROP_AREA_SIZE - naturalWidth * initialZoom) / 2;
      const initialY = (CROP_AREA_SIZE - naturalHeight * initialZoom) / 2;

      setCrop({ x: initialX, y: initialY });
      setIsImageLoaded(true);
    } else {
      // Handle case where image might not have loaded correctly
      setIsImageLoaded(false);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, cropX: crop.x, cropY: crop.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    const newCrop = {
      x: panStart.current.cropX + dx,
      y: panStart.current.cropY + dy,
    };
    setCrop(constrainCrop(newCrop, zoom));
  }, [zoom, constrainCrop]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Attach global listeners for smooth panning even if cursor leaves the modal
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current || !imageRef.current) return;
    
    const newZoom = Math.max(minZoom, Math.min(3, zoom - e.deltaY * 0.001));
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Point on image under mouse
    const imageX = (mouseX - crop.x) / zoom;
    const imageY = (mouseY - crop.y) / zoom;

    // New crop position to keep that point under mouse
    const newCropX = mouseX - imageX * newZoom;
    const newCropY = mouseY - imageY * newZoom;

    setZoom(newZoom);
    setCrop(constrainCrop({ x: newCropX, y: newCropY }, newZoom));
  };
  
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    
    // Zoom towards the center of the crop area for a predictable slider behavior
    const centerX = CROP_AREA_SIZE / 2;
    const centerY = CROP_AREA_SIZE / 2;
    
    const imageX = (centerX - crop.x) / zoom;
    const imageY = (centerY - crop.y) / zoom;

    const newCropX = centerX - imageX * newZoom;
    const newCropY = centerY - imageY * newZoom;
    
    setZoom(newZoom);
    setCrop(constrainCrop({ x: newCropX, y: newCropY }, newZoom));
  };

  const handleConfirm = () => {
    const image = imageRef.current;
    if (!image || !isImageLoaded) return;

    const canvas = document.createElement('canvas');
    const finalAvatarSize = 256; // High-res output
    canvas.width = finalAvatarSize;
    canvas.height = finalAvatarSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate the source rectangle on the original, unscaled image
    const sourceX = -crop.x / zoom;
    const sourceY = -crop.y / zoom;
    const sourceWidth = CROP_AREA_SIZE / zoom;
    const sourceHeight = CROP_AREA_SIZE / zoom;
    
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, finalAvatarSize, finalAvatarSize
    );
    onCrop(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ajustar Foto de Perfil</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            <Icon type="close" className="h-6 w-6" />
          </button>
        </header>
        <main className="p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Arraste para mover e use o controle deslizante ou a roda do mouse para dar zoom.</p>
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-full bg-gray-200 dark:bg-slate-900 cursor-move"
            style={{
              width: `${CROP_AREA_SIZE}px`,
              height: `${CROP_AREA_SIZE}px`,
              border: '2px dashed #A0AEC0', // gray-400
            }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              style={{
                position: 'absolute',
                top: `${crop.y}px`,
                left: `${crop.x}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                display: isImageLoaded ? 'block' : 'none',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
             {!isImageLoaded && (
                <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">Carregando imagem...</p>
                </div>
            )}
          </div>
          <div className="w-full flex items-center gap-3 pt-4">
            <Icon type="search" className="w-5 h-5 text-gray-500 dark:text-gray-400 transform -scale-x-100" />
            <input
              type="range"
              min={minZoom}
              max={3}
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
              disabled={!isImageLoaded}
              className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
             <Icon type="search" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </main>
        <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex justify-end gap-4">
          <button onClick={onClose} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
          <button onClick={handleConfirm} disabled={!isImageLoaded} className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:bg-gray-600">Confirmar</button>
        </footer>
      </div>
    </div>
  );
};

export default ImageCropperModal;