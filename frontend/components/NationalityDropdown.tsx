import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

interface NationalityDropdownProps {
  onSelect: (nationality: string) => void;
}

// Converts ISO country code to emoji flag
const countryCodeToEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));

export default function NationalityDropdown({ onSelect }: NationalityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<
    { label: string; value: string; icon: () => React.ReactNode }[]
  >([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const countryOptions = data.map((country: any) => {
          const emoji = country.cca2
            ? countryCodeToEmoji(country.cca2)
            : '🏳️';
          return {
            label: country.name.common,
            value: country.name.common,
            icon: () => <Text style={{ marginRight: 6 }}>{emoji}</Text>,
          };
        });

        countryOptions.sort((a: { label: string }, b: { label: string }) =>
          a.label.localeCompare(b.label)
        );
        setItems(countryOptions);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (value) onSelect(value);
  }, [value]);

  return (
    <View style={styles.wrapper}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={setValue}
        items={items}
        setItems={setItems}
        placeholder="Select a country"
        onChangeValue={(val) => {
          if (typeof val === 'string') setValue(val);
        }}
        textStyle={{ fontSize: 16 }}
        listMode="MODAL" // ✅ use modal to avoid VirtualizedList nesting issues
        modalProps={{
          animationType: 'slide',
        }}
        modalContentContainerStyle={{ backgroundColor: 'white' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    zIndex: Platform.OS === 'android' ? 1 : 1000, // ✅ Helps iOS keep dropdown above other components
  },
});
  