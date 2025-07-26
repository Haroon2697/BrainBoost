import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MathChallengeGame = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Math Challenge</Text>
      {/* Game implementation goes here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default MathChallengeGame; 