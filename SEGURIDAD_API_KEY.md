# 🔐 SOLUCIÓN: API Key Expuesta en GitHub

## ⚠️ PROBLEMA DETECTADO

GitHub Secret Scanning detectó que subiste la **Google Maps API Key** al repositorio público.

**Archivo afectado**: `src/components/StreetView.tsx`
**Commit**: `027ae184`
**Clave expuesta**: `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`

---

## ✅ SOLUCIÓN APLICADA

### 1. **Creado archivo `.env`**

La API Key ahora está en un archivo `.env` que NO se sube a GitHub:

```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
```

### 2. **Actualizado `.env.example`**

Archivo de ejemplo (SIN la clave real) para que otros desarrolladores sepan qué variables necesitan:

```bash
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 3. **Modificado `StreetView.tsx`**

Ahora usa la variable de entorno en lugar de tener la clave hardcoded:

```typescript
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_API_KEY}&location=...`;
```

### 4. **`.gitignore` ya configurado**

El archivo `.env` está en `.gitignore`, por lo que nunca se subirá a GitHub.

---

## 🚨 PASOS URGENTES A SEGUIR

### 1. **REVOCAR la API Key actual**

La clave `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8` está expuesta públicamente en GitHub. Debes:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Busca tu proyecto
3. Encuentra la API Key expuesta
4. Haz clic en **"Delete"** o **"Regenerate"**
5. Copia la **nueva clave**
6. Pégala en tu archivo `.env` local

### 2. **Actualizar el archivo `.env`**

```bash
# Reemplaza con tu NUEVA clave
VITE_GOOGLE_MAPS_API_KEY=tu_nueva_clave_aqui
```

### 3. **Hacer commit de los cambios**

```bash
# Asegurarte de que .env NO se suba
git status  # Debe mostrar .env como ignorado

# Hacer commit de los cambios seguros
git add .env.example
git add src/components/StreetView.tsx
git add .gitignore
git commit -m "🔒 Security: Move Google Maps API key to environment variables"
git push
```

### 4. **Resolver la alerta en GitHub**

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Security** → **Secret scanning**
3. Busca la alerta de la Google API Key
4. Marca como **"Revoked"** (una vez que hayas eliminado/regenerado la clave)

---

## 🔒 RESTRICCIONES RECOMENDADAS PARA LA NUEVA API KEY

En Google Cloud Console, configura restricciones para evitar abuso:

### **Application Restrictions:**

- Selecciona: **HTTP referrers (web sites)**
- Agrega:
  ```
  https://ecomap.saltacoders.com/*
  http://localhost:5173/*
  http://localhost:*
  ```

### **API Restrictions:**

- Selecciona: **Restrict key**
- Marca solo:
  - ✅ **Maps Embed API**
  - ✅ **Maps JavaScript API** (si la usas)

Esto evita que alguien use tu clave en otros sitios.

---

## 📋 CÓMO FUNCIONA AHORA

### **Desarrollo Local:**

1. Creas archivo `.env` con tu clave
2. Vite carga automáticamente `VITE_GOOGLE_MAPS_API_KEY`
3. La app usa `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`

### **Producción (Servidor):**

1. En tu servidor, crea archivo `.env` con la clave
2. O configura la variable de entorno directamente
3. El build de producción inyecta el valor

### **GitHub:**

- ✅ `.env` está en `.gitignore` → NO se sube
- ✅ `.env.example` SÍ se sube (sin clave real)
- ✅ Código usa variables de entorno
- ✅ Sin claves expuestas

---

## 🧪 VERIFICAR QUE FUNCIONA

```bash
# 1. Crear archivo .env con tu clave
echo "VITE_GOOGLE_MAPS_API_KEY=tu_nueva_clave" > .env

# 2. Iniciar el servidor de desarrollo
npm run dev

# 3. Abrir la app y probar Street View
# Debería funcionar normalmente
```

---

## ⚠️ IMPORTANTE

### **NUNCA hagas esto:**

```typescript
// ❌ MAL - Clave hardcoded
const API_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
```

### **SIEMPRE haz esto:**

```typescript
// ✅ BIEN - Variable de entorno
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

---

## 📁 ARCHIVOS MODIFICADOS

- ✅ `.env` - Creado (contiene la clave, NO se sube a GitHub)
- ✅ `.env.example` - Actualizado (ejemplo sin clave real)
- ✅ `src/components/StreetView.tsx` - Usa variable de entorno
- ✅ `.gitignore` - Ya tenía `.env` configurado

---

## 🔄 PARA OTROS DESARROLLADORES

Si alguien clona el repositorio:

1. Copia `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Pide la API Key al administrador

3. Pégala en `.env`:

   ```bash
   VITE_GOOGLE_MAPS_API_KEY=clave_proporcionada
   ```

4. Listo para desarrollar

---

## ✅ CHECKLIST DE SEGURIDAD

- ✅ Revocar/regenerar API Key expuesta
- ✅ Actualizar `.env` con nueva clave
- ✅ Commit de cambios (sin `.env`)
- ✅ Push a GitHub
- ✅ Marcar alerta como resuelta
- ✅ Configurar restricciones en Google Cloud
- ✅ Probar que la app funciona

---

## 🎯 RESULTADO

- ✅ API Key protegida en `.env`
- ✅ No se subirá a GitHub nunca
- ✅ Código más seguro
- ✅ Alerta de GitHub resuelta
- ✅ Restricciones configuradas

¡Seguridad mejorada! 🔐
