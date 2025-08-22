import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

interface NationalityDropdownProps {
  onSelect: (nationality: string) => void;
  initialValue?: string;
}

// Converts ISO country code to emoji flag
const countryCodeToEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));

export default function NationalityDropdown({ onSelect, initialValue }: NationalityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<
    { label: string; value: string; icon: () => React.ReactNode }[]
  >([]);
  const [originalItems, setOriginalItems] = useState<
    { label: string; value: string; icon: () => React.ReactNode }[]
  >([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        console.log('Fetching countries...');
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log('Countries data length:', data.length);

        const countryOptions = data.map((country: any) => {
          const emoji = country.cca2
            ? countryCodeToEmoji(country.cca2)
            : '🏳️';
          return {
            label: country.name.common,
            value: country.name.common,
            icon: () => <Text style={styles.flagEmoji}>{emoji}</Text>,
          };
        });

        countryOptions.sort((a: { label: string }, b: { label: string }) =>
          a.label.localeCompare(b.label)
        );
        console.log('Processed countries:', countryOptions.length);
        setItems(countryOptions);
        setOriginalItems(countryOptions);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (value && value !== initialValue) {
      onSelect(value);
    }
  }, [value]);

  // Set initial value when provided
  useEffect(() => {
    if (initialValue && !value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  // Set initial value when component mounts
  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) {
      setItems(originalItems);
      return;
    }

    const filteredItems = originalItems.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase())
    );
    setItems(filteredItems);
  };

  return (
    <View style={styles.wrapper}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={setValue}
        items={items}
        setItems={setItems}
        placeholder="Select your nationality"
        searchable={true}
        searchPlaceholder="Search countries..."
        onChangeSearchText={handleSearch}
        onChangeValue={(val) => {
          if (typeof val === 'string') setValue(val);
        }}
        // Styling to match design system
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholder}
        dropDownContainerStyle={styles.dropdownContainer}
        searchContainerStyle={styles.searchContainer}
        searchTextInputStyle={styles.searchInput}
        listItemLabelStyle={styles.listItemLabel}
        selectedItemLabelStyle={styles.selectedItemLabel}
        arrowIconStyle={styles.arrowIcon}
        tickIconStyle={styles.tickIcon}
        listMode="MODAL"
        modalProps={{
          animationType: 'slide',
          presentationStyle: 'pageSheet',
        }}
        modalContentContainerStyle={styles.modalContainer}
        modalTitle="Select Nationality"
        modalTitleStyle={styles.modalTitle}
        closeAfterSelecting={true}
        searchPlaceholderTextColor="#9ca3af"
        ActivityIndicatorComponent={() => null}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No countries found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 6,
    zIndex: Platform.OS === 'android' ? 1 : 1000,
  },

  // Main dropdown input styling to match design system
  dropdown: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b896',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 0,
    minHeight: 44,
    borderRadius: 0,
  },

  dropdownText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
  },

  placeholder: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '400',
  },

  flagEmoji: {
    marginRight: 8,
    fontSize: 28,
  },

  // Modal container styling
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Search input styling
  searchContainer: {
    backgroundColor: '#ffffffff',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#000000ff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 0,
    paddingHorizontal: 0,
  },

  searchInput: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },

  // Dropdown container when open (not modal)
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4b896',
    borderTopWidth: 0,
    maxHeight: 200,
  },

  // List item styling
  listItemLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
    paddingVertical: 8,
  },

  selectedItemLabel: {
    fontSize: 15,
    color: '#1a4d3a',
    fontWeight: '600',
  },

  // Icon styling
  arrowIcon: {
    tintColor: '#1a4d3a',
    width: 20,
    height: 20,
  },

  tickIcon: {
    tintColor: '#1a4d3a',
    width: 20,
    height: 20,
  },

  // Empty state styling
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
    textAlign: 'center',
  },
});
  