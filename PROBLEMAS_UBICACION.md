# 🗺️ Solución de Problemas de Ubicación - EcoMap

## ❓ ¿Por qué veo "Tiempo de espera agotado al obtener ubicación"?

Este mensaje aparece cuando el navegador no puede obtener tu ubicación GPS en el tiempo establecido. Es común y tiene varias soluciones.

---

## ✅ Soluciones Rápidas

### 1️⃣ **Verifica los Permisos del Navegador**

#### En Chrome/Edge:

1. Haz clic en el **candado** 🔒 o el icono **i** en la barra de direcciones
2. Busca "Ubicación" o "Location"
3. Cambia a **"Permitir"** o **"Allow"**
4. Recarga la página (F5)

#### En Firefox:

1. Haz clic en el **icono de escudo** o **candado** 🔒
2. Ve a "Permisos" → "Ubicación"
3. Marca **"Permitir"**
4. Recarga la página (F5)

#### En Safari (iPhone/iPad):

1. Ve a **Ajustes** → **Safari** → **Ubicación**
2. Selecciona **"Permitir"**
3. Recarga la página en Safari

---

### 2️⃣ **Activa el GPS en tu Dispositivo**

#### En Windows:

1. Abre **Configuración** (Win + I)
2. Ve a **Privacidad y seguridad** → **Ubicación**
3. Activa **"Servicios de ubicación"**
4. Asegúrate de que tu navegador tenga permiso

#### En Android:

1. Desliza desde arriba y activa **GPS** 📡
2. O ve a **Ajustes** → **Ubicación** → **Activar**

#### En iPhone/iPad:

1. Ve a **Ajustes** → **Privacidad** → **Ubicación**
2. Activa **"Servicios de ubicación"**
3. Busca **Safari** y selecciona **"Mientras uso la app"**

---

### 3️⃣ **Mejora la Señal GPS**

- 🌤️ **Sal al exterior** - El GPS funciona mejor al aire libre
- 🏢 **Aléjate de edificios altos** - Pueden bloquear la señal
- ⏳ **Espera unos segundos** - El GPS puede tardar en conectarse
- 📶 **Verifica tu conexión WiFi** - Ayuda a triangular la ubicación

---

### 4️⃣ **Alternativa: Usa el Mapa Manualmente**

**¡No necesitas GPS para usar EcoMap!** 🎉

1. **Haz clic en cualquier punto del mapa** 🗺️
   - El mapa te mostrará datos ambientales de esa ubicación
2. **Busca tu ciudad**:
   - Mueve el mapa arrastrando con el mouse/dedo
   - Usa el zoom (+/-) para acercarte
3. **Crear reportes sin GPS**:
   - Haz clic en el mapa donde quieras reportar
   - Se abrirá el modal con esas coordenadas

---

## 🔧 Soluciones Avanzadas

### Limpiar Caché del Navegador

1. Presiona **Ctrl + Shift + Delete** (Windows) o **Cmd + Shift + Delete** (Mac)
2. Selecciona "Datos de sitios" o "Caché"
3. Limpia los últimos 24 horas
4. Recarga EcoMap

### Probar en Modo Incógnito

1. Abre una ventana de incógnito (Ctrl + Shift + N)
2. Ve a http://localhost:5174
3. Da permisos de ubicación nuevamente

---

## 📱 Problemas Específicos por Dispositivo

### **"Permiso denegado"** ❌

- Has bloqueado la ubicación anteriormente
- **Solución**: Sigue los pasos de "Verifica los Permisos" arriba

### **"Ubicación no disponible"** 📡

- El GPS no puede obtener señal
- **Solución**: Activa WiFi, sal al exterior o usa el mapa manualmente

### **"Tiempo agotado"** ⏱️

- El GPS tarda demasiado en responder
- **Solución**: La app intentará con GPS de baja precisión automáticamente
- **Alternativa**: Usa el mapa manualmente

---

## 💡 Consejos Pro

### ✅ **Para mejor precisión:**

- Activa **WiFi** incluso si usas datos móviles
- Activa **GPS de alta precisión** en ajustes
- Espera 10-15 segundos la primera vez

### ✅ **Si sigues teniendo problemas:**

- **Usa el mapa manualmente** - ¡Funciona igual de bien!
- **Presiona el botón de actualización** 🔄 (esquina inferior derecha)
- **Cierra y vuelve a abrir el navegador**

---

## 🆘 Preguntas Frecuentes

**P: ¿Puedo usar EcoMap sin GPS?**  
✅ **Sí, totalmente.** Haz clic en cualquier punto del mapa para ver datos ambientales.

**P: ¿Por qué funciona en Google Maps pero no aquí?**  
Google Maps usa servidores propios de ubicación. EcoMap usa el GPS del navegador, que puede tardar más la primera vez.

**P: ¿Es seguro dar permisos de ubicación?**  
✅ **Sí.** EcoMap NO envía tu ubicación a ningún servidor. Todo se guarda localmente en tu dispositivo.

**P: ¿Por qué la precisión es de 10-20 metros?**  
Es normal. El GPS del navegador tiene menos precisión que apps nativas como Google Maps.

---

## 🎯 Resumen Visual

```
❌ No funciona GPS
    ↓
✅ Verifica permisos del navegador
    ↓
✅ Activa GPS en el dispositivo
    ↓
✅ Sal al exterior / espera
    ↓
✅ O usa el mapa manualmente (¡clic en el mapa!)
```

---

## 📞 ¿Aún tienes problemas?

1. Presiona el botón **?** (Ayuda) en el header
2. Lee el tutorial interactivo
3. Revisa `GUIA_RAPIDA.md` para más información

**Recuerda:** ¡Puedes usar EcoMap perfectamente haciendo clic en el mapa sin necesidad de GPS! 🗺️✨
