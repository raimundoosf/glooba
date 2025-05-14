/**
 * Library containing application-wide constants.
 * @module constants
 */

/**
 * Mapping of categories to their corresponding emojis
 */
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Agricultura': '🌱',
  'Alimentos': '🍎',
  'Arquitectura, construcción y diseño': '🏗️',
  'Asesorías medioambientales': '🌍',
  'Bebidas': '🥤',
  'Cocina': '👨‍🍳',
  'Cosmética e higiene personal': '🧴',
  'Deportes': '⚽',
  'Ferias': '🎪',
  'Gestión de residuos': '🗑️',
  'Gestión del agua': '💧',
  'Limpieza': '🧹',
  'Marketing': '📢',
  'Moda y Accesorios': '👕',
  'Muebles y decoración': '🛋️',
  'Mascotas': '🐾',
  'Neumáticos': '🛞',
  'Outdoor': '⛺',
  'Packaging': '📦',
  'Paisajismo y jardinería': '🌳',
  'Producto sostenible': '♻️',
  'Regalos corporativos': '🎁',
  'Repuestos': '🔧',
  'Servicios medioambientales': '🌿',
  'Solar Fotovoltáica': '☀️',
  'Tecnología': '💻',
  'Terraza y aire libre': '🌤️'
};

/**
 * List of predefined company categories used throughout the application.
 * Categories are sorted alphabetically and should be kept in sync with the profile edit form.
 * @type {string[]}
 */
export const COMPANY_CATEGORIES = Object.keys(CATEGORY_EMOJIS).sort();

/**
 * Get the emoji for a category, or a default emoji if not found
 * @param category The category name
 * @returns The corresponding emoji or a default one
 */
export const getCategoryEmoji = (category: string): string => {
  return CATEGORY_EMOJIS[category] || '🏷️';
};
