from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

app = FastAPI()

# Modelo para paciente
class Paciente(BaseModel):
    id: int
    nombre: str
    email: Optional[str] = None

# Modelo para sesión
class Sesion(BaseModel):
    id: int
    paciente_id: int
    fecha: date
    asistio: bool = False
    pago_realizado: bool = False

# Bases de datos simuladas en memoria (lista)
pacientes_db: List[Paciente] = []
sesiones_db: List[Sesion] = []

# Ruta principal
@app.get("/")
def read_root():
    return {"message": "Hola desde PsycoAgenda!"}

# Crear paciente
@app.post("/pacientes/")
def crear_paciente(paciente: Paciente):
    pacientes_db.append(paciente)
    return {"mensaje": "Paciente creado", "paciente": paciente}

# Listar pacientes
@app.get("/pacientes/", response_model=List[Paciente])
def listar_pacientes():
    return pacientes_db

# Crear sesión
@app.post("/sesiones/")
def crear_sesion(sesion: Sesion):
    sesiones_db.append(sesion)
    return {"mensaje": "Sesión creada", "sesion": sesion}

# Listar sesiones
@app.get("/sesiones/", response_model=List[Sesion])
def listar_sesiones():
    return sesiones_db

