
import React, { useState, useContext } from 'react';
import { isPesoLike } from '../utils/mascotaUtils';
import MediaGalleryModal from './MediaGalleryModal';
import { getRefugiosByEmpresa } from '../api/refugiosApi';
import { registrarMascota } from '../api/petsApi';
import { getApiBase } from '../api/apiBase';
import { buildMediaUrl } from '../utils/mediaUtils';
import { AuthContext } from '../context/AuthContext';


const ESPECIES = [
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' },
  { value: 'Tortuga', label: 'Tortuga' },
  { value: 'Hurón', label: 'Hurón' },
  { value: 'Conejo', label: 'Conejo' },
  { value: 'Ave', label: 'Ave' },
  { value: 'Otro', label: 'Otro' },
];

const TAMAÑOS = [
  { value: 'Pequeño', label: 'Pequeño (≤20cm)' },
  { value: 'Mediano', label: 'Mediano (21–40cm)' },
  { value: 'Grande', label: 'Grande (>40cm)' },
];

const inputStyle = {
  borderRadius: 12,
  border: '2px solid #F29C6B',
  padding: '8px 16px',
  fontSize: 16,
  outline: 'none',
  marginBottom: 4,
};

// Estados para mensajes de éxito y error deben ir dentro del componente principal

const buttonStyle = {
  borderRadius: 18,
  border: 'none',
  padding: '10px 24px',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer',
};

export default function MascotaRegistroModal({ open, onClose, onRegister, isEdit = false, initialData = null }) {
  const { user } = useContext(AuthContext) || {};
  const [refugioId, setRefugioId] = useState('');
  const [refugios, setRefugios] = useState([]);

  React.useEffect(() => {
    async function fetchRefugios() {
      if (user?.perfil?.tipoPerfil === 'EMPRESA' && user?.perfil?.id) {
        try {
          const refugiosBackend = await getRefugiosByEmpresa(user.perfil.id);
          setRefugios(Array.isArray(refugiosBackend) ? refugiosBackend : []);
        } catch (err) {
          setRefugios([]);
        }
      } else {
        setRefugios([]);
      }
    }
    fetchRefugios();
  }, [user, open]);
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [tamaño, setTamaño] = useState('');
  const [peso, setPeso] = useState('');
  const [vacunas, setVacunas] = useState([]);
  const [vacunaInput, setVacunaInput] = useState('');
  const [esterilizado, setEsterilizado] = useState('');
  const [enfermedades, setEnfermedades] = useState([]);
  const [enfermedadInput, setEnfermedadInput] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [ubicacion, setUbicacion] = useState('');
  const [chip, setChip] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);

  // Handler to delete a media item by index: removes from saved existingMedia or from previews/files
  const handleDelete = (idx) => {
    if (idx < (existingMedia || []).length) {
      const newExisting = [...(existingMedia || [])];
      newExisting.splice(idx, 1);
      setExistingMedia(newExisting);
    } else {
      const previewIdx = idx - (existingMedia || []).length;
      const newPreviews = [...mediaPreviews];
      newPreviews.splice(previewIdx, 1);
      setMediaPreviews(newPreviews);
      const newFiles = [...mediaFiles];
      newFiles.splice(previewIdx, 1);
      setMediaFiles(newFiles);
    }
    if (((existingMedia || []).length + mediaPreviews.length - 1) <= 0) setGalleryOpen(false);
  };
  

  

  // Prefill when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      setNombre(initialData.nombre || '');
      setEspecie(initialData.especie || '');
      setRaza(initialData.raza || '');
      // Ensure date is formatted as yyyy-MM-dd for the date input
      const fmtDate = (d) => {
        if (!d && d !== 0) return '';
        try {
          // If number, treat as timestamp (ms or s)
          if (typeof d === 'number') {
            const maybeMs = String(d).length > 10 ? d : d * 1000;
            const dd = new Date(maybeMs);
            if (isNaN(dd.getTime())) return '';
            const yyyy = dd.getFullYear();
            const mm = String(dd.getMonth() + 1).padStart(2, '0');
            const day = String(dd.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${day}`;
          }
          if (typeof d === 'string') {
            const s = d.trim();
            // ISO-like: 2025-10-01 or with time
            if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
              const dd = new Date(s);
              if (!isNaN(dd.getTime())) {
                const yyyy = dd.getFullYear();
                const mm = String(dd.getMonth() + 1).padStart(2, '0');
                const day = String(dd.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${day}`;
              }
            }
            // dd/mm/yyyy or d/m/yyyy
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
              const parts = s.split('/');
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2];
              return `${year}-${month}-${day}`;
            }
            // dd-mm-yyyy
            if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
              const parts = s.split('-');
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2];
              return `${year}-${month}-${day}`;
            }
            // Pure digits: timestamp
            if (/^\d+$/.test(s)) {
              const n = Number(s);
              const maybeMs = String(s).length > 10 ? n : n * 1000;
              const dd = new Date(maybeMs);
              if (!isNaN(dd.getTime())) {
                const yyyy = dd.getFullYear();
                const mm = String(dd.getMonth() + 1).padStart(2, '0');
                const day = String(dd.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${day}`;
              }
            }
            // Fallback to Date parse
            const dd = new Date(s);
            if (!isNaN(dd.getTime())) {
              const yyyy = dd.getFullYear();
              const mm = String(dd.getMonth() + 1).padStart(2, '0');
              const day = String(dd.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${day}`;
            }
          }
          return '';
        } catch (err) {
          return '';
        }
      };
  
      // Try to parse stored birthdate; if missing but edad exists, compute an approximate birthdate
      const parsed = fmtDate(initialData.fechaNacimiento);
      if (parsed) {
        setFechaNacimiento(parsed);
      } else if (initialData && (initialData.edad !== undefined && initialData.edad !== null)) {
        // compute approximate birth year using edad (years)
        const edadNum = Number(initialData.edad) || 0;
        if (edadNum > 0) {
          const today = new Date();
          const yyyy = today.getFullYear() - edadNum;
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          setFechaNacimiento(`${yyyy}-${mm}-${dd}`);
        } else {
          setFechaNacimiento('');
        }
      } else {
        setFechaNacimiento('');
      }
      setSexo(initialData.sexo || '');
      // Normalize tamaño: accept different keys and partial values returned by backend
      const rawTam = initialData.tamaño || initialData.tamanio || initialData.size || initialData.tamano || '';
      let normalizedTam = '';
      if (rawTam) {
        const s = String(rawTam).toLowerCase();
        if (s.includes('peque')) normalizedTam = 'Pequeño';
        else if (s.includes('med') || s.includes('medio')) normalizedTam = 'Mediano';
        else if (s.includes('grand')) normalizedTam = 'Grande';
        else normalizedTam = rawTam; // fallback to raw value if it matches exactly one option
      }
      // Prefer normalized categorical tamaño; if backend sent a numeric peso, put it in `peso` state instead
      const candidate = normalizedTam || rawTam || initialData?.tamanio || initialData?.tamano || initialData?.tamano || initialData?.peso || initialData?.pesoKg || '';
      if (candidate && isPesoLike(candidate)) {
        setPeso(candidate);
        setTamaño('');
      } else {
        setPeso('');
        setTamaño(candidate || '');
      }
      setVacunas(Array.isArray(initialData.vacunas) ? initialData.vacunas : (initialData.vacunas ? initialData.vacunas.split(',') : []));
      setEsterilizado(initialData.esterilizado ? 'Sí' : 'No');
      setEnfermedades(Array.isArray(initialData.enfermedades) ? initialData.enfermedades : (initialData.enfermedades ? initialData.enfermedades.split(',') : []));
      setDocumentos(Array.isArray(initialData.documentos) ? initialData.documentos : (initialData.documentos ? initialData.documentos.split(',') : []));
      setDescripcion(initialData.descripcion || '');
      setUbicacion(initialData.ubicacion || '');
      setChip(initialData.chip || '');
      // preview main image
      if (initialData.foto || initialData.imagenUrl) {
        // use full URL if needed (backend returns relative paths like /uploads/..)
        const API_BASE = getApiBase('PETS');
        const img = initialData.foto || initialData.imagenUrl;
        // prefer proxy-mapped URL to avoid adblocker patterns
        const previewUrl = (typeof img === 'string') ? (img.startsWith('http') ? img : `${API_BASE}/api/media/${(img.startsWith('/uploads/') ? img.substring('/uploads/'.length) : img.replace(/^\/+/, ''))}`) : img;
        setPreview(previewUrl);
      }
      // existing media
      setExistingMedia(Array.isArray(initialData.media) ? initialData.media : []);
    }
    if (!open && !isEdit) {
      // reset when closing register modal
      setNombre(''); setEspecie(''); setRaza(''); setFechaNacimiento(''); setSexo(''); setTamaño(''); setVacunas([]); setVacunaInput(''); setEsterilizado(''); setEnfermedades([]); setEnfermedadInput(''); setDocumentos([]); setDescripcion(''); setFoto(null); setPreview(null); setUbicacion(''); setChip(''); setMediaFiles([]); setMediaPreviews([]); setExistingMedia([]);
    }
  }, [isEdit, initialData, open]);

  // tamaño is optional (not required) — accept either tamaño or peso when present but don't force selection

  // For mobile browsers, enforce max date on input change
  const todayLocal = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const handleFechaNacimiento = e => {
    let value = e.target.value;
    if (value > todayLocal) value = todayLocal;
    setFechaNacimiento(value);
  };

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFoto = e => {
    // replaced by async compression routine below; kept for sync callers
    const file = e.target.files[0];
    if (!file) {
      setFoto(null);
      setPreview(null);
      return;
    }
    // compress / resize image before storing
    (async () => {
      try {
        const resized = await resizeImage(file, 1200, 0.8);
        setFoto(resized);
        try {
          // create object url for preview (reliable and fast)
          const previewUrl = URL.createObjectURL(resized);
          setPreview(previewUrl);
        } catch (err) {
          const reader = new FileReader();
          reader.onloadend = () => setPreview(reader.result);
          reader.readAsDataURL(resized);
        }
      } catch (err) {
        console.warn('Error al redimensionar imagen principal, usando original', err);
        setFoto(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    })();
  };

  const handleMediaFiles = e => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);
    const previews = files.map(f => {
      if (f.type && f.type.startsWith('video')) return { type: 'video', url: URL.createObjectURL(f) };
      return { type: 'image', url: URL.createObjectURL(f) };
    });
    setMediaPreviews(previews);
  };

  // Helper: resize/compress image File -> File (JPEG)
  const resizeImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      try {
        if (!file || !(file.type || '').startsWith('image')) return resolve(file);
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result; };
        reader.onerror = (e) => reject(e);
        img.onerror = (e) => reject(e);
        img.onload = () => {
          try {
            const ratio = img.width / img.height || 1;
            const width = Math.min(maxWidth, img.width);
            const height = Math.round(width / ratio);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('No se pudo convertir la imagen'));
              const ext = 'jpg';
              const name = (file.name && file.name.replace(/\.[^/.]+$/, `.${ext}`)) || `photo-${Date.now()}.${ext}`;
              const resizedFile = new File([blob], name, { type: 'image/jpeg' });
              resolve(resizedFile);
            }, 'image/jpeg', quality);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleDocumentos = e => {
    setDocumentos(Array.from(e.target.files));
  };

  const handleAddVacuna = () => {
    if (vacunaInput.trim()) {
      setVacunas([...vacunas, vacunaInput.trim()]);
      setVacunaInput('');
    }
  };

  const handleRemoveVacuna = idx => {
    setVacunas(vacunas.filter((_, i) => i !== idx));
  };

  const handleAddEnfermedad = () => {
    if (enfermedadInput.trim()) {
      setEnfermedades([...enfermedades, enfermedadInput.trim()]);
      setEnfermedadInput('');
    }
  };
  const handleRemoveEnfermedad = idx => {
    setEnfermedades(enfermedades.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validación básica
    const hoy = new Date();
    const fechaNacDate = new Date(fechaNacimiento);
    // Determine whether we have a main image: either a newly selected file or an existing preview (from initialData)
    const hasMainImage = (foto && foto.name) || preview;
    // fechaNacimiento is required when creating or when editing a mascota that doesn't already have a fecha
    const fechaRequerida = !isEdit || !initialData?.fechaNacimiento;
  // Allow either `tamaño` or `peso` to be present, but do not require them.
  // Make vacunas and esterilizado optional to avoid blocking edits; keep essential fields required.
  if (!nombre || !especie || (fechaRequerida && !fechaNacimiento) || !sexo || !descripcion || !hasMainImage || !ubicacion) {
      setErrorMsg('Completa todos los campos obligatorios.');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }
    // Comparar solo año, mes y día
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const nacSinHora = new Date(fechaNacDate.getFullYear(), fechaNacDate.getMonth(), fechaNacDate.getDate());
    if (isNaN(nacSinHora.getTime()) || nacSinHora > hoySinHora) {
      setErrorMsg('La fecha de nacimiento no puede ser futura.');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }

    try {
      // Subir imagen principal al backend
      let imagenUrl = '';
      if (foto && foto.name) {
        const formData = new FormData();
        formData.append('file', foto);
        const PETS_BASE = getApiBase('PETS');
        const uploadResp = await fetch(`${PETS_BASE}/api/mascotas/upload`, {
          method: 'POST',
          body: formData
        });
        if (!uploadResp.ok) {
          setErrorMsg('Error al subir la imagen.');
          setTimeout(() => setErrorMsg(''), 2500);
          return;
        }
        imagenUrl = await uploadResp.text();
      } else {
        // If editing and user didn't provide a new file, reuse existing URL from initialData (if present)
        if (isEdit && (initialData && (initialData.foto || initialData.imagenUrl))) {
          imagenUrl = initialData.foto || initialData.imagenUrl;
        } else {
          setErrorMsg('Debes seleccionar una imagen.');
          setTimeout(() => setErrorMsg(''), 2500);
          return;
        }
      }

      // Subir archivos adicionales (mediaFiles) y recolectar URLs
      const mediaUrls = [];
      for (const f of mediaFiles) {
        try {
          const PETS_BASE = getApiBase('PETS');
          let uploadFile = f;
          // compress images before upload to avoid 413 and reduce bandwidth
          if (f && f.type && f.type.startsWith('image')) {
            try {
              uploadFile = await resizeImage(f, 1200, 0.8);
            } catch (err) {
              console.warn('No se pudo redimensionar archivo adicional, se usará original', err);
              uploadFile = f;
            }
          }
          const fm = new FormData();
          fm.append('file', uploadFile);
          const resp = await fetch(`${PETS_BASE}/api/mascotas/upload`, { method: 'POST', body: fm });
          if (resp.ok) {
            const url = await resp.text();
            mediaUrls.push({ url, type: (uploadFile && uploadFile.type) ? uploadFile.type : f.type });
          }
        } catch (err) {
          // no bloquear todo si falla uno, pero notificar
          console.warn('No se pudo subir un archivo adicional', err);
        }
      }
      // Obtener propietarioId según estructura real del usuario
      let propietarioId = null;
      if (user) {
        if (typeof user.id !== 'undefined' && user.id !== null) {
          propietarioId = user.id;
        } else if (user.perfil && typeof user.perfil.id !== 'undefined' && user.perfil.id !== null) {
          propietarioId = user.perfil.id;
        } else if (user.usuario && typeof user.usuario.id !== 'undefined' && user.usuario.id !== null) {
          propietarioId = user.usuario.id;
        }
      }
      
      // Validar que tenemos un propietarioId válido
      if (!propietarioId) {
        setErrorMsg('Error: No se pudo obtener el ID del usuario. Por favor, vuelve a iniciar sesión.');
        setTimeout(() => setErrorMsg(''), 3000);
        console.error('User object:', user);
        return;
      }
      if (typeof propietarioId === 'string') {
        propietarioId = parseInt(propietarioId, 10);
      }
      if (!propietarioId || isNaN(propietarioId)) {
        setErrorMsg('No se pudo obtener el ID del usuario. Inicia sesión nuevamente.');
        setTimeout(() => setErrorMsg(''), 2500);
        return;
      }
      // Merge existing media (when editing) with newly uploaded, but dedupe by final URL
  const API_BASE = getApiBase('PETS');
      const canonicalize = (rawUrl) => {
        if (!rawUrl) return '';
        try {
          let u = rawUrl.trim();
          // If relative, prefix API_BASE
          if (!u.startsWith('http')) u = (u.startsWith('/') ? API_BASE + u : API_BASE + '/' + u.replace(/^\/+/, ''));
          // strip query and hash
          u = u.split('?')[0].split('#')[0];
          // remove trailing slash
          if (u.length > 1 && u.endsWith('/')) u = u.slice(0, -1);
          return u.toLowerCase();
        } catch (e) { return rawUrl; }
      };

      // Build a set of canonical URLs for newly uploaded media to avoid re-sending duplicates
      const uploadedCanonSet = new Set((mediaUrls || []).map(m => canonicalize(m.url)).filter(Boolean));
      const merged = [];
      const added = new Set();

      // First, include existing media that the user hasn't removed and that are NOT equal to any newly uploaded URL
      for (const m of (existingMedia || [])) {
        if (!m) continue;
        let rawUrl = typeof m === 'string' ? m : (m.url || m.path || m.src || '');
        const u = canonicalize(rawUrl);
        if (!u) continue;
        if (uploadedCanonSet.has(u)) {
          // skip: this existing entry is the same as a just-uploaded file
          continue;
        }
        if (added.has(u)) continue;
        added.add(u);
        merged.push({ url: u, type: (m && m.type) ? m.type : '' });
      }

      // Then append newly uploaded media (canonicalized)
      for (const m of (mediaUrls || [])) {
        if (!m) continue;
        const u = canonicalize(m.url || '');
        if (!u) continue;
        if (added.has(u)) continue;
        added.add(u);
        merged.push({ url: u, type: m.type || '' });
      }

      // Asegurar que media tenga el formato correcto (Map<String,String>)
      const mergedMedia = merged.map(m => ({
        url: String(m.url || ''),
        type: String(m.type || '')
      }));

      // Filtrar arrays para eliminar valores vacíos, undefined, null u objetos vacíos
      const cleanArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => {
          if (item === null || item === undefined || item === '') return false;
          if (typeof item === 'object' && Object.keys(item).length === 0) return false;
          if (typeof item === 'string' && item.trim() === '') return false;
          return true;
        });
      };

      const mascotaData = {
        nombre,
        especie,
        raza,
        fechaNacimiento: fechaNacimiento || (isEdit ? initialData?.fechaNacimiento : ''),
        sexo,
        tamaño: tamaño || '',
        vacunas: cleanArray(vacunas),
        esterilizado: esterilizado === 'Sí',
        enfermedades: cleanArray(enfermedades),
        documentos: cleanArray(documentos),
        descripcion,
        foto: imagenUrl,
        media: mergedMedia,
        ubicacion,
        chip: chip || '',
        propietarioId,
        refugioId: user?.perfil?.tipoPerfil === 'EMPRESA' && refugioId ? parseInt(refugioId) : undefined
      };
      
      console.log('Datos que se enviarán al backend:', JSON.stringify(mascotaData, null, 2));
      if (isEdit && initialData && initialData.id) {
        const API_BASE = getApiBase('PETS');
        const resp = await fetch(`${API_BASE}/api/mascotas/${initialData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mascotaData) });
        if (!resp.ok) throw new Error('Error al actualizar mascota');
        // try to read response json to get persisted mascota (controllers return RespuestaRegistro)
        try {
          const jr = await resp.json();
          if (jr && jr.success && jr.mascota) {
            const persisted = jr.mascota;
            // update existingMedia from persisted media if present
            const persistedMedia = Array.isArray(persisted.media) ? persisted.media : (persisted.mediaJson ? JSON.parse(persisted.mediaJson) : (persisted.imagenUrl ? [{ url: persisted.imagenUrl, type: 'image/*' }] : []));
            setExistingMedia(persistedMedia);
            // Clear local previews/files so the just-uploaded file doesn't appear twice (preview + persisted)
            setMediaPreviews([]);
            setMediaFiles([]);
            // update main preview to persisted imagenUrl when available
            if (persisted.imagenUrl) {
              const API_BASE = getApiBase('PETS');
              const img = persisted.imagenUrl;
              const previewUrl = (typeof img === 'string' && img.startsWith('/')) ? `${API_BASE}${img}` : img;
              setPreview(previewUrl);
            }
          }
        } catch (err) {
          // ignore JSON parse errors
        }
        setSuccessMsg('¡Mascota actualizada exitosamente!');
        setTimeout(() => { setSuccessMsg(''); onRegister && onRegister(mascotaData); onClose(); }, 1200);
      } else {
        await registrarMascota(mascotaData);
        setSuccessMsg('¡Mascota registrada exitosamente!');
        setTimeout(() => {
          setSuccessMsg('');
          onRegister(mascotaData);
          setNombre(''); setEspecie(''); setRaza(''); setFechaNacimiento(''); setSexo(''); setTamaño(''); setVacunas([]); setVacunaInput(''); setEsterilizado(''); setEnfermedades([]); setEnfermedadInput(''); setDocumentos([]); setDescripcion(''); setFoto(null); setPreview(null); setUbicacion(''); setChip('');
          onClose();
        }, 1800);
      }
    } catch (error) {
      console.error('Error al registrar mascota:', error);
      // Si el backend envía un mensaje específico, mostrarlo
      if (error.message && error.message.includes('La imagen de la mascota es obligatoria')) {
        setErrorMsg('Debes subir una imagen para la mascota.');
      } else if (error.message) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Error al registrar la mascota. Por favor, inténtalo de nuevo.');
      }
      setTimeout(() => setErrorMsg(''), 2500);
    }
  } // <-- Add this closing brace for handleSubmit

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(64,11,25,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleBackdropClick}
    >
      <form
        className="modal-form"
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          minWidth: 340,
          maxWidth: 420,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 24px rgba(64,11,25,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Select de refugio solo para empresa */}
        {user?.perfil?.tipoPerfil === 'EMPRESA' && (
          <div>
            <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Refugio</label>
            <select value={refugioId} onChange={e => setRefugioId(e.target.value)} required style={{ borderRadius: 12, border: '2px solid #F29C6B', padding: '8px 16px', fontSize: 16, marginBottom: 8 }}>
              <option value="">Selecciona refugio</option>
              {refugios.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
        )}
    <h2 style={{ color: '#a0522d', textAlign: 'center', marginBottom: 8 }}>Registrar Mascota</h2>
    <div style={{ fontSize: 12, color: '#c62828', textAlign: 'center', marginBottom: 6 }}>Los campos marcados con <span style={{ fontWeight: 'bold' }}>*</span> son obligatorios</div>
  <input type="text" className="modal-input" placeholder="Nombre *" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
  {/* Solo para móvil: label explicativo y opción vacía sin texto largo */}
  <div className="combobox-label-mobile" style={{ display: 'none' }}>
    <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Selecciona la especie de la mascota</label>
  </div>
  <select className="modal-input" value={especie} onChange={e => setEspecie(e.target.value)} required style={inputStyle}>
    <option value="" className="select-placeholder">Selecciona especie *</option>
    {ESPECIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
  <input type="text" className="modal-input" placeholder="Raza (opcional)" value={raza} onChange={e => setRaza(e.target.value)} style={inputStyle} />
  <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Fecha de nacimiento de la mascota *</label>
        <input
          type="date"
          className="modal-input"
          placeholder="Fecha de nacimiento"
          value={fechaNacimiento}
          onChange={handleFechaNacimiento}
          {...(!isEdit ? { required: true } : {})}
          style={inputStyle}
          max={todayLocal}
        />
        {/* Debug help: show raw and parsed fechaNacimiento when editing (visible only to developer) */}
        {/* debug info removed for production UX */}
  <div className="combobox-label-mobile" style={{ display: 'none' }}>
    <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Selecciona el sexo de la mascota</label>
  </div>
  <select className="modal-input" value={sexo} onChange={e => setSexo(e.target.value)} required style={inputStyle}>
    <option value="" className="select-placeholder">Sexo *</option>
    <option value="Macho">Macho</option>
    <option value="Hembra">Hembra</option>
  </select>
  <div className="combobox-label-mobile" style={{ display: 'none' }}>
    <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Selecciona el tamaño de la mascota</label>
  </div>
  <select className="modal-input" value={tamaño} onChange={e => setTamaño(e.target.value)} style={inputStyle}>
    <option value="" className="select-placeholder">Tamaño</option>
    {TAMAÑOS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
  {peso && (
    <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}><b>Peso registrado:</b> {String(peso).toLowerCase().includes('kg') ? peso : `${peso} kg`}</div>
  )}
        {/* Estado de salud */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Vacunas</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" className="modal-input" placeholder="Agregar vacuna" value={vacunaInput} onChange={e => setVacunaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={handleAddVacuna} style={{ ...buttonStyle, padding: '8px 12px', fontSize: 14 }}>Agregar</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {vacunas.map((v, i) => (
              <span key={i} style={{ background: '#F29C6B', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                {v} <button type="button" onClick={() => handleRemoveVacuna(i)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Esterilizado</label>
          <select className="modal-input" value={esterilizado} onChange={e => setEsterilizado(e.target.value)} required style={inputStyle}>
            <option value="">¿Esterilizado?</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Enfermedades</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" className="modal-input" placeholder="Agregar enfermedad" value={enfermedadInput} onChange={e => setEnfermedadInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={handleAddEnfermedad} style={{ ...buttonStyle, padding: '8px 12px', fontSize: 14 }}>Agregar</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {enfermedades.map((v, i) => (
              <span key={i} style={{ background: '#D9663D', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                {v} <button type="button" onClick={() => handleRemoveEnfermedad(i)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Documentos de salud</label>
          <input type="file" className="modal-input" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentos} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>
  <textarea className="modal-input" placeholder="Descripción general para adopción *" value={descripcion} onChange={e => setDescripcion(e.target.value)} required style={{ ...inputStyle, minHeight: 60 }} />
  {/* Ubicación: campo agregado para registrar desde perfil Persona */}
  <input type="text" className="modal-input" placeholder="Ubicación *" value={ubicacion} onChange={e => setUbicacion(e.target.value)} required style={inputStyle} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ color: '#a0522d', fontWeight: 'bold', marginBottom: 4 }}>Foto de la mascota (principal) *</label>
          <span style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>Sube una imagen clara y reciente de la mascota</span>
          <input type="file" className="modal-input" accept="image/*" onChange={handleFoto} {...(!isEdit ? { required: true } : {})} style={{ marginBottom: 8 }} />
          {preview && <img src={preview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, margin: '0 auto' }} />}

            <div style={{ width: '100%', marginTop: 12 }}>
            <label style={{ color: '#a0522d', fontWeight: 'bold', marginBottom: 6 }}>Fotos o vídeos adicionales (opcional)</label>
            <input type="file" className="modal-input" accept="image/*,video/*" multiple onChange={handleMediaFiles} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(() => {
                const API_BASE = getApiBase('PETS');
                // map existingMedia to {url,type}
                const existingMapped = (existingMedia || []).map(m => {
                  if (!m) return null;
                  if (typeof m === 'string') {
                    const url = m.startsWith('http') ? m : buildMediaUrl(API_BASE, m);
                    return { url, type: '' };
                  }
                  const url = m.url || m.path || m.src || '';
                  const finalUrl = url ? (url.startsWith('http') ? url : buildMediaUrl(API_BASE, url)) : '';
                  return finalUrl ? { url: finalUrl, type: m.type || '' } : null;
                }).filter(Boolean);

                // mediaPreviews already have {type, url}
                const previewsMapped = mediaPreviews.map(p => ({ url: p.url, type: p.type || '' }));

                const merged = existingMapped.concat(previewsMapped);

                if (merged.length === 0) return null;

                return (
                  <>
                    {merged.map((p, i) => (
                      <button key={i} type="button" onClick={() => { setGalleryStartIndex(i); setGalleryOpen(true); }} style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', padding: 0 }}>
                        {p.type && String(p.type).toLowerCase().startsWith('video') ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>▶</div>
                        ) : (
                          <img src={p.url} alt={`media-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </button>
                    ))}
                    <MediaGalleryModal
                      open={galleryOpen}
                      onClose={() => setGalleryOpen(false)}
                      media={merged}
                      startIndex={galleryStartIndex}
                      mascota={{
                        nombre: nombre || initialData?.nombre,
                        especie: especie || initialData?.especie,
                        raza: raza || initialData?.raza,
                        sexo: sexo || initialData?.sexo,
                        fechaNacimiento: fechaNacimiento || initialData?.fechaNacimiento,
                        ubicacion: ubicacion || initialData?.ubicacion,
                        fechaRegistro: initialData?.fechaRegistro || null,
                        disponibleAdopcion: (typeof initialData?.disponibleAdopcion !== 'undefined') ? initialData.disponibleAdopcion : true
                      }}
                      onDelete={handleDelete}
                    />
                  </>
                );
              })()}
            </div>
            <button type="submit" style={{ ...buttonStyle, background: '#a0522d', color: '#fff' }}>{isEdit ? 'Actualizar' : 'Registrar'}</button>
        </div>
        </div>
        {successMsg && (
          <div style={{marginTop:10, background:'#e6f7e6', color:'#2e7d32', padding:'8px 16px', borderRadius:8, textAlign:'center', fontWeight:'bold', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{marginTop:10, background:'#ffe6e6', color:'#c62828', padding:'8px 16px', borderRadius:8, textAlign:'center', fontWeight:'bold', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            {errorMsg}
          </div>
        )}
        
      </form>
    </div>
  );
}
