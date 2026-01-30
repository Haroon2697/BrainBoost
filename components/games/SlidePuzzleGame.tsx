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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Play,
    RotateCcw,
    Home,
    Trophy,
    RefreshCw,
    Maximize,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const BOARD_SIZE = width - 48;
const CELL_SIZE = (BOARD_SIZE - 20) / GRID_SIZE;

const SlidePuzzleGame = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [board, setBoard] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [timer, setTimer] = useState(0);

    const isSolvable = (arr: number[]) => {
        let inversions = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] && arr[j] && arr[i] > arr[j]) inversions++;
            }
        }
        const emptyRowFromBottom = GRID_SIZE - Math.floor(arr.indexOf(0) / GRID_SIZE);
        if (GRID_SIZE % 2 !== 0) return inversions % 2 === 0;
        else return (emptyRowFromBottom % 2 === 0) ? (inversions % 2 !== 0) : (inversions % 2 === 0);
    };

    const initGame = useCallback(() => {
        let newBoard = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        do {
            newBoard.sort(() => Math.random() - 0.5);
        } while (!isSolvable(newBoard) || isGameWon(newBoard));

        setBoard(newBoard);
        setMoves(0);
        setTimer(0);
        setGameState('playing');
    }, []);

    const isGameWon = (currentBoard: number[]) => {
        for (let i = 0; i < currentBoard.length - 1; i++) {
            if (currentBoard[i] !== i + 1) return false;
        }
        return currentBoard[currentBoard.length - 1] === 0;
    };

    const handleCellPress = (index: number) => {
        if (gameState !== 'playing') return;

        const emptyIndex = board.indexOf(0);
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
        const emptyCol = emptyIndex % GRID_SIZE;

        const isAdjacent =
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow);

        if (isAdjacent) {
            const newBoard = [...board];
            [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
            setBoard(newBoard);
            setMoves(m => m + 1);
            Vibration.vibrate(50);

            if (isGameWon(newBoard)) {
                setGameState('gameOver');
            }
        }
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
                        <Maximize size={40} color={Theme.colors.secondary} />
                    </View>
                    <Text style={styles.gameTitle}>Slide Master</Text>
                    <Text style={styles.gameDesc}>Arrange the tiles in numerical order by sliding them into the empty space. A true mental workout!</Text>

                    <Pressable style={styles.playBtn} onPress={initGame}>
                        <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.buttonText}>Engage Brain</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={styles.backLink} onPress={() => router.back()}>
                        <Text style={styles.backText}>Return to HQ</Text>
                    </Pressable>
                </SafeAreaView>
                <View style={{ height: insets.bottom }} />
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
                            <Text style={styles.statLabel}>MOVES</Text>
                            <Text style={styles.statValue}>{moves}</Text>
                        </View>
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
                        {board.map((val, i) => (
                            <Pressable
                                key={i}
                                style={[
                                    styles.cell,
                                    val === 0 && styles.emptyCell
                                ]}
                                onPress={() => handleCellPress(i)}
                            >
                                {val !== 0 && (
                                    <LinearGradient colors={Theme.colors.gradients.glass} style={styles.cellGradient}>
                                        <Text style={styles.cellText}>{val}</Text>
                                    </LinearGradient>
                                )}
                            </Pressable>
                        ))}
                    </View>
                </View>

                {gameState === 'gameOver' && (
                    <View style={styles.overlay}>
                        <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
                            <Trophy size={60} color={Theme.colors.success} />
                            <Text style={styles.overTitle}>CIRCUIT COMPLETE</Text>

                            <View style={styles.resultDetails}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>MOVES</Text>
                                    <Text style={styles.resultValue}>{moves}</Text>
                                </View>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>TIME</Text>
                                    <Text style={styles.resultValue}>{formatTime(timer)}</Text>
                                </View>
                            </View>

                            <View style={styles.overActions}>
                                <Pressable style={styles.mainButton} onPress={initGame}>
                                    <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
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
                <View style={{ height: insets.bottom }} />
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
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
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
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statLabel: {
        fontSize: 8,
        color: Theme.colors.textMuted,
        fontWeight: '900',
        letterSpacing: 1,
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
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        margin: 2,
    },
    cellGradient: {
        flex: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyCell: {
        backgroundColor: 'transparent',
    },
    cellText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
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

export default SlidePuzzleGame;
