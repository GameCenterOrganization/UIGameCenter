import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const Categories = ({ selectedCategory, onCategorySelect }) => {
  const categories = [
    'All',
    'Action',
    'Adventure',
    'RPG',
    'Strategy',
    'Shooter',
    'Sports',
    'Racing',
    'Puzzle',
    'Simulation',
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onCategorySelect(category)} 
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.activeCategoryButton
          ]}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === category && styles.activeCategoryText
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    flexGrow: 0,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    backgroundColor: '#1b1b36',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8, 
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  activeCategoryButton: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    borderColor: '#8b5cf6', 
  },
  categoryText: {
    color: '#ccc', 
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Categories;