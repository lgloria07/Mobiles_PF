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
  getRandomCard
} from '../utils/tabooHelpers';

export default function Taboo() {

  // TIMER
  const [timer, setTimer] =
    useState(60);

  // GAME
  const [started, setStarted] =
    useState(false);

  const [word, setWord] =
    useState('');

  const [forbidden, setForbidden] =
    useState([]);

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

  // START TIMER
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

  // NEW CARD
  const generateCard = (
    currentUsedWords
  ) => {

    const card =
      getRandomCard(
        currentUsedWords
      );

    if (!card) return;

    setWord(
      card.word
    );

    setForbidden(
      card.forbidden
    );

    setUsedWords(prev => [
      ...prev,
      card.word
    ]);
  };

  // START GAME
  const startGame = () => {

    const firstCard =
      getRandomCard([]);

    if (!firstCard) return;

    setWord(
      firstCard.word
    );

    setForbidden(
      firstCard.forbidden
    );

    setUsedWords([
      firstCard.word
    ]);

    setTimer(60);

    setStarted(true);

    startTimer();
  };

  // CORRECT
  const correct = () => {

    if (timer <= 0) return;

    generateCard(
      usedWords
    );
  };

  // SKIP
  const skip = () => {

    if (timer <= 0) return;

    generateCard(
      usedWords
    );
  };

  // READY SCREEN
  if (!started) {

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          TABOO
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

      <View style={styles.wordCard}>

        <Text style={styles.word}>
          {word}
        </Text>

        <Text style={styles.tabooTitle}>
          Forbidden words:
        </Text>

        {forbidden.map(
          (item, index) => (

            <Text
              key={index}
              style={styles.forbidden}
            >
              {item}
            </Text>
          )
        )}

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
    backgroundColor: '#14213b',
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
    color: '#14213b',
    fontSize: 35,
    fontWeight: 'bold'
  },

  timer: {
    color: 'white',
    fontSize: 70,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  wordCard: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },

  word: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#14213b',
    marginBottom: 20,
  },

  tabooTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#863535'
  },

  forbidden: {
    fontSize: 22,
    marginBottom: 8,
    color: '#444'
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