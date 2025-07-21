import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import countries from 'i18n-iso-countries';
import { Pencil } from 'lucide-react-native';
import { PlayerCardProps } from '../types/playerCardProps';
import { useUser } from '../app/contexts/UserContext';
import cardFrame from '../assets/images/fifa-card.jpg';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const POSITIONS = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];

const PlayerCard: React.FC<PlayerCardProps> = ({
  imageUrl,
  name,
  nationality,
  position,
  overallRating,
  stats,
  onPositionChange,
}) => {
  const { user } = useUser();
  const isCoach = user?.role === 'coach';
  const isValidImage = imageUrl && imageUrl.startsWith('http');

  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectPosition = (newPosition: string) => {
    onPositionChange?.(newPosition);
    setModalVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <ImageBackground source={cardFrame} style={styles.card} resizeMode="contain">
        <Text style={styles.rating}>{overallRating}</Text>
        <Text style={styles.nationality}>{getFlagEmojiFromCountry(nationality)}</Text>

        {/* Editable Position */}
        <View style={styles.positionWrapper}>
          <Text style={styles.position}>{position}</Text>
          {isCoach && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Pencil size={16} color="#000" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>

        <Image
          source={{
            uri: isValidImage
              ? imageUrl
              : 'https://www.pngkit.com/png/detail/799-7998601_profile-placeholder-person-icon.png',
          }}
          style={styles.playerImage}
        />
        <Text style={styles.name}>{name}</Text>

        <View style={styles.stats}>
          <Stat label="SHO" value={stats.shooting} />
          <Stat label="PAS" value={stats.passing} />
          <Stat label="DRI" value={stats.dribbling} />
          <Stat label="DEF" value={stats.defense} />
          <Stat label="PHY" value={stats.physical} />
          {stats.coachGrade !== undefined && <Stat label="COA" value={stats.coachGrade} />}
        </View>
      </ImageBackground>

      {/* Modal for selecting position */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Position</Text>
            <FlatList
              data={POSITIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelectPosition(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const getFlagEmojiFromCountry = (countryName?: string): string => {
  if (!countryName) return '🌍';
  const code = countries.getAlpha2Code(countryName, 'en');
  if (!code) return '🌍';
  return code.replace(/./g, char =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginVertical: 20 },
  card: { width: 300, height: 400, alignItems: 'center', paddingTop: 10 },
  rating: { fontSize: 27, fontWeight: 'bold', color: '#000', position: 'absolute', top: 70, left: 55 },
  nationality: { fontSize: 30, fontWeight: 'bold', color: '#444', position: 'absolute', top: 205, left: 70 },
  playerImage: { width: 135, height: 135, borderRadius: 80, marginTop: 60, borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#222', marginTop: 7 },

  positionWrapper: {
    position: 'absolute',
    top: 70,
    right: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  position: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

  stats: {
    position: 'absolute',
    bottom: 75,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  statBox: { width: '30%', alignItems: 'center', marginVertical: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  statLabel: { fontSize: 12, color: '#666' },

   modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    color: '#111',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  cancel: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default PlayerCard;
