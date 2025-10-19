/**
 * Genera un ID único simple
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formatea una fecha a formato legible
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `Hace ${minutes} min`;
  }
  if (hours < 24) {
    return `Hace ${hours}h`;
  }
  if (days < 7) {
    return `Hace ${days}d`;
  }
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Convierte un archivo a base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Comprime una imagen
 * Soporta: jpg, jpeg, png, webp
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      reject(new Error('Formato de imagen no válido. Use: JPG, PNG o WebP'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determinar el tipo de salida (preservar WebP, convertir otros a JPEG)
        let outputType = 'image/jpeg';
        let outputQuality = quality;
        
        if (file.type === 'image/webp') {
          outputType = 'image/webp';
        } else if (file.type === 'image/png') {
          // PNG con transparencia se mantiene como PNG
          outputType = 'image/png';
          outputQuality = 1; // PNG no usa quality de la misma forma
        }
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          outputQuality
        );
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};

/**
 * Formatea coordenadas para mostrar
 */
export const formatCoordinates = (lat: number, lon: number): string => {
  return `${lat.toFixed(5)}°, ${lon.toFixed(5)}°`;
};

/**
 * Trunca texto largo
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
