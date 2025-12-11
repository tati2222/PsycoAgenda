import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, DollarSign, Plus, List, Wifi, Database, BarChart3 } from 'lucide-react';

export default function App() {
  // URL fija de Railway - ¡CAMBIAR POR TU URL!
  const RAILWAY_URL = "https://psycoagenda-production.up.railway.app";
  
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('apiUrl') || RAILWAY_URL);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('pacientes');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [connectionError, setConnectionError] = useState('');

  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', email: '', telefono: '' });

  const [sesiones, setSesiones] = useState([]);
  const [nuevaSesion, setNuevaSesion] = useState({
    fecha: '',
    paciente_id: '',
    asistio: false,
    pago: false
  });

  // Guardar apiUrl en localStorage
  useEffect(() => {
    localStorage.setItem('apiUrl', apiUrl);
  }, [apiUrl]);

  // Función para limpiar URL
  const cleanUrl = (url) => {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.endsWith('/') ? cleaned.slice(0, -1) : cleaned;
    if (!cleaned.startsWith('https://') && !cleaned.startsWith('http://')) {
      cleaned = 'https://' + cleaned;
    }
    return cleaned;
  };

  // Conectar al backend
  const conectarBackend = async () => {
    if (!apiUrl) {
      alert('Por favor, ingresa la URL del backend');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionError('');
      const cleanApiUrl = cleanUrl(apiUrl);
      
      console.log('Conectando a:', cleanApiUrl);
      const response = await fetch(`${cleanApiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        setIsConnected(true);
        await cargarDatos();
        await cargarEstadisticas();
      } else {
        setConnectionError(`Error HTTP ${response.status}`);
        alert('No se pudo conectar con el backend');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setConnectionError(error.message);
      alert(`Error al conectar con el backend: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatos = async () => {
    await cargarPacientes();
    await cargarSesiones();
  };

  const cargarPacientes = async () => {
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/pacientes`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setConnectionError(`Error pacientes: ${error.message}`);
    }
  };

  const crearPaciente = async () => {
    if (!nuevoPaciente.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPaciente)
      });
      
      if (response.ok) {
        setNuevoPaciente({ nombre: '', email: '', telefono: '' });
        await cargarPacientes();
        await cargarEstadisticas();
      } else {
        const errorData = await response.json();
        alert(`Error al crear paciente: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error de red al crear paciente');
    }
  };

  const cargarSesiones = async () => {
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/sesiones`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSesiones(data);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      setConnectionError(`Error sesiones: ${error.message}`);
    }
  };

  const crearSesion = async () => {
    if (!nuevaSesion.fecha || !nuevaSesion.paciente_id) {
      alert('Fecha y paciente son obligatorios');
      return;
    }
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/sesiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaSesion,
          paciente_id: parseInt(nuevaSesion.paciente_id)
        })
      });
      
      if (response.ok) {
        setNuevaSesion({ fecha: '', paciente_id: '', asistio: false, pago: false });
        await cargarSesiones();
        await cargarEstadisticas();
      } else {
        const errorData = await response.json();
        alert(`Error al crear sesión: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error de red al crear sesión');
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaString;
    }
  };

  // Auto-conectar al cargar
  useEffect(() => {
    if (apiUrl) {
      conectarBackend();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando con Railway...</p>
          {connectionError && <p className="text-red-500 text-sm mt-2">{connectionError}</p>}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Database className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">PsycoAgenda</h1>
            <p className="text-gray-600">Backend en Railway - Base de datos persistente</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Backend (Railway)
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://tu-proyecto.up.railway.app"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">
                Ejemplo: https://psycoagenda-production.up.railway.app
              </p>
            </div>
            
            <button
              onClick={conectarBackend}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Wifi className="w-5 h-5" />
              Conectar a Railway
            </button>
            
            {connectionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Error: {connectionError}</p>
              </div>
            )}
            
            <div className="text-center text-xs text-gray-500 pt-4">
              <p>Backend: Railway + FastAPI + SQLite</p>
              <p>Datos persistentes en base de datos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Encabezado con estadísticas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">PsycoAgenda</h1>
                <p className="text-sm text-gray-600">Backend en Railway - Base de datos SQLite</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Conectado a {cleanUrl(apiUrl).replace('https://', '')}
            </div>
          </div>

          {stats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Pacientes</span>
                </div>
                <p className="text-2xl font-bold text-blue-800 mt-2">{stats.pacientes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Sesiones</span>
                </div>
                <p className="text-2xl font-bold text-green-800 mt-2">{stats.sesiones}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Asistencia</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800 mt-2">{stats.asistencia}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">Pagos</span>
                </div>
                <p className="text-2xl font-bold text-purple-800 mt-2">{stats.pagos}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pestañas principales */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pacientes')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'pacientes'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Pacientes
            </button>
            <button
              onClick={() => setActiveTab('sesiones')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'sesiones'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Sesiones
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'estadisticas'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Estadísticas
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pacientes' && (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nuevo Paciente
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nuevoPaciente.nombre}
                        onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={nuevoPaciente.email}
                        onChange={(e) => setNuevoPaciente({...nuevoPaciente, email: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        value={nuevoPaciente.telefono}
                        onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={crearPaciente}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Agregar Paciente
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Lista de Pacientes ({pacientes.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pacientes.map((paciente) => (
                      <div key={paciente.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-800 mb-2">{paciente.nombre}</h4>
                        {paciente.email && <p className="text-sm text-gray-600">{paciente.email}</p>}
                        {paciente.telefono && <p className="text-sm text-gray-600">{paciente.telefono}</p>}
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                            ID: {paciente.id}
                          </span>
                          {paciente.creado && (
                            <span className="text-xs text-gray-500">
                              {formatFecha(paciente.creado)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {pacientes.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay pacientes registrados</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sesiones' && (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nueva Sesión
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="datetime-local"
                        value={nuevaSesion.fecha}
                        onChange={(e) => setNuevaSesion({...nuevaSesion, fecha: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={nuevaSesion.paciente_id}
                        onChange={(e) => setNuevaSesion({...nuevaSesion, paciente_id: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Seleccionar paciente</option>
                        {pacientes.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nuevaSesion.asistio}
                          onChange={(e) => setNuevaSesion({...nuevaSesion, asistio: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Asistió</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nuevaSesion.pago}
                          onChange={(e) => setNuevaSesion({...nuevaSesion, pago: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Pagó</span>
                      </label>
                    </div>
                    <button
                      onClick={crearSesion}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Agregar Sesión
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Lista de Sesiones ({sesiones.length})
                  </h3>
                  <div className="space-y-3">
                    {sesiones.map((sesion) => (
                      <div key={sesion.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">{sesion.paciente_nombre || 'Desconocido'}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatFecha(sesion.fecha)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ID Sesión: {sesion.id} | ID Paciente: {sesion.paciente_id}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {sesion.asistio ? (
                              <CheckCircle className="w-5 h-5 text-green-500" title="Asistió" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" title="No asistió" />
                            )}
                            {sesion.pago ? (
                              <DollarSign className="w-5 h-5 text-green-500" title="Pagó" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-gray-400" title="No pagó" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {sesiones.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay sesiones registradas</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'estadisticas' && stats && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Estadísticas Generales
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Resumen</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Pacientes:</span>
                            <span className="font-semibold">{stats.pacientes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Sesiones:</span>
                            <span className="font-semibold">{stats.sesiones}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tasa de Asistencia:</span>
                            <span className="font-semibold text-green-600">{stats.asistencia}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tasa de Pagos:</span>
                            <span className="font-semibold text-blue-600">{stats.pagos}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Información del Sistema</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Backend:</span>
                            <span className="font-semibold">Railway</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base de datos:</span>
                            <span className="font-semibold">SQLite Persistente</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <span className="font-semibold text-green-600">Conectado ✓</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">URL:</span>
                            <span className="font-semibold text-xs truncate">{cleanUrl(apiUrl)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        cargarEstadisticas();
                        cargarDatos();
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Actualizar Datos
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
