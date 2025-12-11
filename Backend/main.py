from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

app = FastAPI()

class Paciente(BaseModel):
    id: int
    nombre: str
    email: Optional[str] = None

class Sesion(BaseModel):
    id: int
    paciente_id: int
    fecha: date
    asistio: bool = False
    pago_realizado: bool = False
    historia_clinica: Optional[str] = None

pacientes_db: List[Paciente] = []
sesiones_db: List[Sesion] = []

@app.get("/")
def root():
    return {"message": "Backend PsycoAgenda funcionando"}

@app.post("/pacientes/")
def crear_paciente(paciente: Paciente):
    pacientes_db.append(paciente)
    return {"mensaje": "Paciente creado", "paciente": paciente}

@app.get("/pacientes/", response_model=List[Paciente])
def listar_pacientes():
    return pacientes_db

@app.post("/sesiones/")
def crear_sesion(sesion: Sesion):
    sesiones_db.append(sesion)
    return {"mensaje": "Sesión creada", "sesion": sesion}

@app.get("/sesiones/", response_model=List[Sesion])
def listar_sesiones():
    return sesiones_db

@app.put("/sesiones/{sesion_id}")
def actualizar_sesion(sesion_id: int, asistio: Optional[bool] = None, pago_realizado: Optional[bool] = None, historia_clinica: Optional[str] = None):
    for sesion in sesiones_db:
        if sesion.id == sesion_id:
            if asistio is not None:
                sesion.asistio = asistio
            if pago_realizado is not None:
                sesion.pago_realizado = pago_realizado
            if historia_clinica is not None:
                sesion.historia_clinica = historia_clinica
            return {"mensaje": "Sesión actualizada", "sesion": sesion}
    return {"error": "Sesión no encontrada"}
