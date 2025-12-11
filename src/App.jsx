import { useState } from 'react';
import { Calendar, Users, DollarSign, CheckCircle, XCircle, Clock, Plus, Trash2, Edit, TrendingUp } from 'lucide-react';

function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [conectado, setConectado] = useState(false);
  const [vistaActual, setVistaActual] = useState('config');
  
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', telefono: '', email: '' });
  
  const [sesiones, setSesiones] = useState([]);
  const [nuevaSesion, setNuevaSesion] = useState({
    paciente_id: '',
    fecha: '',
    hora: '',
    asistencia: 'pendiente',
    pago: 'pendiente',
    notas: '',
    monto: ''
  });
  
  const [editandoSesion, setEditandoSesion] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const verificarConexion = async () => {
    try {
      const response = await fetch(`${apiUrl}/`);
      const data = await response.json();
      if (data.estado === 'activo') {
        setConectado(true);
        cargarDatos();
        return true;
      }
    } catch (error) {
      setConectado(false);
      alert('No se pudo conectar con el backend. Verifica la URL.');
      return false;
    }
  };

  const cargarDatos = async () => {
    await cargarPacientes();
    await cargarSesiones();
    await cargarEstadisticas();
  };

  const cargarPacientes = async () => {
    try {
      const response = await fetch(`${apiUrl}/pacientes/`);
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    }
  };

  const crearPaciente = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/pacientes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPaciente)
      });
      if (response.ok) {
        setNuevoPaciente({ nombre: '', telefono: '', email: '' });
        await cargarPacientes();
        alert('✅ Paciente creado correctamente');
      }
    } catch (error) {
      alert('Error al crear paciente');
    }
  };

  const eliminarPaciente = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este paciente?')) return;
    try {
      const response = await fetch(`${apiUrl}/pacientes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await cargarPacientes();
        alert('✅ Paciente eliminado');
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail}`);
      }
    } catch (error) {
      alert('Error al eliminar paciente');
    }
  };

  const cargarSesiones = async () => {
    try {
      const response = await fetch(`${apiUrl}/sesiones/`);
      const data = await response.json();
      setSesiones(data);
    } catch (error) {
      console.error('Error cargando sesiones:', error);
    }
  };

  const crearSesion = async (e) => {
    e.preventDefault();
    try {
      const sesionData = {
        ...nuevaSesion,
        paciente_id: parseInt(nuevaSesion.paciente_id),
        monto: nuevaSesion.monto ? parseFloat(nuevaSesion.monto) : null
      };
      const response = await fetch(`${apiUrl}/sesiones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sesionData)
      });
      if (response.ok) {
        setNuevaSesion({
          paciente_id: '',
          fecha: '',
          hora: '',
          asistencia: 'pendiente',
          pago: 'pendiente',
          notas: '',
          monto: ''
        });
        await cargarSesiones();
        await cargarEstadisticas();
        alert('✅ Sesión creada correctamente');
      }
    } catch (error) {
      alert('Error al crear sesión');
    }
  };

  const actualizarSesion = async (e) => {
    e.preventDefault();
    try {
      const sesionData = {
        ...editandoSesion,
        paciente_id: parseInt(editandoSesion.paciente_id),
        monto: editandoSesion.monto ? parseFloat(editandoSesion.monto) : null
      };
      const response = await fetch(`${apiUrl}/sesiones/${editandoSesion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sesionData)
      });
      if (response.ok) {
        setEditandoSesion(null);
        await cargarSesiones();
        await cargarEstadisticas();
        alert('✅ Sesión actualizada');
      }
    } catch (error) {
      alert('Error al actualizar sesión');
    }
  };

  const eliminarSesion = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta sesión?')) return;
    try {
      const response = await fetch(`${apiUrl}/sesiones/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await cargarSesiones();
        await cargarEstadisticas();
        alert('✅ Sesión eliminada');
      }
    } catch (error) {
      alert('Error al eliminar sesión');
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${apiUrl}/estadisticas/`);
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const obtenerNombrePaciente = (id) => {
    const paciente = pacientes.find(p => p.id === id);
    return paciente ? paciente.nombre : 'Desconocido';
  };

  if (vistaActual === 'config' || !conectado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-4">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">PsycoAgenda</h1>
            <p className="text-gray-600">Sistema de gestión para psicólogos</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">📝 Instrucciones:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Ejecuta el notebook de backend en Google Colab</li>
              <li>Espera a que se genere la URL pública de localtunnel</li>
              <li>Copia la URL (ejemplo: https://xxxxx.loca.lt)</li>
              <li>Pégala abajo y presiona "Conectar"</li>
            </ol>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); verificarConexion(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Backend
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://xxxxx.loca.lt"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              🚀 Conectar al Backend
            </button>
          </form>

          {conectado && (
            <div className="mt-6">
              <button
                onClick={() => setVistaActual('dashboard')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                ✅ Ir al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8" />
              <h1 className="text-2xl font-bold">PsycoAgenda</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Conectado</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['dashboard', 'pacientes', 'sesiones'].map((vista) => (
              <button
                key={vista}
                onClick={() => setVistaActual(vista)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  vistaActual === vista
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {vista === 'dashboard' && <><TrendingUp className="inline w-4 h-4 mr-1" /> Dashboard</>}
                {vista === 'pacientes' && <><Users className="inline w-4 h-4 mr-1" /> Pacientes</>}
                {vista === 'sesiones' && <><Calendar className="inline w-4 h-4 mr-1" /> Sesiones</>}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {vistaActual === 'dashboard' && estadisticas && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Pacientes</p>
                    <p className="text-3xl font-bold text-indigo-600">{estadisticas.total_pacientes}</p>
                  </div>
                  <Users className="w-12 h-12 text-indigo-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Sesiones</p>
                    <p className="text-3xl font-bold text-blue-600">{estadisticas.total_sesiones}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Sesiones Pendientes</p>
                    <p className="text-3xl font-bold text-orange-600">{estadisticas.sesiones_pendientes}</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Cobrado</p>
                    <p className="text-3xl font-bold text-green-600">${estadisticas.monto_total_cobrado}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>💡 Recordatorio:</strong> Tienes {estadisticas.pagos_pendientes} pagos pendientes de cobrar.
              </p>
            </div>
          </div>
        )}

        {vistaActual === 'pacientes' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Pacientes</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" /> Nuevo Paciente
              </h3>
              <form onSubmit={crearPaciente} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={nuevoPaciente.nombre}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={nuevoPaciente.telefono}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={nuevoPaciente.email}
                  onChange={(e) => setNuevoPaciente({...nuevoPaciente, email: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="md:col-span-3 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Agregar Paciente
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pacientes.map((paciente) => (
                      <tr key={paciente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{paciente.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{paciente.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{paciente.telefono || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{paciente.email || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => eliminarPaciente(paciente.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pacientes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay pacientes registrados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'sesiones' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Sesiones</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" /> {editandoSesion ? 'Editar Sesión' : 'Nueva Sesión'}
              </h3>
              <form onSubmit={editandoSesion ? actualizarSesion : crearSesion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  value={editandoSesion ? editandoSesion.paciente_id : nuevaSesion.paciente_id}
                  onChange={(e) => editandoSesion 
                    ? setEditandoSesion({...editandoSesion, paciente_id: e.target.value})
                    : setNuevaSesion({...nuevaSesion, paciente_id: e.target.value})
                  }
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Seleccionar paciente *</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={editandoSesion ? editandoSesion.fecha : nuevaSesion.fecha}
                  onChange={(e) => editandoSesion
                    ? setEditandoSesion({...editandoSesion, fecha: e.target.value})
                    : setNuevaSesion({...nuevaSesion, fecha: e.target.value})
                  }
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="time"
                  value={editandoSesion ? editandoSesion.hora : nuevaSesion.hora}
                  onChange={(e) => editandoSesion
                    ? setEditandoSesion({...editandoSesion, hora: e.target.value})
                    : setNuevaSesion({...nuevaSesion, hora: e.target.value})
                  }
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <select
                  value={editandoSesion ? editandoSesion.asistencia : nuevaSesion.asistencia}
                  onChange={(e) => editandoSesion
                    ? setEditandoSesion({...editandoSesion, asistencia: e.target.value})
                    : setNuevaSesion({...nuevaSesion, asistencia: e.target.value})
                  }
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="asistio">Asistió</option>
                  <option value="no_asistio">No asistió</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <select
                  value={editandoSesion ? editandoSesion.pago : nuevaSesion.pago}
                  onChange={(e) => editandoSesion
                    ? setEditandoSesion({...editandoSesion, pago: e.target.value})
                    : setNuevaSesion({...nuevaSesion, pago: e.target.value})
                  }
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pendiente">Pago pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="no_aplica">No aplica</option>
                </select>
                <input
                  type="number"
                  placeholder="Monto"
                  value={editandoSesion ? editandoSesion.monto : nuevaSesion.monto}
                  onChange={(e) => editandoSesion
                    ? setEditandoSesion({...editandoSesion, monto: e.target.value})
                    : setNuevaSesion({...nuevaSesion, monto: e.target.value})
                  }
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  step="0.01"
                />
                <textarea
                  placeholder="Notas"
                  value={editandoSesion ? editandoSesion.notas : nuevaSesion.notas}
                  onChange={(e) => editandoSesion
                    ? setEditandoSesion({...editandoSesion, notas: e.target.value})
                    : setNuevaSesion({...nuevaSesion, notas: e.target.value})
                  }
                  className="md:col-span-2 lg:col-span-3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                />
                <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    {editandoSesion ? 'Actualizar Sesión' : 'Crear Sesión'}
                  </button>
                  {editandoSesion && (
                    <button
                      type="button"
                      onClick={() => setEditandoSesion(null)}
                      className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sesiones.map((sesion) => (
                      <tr key={sesion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{sesion.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {obtenerNombrePaciente(sesion.paciente_id)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sesion.fecha}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sesion.hora}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            sesion.asistencia === 'asistio' ? 'bg-green-100 text-green-800' :
                            sesion.asistencia === 'no_asistio' ? 'bg-red-100 text-red-800' :
                            sesion.asistencia === 'cancelada' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sesion.asistencia === 'asistio' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                            {sesion.asistencia === 'no_asistio' && <XCircle className="inline w-3 h-3 mr-1" />}
                            {sesion.asistencia === 'pendiente' && <Clock className="inline w-3 h-3 mr-1" />}
                            {sesion.asistencia.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            sesion.pago === 'pagado' ? 'bg-green-100 text-green-800' :
                            sesion.pago === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sesion.pago}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {sesion.monto ? `$${sesion.monto}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => setEditandoSesion(sesion)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarSesion(sesion.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
