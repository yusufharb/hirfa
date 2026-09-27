import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  name: string;
  rating: number;
  experience: number;
  distance: number;
}

export default function CraftsmanCard({ name, rating, experience, distance }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>⭐️ {rating} | {experience} سنوات خبرة</Text>
        <Text style={styles.distance}>{distance} كم</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.border,
    marginLeft: 16,
  },
  info: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: COLORS.primary,
  },
});