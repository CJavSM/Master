# backend/workshops-service/main.py - ENFOQUE 2: RUTAS SIMPLES

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, List
import mysql.connector
import time
from datetime import date, datetime

app = FastAPI(title="Workshops Service", version="1.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorkshopCreate(BaseModel):
    title: str = Field(..., min_length=4, max_length=100)
    description: str
    category: str
    date: date
    max_participants: int = Field(..., gt=0)
    price: float = Field(..., gt=0)

    @validator("date")
    def validar_fecha(cls, v):
        if v < datetime.utcnow().date():
            raise ValueError("La fecha del taller debe ser futura.")
        return v

class Workshop(BaseModel):
    id: int
    title: str
    description: str
    category: str
    date: date
    max_participants: int
    current_participants: int
    price: float

def get_connection():
    for attempt in range(20):
        try:
            return mysql.connector.connect(
                host="db",
                user="root",
                password="12345",
                database="users_db"
            )
        except mysql.connector.Error:
            print(f"[workshops-service] Intento {attempt+1} fallido, esperando...")
            time.sleep(3)
    raise Exception("No se pudo conectar a la base de datos.")

@app.on_event("startup")
def create_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workshops (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100),
            description TEXT,
            category VARCHAR(50),
            date DATE,
            max_participants INT,
            current_participants INT DEFAULT 0,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()
    print("[workshops-service] Tabla 'workshops' verificada/creada")

# ✅ RUTAS SIMPLES - Coinciden con lo que envía el API Gateway proxy

@app.post("/", summary="Registrar un nuevo taller", response_model=Workshop)
def crear_taller(data: WorkshopCreate):
    try:
        print(f"[workshops-service] Creando taller: {data.title}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM workshops WHERE title = %s", (data.title,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=409, detail="Ya existe un taller con este título")

        cursor.execute("""
            INSERT INTO workshops (title, description, category, date, max_participants, price)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (data.title, data.description, data.category, data.date, data.max_participants, data.price))
        conn.commit()

        cursor.execute("SELECT * FROM workshops WHERE title = %s", (data.title,))
        taller = cursor.fetchone()
        cursor.close()
        conn.close()

        print(f"[workshops-service] Taller creado exitosamente: ID {taller['id']}")
        return taller
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[workshops-service] Error creando taller: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/", response_model=List[Workshop], summary="Listar todos los talleres disponibles")
def listar_talleres():
    try:
        print("[workshops-service] Obteniendo lista de talleres")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM workshops
            WHERE current_participants < max_participants
            ORDER BY date ASC
        """)
        talleres = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not talleres:
            raise HTTPException(status_code=404, detail="No hay talleres disponibles")
        
        print(f"[workshops-service] Encontrados {len(talleres)} talleres disponibles")
        return talleres
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[workshops-service] Error obteniendo talleres: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/buscar", response_model=List[Workshop], summary="Buscar talleres por categoría o palabra clave")
def buscar_talleres(
    categoria: Optional[str] = Query(None),
    palabra: Optional[str] = Query(None)
):
    try:
        print(f"[workshops-service] Búsqueda - Categoría: {categoria}, Palabra: {palabra}")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT * FROM workshops
            WHERE current_participants < max_participants
        """
        params = []

        if categoria:
            sql += " AND category = %s"
            params.append(categoria)

        if palabra:
            sql += " AND (title LIKE %s OR description LIKE %s)"
            palabra_busqueda = f"%{palabra}%"
            params.extend([palabra_busqueda, palabra_busqueda])

        sql += " ORDER BY date ASC"
        cursor.execute(sql, params)
        resultados = cursor.fetchall()
        cursor.close()
        conn.close()

        if not resultados:
            raise HTTPException(status_code=404, detail="No se encontraron talleres con los filtros especificados")

        print(f"[workshops-service] Búsqueda completada: {len(resultados)} resultados")
        return resultados
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[workshops-service] Error en búsqueda: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/health", summary="Verifica si el microservicio está activo")
def health():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        return {"status": "workshops-service ok", "database": "connected"}
    except Exception as e:
        return {"status": "workshops-service error", "database": "disconnected", "error": str(e)}

@app.get("/debug")
def debug_info():
    return {
        "service": "workshops-service",
        "approach": "Enfoque 2 - Rutas simples",
        "routes": [
            "/ (GET, POST) - Listar/Crear talleres",
            "/buscar (GET) - Buscar talleres",
            "/health (GET)",
            "/debug (GET)"
        ],
        "proxy_info": "API Gateway: /api/v0/workshops/{path} → /{path}",
        "database": {"host": "db", "name": "users_db"}
    }