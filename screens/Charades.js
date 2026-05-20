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

import {
  doc,
  updateDoc
} from 'firebase/firestore';

import {
  db
} from '../services/firebase';

export default function Charades({
  navigation,
  route
}) {

  const { code } = route.params;

  // TIMER
  const [timer, setTimer] =
    useState(1);

  // GAME STATES
  const [started, setStarted] =
    useState(false);

  const [showScoreboard, setShowScoreboard] =
    useState(false);

  const [gameFinished, setGameFinished] =
    useState(false);

  const [setupFinished, setSetupFinished] =
    useState(false);

  // ROUNDS
  const [selectedRounds, setSelectedRounds] =
    useState(1);

  const [currentRound, setCurrentRound] =
    useState(1);

  // TEAMS
  const [currentTeam, setCurrentTeam] =
    useState(1);

  const [team1Score, setTeam1Score] =
    useState(0);

  const [team2Score, setTeam2Score] =
    useState(0);

  // WORDS
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

          // TURN FINISHED
          if (prev <= 1) {

            clearInterval(
              intervalRef.current
            );

            finishTurn();

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

  // PREPARE TURN
  const prepareTurn = () => {

    const randomCategory =
      getRandomCategory();

    setCategory(
      randomCategory
    );

    const firstWord =
      getRandomWord(
        randomCategory,
        []
      );

    if (!firstWord) return;

    setWord(
      firstWord
    );

    setUsedWords([
      firstWord
    ]);

    setTimer(1);

    setStarted(false);

    setSetupFinished(true);
  };

  // START TURN
  const startTurn = () => {

    setStarted(true);

    startTimer();
  };

  // FINISH TURN
  const finishTurn = () => {

    setStarted(false);

    setShowScoreboard(true);
  };

  // NEXT TURN
  const nextTurn = () => {

    setShowScoreboard(false);

    // TEAM 1 -> TEAM 2
    if (currentTeam === 1) {

      setCurrentTeam(2);

      prepareTurn();

      return;
    }

    // BOTH TEAMS PLAYED
    if (currentRound >= selectedRounds) {

      setGameFinished(true);

      return;
    }

    // NEXT ROUND
    setCurrentRound(prev => prev + 1);

    setCurrentTeam(1);

    prepareTurn();
  };

  // RESET GAME
  const resetGame = () => {

    setGameFinished(false);

    setSetupFinished(false);

    setStarted(false);

    setShowScoreboard(false);

    setCurrentRound(1);

    setCurrentTeam(1);

    setTeam1Score(0);

    setTeam2Score(0);

    setCategory('');

    setWord('');

    setUsedWords([]);

    setTimer(1);
  };

  // EXIT GAME
  const exitGame = async () => {

    clearInterval(
      intervalRef.current
    );

    try {

      // RESET FIREBASE PARTY STATE
      await updateDoc(
        doc(db, 'parties', code),
        {
          status: 'waiting',
          game: null,
          gameState: null
        }
      );

    } catch (error) {

      console.log(
        'Error exiting charades:',
        error
      );
    }

    resetGame();

    navigation.replace(
      'gameSelection',
      { code }
    );
  };

  // CORRECT
  const correct = () => {

    if (timer <= 0) return;

    // TEAM 1 SCORE
    if (currentTeam === 1) {

      setTeam1Score(prev => prev + 1);

    } else {

      setTeam2Score(prev => prev + 1);
    }

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

  // INITIAL SETUP
  if (!setupFinished) {

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          CHARADES
        </Text>

        <Text style={styles.roundText}>
          HOW MANY ROUNDS?
        </Text>

        <View style={styles.roundButtons}>

          {[1, 2, 3, 5].map(num => (

            <TouchableOpacity
              key={num}
              style={[
                styles.roundOption,
                selectedRounds === num && {
                  backgroundColor: 'white'
                }
              ]}
              onPress={() =>
                setSelectedRounds(num)
              }
            >

              <Text
                style={[
                  styles.roundOptionText,
                  selectedRounds === num && {
                    color: '#5B2C83'
                  }
                ]}
              >
                {num}
              </Text>

            </TouchableOpacity>
          ))}

        </View>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={prepareTurn}
        >

          <Text style={styles.readyText}>
            START GAME
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // FINISHED SCREEN
  if (gameFinished) {

    const winner =
      team1Score > team2Score
        ? 'TEAM 1 WINS!'
        : team2Score > team1Score
        ? 'TEAM 2 WINS!'
        : 'DRAW!';

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          GAME OVER
        </Text>

        <Text style={styles.winner}>
          {winner}
        </Text>

        <View style={styles.scoreContainer}>

          <View style={styles.blueTeam}>

            <Text style={styles.teamText}>
              TEAM 1
            </Text>

            <Text style={styles.scoreText}>
              {team1Score}
            </Text>

          </View>

          <View style={styles.redTeam}>

            <Text style={styles.teamText}>
              TEAM 2
            </Text>

            <Text style={styles.scoreText}>
              {team2Score}
            </Text>

          </View>

        </View>

        <TouchableOpacity
          style={[
            styles.readyButton,
            { marginTop: 30 }
          ]}
          onPress={resetGame}
        >

          <Text style={styles.readyText}>
            PLAY AGAIN
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitButton}
          onPress={exitGame}
        >

          <Text style={styles.exitText}>
            EXIT
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // SCOREBOARD SCREEN
  if (showScoreboard) {

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          ROUND SUMMARY
        </Text>

        <Text style={styles.roundText}>
          Round {currentRound}
        </Text>

        <View style={styles.scoreContainer}>

          <View style={styles.blueTeam}>

            <Text style={styles.teamText}>
              TEAM 1
            </Text>

            <Text style={styles.scoreText}>
              {team1Score}
            </Text>

          </View>

          <View style={styles.redTeam}>

            <Text style={styles.teamText}>
              TEAM 2
            </Text>

            <Text style={styles.scoreText}>
              {team2Score}
            </Text>

          </View>

        </View>

        <Text style={styles.nextTeamText}>
          {
            currentTeam === 1
              ? 'NEXT: TEAM 2'
              : currentRound >= selectedRounds
              ? 'FINAL RESULTS'
              : 'NEXT: TEAM 1'
          }
        </Text>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={nextTurn}
        >

          <Text style={styles.readyText}>
            CONTINUE
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // READY SCREEN
  if (!started) {

    return (
      <View style={styles.container}>

        <Text style={styles.roundText}>
          ROUND {currentRound} / {selectedRounds}
        </Text>

        <Text style={styles.teamTurn}>
          TEAM {currentTeam}
        </Text>

        <Text style={styles.categoryPreview}>
          CATEGORY
        </Text>

        <Text style={styles.categoryName}>
          {category}
        </Text>

        <Text style={styles.passText}>
          PASS THE PHONE
        </Text>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={startTurn}
        >

          <Text style={styles.readyText}>
            READY
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // PLAY SCREEN
  return (
    <View style={styles.container}>

      <Text style={styles.teamTurn}>
        TEAM {currentTeam}
      </Text>

      <Text style={styles.timer}>
        {timer}
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
    marginBottom: 20,
  },

  roundText: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },

  teamTurn: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  categoryPreview: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold'
  },

  categoryName: {
    color: '#FDE68A',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },

  passText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
  },

  nextTeamText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },

  readyButton: {
    width: 250,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  readyText: {
    color: '#5B2C83',
    fontSize: 35,
    fontWeight: 'bold'
  },

  exitButton: {
    width: 250,
    height: 80,
    backgroundColor: '#DC2626',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  exitText: {
    color: 'white',
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
  },

  roundButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  roundOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  roundOptionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  scoreContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },

  blueTeam: {
    width: 140,
    height: 140,
    backgroundColor: '#2563EB',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },

  redTeam: {
    width: 140,
    height: 140,
    backgroundColor: '#DC2626',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },

  teamText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  scoreText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 10,
  },

  winner: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 20,
  }
});