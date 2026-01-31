"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { runOnJS } from 'react-native-reanimated';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    Vibration,
    SafeAreaView,
    PanResponder,
    Animated,
} from 'react-native';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Play,
    RotateCcw,
    Home,
    Trophy,
    Zap,
    RefreshCw,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const CELL_MARGIN = 8;
const BOARD_PADDING = 12;
const BOARD_SIZE = width - 48;
const CELL_SIZE = (BOARD_SIZE - (BOARD_PADDING * 2) - (CELL_MARGIN * (GRID_SIZE - 1))) / GRID_SIZE;

type Grid = number[][];

const tileColors: { [key: number]: string } = {
    2: '#6366f1',    // Indigo (Theme Primary)
    4: '#818cf8',    // Lighter Indigo
    8: '#ec4899',    // Pink (Theme Secondary)
    16: '#f472b6',   // Lighter Pink
    32: '#10b981',   // Emerald (Theme Accent)
    64: '#34d399',   // Lighter Emerald
    128: '#f59e0b',  // Amber
    256: '#fbbf24',  // Lighter Amber
    512: '#ef4444',  // Red
    1024: '#f87171', // Lighter Red
    2048: '#a855f7', // Purple
};

const TwoZeroFourEightGame = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [grid, setGrid] = useState<Grid>(Array(4).fill(null).map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [gameWon, setGameWon] = useState(false);

    const initGame = useCallback(() => {
        let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameState('playing');
        setGameWon(false);
    }, []);

    const addRandomTile = (currentGrid: Grid): Grid => {
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return currentGrid;
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    };

    const move = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (gameState !== 'playing') return;

        let newGrid = grid.map(row => [...row]);
        let moved = false;
        let scoreGain = 0;

        const rotate = (matrix: Grid) => {
            return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
        };

        // Align grid so that we always move "left"
        let rotations = 0;
        if (direction === 'up') rotations = 1;
        else if (direction === 'right') rotations = 2;
        else if (direction === 'down') rotations = 3;

        for (let i = 0; i < rotations; i++) newGrid = rotate(newGrid);

        // Process move left
        for (let r = 0; r < GRID_SIZE; r++) {
            let row = newGrid[r].filter(val => val !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    scoreGain += row[i];
                    row.splice(i + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(GRID_SIZE - row.length).fill(0));
            if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            newGrid[r] = newRow;
        }

        // Rotate back
        for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotate(newGrid);

        if (moved) {
            newGrid = addRandomTile(newGrid);
            setGrid(newGrid);
            setScore(s => s + scoreGain);
            Vibration.vibrate(50);

            if (scoreGain > 0) {
                // Check if 2048 reached
                if (newGrid.flat().includes(2048) && !gameWon) {
                    setGameWon(true);
                    setGameState('gameOver');
                }
            }

            // Check Game Over
            if (isGameOver(newGrid)) {
                setGameState('gameOver');
            }
        }
    };

    const isGameOver = (currentGrid: Grid): boolean => {
        if (currentGrid.flat().includes(0)) return false;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const val = currentGrid[r][c];
                if (r < GRID_SIZE - 1 && val === currentGrid[r + 1][c]) return false;
                if (c < GRID_SIZE - 1 && val === currentGrid[r][c + 1]) return false;
            }
        }
        return true;
    };

    const flingUp = Gesture.Fling().direction(Directions.UP).onStart(() => {
        runOnJS(move)('up');
    });
    const flingDown = Gesture.Fling().direction(Directions.DOWN).onStart(() => {
        runOnJS(move)('down');
    });
    const flingLeft = Gesture.Fling().direction(Directions.LEFT).onStart(() => {
        runOnJS(move)('left');
    });
    const flingRight = Gesture.Fling().direction(Directions.RIGHT).onStart(() => {
        runOnJS(move)('right');
    });

    const composedGestures = Gesture.Race(flingUp, flingDown, flingLeft, flingRight);

    useEffect(() => {
        if (score > bestScore) setBestScore(score);
    }, [score]);

    const renderCell = (value: number, r: number, c: number) => {
        return (
            <View key={`${r}-${c}`} style={styles.cell}>
                <LinearGradient
                    colors={value === 0 ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : [tileColors[value] || Theme.colors.primary, (tileColors[value] || Theme.colors.primary) + '88']}
                    style={styles.cellGradient}
                >
                    {value !== 0 && (
                        <Text style={[
                            styles.cellText,
                            { fontSize: value > 100 ? (value > 1000 ? 18 : 22) : 28 }
                        ]}>
                            {value}
                        </Text>
                    )}
                </LinearGradient>
            </View>
        );
    };

    if (gameState === 'start') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Zap size={40} color={Theme.colors.primary} />
                    </View>
                    <Text style={styles.gameTitle}>2048 Master</Text>
                    <Text style={styles.gameDesc}>Merge tiles and reach the legendary 2048. A test of spatial reasoning and mathematical foresight.</Text>

                    <Pressable style={styles.playBtn} onPress={initGame}>
                        <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.buttonText}>Start Mission</Text>
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
                    <View style={styles.scoreBoard}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>SCORE</Text>
                            <Text style={styles.scoreValue}>{score}</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>BEST</Text>
                            <Text style={styles.scoreValue}>{bestScore}</Text>
                        </View>
                    </View>
                    <Pressable style={styles.iconBtn} onPress={initGame}>
                        <RotateCcw size={20} color={Theme.colors.textMuted} />
                    </Pressable>
                </View>

                <View style={styles.boardWrapper}>
                    <GestureDetector gesture={composedGestures}>
                        <View style={styles.board}>
                            {grid.map((row, r) => (
                                <View key={r} style={styles.row}>
                                    {row.map((val, c) => renderCell(val, r, c))}
                                </View>
                            ))}
                        </View>
                    </GestureDetector>
                </View>

                <View style={styles.tipContainer}>
                    <Text style={styles.tipText}>Swipe in any direction to move tiles</Text>
                </View>

                {gameState === 'gameOver' && (
                    <View style={styles.overlay}>
                        <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
                            <Trophy size={60} color={gameWon ? Theme.colors.success : Theme.colors.error} />
                            <Text style={styles.overTitle}>{gameWon ? 'MISSION ACHIEVED' : 'POWER DEPLETED'}</Text>

                            <View style={styles.resultDetails}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>FINAL SCORE</Text>
                                    <Text style={styles.resultValue}>{score}</Text>
                                </View>
                            </View>

                            <View style={styles.overActions}>
                                <Pressable style={styles.mainButton} onPress={initGame}>
                                    <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                                        <RefreshCw size={18} color="white" />
                                        <Text style={styles.buttonText}>Try Again</Text>
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
    scoreBoard: {
        flexDirection: 'row',
        gap: 8,
    },
    scoreItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 70,
    },
    scoreLabel: {
        fontSize: 8,
        color: Theme.colors.textMuted,
        fontWeight: '900',
    },
    scoreValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '800',
    },
    boardWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    board: {
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: BOARD_PADDING,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    row: {
        flexDirection: 'row',
        marginBottom: CELL_MARGIN,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        marginRight: CELL_MARGIN,
    },
    cellGradient: {
        flex: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellText: {
        color: '#fff',
        fontWeight: '900',
    },
    tipContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    tipText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontStyle: 'italic',
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
        marginBottom: 40,
        alignItems: 'center',
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

export default TwoZeroFourEightGame;
