import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Camera } from "lucide-react";
import type { EquipmentImage } from "@shared/schema";

interface ImagePreviewProps {
  equipmentType: string;
  equipmentId: number;
  maxImages?: number;
  onClick?: () => void;
  className?: string;
}

export default function ImagePreview({
  equipmentType,
  equipmentId,
  maxImages = 3,
  onClick,
  className = ""
}: ImagePreviewProps) {
  const { data: images } = useQuery({
    queryKey: [`/api/equipment/${equipmentType}/${equipmentId}/images`],
    enabled: true
  });

  const imageList = (images as EquipmentImage[]) || [];
  const displayImages = imageList.slice(0, maxImages);
  const remainingCount = Math.max(0, imageList.length - maxImages);

  if (imageList.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center w-16 h-12 bg-gray-100 rounded border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-150 transition-colors ${className}`}
        onClick={onClick}
      >
        <Camera className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center space-x-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {displayImages.map((image, index) => (
        <div
          key={image.id}
          className="relative w-12 h-12 rounded border overflow-hidden bg-gray-100 hover:scale-105 transition-transform"
        >
          <img
            src={image.image_url}
            alt={image.image_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjQgMjhDMjYuMjA5MSAyOCAyOCAyNi4yMDkxIDI4IDI0QzI4IDIxLjc5MDkgMjYuMjA5MSAyMCAyNCAyMEMyMS43OTA5IDIwIDIwIDIxLjc5MDkgMjAgMjRDMjAgMjYuMjA5MSAyMS43OTA5IDI4IDI0IDI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded border text-xs font-medium text-gray-600">
          +{remainingCount}
        </div>
      )}
      <div className="flex items-center text-xs text-gray-500 ml-2">
        <ImageIcon className="h-3 w-3 mr-1" />
        {imageList.length}
      </div>
    </div>
  );
}