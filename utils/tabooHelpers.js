import { categoriesTaboo } from '../data/categoriesTaboo';

export const getRandomCategory = () => {

  const keys = Object.keys(categoriesTaboo);

  return keys[
    Math.floor(Math.random() * keys.length)
  ];
};

export const getRandomCard = (
  category,
  usedWords
) => {

  const available =
    categoriesTaboo[category].filter(
      item =>
        !usedWords.includes(item.word)
    );

  if (available.length === 0) {

    return categoriesTaboo[category][0];
  }

  return available[
    Math.floor(Math.random() * available.length)
  ];
};