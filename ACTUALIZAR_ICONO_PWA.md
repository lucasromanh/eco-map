# 🔄 FORZAR ACTUALIZACIÓN DE ÍCONO PWA

## ✅ CAMBIOS APLICADOS

He actualizado todos los archivos para forzar la recarga del ícono de la PWA:

### 1. **manifest.json** → Versión 6

- ✅ Todos los íconos ahora tienen `?v=6`
- ✅ `start_url` cambiado a `/?pwa=v6` (fuerza reinstalación)
- ✅ Shortcuts actualizados con `?v=6`

### 2. **sw.js** → Service Worker v6

- ✅ `CACHE_NAME` cambiado a `ecomap-v6`
- ✅ PRECACHE_URLS actualizado con `?v=6`
- ✅ Forzará descarga de nuevos recursos

### 3. **index.html** → Links actualizados

- ✅ `<link rel="manifest" href="/manifest.json?v=6">`
- ✅ `<link rel="icon" href="/icon-192.svg?v=6">`
- ✅ `<link rel="apple-touch-icon" href="/icon-192.svg?v=6">`

---

## 📋 PASOS PARA ACTUALIZAR LA PWA

### En el Servidor:

1. **Compilar la aplicación**:

   ```bash
   npm run build
   ```

2. **Subir TODOS los archivos** de `dist/` al servidor

   - Especialmente: `manifest.json`, `sw.js`, `index.html`, iconos

3. **Verificar que se subieron correctamente**:
   - https://ecomap.saltacoders.com/manifest.json?v=6
   - https://ecomap.saltacoders.com/icon-192.svg?v=6

---

## 📱 EN TU CELULAR (Después de subir al servidor):

### Opción 1: Limpiar caché del navegador (RECOMENDADO)

#### Safari (iOS):

1. Abre **Configuración** → **Safari**
2. Desplázate hacia abajo y toca **"Borrar historial y datos de sitios web"**
3. Confirma
4. Vuelve a Safari y visita `https://ecomap.saltacoders.com`
5. Agrega a pantalla de inicio nuevamente

#### Chrome/Edge (Android):

1. Abre **Chrome**
2. Toca los **3 puntos** (menú)
3. **Configuración** → **Privacidad y seguridad**
4. **Borrar datos de navegación**
5. Selecciona:
   - ✅ Imágenes y archivos en caché
   - ✅ Datos de sitios
6. **Borrar datos**
7. Visita `https://ecomap.saltacoders.com`
8. Agrega a pantalla de inicio

---

### Opción 2: Modo incógnito (MÁS RÁPIDO)

1. Abre el navegador en **modo incógnito/privado**
2. Visita `https://ecomap.saltacoders.com`
3. Agrega a pantalla de inicio desde el modo incógnito
4. El ícono debería ser el nuevo

---

### Opción 3: Forzar actualización (Avanzado)

#### Chrome DevTools (En computadora):

1. Abre `https://ecomap.saltacoders.com` en Chrome
2. Presiona **F12** (DevTools)
3. Ve a la pestaña **"Application"**
4. En el menú izquierdo:
   - **Service Workers** → Click en "Unregister"
   - **Storage** → Click en "Clear site data"
5. Recarga la página con **Ctrl+Shift+R** (hard refresh)
6. Instala la PWA nuevamente

---

## 🔍 VERIFICAR QUE FUNCIONÓ

### En el navegador:

1. Abre: `https://ecomap.saltacoders.com/manifest.json?v=6`
2. Busca `"start_url": "/?pwa=v6"`
3. Busca `"src": "/icon-192.svg?v=6"`
4. Si ves `?v=6` en todos los íconos → ✅ Correcto

### En DevTools:

1. **Application** → **Manifest**
2. Deberías ver todos los íconos con `?v=6`
3. Deberías ver "Start URL: /?pwa=v6"

### En el celular:

1. Después de instalar la PWA
2. El ícono en la pantalla de inicio debe ser el NUEVO
3. Si sigue siendo el viejo → Repite Opción 1 (borrar caché)

---

## ⚠️ IMPORTANTE

### El cambio de ícono NO se aplica automáticamente porque:

1. El navegador **cachea** el manifest.json
2. El navegador **cachea** los íconos (.svg)
3. El sistema operativo **cachea** los íconos de apps instaladas

### Por eso necesitas:

1. ✅ Subir nuevos archivos al servidor
2. ✅ Limpiar caché del navegador
3. ✅ Desinstalar y reinstalar la PWA

---

## 🎯 RESUMEN RÁPIDO

```bash
# 1. En tu computadora
npm run build

# 2. Sube todo el contenido de dist/ al servidor

# 3. En tu celular
- Desinstala la PWA actual
- Borra caché del navegador
- Visita https://ecomap.saltacoders.com
- Instala la PWA nuevamente
```

---

## 📸 CÓMO VERIFICAR EL ÍCONO

### Antes de instalar:

En el navegador, cuando tocas "Agregar a Inicio", deberías ver una **preview** del ícono nuevo.

### Después de instalar:

El ícono en la pantalla de inicio debe ser el nuevo (el que está en `icon-192.svg` y `icon-512.svg`).

---

## 🐛 SI SIGUE SIN FUNCIONAR

### Último recurso:

1. Desinstala la PWA completamente
2. Borra TODO el caché del navegador
3. **Reinicia el celular** 📱
4. Abre el navegador
5. Visita `https://ecomap.saltacoders.com`
6. Instala la PWA

El ícono debería actualizarse porque:

- ✅ `manifest.json` tiene `?v=6` (nuevo)
- ✅ `start_url` es diferente (`/?pwa=v6`)
- ✅ Service Worker es v6 (cachea nuevos íconos)
- ✅ Todos los íconos tienen `?v=6` (cache-busting)

---

## ✅ CONFIRMACIÓN

Una vez que hagas el build y lo subas al servidor, el sistema detectará que es una **nueva versión** de la PWA y forzará la descarga de los nuevos íconos.

El `?v=6` y el cambio de `start_url` garantizan que el navegador NO use el caché anterior.
