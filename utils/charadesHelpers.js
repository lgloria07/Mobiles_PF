import { categoriesCharades } from "../data/categoriesCharades";

export const getRandomCategory = () => {

  const keys = Object.keys(categoriesCharades);

  return keys[Math.floor(Math.random() * keys.length)];
};

export const getRandomWord = (category, usedWords = []) => {

  const available =
    categoriesCharades[category].filter(
      word => !usedWords.includes(word)
    );

  if (available.length === 0) return null;

  return available[
    Math.floor(Math.random() * available.length)
  ];
};