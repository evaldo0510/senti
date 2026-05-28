import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Video, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TherapistMapProps {
  therapists: UserProfile[];
}

const TherapistMap: React.FC<TherapistMapProps> = ({ therapists }) => {
  const navigate = useNavigate();
  
  // Default center (São Paulo)
  const center: [number, number] = [-23.5505, -46.6333];

  return (
    <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Dark mode filter for the map
          className="dark-map-tiles"
        />
        {therapists.map((prof) => {
          if (!prof.latitude || !prof.longitude) return null;
          
          return (
            <Marker 
              key={prof.uid} 
              position={[prof.latitude, prof.longitude]}
            >
              <Popup className="therapist-popup">
                <div className="p-1 min-w-[200px] bg-slate-900 text-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img 
                        src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/100/100`} 
                        alt={prof.nome}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      {prof.online && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm leading-tight">{prof.nome}</h4>
                      <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        {prof.especialidades?.[0] || 'Psicólogo'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-slate-200">{prof.rating || 4.8}</span>
                      <span className="opacity-60">({prof.reviewCount || 120} avaliações)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{prof.cidade || 'São Paulo, SP'}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold",
                      prof.online ? "text-emerald-400" : "text-slate-500"
                    )}>
                      <Video className="w-3 h-3" />
                      <span>{prof.online ? 'Online agora' : 'Offline'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-[10px] font-bold transition-all border border-white/5"
                    >
                      Perfil
                    </button>
                    <button 
                      onClick={() => navigate(`/agendamento/${prof.uid}`)}
                      className="flex-[1.5] py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle size={12} className="fill-slate-950" />
                      Conectar
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .dark-map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .therapist-popup .leaflet-popup-content-wrapper {
          background: #0f172a; /* slate-900 */
          color: #f1f5f9; /* slate-100 */
          border-radius: 1.25rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .therapist-popup .leaflet-popup-content {
          margin: 12px;
        }
        .therapist-popup .leaflet-popup-tip {
          background: #0f172a; /* slate-900 */
        }
      `}} />
    </div>
  );
};

export default TherapistMap;
