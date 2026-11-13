import React from 'react';
import { colors, borderRadius } from '../styles/theme';

export interface GuessHistoryProps {
    guesses: { value: number; result: 'high' | 'low' | 'correct' }[];
}

export default function GuessHistory({ guesses }: GuessHistoryProps) {
    if (guesses.length === 0) {
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.title}>Your Guesses</div>
            <div className="no-scrollbar" style={styles.scrollContent}>
                {guesses.map((guess, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.guessItem,
                            ...(guess.result === 'high'
                                ? styles.highGuess
                                : guess.result === 'low'
                                ? styles.lowGuess
                                : styles.correctGuess),
                        }}
                    >
                        <span style={styles.guessText}>{guess.value}</span>
                        <span style={styles.resultText}>
                            {guess.result === 'high'
                                ? '↓'
                                : guess.result === 'low'
                                ? '↑'
                                : '✓'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
    },
    title: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    scrollContent: {
        display: 'flex',
        flexDirection: 'row',
        overflowX: 'auto',
        paddingLeft: 8,
        paddingRight: 8,
    },
    guessItem: {
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: borderRadius.small,
        marginLeft: 4,
        marginRight: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guessText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 1.1,
    },
    resultText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
        lineHeight: 1.1,
    },
    highGuess: {
        backgroundColor: colors.error,
    },
    lowGuess: {
        backgroundColor: colors.accent,
    },
    correctGuess: {
        backgroundColor: colors.success,
    },
};
