import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MemoryGame from '../../components/games/MemoryGame';

export default function MemoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <MemoryGame />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
