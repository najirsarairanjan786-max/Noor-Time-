import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, Check } from 'lucide-react';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ setPosition }: { setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { latitude: number; longitude: number; name: string, address?: any }) => void;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPickerModal({ isOpen, onClose, onSelect, initialLat, initialLng }: LocationPickerModalProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat || 21.4225, initialLng || 39.8262]); // Default to Makkah
  const [isLoadingName, setIsLoadingName] = useState(false);
  const [locationName, setLocationName] = useState<string>("Select a location");
  const [addressData, setAddressData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setPosition([initialLat || 21.4225, initialLng || 39.8262]);
    }
  }, [isOpen, initialLat, initialLng]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchName = async () => {
      setIsLoadingName(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json&accept-language=en`);
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Unknown Area";
        const country = data.address?.country || "";
        setLocationName(country ? `${city}, ${country}` : city);
        setAddressData(data.address || null);
      } catch (e) {
        setLocationName("Selected Location");
        setAddressData(null);
      }
      setIsLoadingName(false);
    };
    
    const timeout = setTimeout(fetchName, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [position, isOpen]);

  const handleConfirm = () => {
    onSelect({
      latitude: position[0],
      longitude: position[1],
      name: locationName,
      address: addressData
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 bg-emerald-700 text-white flex justify-between items-center">
              <h3 className="font-bold">Pick Location</h3>
              <button onClick={onClose} className="p-1 hover:bg-emerald-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-[400px] w-full relative">
              <MapContainer center={position} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
                <MapClickHandler setPosition={setPosition} />
                <MapUpdater position={position} />
              </MapContainer>
            </div>

            <div className="p-4 flex items-center justify-between bg-slate-50">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Selected Location</span>
                <span className="text-slate-800 font-bold max-w-[200px] truncate">
                  {isLoadingName ? "Loading..." : locationName}
                </span>
              </div>
              <button
                onClick={handleConfirm}
                disabled={isLoadingName}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
