# 🔧 SOLUCIÓN: Error al guardar foto de perfil

## 📋 PROBLEMA IDENTIFICADO

El error ocurre porque **faltan 2 endpoints en el backend**:

1. `upload_profile_image` - Para subir la foto de perfil
2. `update_user` - Para actualizar los datos del usuario

El frontend los está llamando pero el backend no los tiene implementados.

---

## ✅ SOLUCIÓN

### Opción 1: Copiar el archivo completo (MÁS FÁCIL)

1. En tu servidor, **reemplaza** el archivo `api.php` con el contenido del archivo:

   ```
   API_PHP_COMPLETO.php
   ```

2. Este archivo ya tiene TODOS los endpoints, incluyendo los faltantes.

---

### Opción 2: Agregar solo los endpoints faltantes

1. Abre `api.php` en el servidor

2. Busca la línea que dice:

   ```php
   case 'get_users':
   ```

3. Ve al **final** de ese caso (aproximadamente línea 110)

4. **DESPUÉS** de ese caso, **ANTES** de `case 'add_point':`, pega este código:

```php
  /* ================= ACTUALIZAR PERFIL DE USUARIO ================= */
  case 'upload_profile_image':
    // 📂 Carpeta donde se guardan las fotos de perfil
    $targetDir = __DIR__ . '/uploads/perfiles/';
    if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);

    $fileUrl = null;

    // 🖼️ Procesar imagen si existe
    if (!empty($_FILES['imagen']['name'])) {
      $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));

      // Validar que sea una imagen
      $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!in_array($ext, $allowedExts)) {
        echo json_encode(['ok' => false, 'error' => 'INVALID_FILE_TYPE']);
        exit;
      }

      // Validar tamaño (máximo 5MB)
      if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['ok' => false, 'error' => 'FILE_TOO_LARGE']);
        exit;
      }

      $safeName = 'perfil_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
      $destPath = $targetDir . $safeName;

      if (move_uploaded_file($_FILES['imagen']['tmp_name'], $destPath)) {
        // 🔗 Ruta pública CORRECTA
        $fileUrl = "https://ecomap.saltacoders.com/uploads/perfiles/" . $safeName;
      } else {
        echo json_encode(['ok' => false, 'error' => 'UPLOAD_FAILED']);
        exit;
      }
    } else {
      echo json_encode(['ok' => false, 'error' => 'NO_FILE']);
      exit;
    }

    // 🧠 Obtener ID de usuario
    $usuario_id = $_POST['usuario_id'] ?? null;

    if (!$usuario_id) {
      echo json_encode(['ok' => false, 'error' => 'MISSING_USER_ID']);
      exit;
    }

    // 🔄 Actualizar foto de perfil en la base de datos
    $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = ? WHERE id = ?");
    $ok = $stmt->execute([$fileUrl, $usuario_id]);

    if ($ok) {
      echo json_encode([
        'ok' => true,
        'url' => $fileUrl,
        'message' => '✅ Foto de perfil actualizada'
      ]);
    } else {
      echo json_encode(['ok' => false, 'error' => 'DB_UPDATE_FAILED']);
    }
    break;

  case 'update_user':
    // 📝 Actualizar datos del perfil de usuario
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['id'])) {
      echo json_encode(['ok' => false, 'error' => 'MISSING_USER_ID']);
      exit;
    }

    $usuario_id = $data['id'];
    $nombre = $data['nombre'] ?? '';
    $apellido = $data['apellido'] ?? '';
    $email = $data['email'] ?? '';
    $telefono = $data['telefono'] ?? '';
    $direccion = $data['direccion'] ?? '';
    $edad = $data['edad'] ?? null;

    // 🛑 Validar que el email no esté en uso por otro usuario
    if (!empty($email)) {
      $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
      $stmt->execute([$email, $usuario_id]);
      if ($stmt->fetch()) {
        echo json_encode(['ok' => false, 'error' => 'EMAIL_IN_USE']);
        exit;
      }
    }

    // 🔄 Actualizar datos del usuario
    $stmt = $pdo->prepare("
      UPDATE usuarios
      SET
        nombre = ?,
        apellido = ?,
        email = ?,
        telefono = ?,
        direccion = ?,
        edad = ?
      WHERE id = ?
    ");

    $ok = $stmt->execute([
      $nombre,
      $apellido,
      $email,
      $telefono,
      $direccion,
      $edad,
      $usuario_id
    ]);

    if ($ok) {
      // 📤 Devolver los datos actualizados
      $stmt = $pdo->prepare("SELECT id, nombre, apellido, email, telefono, direccion, edad, foto_perfil FROM usuarios WHERE id = ?");
      $stmt->execute([$usuario_id]);
      $user = $stmt->fetch(PDO::FETCH_ASSOC);

      echo json_encode([
        'ok' => true,
        'user' => $user,
        'message' => '✅ Perfil actualizado correctamente'
      ]);
    } else {
      echo json_encode(['ok' => false, 'error' => 'DB_UPDATE_FAILED']);
    }
    break;
```

---

## 📂 CONFIGURAR CARPETA DE UPLOADS

El código creará automáticamente la carpeta, pero verifica que tenga permisos:

```bash
# En el servidor, ejecuta:
mkdir -p uploads/perfiles
chmod 755 uploads/perfiles
```

---

## 🔍 VERIFICACIÓN

Después de aplicar los cambios, prueba:

1. Abrir el perfil de usuario en la app
2. Seleccionar una foto (máximo 5MB)
3. Hacer clic en "Guardar"
4. La foto debería guardarse en: `https://ecomap.saltacoders.com/uploads/perfiles/perfil_xxxxx.jpg`
5. El perfil debería mostrar la foto actualizada

---

## 🐛 SI SIGUE FALLANDO

Verifica en el navegador (DevTools → Network):

1. La petición a `api.php?action=upload_profile_image`
2. Debe devolver: `{ "ok": true, "url": "https://..." }`
3. Si devuelve error, revisa el mensaje en `error`

---

## 📁 ARCHIVOS CREADOS

He creado 3 archivos en tu proyecto:

1. **BACKEND_ENDPOINTS_FALTANTES.php** - Solo los endpoints nuevos con instrucciones
2. **API_PHP_COMPLETO.php** - El archivo api.php completo y listo para usar
3. **INSTRUCCIONES_PERFIL.md** - Este archivo con instrucciones detalladas

---

## ✅ RESUMEN

**El problema:** El backend no tenía los endpoints para actualizar perfil  
**La solución:** Agregar `upload_profile_image` y `update_user` a api.php  
**Resultado:** Los usuarios podrán subir y guardar su foto de perfil correctamente
