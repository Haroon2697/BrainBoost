"use client"

import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    Vibration,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import {
    Play,
    RotateCcw,
    Home,
    Trophy,
    RefreshCw,
    Calculator,
    Zap,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const CELL_SIZE = (width - 64) / GRID_SIZE;

interface Cell {
    type: 'empty' | 'clue' | 'input';
    rowClue?: number;
    colClue?: number;
    value?: number | null;
    solution?: number;
}

const KakuroGame = () => {
    const router = useRouter();
    const [board, setBoard] = useState<Cell[][]>([]);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState(0);

    const initGame = useCallback(() => {
        // Simplified 4x4 level
        const level: Cell[][] = [
            [{ type: 'empty' }, { type: 'clue', colClue: 4 }, { type: 'clue', colClue: 10 }, { type: 'empty' }],
            [{ type: 'clue', rowClue: 3 }, { type: 'input', solution: 1, value: null }, { type: 'input', solution: 2, value: null }, { type: 'clue', colClue: 3 }],
            [{ type: 'clue', rowClue: 11 }, { type: 'input', solution: 3, value: null }, { type: 'input', solution: 8, value: null }, { type: 'input', solution: 0, value: null }], // Adjusted for a valid puzzle
            [{ type: 'empty' }, { type: 'clue', rowClue: 3 }, { type: 'input', solution: 1, value: null }, { type: 'input', solution: 2, value: null }]
        ];

        // Let's use a cleaner hardcoded 4x4 level
        const validLevel: Cell[][] = [
            [
                { type: 'empty' },
                { type: 'clue', colClue: 4 },
                { type: 'clue', colClue: 10 },
                { type: 'empty' }
            ],
            [
                { type: 'clue', rowClue: 3 },
                { type: 'input', solution: 1, value: null },
                { type: 'input', solution: 2, value: null },
                { type: 'empty' }
            ],
            [
                { type: 'clue', rowClue: 11 },
                { type: 'input', solution: 3, value: null },
                { type: 'input', solution: 8, value: null },
                { type: 'empty' }
            ],
            [
                { type: 'empty' },
                { type: 'empty' },
                { type: 'empty' },
                { type: 'empty' }
            ]
        ];

        setBoard(validLevel);
        setGameState('playing');
        setTimer(0);
        setErrors(0);
        setSelectedCell(null);
    }, []);

    const handleNumberInput = (num: number) => {
        if (!selectedCell || gameState !== 'playing') return;
        const { r, c } = selectedCell;
        const cell = board[r][c];
        if (cell.type !== 'input') return;

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = { ...cell, value: num };
        setBoard(newBoard);
        Vibration.vibrate(50);

        // Check if correct
        if (num !== cell.solution) {
            setErrors(e => e + 1);
            if (errors + 1 >= 5) {
                // Game Over logic could go here, but let's just keep playing for now
            }
        }

        // Check win
        const isWon = newBoard.every(row =>
            row.every(c => c.type !== 'input' || c.value === c.solution)
        );
        if (isWon) setGameState('gameOver');
    };

    useEffect(() => {
        let interval: any;
        if (gameState === 'playing') {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (gameState === 'start') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Zap size={40} color={Theme.colors.primary} />
                    </View>
                    <Text style={styles.gameTitle}>Kakuro Logic</Text>
                    <Text style={styles.gameDesc}>The cross-sum challenge. Fill the grid so each series of numbers adds up to the clue provided.</Text>

                    <Pressable style={styles.playBtn} onPress={initGame}>
                        <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.buttonText}>Start Solving</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={styles.backLink} onPress={() => router.back()}>
                        <Text style={styles.backText}>Return to HQ</Text>
                    </Pressable>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.gameSafe}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => setGameState('start')} style={styles.iconBtn}>
                        <Home size={20} color={Theme.colors.textMuted} />
                    </Pressable>
                    <View style={styles.statRow}>
                        <View style={styles.statBadge}>
                            <Text style={styles.statLabel}>TIME</Text>
                            <Text style={styles.statValue}>{formatTime(timer)}</Text>
                        </View>
                    </View>
                    <Pressable style={styles.iconBtn} onPress={initGame}>
                        <RotateCcw size={20} color={Theme.colors.textMuted} />
                    </Pressable>
                </View>

                <View style={styles.boardWrapper}>
                    <View style={styles.board}>
                        {board.map((row, r) => (
                            <View key={r} style={styles.row}>
                                {row.map((cell, c) => (
                                    <Pressable
                                        key={`${r}-${c}`}
                                        style={[
                                            styles.cell,
                                            cell.type === 'empty' && styles.emptyCell,
                                            cell.type === 'clue' && styles.clueCell,
                                            cell.type === 'input' && styles.inputCell,
                                            selectedCell?.r === r && selectedCell?.c === c && styles.selectedCell
                                        ]}
                                        onPress={() => cell.type === 'input' && setSelectedCell({ r, c })}
                                    >
                                        {cell.type === 'clue' && (
                                            <View style={styles.clueContainer}>
                                                <View style={styles.clueDiagonal} />
                                                {cell.colClue && <Text style={styles.colClueText}>{cell.colClue}</Text>}
                                                {cell.rowClue && <Text style={styles.rowClueText}>{cell.rowClue}</Text>}
                                            </View>
                                        )}
                                        {cell.type === 'input' && (
                                            <Text style={[
                                                styles.inputText,
                                                cell.value !== null && cell.value !== cell.solution && styles.errorText
                                            ]}>
                                                {cell.value || ''}
                                            </Text>
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.numPad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <Pressable key={num} onPress={() => handleNumberInput(num)} style={styles.numBtn}>
                            <LinearGradient colors={Theme.colors.gradients.glass} style={styles.numGradient}>
                                <Text style={styles.numText}>{num}</Text>
                            </LinearGradient>
                        </Pressable>
                    ))}
                </View>

                {gameState === 'gameOver' && (
                    <View style={styles.overlay}>
                        <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
                            <Trophy size={60} color={Theme.colors.success} />
                            <Text style={styles.overTitle}>KAKURO MASTERED</Text>
                            <View style={styles.resultItem}>
                                <Text style={styles.resultLabel}>SOLVE TIME</Text>
                                <Text style={styles.resultValue}>{formatTime(timer)}</Text>
                            </View>
                            <View style={styles.overActions}>
                                <Pressable style={styles.mainButton} onPress={initGame}>
                                    <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                                        <RefreshCw size={18} color="white" />
                                        <Text style={styles.buttonText}>New Puzzle</Text>
                                    </LinearGradient>
                                </Pressable>
                                <Pressable style={styles.secondaryButton} onPress={() => setGameState('start')}>
                                    <Text style={styles.secondaryButtonText}>Back to Hub</Text>
                                </Pressable>
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    gameTitle: {
        fontSize: 32,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    gameDesc: {
        fontSize: 16,
        color: Theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    playBtn: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    backLink: {
        padding: 10,
    },
    backText: {
        color: Theme.colors.textMuted,
        textDecorationLine: 'underline',
    },
    gameSafe: {
        flex: 1,
        padding: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center',
        minWidth: 80,
    },
    statLabel: {
        fontSize: 8,
        color: Theme.colors.textMuted,
        fontWeight: '900',
    },
    statValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '800',
    },
    boardWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    board: {
        width: width - 48,
        height: width - 48,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    cell: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCell: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    clueCell: {
        backgroundColor: Theme.colors.card,
    },
    inputCell: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    selectedCell: {
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
    },
    clueContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    clueDiagonal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        transform: [{ rotate: '45deg' }], // This is a bit hacky for RN, usually SVG is better
    },
    colClueText: {
        position: 'absolute',
        top: 4,
        right: 4,
        color: Theme.colors.accent,
        fontSize: 12,
        fontWeight: 'bold',
    },
    rowClueText: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        color: Theme.colors.secondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    inputText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        color: Theme.colors.error,
    },
    numPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
    },
    numBtn: {
        width: (width - 80) / 4.5,
        height: 50,
        borderRadius: 12,
        overflow: 'hidden',
    },
    numGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 15, 30, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 100,
    },
    gameOverCard: {
        width: '100%',
        padding: 32,
        borderRadius: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    overTitle: {
        fontSize: 24,
        color: '#fff',
        fontFamily: Theme.fonts.primary,
        marginVertical: 24,
    },
    resultItem: {
        alignItems: 'center',
        marginBottom: 32,
    },
    resultLabel: {
        fontSize: 10,
        color: Theme.colors.textMuted,
        fontWeight: '800',
    },
    resultValue: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '900',
    },
    overActions: {
        width: '100%',
        gap: 12,
    },
    mainButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        color: Theme.colors.textMuted,
        fontWeight: '700',
    },
});

export default KakuroGame;
