import React, {
  useState,
  useEffect,
  useRef,
  useContext
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

import {
  doc,
  updateDoc
} from 'firebase/firestore';

import {
  db
} from '../services/firebase';

import {
  SettingsContext
} from '../services/SettingsContext';

export default function Taboo({
  navigation,
  route
}) {

  const { code } = route.params;

  // SETTINGS
  const settings =
    useContext(SettingsContext);

  const language =
    settings?.language || 'English';

  const textSize =
    settings?.textSize || 20;

  const titleSize =
    settings?.titleSize || 40;

  // TRANSLATIONS
  const texts = {

    English: {
      title: 'TABOO',
      howManyRounds: 'HOW MANY ROUNDS?',
      startGame: 'START GAME',
      gameOver: 'GAME OVER',
      team1Wins: 'TEAM 1 WINS!',
      team2Wins: 'TEAM 2 WINS!',
      draw: 'DRAW!',
      playAgain: 'PLAY AGAIN',
      exit: 'EXIT',
      roundSummary: 'ROUND SUMMARY',
      nextTeam2: 'NEXT: TEAM 2',
      nextTeam1: 'NEXT: TEAM 1',
      finalResults: 'FINAL RESULTS',
      continue: 'CONTINUE',
      passPhone: 'PASS THE PHONE',
      ready: 'READY',
      team: 'TEAM',
      round: 'ROUND',
      forbiddenWords: 'Forbidden words:'
    },

    Español: {
      title: 'TABÚ',
      howManyRounds: '¿CUÁNTAS RONDAS?',
      startGame: 'INICIAR',
      gameOver: 'FIN DEL JUEGO',
      team1Wins: '¡GANA EL EQUIPO 1!',
      team2Wins: '¡GANA EL EQUIPO 2!',
      draw: '¡EMPATE!',
      playAgain: 'JUGAR OTRA VEZ',
      exit: 'SALIR',
      roundSummary: 'RESUMEN',
      nextTeam2: 'SIGUE: EQUIPO 2',
      nextTeam1: 'SIGUE: EQUIPO 1',
      finalResults: 'RESULTADOS',
      continue: 'CONTINUAR',
      passPhone: 'PASA EL TELÉFONO',
      ready: 'LISTO',
      team: 'EQUIPO',
      round: 'RONDA',
      forbiddenWords: 'Palabras prohibidas:'
    },

    Français: {
      title: 'TABOU',
      howManyRounds: 'COMBIEN DE MANCHES ?',
      startGame: 'COMMENCER',
      gameOver: 'FIN DU JEU',
      team1Wins: 'ÉQUIPE 1 GAGNE !',
      team2Wins: 'ÉQUIPE 2 GAGNE !',
      draw: 'ÉGALITÉ !',
      playAgain: 'REJOUER',
      exit: 'QUITTER',
      roundSummary: 'RÉSUMÉ',
      nextTeam2: 'SUIVANT : ÉQUIPE 2',
      nextTeam1: 'SUIVANT : ÉQUIPE 1',
      finalResults: 'RÉSULTATS',
      continue: 'CONTINUER',
      passPhone: 'PASSE LE TÉLÉPHONE',
      ready: 'PRÊT',
      team: 'ÉQUIPE',
      round: 'MANCHE',
      forbiddenWords: 'Mots interdits :'
    },

    中文: {
      title: '禁语猜词',
      howManyRounds: '多少回合？',
      startGame: '开始游戏',
      gameOver: '游戏结束',
      team1Wins: '1队获胜！',
      team2Wins: '2队获胜！',
      draw: '平局！',
      playAgain: '再玩一次',
      exit: '退出',
      roundSummary: '回合总结',
      nextTeam2: '下一队：2队',
      nextTeam1: '下一队：1队',
      finalResults: '最终结果',
      continue: '继续',
      passPhone: '传递手机',
      ready: '准备好了',
      team: '队伍',
      round: '回合',
      forbiddenWords: '禁用词：'
    }
  };

  const t =
    texts[language] ||
    texts.English;

  // TIMER
  const [timer, setTimer] =
    useState(60);

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

  // TIMER
  const startTimer = () => {

    clearInterval(
      intervalRef.current
    );

    intervalRef.current =
      setInterval(() => {

        setTimer(prev => {

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

  // GENERATE CARD
  const generateCard = (
    currentUsedWords
  ) => {

    const card =
      getRandomCard(
        currentUsedWords,
        language
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

  // PREPARE TURN
  const prepareTurn = () => {

    const firstCard =
      getRandomCard(
        [],
        language
      );

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

    if (currentTeam === 1) {

      setCurrentTeam(2);

      prepareTurn();

      return;
    }

    if (currentRound >= selectedRounds) {

      setGameFinished(true);

      return;
    }

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

    setWord('');

    setForbidden([]);

    setUsedWords([]);

    setTimer(60);
  };

  // EXIT GAME
  const exitGame = async () => {

    clearInterval(
      intervalRef.current
    );

    try {

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
        'Error exiting taboo:',
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

    if (currentTeam === 1) {

      setTeam1Score(prev => prev + 1);

    } else {

      setTeam2Score(prev => prev + 1);
    }

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

  // INITIAL SCREEN
  if (!setupFinished) {

    return (
      <View style={styles.container}>

        <Text
          style={[
            styles.title,
            { fontSize: titleSize + 8 }
          ]}
        >
          {t.title}
        </Text>

        <Text
          style={[
            styles.roundText,
            { fontSize: textSize + 6 }
          ]}
        >
          {t.howManyRounds}
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
                  {
                    fontSize: textSize + 2
                  },
                  selectedRounds === num && {
                    color: '#14213b'
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

          <Text
            style={[
              styles.readyText,
              { fontSize: textSize + 10 }
            ]}
          >
            {t.startGame}
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // FINISHED SCREEN
  if (gameFinished) {

    const winner =
      team1Score > team2Score
        ? t.team1Wins
        : team2Score > team1Score
        ? t.team2Wins
        : t.draw;

    return (
      <View style={styles.container}>

        <Text
          style={[
            styles.title,
            { fontSize: titleSize + 6 }
          ]}
        >
          {t.gameOver}
        </Text>

        <Text
          style={[
            styles.winner,
            { fontSize: textSize + 14 }
          ]}
        >
          {winner}
        </Text>

        <View style={styles.scoreContainer}>

          <View style={styles.blueTeam}>

            <Text
              style={[
                styles.teamText,
                { fontSize: textSize + 2 }
              ]}
            >
              {t.team} 1
            </Text>

            <Text
              style={[
                styles.scoreText,
                { fontSize: titleSize }
              ]}
            >
              {team1Score}
            </Text>

          </View>

          <View style={styles.redTeam}>

            <Text
              style={[
                styles.teamText,
                { fontSize: textSize + 2 }
              ]}
            >
              {t.team} 2
            </Text>

            <Text
              style={[
                styles.scoreText,
                { fontSize: titleSize }
              ]}
            >
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

          <Text
            style={[
              styles.readyText,
              { fontSize: textSize + 8 }
            ]}
          >
            {t.playAgain}
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitButton}
          onPress={exitGame}
        >

          <Text
            style={[
              styles.exitText,
              { fontSize: textSize + 8 }
            ]}
          >
            {t.exit}
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // SCOREBOARD
  if (showScoreboard) {

    return (
      <View style={styles.container}>

        <Text
          style={[
            styles.title,
            { fontSize: titleSize }
          ]}
        >
          {t.roundSummary}
        </Text>

        <Text
          style={[
            styles.roundText,
            { fontSize: textSize + 4 }
          ]}
        >
          {t.round} {currentRound}
        </Text>

        <View style={styles.scoreContainer}>

          <View style={styles.blueTeam}>

            <Text
              style={[
                styles.teamText,
                { fontSize: textSize + 2 }
              ]}
            >
              {t.team} 1
            </Text>

            <Text
              style={[
                styles.scoreText,
                { fontSize: titleSize }
              ]}
            >
              {team1Score}
            </Text>

          </View>

          <View style={styles.redTeam}>

            <Text
              style={[
                styles.teamText,
                { fontSize: textSize + 2 }
              ]}
            >
              {t.team} 2
            </Text>

            <Text
              style={[
                styles.scoreText,
                { fontSize: titleSize }
              ]}
            >
              {team2Score}
            </Text>

          </View>

        </View>

        <Text
          style={[
            styles.nextTeamText,
            { fontSize: textSize + 6 }
          ]}
        >
          {
            currentTeam === 1
              ? t.nextTeam2
              : currentRound >= selectedRounds
              ? t.finalResults
              : t.nextTeam1
          }
        </Text>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={nextTurn}
        >

          <Text
            style={[
              styles.readyText,
              { fontSize: textSize + 8 }
            ]}
          >
            {t.continue}
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // READY SCREEN
  if (!started) {

    return (
      <View style={styles.container}>

        <Text
          style={[
            styles.roundText,
            { fontSize: textSize + 6 }
          ]}
        >
          {t.round} {currentRound} / {selectedRounds}
        </Text>

        <Text
          style={[
            styles.teamTurn,
            { fontSize: titleSize - 4 }
          ]}
        >
          {t.team} {currentTeam}
        </Text>

        <Text
          style={[
            styles.passText,
            { fontSize: textSize + 2 }
          ]}
        >
          {t.passPhone}
        </Text>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={startTurn}
        >

          <Text
            style={[
              styles.readyText,
              { fontSize: textSize + 8 }
            ]}
          >
            {t.ready}
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // PLAY SCREEN
  return (
    <View style={styles.container}>

      <Text
        style={[
          styles.teamTurn,
          { fontSize: titleSize - 4 }
        ]}
      >
        {t.team} {currentTeam}
      </Text>

      <Text
        style={[
          styles.timer,
          { fontSize: titleSize + 20 }
        ]}
      >
        {timer}
      </Text>

      <View style={styles.wordCard}>

        <Text
          style={[
            styles.word,
            { fontSize: titleSize - 2 }
          ]}
        >
          {word}
        </Text>

        <Text
          style={[
            styles.tabooTitle,
            { fontSize: textSize + 2 }
          ]}
        >
          {t.forbiddenWords}
        </Text>

        {forbidden.map(
          (item, index) => (

            <Text
              key={index}
              style={[
                styles.forbidden,
                {
                  fontSize: textSize + 2
                }
              ]}
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
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },

  roundText: {
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold'
  },

  teamTurn: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },

  passText: {
    color: 'white',
    marginBottom: 20,
    textAlign: 'center'
  },

  nextTeamText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center'
  },

  readyButton: {
    width: 250,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 15,
  },

  readyText: {
    color: '#14213b',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  exitButton: {
    width: 250,
    height: 80,
    backgroundColor: '#DC2626',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
  },

  exitText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  timer: {
    color: 'white',
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
    fontWeight: 'bold',
    color: '#14213b',
    marginBottom: 20,
    textAlign: 'center'
  },

  tabooTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#863535'
  },

  forbidden: {
    marginBottom: 8,
    color: '#444',
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
    fontWeight: 'bold',
  },

  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },

  winner: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  }
});