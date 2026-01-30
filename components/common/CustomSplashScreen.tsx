import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BrainCircuit } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';

const { width, height } = Dimensions.get('window');

interface CustomSplashScreenProps {
    onFinish: () => void;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        // Start animation sequence
        logoScale.value = withDelay(300, withSpring(1.2, { damping: 10, stiffness: 100 }));
        logoOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

        textOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
        textTranslateY.value = withDelay(800, withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1)) }));

        // Finish splash after 2.5 seconds
        const timer = setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished) {
                    runOnJS(onFinish)();
                }
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <LinearGradient
                colors={Theme.colors.gradients.background}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <LinearGradient
                        colors={Theme.colors.gradients.primary}
                        style={styles.logoGradient}
                    >
                        <BrainCircuit size={60} color="white" />
                    </LinearGradient>
                    {/* Decorative glow */}
                    <View style={styles.glow} />
                </Animated.View>

                <Animated.View style={[styles.textContainer, textStyle]}>
                    <Text style={styles.title}>BrainBoost</Text>
                    <Text style={styles.subtitle}>Unlock Your Potential</Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 32,
        position: 'relative',
    },
    logoGradient: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 20,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    glow: {
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        opacity: 0.15,
        zIndex: -1,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        color: '#fff',
        fontFamily: Theme.fonts.primary,
        letterSpacing: 1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Theme.colors.textMuted,
        fontWeight: '600',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    version: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default CustomSplashScreen;
