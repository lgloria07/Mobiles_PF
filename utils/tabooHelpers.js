import { tabooWords as tabooWordsEN } from '../data/categoriesTabooEN';
import { tabooWords as tabooWordsES } from '../data/categoriesTabooES';
import { tabooWords as tabooWordsFR } from '../data/categoriesTabooFR';
import { tabooWords as tabooWordsZH } from '../data/categoriesTabooZH';

const tabooByLanguage = {
  English: tabooWordsEN,

  Español: tabooWordsES,

  Français: tabooWordsFR,

  中文: tabooWordsZH
};

export const getRandomCard = (usedWords = [],language = 'English') => {
  const tabooWords = tabooByLanguage[language] || tabooWordsEN;

  const available = tabooWords.filter(item =>!usedWords.includes(item.word));

  // SI YA SE USARON TODAS
  if (available.length === 0) {

    return tabooWords[ Math.floor(Math.random() * tabooWords.length)];
  }

  return available[ Math.floor( Math.random() * available.length)];
};