import React, {
  useContext,
  useState
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

import { Ionicons }
from '@expo/vector-icons';

import {
  SettingsContext
} from '../services/SettingsContext';

export default function SettingsScreen({
  navigation
}) {

  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  const [tempLanguage,
    setTempLanguage] =
      useState(language);

  const [tempFontSize,
    setTempFontSize] =
      useState(fontSize);

  // TEXTS
  const texts = {

    English: {
      title: 'Settings',
      language: 'Language',
      fontSize: 'Font Size',
      selected: 'Selected',
      small: 'Small',
      large: 'Large',
      apply: 'Apply',
    },

    Español: {
      title: 'Configuración',
      language: 'Idioma',
      fontSize: 'Tamaño de letra',
      selected: 'Seleccionado',
      small: 'Pequeño',
      large: 'Grande',
      apply: 'Aplicar',
    },

    Français: {
      title: 'Paramètres',
      language: 'Langue',
      fontSize: 'Taille du texte',
      selected: 'Sélectionné',
      small: 'Petit',
      large: 'Grand',
      apply: 'Appliquer',
    },

    中文: {
      title: '设置',
      language: '语言',
      fontSize: '字体大小',
      selected: '已选择',
      small: '小',
      large: '大',
      apply: '应用',
    }
  };

  const t = texts[language];

  // APPLY SETTINGS
  const applySettings = () => {

    setLanguage(tempLanguage);

    setFontSize(tempFontSize);

    navigation.goBack();
  };

  return (

    <View style={styles.container}>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
        style={styles.backButton}
      >

        <Ionicons
          name="arrow-back"
          size={26}
          color="white"
        />

      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* TITLE */}
        <Text
          style={[
            styles.title,
            { fontSize: titleSize }
          ]}
        >
          {t.title}
        </Text>

        {/* LANGUAGE */}
        <Text
          style={[
            styles.section,
            { fontSize: textSize + 4 }
          ]}
        >
          {t.language}
        </Text>

        {/* ENGLISH */}
        <TouchableOpacity
          style={[
            styles.option,
            tempLanguage === 'English'
            && styles.selectedOption
          ]}
          onPress={() =>
            setTempLanguage('English')
          }
        >

          <Text
            style={[
              styles.optionText,
              { fontSize: textSize }
            ]}
          >
            English
          </Text>

        </TouchableOpacity>

        {/* ESPAÑOL */}
        <TouchableOpacity
          style={[
            styles.option,
            tempLanguage === 'Español'
            && styles.selectedOption
          ]}
          onPress={() =>
            setTempLanguage('Español')
          }
        >

          <Text
            style={[
              styles.optionText,
              { fontSize: textSize }
            ]}
          >
            Español
          </Text>

        </TouchableOpacity>

        {/* FRANÇAIS */}
        <TouchableOpacity
          style={[
            styles.option,
            tempLanguage === 'Français'
            && styles.selectedOption
          ]}
          onPress={() =>
            setTempLanguage('Français')
          }
        >

          <Text
            style={[
              styles.optionText,
              { fontSize: textSize }
            ]}
          >
            Français
          </Text>

        </TouchableOpacity>

        {/* 中文 */}
        <TouchableOpacity
          style={[
            styles.option,
            tempLanguage === '中文'
            && styles.selectedOption
          ]}
          onPress={() =>
            setTempLanguage('中文')
          }
        >

          <Text
            style={[
              styles.optionText,
              { fontSize: textSize }
            ]}
          >
            中文
          </Text>

        </TouchableOpacity>

        {/* SELECTED LANGUAGE */}
        <Text
          style={[
            styles.selected,
            { fontSize: textSize - 1 }
          ]}
        >
          {t.selected}: {tempLanguage}
        </Text>

        {/* FONT SIZE */}
        <Text
          style={[
            styles.section,
            { fontSize: textSize + 4 }
          ]}
        >
          {t.fontSize}
        </Text>

        {/* SMALL */}
        <TouchableOpacity
          style={[
            styles.option,
            tempFontSize === 'Small'
            && styles.selectedOption
          ]}
          onPress={() =>
            setTempFontSize('Small')
          }
        >

          <Text
            style={[
              styles.optionText,
              { fontSize: textSize }
            ]}
          >
            {t.small}
          </Text>

        </TouchableOpacity>

        {/* LARGE */}
        <TouchableOpacity
          style={[
            styles.option,
            tempFontSize === 'Large'
            && styles.selectedOption
          ]}
          onPress={() =>
            setTempFontSize('Large')
          }
        >

          <Text
            style={[
              styles.optionText,
              { fontSize: textSize }
            ]}
          >
            {t.large}
          </Text>

        </TouchableOpacity>

        {/* SELECTED FONT */}
        <Text
          style={[
            styles.selected,
            { fontSize: textSize - 1 }
          ]}
        >
          {t.selected}: {tempFontSize}
        </Text>

        {/* APPLY BUTTON */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={applySettings}
        >

          <Text
            style={[
              styles.applyText,
              { fontSize: textSize + 2 }
            ]}
          >
            {t.apply}
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#0F172A',
  },

  scrollContainer:{
    paddingTop:80,
    paddingBottom:40,
    alignItems:'center',
  },

  backButton: {
    position:'absolute',
    top:50,
    left:20,
    zIndex:10,
    backgroundColor:"#ffffff20",
    padding:8,
    borderRadius:50,
  },

  title:{
    color:'white',
    fontWeight:'bold',
    marginBottom:20,
  },

  section:{
    color:'#22C55E',
    fontWeight:'bold',
    marginTop:20,
    marginBottom:15,
  },

  option:{
    width:'80%',
    minHeight:55,
    backgroundColor:'#1E293B',
    borderRadius:15,
    justifyContent:'center',
    alignItems:'center',
    marginBottom:10,
    borderWidth:2,
    borderColor:'transparent',
    paddingVertical:10,
  },

  selectedOption:{
    borderColor:'#22C55E',
  },

  optionText:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
  },

  selected:{
    color:'#94A3B8',
    marginTop:10,
    marginBottom:20,
    textAlign:'center',
  },

  applyButton:{
    width:'80%',
    minHeight:55,
    backgroundColor:'#22C55E',
    borderRadius:18,
    justifyContent:'center',
    alignItems:'center',
    marginTop:10,
    marginBottom:30,
    paddingVertical:10,
  },

  applyText:{
    color:'white',
    fontWeight:'bold',
  }
});