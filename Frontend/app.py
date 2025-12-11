import streamlit as st
import requests
from datetime import date

BACKEND_URL = "http://localhost:8000"  # Cambiar a la URL real del backend desplegado

st.title("PsycoAgenda - Agenda para Psicólogos")

menu = ["Ver Pacientes", "Crear Paciente", "Ver Sesiones", "Crear Sesión", "Actualizar Sesión"]
choice = st.sidebar.selectbox("Menú", menu)

if choice == "Ver Pacientes":
    st.header("Lista de Pacientes")
    res = requests.get(f"{BACKEND_URL}/pacientes/")
    if res.status_code == 200:
        pacientes = res.json()
        for p in pacientes:
            st.write(f"- {p['id']}: {p['nombre']} ({p.get('email', 'sin email')})")
    else:
        st.error("Error al obtener pacientes")

elif choice == "Crear Paciente":
    st.header("Crear nuevo paciente")
    nombre = st.text_input("Nombre")
    email = st.text_input("Email (opcional)")
    if st.button("Crear"):
        new_id = st.session_state.get("last_paciente_id", 0) + 1
        payload = {"id": new_id, "nombre": nombre, "email": email}
        res = requests.post(f"{BACKEND_URL}/pacientes/", json=payload)
        if res.status_code == 200:
            st.success("Paciente creado")
            st.session_state["last_paciente_id"] = new_id
        else:
            st.error("Error al crear paciente")

elif choice == "Ver Sesiones":
    st.header("Lista de sesiones")
    res = requests.get(f"{BACKEND_URL}/sesiones/")
    if res.status_code == 200:
        sesiones = res.json()
        for s in sesiones:
            st.write(f"- ID: {s['id']} | Paciente ID: {s['paciente_id']} | Fecha: {s['fecha']} | Asistió: {s['asistio']} | Pago: {s['pago_realizado']}")
            if s.get("historia_clinica"):
                st.write(f"  Historia Clínica: {s['historia_clinica']}")
    else:
        st.error("Error al obtener sesiones")

elif choice == "Crear Sesión":
    st.header("Crear nueva sesión")
    paciente_id = st.number_input("ID Paciente", min_value=1)
    fecha_sesion = st.date_input("Fecha de la sesión", value=date.today())
    if st.button("Crear sesión"):
        new_id = st.session_state.get("last_sesion_id", 0) + 1
        payload = {"id": new_id, "paciente_id": paciente_id, "fecha": str(fecha_sesion), "asistio": False, "pago_realizado": False}
        res = requests.post(f"{BACKEND_URL}/sesiones/", json=payload)
        if res.status_code == 200:
            st.success("Sesión creada")
            st.session_state["last_sesion_id"] = new_id
        else:
            st.error("Error al crear sesión")

elif choice == "Actualizar Sesión":
    st.header("Actualizar sesión")
    sesion_id = st.number_input("ID de la sesión a actualizar", min_value=1)
    asistio = st.checkbox("Asistió")
    pago = st.checkbox("Pago realizado")
    historia = st.text_area("Actualizar historia clínica")
    if st.button("Actualizar"):
        payload = {}
        if asistio is not None:
            payload["asistio"] = asistio
        if pago is not None:
            payload["pago_realizado"] = pago
        if historia.strip() != "":
            payload["historia_clinica"] = historia.strip()
        res = requests.put(f"{BACKEND_URL}/sesiones/{sesion_id}", json=payload)
        if res.status_code == 200:
            st.success("Sesión actualizada")
        else:
            st.error("Error al actualizar sesión")
