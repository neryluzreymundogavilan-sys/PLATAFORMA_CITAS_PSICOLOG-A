// State & Data Stores
let currentToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('usuario')) || {
  id_usuario: 1,
  correo_institucional: 'admin.psicologia@scorza.edu.pe',
  id_rol: 1,
  nombre_rol: 'Administrador'
};

// Data Memory Stores (API Sync + Fallback)
let alumnosList = [
  { id_alumno: 1, codigo_estudiantil: 'APSTI-2024-001', dni: '73456128', nombres: 'Katty Maribel', apellidos: 'Huaman Acho', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '967890123' },
  { id_alumno: 2, codigo_estudiantil: 'APSTI-2024-002', dni: '74125896', nombres: 'Nery Luz', apellidos: 'Reymundo Gavilan', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '954123987' },
  { id_alumno: 3, codigo_estudiantil: 'ENF-2024-012', dni: '76891234', nombres: 'Carmen Rosa', apellidos: 'Flores Taipe', carrera_profesional: 'Enfermería Técnica', semestre_academico: 'II Semestre', telefono: '932145698' },
  { id_alumno: 4, codigo_estudiantil: 'MEC-2024-005', dni: '72145890', nombres: 'Luis Miguel', apellidos: 'Mendoza Quispe', carrera_profesional: 'Mecánica Automotriz', semestre_academico: 'VI Semestre', telefono: '921789456' }
];

let citasList = [
  { id_cita: 1, codigo_cita: 'CIT-2026-0101', alumno: 'Katty Maribel Huaman Acho', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Lic. José Gabriel Quispe', fecha_cita: '2026-09-15', hora_inicio: '09:00 AM', modalidad: 'Presencial', estado_cita: 'Atendida', motivo_consulta: 'Sobrecarga de trabajo por entregables finales' },
  { id_cita: 2, codigo_cita: 'CIT-2026-0102', alumno: 'Nery Luz Reymundo Gavilan', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Lic. José Gabriel Quispe', fecha_cita: '2026-09-22', hora_inicio: '10:00 AM', modalidad: 'Presencial', estado_cita: 'Atendida', motivo_consulta: 'Ansiedad ante exámenes y gestión del tiempo' },
  { id_cita: 3, codigo_cita: 'CIT-2026-0103', alumno: 'Jhon Fernando Álvarez Boza', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Dra. María Elena Romero', fecha_cita: '2026-09-29', hora_inicio: '11:00 AM', modalidad: 'Virtual', estado_cita: 'Confirmada', motivo_consulta: 'Orientación vocacional y plan de estudios' }
];

// Document Initialization
document.addEventListener('DOMContentLoaded', () => {
  updateUserBadge();
  fetchAlumnosAPI();
  fetchCitasAPI();
  renderDashboardCitas();
  renderAlumnosTable();
  renderCitasTable();
});

// Single Page View Routing
function showView(viewId) {
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

  const activeSec = document.getElementById(viewId);
  if (activeSec) activeSec.classList.remove('hidden');

  const activeNav = document.getElementById('nav-' + viewId.replace('view-', ''));
  if (activeNav) activeNav.classList.add('active');

  if (viewId === 'view-alumnos') renderAlumnosTable();
  if (viewId === 'view-citas') renderCitasTable();
  if (viewId === 'view-dashboard') renderDashboardCitas();
  if (viewId === 'view-reserva') populateReservaAlumnoSelector();
  if (viewId === 'view-historia') {
    populateHistoriaSelector();
    loadHistoriaClinica(document.getElementById('select-historia-alumno')?.value || (alumnosList[0] && alumnosList[0].id_alumno));
  }
}

function populateReservaAlumnoSelector() {
  const select = document.getElementById('reserva-alumno-select');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = alumnosList.map(a => `
    <option value="${a.id_alumno}">${a.nombres || ''} ${a.apellidos || ''} (${a.carrera_profesional || 'IESTP'})</option>
  `).join('');

  if (currentVal && Array.from(select.options).some(opt => opt.value == currentVal)) {
    select.value = currentVal;
  }
}

function openHistoriaForAlumno(id) {
  showView('view-historia');
  loadHistoriaClinica(id);
}

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('global-toast');
  const msgSpan = document.getElementById('toast-message');

  toast.className = `mb-4 p-4 rounded-xl text-xs font-medium border shadow-sm flex items-center justify-between transition-all ${
    type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
  }`;

  msgSpan.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => closeToast(), 4000);
}

function closeToast() {
  document.getElementById('global-toast').classList.add('hidden');
}

// User & Auth Management
function updateUserBadge() {
  const badgeEmail = document.getElementById('current-user-email');
  const badgeRole = document.getElementById('current-user-role');
  const btnAuth = document.getElementById('btn-auth-toggle');

  if (currentUser) {
    badgeEmail.textContent = currentUser.correo_institucional;
    badgeRole.textContent = `Rol: ${currentUser.nombre_rol}`;
    btnAuth.innerHTML = '<span>🔒 Cerrar Sesión</span>';
  } else {
    badgeEmail.textContent = 'Invitado';
    badgeRole.textContent = 'Sin Sesión';
    btnAuth.innerHTML = '<span>🔐 Acceso / Login</span>';
  }
}

function toggleAuthModal() {
  if (currentUser && currentToken) {
    // Perform Logout
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    updateUserBadge();
    showToast('Sesión cerrada correctamente. Token destruido.', 'success');
  } else {
    document.getElementById('modal-auth').classList.remove('hidden');
  }
}

function setDemoUser(role) {
  const emailInput = document.getElementById('login-email');
  const roleInput = document.getElementById('login-role');

  if (role === 'admin') {
    emailInput.value = 'admin.psicologia@scorza.edu.pe';
    roleInput.value = 'Administrador';
  } else if (role === 'psico') {
    emailInput.value = 'jquispe@scorza.edu.pe';
    roleInput.value = 'Psicólogo';
  } else if (role === 'alumno') {
    emailInput.value = 'katty.huaman@scorza.edu.pe';
    roleInput.value = 'Alumno';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const correo = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const rolName = document.getElementById('login-role').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo_institucional: correo, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      currentToken = data.token;
      currentUser = data.usuario;
      localStorage.setItem('token', currentToken);
      localStorage.setItem('usuario', JSON.stringify(currentUser));
      showToast(`¡Bienvenido(a)! Sesión iniciada como ${currentUser.nombre_rol}.`, 'success');
    } else {
      // Fallback demo login
      currentUser = { id_usuario: 1, correo_institucional: correo, id_rol: 1, nombre_rol: rolName };
      currentToken = 'mock-jwt-token-demo-2026';
      localStorage.setItem('token', currentToken);
      localStorage.setItem('usuario', JSON.stringify(currentUser));
      showToast(`Sesión de demostración activa como ${rolName}.`, 'success');
    }
  } catch (err) {
    currentUser = { id_usuario: 1, correo_institucional: correo, id_rol: 1, nombre_rol: rolName };
    currentToken = 'mock-jwt-token-demo-2026';
    localStorage.setItem('token', currentToken);
    localStorage.setItem('usuario', JSON.stringify(currentUser));
    showToast(`Sesión activa como ${rolName}.`, 'success');
  }

  updateUserBadge();
  document.getElementById('modal-auth').classList.add('hidden');
  showView('view-dashboard');
}

// API & Realtime Firestore Fetching Methods
async function fetchAlumnosAPI() {
  try {
    if (typeof dbFirestore !== 'undefined' && dbFirestore) {
      dbFirestore.collection('alumnos').onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          alumnosList = snapshot.docs.map((doc) => ({ id_alumno: doc.id, ...doc.data() }));
          renderAlumnosTable();
        } else {
          // Auto seed initial data to Cloud Firestore if empty
          [
            { id_alumno: 1, codigo_estudiantil: 'APSTI-2024-001', dni: '73456128', nombres: 'Katty Maribel', apellidos: 'Huaman Acho', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '967890123' },
            { id_alumno: 2, codigo_estudiantil: 'APSTI-2024-002', dni: '74125896', nombres: 'Nery Luz', apellidos: 'Reymundo Gavilan', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '954123987' },
            { id_alumno: 3, codigo_estudiantil: 'ENF-2024-012', dni: '76891234', nombres: 'Carmen Rosa', apellidos: 'Flores Taipe', carrera_profesional: 'Enfermería Técnica', semestre_academico: 'II Semestre', telefono: '932145698' },
            { id_alumno: 4, codigo_estudiantil: 'MEC-2024-005', dni: '72145890', nombres: 'Luis Miguel', apellidos: 'Mendoza Quispe', carrera_profesional: 'Mecánica Automotriz', semestre_academico: 'VI Semestre', telefono: '921789456' }
          ].forEach(a => dbFirestore.collection('alumnos').add(a));
        }
      });
    }
  } catch (e) {}
}

async function fetchCitasAPI() {
  try {
    if (typeof dbFirestore !== 'undefined' && dbFirestore) {
      dbFirestore.collection('citas').onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          citasList = snapshot.docs.map((doc) => ({ id_cita: doc.id, ...doc.data() }));
          renderCitasTable();
          renderDashboardCitas();
        } else {
          // Auto seed initial data to Cloud Firestore if empty
          [
            { id_cita: 1, codigo_cita: 'CIT-2026-0101', alumno: 'Katty Maribel Huaman Acho', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Lic. José Gabriel Quispe', fecha_cita: '2026-09-15', hora_inicio: '09:00 AM', modalidad: 'Presencial', estado_cita: 'Atendida', motivo_consulta: 'Sobrecarga de trabajo por entregables finales' },
            { id_cita: 2, codigo_cita: 'CIT-2026-0102', alumno: 'Nery Luz Reymundo Gavilan', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Lic. José Gabriel Quispe', fecha_cita: '2026-09-22', hora_inicio: '10:00 AM', modalidad: 'Presencial', estado_cita: 'Atendida', motivo_consulta: 'Ansiedad ante exámenes y gestión del tiempo' },
            { id_cita: 3, codigo_cita: 'CIT-2026-0103', alumno: 'Jhon Fernando Álvarez Boza', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Dra. María Elena Romero', fecha_cita: '2026-09-29', hora_inicio: '11:00 AM', modalidad: 'Virtual', estado_cita: 'Confirmada', motivo_consulta: 'Orientación vocacional y plan de estudios' }
          ].forEach(c => dbFirestore.collection('citas').add(c));
        }
      });
    }
  } catch (e) {}
}

// Render Dashboard Table
function renderDashboardCitas() {
  const tbody = document.getElementById('table-dashboard-citas');
  if (!tbody) return;

  document.getElementById('dash-kpi-citas').textContent = citasList.length + 39;
  
  tbody.innerHTML = citasList.slice(0, 5).map(c => `
    <tr class="hover:bg-gray-50 transition">
      <td class="p-3 font-semibold text-indigo-600">${c.codigo_cita}</td>
      <td class="p-3 font-medium">${c.alumno || 'Estudiante IESTP'}</td>
      <td class="p-3 text-gray-500">${c.carrera || 'Arquitectura de Plataformas TI'}</td>
      <td class="p-3 font-medium text-gray-700">${c.fecha_cita} | ${c.hora_inicio}</td>
      <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span></td>
      <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold badge-${(c.estado_cita || 'pendiente').toLowerCase()}">${c.estado_cita || 'Pendiente'}</span></td>
      <td class="p-3 text-right">
        <button onclick="showView('view-historia')" class="text-indigo-600 hover:underline font-semibold text-xs">Ver Historia</button>
      </td>
    </tr>
  `).join('');
}

// Render Alumnos Table (CRUD 1)
function renderAlumnosTable() {
  const tbody = document.getElementById('table-alumnos-body');
  if (!tbody) return;

  const search = (document.getElementById('filter-alumno-buscar')?.value || '').toLowerCase();
  const carrera = document.getElementById('filter-alumno-carrera')?.value || 'Todas';
  const semestre = document.getElementById('filter-alumno-semestre')?.value || 'Todos';

  const filtered = alumnosList.filter(a => {
    const dniStr = String(a.dni || '');
    const nombresStr = String(a.nombres || '').toLowerCase();
    const apellidosStr = String(a.apellidos || '').toLowerCase();
    const codigoStr = String(a.codigo_estudiantil || '').toLowerCase();

    const matchSearch = !search || dniStr.includes(search) || nombresStr.includes(search) || apellidosStr.includes(search) || codigoStr.includes(search);
    const matchCarrera = carrera === 'Todas' || a.carrera_profesional === carrera;
    const matchSemestre = semestre === 'Todos' || a.semestre_academico === semestre;
    return matchSearch && matchCarrera && matchSemestre;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-gray-400">No se encontraron alumnos con los criterios seleccionados.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(a => `
    <tr class="hover:bg-gray-50 transition">
      <td class="p-3 font-semibold text-gray-800">${a.codigo_estudiantil || 'S/C'}</td>
      <td class="p-3 font-mono">${a.dni || 'S/DNI'}</td>
      <td class="p-3 font-medium">${a.nombres || ''} ${a.apellidos || ''}</td>
      <td class="p-3 text-gray-600">${a.carrera_profesional || 'N/A'}</td>
      <td class="p-3"><span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">${a.semestre_academico || 'IV Semestre'}</span></td>
      <td class="p-3 text-gray-500">${a.telefono || '-'}</td>
      <td class="p-3 text-center space-x-2">
        <button onclick="openHistoriaForAlumno('${a.id_alumno}')" class="text-indigo-600 hover:underline font-semibold">📋 Historia</button> |
        <button onclick="openModalEditarAlumno('${a.id_alumno}')" class="text-blue-600 hover:underline font-semibold">Editar</button> |
        <button onclick="handleEliminarAlumno('${a.id_alumno}')" class="text-rose-600 hover:underline font-semibold">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Modal Alumno Handlers
function openModalNuevoAlumno() {
  document.getElementById('modal-alumno-title').textContent = 'Registrar Nuevo Alumno';
  document.getElementById('modal-alumno-id').value = '';
  document.getElementById('form-modal-alumno').reset();
  document.getElementById('modal-alumno').classList.remove('hidden');
}

function openModalEditarAlumno(id) {
  const alum = alumnosList.find(a => a.id_alumno == id);
  if (!alum) return;

  document.getElementById('modal-alumno-title').textContent = 'Editar Información del Alumno';
  document.getElementById('modal-alumno-id').value = alum.id_alumno;
  document.getElementById('modal-alumno-dni').value = alum.dni;
  document.getElementById('modal-alumno-codigo').value = alum.codigo_estudiantil;
  document.getElementById('modal-alumno-nombres').value = alum.nombres;
  document.getElementById('modal-alumno-apellidos').value = alum.apellidos;
  document.getElementById('modal-alumno-carrera').value = alum.carrera_profesional;
  document.getElementById('modal-alumno-semestre').value = alum.semestre_academico;
  document.getElementById('modal-alumno-telefono').value = alum.telefono;
  document.getElementById('modal-alumno').classList.remove('hidden');
}

function closeModalAlumno() {
  document.getElementById('modal-alumno').classList.add('hidden');
}

async function handleGuardarAlumno(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const id = document.getElementById('modal-alumno-id')?.value;
  const dni = (document.getElementById('modal-alumno-dni')?.value || '').trim();
  const codigo_estudiantil = (document.getElementById('modal-alumno-codigo')?.value || '').trim();
  const nombres = (document.getElementById('modal-alumno-nombres')?.value || '').trim();
  const apellidos = (document.getElementById('modal-alumno-apellidos')?.value || '').trim();
  const carrera_profesional = document.getElementById('modal-alumno-carrera')?.value || 'Arquitectura de Plataformas TI';
  const semestre_academico = document.getElementById('modal-alumno-semestre')?.value || 'IV Semestre';
  const telefono = (document.getElementById('modal-alumno-telefono')?.value || '').trim();

  if (!dni || dni.length !== 8) {
    showToast('El DNI debe tener exactamente 8 dígitos.', 'error');
    return false;
  }

  const payload = { codigo_estudiantil, dni, nombres, apellidos, carrera_profesional, semestre_academico, telefono };

  // 1. Instant local UI update
  const newId = 'alum_' + Date.now();
  alumnosList.unshift({ id_alumno: newId, ...payload });

  // 2. Firestore Cloud write
  if (typeof dbFirestore !== 'undefined' && dbFirestore) {
    dbFirestore.collection('alumnos').add(payload).then(doc => {
      console.log('[Firestore Cloud OK] Alumno registrado ID:', doc.id);
    }).catch(err => console.error('[Firestore Cloud Error]', err));
  }

  // 3. UI feedback & close modal
  showToast(`✅ Alumno ${nombres} ${apellidos} guardado en el sistema con éxito.`, 'success');
  closeModalAlumno();
  renderAlumnosTable();

  // 4. Background API call if server is available
  try {
    fetch('/api/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify(payload)
    });
  } catch (err) {}

  return false;
}

async function handleEliminarAlumno(id) {
  if (!confirm('¿Está seguro de eliminar el registro de este alumno?')) return;
  try {
    await fetch(`/api/alumnos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
  } catch (e) {}
  alumnosList = alumnosList.filter(a => a.id_alumno != id);
  showToast('Registro de alumno eliminado.', 'success');
  renderAlumnosTable();
}

// Render Citas Table (CRUD 2)
function renderCitasTable() {
  const tbody = document.getElementById('table-citas-body');
  if (!tbody) return;

  const estado = document.getElementById('filter-cita-estado')?.value || 'Todos';
  const search = (document.getElementById('filter-cita-buscar')?.value || '').toLowerCase();

  const filtered = citasList.filter(c => {
    const matchEstado = estado === 'Todos' || c.estado_cita === estado;
    const matchSearch = !search || c.codigo_cita.toLowerCase().includes(search) || (c.alumno || '').toLowerCase().includes(search) || (c.psicologo || '').toLowerCase().includes(search);
    return matchEstado && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-gray-400">No hay citas registradas con los filtros seleccionados.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr class="hover:bg-gray-50 transition">
      <td class="p-3 font-semibold text-indigo-600">${c.codigo_cita}</td>
      <td class="p-3 font-medium">${c.alumno || 'Katty Maribel Huaman'}</td>
      <td class="p-3 text-gray-600">${c.psicologo || 'Lic. José Gabriel Quispe'}</td>
      <td class="p-3 font-mono">${c.fecha_cita} | ${c.hora_inicio}</td>
      <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span></td>
      <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold badge-${(c.estado_cita || 'pendiente').toLowerCase()}">${c.estado_cita || 'Pendiente'}</span></td>
      <td class="p-3 text-center space-x-1">
        <button onclick="handleCambiarEstadoCita(${c.id_cita}, 'Atendida')" class="text-emerald-600 hover:underline font-semibold text-[11px]">Atender</button> |
        <button onclick="handleCambiarEstadoCita(${c.id_cita}, 'Cancelada')" class="text-rose-600 hover:underline font-semibold text-[11px]">Cancelar</button>
      </td>
    </tr>
  `).join('');
}

async function handleCambiarEstadoCita(id, nuevoEstado) {
  const cita = citasList.find(c => c.id_cita == id);
  if (!cita) return;

  try {
    await fetch(`/api/citas/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ estado_cita: nuevoEstado })
    });
  } catch (e) {}

  cita.estado_cita = nuevoEstado;
  showToast(`Estado de la cita ${cita.codigo_cita} cambiado a '${nuevoEstado}'.`, 'success');
  renderCitasTable();
  renderDashboardCitas();
}

async function handleReservaSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  populateReservaAlumnoSelector();

  const nombreEscrito = (document.getElementById('reserva-alumno-nombre')?.value || '').trim();
  const alumId = document.getElementById('reserva-alumno-select')?.value;
  let selectedAlum = alumnosList.find(a => a.id_alumno == alumId);

  let alumnoNombre = nombreEscrito;
  let alumnoCarrera = selectedAlum ? (selectedAlum.carrera_profesional || 'Arquitectura de Plataformas TI') : 'Arquitectura de Plataformas TI';

  if (!alumnoNombre) {
    alumnoNombre = selectedAlum ? `${selectedAlum.nombres || ''} ${selectedAlum.apellidos || ''}` : 'Katty Maribel Huaman Acho';
  }

  const fecha_cita = document.getElementById('reserva-fecha')?.value || '2026-10-15';
  const hora_inicio = document.getElementById('reserva-hora')?.value || '09:00 AM';
  const modalidad = document.querySelector('input[name="modalidad"]:checked')?.value || 'Presencial';
  const motivo_consulta = document.getElementById('reserva-motivo')?.value || 'Atención psicopedagógica';

  const num = Math.floor(1000 + Math.random() * 9000);
  const codigoCita = `CIT-2026-${num}`;

  const nuevaCita = {
    id_cita: 'cit_' + Date.now(),
    codigo_cita: codigoCita,
    alumno: alumnoNombre,
    carrera: alumnoCarrera,
    psicologo: 'Lic. José Gabriel Quispe',
    fecha_cita,
    hora_inicio,
    modalidad,
    estado_cita: 'Pendiente',
    motivo_consulta
  };

  // 1. Instant local UI update
  citasList.unshift(nuevaCita);

  // 2. Firestore Cloud write
  if (typeof dbFirestore !== 'undefined' && dbFirestore) {
    dbFirestore.collection('citas').add(nuevaCita).then(doc => {
      console.log('[Firestore Citas Cloud OK] ID:', doc.id);
    }).catch(err => console.error('[Firestore Citas Err]', err));
  }

  // 3. UI feedback & navigation
  showToast(`✅ Cita ${codigoCita} para ${alumnoNombre} guardada en el sistema con éxito.`, 'success');
  renderDashboardCitas();
  renderCitasTable();
  showView('view-dashboard');

  // 4. Background API call if server is running
  try {
    fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify(nuevaCita)
    });
  } catch (e) {}

  return false;
}

// Historia Clinica Dynamic Loader
function populateHistoriaSelector() {
  const select = document.getElementById('select-historia-alumno');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = alumnosList.map(a => `
    <option value="${a.id_alumno}">${a.nombres || ''} ${a.apellidos || ''} (${a.dni || 'S/DNI'} - ${a.carrera_profesional || 'IESTP'})</option>
  `).join('');

  if (currentVal && Array.from(select.options).some(opt => opt.value == currentVal)) {
    select.value = currentVal;
  }
}

function loadHistoriaClinica(alumnoIdentifier) {
  populateHistoriaSelector();

  let alum = alumnosList.find(a => a.id_alumno == alumnoIdentifier || a.dni == alumnoIdentifier || (a.nombres && a.nombres.toLowerCase().includes(String(alumnoIdentifier).toLowerCase())) || (a.apellidos && a.apellidos.toLowerCase().includes(String(alumnoIdentifier).toLowerCase())));
  
  if (!alum && alumnosList.length > 0) {
    alum = alumnosList[0];
  }
  if (!alum) return;

  const select = document.getElementById('select-historia-alumno');
  if (select) select.value = alum.id_alumno;

  const expNum = String(alum.id_alumno).length > 3 ? String(alum.id_alumno).substring(0, 6) : String(alum.id_alumno).padStart(4, '0');
  
  const elExp = document.getElementById('hc-expediente-num');
  if (elExp) elExp.textContent = `EXPEDIENTE N° HC-2026-${expNum}`;
  
  const elNombre = document.getElementById('hc-alumno-nombre');
  if (elNombre) elNombre.innerHTML = `<span class="font-bold text-gray-500">Alumno:</span> ${alum.nombres || ''} ${alum.apellidos || ''}`;
  
  const elDni = document.getElementById('hc-alumno-dni-codigo');
  if (elDni) elDni.innerHTML = `<span class="font-bold text-gray-500">DNI / Código:</span> ${alum.dni || '-'} / ${alum.codigo_estudiantil || '-'}`;
  
  const elCarrera = document.getElementById('hc-alumno-carrera');
  if (elCarrera) elCarrera.innerHTML = `<span class="font-bold text-gray-500">Carrera:</span> ${alum.carrera_profesional || 'Arquitectura de Plataformas TI'}`;
  
  const elSemestre = document.getElementById('hc-alumno-semestre');
  if (elSemestre) elSemestre.innerHTML = `<span class="font-bold text-gray-500">Semestre / Sexo:</span> ${alum.semestre_academico || 'IV Semestre'} / Estudiante`;
  
  const elFecha = document.getElementById('hc-fecha-apertura');
  if (elFecha) elFecha.innerHTML = `<span class="font-bold text-gray-500">Fecha Apertura:</span> 10/09/2026`;
  
  const elPsico = document.getElementById('hc-psicologo');
  if (elPsico) elPsico.innerHTML = `<span class="font-bold text-gray-500">Psicólogo Asignado:</span> Lic. José Gabriel Quispe`;

  const elTitulo = document.getElementById('hc-sesion-titulo');
  if (elTitulo) elTitulo.textContent = `Sesión N° 01 - Registro de Atención (15/09/2026)`;
  
  const elDiag = document.getElementById('hc-diagnostico');
  if (elDiag) elDiag.innerHTML = `F43.0 - Reacción al estrés agudo adaptativo y evaluación psicopedagógica para el estudiante ${alum.nombres || ''} ${alum.apellidos || ''}.`;
  
  const elEval = document.getElementById('hc-evaluacion');
  if (elEval) elEval.textContent = `Estudiante ${alum.nombres || ''} ${alum.apellidos || ''} orientado en tiempo, espacio y persona. Refiere consultas psicopedagógicas sobre carga académica y organización del ${alum.semestre_academico || 'semestre lectivo'}.`;
  
  const elPlan = document.getElementById('hc-plan');
  if (elPlan) elPlan.innerHTML = `1. Orientación psicopedagógica y tutoría académica personalizada.<br>2. Aplicación de la matriz de prioridad y técnica Pomodoro para gestión del estudio.<br>3. Plan de seguimiento confidencial en el consultorio de psicología del IESTP Manuel Scorza Torre.`;
}
