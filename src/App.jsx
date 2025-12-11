import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, DollarSign, Plus, List } from 'lucide-react';

export default function App() {
  // Cargar la URL guardada de localStorage si existe, o '' si no
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('https://verna-unsectional-respectably.ngrok-free.dev') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('pacientes');

  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', email: '', telefono: '' });

  const [sesiones, setSesiones] = useState([]);
  const [nuevaSesion, setNuevaSesion] = useState({
    fecha: '',
    paciente_id: '',
    asistio: false,
    pago: false
  });

  // Guardar apiUrl en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('apiUrl', apiUrl);
  }, [apiUrl]);

  // Función para limpiar slash final de la URL
  const cleanUrl = (url) => url.endsWith('/') ? url.slice(0, -1) : url;

  const conectarBackend = async () => {
    if (!apiUrl) {
      alert('Por favor, ingresa la URL del backend');
      return;
    }
    
    try {
      const cleanApiUrl = cleanUrl(apiUrl);
      const response = await fetch(`${cleanApiUrl}/pacientes`);

      if (response.ok) {
        setIsConnected(true);
        cargarDatos();
      } else {
        alert('No se pudo conectar con el backend. Verifica la URL.');
      }
    } catch (error) {
      alert('Error al conectar con el backend. Verifica la URL.');
    }
  };

  const cargarDatos = async () => {
    await cargarPacientes();
    await cargarSesiones();
  };

  const cargarPacientes = async () => {
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/pacientes`);
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const crearPaciente = async () => {
    if (!nuevoPaciente.nombre) {
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
      }
    } catch (error) {
      alert('Error al crear paciente');
    }
  };

  const cargarSesiones = async () => {
    try {
      const response = await fetch(`${cleanUrl(apiUrl)}/sesiones`);
      const data = await response.json();
      setSesiones(data);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
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
      }
    } catch (error) {
      alert('Error al crear sesión');
    }
  };

  const getPacienteNombre = (id) => {
    const paciente = pacientes.find(p => p.id === id);
    return paciente ? paciente.nombre : 'Desconocido';
  };

  // Auto-conectar si ya hay una URL guardada
  useEffect(() => {
    if (apiUrl) {
      conectarBackend();
    }
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Calendar className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">PsycoAgenda</h1>
            <p className="text-gray-600">Sistema de gestión para psicólogos</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Backend
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://verna-unsectional-respectably.ngrok-free.dev"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">
                Ejemplo: https://lucky-dogs-visit.loca.lt
              </p>
            </div>
            
            <button
              onClick={conectarBackend}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Conectar al Backend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">PsycoAgenda</h1>
                <p className="text-sm text-gray-600">Gestión de pacientes y sesiones</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Conectado
            </div>
          </div>
        </div>

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
                        <p className="text-sm text-gray-600">{paciente.email}</p>
                        <p className="text-sm text-gray-600">{paciente.telefono}</p>
                        <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          ID: {paciente.id}
                        </span>
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
                            <h4 className="font-semibold text-gray-800">{getPacienteNombre(sesion.paciente_id)}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(sesion.fecha).toLocaleString('es-AR', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
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
          </div>
        </div>
      </div>
    </div>
  );
}
