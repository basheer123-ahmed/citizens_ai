import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

// Custom Marker Icon with Neon Pulse
const customIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="position: relative; color: #3b82f6; transform: translate(-50%, -100%); filter: drop-shadow(0 0 10px rgba(59,130,246,0.8));">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="position: relative; z-index: 10;">
             <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.993 4 10a8 8 0 0 1 16 0"/>
             <circle cx="12" cy="10" r="3" fill="#3b82f6"/>
           </svg>
           <div style="position: absolute; top: 10px; left: 50%; width: 20px; height: 20px; background: rgba(59,130,246,0.6); border-radius: 50%; transform: translateX(-50%); animation: marker-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);"></div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const MapViewUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng, 'Locating address...');
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (data && data.display_name) {
          onMapClick(lat, lng, data.display_name);
        } else {
          onMapClick(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (err) {
        onMapClick(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
  });
  return null;
};

const GrievanceMap = ({ latitude, longitude, onLocationChange, addressSearch, setAddressSearch, address }) => {
  
  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!addressSearch) return;
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`);
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          onLocationChange(parseFloat(lat), parseFloat(lon), display_name);
        }
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full relative z-0">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" size={16} />
        <input
          type="text"
          placeholder="SEARCH ARCHIVE OR LOCALITY..."
          className="w-full pl-13 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-black text-[10px] text-slate-200 uppercase tracking-widest shadow-lg shadow-black/20"
          value={addressSearch}
          onChange={(e) => setAddressSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/10 glass-morphism relative min-h-[360px] z-10 shadow-2xl p-1">
        <div className="w-full h-full rounded-[2.25rem] overflow-hidden relative">
           <MapContainer
             center={[latitude, longitude]}
             zoom={15}
             zoomControl={false}
             style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}
           >
             <TileLayer
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />
             <Marker position={[latitude, longitude]} icon={customIcon} />
             <MapClickHandler onMapClick={onLocationChange} />
             <MapViewUpdater center={[latitude, longitude]} />
           </MapContainer>
           {/* Inner glow effect */}
           <div className="absolute inset-0 pointer-events-none rounded-[2.25rem] border border-white/5 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] z-[400]"></div>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6 bg-slate-900/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 p-5 rounded-3xl flex items-center justify-between z-[500] transition-all hover:scale-[1.02]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <MapPin size={10} className="text-primary-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Hub</span>
            </div>
            <span className="text-xs font-black text-slate-200 font-mono tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
              {latitude.toFixed(6)} / {longitude.toFixed(6)}
            </span>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse">Synced</div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceMap;

