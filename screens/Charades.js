import React, {
  useState,
  useEffect,
  useRef
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import {
  getRandomCategory,
  getRandomWord
} from '../utils/charadesHelpers';

export default function Charades() {

  // TIMER
  const [timer, setTimer] =
    useState(10);

  // GAME
  const [started, setStarted] =
    useState(false);

  const [category, setCategory] =
    useState('');

  const [word, setWord] =
    useState('');

  const [usedWords, setUsedWords] =
    useState([]);

  const intervalRef =
    useRef(null);

  // CLEANUP
  useEffect(() => {

    return () => {

      if (intervalRef.current) {

        clearInterval(
          intervalRef.current
        );
      }
    };

  }, []);

  // TIMER
  const startTimer = () => {

    clearInterval(
      intervalRef.current
    );

    intervalRef.current =
      setInterval(() => {

        setTimer(prev => {

          // FINISH
          if (prev <= 1) {

            clearInterval(
              intervalRef.current
            );

            setStarted(false);

            return 0;
          }

          return prev - 1;
        });

      }, 1000);
  };

  // NEW WORD
  const generateWord = (
    currentCategory,
    currentUsedWords
  ) => {

    const newWord =
      getRandomWord(
        currentCategory,
        currentUsedWords
      );

    if (!newWord) return;

    setWord(newWord);

    setUsedWords(prev => [
      ...prev,
      newWord
    ]);
  };

  // START GAME
  const startGame = () => {

    const randomCategory =
      getRandomCategory();

    const firstWord =
      getRandomWord(
        randomCategory,
        []
      );

    if (!firstWord) return;

    setCategory(
      randomCategory
    );

    setWord(
      firstWord
    );

    setUsedWords([
      firstWord
    ]);

    setTimer(60);

    setStarted(true);

    startTimer();
  };

  // CORRECT
  const correct = () => {

    if (timer <= 0) return;

    generateWord(
      category,
      usedWords
    );
  };

  // SKIP
  const skip = () => {

    if (timer <= 0) return;

    generateWord(
      category,
      usedWords
    );
  };

  // READY SCREEN
  if (!started) {

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          CHARADES
        </Text>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={startGame}
        >

          <Text style={styles.readyText}>
            START
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // PLAY SCREEN
  return (
    <View style={styles.container}>

      <Text style={styles.timer}>
        {timer}
      </Text>

      <Text style={styles.category}>
        {category}
      </Text>

      <View style={styles.wordCard}>

        <Text style={styles.word}>
          {word}
        </Text>

      </View>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.skip}
          onPress={skip}
        >

          <Text style={styles.buttonEmoji}>
            ❌
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.correct}
          onPress={correct}
        >

          <Text style={styles.buttonEmoji}>
            ✔️
          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#63A9E9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    color: 'white',
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 40,
  },

  readyButton: {
    width: 250,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  readyText: {
    color: '#5B2C83',
    fontSize: 35,
    fontWeight: 'bold'
  },

  timer: {
    color: 'white',
    fontSize: 70,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  category: {
    color: 'white',
    fontSize: 28,
    marginBottom: 40,
    fontWeight: 'bold'
  },

  wordCard: {
    width: '85%',
    height: 250,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  word: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#5B2C83',
    textAlign: 'center'
  },

  buttons: {
    flexDirection: 'row',
    marginTop: 50,
  },

  skip: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },

  correct: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },

  buttonEmoji: {
    fontSize: 45,
  }
});