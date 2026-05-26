// Importamos las categorias en todos los idiomas
import {categoriesCharades as categoriesCharadesEN} from '../data/categoriesCharadesEN';
import {categoriesCharades as categoriesCharadesES} from '../data/categoriesCharadesES';
import {categoriesCharades as categoriesCharadesFR} from '../data/categoriesCharadesFR';
import {categoriesCharades as categoriesCharadesZH} from '../data/categoriesCharadesZH';

const getCategoriesByLanguage = (language) => {

  switch (language) {
    case 'Español':
      return categoriesCharadesES;

    case 'Français':
      return categoriesCharadesFR;

    case '中文':
      return categoriesCharadesZH;

    default:
      return categoriesCharadesEN;
  }
};

export const getRandomCategory = (language) => {

  const categories = getCategoriesByLanguage(language);

  const keys = Object.keys(categories); // Object.keys nos devuelve solo el nombre de las categorias

  return keys[Math.floor(Math.random() * keys.length)];
};

export const getRandomWord = (category,usedWords,language) => {

  const categories = getCategoriesByLanguage(language);

  const words = categories[category];

  if (!words) return null;

  const available = words.filter(word =>!usedWords.includes(word));

  // Si ya se usadon todas las palabras, reiniciamos el array de usadas para que se puedan repetir
  if (available.length === 0) {

    return words[Math.floor(Math.random() * words.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
};