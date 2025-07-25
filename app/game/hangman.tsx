import { View } from 'react-native';
import HangmanGame from '../../components/games/HangmanGame';

export default function HangmanScreen() {
  return (
    <View style={{ flex: 1 }}>
      <HangmanGame />
    </View>
  );
}
