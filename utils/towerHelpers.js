import { categories as categoriesEN } from '../data/categoriesTowerEN';

import { categories as categoriesES } from '../data/categoriesTowerES';

import { categories as categoriesFR } from '../data/categoriesTowerFR';

import { categories as categoriesZH } from '../data/categoriesTowerZH';

const categoriesByLanguage = {
  English: categoriesTowerEN,
  Español: categoriesTowerES,
  Français: categoriesTowerFR,
  中文: categoriesTowerZH
};

export const getRandomCategory = (language = 'English') => {

  const categories = categoriesByLanguage[language]|| categoriesTowerEN;

  return categories[Math.floor(Math.random() * categories.length)];
};