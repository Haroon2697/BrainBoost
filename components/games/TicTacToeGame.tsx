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
import {
    Play,
    RotateCcw,
    Home,
    Trophy,
    Zap,
    User,
    Cpu,
    RefreshCw,
    Hash
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    FadeInScale
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_SIZE = (width - 80) / 3;

type Player = 'X' | 'O' | null;

const TicTacToeGame = () => {
    const router = useRouter();
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<Player | 'Draw'>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [winningLine, setWinningLine] = useState<number[] | null>(null);

    const checkWinner = (squares: Player[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        if (squares.every(s => s !== null)) return { winner: 'Draw' as const, line: null };
        return null;
    };

    const handlePress = (i: number) => {
        if (board[i] || winner || gameState !== 'playing') return;

        const newBoard = [...board];
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
        Vibration.vibrate(50);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setGameState('gameOver');
            Vibration.vibrate(200);
        } else if (!isXNext === false) { // AI Turn
            // Basic AI could be added here
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setWinningLine(null);
        setGameState('playing');
    };

    const renderSquare = (i: number) => {
        const isWinningSquare = winningLine?.includes(i);
        return (
            <Pressable
                key={i}
                style={[
                    styles.cell,
                    isWinningSquare && styles.winningCell
                ]}
                onPress={() => handlePress(i)}
            >
                <LinearGradient colors={Theme.colors.gradients.glass} style={StyleSheet.absoluteFill} />
                {board[i] && (
                    <Animated.View entering={FadeInScale} style={styles.markContainer}>
                        <Text style={[
                            styles.markText,
                            board[i] === 'X' ? styles.xText : styles.oText
                        ]}>
                            {board[i]}
                        </Text>
                    </Animated.View>
                )}
            </Pressable>
        );
    };

    if (gameState === 'start') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={Theme.colors.gradients.background} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Hash size={40} color={Theme.colors.secondary} />
                    </View>
                    <Text style={styles.gameTitle}>Tic Tac Toe</Text>
                    <Text style={styles.gameDesc}>The classic battle of wits. Strategic placement and anticipation are your only weapons.</Text>

                    <Pressable style={styles.playBtn} onPress={() => setGameState('playing')}>
                        <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.buttonText}>Enter Arena</Text>
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
                    <View style={styles.turnIndicator}>
                        <View style={[styles.playerBadge, isXNext && styles.activeBadge]}>
                            <User size={16} color={isXNext ? '#fff' : Theme.colors.textMuted} />
                            <Text style={[styles.playerText, isXNext && styles.activePlayerText]}>PLAYER X</Text>
                        </View>
                        <View style={[styles.playerBadge, !isXNext && styles.activeBadge]}>
                            <Cpu size={16} color={!isXNext ? '#fff' : Theme.colors.textMuted} />
                            <Text style={[styles.playerText, !isXNext && styles.activePlayerText]}>PLAYER O</Text>
                        </View>
                    </View>
                    <Pressable style={styles.iconBtn} onPress={resetGame}>
                        <RotateCcw size={20} color={Theme.colors.textMuted} />
                    </Pressable>
                </View>

                <View style={styles.boardWrapper}>
                    <View style={styles.grid}>
                        {Array(9).fill(null).map((_, i) => renderSquare(i))}
                    </View>
                </View>

                {gameState === 'gameOver' && (
                    <View style={styles.overlay}>
                        <LinearGradient colors={Theme.colors.gradients.glass} style={styles.gameOverCard}>
                            <Trophy size={60} color={winner === 'Draw' ? Theme.colors.textMuted : Theme.colors.success} />
                            <Text style={styles.overTitle}>
                                {winner === 'Draw' ? 'IT\'S A STALEMATE' : `VICTORY FOR ${winner}`}
                            </Text>

                            <View style={styles.overActions}>
                                <Pressable style={styles.mainButton} onPress={resetGame}>
                                    <LinearGradient colors={Theme.colors.gradients.secondary} style={styles.buttonGradient}>
                                        <RefreshCw size={18} color="white" />
                                        <Text style={styles.buttonText}>Rematch</Text>
                                    </LinearGradient>
                                </Pressable>
                                <Pressable style={styles.secondaryButton} onPress={() => setGameState('start')}>
                                    <Text style={styles.secondaryButtonText}>Main Menu</Text>
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
        marginBottom: 60,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    turnIndicator: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 4,
        borderRadius: 50,
    },
    playerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 50,
    },
    activeBadge: {
        backgroundColor: Theme.colors.secondary,
    },
    playerText: {
        fontSize: 10,
        color: Theme.colors.textMuted,
        fontWeight: '800',
        letterSpacing: 1,
    },
    activePlayerText: {
        color: '#fff',
    },
    boardWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        width: width - 48,
        height: width - 48,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    winningCell: {
        borderColor: Theme.colors.success,
        borderWidth: 2,
    },
    markContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    markText: {
        fontSize: 48,
        fontWeight: '900',
        fontFamily: Theme.fonts.primary,
    },
    xText: {
        color: Theme.colors.primary,
    },
    oText: {
        color: Theme.colors.secondary,
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

export default TicTacToeGame;
