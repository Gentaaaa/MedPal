import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = import.meta.env.VITE_API_BASE_URL;

export default function UploadDocuments() {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/documents/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e dokumenteve:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setMessage("❗ Titulli dhe dokumenti janë të detyrueshëm.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ Dokumenti u ngarkua me sukses!");
      setTitle("");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error("❌ Gabim gjatë ngarkimit:", err);
      setMessage("❌ Dështoi ngarkimi i dokumentit.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë dokument?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDocuments();
    } catch (err) {
      console.error("❌ Gabim gjatë fshirjes:", err);
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/api/documents/${editingDoc._id}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error("❌ Gabim gjatë editimit:", err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">📎 Ngarko Dokumente Mjekësore</h2>

      {message && (
        <div
          className={`alert ${
            message.startsWith("✅") ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleUpload} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Titulli i dokumentit</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="P.sh. Analizat e gjakut"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Zgjidh dokumentin</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.jpg,.png,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          📤 Ngarko Dokumentin
        </button>
      </form>

      <h4 className="mb-3">🗂️ Dokumentet e ngarkuara</h4>
      {documents.length === 0 ? (
        <div className="alert alert-info">S’keni ngarkuar ende asnjë dokument.</div>
      ) : (
        <ul className="list-group">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{doc.title}</span>
              <div className="btn-group">
                <a
                  href={`${API}${doc.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-success"
                >
                  Shiko
                </a>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(doc)}
                >
                  Edito
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(doc._id)}
                >
                  Fshi
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingDoc && (
        <div className="mt-4 card p-3 border">
          <h5>Edito titullin</h5>
          <input
            type="text"
            className="form-control mb-2"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={handleEditSubmit}>
              Ruaj
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setEditingDoc(null)}
            >
              Anulo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
