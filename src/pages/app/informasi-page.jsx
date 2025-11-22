import React, { useState, useEffect } from "react";
import api from '../../service/api';
import "../../styles/informasi.css";


const EventsPage = () => {
  const [eventsList, setEventsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = '/events';
      if (searchTerm) {
        url = `/events/search?keyword=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await api.get(url);
      setEventsList(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data event");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length <= maxLength
      ? text
      : `${text.substring(0, maxLength)}...`;
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setShowModal(false);
    document.body.classList.remove("modal-open");
  };

  if (loading && eventsList.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat artikel...</p>
      </div>
    );
  }

  return (
    <div className="informasi-page">
      <div className="page-header-container">
        <div className="page-header">
          <h1>Informasi Pengelolaan Sampah</h1>
          <p>Temukan tips, ide daur ulang, dan cara sederhana menjaga bumi dari rumahmu.</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError("")}>&times;</button>
        </div>
      )}

      <div className="tools-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            className="search-button"
            onClick={() => fetchEvents()}
          >
            <i className="search-icon">🔍</i>
          </button>
        </div>
        
        {/* <button 
          className="btn-add"
          onClick={() => setShowAddForm(true)}
        >
          + Tambah Event
        </button> */}
      </div>

      <main className="list-container">
        {eventsList && eventsList.length > 0 ? (
          eventsList.map((event) => (
            event && (
              <article key={event.id} className="article-card">
                <div className="article-info">
                  <a
                    href="#"
                    className="title-link"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(event);
                    }}
                  >
                    <h2>{event.title}</h2>
                  </a>
                  <p className="excerpt">
                    {truncateText(event.preview_text || event.description || "", 160)}
                  </p>
                  <span className="date">
                    {event.event_date ? formatDate(event.event_date) : ""}
                  </span>
                </div>

                <img
                  src={`/images/${event.thumbnail_name || "default.jpg"}`}
                  alt={event.title}
                  className="thumbnail"
                />
              </article>
            )
          ))
        ) : (
          <div className="no-data">
            <p>
              {searchTerm
                ? `Tidak ditemukan artikel dengan kata kunci "${searchTerm}"`
                : "Belum ada artikel tersedia"}
            </p>
          </div>
        )}
      </main>


      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="modal-body article-modal-body">
              <img
                src={`/images/${selectedEvent.thumbnail_name || "default.jpg"}`}
                className="modal-thumbnail"
              />

            <div className="modal-text">
              <p>{selectedEvent.description}</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
      {/* <div className="informasi-grid">
        {eventsList.length === 0 ? (
          <div className="no-data">
            <p>{searchTerm ? `Tidak ditemukan event dengan kata kunci "${searchTerm}"` : "Belum ada event tersedia"}</p>
          </div>
        ) : (
          eventsList.map((event) => (
            <div key={event.id} className="info-card">
              <div className="card-header">
                <h3 className="card-title">{event.title}</h3>
                <div className="card-meta">
                  <span className="card-date">
                    {formatDate(event.event_date)}
                  </span>
                  <span className="card-location">
                    📍 {truncateText(event.location_address, 40)}
                  </span>
                </div>
              </div> */}

//               <div className="card-content">
//                 <p className="card-preview">{truncateText(event.description)}</p>
//               </div>

//               <div className="card-footer">
//                 <div className="footer-content">
//                   <div className="card-organizer">
//                     <span>Penyelenggara: {event.organizer_name || 'Tidak diketahui'}</span>
//                   </div>
//                   <button 
//                     className="btn-detail" 
//                     onClick={() => openModal(event)}
//                   >
//                     Lihat Detail
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {showAddForm && (
//         <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
//           <div className="modal-content add-form-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Tambah Event Baru</h2>
//               <button className="modal-close" onClick={() => setShowAddForm(false)}>
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="add-form">
//               <div className="form-group">
//                 <label htmlFor="title">Judul Event *</label>
//                 <input
//                   type="text"
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Masukkan judul event"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="event_date">Tanggal Event *</label>
//                 <input
//                   type="datetime-local"
//                   id="event_date"
//                   name="event_date"
//                   value={formData.event_date}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="location_address">Alamat Lokasi *</label>
//                 <textarea
//                   id="location_address"
//                   name="location_address"
//                   value={formData.location_address}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Masukkan alamat lengkap lokasi event"
//                   rows="3"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="description">Deskripsi *</label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Tulis deskripsi lengkap event..."
//                   rows="5"
//                 />
//               </div>

//               <div className="form-actions">
//                 <button
//                   type="button"
//                   className="btn-cancel"
//                   onClick={() => setShowAddForm(false)}
//                 >
//                   Batal
//                 </button>
//                 <button
//                   type="submit"
//                   className="btn-submit"
//                   disabled={loading}
//                 >
//                   {loading ? "Menyimpan..." : "Simpan Event"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showModal && selectedEvent && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>{selectedEvent.title}</h2>
//               <button className="modal-close" onClick={closeModal}>
//                 &times;
//               </button>
//             </div>

//             <div className="modal-body">
//               <div className="modal-meta">
//                 <div className="meta-item">
//                   <strong>Penyelenggara:</strong>
//                   <div className="organizer-info">
//                     <span>{selectedEvent.organizer_name || 'Tidak diketahui'}</span>
//                     {selectedEvent.organizer_email && <span>📧 {selectedEvent.organizer_email}</span>}
//                     {selectedEvent.organizer_phone && <span>📞 {selectedEvent.organizer_phone}</span>}
//                   </div>
//                 </div>

//                 <div className="meta-item">
//                   <strong>Waktu Pelaksanaan:</strong>
//                   <span>{formatDate(selectedEvent.event_date)}</span>
//                 </div>

//                 <div className="meta-item">
//                   <strong>Lokasi:</strong>
//                   <div className="location-address">
//                     {selectedEvent.location_address}
//                   </div>
//                 </div>

//                 <div className="meta-item">
//                   <strong>Dibuat pada:</strong>
//                   <span>{formatDate(selectedEvent.created_at)}</span>
//                 </div>
//               </div>

//               <div className="modal-section">
//                 <h3>Deskripsi Event</h3>
//                 <div className="modal-text">
//                   <p>{selectedEvent.description}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

export default EventsPage;