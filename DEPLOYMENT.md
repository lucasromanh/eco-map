# 🚀 Guía de Despliegue - EcoMap

## Opciones de Despliegue Gratuito

### 1. Vercel (Recomendado)

Vercel es perfecto para aplicaciones Vite y ofrece hosting gratuito.

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

O desde la interfaz web:

1. Ve a https://vercel.com
2. Conecta tu repositorio de GitHub
3. Vercel detectará automáticamente la configuración de Vite
4. ¡Despliega!

### 2. Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Desplegar
netlify deploy --prod --dir=dist
```

O desde la interfaz web:

1. Ve a https://netlify.com
2. Arrastra la carpeta `dist` después de hacer `npm run build`
3. O conecta tu repositorio de GitHub

### 3. GitHub Pages

1. Instala gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Agrega scripts en `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Actualiza `vite.config.ts`:

```typescript
export default defineConfig({
  base: "/eco-map/", // Reemplaza con el nombre de tu repo
  // ... resto de la configuración
});
```

4. Despliega:

```bash
npm run deploy
```

### 4. Render

1. Ve a https://render.com
2. Conecta tu repositorio
3. Configura:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. ¡Despliega!

## Configuración para PWA

### Headers recomendados

Si usas Netlify, crea `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: geolocation=(self), camera=(self)
```

Si usas Vercel, crea `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Service Worker

El Service Worker ya está configurado en `public/sw.js` y se registra automáticamente.

## Optimizaciones de Producción

### 1. Comprimir Imágenes

Antes de desplegar, optimiza cualquier imagen que agregues:

- Usa https://tinypng.com/ o https://squoosh.app/

### 2. Analizar el Bundle

```bash
# Instalar visualizador
npm install --save-dev rollup-plugin-visualizer

# Agregar a vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer()
  ]
})

# Build y ver análisis
npm run build
```

### 3. Variables de Entorno

Crea archivo `.env.production` para producción:

```env
VITE_MAPILLARY_TOKEN=tu_token_real
VITE_API_URL=https://tu-api.com
```

## Checklist Pre-Despliegue

- [ ] Probar en modo producción localmente: `npm run build && npm run preview`
- [ ] Verificar que la geolocalización funciona (HTTPS requerido)
- [ ] Probar el modo oscuro
- [ ] Verificar responsividad en móvil
- [ ] Probar agregar/eliminar reportes
- [ ] Verificar que el Service Worker se registra correctamente
- [ ] Actualizar el `manifest.json` con URLs de iconos correctas
- [ ] Crear iconos PWA (192x192 y 512x512)

## Crear Iconos PWA

Usa https://realfavicongenerator.net/ o crea manualmente:

```bash
# Iconos requeridos:
# public/icon-192.png (192x192)
# public/icon-512.png (512x512)
# public/favicon.ico
```

## Dominio Personalizado

### Vercel

1. Ve a Project Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

### Netlify

1. Ve a Domain Settings
2. Agrega dominio personalizado
3. Configura los DNS

## HTTPS

Todos los servicios mencionados proveen HTTPS automático y gratuito con Let's Encrypt.

**Importante:** La geolocalización HTML5 **requiere HTTPS** en producción.

## Monitoreo

### Google Analytics (Opcional)

1. Instala:

```bash
npm install react-ga4
```

2. Inicializa en `main.tsx`:

```typescript
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
```

### Sentry para Errores (Opcional)

```bash
npm install @sentry/react
```

## Rendimiento

Después de desplegar, verifica el rendimiento:

- https://pagespeed.web.dev/
- https://www.webpagetest.org/

---

## Soporte

Si tienes problemas con el despliegue:

1. Verifica que `npm run build` funciona localmente
2. Revisa los logs de la plataforma
3. Asegúrate de que las variables de entorno estén configuradas
4. Verifica que los paths de los archivos estáticos sean correctos

¡Buena suerte con el despliegue! 🚀🌍
