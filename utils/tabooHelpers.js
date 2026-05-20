import { tabooWords }
from '../data/categoriesTaboo';

export const getRandomCard = (
  usedWords = []
) => {

  const available =
    tabooWords.filter(
      item =>
        !usedWords.includes(
          item.word
        )
    );

  if (available.length === 0) {

    return tabooWords[0];
  }

  return available[
    Math.floor(
      Math.random() *
      available.length
    )
  ];
};