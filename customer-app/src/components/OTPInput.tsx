import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

export default function OTPInput({ length, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={length}
        textAlign="center"
        placeholder="------"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  input: {
    fontSize: 32,
    letterSpacing: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 8,
    minWidth: 200,
    color: COLORS.text,
  },
});