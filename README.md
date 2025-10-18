# 🌍 EcoMap - Mapa Ambiental Colaborativo

Una aplicación web PWA moderna y colaborativa para visualizar y reportar información ambiental en tu comunidad.

## ✨ Características

### 🗺️ Mapa Interactivo

- **Visualización con Leaflet y OpenStreetMap** (100% gratuito)
- **Geolocalización en tiempo real** usando HTML5 Geolocation API
  - ⚠️ **Problemas con la ubicación?** Ver [PROBLEMAS_UBICACION.md](./PROBLEMAS_UBICACION.md)
  - 💡 **Alternativa:** Haz clic en cualquier punto del mapa para explorar sin GPS
- **Vista satelital** alternativa
- **Marcadores personalizados** por categoría con iconos emoji
- **Popups informativos** con datos de cada reporte

### 📊 Datos Ambientales en Tiempo Real

- **Temperatura, humedad y viento** usando Open-Meteo API (gratuita)
- **Índice UV** para protección solar
- **Índice de calidad ambiental** calculado automáticamente
- Panel flotante con información actualizada

### 📝 Sistema de Reportes

- **8 categorías predefinidas**: Basural, Plaza, Zona Verde, Contaminación, Deforestación, Reciclaje, Agua, Otro
- **Formulario intuitivo** con título, descripción y ubicación
- **Captura de fotos** desde cámara o galería
- **Compresión automática** de imágenes
- **Almacenamiento local** con localStorage (sin backend)

### 📷 Street View Gratuito

- Integración con **KartaView** (OpenStreetCam) - completamente gratuito
- Vista de imágenes panorámicas de la calle
- Búsqueda por radio ajustable
- Apertura en visor completo de KartaView

### 🎨 Diseño Moderno

- **TailwindCSS** para estilos minimalistas y responsivos
- **Modo claro/oscuro** con persistencia
- **Animaciones suaves** y transiciones fluidas
- **Completamente responsivo** - funciona en móvil, tablet y desktop
- **Tema verde ecológico** con paleta profesional

### 📱 Progressive Web App (PWA)

- **Instalable** en dispositivos móviles y desktop
- **Funciona offline** con Service Worker
- **Manifest.json** configurado
- **Atajos de aplicación** para acciones rápidas

## 🚀 Tecnologías

- **React 19** + **Vite** - Framework y build tool ultra-rápido
- **TypeScript** - Tipado estático para mayor confiabilidad
- **Leaflet + React-Leaflet** - Mapas interactivos
- **TailwindCSS** - Framework de CSS utility-first
- **Axios** - Cliente HTTP
- **Open-Meteo API** - Datos meteorológicos gratuitos
- **KartaView API** - Imágenes de Street View gratuitas
- **HTML5 Geolocation** - Ubicación del usuario
- **LocalStorage** - Persistencia de datos sin backend

## 📦 Instalación y Uso

### Requisitos Previos

- Node.js 18+ instalado
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con HMR

# Producción
npm run build        # Compila para producción
npm run preview      # Previsualiza build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🌐 APIs Utilizadas

### Open-Meteo (Datos Meteorológicos)

- **URL**: https://api.open-meteo.com/v1/forecast
- **Gratuita**: ✅ Sin límites ni API key requerida
- **Datos**: Temperatura, humedad, viento, precipitación, índice UV

### KartaView (Street View)

- **URL**: https://api.openstreetcam.org
- **Gratuita**: ✅ Completamente open source
- **Datos**: Imágenes panorámicas de calles contribuidas por la comunidad

### OpenStreetMap (Mapas Base)

- **URL**: https://tile.openstreetmap.org
- **Gratuita**: ✅ Open source
- **Datos**: Tiles de mapas colaborativos

## 📱 Uso de la Aplicación

### 1. Primera Vez

- Permite el acceso a tu ubicación cuando se solicite
- El mapa se centrará en tu posición actual
- Verás un panel con datos ambientales de tu zona

### 2. Agregar un Reporte

- Haz clic en el botón "Agregar" en el header
- O haz clic en cualquier punto del mapa
- Completa el formulario con título, categoría y descripción
- (Opcional) Toma una foto o selecciona desde galería
- Presiona "Guardar"

### 3. Ver Reportes

- Haz clic en el botón de lista (☰) en el header
- Navega por todos los reportes guardados
- Haz clic en uno para verlo en el mapa

### 4. Street View

- Haz clic en el botón 📷 "Street View"
- Ajusta el radio de búsqueda
- Selecciona una imagen miniatura

### 5. Alternar Tema

- Haz clic en el ícono de sol/luna en el header

## 📂 Estructura del Proyecto

```
eco-map/
├── public/
│   ├── manifest.json      # Configuración PWA
│   └── sw.js             # Service Worker
├── src/
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom React Hooks
│   ├── services/        # Servicios API
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   └── App.tsx          # Componente principal
└── package.json
```

## 📝 Notas Importantes

Los datos se guardan localmente en el navegador usando localStorage. Si limpias los datos del navegador, perderás los reportes.

## 📄 Licencia

MIT License

---

**Hecho con 💚 para un planeta más verde**

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
