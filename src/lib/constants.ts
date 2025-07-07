import { 
  Sprout, Apple, Building2, Leaf, GlassWater, Utensils, SprayCan, Trophy, Tent, Trash2, 
  Droplets, Sparkles, Megaphone, Shirt, Sofa, PawPrint, CircleDashed, Mountain, Package, 
  Trees, LeafyGreen, Gift, Wrench, Sun, Laptop, SunDim, Tag, LeafyGreen as LeafyGreen2 
} from 'lucide-react';

/**
 * Mapping of categories to their corresponding colors
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'Agricultura': 'text-green-600',
  'Alimentos': 'text-red-500',
  'Arquitectura, construcción y diseño': 'text-amber-600',
  'Asesorías medioambientales': 'text-emerald-500',
  'Bebidas': 'text-blue-400',
  'Cocina': 'text-orange-500',
  'Cosmética e higiene personal': 'text-pink-400',
  'Deportes': 'text-red-600',
  'Ferias': 'text-purple-500',
  'Gestión de residuos': 'text-gray-600',
  'Gestión del agua': 'text-blue-500',
  'Limpieza': 'text-blue-300',
  'Marketing': 'text-fuchsia-500',
  'Moda y Accesorios': 'text-rose-500',
  'Muebles y decoración': 'text-amber-800',
  'Mascotas': 'text-amber-600',
  'Neumáticos': 'text-gray-500',
  'Outdoor': 'text-green-500',
  'Packaging': 'text-blue-600',
  'Paisajismo y jardinería': 'text-green-700',
  'Producto sostenible': 'text-green-500',
  'Regalos corporativos': 'text-purple-400',
  'Repuestos': 'text-gray-700',
  'Servicios medioambientales': 'text-teal-500',
  'Solar Fotovoltáica': 'text-yellow-500',
  'Tecnología': 'text-indigo-600',
  'Terraza y aire libre': 'text-sky-500'
};
import { ComponentType, SVGProps } from 'react';

/**
 * Library containing application-wide constants.
 * @module constants
 */

/**
 * Mapping of categories to their corresponding Lucide icons
 */
export const CATEGORY_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'Agricultura': Sprout,
  'Alimentos': Apple,
  'Arquitectura, construcción y diseño': Building2,
  'Asesorías medioambientales': Leaf,
  'Bebidas': GlassWater,
  'Cocina': Utensils,
  'Cosmética e higiene personal': SprayCan,
  'Deportes': Trophy,
  'Ferias': Tent,
  'Gestión de residuos': Trash2,
  'Gestión del agua': Droplets,
  'Limpieza': Sparkles,
  'Marketing': Megaphone,
  'Moda y Accesorios': Shirt,
  'Muebles y decoración': Sofa,
  'Mascotas': PawPrint,
  'Neumáticos': CircleDashed,
  'Outdoor': Mountain,
  'Packaging': Package,
  'Paisajismo y jardinería': Trees,
  'Producto sostenible': LeafyGreen,
  'Regalos corporativos': Gift,
  'Repuestos': Wrench,
  'Servicios medioambientales': LeafyGreen2,
  'Solar Fotovoltáica': Sun,
  'Tecnología': Laptop,
  'Terraza y aire libre': SunDim
};

/**
 * List of predefined company categories used throughout the application.
 * Categories are sorted alphabetically and should be kept in sync with the profile edit form.
 * @type {string[]}
 */
export const COMPANY_CATEGORIES = Object.keys(CATEGORY_ICONS).sort();

/**
 * Get the icon component for a category, or a default one if not found
 * @param category The category name
 * @returns The corresponding Lucide icon component or a default one
 */
export const getCategoryIcon = (category: string): ComponentType<SVGProps<SVGSVGElement>> => {
  return CATEGORY_ICONS[category] || Tag;
};

/**
 * Get the color class for a category, or a default one if not found
 * @param category The category name
 * @returns The corresponding Tailwind color class
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || 'text-gray-500';
};
