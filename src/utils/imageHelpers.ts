// src/utils/imageHelpers.ts

export const getUnifiedImageUrl = (url?: string | null): string => {
  if (!url || url === 'null') {
    return 'https://via.placeholder.com/120x80?text=Sin+foto';
  }

  // Si es base64, devolverla tal cual
  if (url.startsWith('data:')) {
    return url;
  }

  const OLD_HOST = 'https://ecomap.saltacoders.com';
  const NEW_HOST = 'https://srv882-files.hstgr.io/ad0821ef897e0cb5/files/public_html/ecomap';

  // Si ya es una URL absoluta (http/https)
  if (url.startsWith('http')) {
    // Normaliza imágenes antiguas o nuevas sin modificar si funcionan
    return url;
  }

  // Si es ruta relativa (ej: /uploads/reportes/xxx.jpg)
  if (url.startsWith('/uploads/')) {
    return `${NEW_HOST}${url}`;
  }

  // Si solo es el nombre del archivo (ej: 123abc.jpg)
  if (!url.includes('/')) {
    return `${NEW_HOST}/uploads/reportes/${url}`;
  }

  // Fallback final
  return `${OLD_HOST}${url}`;
};
