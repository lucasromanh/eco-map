# 📖 Guía Rápida de Uso - EcoMap

## 🚀 Inicio Rápido

### 1️⃣ Permitir Ubicación

Cuando abras la app por primera vez, **permite el acceso a tu ubicación**:

- En móvil: Acepta el permiso cuando se solicite
- El mapa se centrará automáticamente en tu posición
- Verás un marcador azul pulsante 🔵 indicando tu ubicación

### 2️⃣ Ver Datos Ambientales en Tiempo Real

Los datos ambientales aparecen **automáticamente** en el panel flotante superior derecho:

```
┌─────────────────────────────┐
│ Condiciones Ambientales     │
│ 🌡️ Temperatura: 22.5°C      │
│ 💧 Humedad: 65%             │
│ 💨 Viento: 12.3 km/h        │
│ ☀️ Índice UV: 5.2           │
│                             │
│ Estado: Bueno (85/100)      │
└─────────────────────────────┘
```

**¿No ves los datos?**

- Verifica que tengas conexión a Internet
- Los datos se actualizan automáticamente basándose en tu ubicación
- Si moviste el mapa, refresca tu ubicación con el botón 📍

---

## 📝 Crear un Reporte

### Método 1: Desde el Header

1. Haz clic en el botón verde **"Agregar"** en la parte superior
2. Se abrirá un formulario modal

### Método 2: Desde el Mapa

1. Haz **clic en cualquier punto del mapa**
2. Se abrirá el formulario con la ubicación seleccionada

### Completar el Formulario

```
┌─────────────────────────────┐
│ Nuevo Reporte               │
├─────────────────────────────┤
│ Título: [Descripción corta] │
│                             │
│ Categoría: (Elige una)      │
│  🗑️ Basural  🌳 Plaza      │
│  🌿 Zona Verde  🏭 Contam.  │
│  🪓 Deforest.  ♻️ Reciclaje│
│  💧 Agua  📍 Otro           │
│                             │
│ Descripción:                │
│ [Describe lo observado...]  │
│                             │
│ Imagen: (Opcional)          │
│  📸 Cámara  🖼️ Galería     │
│                             │
│ 📍 Ubicación: -34.6, -58.3  │
│                             │
│ [Cancelar] [Guardar]        │
└─────────────────────────────┘
```

**Tips:**

- 📸 **Para tomar foto**: Clic en "Cámara" → acepta permisos
- 🖼️ **Para subir foto**: Clic en "Galería" → selecciona imagen
- Las imágenes se comprimen automáticamente
- La ubicación se detecta automáticamente

---

## 📋 Ver y Gestionar Reportes

### Abrir Lista de Reportes

1. Haz clic en el botón **☰** (menú) en el header
2. Se abrirá un panel lateral con todos tus reportes

### En la Lista Puedes:

- **Ver detalles**: Clic en cualquier reporte
- **Ir al mapa**: Al hacer clic, el mapa se centra en ese reporte
- **Eliminar**: Clic en el botón 🗑️ rojo
- **Eliminar todos**: Botón inferior "Eliminar todos"

### Tarjeta de Reporte

```
┌─────────────────────────────┐
│ [Imagen si hay]             │
├─────────────────────────────┤
│ 🗑️ Basural en Av. Principal│
│                             │
│ Acumulación de residuos...  │
│                             │
│ [Basural] Hace 2h    🗑️    │
│ 📍 -34.60370, -58.38160     │
└─────────────────────────────┘
```

---

## 📷 Usar Street View (Vista de Calle)

### ¿Qué es Street View?

Imágenes panorámicas **gratuitas** de las calles tomadas por la comunidad de KartaView.

### Cómo Usarlo

1. **Abrir Street View**

   - Haz clic en el botón **📷 Street View** (esquina inferior izquierda)

2. **Buscar Imágenes**

   ```
   ┌─────────────────────────────┐
   │ Vista de Calle              │
   ├─────────────────────────────┤
   │ Radio de búsqueda: [====] 100m
   │                [🔄 Buscar]  │
   └─────────────────────────────┘
   ```

   - Ajusta el radio (50-500 metros)
   - Haz clic en "🔄 Buscar"

3. **Ver Imágenes**
   - Miniaturas aparecen a la derecha
   - Haz clic en una miniatura para verla en grande
   - Haz clic en "Ver en KartaView 🔗" para navegación 360°

**¿No hay imágenes?**

- Aumenta el radio de búsqueda
- Muévete a otra ubicación
- Las imágenes son contribuidas por la comunidad (pueden no existir en todas partes)

---

## 🗺️ Funciones del Mapa

### Navegación Básica

- **Zoom**: Rueda del mouse o botones +/-
- **Mover**: Arrastra con el mouse o dedo
- **Centrar en tu ubicación**: Botón 📍 (inferior izquierda)

### Vista Satélite

1. Haz clic en el botón **🛰️** (esquina inferior derecha)
2. Alterna entre:
   - 🗺️ Vista de mapa (OpenStreetMap)
   - 🛰️ Vista satélite (Esri)

### Marcadores en el Mapa

**Tu ubicación**: 🔵 Punto azul pulsante
**Reportes**: Iconos según categoría

- 🗑️ Rojo = Basural
- 🌳 Verde = Plaza
- 🌿 Verde claro = Zona Verde
- 🏭 Gris = Contaminación
- etc.

### Hacer Clic en Marcadores

Al hacer clic en cualquier marcador se abre un popup con:

- Título del reporte
- Categoría y fecha
- Descripción completa
- Imagen (si existe)
- Coordenadas exactas

---

## 🌙 Modo Oscuro

### Activar/Desactivar

1. Haz clic en el botón **☀️/🌙** en el header
2. El tema cambia inmediatamente
3. Se guarda automáticamente (persiste al cerrar)

**Colores:**

- 🌞 **Modo Claro**: Fondo blanco, texto oscuro
- 🌙 **Modo Oscuro**: Fondo oscuro, texto claro

---

## 📱 Instalar como App (PWA)

### En Android

1. Abre Chrome
2. Ve a EcoMap
3. Menú (⋮) → "Agregar a pantalla de inicio"
4. Confirma la instalación
5. ¡Listo! Ahora tienes un ícono en tu pantalla de inicio 🌍

### En iPhone/iPad

1. Abre Safari
2. Ve a EcoMap
3. Toca el botón **Compartir** (□ con flecha hacia arriba)
4. Desplázate y toca **"Agregar a pantalla de inicio"**
5. Toca **"Agregar"**
6. ¡Listo! Aparecerá el ícono verde de EcoMap 🌍

### En Desktop (Chrome/Edge)

1. Ve a EcoMap
2. Busca el ícono de instalación en la barra de direcciones (+)
3. Haz clic en "Instalar"
4. ¡Listo! Ahora puedes abrir EcoMap como una app

**Beneficios de instalar:**

- ✅ Acceso rápido desde la pantalla de inicio
- ✅ Funciona sin conexión (offline)
- ✅ Experiencia de app nativa
- ✅ Sin barra del navegador

---

## 🆘 Solución de Problemas

### "No se puede obtener la ubicación"

**Soluciones:**

1. Permite el acceso a la ubicación en tu navegador
2. Verifica que tengas GPS o WiFi activo
3. En móvil, habilita permisos en Ajustes → Apps → Navegador → Permisos
4. Haz clic en el botón 📍 para reintentar

### "No veo los datos ambientales"

**Soluciones:**

1. Verifica tu conexión a Internet
2. Espera unos segundos (se cargan automáticamente)
3. Refresca tu ubicación con el botón 📍
4. Recarga la página (F5)

### "No puedo tomar fotos"

**Soluciones:**

1. Permite el acceso a la cámara cuando se solicite
2. En móvil: Ajustes → Apps → Navegador → Permisos → Cámara
3. Intenta usar "Galería" en lugar de "Cámara"

### "Street View no muestra imágenes"

**Explicación:**

- KartaView depende de contribuciones de la comunidad
- No todas las áreas tienen cobertura
- Aumenta el radio de búsqueda (hasta 500m)
- Intenta en otra ubicación

### "Los reportes desaparecieron"

**Causa:**

- Los reportes se guardan en el navegador (localStorage)
- Si limpiaste los datos del navegador, se borran

**Solución:**

- Los datos son locales, no hay recuperación
- Considera exportar/hacer backup regularmente
- En futuras versiones habrá sincronización en la nube

---

## ⌨️ Atajos de Teclado

| Tecla | Acción                     |
| ----- | -------------------------- |
| `?`   | Abrir ayuda/tutorial       |
| `N`   | Nuevo reporte              |
| `L`   | Lista de reportes          |
| `S`   | Street View                |
| `T`   | Alternar tema claro/oscuro |
| `ESC` | Cerrar modales             |

---

## 💡 Tips y Trucos

1. **Reportes Rápidos**: Haz clic directamente en el mapa para crear reportes más rápido

2. **Precisión de Ubicación**: Permite ubicación de alta precisión en tu dispositivo

3. **Ahorrar Datos**: El modo satélite consume más datos que el mapa normal

4. **Batería**: La geolocalización constante puede consumir batería en móviles

5. **Compartir**: Puedes tomar screenshots de tus reportes para compartir en redes sociales

6. **Offline**: Instala como PWA para acceder sin conexión a reportes guardados

---

## 📞 Soporte

**¿Necesitas más ayuda?**

- 📖 Lee el README.md completo
- ❓ Abre el tutorial nuevamente (botón ? en header)
- 🐛 Reporta problemas técnicos

---

**¡Listo! Ahora estás preparado para usar EcoMap y ayudar a cuidar el medio ambiente** 🌍💚

_Última actualización: Octubre 2025_
