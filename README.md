# BunnyNet Video Uploader

Aplicación React + Vite para subir videos a BunnyNet con funcionalidad de drag & drop y seguimiento de progreso en tiempo real.

## 🚀 Características

- ✨ **Drag & Drop**: Arrastra y suelta videos directamente
- 📊 **Progreso en tiempo real**: Visualiza el progreso de subida con barra animada
- 🎬 **Preview de video**: Vista previa del video antes de subir
- ✅ **Validación de archivos**: Verifica formato y tamaño (máx. 2GB)
- 🎨 **Diseño moderno**: UI inspirada en Tailwind CSS con gradientes y animaciones
- 📱 **Responsive**: Funciona perfectamente en móviles y desktop

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de BunnyNet con:
  - API Key
  - Library ID
  - Región configurada

## 🛠️ Instalación

1. **Clonar o navegar al directorio del proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Edita el archivo `.env` con tus credenciales de BunnyNet:
   ```env
   VITE_BUNNY_API_KEY=tu_api_key_aqui
   VITE_BUNNY_LIBRARY_ID=tu_library_id_aqui
   VITE_BUNNY_REGION=br
   ```

## 🚀 Uso

### Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5174`

### Producción

Construir para producción:

```bash
npm run build
```

Previsualizar build de producción:

```bash
npm run preview
```

## 🌐 Uso con Cloudflare Tunnel

Para exponer tu aplicación localmente y permitir que otros suban videos:

1. Instala Cloudflare Tunnel (cloudflared)
2. Ejecuta el servidor de desarrollo
3. Crea un túnel:
   ```bash
   cloudflared tunnel --url http://localhost:5174
   ```
4. Comparte la URL generada

## 📁 Estructura del Proyecto

```
upload-video/
├── src/
│   ├── components/
│   │   ├── VideoUploader.tsx      # Componente principal
│   │   └── VideoUploader.css      # Estilos del uploader
│   ├── services/
│   │   └── bunnynet.ts            # Integración con BunnyNet API
│   ├── types/
│   │   └── index.ts               # Definiciones TypeScript
│   ├── App.tsx                    # Componente raíz
│   ├── App.css                    # Estilos de App
│   ├── index.css                  # Estilos globales
│   └── main.tsx                   # Punto de entrada
├── .env                           # Variables de entorno
├── .env.example                   # Plantilla de variables
└── package.json
```

## 🔧 Cómo Funciona

1. **Selección de archivo**: El usuario puede arrastrar un video o hacer clic para seleccionar
2. **Validación**: Se verifica que sea un archivo de video válido y no exceda 500MB
3. **Preview**: Se muestra una vista previa del video seleccionado
4. **Subida**: Al hacer clic en "Subir Video":
   - Se crea un nuevo video en BunnyNet
   - Se sube el archivo directamente desde el navegador
   - Se muestra el progreso en tiempo real
5. **Resultado**: Se muestra mensaje de éxito o error

## 🔐 Nota de Seguridad

⚠️ **IMPORTANTE**: Esta aplicación expone la API key de BunnyNet en el cliente. Para uso en producción, se recomienda:

- Implementar un backend proxy que maneje las credenciales
- Usar tokens temporales o firmados
- Implementar autenticación de usuarios

## 🎨 Personalización

### Cambiar colores del gradiente

Edita `VideoUploader.css` y modifica las propiedades `linear-gradient`:

```css
background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
```

### Ajustar tamaño máximo de archivo

Modifica la constante en `VideoUploader.tsx`:

```typescript
const maxSize = 500 * 1024 * 1024; // Cambia 500 por el tamaño deseado en MB
```

## 📝 API de BunnyNet

Esta aplicación usa la API de BunnyNet Stream:

- **Crear video**: `POST /library/{libraryId}/videos`
- **Subir archivo**: `PUT /library/{libraryId}/videos/{videoId}`

Documentación: [BunnyNet Stream API](https://docs.bunny.net/reference/video_createvideo)

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error de CORS
Asegúrate de que tu biblioteca de BunnyNet permite solicitudes desde tu dominio.

### Video no se sube
- Verifica que las credenciales en `.env` sean correctas
- Revisa la consola del navegador para errores específicos
- Confirma que la región esté configurada correctamente

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.
