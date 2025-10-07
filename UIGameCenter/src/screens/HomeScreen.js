import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

const API_BASE_URL = 'http://localhost:3000/api/games';

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchInputRef = useRef(null);

  const debouncedSearchText = useDebounce(searchText, 300);

  const fetchGames = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    
    try {
      let url = API_BASE_URL;
      
      if (searchTerm && searchTerm.trim() !== '') {
        url = `${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm.trim())}`;
      } else {
        url = `${API_BASE_URL}/featured?page_size=20`;
      }

      console.log('Fetching games from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Datos recibidos del backend:', result);
      
      let gamesData = [];
      if (result.success && result.results) {
        gamesData = result.results; 
      } else if (result.success && result.data) {
        gamesData = result.data;
      } else if (Array.isArray(result)) {
        gamesData = result;
      } else if (result.results) {
        gamesData = result.results; 
      }
      
      console.log('Datos de juegos extraídos:', gamesData);

      const mappedGames = gamesData.map(game => {
        console.log('Procesando juego:', game);

        let lowestPrice = '0.00';
        if (game.prices && game.prices.length > 0) {
          const validPrices = game.prices
            .map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price))
            .filter(p => !isNaN(p) && p > 0);
          
          if (validPrices.length > 0) {
            lowestPrice = Math.min(...validPrices).toFixed(2);
          }
        } else if (game.cheapest_price) {
          const price = parseFloat(game.cheapest_price);
          lowestPrice = !isNaN(price) ? price.toFixed(2) : '0.00';
        }

        let developer = 'Desarrollador Desconocido';
        if (game.developers && game.developers.length > 0) {
          developer = game.developers[0].name || 'Desarrollador Desconocido';
        }

        let description = 'Sin descripción disponible';
        if (game.description) {
          description = game.description.replace(/<[^>]*>/g, '');
          if (description.length > 150) {
            description = description.substring(0, 150) + '...';
          }
        } else if (game.description_raw) {
          description = game.description_raw;
          if (description.length > 150) {
            description = description.substring(0, 150) + '...';
          }
        }

        let tags = ['General'];
        if (game.genres && game.genres.length > 0) {
          tags = game.genres.map(g => g.name);
        } else if (game.tags && game.tags.length > 0) {
          tags = game.tags.slice(0, 3).map(t => t.name);
        }

        let rating = 0;
        if (game.rating) {
          rating = parseFloat(game.rating);
          if (rating > 5) {
            rating = (rating / 2).toFixed(1);
          }
        }

        let image = 'https://via.placeholder.com/400x200/3a3a4e/ffffff?text=Game+Image';
        if (game.background_image) {
          image = game.background_image;
        } else if (game.images && game.images.length > 0) {
          image = game.images[0];
        }

        let releaseDate = game.released || null;

        const mappedGame = {
          id: game.id?.toString() || Math.random().toString(),
          title: game.name || 'Título desconocido',
          developer: developer,
          description: description,
          rating: rating,
          price: lowestPrice,
          tags: tags,
          image: image,
          releaseDate: releaseDate,
          rawData: game
        };

        console.log('Juego mapeado:', mappedGame);
        return mappedGame;
      });
      
      console.log('Todos los juegos mapeados:', mappedGames);
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
    const detailedGame = game.rawData || game;
    
    let fullDescription = 'Sin descripción disponible';
    if (detailedGame.description) {
      fullDescription = detailedGame.description.replace(/<[^>]*>/g, '');
    } else if (detailedGame.description_raw) {
      fullDescription = detailedGame.description_raw;
    }

    let developers = 'Desarrollador Desconocido';
    if (detailedGame.developers && detailedGame.developers.length > 0) {
      developers = detailedGame.developers.map(dev => dev.name).join(', ');
    }

    Alert.alert(
      game.title,
      `${fullDescription}\n\n` +
      `Desarrollador: ${developers}\n` +
      `Precio: $${game.price}\n` +
      `Rating: ${game.rating}/5\n` +
      `Fecha de lanzamiento: ${game.releaseDate || 'Desconocida'}\n` +
      `Géneros: ${game.tags.join(', ')}`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleGameBuy = useCallback((game) => {
    Alert.alert('Comprar Juego', `¿Deseas comprar ${game.title} por $${game.price}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Comprar',
        style: 'default',
        onPress: () => Alert.alert('¡Compra exitosa!', `Has adquirido ${game.title}`),
      },
    ]);
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
      <Header activeTab="Búsqueda" />

      <LinearGradient
        colors={['#6b46c1', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.heroBanner}
      >
        <Text style={styles.heroText}>Tu plataforma gamer definitiva</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.mainSearchInput}
            placeholder="Buscar juegos, géneros, plataformas..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearchTextChange} 
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            blurOnSubmit={false} 
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => Alert.alert('Filtros', 'Filtros avanzados próximamente')}
        >
          <Text style={styles.filtersText}>🔽 Filtros</Text>
        </TouchableOpacity>
      </View>

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
    searchText, 
    filteredGames, 
    loading, 
    error, 
    selectedCategory, 
    debouncedSearchText,
    handleSearchTextChange,
    handleClearSearch,
    handleCategorySelect,
    handleGameDetails,
    handleGameBuy,
    renderGameItem,
    cardWidth
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

// Los estilos se mantienen igual...
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingRight: 8,
  },
  mainSearchInput: {
    flex: 1,
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  clearButton: {
    padding: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtersButton: {
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  filtersText: {
    color: 'white',
    fontSize: 14,
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