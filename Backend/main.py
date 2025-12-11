from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import os
from datetime import datetime

app = FastAPI(title="PsycoAgenda API - Railway")

# Configurar CORS para Railway
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tati2222.github.io",  # Tu GitHub Pages
        "http://localhost:3000",       # Desarrollo local
        "http://localhost:5173",       # Vite
        "https://*.vercel.app",        # Si usas Vercel
        "*"  # Temporal para pruebas
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
class Paciente(BaseModel):
    nombre: str
    email: Optional[str] = ""
    telefono: Optional[str] = ""

class Sesion(BaseModel):
    fecha: str
    paciente_id: int
    asistio: bool = False
    pago: bool = False

# Base de datos SQLite persistente
def init_db():
    # En Railway, /tmp es persistente entre reinicios
    db_path = os.path.join("/tmp", "psycoagenda.db") if os.path.exists("/tmp") else "psycoagenda.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT,
            telefono TEXT,
            creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sesiones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            paciente_id INTEGER NOT NULL,
            asistio BOOLEAN DEFAULT 0,
            pago BOOLEAN DEFAULT 0,
            creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    return db_path

DB_PATH = init_db()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Para acceder a columnas por nombre
    return conn

# Endpoints
@app.get("/")
def root():
    return {
        "message": "PsycoAgenda API - Railway Deployment",
        "status": "online",
        "endpoints": {
            "GET /pacientes": "Listar pacientes",
            "POST /pacientes": "Crear paciente",
            "GET /sesiones": "Listar sesiones", 
            "POST /sesiones": "Crear sesión",
            "GET /stats": "Estadísticas",
            "GET /health": "Health check"
        },
        "database": "SQLite"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": str(datetime.now())}

@app.get("/pacientes")
def listar_pacientes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pacientes ORDER BY creado DESC")
    pacientes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return pacientes

@app.post("/pacientes")
def crear_paciente(paciente: Paciente):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO pacientes (nombre, email, telefono) VALUES (?, ?, ?)",
            (paciente.nombre, paciente.email, paciente.telefono)
        )
        conn.commit()
        paciente_id = cursor.lastrowid
        
        cursor.execute("SELECT * FROM pacientes WHERE id = ?", (paciente_id,))
        nuevo_paciente = dict(cursor.fetchone())
        
        return nuevo_paciente
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/sesiones")
def listar_sesiones():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.*, p.nombre as paciente_nombre 
        FROM sesiones s
        LEFT JOIN pacientes p ON s.paciente_id = p.id
        ORDER BY s.fecha DESC
    """)
    sesiones = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return sesiones

@app.post("/sesiones")
def crear_sesion(sesion: Sesion):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Verificar que el paciente existe
        cursor.execute("SELECT id FROM pacientes WHERE id = ?", (sesion.paciente_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        cursor.execute(
            "INSERT INTO sesiones (fecha, paciente_id, asistio, pago) VALUES (?, ?, ?, ?)",
            (sesion.fecha, sesion.paciente_id, sesion.asistio, sesion.pago)
        )
        conn.commit()
        sesion_id = cursor.lastrowid
        
        cursor.execute("""
            SELECT s.*, p.nombre as paciente_nombre 
            FROM sesiones s
            LEFT JOIN pacientes p ON s.paciente_id = p.id
            WHERE s.id = ?
        """, (sesion_id,))
        
        nueva_sesion = dict(cursor.fetchone())
        return nueva_sesion
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/stats")
def estadisticas():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM pacientes")
    total_pacientes = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as total FROM sesiones")
    total_sesiones = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as total FROM sesiones WHERE asistio = 1")
    sesiones_asistidas = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as total FROM sesiones WHERE pago = 1")
    sesiones_pagadas = cursor.fetchone()[0]
    
    conn.close()
    
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
