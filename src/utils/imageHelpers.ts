// src/utils/imageHelpers.ts

export const getUnifiedImageUrl = (url?: string | null): string => {
  if (!url || url === 'null') {
    return 'https://via.placeholder.com/120x80?text=Sin+foto';
  }

  // Si es base64, devolverla tal cual
  if (url.startsWith('data:')) {
    return url;
  }

  const PUBLIC_HOST = 'https://ecomap.saltacoders.com';

  // Si ya es URL absoluta (http/https)
  if (url.startsWith('http')) {
    // 🔧 Corrige URLs viejas con /ecomap duplicado o srv882-files
    return url
      .replace('https://srv882-files.hstgr.io/ad0821ef897e0cb5/files/public_html/ecomap', PUBLIC_HOST)
      .replace('https://ecomap.saltacoders.com/ecomap/', `${PUBLIC_HOST}/`);
  }

  // Si es ruta relativa (ej: /uploads/reportes/xxx.jpg)
  if (url.startsWith('/uploads/')) {
    return `${PUBLIC_HOST}${url}`;
  }

  // Si es solo el nombre del archivo (ej: 123abc.jpg)
  if (!url.includes('/')) {
    return `${PUBLIC_HOST}/uploads/reportes/${url}`;
  }

  // Fallback final
  return `${PUBLIC_HOST}${url}`;
};
