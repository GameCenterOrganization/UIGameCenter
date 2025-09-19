import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, FlatList, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../screens/UserScreen/Auth/AuthContext';
import Header from '../components/Header';
import Categories from '../components/Categories';
import GameCard from '../components/GameCard';

const { width } = Dimensions.get('window');

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchInputRef = useRef(null);
  const debouncedSearchText = useDebounce(searchText, 300);
  const { currentUser } = useAuth();

  const fetchGames = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      let url = 'http://localhost:3000/api/games';

      if (searchTerm && searchTerm.trim() !== '') {
        url += `?search=${encodeURIComponent(searchTerm.trim())}`;
      }

      console.log('Fetching games from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Datos recibidos del backend:', data);

      const mappedGames = data.map(game => ({
        id: game.id?.toString() || Math.random().toString(),
        title: game.title || 'Título desconocido',
        developer: game.developer || 'Desarrollador Desconocido',
        description: game.description || 'Sin descripción',
        rating: parseFloat(game.rating) || 0,
        downloads: game.downloads || '0',
        price: game.price || '0.00',
        tags: Array.isArray(game.tags) ? game.tags : ['General'],
        status: game.status || 'Lanzado',
        image: (game.images && game.images.length > 0) 
          ? game.images[0]
          : 'https://via.placeholder.com/400x200/3a3a4e/ffffff?text=Game+Image',
        releaseDate: game.releaseDate || null,
      }));

      console.log('Datos mapeados para frontend:', mappedGames);
      setGames(mappedGames);

    } catch (e) {
      console.error("Error fetching games:", e);
      setError("No se pudieron cargar los juegos. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames(debouncedSearchText);
  }, [debouncedSearchText, fetchGames]);

  const filteredGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    
    return games.filter((game) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        game.tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
      return matchesCategory;
    });
  }, [games, selectedCategory]);

  console.log('Juegos a mostrar:', filteredGames.length);

  const handleGameDetails = useCallback((game) => {
    Alert.alert(
      game.title,
      `${game.description}\n\nDesarrollador: ${game.developer}\nPrecio: $${game.price}`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleGameBuy = useCallback((game) => {
    Alert.alert(
      'Comprar Juego',
      `¿Deseas comprar ${game.title} por $${game.price}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          style: 'default',
          onPress: () => Alert.alert('¡Compra exitosa!', `Has adquirido ${game.title}`),
        },
      ]
    );
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleSearchTextChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const numColumns = width < 768 ? 2 : 3;
  const cardWidth = (width - 48) / numColumns;

  const renderGameItem = useCallback(({ item }) => (
    <View style={[styles.gameCardWrapper, { width: cardWidth }]}>
      <GameCard 
        game={item} 
        onDetailsPress={handleGameDetails} 
        onBuyPress={handleGameBuy} 
      />
    </View>
  ), [cardWidth, handleGameDetails, handleGameBuy]);

  const Content = useMemo(() => (
    <>
      <Header activeTab="Búsqueda" 
        searchText={searchText} 
        onSearchChange={handleSearchTextChange} 
        onClearSearch={handleClearSearch} 
      />

      <LinearGradient
        colors={['#6b46c1', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.heroBanner}
      >
        <Text style={styles.heroText}>Tu plataforma gamer definitiva</Text>
      </LinearGradient>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <Categories 
          selectedCategory={selectedCategory} 
          onCategorySelect={handleCategorySelect} 
        />
      </View>

      <View style={styles.catalogHeader}>
        <Text style={styles.sectionTitle}>Catálogo de Juegos</Text>
        <Text style={styles.gameCount}>
          {filteredGames.length} juego{filteredGames.length !== 1 ? 's' : ''} encontrado{filteredGames.length !== 1 ? 's' : ''}
          {searchText.length > 0 && ` para "${searchText}"`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>
            {searchText.length > 0 ? `Buscando "${searchText}"...` : 'Cargando juegos...'}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchGames(debouncedSearchText)}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : filteredGames.length === 0 ? (
        <View style={styles.noGamesContainer}>
          <Text style={styles.noGamesText}>
            {searchText.length > 0 
              ? `No se encontraron juegos para "${searchText}"` 
              : 'No se encontraron juegos'
            }
          </Text>
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
              <Text style={styles.clearSearchButtonText}>Limpiar búsqueda</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        Platform.OS === 'web' ? (
          <View style={styles.webGameList}>
            {filteredGames.map((game) => (
              <View key={game.id} style={{ width: cardWidth }}>
                <GameCard 
                  game={game} 
                  onDetailsPress={handleGameDetails} 
                  onBuyPress={handleGameBuy} 
                />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredGames}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            renderItem={renderGameItem}
            columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : null}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )
      )}
    </>
  ), [
    searchText, filteredGames, loading, error, selectedCategory, debouncedSearchText,
    handleSearchTextChange, handleClearSearch, handleCategorySelect, handleGameDetails,
    handleGameBuy, renderGameItem, cardWidth
  ]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {Content}
        </ScrollView>
      ) : (
        Content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    minHeight: '100vh',
  },
  scrollContentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  heroBanner: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameCount: {
    color: '#888',
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  gameCardWrapper: {
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  noGamesContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noGamesText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  webGameList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
