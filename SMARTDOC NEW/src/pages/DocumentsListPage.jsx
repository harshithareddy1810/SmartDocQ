 
// import React from "react";
// import { useNavigate } from "react-router-dom";

// function DocumentsPage() {
//   const navigate = useNavigate();
//   const docs = JSON.parse(localStorage.getItem("uploadedDocs")) || [];

//   const handleDelete = (id) => {
//     const updatedDocs = docs.filter((doc) => doc.id !== id);
//     localStorage.setItem("uploadedDocs", JSON.stringify(updatedDocs));
//     window.location.reload();
//   };

//   return (
//     <div className="documents-container">
//       <h1 className="documents-title">📂 Uploaded Documents</h1>

//       {docs.length === 0 ? (
//         <p className="no-docs">No documents uploaded yet.</p>
//       ) : (
//         <div className="documents-grid">
//           {docs.map((doc) => (
//             <div key={doc.id} className="document-card">
//               <div>
//                 <p className="document-name">{doc.name}</p>
//                 <p className="document-meta">
//                   {new Date(doc.date).toLocaleString()} • {doc.type}
//                 </p>
//                 {doc.content && (
//       <p className="document-preview">
//         {doc.content.slice(0, 100)}...
//       </p>
//     )}
//               </div>

//               <div className="document-actions">
//                 <button
//                   className="view-btn"
//                   onClick={() =>
//                     navigate(`/qa/${doc.id}`, { state: { id: doc.id } })
//                   }
//                 >
//                   View
//                 </button>
//                 <button
//                   className="delete-btn"
//                   onClick={() => handleDelete(doc.id)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <button className="back-btn" onClick={() => navigate("/upload")}>
//         ⬅ Back to Upload
//       </button>
//     </div>
//   );
// }

// export default DocumentsPage;
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get((import.meta.env.VITE_API_BASE || "http://localhost:8080") + "/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDocs(res.data))
      .catch((err) => {
        // Do not force redirect on transient errors
        setError("Failed to load documents");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete((import.meta.env.VITE_API_BASE || "http://localhost:8080") + `/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError("Failed to delete document");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const token = localStorage.getItem("jwt_token");
    if (!token) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((id) =>
          axios.delete((import.meta.env.VITE_API_BASE || "http://localhost:8080") + `/api/documents/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setDocs((prev) => prev.filter((d) => !selected.has(d.id)));
      setSelected(new Set());
    } catch {
      setError("Failed to delete some documents");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Note: selection status is computed inline after visibleDocs is defined

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = q
      ? docs.filter((d) => {
          const name = (d.filename || "").toLowerCase();
          const text = (d.text || "").toLowerCase();
          return name.includes(q) || text.includes(q);
        })
      : docs.slice();

    arr.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      switch (sortBy) {
        case "name_asc":
          return (a.filename || "").localeCompare(b.filename || "");
        case "name_desc":
          return (b.filename || "").localeCompare(a.filename || "");
        case "date_asc":
          return da - db;
        case "date_desc":
        default:
          return db - da;
      }
    });
    return arr;
  }, [docs, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const visibleDocs = filteredDocs.slice(start, end);

  const toggleSelectAllVisible = () => {
    const allSelected = visibleDocs.every((d) => selected.has(d.id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleDocs.forEach((d) => next.delete(d.id));
      } else {
        visibleDocs.forEach((d) => next.add(d.id));
      }
      return next;
    });
  };

  return (
    <div className="documents-container" style={{ position: 'relative', zIndex: 0 }}>
      <div className="grok-bg"></div>
      <div className="grok-sweep"></div>
      <div className="welcome-orb orb1"></div>
      <div className="welcome-orb orb2"></div>
      <div className="grok-title">SmartDocQ</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div className="brand-logo" style={{ color:'#f1f5f9', fontWeight:800, fontSize:24, letterSpacing:-0.5 }}>SmartDocQ</div>
          <div className="brand-tagline" style={{ color:'#94a3b8', fontSize:12, marginTop:-2 }}>AI-Powered Document Intelligence</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="view-btn subtle" onClick={() => navigate('/upload')}>Upload New</button>
          <button className="view-btn subtle" onClick={() => window.location.reload()}>Refresh</button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(148, 163, 184, 0.20)',
        borderRadius: 16,
        padding: 16,
        backdropFilter: 'blur(8px)',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by name or content..."
            style={{
              flex: 1,
              minWidth: 240,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'rgba(2,6,23,0.6)',
              color: '#e5e7eb'
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'rgba(2,6,23,0.6)',
              color: '#e5e7eb'
            }}
          >
            <option value="date_desc">Newest</option>
            <option value="date_asc">Oldest</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
          <button className="delete-btn" disabled={selected.size === 0} onClick={handleBulkDelete}>
            Delete Selected ({selected.size})
          </button>
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : filteredDocs.length === 0 ? (
        <p className="no-docs">No matching documents.</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
              <input type="checkbox" onChange={toggleSelectAllVisible} checked={visibleDocs.length > 0 && visibleDocs.every(d => selected.has(d.id))} />
              Select page ({visibleDocs.length})
            </label>
          </div>

          <div className="documents-grid">
            {visibleDocs.map((doc) => (
              <div key={doc.id} className="document-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleSelect(doc.id)} />
                    <div>
                      <p className="document-name">{doc.filename}</p>
                      <p className="document-meta">{doc.created_at ? new Date(doc.created_at).toLocaleString() : ""}</p>
                    </div>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>#{doc.id}</span>
                </div>

                {doc.text && (
                  <div className="document-preview" style={{ marginTop: 10 }}>{doc.text.slice(0, 160)}...</div>
                )}

                <div className="document-actions">
                  <button className="view-btn subtle" onClick={() => navigate(`/qa/${doc.id}`)}>Open</button>
                  <button className="view-btn subtle" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/qa/${doc.id}`)}>Copy Link</button>
                  <button className="delete-btn subtle-danger" onClick={() => handleDelete(doc.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>
              Showing {start + 1}-{Math.min(end, filteredDocs.length)} of {filteredDocs.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(2,6,23,0.6)',
                  color: '#e5e7eb'
                }}
              >
                <option value={6}>6 / page</option>
                <option value={8}>8 / page</option>
                <option value={12}>12 / page</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="view-btn subtle" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                <button className="view-btn subtle" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
          </div>
          </div>
        </>
      )}



      <style>{`
        .documents-container { min-height: 100vh; padding: 40px 50px; position: relative; z-index: 0; }
        .documents-container .grok-title { z-index: -1; color: rgba(226,232,240,0.09); text-shadow: 0 0 28px rgba(148,163,184,0.35), 0 0 80px rgba(99,102,241,0.28); }
        .documents-title { text-align: left; font-size: 1.6rem; font-weight: 700; margin-bottom: 12px; }
        .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .document-card { background: rgba(15, 23, 42, 0.9); color: #e5e7eb; padding: 20px; border-radius: 16px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); border: 1px solid rgba(148,163,184,0.2); }
        .document-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.45); }
        .document-name { font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; word-wrap: break-word; }
        .document-meta { font-size: 0.88rem; color: #94a3b8; }
        .document-actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 14px; }
        .view-btn { background-color: #334155; color: #e5e7eb; border: 1px solid rgba(148,163,184,0.25); padding: 10px 12px; border-radius: 10px; cursor: pointer; font-size: 0.95rem; transition: background .2s, border-color .2s, transform .1s; }
        .view-btn:hover { background-color: #3b475c; border-color: rgba(148,163,184,0.35); transform: translateY(-1px); }
        .view-btn.subtle { background-color: rgba(148,163,184,0.12); border-color: rgba(148,163,184,0.2); }
        .view-btn.subtle:hover { background-color: rgba(148,163,184,0.18); }
        .delete-btn { background-color: rgba(239,68,68,0.18); color: #fecaca; border: 1px solid rgba(239,68,68,0.25); padding: 10px 12px; border-radius: 10px; cursor: pointer; font-size: 0.95rem; transition: background .2s, border-color .2s, transform .1s; }
        .delete-btn:hover { background-color: rgba(239,68,68,0.28); border-color: rgba(239,68,68,0.35); transform: translateY(-1px); }
        .delete-btn.subtle-danger { background-color: rgba(239,68,68,0.12); color: #fecaca; border-color: rgba(239,68,68,0.2); }
        .logout-btn { background: rgba(239,68,68,0.15); color: #fecaca; border: 1px solid rgba(239,68,68,0.25); padding: 10px 16px; border-radius: 10px; cursor: pointer; }
        .back-btn { margin-top: 28px; padding: 12px 20px; background: #7c3aed; color: white; border: none; border-radius: 9999px; cursor: pointer; font-size: 1rem; display: block; margin-left: auto; margin-right: auto; }
      `}</style>
    </div>
  );
}

export default DocumentsPage;