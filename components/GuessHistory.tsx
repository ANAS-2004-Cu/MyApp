import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { colors, borderRadius } from '../styles/theme';

interface GuessHistoryProps {
    guesses: { value: number; result: 'high' | 'low' | 'correct' }[];
}

export default function GuessHistory({ guesses }: GuessHistoryProps) {
    if (guesses.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Guesses</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {guesses.map((guess, index) => (
                    <View
                        key={index}
                        style={[
                            styles.guessItem,
                            guess.result === 'high' ? styles.highGuess :
                                guess.result === 'low' ? styles.lowGuess :
                                    styles.correctGuess
                        ]}
                    >
                        <Text style={styles.guessText}>{guess.value}</Text>
                        <Text style={styles.resultText}>
                            {guess.result === 'high' ? '↓' :
                                guess.result === 'low' ? '↑' : '✓'}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
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
        paddingHorizontal: 8,
    },
    guessItem: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.small,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guessText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
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
});
