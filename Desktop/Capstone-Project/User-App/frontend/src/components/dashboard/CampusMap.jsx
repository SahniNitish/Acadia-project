import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const alertIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e53e3e" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#e53e3e"/>
      <path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const officerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3182ce" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3182ce"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Acadia University coordinates (Wolfville, Nova Scotia)
const ACADIA_CENTER = [45.0865, -64.3665];

export const CampusMap = ({ alerts = [], officers = [], height = '100%' }) => {
  return (
    <MapContainer
      center={ACADIA_CENTER}
      zoom={16}
      style={{ height, width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Alert markers */}
      {alerts.map((alert) => {
        // Use alert location or default to campus center with small offset
        const lat = alert.latitude || ACADIA_CENTER[0] + (Math.random() - 0.5) * 0.005;
        const lng = alert.longitude || ACADIA_CENTER[1] + (Math.random() - 0.5) * 0.005;
        
        return (
          <Marker 
            key={alert.id} 
            position={[lat, lng]} 
            icon={alertIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-red-600">SOS Alert</p>
                <p className="text-sm">{alert.studentName || 'Unknown'}</p>
                <p className="text-xs text-slate-500">{alert.location || 'Location pending'}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Officer markers */}
      {officers.map((officer) => (
        <Marker 
          key={officer.id} 
          position={[officer.latitude, officer.longitude]} 
          icon={officerIcon}
        >
          <Popup>
            <div className="p-2">
              <p className="font-bold text-blue-600">Officer</p>
              <p className="text-sm">{officer.name}</p>
              <p className="text-xs text-slate-500">{officer.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
