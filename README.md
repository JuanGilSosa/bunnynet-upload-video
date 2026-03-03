# BunnyNet Video Uploader Pro

Aplicación de nivel empresarial construida con **React + Vite** para la gestión y subida de videos a **BunnyNet Stream**, utilizando el protocolo **TUS** para subidas resumibles y una arquitectura segura basada en **Cloudflare Workers**.

## 🚀 Características Principales

- 🔐 **Autenticación JWT**: Acceso protegido mediante login con usuario y contraseña.
- 🔄 **Subidas Resumibles (TUS)**: Protocolo resiliente que permite reanudar subidas interrumpidas por fallos de red.
- 📁 **Gestión de Colecciones**: CRUD completo de colecciones de BunnyNet integrado en la interfaz.
- 🛡️ **Arquitectura Segura**: Las API Keys nunca se exponen al cliente; todo se gestiona mediante un Worker backend.
- ✨ **UI Premium**: Diseño moderno con glassmorphism, pestañas de navegación y estados de carga optimizados.
- 📊 **Progreso Detallado**: Barra de progreso en tiempo real con detección automática de reanudación.
- ✅ **Validación Robusta**: Control de formatos y tamaño de archivos (hasta 2GB).

## 🏗️ Arquitectura

La aplicación ya no se comunica directamente con BunnyNet para operaciones sensibles. Sigue este flujo:

1. **Frontend** → Solicita autorización (Login) al Worker.
2. **Worker** → Valida credenciales y devuelve un **JWT**.
3. **Frontend** → Solicita credenciales de subida firmadas al Worker enviando el JWT.
4. **Worker** → Crea el objeto de video en BunnyNet y genera una firma TUS (`SHA256`).
5. **Frontend** → Sube el archivo directamente a BunnyNet usando `tus-js-client` con la firma recibida.

## 📋 Requisitos Previos

- **Node.js**: v18 o superior.
- **pnpm**: Recomendado (o npm/yarn).
- **Backend**: Cloudflare Worker configurado (ver sección de Worker).

## 🛠️ Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Variables de Entorno:**
   Crea un archivo `.env` (o usa `.env.development` para local) con:
   ```env
   VITE_BUNNY_LIBRARY_ID=tu_library_id
   VITE_WORKER_API_URL=https://tu-worker.com/api
   ```
   *Nota: Ya no se requiere `VITE_BUNNY_API_KEY` en el frontend.*

## 🚀 Scripts Disponibles

- `pnpm run dev`: Inicia el entorno de desarrollo.
- `pnpm run build`: Genera el bundle de producción optimizado.
- `pnpm run preview`: Previsualiza la versión de producción.

## 📁 Estructura del Proyecto

```
upload-video/
├── src/
│   ├── components/
│   │   ├── Login.tsx            # Interfaz de acceso
│   │   ├── VideoUploader.tsx    # Gestión de subidas TUS
│   │   └── CollectionsManager.tsx # CRUD de colecciones
│   ├── services/
│   │   ├── auth.ts              # Servicio de JWT y Login
│   │   └── bunnynet.ts          # Integración TUS y Proxy Worker
│   ├── types/
│   │   └── index.ts             # Definiciones de TypeScript
│   ├── App.tsx                  # Layout principal y navegación por pestañas
│   └── main.tsx                 # Entrada de la aplicación
├── .env                         # Configuración de producción
└── .env.development             # Configuración de desarrollo local
```

## 📝 Notas de Implementación

### Manejo de Descripciones
BunnyNet ignora la descripción en el momento de creación vía TUS. Para que la descripción se guarde, el **Worker** debe realizar un `POST` de actualización al endpoint de video justo después de crearlo, antes de devolver la firma al frontend.

### Error HEAD 404
Al iniciar una subida, es normal ver un error `404` en la consola dirigido a `/tusupload/...`. Es la librería `tus-js-client` buscando sesiones previas para el nuevo VideoID. Ignora este mensaje; la subida comenzará normalmente.
