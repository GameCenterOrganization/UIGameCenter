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
const MAX_CONTENT_WIDTH = 1200; 
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const searchInputRef = useRef(null);
  const debouncedSearchText = useDebounce(searchText, 300);
  const fetchGamesWithDetails = useCallback(async (basicGames, signal) => { 
    setLoadingDetails(true);
    try {
      const detailsPromises = basicGames.slice(0, 10).map(async (game) => {
        if (signal && signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        try {
          const url = `${API_BASE_URL}/details/${game.id}?name=${encodeURIComponent(game.name)}`;
          const response = await fetch(url, { signal }); 
          if (!response.ok) return game;
          const result = await response.json();
          return result.success && result.data ? result.data : game;
        } catch (error) {
          if (error.name === 'AbortError') throw error; 
          console.error(`Error loading details for ${game.name}:`, error);
          return game;
        }
      });
      const detailedGames = await Promise.all(detailsPromises);
      const remainingGames = basicGames.slice(10);
      return [...detailedGames, ...remainingGames];
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Details fetch aborted.');
        throw error; 
      }
      console.error('Error fetching game details:', error);
      return basicGames;
    } finally {
      if (!(signal && signal.aborted)) { 
        setLoadingDetails(false);
      }
    }
  }, []);
  const mapGameData = useCallback((game) => {
    // Mapping logic...
    let lowestPrice = 'Free';
    if (game.prices && Array.isArray(game.prices) && game.prices.length > 0) {
        const validPrices = game.prices
            .map(p => {
              if (typeof p === 'object' && p.price !== undefined) {
                  return typeof p.price === 'number' ? p.price : parseFloat(p.price);
              }
              return typeof p === 'number' ? p : parseFloat(p);
            })
            .filter(p => !isNaN(p) && p > 0);
        if (validPrices.length > 0) {
            lowestPrice = Math.min(...validPrices).toFixed(2);
        }
    } else if (game.cheapest_price !== undefined && game.cheapest_price !== null) {
        const price = typeof game.cheapest_price === 'string' 
            ? parseFloat(game.cheapest_price) 
            : game.cheapest_price;
        if (!isNaN(price) && price > 0) {
            lowestPrice = price.toFixed(2);
        }
    }
    let developer = 'Unknown Developer';
    if (game.developers) {
        if (Array.isArray(game.developers) && game.developers.length > 0) {
            if (typeof game.developers[0] === 'object' && game.developers[0].name) {
                developer = game.developers[0].name;
            } 
            else if (typeof game.developers[0] === 'string') {
                developer = game.developers[0];
            }
        } 
        else if (typeof game.developers === 'string') {
            developer = game.developers;
        }
    }
    let description = 'No description available';
    if (game.description_raw && game.description_raw.trim() !== '') {
        description = game.description_raw.trim();
    } 
    else if (game.description && game.description.trim() !== '') {
        description = game.description.replace(/<[^>]*>/g, '').trim();
    }
    if (description.length > 150) {
        description = description.substring(0, 150) + '...';
    }
    let tags = ['General'];
    if (game.genres && Array.isArray(game.genres) && game.genres.length > 0) {
        tags = game.genres.map(g => 
            typeof g === 'object' ? (g.name || g) : g
        );
    } else if (game.tags && Array.isArray(game.tags) && game.tags.length > 0) {
        tags = game.tags.slice(0, 3).map(t => 
            typeof t === 'object' ? (t.name || t) : t
        );
    }
    let rating = 0;
    if (game.rating !== undefined && game.rating !== null) {
        rating = parseFloat(game.rating);
        if (!isNaN(rating)) {
            if (rating > 5) {
                rating = parseFloat((rating / 2).toFixed(1));
            } else {
                rating = parseFloat(rating.toFixed(1));
            }
        } else {
            rating = 0;
        }
    }
    let image = 'https://via.placeholder.com/400x200/3a3a4e/ffffff?text=Game+Image';
    if (game.background_image && game.background_image.trim() !== '') {
        image = game.background_image;
    } else if (game.screenshots && Array.isArray(game.screenshots) && game.screenshots.length > 0) {
        image = game.screenshots[0].image || game.screenshots[0];
    }
    const mappedGame = {
      id: game.id?.toString() || Math.random().toString(),
      title: game.name || 'Unknown Title',
      developer: developer,
      description: description,
      rating: rating,
      price: lowestPrice,
      tags: tags,
      image: image,
      releaseDate: game.released || 'Unknown Date',
      rawData: game
    };
    return mappedGame;
  }, []);
  const fetchGames = useCallback(async (searchTerm = '', signal) => { 
    if (!searchTerm || searchTerm.trim() === '') {
      setGames([]);
      setLoading(false);
      return;
    }
    if (signal && signal.aborted) return; 
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm.trim())}`;
      const response = await fetch(url, { signal }); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      let basicGames = [];
      if (result.success && result.results) {
        basicGames = result.results;
      } else if (Array.isArray(result)) {
        basicGames = result;
      }
      if (basicGames.length === 0) {
        setGames([]);
        return;
      }
      const gamesWithDetails = await fetchGamesWithDetails(basicGames, signal); 
      const mappedGames = gamesWithDetails.map(game => mapGameData(game));
      setGames(mappedGames);
      setRenderTrigger(prev => prev + 1);
    } catch (e) {
      if (e.name === 'AbortError') { 
        console.log('Fetch operation aborted successfully.');
        return;
      }
      console.error("Error fetching games:", e);
      setError("Could not load games. Please try again later.");
    } finally {
      if (!(signal && signal.aborted)) { 
        setLoading(false);
      }
    }
  }, [fetchGamesWithDetails, mapGameData]);
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetchGames(debouncedSearchText, signal); 
    return () => {
      controller.abort();
    };
  }, [debouncedSearchText, fetchGames]);
  const filteredGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    return games.filter((game) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        game.tags.some((tag) =>
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      return matchesCategory;
    });
  }, [games, selectedCategory]);
  const handleGameDetails = useCallback(async (game) => {
    const detailedGame = game.rawData || game;
    let fullDescription = 'No description available';
    if (detailedGame.description) {
      fullDescription = detailedGame.description.replace(/<[^>]*>/g, '');
    } else if (detailedGame.description_raw) {
      fullDescription = detailedGame.description_raw;
    }
    let developers = 'Unknown Developer';
    if (detailedGame.developers && detailedGame.developers.length > 0) {
      developers = detailedGame.developers
        .map(dev => (typeof dev === 'object' ? dev.name : dev))
        .join(', ');
    }
    let publishers = '';
    if (detailedGame.publishers && detailedGame.publishers.length > 0) {
      publishers = '\nPublisher: ' + detailedGame.publishers
        .map(pub => (typeof pub === 'object' ? pub.name : pub))
        .join(', ');
    }
    Alert.alert(
      game.title,
      `${fullDescription}\n\n` +
      `Developer: ${developers}${publishers}\n` +
      `Price: $${game.price}\n` +
      `Rating: ${game.rating}/5\n` +
      `Release Date: ${game.releaseDate || 'Unknown'}\n` +
      `Genres: ${game.tags.join(', ')}`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);
  const handleGameBuy = useCallback((game) => {
    Alert.alert(
      'Buy Game',
      `Do you want to buy ${game.title} for $${game.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          style: 'default',
          onPress: () => Alert.alert('Purchase successful!', `You have purchased ${game.title}`),
        },
      ]
    );
  }, []);
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setGames([]);
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
  const cardSpacing = 16; 
  const containerPadding = 32; 
  const cardWidth = useMemo(() => {
        const effectiveWidth = width > MAX_CONTENT_WIDTH ? MAX_CONTENT_WIDTH : width; 
        return (effectiveWidth - (containerPadding * 2) - (cardSpacing * (numColumns - 1))) / numColumns; 
  }, [width, numColumns]);
  const renderGameItem = useCallback(
    ({ item }) => (
      <View style={[styles.gameCardWrapper, { width: cardWidth }]}>
        <GameCard
          game={item}
          onDetailsPress={handleGameDetails}
          onBuyPress={handleGameBuy}
          cardWidth={cardWidth} 
        />
      </View>
    ),
    [cardWidth, handleGameDetails, handleGameBuy]
  );
  const Content = useMemo(
    () => (
      <>
        <Header activeTab="Search" />
        <LinearGradient
            colors={['#8b5cf6', '#a78bfa', 'rgba(107, 70, 193, 0.5)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fullWidthGradientBar}
        />
        <View style={styles.mainContentWrapper}>
            <View style={styles.heroBanner}> 
                <Text style={styles.heroText}></Text> 
            </View>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}></Text>
                <TextInput
                  ref={searchInputRef}
                  style={styles.mainSearchInput}
                  placeholder="Search games, genres, platforms..."
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
                onPress={() => Alert.alert('Filters', 'Advanced filters coming soon')}
              >
                <Text style={styles.filtersText}>Advanced Filters</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Popular Categories</Text>
              <Categories
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </View>
            <View style={styles.catalogHeader}>
              <Text style={styles.sectionTitle}>Game Catalog</Text>
              <Text style={styles.gameCount}>
                {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            {/* Game loading and display logic */}
            {loadingDetails && (
              <View style={styles.detailsLoadingBanner}>
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text style={styles.detailsLoadingText}>
                  Loading detailed information...
                </Text>
              </View>
            )}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>
                  {searchText.length > 0 ? `Searching for "${searchText}"...` : 'Loading games...'}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchGames(debouncedSearchText)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : searchText.length === 0 ? (
              <View style={styles.noGamesContainer}>
                <Text style={styles.noGamesText}>
                  Type something in the search bar to find games
                </Text>
              </View>
            ) : filteredGames.length === 0 ? (
              <View style={styles.noGamesContainer}>
                <Text style={styles.noGamesText}>
                  No games found for "{searchText}"
                </Text>
                <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredGames}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                renderItem={renderGameItem}
                columnWrapperStyle={Platform.OS === 'web' ? styles.webColumnWrapper : styles.columnWrapper}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews={false}
                maxToRenderPerBatch={15}
                windowSize={21}
                extraData={renderTrigger}
              />
            )}
        </View>
      </>
    ),
    [
      searchText,
      filteredGames,
      loading,
      loadingDetails,
      error,
      selectedCategory,
      debouncedSearchText,
      handleSearchTextChange,
      handleClearSearch,
      handleCategorySelect,
      handleGameDetails,
      handleGameBuy,
      renderGameItem,
      cardWidth,
      numColumns, 
    ]
  );
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {Content}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11121c', 
  },
  scrollContentContainer: {
    flexGrow: 1, 
    paddingBottom: 20, 
  },
  fullWidthGradientBar: {
      height: 4,
      width: '100%',
  },
  mainContentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 32, 
    paddingTop: 10, 
  },
  heroBanner: { 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, 
    marginTop: 10,
  },
  heroText: {
    color: 'white',
    fontSize: 20, 
    fontWeight: 'normal',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, 
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1b2c',
    borderRadius: 10,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: '#3a3a4e',
    height: 50, 
  },
  searchIcon: {
      color: '#888',
      fontSize: 16,
      paddingLeft: 16,
  },
  mainSearchInput: {
    flex: 1,
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtersButton: {
    backgroundColor: '#1a1b2c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a4e',
    height: 50,
    justifyContent: 'center',
  },
  filtersText: {
    color: 'white',
    fontSize: 14,
  },
  categoriesSection: {
    marginBottom: 10, 
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, 
    marginTop: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  gameCount: {
    color: '#888',
    fontSize: 16,
    textAlign: 'right',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 0, 
  },
  webColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 0,
    gap: 16, 
  },
  flatListContent: {
  },
  gameCardWrapper: {
    marginBottom: 12, 
  },
  detailsLoadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1b36',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  detailsLoadingText: {
    color: '#8b5cf6',
    fontSize: 14,
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
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff4d4d',
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