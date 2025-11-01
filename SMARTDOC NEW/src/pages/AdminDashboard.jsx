import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUsers, FiFileText, FiMessageSquare, FiThumbsUp } from "react-icons/fi";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [docSearch, setDocSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("all");
  const [chunkSearch, setChunkSearch] = useState("");
  const [chunkDocFilter, setChunkDocFilter] = useState("all");
  const [embeddingSearch, setEmbeddingSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchAdminData(token);
  }, [navigate]);

  const fetchAdminData = async (token) => {
    try {
      console.log("Fetching admin data with token:", token.substring(0, 20) + "...");
      
      const [statsRes, usersRes, docsRes, chunksRes, embeddingsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/admin/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/admin/chunks`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/api/admin/embeddings`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => ({ data: [] })),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDocuments(docsRes.data);
      setChunks(chunksRes.data);
      setEmbeddings(embeddingsRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
        navigate("/login");
      } else if (error.response?.status === 401) {
        alert("Session expired or invalid token. Please login again.");
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis will also delete all their documents and cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("jwt_token");
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from local state
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted successfully");
      
      // Refresh stats
      fetchAdminData(token);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteDocument = async (docId, docFilename) => {
    if (!window.confirm(`Are you sure you want to delete document: ${docFilename}?`)) {
      return;
    }

    const token = localStorage.getItem("jwt_token");
    try {
      await axios.delete(`${API_BASE}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from local state
      setDocuments(documents.filter(d => d.id !== docId));
      alert("Document deleted successfully");
      
      // Refresh stats
      fetchAdminData(token);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteChunk = async (chunkId) => {
    if (!window.confirm(`Are you sure you want to delete this chunk?`)) {
      return;
    }

    const token = localStorage.getItem("jwt_token");
    try {
      await axios.delete(`${API_BASE}/api/admin/chunks/${chunkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setChunks(chunks.filter(c => c.id !== chunkId));
      alert("Chunk deleted successfully");
      fetchAdminData(token);
    } catch (error) {
      console.error("Failed to delete chunk:", error);
      alert("Failed to delete chunk: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteEmbedding = async (embeddingId) => {
    if (!window.confirm(`Are you sure you want to delete this embedding?`)) {
      return;
    }

    const token = localStorage.getItem("jwt_token");
    try {
      await axios.delete(`${API_BASE}/api/admin/embeddings/${embeddingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setEmbeddings(embeddings.filter(e => e.id !== embeddingId));
      alert("Embedding deleted successfully");
      fetchAdminData(token);
    } catch (error) {
      console.error("Failed to delete embedding:", error);
      alert("Failed to delete embedding: " + (error.response?.data?.error || error.message));
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = !userSearch || 
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.id?.toString().includes(userSearch);
    
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !docSearch ||
      doc.filename?.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.id?.toString().includes(docSearch) ||
      doc.text_preview?.toLowerCase().includes(docSearch.toLowerCase());
    
    let matchesType = true;
    if (docTypeFilter !== "all") {
      const ext = doc.filename?.toLowerCase() || "";
      matchesType = ext.endsWith(`.${docTypeFilter.toLowerCase()}`);
    }
    
    return matchesSearch && matchesType;
  });

  // Filter chunks based on search and document
  const filteredChunks = chunks.filter(chunk => {
    const matchesSearch = !chunkSearch ||
      chunk.id?.toString().includes(chunkSearch) ||
      chunk.chunk_text?.toLowerCase().includes(chunkSearch.toLowerCase());
    
    const matchesDoc = chunkDocFilter === "all" || chunk.document_id?.toString() === chunkDocFilter;
    
    return matchesSearch && matchesDoc;
  });

  // Filter embeddings based on search
  const filteredEmbeddings = embeddings.filter(embedding => {
    const matchesSearch = !embeddingSearch ||
      embedding.id?.toString().includes(embeddingSearch) ||
      embedding.chunk_id?.toString().includes(embeddingSearch);
    
    return matchesSearch;
  });

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Prepare chart data
  const getFeedbackData = () => {
    if (!stats?.feedback_breakdown) return [];
    return [
      { name: 'Positive', value: stats.feedback_breakdown.positive, color: '#34d399' },
      { name: 'Negative', value: stats.feedback_breakdown.negative, color: '#f87171' }
    ];
  };

  const getUserRoleData = () => {
    if (!stats?.user_roles) return [];
    return [
      { name: 'Students', value: stats.user_roles.student, color: '#60a5fa' },
      { name: 'Admins', value: stats.user_roles.admin, color: '#f87171' }
    ];
  };

  const getDocumentTypeData = () => {
    if (!stats?.document_types) return [];
    return Object.entries(stats.document_types).map(([type, count], index) => ({
      name: type,
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          color: '#e5e7eb'
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: '4px 0 0', color: payload[0].color }}>
            {payload[0].value} {payload[0].dataKey === 'value' ? 'items' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0f14" }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: "#e5e7eb", marginTop: 16 }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Get unique document IDs for chunk filter
  const uniqueDocIds = [...new Set(chunks.map(c => c.document_id))].filter(Boolean);

  return (
    <div className="admin-dashboard">
      <div className="grok-bg"></div>
      <div className="grok-sweep"></div>
      <div className="welcome-orb orb1"></div>
      <div className="welcome-orb orb2"></div>

      <header className="admin-header">
        <div className="admin-brand">
          <h1>SmartDocQ Admin</h1>
          <p>System Management Dashboard</p>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="admin-content">
        <div className="admin-tabs">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>Analytics</button>
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
          <button className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>Documents</button>
          <button className={activeTab === "chunks" ? "active" : ""} onClick={() => setActiveTab("chunks")}>Chunks</button>
          <button className={activeTab === "embeddings" ? "active" : ""} onClick={() => setActiveTab("embeddings")}>Embeddings</button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <FiUsers className="stat-icon" />
                <div className="stat-info">
                  <h3>{stats?.total_users || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <FiFileText className="stat-icon" />
                <div className="stat-info">
                  <h3>{stats?.total_documents || 0}</h3>
                  <p>Total Documents</p>
                </div>
              </div>
              <div className="stat-card">
                <FiMessageSquare className="stat-icon" />
                <div className="stat-info">
                  <h3>{stats?.total_messages || 0}</h3>
                  <p>Total Messages</p>
                </div>
              </div>
              <div className="stat-card">
                <FiThumbsUp className="stat-icon" />
                <div className="stat-info">
                  <h3>{stats?.total_feedback || 0}</h3>
                  <p>Total Feedback</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>User Roles Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getUserRoleData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getUserRoleData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Document Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getDocumentTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getDocumentTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Feedback Sentiment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getFeedbackData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getFeedbackData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-section">
            <div className="chart-card full-width">
              <h3>Activity Timeline (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stats?.activity_timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="documents" stroke="#60a5fa" strokeWidth={2} name="Documents Uploaded" />
                  <Line type="monotone" dataKey="messages" stroke="#34d399" strokeWidth={2} name="Messages Sent" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card full-width">
              <h3>Document Types Breakdown</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getDocumentTypeData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {getDocumentTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="data-table">
            <div className="table-header">
              <h2>All Users ({filteredUsers.length})</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search users by name, email, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        No users found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name || "N/A"}</td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                        <td>{user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="action-btn delete-btn-small"
                            disabled={user.role === 'admin'}
                            title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="data-table">
            <div className="table-header">
              <h2>All Documents ({filteredDocuments.length})</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search documents by filename, ID, or content..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">Word</option>
                  <option value="txt">Text</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Filename</th>
                    <th>User ID</th>
                    <th>Preview</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        No documents found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td>{doc.filename}</td>
                        <td>{doc.user_id || "N/A"}</td>
                        <td className="preview-cell">{doc.text_preview}...</td>
                        <td>{doc.created_at ? new Date(doc.created_at).toLocaleString() : "N/A"}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                            className="action-btn delete-btn-small"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "chunks" && (
          <div className="data-table">
            <div className="table-header">
              <h2>All Chunks ({filteredChunks.length})</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search chunks by ID or text..."
                  value={chunkSearch}
                  onChange={(e) => setChunkSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  value={chunkDocFilter}
                  onChange={(e) => setChunkDocFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Documents</option>
                  {uniqueDocIds.map(docId => (
                    <option key={docId} value={docId}>Doc ID: {docId}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Chunk ID</th>
                    <th>Document ID</th>
                    <th>Chunk Index</th>
                    <th>Chunk Text</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChunks.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        No chunks found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredChunks.map((chunk) => (
                      <tr key={chunk.id}>
                        <td>{chunk.id}</td>
                        <td>{chunk.document_id || "N/A"}</td>
                        <td>{chunk.chunk_index !== undefined ? chunk.chunk_index : "N/A"}</td>
                        <td className="preview-cell" title={chunk.chunk_text}>
                          {chunk.chunk_text?.substring(0, 100)}...
                        </td>
                        <td>{chunk.created_at ? new Date(chunk.created_at).toLocaleString() : "N/A"}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteChunk(chunk.id)}
                            className="action-btn delete-btn-small"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "embeddings" && (
          <div className="data-table">
            <div className="table-header">
              <h2>All Embeddings ({filteredEmbeddings.length})</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search embeddings by ID or chunk ID..."
                  value={embeddingSearch}
                  onChange={(e) => setEmbeddingSearch(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Embedding ID</th>
                    <th>Chunk ID</th>
                    <th>Vector Dimensions</th>
                    <th>Vector Preview</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmbeddings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        No embeddings found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredEmbeddings.map((embedding) => {
                      const vectorArray = embedding.embedding_vector ? 
                        (typeof embedding.embedding_vector === 'string' ? 
                          JSON.parse(embedding.embedding_vector) : 
                          embedding.embedding_vector) : [];
                      const vectorLength = Array.isArray(vectorArray) ? vectorArray.length : 0;
                      const vectorPreview = Array.isArray(vectorArray) && vectorArray.length > 0 ?
                        `[${vectorArray.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]` : 
                        "N/A";
                      
                      return (
                        <tr key={embedding.id}>
                          <td>{embedding.id}</td>
                          <td>{embedding.chunk_id || "N/A"}</td>
                          <td>{vectorLength}</td>
                          <td className="preview-cell" title={`Vector with ${vectorLength} dimensions`}>
                            {vectorPreview}
                          </td>
                          <td>{embedding.created_at ? new Date(embedding.created_at).toLocaleString() : "N/A"}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteEmbedding(embedding.id)}
                              className="action-btn delete-btn-small"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #0b0f14;
          position: relative;
          padding: 20px;
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(148, 163, 184, 0.2);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          margin-bottom: 30px;
          backdrop-filter: blur(8px);
        }
        .admin-brand h1 {
          color: #e5e7eb;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
        }
        .admin-brand p {
          color: #94a3b8;
          font-size: 14px;
          margin: 4px 0 0;
        }
        .admin-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(148, 163, 184, 0.4);
        }
        .stat-icon {
          font-size: 36px;
          color: #60a5fa;
        }
        .stat-info h3 {
          color: #e5e7eb;
          font-size: 32px;
          font-weight: 700;
          margin: 0;
        }
        .stat-info p {
          color: #94a3b8;
          font-size: 14px;
          margin: 4px 0 0;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 24px;
          margin-bottom: 30px;
        }
        .chart-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(8px);
        }
        .chart-card.full-width {
          grid-column: 1 / -1;
        }
        .chart-card h3 {
          color: #e5e7eb;
          margin: 0 0 20px;
          font-size: 18px;
          font-weight: 600;
        }
        .analytics-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .admin-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .admin-tabs button {
          padding: 12px 24px;
          background: rgba(148, 163, 184, 0.12);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          color: #cbd5e1;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .admin-tabs button:hover {
          background: rgba(148, 163, 184, 0.18);
          transform: translateY(-2px);
        }
        .admin-tabs button.active {
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          border-color: transparent;
          color: #fff;
        }
        .data-table {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(8px);
        }
        .data-table h2 {
          color: #e5e7eb;
          margin: 0 0 20px;
          font-size: 22px;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .table-header h2 {
          margin: 0;
        }
        .table-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .search-input {
          min-width: 280px;
          padding: 10px 16px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.6);
          color: #e5e7eb;
          font-size: 14px;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #60a5fa;
          background: rgba(2, 6, 23, 0.8);
        }
        .search-input::placeholder {
          color: #64748b;
        }
        .filter-select {
          padding: 10px 16px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.6);
          color: #e5e7eb;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-select:focus {
          outline: none;
          border-color: #60a5fa;
          background: rgba(2, 6, 23, 0.8);
        }
        .action-btn {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delete-btn-small {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }
        .delete-btn-small:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.25);
          transform: translateY(-1px);
        }
        .delete-btn-small:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }
        th {
          color: #cbd5e1;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
        }
        td {
          color: #94a3b8;
          font-size: 14px;
        }
        .role-badge {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }
        .role-badge.admin {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        .role-badge.student {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
        }
        .preview-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .logout-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #fecaca;
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
        .table-wrapper {
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
