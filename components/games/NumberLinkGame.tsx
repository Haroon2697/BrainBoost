"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    Vibration,
    SafeAreaView,
    PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import {
    Play,
    RotateCcw,
    Home,
    Trophy,
    RefreshCw,
    Link as LinkIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 5;
const BOARD_SIZE = width - 48;
const CELL_SIZE = (BOARD_SIZE - 20) / GRID_SIZE;

const NUMBER_COLORS: { [key: number]: string } = {
    1: '#6366f1', // Indigo
    2: '#ec4899', // Pink
    3: '#10b981', // Emerald
    4: '#f59e0b', // Amber
    5: '#ef4444', // Red
};

interface Point {
    r: number;
    c: number;
}

const NumberLinkGame = () => {
    const router = useRouter();
    const [board, setBoard] = useState<(number | null)[][]>([]);
    const [paths, setPaths] = useState<{ [key: number]: Point[] }>({});
    const [currentPath, setCurrentPath] = useState<{ num: number; points: Point[] } | null>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [status, setStatus] = useState<'drawing' | 'idle'>('idle');

    const initGame = useCallback(() => {
        // Simplified level: 5x5 with 3-4 pairs
        const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

        // Hardcoded level for the first version to ensure solvability
        const level = [
            [1, null, null, null, 2],
            [null, null, null, null, null],
            [3, null, null, null, null],
            [null, null, null, 1, 2],
            [null, 3, null, null, null]
        ];

        setBoard(level);
        setPaths({});
        setGameState('playing');
    }, []);

    const isConnected = (num: number, currentPaths: { [key: number]: Point[] }) => {
        const path = currentPaths[num];
        if (!path || path.length < 2) return false;

        const start = path[0];
        const end = path[path.length - 1];

        // Check if endpoints are the number cells on the initial board
        return board[start.r][start.c] === num && board[end.r][end.c] === num;
    };

    const isGameWon = (currentPaths: { [key: number]: Point[] }) => {
        // 1. All pairs connected
        const numbers = [1, 2, 3]; // For our hardcoded level
        const allConnected = numbers.every(n => isConnected(n, currentPaths));
        if (!allConnected) return false;

        // 2. All cells filled
        const filledCells = new Set();
        Object.values(currentPaths).forEach(path => {
            path.forEach(p => filledCells.add(`${p.r},${p.c}`));
        });

        return filledCells.size === GRID_SIZE * GRID_SIZE;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e, gestureState) => {
                const { locationX, locationY } = e.nativeEvent;
                const r = Math.floor(locationY / CELL_SIZE);
                const c = Math.floor(locationX / CELL_SIZE);

                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    const num = board[r][c];
                    if (num !== null) {
                        setStatus('drawing');
                        setCurrentPath({ num, points: [{ r, c }] });
                        // Clear existing path for this number
                        setPaths(prev => {
                            const newPaths = { ...prev };
                            delete newPaths[num];
                            return newPaths;
                        });
                        Vibration.vibrate(30);
                    }
                }
            },
            onPanResponderMove: (e, gestureState) => {
                if (status !== 'drawing' || !currentPath) return;

                const { locationX, locationY } = e.nativeEvent;
                const r = Math.floor(locationY / CELL_SIZE);
                const c = Math.floor(locationX / CELL_SIZE);

                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    const lastPoint = currentPath.points[currentPath.points.length - 1];
                    if (r === lastPoint.r && c === lastPoint.c) return;

                    // Must be adjacent
                    const isAdjacent = Math.abs(r - lastPoint.r) + Math.abs(c - lastPoint.c) === 1;
                    if (!isAdjacent) return;

                    // Check if cell is occupied by ANOTHER path
                    const isOccupied = Object.entries(paths).some(([num, path]) =>
                        parseInt(num) !== currentPath.num && path.some(p => p.r === r && p.c === c)
                    );
                    if (isOccupied) return;

                    // If it's a number cell, it must match the path number
                    if (board[r][c] !== null && board[r][c] !== currentPath.num) return;

                    // Check if backtracking
                    const pointExists = currentPath.points.findIndex(p => p.r === r && p.c === c);
                    if (pointExists !== -1) {
                        // Truncate path if backtracking
                        setCurrentPath(prev => ({
                            ...prev!,
                            points: prev!.points.slice(0, pointExists + 1)
                        }));
                    } else {
                        // If we reached the target number, finish the path
                        if (board[r][c] === currentPath.num && currentPath.points.length > 0) {
                            // Target reached
                            const newPoints = [...currentPath.points, { r, c }];
                            setCurrentPath({ ...currentPath, points: newPoints });
                            setPaths(prev => {
                                const newPaths = { ...prev, [currentPath.num]: newPoints };
                                if (isGameWon(newPaths)) setGameState('gameOver');
                                return newPaths;
                            });
                            setStatus('idle');
                            Vibration.vibrate(50);
                        } else if (board[r][c] === null) {
                            // Just an empty cell
                            const newPoints = [...currentPath.points, { r, c }];
                            setCurrentPath({ ...currentPath, points: newPoints });
                        }
                    }
                }
            },
            onPanResponderRelease: () => {
                if (status === 'drawing' && currentPath) {
                    // Check if path is valid (connects both endpoints)
                    if (isConnected(currentPath.num, { [currentPath.num]: currentPath.points })) {
                        setPaths(prev => {
                            const newPaths = { ...prev, [currentPath.num]: currentPath.points };
                            if (isGameWon(newPaths)) setGameState('gameOver');
                            return newPaths;
                        });
                    }
                }
                setStatus('idle');
                setCurrentPath(null);
            },
        })
    ).current;

    const getCellColor = (r: number, c: number) => {
        // Check current path
        if (currentPath && currentPath.points.some(p => p.r === r && p.c === c)) {
            return NUMBER_COLORS[currentPath.num];
        }
        // Check saved paths
        for (const [num, path] of Object.entries(paths)) {
            if (path.some(p => p.r === r && p.c === c)) {
                return NUMBER_COLORS[parseInt(num)];
            }
        }
        return 'rgba(255,255,255,0.05)';
    };

    if (gameState === 'start') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.content}>
                    <View style={styles.iconCircle}>
                        <LinkIcon size={40} color={Theme.colors.primary} />
                    </View>
                    <Text style={styles.gameTitle}>Flow Connect</Text>
                    <Text style={styles.gameDesc}>Connect matching numbers with paths. Fill all cells and don't cross your paths!</Text>

                    <Pressable style={styles.playBtn} onPress={initGame}>
                        <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.buttonText}>Open Flow</Text>
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
                    <Text style={styles.gameHeaderTitle}>Flow Connect</Text>
                    <Pressable style={styles.iconBtn} onPress={initGame}>
                        <RotateCcw size={20} color={Theme.colors.textMuted} />
                    </Pressable>
                </View>

                <View style={styles.boardWrapper}>
                    <View style={styles.board} {...panResponder.panHandlers}>
                        {Array(GRID_SIZE).fill(0).map((_, r) => (
                            <View key={r} style={styles.row}>
                                {Array(GRID_SIZE).fill(0).map((_, c) => {
                                    const num = board[r][c];
                                    const color = getCellColor(r, c);
                                    return (
                                        <View key={`${r}-${c}`} style={styles.cell}>
                                            <View style={[styles.cellInner, { backgroundColor: color }]}>
                                                {num !== null && (
                                                    <View style={styles.numberCircle}>
                                                        <Text style={styles.numberText}>{num}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>

                {gameState === 'gameOver' && (
                    <View style={styles.overlay}>
                        <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
                            <Trophy size={60} color={Theme.colors.success} />
                            <Text style={styles.overTitle}>FLOW SYNCHRONIZED</Text>
                            <View style={styles.overActions}>
                                <Pressable style={styles.mainButton} onPress={initGame}>
                                    <LinearGradient colors={Theme.colors.gradients.primary} style={styles.buttonGradient}>
                                        <RefreshCw size={18} color="white" />
                                        <Text style={styles.buttonText}>Next Level</Text>
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
    gameHeaderTitle: {
        color: Theme.colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: Theme.fonts.primary,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
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
        borderRadius: 16,
        padding: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    row: {
        flexDirection: 'row',
        flex: 1,
    },
    cell: {
        flex: 1,
        padding: 2,
    },
    cellInner: {
        flex: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
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
        textAlign: 'center',
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

export default NumberLinkGame;
