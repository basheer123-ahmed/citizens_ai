import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { Layers, Maximize, MousePointer2, Info, Search, Filter, ShieldAlert, Activity, ShieldCheck, Zap, ArrowUpRight, Globe, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const createDotIcon = (color, isBlinking) => L.divIcon({
  className: 'custom-dot-icon',
  html: `<div style="display:flex; align-items:center; justify-content:center; width:32px; height:32px;">
            <div class="${isBlinking ? 'marker-pulse' : ''}" style="width:16px; height:16px; background-color:${color}; border:2px solid white; border-radius:50%; box-shadow: 0 0 8px rgba(0,0,0,0.3); --pulse-color: ${color}cc;"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const MapBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(p => Array.isArray(p) && p.length >= 2 && !isNaN(parseFloat(p[0])) && !isNaN(parseFloat(p[1])));
      if (validPoints.length > 0) {
        try {
          if (validPoints.length === 1) {
             map.setView([validPoints[0][0], validPoints[0][1]], 14);
          } else {
              const bounds = L.latLngBounds(validPoints.map(p => [parseFloat(p[0]), parseFloat(p[1])]));
              if (bounds.isValid()) {
                 setTimeout(() => {
                   if (map) {
                     map.invalidateSize();
                     map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                   }
                 }, 100);
              }
          }
        } catch (err) {
          console.error('Failed to fit bounds:', err);
        }
      }
    }
  }, [points, map]);
  return null;
};

const HeatmapLayer = ({ points, visible }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !visible || !points || points.length === 0) return;
    let heat;
    const renderHeatmap = () => {
      try {
        const validPoints = points.filter(p => Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]));
        if (validPoints.length === 0) return;

        const cleanPoints = validPoints.map(p => [Number(p[0]), Number(p[1]), Number(p[2] || 1)]);
        
        heat = L.heatLayer(cleanPoints, {
          radius: 20,
          blur: 15,
          maxZoom: 17,
          gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map);
      } catch (e) {
        console.error('Heatmap layer failed into command execution:', e);
      }
    };

    const timer = setTimeout(renderHeatmap, 100);

    return () => {
      clearTimeout(timer);
      if (heat && map && map.hasLayer(heat)) {
        map.removeLayer(heat);
      }
    };
  }, [map, points, visible]);
  return null;
};

const ComplaintMap = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('markers'); // markers | heatmap

  useEffect(() => {
    if (!user) return;
    const fetchComplaints = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/complaints`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

  if (!user) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 font-mono tracking-widest uppercase">Syncing Geospatial Node...</p>
      </div>
    );
  }

  const getMarkerColor = (complaint) => {
    if (['Resolved', 'Closed', 'Feedback Pending', 'Completed'].includes(complaint.status)) return '#10b981'; 
    if (['In Progress', 'Work In Progress', 'Assigned to Responsible Department Officer', 'Assigned'].includes(complaint.status)) return '#f59e0b'; 
    if (complaint.priority === 'High' || complaint.priority === 'Critical') return '#ef4444'; 
    return '#3b82f6'; 
  };

  const getMarkerPos = (c) => {
    let lat = c.latitude;
    let lng = c.longitude;
    
    if ((lat === undefined || lat === null) && (lng === undefined || lng === null) && c.location?.coordinates) {
      lng = c.location.coordinates[0];
      lat = c.location.coordinates[1];
    }
    
    lat = Number(lat);
    lng = Number(lng);
    
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;
    return { lat, lng };
  };

  const heatPoints = useMemo(() => {
    return complaints
      .map(getMarkerPos)
      .filter(pos => pos !== null)
      .map(pos => [pos.lat, pos.lng, 1]); 
  }, [complaints]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 h-[calc(100vh-140px)] overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Geospatial Node: Active Grid</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none uppercase">Sector Intelligence</h2>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Synthesizing localized grievance density for civic oversight.</p>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'markers' ? 'heatmap' : 'markers')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${
            viewMode === 'heatmap' ? 'bg-primary-600 text-white shadow-primary-500/30' : 'bg-white text-slate-900 border border-slate-200 hover:bg-primary-500 hover:text-white hover:border-transparent'
          }`}
        >
           <Layers size={14} /> {viewMode === 'heatmap' ? 'Deactivate Heatmap' : 'Activate Heatmap Layer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col gap-6 h-[600px] lg:min-h-0 lg:h-full relative z-0">
          <div className="card p-0 overflow-hidden h-full relative group border-none shadow-3xl shadow-slate-200/50 rounded-[3rem] bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-full bg-slate-50/50">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <MapContainer
                center={[28.6139, 77.2090]}
                zoom={12}
                zoomControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-grayscale opacity-90"
                />
                
                {viewMode === 'heatmap' && <HeatmapLayer points={heatPoints} visible={true} />}

                {viewMode === 'markers' && complaints.map((c) => {
                  const pos = getMarkerPos(c);
                  return (pos && pos.lat !== null && pos.lng !== null) ? (
                    <Marker 
                      key={c._id} 
                      position={[pos.lat, pos.lng]} 
                      icon={createDotIcon(getMarkerColor(c), !['Closed'].includes(c.status))}
                    >
                      <Popup className="custom-popup">
                        <div className="flex flex-col gap-3 min-w-[240px] p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">{c.complaintId}</span>
                            <span className={`text-[8px] uppercase tracking-[0.2em] font-black px-2 py-1 rounded-md shadow-sm ${
                               c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                               c.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>{c.status}</span>
                          </div>
                          <h3 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{c.category}</h3>
                          
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider line-clamp-2 leading-relaxed opacity-80">{c.description}</p>
                          
                          <div className="pt-2 border-t border-slate-50">
                            <Link to="/citizen/my-complaints" className="flex items-center gap-1 text-[9px] font-black text-primary-600 hover:text-primary-800 uppercase tracking-[0.2em]">
                               Detailed Intelligence <ArrowUpRight size={10} />
                            </Link>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null;
                })}
                <MapBounds points={heatPoints} />
              </MapContainer>
            )}

            <div className="absolute bottom-8 left-8 right-8 pointer-events-none z-[400]">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] flex items-center justify-between text-white pointer-events-auto shadow-4xl"
               >
                  <div className="flex items-center gap-10">
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <Target size={12} className="text-primary-400" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Density</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">{complaints.filter(c => !['Resolved', 'Closed', 'Feedback Pending', 'Completed'].includes(c.status)).length} SECTOR FEEDS</span>
                     </div>
                     <div className="w-[1px] h-12 bg-white/10"></div>
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <ShieldAlert size={12} className="text-rose-400" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Critical Alert</span>
                        </div>
                        <span className="text-xl font-black text-rose-400 tracking-tighter uppercase whitespace-nowrap">
                          {complaints.filter(c => !['Resolved', 'Closed', 'Feedback Pending', 'Completed'].includes(c.status) && (c.priority === 'High' || c.priority === 'Critical')).length} HIGH SEVERITY
                        </span>
                     </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                     <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">System Status</span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Surveillance</span>
                     </div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-8">
           <div className="flex flex-col gap-1 px-2">
              <div className="flex items-center gap-2">
                 <Globe size={16} className="text-primary-500" />
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Geo Legend</h2>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sector Protocol Identifiers</p>
           </div>

           <div className="flex flex-col gap-4">
              {[
                { label: 'Priority Intercept', color: '#ef4444', desc: 'Critical high-density protocols requiring immediate attention.' },
                { label: 'Operational Feed', color: '#f59e0b', desc: 'Active protocols currently under administrative resolution.' },
                { label: 'Verified Success', color: '#10b981', desc: 'Normalized sectors with verified grievance resolution.' }
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="card p-6 flex flex-col gap-3 group hover:border-slate-300 transition-all border-none bg-white shadow-2xl shadow-slate-200/40 rounded-[2rem]"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.label}</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed opacity-70">{item.desc}</p>
                </motion.div>
              ))}
           </div>

           <motion.div 
             whileHover={{ y: -5 }}
             className="card p-8 bg-slate-900 border-none shadow-3xl shadow-slate-900/10 rounded-[2.5rem] text-white relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/20 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col gap-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary-600 transition-colors">
                    <Zap size={20} className="text-primary-400 group-hover:text-white" />
                 </div>
                 <div className="flex flex-col gap-1">
                    <h4 className="font-black text-xs uppercase tracking-widest">Command Insight</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">Toggle density mapping to synthesize city-wide infrastructure decay patterns.</p>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintMap;
