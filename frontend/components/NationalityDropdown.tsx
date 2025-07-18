import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

// Define the props type: a callback to pass selected nationality to parent
interface NationalityDropdownProps {
  onSelect: (nationality: string) => void;
}

// Converts ISO country code to emoji flag
const countryCodeToEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));

export default function NationalityDropdown({ onSelect }: NationalityDropdownProps) {
  // Controls dropdown visibility
  const [open, setOpen] = useState(false);

  // Stores the selected country name
  const [value, setValue] = useState<string | null>(null);

  // Holds the list of country items with labels and flags
  const [items, setItems] = useState<
    { label: string; value: string; icon: () => React.ReactNode }[]
  >([]);

  // Fetch list of countries and convert them to dropdown options
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // Map response to dropdown format
        const countryOptions = data.map((country: any) => {
          const emoji = country.cca2
            ? countryCodeToEmoji(country.cca2)
            : '🏳️'; // fallback if missing
          return {
            label: country.name.common,
            value: country.name.common,
            icon: () => <Text style={{ marginRight: 6 }}>{emoji}</Text>,
          };
        });

        // Sort alphabetically by name
        countryOptions.sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
        setItems(countryOptions);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };

    fetchCountries();
  }, []);

  // Trigger parent handler whenever selected value changes
  useEffect(() => {
    if (value) onSelect(value);
  }, [value]);

  return (
    <View style={styles.container}>
      {/* Label above the dropdown */}
      <Text style={styles.label}>Nationality:</Text>

      {/* Dropdown with emoji flags + country names */}
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
        zIndex={1000} // Ensures it's on top of other UI
        textStyle={{ fontSize: 16 }}
      />
    </View>
  );
}

// Style definitions
const styles = StyleSheet.create({
  container: {
    zIndex: 1000, // required to keep dropdown on top when expanded
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
});
