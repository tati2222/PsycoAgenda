import os
from dotenv import load_dotenv
from supabase import create_client
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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

@app.get("/")
def read_root():
    return {"message": "Hola desde PsycoAgenda!"}

# Crear paciente
@app.post("/pacientes/")
def crear_paciente(paciente: Paciente):
    data = paciente.dict()
    response = supabase.table("pacientes").insert(data).execute()
    if response.status_code == 201:
        return {"mensaje": "Paciente creado", "paciente": data}
    else:
        return {"error": "No se pudo crear el paciente", "detalle": response.data}

# Listar pacientes
@app.get("/pacientes/", response_model=List[Paciente])
def listar_pacientes():
    response = supabase.table("pacientes").select("*").execute()
    if response.status_code == 200:
        return response.data
    else:
        return {"error": "No se pudo obtener la lista de pacientes", "detalle": response.data}

# Crear sesión
@app.post("/sesiones/")
def crear_sesion(sesion: Sesion):
    data = sesion.dict()
    response = supabase.table("sesiones").insert(data).execute()
    if response.status_code == 201:
        return {"mensaje": "Sesión creada", "sesion": data}
    else:
        return {"error": "No se pudo crear la sesión", "detalle": response.data}

# Listar sesiones
@app.get("/sesiones/", response_model=List[Sesion])
def listar_sesiones():
    response = supabase.table("sesiones").select("*").execute()
    if response.status_code == 200:
        return response.data
    else:
        return {"error": "No se pudo obtener la lista de sesiones", "detalle": response.data}
