import React from 'react';
import { colors, borderRadius } from '../styles/theme';

export interface ProgressBarProps {
    current: number;
    max: number;
    label?: string;
}

export default function ProgressBar({
    current,
    max,
    label,
}: ProgressBarProps) {
    const percentage = Math.max(0, Math.min(100, ((max - current) / max) * 100));

    // Determine color based on remaining progress
    const getColor = () => {
        if (percentage > 60) return colors.success;
        if (percentage > 30) return colors.warning;
        return colors.error;
    };

    return (
        <div style={styles.container}>
            {label && <div style={styles.label}>{label}</div>}
            <div style={styles.progressBackground}>
                <div
                    style={{
                        ...styles.progressFill,
                        width: `${percentage}%`,
                        backgroundColor: getColor(),
                    }}
                />
            </div>
            <div style={styles.remainingText}>
                {max - current} of {max} attempts remaining
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: '100%',
        marginTop: 8,
        marginBottom: 8,
    },
    label: {
        color: colors.text,
        marginBottom: 4,
        fontSize: 14,
    },
    progressBackground: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: borderRadius.round,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.round,
        transition: 'width 0.25s ease, background-color 0.25s ease',
    },
    remainingText: {
        color: colors.text,
        marginTop: 4,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 600,
    },
};
