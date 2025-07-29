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
import cardFrame from '../assets/images/FIFA-card-kaki.png';

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
        {/* Overall Rating */}
        <Text style={styles.rating}>{overallRating}</Text>
        
        {/* Country Flag */}
        <Text style={styles.nationality}>{getFlagEmojiFromCountry(nationality)}</Text>

        {/* Editable Position */}
        <View style={styles.positionWrapper}>
          <Text style={styles.position}>{position}</Text>
          {isCoach && (
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              style={styles.editButton}
              activeOpacity={0.8}
            >
              <Pencil size={14} color="#1a4d3a" />
            </TouchableOpacity>
          )}
        </View>

        {/* Player Image */}
        <Image
          source={{
            uri: isValidImage
              ? imageUrl
              : 'https://www.pngkit.com/png/detail/799-7998601_profile-placeholder-person-icon.png',
          }}
          style={styles.playerImage}
        />
        
        {/* Player Name */}
        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
          {name}
        </Text>

        {/* Stats Grid */}
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
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.option} 
                  onPress={() => handleSelectPosition(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
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
  wrapper: { 
    alignItems: 'center', 
    marginVertical: 16,
  },
  card: { 
    width: 360, 
    height: 480, 
    alignItems: 'center', 
    paddingTop: 8,
  },
  rating: { 
    fontSize: 30, 
    fontWeight: '900', // Nike uses ultra-bold weights
    color: '#1a4d3a', // Evolv11 green
    position: 'absolute', 
    top: 95, 
    left: 60,
    letterSpacing: -1, // Tight letter spacing
    fontFamily: 'System', // Clean system font
  },
  nationality: { 
    fontSize: 34, 
    position: 'absolute', 
    top: 90, 
    left: 260,
  },
  playerImage: { 
    width: 140, 
    height: 140, 
    borderRadius: 80, // Circular image
    marginTop: 80, 
    borderWidth: 3, 
    borderColor: '#d4b896', // Evolv11 khaki
  },
  name: { 
    fontSize: 17, 
    fontWeight: '600', // Nike's preferred medium weight
    color: '#1a4d3a', // Evolv11 green
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    maxWidth: 180,
    letterSpacing: 0.5, // Slightly spaced for readability
    textTransform: 'uppercase', // Nike often uses uppercase
    fontFamily: 'System',
  },

  positionWrapper: {
    position: 'absolute',
    top: 50,
    right: 130,
    flexDirection: 'row',
    alignItems: 'center',
  },
  position: {
    fontSize: 24,
    fontWeight: '900', // Ultra-bold like Nike
    color: '#1a4d3a', // Evolv11 green
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  editButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 15, // Sharp edges like Nike
    backgroundColor: 'rgba(26, 77, 58, 0.1)', // Evolv11 green overlay
  },

  stats: {
    position: 'absolute',
    bottom: 105,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    flexWrap: 'wrap',
  },
  statBox: { 
    width: '25.01%', 
    alignItems: 'center', 
    marginVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Clean white background
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 0, // Sharp Nike-inspired edges
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a4d3a', // Evolv11 green border
  },
  statValue: { 
    fontSize: 12, 
    fontWeight: '900', // Ultra-bold Nike style
    color: '#1a4d3a', // Evolv11 green
    letterSpacing: -0.5, // Tight spacing
    fontFamily: 'System',
  },
  statLabel: { 
    fontSize: 10, 
    color: '#666666', // Nike's preferred gray
    fontWeight: '600', // Medium weight
    marginTop: 2,
    letterSpacing: 0.5, // Slightly spaced
    textTransform: 'uppercase', // Nike style
    fontFamily: 'System',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay like Nike
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: '#f5f3f0', // Evolv11 beige background
    borderRadius: 0, // Sharp edges
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: '#1a4d3a', // Evolv11 green border
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900', // Ultra-bold
    textAlign: 'center',
    marginBottom: 24,
    color: '#1a4d3a', // Evolv11 green
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 2,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    borderWidth: 1,
    borderColor: '#1a4d3a', // Evolv11 green border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#1a4d3a', // Evolv11 green
    fontWeight: '700', // Bold
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#1a4d3a', // Evolv11 green
    borderRadius: 0, // Sharp edges
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cancel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ffffff', // White text on green
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
});

export default PlayerCard;
