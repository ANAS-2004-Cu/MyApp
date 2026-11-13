import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, fontSizes, borderRadius } from '../styles/theme';
import StyledButton from '../components/StyledButton';
import NumberInput from '../components/NumberInput';
import ProgressBar from '../components/ProgressBar';
import GuessHistory from '../components/GuessHistory';

export default function Game1() {
  const navigate = useNavigate();
  const [value, setValue] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [tries, setTries] = useState(0);
  const [randomNumber, setRandomNumber] = useState(() => Math.floor(Math.random() * 100));
  const [perfect, setPerfect] = useState(false);
  const [higher, setHigher] = useState(false);
  const [lower, setLower] = useState(false);
  const [tooBig, setTooBig] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [limit, setLimit] = useState(false);
  const [hit, setHit] = useState(true);
  const [soHigher, setSoHigher] = useState(false);
  const [soLower, setSoLower] = useState(false);
  const [guessHistory, setGuessHistory] = useState<{ value: number; result: 'high' | 'low' | 'correct' }[]>([]);
  const MAX_TRIES = 10;

  function reset() {
    setRandomNumber(Math.floor(Math.random() * 100));
    setValue(-1);
    setInputValue('');
    setTries(0);
    setPerfect(false);
    setHigher(false);
    setLower(false);
    setTooBig(false);
    setEmpty(false);
    setLimit(false);
    setHit(true);
    setSoHigher(false);
    setSoLower(false);
    setGuessHistory([]);
  }

  function incrementTries() {
    setTries((prev) => prev + 1);
  }

  function check() {
    if (value === -1 || Number.isNaN(value)) {
      setEmpty(true);
      setPerfect(false);
      setHigher(false);
      setLower(false);
      setTooBig(false);
      setSoHigher(false);
      setSoLower(false);
      return;
    } else if (value > 99 || value < 0) {
      setTooBig(true);
      setEmpty(false);
      setPerfect(false);
      setHigher(false);
      setLower(false);
      setSoHigher(false);
      setSoLower(false);
      return;
    }

    const guessResult = { value, result: 'low' as 'high' | 'low' | 'correct' };

    if (randomNumber === value) {
      if (hit) {
        incrementTries();
        setHit(false);
      }
      setTooBig(false);
      setEmpty(false);
      setPerfect(true);
      setHigher(false);
      setLower(false);
      setSoHigher(false);
      setSoLower(false);
      guessResult.result = 'correct';
    } else if (randomNumber > value) {
      incrementTries();
      if (Math.abs(randomNumber - value) <= 10) {
        setSoHigher(true);
        setHigher(false);
      } else {
        setHigher(true);
        setSoHigher(false);
      }
      setSoLower(false);
      setLower(false);
      setPerfect(false);
      setTooBig(false);
      setEmpty(false);
      guessResult.result = 'low';
    } else if (randomNumber < value) {
      incrementTries();
      if (Math.abs(randomNumber - value) <= 10) {
        setSoLower(true);
        setLower(false);
      } else {
        setLower(true);
        setSoLower(false);
      }
      setSoHigher(false);
      setPerfect(false);
      setHigher(false);
      setTooBig(false);
      setEmpty(false);
      guessResult.result = 'high';
    }

    setGuessHistory((prevHistory) => [...prevHistory, guessResult]);
  }

  function limitTries() {
    if (tries < MAX_TRIES && hit) {
      check();
    } else {
      setLimit(true);
    }
  }

  function handleCheckPress() {
    limitTries();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setInputValue('');
    setValue(-1);
  }

  function getMessage() {
    if (perfect) return `Got It!🎉 Perfect Guess.\nThe Number was ✨${randomNumber}✨.`;
    if (limit) return `You Have Reached The Limit Of ${MAX_TRIES} Tries.🤯\nThe Number was\n☠️${randomNumber}☠️.`;
    if (soLower) return 'Your Guess Is So Close😲\nBut Still High.📈\nTry Going Lower.🥺';
    if (soHigher) return 'Your Guess Is So Close😲\nBut Still Low.📉\nTry Going Higher.🥺';
    if (lower) return 'Your Guess Is Too High.📈\nTry Going Lower.🥺';
    if (higher) return 'Your Guess Is Too Low.📉\nTry Going Higher.🥺';
    if (empty) return 'Please Enter A Number 😐';
    if (tooBig) return 'Please Enter A Number\nBetween 0 and 99.😔';
    return 'Lower OR Higher\n🎮Game🎮';
  }

  const resultSecondColor = perfect
    ? 'rgba(0,100,0,0.6)'
    : limit
    ? 'rgba(100,0,0,0.6)'
    : 'rgba(0,30,60,0.6)';

  return (
    <div className="app-background">
      <div style={styles.overlay}>
        <div className="app-viewport" style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerText}>Guess Game</div>
          </div>

          <div style={styles.content}>
            <div style={styles.gameCard}>
              <div style={styles.cardGradient}>
                <div style={styles.instructionText}>Enter your guess between 0 and 99:</div>

                <div style={styles.inputSection}>
                  <NumberInput
                    value={inputValue}
                    onChangeText={(text) => {
                      setInputValue(text);
                      const trimmed = text.trim();
                      setValue(trimmed === '' ? -1 : Number(trimmed));
                    }}
                    onSubmitEditing={handleCheckPress}
                    placeholder="Enter guess"
                    inputRef={inputRef}
                  />
                  <StyledButton
                    title="CHECK"
                    onPress={handleCheckPress}
                    style={styles.checkButton}
                  />
                </div>

                <ProgressBar
                  current={tries}
                  max={MAX_TRIES}
                  label="Remaining Attempts"
                />

                <GuessHistory guesses={guessHistory} />
              </div>
            </div>

            <div style={styles.resultCard}>
              <div
                style={{
                  ...styles.resultGradient,
                  background: `linear-gradient(180deg, ${colors.darkOverlay}, ${resultSecondColor})`,
                }}
              >
                <div style={styles.resultText}>{getMessage()}</div>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <StyledButton
                title="HOME"
                onPress={() => navigate('/')}
                type="outline"
              />
              <StyledButton
                title="RESET"
                onPress={reset}
                type="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottom: `1px solid ${colors.accent}`,
  },
  headerText: {
    fontSize: fontSizes.xlarge,
    color: colors.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '1px 1px 5px rgba(0,0,0,0.75)',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  gameCard: {
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    background: `linear-gradient(180deg, ${colors.darkOverlay}, rgba(50,30,80,0.8))`,
  },
  instructionText: {
    fontSize: fontSizes.medium,
    marginBottom: spacing.md,
    color: colors.text,
    fontWeight: 600,
    textAlign: 'center',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkButton: {
    marginLeft: spacing.md,
    height: 44,
  },
  resultCard: {
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 180,
  },
  resultGradient: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.large,
  },
  resultText: {
    fontSize: fontSizes.large,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: `${fontSizes.large * 1.5}px`,
    whiteSpace: 'pre-line',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
};
