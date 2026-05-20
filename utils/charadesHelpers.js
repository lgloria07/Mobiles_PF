import { categoriesCharades }
from '../data/categoriesCharades';

export const getRandomCategory = () => {

  const keys =
    Object.keys(categoriesCharades);

  return keys[
    Math.floor(
      Math.random() * keys.length
    )
  ];
};

export const getRandomWord = (
  category,
  usedWords
) => {

  const words =
    categoriesCharades[category];

  if (!words) return null;

  const available =
    words.filter(
      word =>
        !usedWords.includes(word)
    );

  // SI YA SE USARON TODAS
  if (available.length === 0) {

    return words[
      Math.floor(
        Math.random() * words.length
      )
    ];
  }

  return available[
    Math.floor(
      Math.random() * available.length
    )
  ];
};