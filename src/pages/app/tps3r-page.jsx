import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../service/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Tps3rPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const createIcon = (iconUrl) => new L.Icon({
  iconUrl,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const tps3rIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png');
const recyclingIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png');
const userIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png');

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const Tps3rPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    type: 'TPS3R'
  });
  const [mapCenter, setMapCenter] = useState([-8.4095, 115.1889]);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/map/locations');
        setLocations(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Gagal memuat data lokasi');
        setIsLoading(false);
      }
    };

    if (isAuthenticated) fetchLocations();
  }, [isAuthenticated]);

  const handleMapClick = (e) => {
    if (showAddForm) {
      setNewLocation(prev => ({
        ...prev,
        lat: e.latlng.lat.toFixed(6),
        lng: e.latlng.lng.toFixed(6)
      }));
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
        },
        error => {
          console.error('Geolocation error:', error);
          alert('Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan.');
        }
      );
    } else {
      alert('Browser Anda tidak mendukung geolokasi.');
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      if (newLocation.id) {
        await api.put(`/map/locations/${newLocation.id}`, newLocation);
      } else {
        const response = await api.post('/map/locations', newLocation);
        newLocation.id = response.data.id;
      }
      
      setLocations(prev => {
        const existing = prev.find(loc => loc.id === newLocation.id);
        return existing ? prev.map(loc => loc.id === newLocation.id ? newLocation : loc) : [...prev, newLocation];
      });
      
      setShowAddForm(false);
      setNewLocation({
        name: '',
        address: '',
        lat: '',
        lng: '',
        type: 'TPS3R'
      });
    } catch (err) {
      console.error('Error saving location:', err);
      alert('Gagal menyimpan lokasi');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) {
    return (
      <section className="auth-section">
        <div className="beranda-container">
          <div className="auth-required">
            <h2>Anda perlu login untuk mengakses fitur ini</h2>
            <p>Silakan login terlebih dahulu untuk melihat lokasi TPS3R.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tps3r-section">
      <div className="beranda-container">
        <div className="tps3r-header">
          <h2 className="section-title">Temukan TPS3R & Pusat Daur Ulang</h2>
          <p className="section-subtitle">Lihat lokasi terdekat dan kelola data TPS3R</p>
        </div>

        <div className="map-controls">
          <div className="filter-controls">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Semua
            </button>
            <button 
              className={`filter-btn ${filter === 'TPS3R' ? 'active' : ''}`}
              onClick={() => setFilter('TPS3R')}
            >
              TPS3R
            </button>
            <button 
              className={`filter-btn ${filter === 'Recycling Center' ? 'active' : ''}`}
              onClick={() => setFilter('Recycling Center')}
            >
              Daur Ulang
            </button>
            <button 
              className="primary-button locate-btn"
              onClick={handleLocateMe}
            >
              <i className="fas fa-location-arrow"></i> Lokasi Saya
            </button>
            
            {user?.role === 'admin' && (
              <button 
                className={`primary-button ${showAddForm ? 'cancel-btn' : 'add-btn'}`}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? (
                  <><i className="fas fa-times"></i> Batal</>
                ) : (
                  <><i className="fas fa-plus"></i> Tambah Lokasi</>
                )}
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="add-location-form">
            <h3>{newLocation.id ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
            <form onSubmit={handleAddLocation}>
              <div className="form-group">
                <label>Nama Lokasi</label>
                <input
                  type="text"
                  name="name"
                  value={newLocation.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  name="address"
                  value={newLocation.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Koordinat</label>
                <div className="coordinate-inputs">
                  <input
                    type="number"
                    name="lat"
                    placeholder="Latitude"
                    step="any"
                    value={newLocation.lat}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="number"
                    name="lng"
                    placeholder="Longitude"
                    step="any"
                    value={newLocation.lng}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <small>Klik peta untuk menentukan koordinat</small>
              </div>
              <div className="form-group">
                <label>Tipe Lokasi</label>
                <select
                  name="type"
                  value={newLocation.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="TPS3R">TPS3R</option>
                  <option value="Recycling Center">Pusat Daur Ulang</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  <i className="fas fa-save"></i> Simpan
                </button>
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLocation({
                      name: '',
                      address: '',
                      lat: '',
                      lng: '',
                      type: 'TPS3R'
                    });
                  }}
                >
                  <i className="fas fa-times"></i> Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Memuat data lokasi...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="primary-button" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i> Coba Lagi
            </button>
          </div>
        ) : (
          <div className="map-content-container">
            <div className="map-container">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                whenCreated={map => { mapRef.current = map; }}
                onClick={handleMapClick}
              >
                <MapController center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {userLocation && (
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>Lokasi Anda</Popup>
                  </Marker>
                )}

                {locations.filter(loc => filter === 'all' || loc.type === filter)
                  .map(location => (
                    <Marker
                      key={location.id}
                      position={[parseFloat(location.lat), parseFloat(location.lng)]}
                      icon={location.type === 'TPS3R' ? tps3rIcon : recyclingIcon}
                    >
                      <Popup>
                        <b>{location.name}</b><br />
                        {location.address}<br />
                        <small>Tipe: {location.type}</small>
                        {user?.role === 'admin' && (
                          <div className="popup-actions">
                            <button onClick={() => {
                              setNewLocation(location);
                              setShowAddForm(true);
                            }}>
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button onClick={async () => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
                                try {
                                  await api.delete(`/map/locations/${location.id}`);
                                  setLocations(prev => prev.filter(loc => loc.id !== location.id));
                                } catch (err) {
                                  console.error('Error deleting location:', err);
                                  alert('Gagal menghapus lokasi');
                                }
                              }
                            }}>
                              <i className="fas fa-trash"></i> Hapus
                            </button>
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            <div className="location-list">
              <div className="list-header">
                <h3 className="list-title">Daftar Lokasi {filter !== 'all' && `(${filter})`}</h3>
              </div>
              <div className="location-grid">
                {locations
                  .filter(loc => filter === 'all' || loc.type === filter)
                  .map(location => (
                    <div 
                      key={location.id} 
                      className="location-card"
                      onClick={() => {
                        setMapCenter([parseFloat(location.lat), parseFloat(location.lng)]);
                        setMapZoom(15);
                      }}
                    >
                      <div className="location-info">
                        <h4>{location.name}</h4>
                        <p className="location-address">{location.address}</p>
                        <div className="location-meta">
                          <span className={`location-type ${location.type.replace(' ', '-').toLowerCase()}`}>
                            {location.type}
                          </span>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="location-actions">
                          <button 
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewLocation(location);
                              setShowAddForm(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
                                try {
                                  await api.delete(`/map/locations/${location.id}`);
                                  setLocations(prev => prev.filter(loc => loc.id !== location.id));
                                } catch (err) {
                                  console.error('Error deleting location:', err);
                                  alert('Gagal menghapus lokasi');
                                }
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Tps3rPage;