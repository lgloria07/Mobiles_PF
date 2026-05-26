import React, { createContext, useState } from 'react';
// Un settingsContext sirve para poder establecer valores globales, en este caso el idioma y tamaño de letra
export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Small');

  const textSize = fontSize === 'Large' ? 24 : 16;
  const titleSize = fontSize === 'Large' ? 42 : 35;

  return (
    <SettingsContext.Provider value={{
        language,
        setLanguage,
        fontSize,
        setFontSize,
        textSize,
        titleSize
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};