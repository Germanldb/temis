# ⚖️ Proyecto Temis: Asistente Jurídico IA (MVP)

Documento de especificaciones técnicas y arquitectura para el desarrollo de la aplicación multiplataforma de consulta legal.

---

## 🚀 Stack Tecnológico Final

### Frontend & Multiplataforma
- **Core:** [Astro v4.x+](https://astro.build/) (Arquitectura de Islas para alto rendimiento).
- **Interfaz:** **React + Tailwind CSS** (Componentes de chat y visor de leyes).
- **Móvil:** **Capacitor** (Para generación de APK nativa desde el build de Astro).
- **Optimización:** **Pretext** (Librería para limpieza de archivos .md, normalización de prompts y ahorro de tokens).

### Backend & Inteligencia
- **LLM:** **Google Gemini 1.5 Flash** (Modelo principal por costo-eficiencia y ventana de contexto).
- **Infraestructura:** **Netlify** (Hosting + Serverless Functions para el Proxy de la API).
- **Edge Computing:** **Netlify Edge Functions** (Middleware para Rate Limiting por IP).
- **Base de Datos & Auth:** **Supabase** (PostgreSQL para usuarios, créditos e historial).

---

## 📂 Estructura del Proyecto

```text
/temis-app
├── /android             # Código nativo generado por Capacitor
├── /src
│   ├── /content
│   │   └── /leyes       # Base de conocimientos (.md)
│   ├── /components
│   │   ├── ChatIsla.jsx # Interfaz del Chatbot (React)
│   │   └── VisorLey.astro # Renderizado estático de leyes
│   ├── /pages
│   │   ├── index.astro  # Biblioteca de leyes (Landing)
│   │   └── /api
│   │       └── chat.js  # Serverless Function (Proxy Seguro)
│   └── /middleware.js   # Control de IP (Rate Limit)
├── capacitor.config.ts
└── tailwind.config.mjs
```

## Lógica de Negocio y Seguridad

1. **Control de Acceso (Rate Limit)**
Usuarios Invitados: 5 consultas gratuitas controladas por dirección IP (vía Netlify Edge + Supabase uso_por_ip).

Usuarios Registrados: Consultas vinculadas al balance de créditos prepagados en su perfil.

2. **Monetización (Venezuela)**
Método Principal: Pago Móvil (Bs) a tasa BCV.

   ***Flujo:***
    1. El usuario envía el reporte de pago (Referencia + Fecha) desde la App.
    2. Los datos se guardan en la tabla pagos_reportados de Supabase.
    3. Validación manual por el administrador para activar los créditos.

3. **Seguridad de Credenciales**
IMPORTANTE: Las API Keys (Gemini, Supabase Service Role) NUNCA deben estar en la APK.

Todas las peticiones al LLM pasan por /api/chat.js para que la llave permanezca oculta en el servidor (Netlify).

## Pasos Inmediatos de Ejecución

***Inicialización:***

    pnpm create astro@latest

    pnpm add @capacitor/core @capacitor/cli

    npx cap init

***Base de Datos (Supabase):***

    Crear tablas: perfiles, uso_por_ip y pagos_reportados.

    Optimización de Contenido:

    Pasar los archivos .md de las leyes por Pretext antes de moverlos a /src/content/leyes/.

***Desarrollo del Chat:***

    Crear el endpoint en /api/chat.ts que reciba el prompt, limpie con Pretext y consulte a Gemini.

***Exportación Móvil:***

    pnpm run build -> npx cap sync -> Generar APK en Android Studio.

***Nota: Este documento es la guía oficial del Proyecto Temis.***