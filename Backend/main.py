from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

app = FastAPI(title="PsycoAgenda API")

# CORS
ALLOWED_ORIGINS = [
    "https://tati2222.github.io",
    "http://localhost:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base de Datos PostgreSQL
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL no está configurada")

# Railway usa postgres:// pero SQLAlchemy necesita postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelos SQLAlchemy
class PacienteDB(Base):
    __tablename__ = "pacientes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, default="")
    telefono = Column(String, default="")
    creado = Column(DateTime, default=datetime.utcnow)
    
    sesiones = relationship("SesionDB", back_populates="paciente")

class SesionDB(Base):
    __tablename__ = "sesiones"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(String, nullable=False)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    asistio = Column(Boolean, default=False)
    pago = Column(Boolean, default=False)
    creado = Column(DateTime, default=datetime.utcnow)
    
    paciente = relationship("PacienteDB", back_populates="sesiones")

# Crear tablas
Base.metadata.create_all(bind=engine)

# Modelos Pydantic
class Paciente(BaseModel):
    nombre: str
    email: Optional[str] = ""
    telefono: Optional[str] = ""

class Sesion(BaseModel):
    fecha: str
    paciente_id: int
    asistio: bool = False
    pago: bool = False

# Dependencia de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.get("/")
def root():
    return {
        "message": "PsycoAgenda API",
        "status": "online",
        "database": "PostgreSQL",
        "endpoints": {
            "GET /health": "Health check",
            "GET /pacientes": "Listar pacientes",
            "POST /pacientes": "Crear paciente",
            "GET /sesiones": "Listar sesiones",
            "POST /sesiones": "Crear sesión",
            "GET /stats": "Estadísticas"
        }
    }

@app.get("/health")
def health_check():
    try:
        db = next(get_db())
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")

@app.get("/pacientes")
def listar_pacientes():
    db = next(get_db())
    pacientes = db.query(PacienteDB).order_by(PacienteDB.creado.desc()).all()
    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "email": p.email,
            "telefono": p.telefono,
            "creado": p.creado.isoformat() if p.creado else None
        }
        for p in pacientes
    ]

@app.post("/pacientes")
def crear_paciente(paciente: Paciente):
    db = next(get_db())
    try:
        nuevo_paciente = PacienteDB(
            nombre=paciente.nombre,
            email=paciente.email,
            telefono=paciente.telefono
        )
        db.add(nuevo_paciente)
        db.commit()
        db.refresh(nuevo_paciente)
        
        return {
            "id": nuevo_paciente.id,
            "nombre": nuevo_paciente.nombre,
            "email": nuevo_paciente.email,
            "telefono": nuevo_paciente.telefono,
            "creado": nuevo_paciente.creado.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sesiones")
def listar_sesiones():
    db = next(get_db())
    sesiones = db.query(SesionDB).order_by(SesionDB.fecha.desc()).all()
    return [
        {
            "id": s.id,
            "fecha": s.fecha,
            "paciente_id": s.paciente_id,
            "paciente_nombre": s.paciente.nombre if s.paciente else None,
            "asistio": s.asistio,
            "pago": s.pago,
            "creado": s.creado.isoformat() if s.creado else None
        }
        for s in sesiones
    ]

@app.post("/sesiones")
def crear_sesion(sesion: Sesion):
    db = next(get_db())
    try:
        # Verificar que el paciente existe
        paciente = db.query(PacienteDB).filter(PacienteDB.id == sesion.paciente_id).first()
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        nueva_sesion = SesionDB(
            fecha=sesion.fecha,
            paciente_id=sesion.paciente_id,
            asistio=sesion.asistio,
            pago=sesion.pago
        )
        db.add(nueva_sesion)
        db.commit()
        db.refresh(nueva_sesion)
        
        return {
            "id": nueva_sesion.id,
            "fecha": nueva_sesion.fecha,
            "paciente_id": nueva_sesion.paciente_id,
            "paciente_nombre": paciente.nombre,
            "asistio": nueva_sesion.asistio,
            "pago": nueva_sesion.pago,
            "creado": nueva_sesion.creado.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def estadisticas():
    db = next(get_db())
    
    total_pacientes = db.query(PacienteDB).count()
    total_sesiones = db.query(SesionDB).count()
    sesiones_asistidas = db.query(SesionDB).filter(SesionDB.asistio == True).count()
    sesiones_pagadas = db.query(SesionDB).filter(SesionDB.pago == True).count()
    
    return {
        "pacientes": total_pacientes,
        "sesiones": total_sesiones,
        "asistencia": f"{(sesiones_asistidas/total_sesiones*100 if total_sesiones > 0 else 0):.1f}%",
        "pagos": f"{(sesiones_pagadas/total_sesiones*100 if total_sesiones > 0 else 0):.1f}%"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
