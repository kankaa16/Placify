import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Award } from "lucide-react";
import "./Certifications.css";

const emptyForm = {
  name: "",
  issuer: "",
  issueDate: "",
  expiryDate: "",
  type: "Course",
  credentialId: "",
  credentialUrl: "",
  verificationStatus: "Self-Reported",
  skills: [],
  isPublic: true
};

const Certifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pdfPreview, setPdfPreview] = useState("");

  const headers = useMemo(() => ({
    // axios Authorization header is already set globally by AuthContext when logged in
  }), []);

  // Build absolute URL for files served from backend /uploads
  const apiBase = (axios.defaults.baseURL || "http://localhost:5000/api");
  const fileBase = apiBase.replace(/\/api$/, "");
  const makeFileUrl = (p) => (p ? `${fileBase}${p}` : "");
  const normalizeUrl = (u) => {
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/certifications", { headers });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const addSkill = () => {
    const v = form.__skillInput?.trim();
    if (!v) return;
    setForm((f) => ({ ...f, skills: [...f.skills, v], __skillInput: "" }));
  };

  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const save = async () => {
    try {
      setSaving(true);
      const payload = { ...form };
      if (!payload.name) return;
      if (payload.issueDate) payload.issueDate = new Date(payload.issueDate);
      if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate);
      const { data } = await axios.post("/certifications", payload, { headers });
      setItems((arr) => [data, ...arr]);
      setShowModal(false);
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`/certifications/${id}`);
      setItems((arr) => arr.filter((x) => x._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = async (url) => {
    if (!url) return;
    try { await navigator.clipboard.writeText(url); } catch {}
  };

  return (
    <div className="cert-page">
      <div className="cert-header">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className="icon-box icon-yellow" style={{width:36,height:36,display:'grid',placeItems:'center',borderRadius:12,background:'#2d1d52',color:'#e9d5ff',border:'1px solid #3a2a60'}}>
            <Award size={18} />
          </div>
          <div className="cert-title">Licenses & Certifications</div>
        </div>
        <button className="btn primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>Add Certification</button>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card">No certifications yet. Click "Add Certification" to create one.</div>
      ) : (
        items.map((c) => (
          <div key={c._id} className="card">
            <div className="card-head">
              <div>
                <div style={{fontWeight:700,fontSize:18}}>{c.name}</div>
                <div style={{color:'#94a3b8'}}>{c.issuer}</div>
                <div className="badges">
                  <span className="badge">{c.verificationStatus || 'Self-Reported'}</span>
                  {c.expiryDate && (
                    <span className="badge">Expires in {Math.max(0, Math.ceil((new Date(c.expiryDate) - Date.now())/ (1000*60*60*24)))}d</span>
                  )}
                  <span className="badge">{c.isPublic ? 'Public' : 'Private'}</span>
                  {c.type && <span className="badge">{c.type}</span>}
                </div>
              </div>
              <div className="actions">
                {/* Edit can be added later */}
                <button className="btn danger" onClick={() => del(c._id)}>Delete</button>
              </div>
            </div>

            <div className="row">
              <div>
                <div className="label">Issued</div>
                <div className="value">{c.issueDate ? format(new Date(c.issueDate), "yyyy-MM-dd") : "—"}</div>
              </div>
              <div>
                <div className="label">Expires</div>
                <div className="value">{c.expiryDate ? format(new Date(c.expiryDate), "yyyy-MM-dd") : "—"}</div>
              </div>
            </div>
            <div className="row" style={{marginTop:6}}>
              <div>
                <div className="label">Credential URL</div>
                <div className="value" style={{wordBreak:'break-all'}}>
                  {c.credentialUrl ? (
                    <a href={normalizeUrl(c.credentialUrl)} target="_blank" rel="noreferrer">{c.credentialUrl}</a>
                  ) : '—'}
                </div>
              </div>
              <div>
                <div className="label">Credential ID</div>
                <div className="value">{c.credentialId || '—'}</div>
              </div>
            </div>

            <div className="row" style={{marginTop:6}}>
              <div>
                <div className="label">Certificate File</div>
                <div className="value" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                  {c.filePath ? (
                    <>
                      <a className="btn" href={makeFileUrl(c.filePath)} download title="Download certificate">Download</a>
                      {String(c.filePath).match(/\.(png|jpg|jpeg)$/i) ? (
                        <img src={makeFileUrl(c.filePath)} alt="certificate" className="cert-thumb" />
                      ) : (
                        <button className="btn" onClick={()=> setPdfPreview(makeFileUrl(c.filePath))}>Preview</button>
                      )}
                    </>
                  ) : '—'}
                </div>
              </div>
            </div>

            <div className="divider" />
            <div className="label" style={{marginBottom:8}}>Skills</div>
            <div className="skills">
              {(c.skills || []).length ? c.skills.map((s, i) => <span className="skill" key={i}>{s}</span>) : <span className="value">No skills added</span>}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={(e)=>{ if(e.target.classList.contains('modal-backdrop')) setShowModal(false);}}>
          <div className="modal">
            <h3>Add certification</h3>
            <div className="form-grid">
              <div className="field full">
                <label>Certificate Name</label>
                <input name="name" className="input" placeholder="e.g. AWS Certified Solutions Architect" value={form.name} onChange={onChange} />
              </div>
              <div className="field full">
                <label>Issuing Organization</label>
                <input name="issuer" className="input" placeholder="e.g. Amazon Web Services" value={form.issuer} onChange={onChange} />
              </div>
              <div className="field">
                <label>Issue Date</label>
                <input type="date" name="issueDate" className="input" value={form.issueDate} onChange={onChange} />
              </div>
              <div className="field">
                <label>Expiry Date (optional)</label>
                <input type="date" name="expiryDate" className="input" value={form.expiryDate} onChange={onChange} />
              </div>
              <div className="field">
                <label>Type</label>
                <select name="type" className="select" value={form.type} onChange={onChange}>
                  <option>Course</option>
                  <option>Certification</option>
                  <option>Bootcamp</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Verification Status</label>
                <select name="verificationStatus" className="select" value={form.verificationStatus} onChange={onChange}>
                  <option>Self-Reported</option>
                  <option>Verified</option>
                </select>
              </div>
              <div className="field">
                <label>Credential/License ID</label>
                <input name="credentialId" className="input" placeholder="Optional" value={form.credentialId} onChange={onChange} />
              </div>
              <div className="field">
                <label>Credential URL</label>
                <input name="credentialUrl" className="input" placeholder="https://..." value={form.credentialUrl} onChange={onChange} />
              </div>
              <div className="field full">
                <label>Skills</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}>
                  <input className="input" placeholder="Type a skill and press Add" value={form.__skillInput || ''} onChange={(e)=> setForm(f=>({...f,__skillInput:e.target.value}))} />
                  <button className="btn" onClick={addSkill}>Add</button>
                </div>
                <div className="skills" style={{marginTop:8}}>
                  {form.skills.map((s,i)=> (
                    <span className="skill" key={i} onClick={()=>removeSkill(s)} title="Remove">{s} ✕</span>
                  ))}
                </div>
              </div>
              <div className="field full">
                <label>Upload Certificate (PDF or Image)</label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="file" accept=".pdf,image/*" onChange={async (e)=>{
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    setUploading(true);
                    try {
                      setUploadError("");
                      const { data } = await axios.post('/certifications/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                      setForm(f => ({ ...f, filePath: data.path }));
                    } catch(err) {
                      const msg = err?.response?.data?.error || err.message || 'Upload failed';
                      setUploadError(msg);
                      console.error(err);
                    }
                    finally { setUploading(false); }
                  }} />
                  {uploading && <span style={{color:'#94a3b8'}}>Uploading...</span>}
                  {uploadError && <span style={{color:'#f87171'}}>{uploadError}</span>}
                  {form.filePath && (
                    <>
                      <a className="btn" href={makeFileUrl(form.filePath)} target="_blank" rel="noreferrer">Preview</a>
                      {String(form.filePath).match(/\.(png|jpg|jpeg)$/i) && (
                        <img src={makeFileUrl(form.filePath)} alt="preview" className="cert-thumb" />
                      )}
                    </>
                  )}
                </div>
                <div style={{marginTop:6,color:'#94a3b8',fontSize:12}}>Max file size: 2 MB. Allowed types: PDF, PNG, JPG.</div>
              </div>
              <div className="field full switch">
                <input id="vis" type="checkbox" name="isPublic" checked={!!form.isPublic} onChange={onChange} />
                <label htmlFor="vis">Public visibility</label>
              </div>
            </div>
            <div className="footer">
              <button className="btn" onClick={()=> setShowModal(false)}>Cancel</button>
              <button className="btn primary" disabled={saving || !form.name} onClick={save}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {pdfPreview && (
        <div className="preview-backdrop" onClick={(e)=>{ if(e.target.classList.contains('preview-backdrop')) setPdfPreview(""); }}>
          <div className="preview">
            <div className="preview-header">
              <div style={{color:'#e2e8f0'}}>Certificate Preview</div>
              <div style={{display:'flex',gap:8}}>
                <a className="btn" href={pdfPreview} download>Download</a>
                <button className="btn" onClick={()=> setPdfPreview("")}>Close</button>
              </div>
            </div>
            <div className="preview-body">
              <iframe className="preview-iframe" src={pdfPreview} title="certificate-preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certifications;
