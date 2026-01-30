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
    Check,
    Trophy,
    Zap,
    Clock,
    Grid3X3,
    RefreshCw,
    Eraser
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 9;
const SUBGRID_SIZE = 3;
const CELL_SIZE = (width - 64) / 9;

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const SudokuGame = () => {
    const router = useRouter();
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [board, setBoard] = useState<(number | null)[][]>([]);
    const [initialBoard, setInitialBoard] = useState<boolean[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState(0);
    const [score, setScore] = useState(0);

    // Sudoku Generator Logic (Simplified)
    const generateSudoku = useCallback((diff: Difficulty) => {
        // 1. Generate local puzzle (using a pre-solved or helper)
        // For brevity, using a simpler solver/generator logic
        const baseSolution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];

        // Shuffle rows/cols within subgrids for variety
        const solved = [...baseSolution.map(row => [...row])];

        const puzzle: (number | null)[][] = solved.map(row => [...row]);
        const initial = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));

        // Remove numbers based on difficulty
        const cellsToRemove = diff === 'Easy' ? 30 : diff === 'Medium' ? 45 : 55;
        let removed = 0;
        while (removed < cellsToRemove) {
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (puzzle[r][c] !== null) {
                puzzle[r][c] = null;
                removed++;
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (puzzle[r][c] !== null) initial[r][c] = true;
            }
        }

        setBoard(puzzle as (number | null)[][]);
        setInitialBoard(initial);
        setSolution(solved);
    }, []);

    useEffect(() => {
        let interval: any;
        if (gameState === 'playing') {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const startGame = () => {
        generateSudoku(difficulty);
        setGameState('playing');
        setTimer(0);
        setErrors(0);
        setScore(0);
        setSelectedCell(null);
    };

    const handleCellPress = (r: number, c: number) => {
        if (initialBoard[r][c]) return;
        setSelectedCell([r, c]);
    };

    const handleNumberInput = (num: number) => {
        if (!selectedCell) return;
        const [r, c] = selectedCell;

        if (board[r][c] !== null) return;

        if (solution[r][c] === num) {
            const newBoard = [...board.map(row => [...row])];
            newBoard[r][c] = num;
            setBoard(newBoard);
            setScore(s => s + 10);
            Vibration.vibrate(50);

            // Check win
            if (newBoard.flat().every(val => val !== null)) {
                setGameState('gameOver');
            }
        } else {
            setErrors(e => e + 1);
            Vibration.vibrate(200);
            if (errors + 1 >= 3) {
                setGameState('gameOver');
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderGrid = () => (
        <View style={styles.grid}>
            {board.map((row, r) => (
                <View key={r} style={[styles.row, r % 3 === 2 && r !== 8 && styles.rowBorder]}>
                    {row.map((cell, c) => {
                        const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                        const isInitial = initialBoard[r][c];
                        return (
                            <Pressable
                                key={`${r}-${c}`}
                                onPress={() => handleCellPress(r, c)}
                                style={[
                                    styles.cell,
                                    c % 3 === 2 && c !== 8 && styles.cellBorder,
                                    isSelected && styles.selectedCell,
                                ]}
                            >
                                <Text style={[
                                    styles.cellText,
                                    isInitial && styles.initialText,
                                    !isInitial && styles.userInputText
                                ]}>
                                    {cell !== null ? cell : ''}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );

    if (gameState === 'start') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Grid3X3 size={40} color={Theme.colors.primary} />
                    </View>
                    <Text style={styles.gameTitle}>Sudoku Master</Text>
                    <Text style={styles.gameDesc}>Sharp your logic and patience with the ultimate number puzzle. Fill the grid with perfection.</Text>

                    <View style={styles.diffList}>
                        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                            <Pressable key={d} onPress={() => setDifficulty(d)} style={styles.diffButton}>
                                <LinearGradient
                                    colors={difficulty === d ? Theme.colors.gradients.primary : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                                    style={styles.diffCard}
                                >
                                    <Text style={[
                                        styles.diffLabel,
                                        difficulty === d ? { color: 'white' } : { color: 'rgba(255,255,255,0.7)' }
                                    ]}>
                                        {d}
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable style={styles.playBtn} onPress={startGame}>
                        <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.buttonText}>Start Mission</Text>
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
                    <View style={styles.statList}>
                        <View style={styles.statBadge}>
                            <Clock size={16} color={Theme.colors.accent} />
                            <Text style={styles.statText}>{formatTime(timer)}</Text>
                        </View>
                        <View style={[styles.statBadge, { borderColor: Theme.colors.error }]}>
                            <Eraser size={16} color={Theme.colors.error} />
                            <Text style={styles.statText}>{errors}/3</Text>
                        </View>
                    </View>
                    <Pressable style={styles.iconBtn} onPress={startGame}>
                        <RotateCcw size={20} color={Theme.colors.textMuted} />
                    </Pressable>
                </View>

                <View style={styles.boardWrapper}>
                    {renderGrid()}
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
                            <Trophy size={60} color={errors < 3 ? Theme.colors.success : Theme.colors.error} />
                            <Text style={styles.overTitle}>{errors < 3 ? 'SUDOKU MATCHED' : 'MISSION FAILED'}</Text>

                            <View style={styles.resultDetails}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>SCORE</Text>
                                    <Text style={styles.resultValue}>{score}</Text>
                                </View>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>TIME</Text>
                                    <Text style={styles.resultValue}>{formatTime(timer)}</Text>
                                </View>
                            </View>

                            <View style={styles.overActions}>
                                <Pressable style={styles.mainButton} onPress={startGame}>
                                    <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                                        <RefreshCw size={18} color="white" />
                                        <Text style={styles.buttonText}>New Puzzle</Text>
                                    </LinearGradient>
                                </Pressable>
                                <Pressable style={styles.secondaryButton} onPress={() => setGameState('start')}>
                                    <Text style={styles.secondaryButtonText}>Difficulty Menu</Text>
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
    diffList: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    diffButton: {
        flex: 1,
    },
    diffCard: {
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    diffLabel: {
        color: Theme.colors.textMuted,
        fontWeight: 'bold',
        fontSize: 14,
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
        marginBottom: 32,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statList: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    boardWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    grid: {
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    row: {
        flexDirection: 'row',
    },
    rowBorder: {
        borderBottomWidth: 2,
        borderBottomColor: Theme.colors.primary,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellBorder: {
        borderRightWidth: 2,
        borderRightColor: Theme.colors.primary,
    },
    selectedCell: {
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
    },
    cellText: {
        fontSize: 20,
        fontWeight: '900',
    },
    initialText: {
        color: '#fff',
    },
    userInputText: {
        color: Theme.colors.primary,
    },
    numPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
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
        fontSize: 28,
        color: '#fff',
        fontFamily: Theme.fonts.primary,
        marginVertical: 24,
        textAlign: 'center',
    },
    resultDetails: {
        flexDirection: 'row',
        gap: 32,
        marginBottom: 40,
    },
    resultItem: {
        alignItems: 'center',
        flex: 1,
    },
    resultLabel: {
        fontSize: 10,
        color: Theme.colors.textMuted,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 24,
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

export default SudokuGame;
