import * as ImagePicker from 'expo-image-picker';

export const selectImage = async (): Promise<Blob | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.7,
  });

  if (!result.canceled && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  }

  return null;
};
