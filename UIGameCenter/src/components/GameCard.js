import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GameCard = React.memo(({ game, cardWidth }) => {
  const navigation = useNavigation();
  const gameTags = game.tags || [];
  const isFeatured = gameTags.some(tag => ['Featured'].includes(tag));
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);
  
  const cheapestDealUrl = game.cheapest_deal_url || game.rawData?.cheapest_deal_url;
  const dealUrl = cheapestDealUrl ?? '';
  const isBuyButtonDisabled = dealUrl.trim().length === 0;


  const handleDetailsPress = () => {
    navigation.navigate('GameDetails', { gameData: game });
  };

  const handleBuyPress = () => {
    if (dealUrl && dealUrl.trim().length > 0) {
        Linking.openURL(dealUrl).catch(err => {
            console.error("Error al intentar abrir el enlace de compra:", err);
            alert('No se pudo abrir el enlace de la oferta.');
        });
    } else {
        alert('La URL de compra está ausente.');
        console.warn(`Intento de compra fallido para ${game.title}. URL era: ${dealUrl}`);
    }
  };

  // --- LÓGICA DE HOVER ---
  const handlePressIn = () => {
    setIsHovered(true);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 100,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    setIsHovered(false);
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: Platform.OS !== 'web',
      speed: 100,
      bounciness: 0,
    }).start();
  };

  const cardStyle = {
    transform: [{
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -8]
      })
    }],
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.6]
    }),
    shadowRadius: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 15]
    }),
    elevation: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [3, 10]
    }),
  };

  const displayPrice = game.cheapest_price || game.price; 

  const gamePrice =
    displayPrice === 'Free' ||
      (parseFloat(displayPrice || '0') === 0 && displayPrice !== 'N/A') 
      ?
      'N/A' 
      : `$${displayPrice}`; 

  const gameRating = (game.rating || 0).toFixed(1);
  const gameTitle = game.title || 'Untitled Game';

  const gameDeveloper = 
    (Array.isArray(game.developers) && game.developers.length > 0)
        ? game.developers[0].name 
        : game.developer || 'Developer N/A';
  

  return (
    <Animated.View
      style={[styles.gameCard, { width: cardWidth }, cardStyle]}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handlePressIn}
      onResponderRelease={handlePressOut}
      onMouseEnter={Platform.OS === 'web' ? handlePressIn : undefined}
      onMouseLeave={Platform.OS === 'web' ? handlePressOut : undefined}
    >
      {/* Light effect at the bottom*/}
      {isHovered && (
        <LinearGradient
          colors={['transparent', 'rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.6)']}
          locations={[0.5, 0.8, 1]}
          style={styles.hoverLightEffect}
        />
      )}

      {/* Game Image */}
      <View style={styles.gameImageContainer}>
        <Image
          source={{ uri: game.image || 'https://via.placeholder.com/300x180?text=No+Image' }}
          style={styles.gameImage}
          resizeMode="cover"
        />

        {/* Favorite Button*/}
        <TouchableOpacity style={styles.favoriteButton} onPress={() => {/* Lógica de favorito */ }}>
          <Text style={styles.favoriteIcon}>♡</Text>
        </TouchableOpacity>

        {/* Featured Badge */}
        {isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        )}
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={1}>{gameTitle}</Text>
        <Text style={styles.gameDeveloper} numberOfLines={1}>{gameDeveloper}</Text>

        {/*Short Description*/}
        <Text style={styles.gameDescription} numberOfLines={3}>
          {game.description ||
            'There is no description available for this game.'}
        </Text>

        {/* Tags */}
        <View style={styles.gameTags}>
          {gameTags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              {/* ✅ FIX: Los tags enriquecidos son objetos, accedemos a '.name' */}
              <Text style={styles.tagText} numberOfLines={1}>{tag.name || tag}</Text>
            </View>
          ))}
        </View>

        {/* Stats and Price*/}
        <View style={styles.gameStats}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" style={styles.starIcon} />
            <Text style={styles.rating}>{gameRating}</Text>
            {/* Download count */}
          </View>
          <Text style={styles.price}>
            {gamePrice}
          </Text>
        </View>

        {/* Actions*/}
        <View style={styles.gameActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleDetailsPress}
          >
            <View style={styles.detailsButtonContent}>
              <FontAwesome name="eye" style={styles.detailsButtonIcon} />
              <Text style={styles.detailsButtonText}>View Details</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
                styles.buyButton,
                isBuyButtonDisabled && { opacity: 0.5, borderColor: '#3a3a4e' }
            ]}
            onPress={handleBuyPress}
            disabled={isBuyButtonDisabled}
          >
            <Text style={styles.buyButtonText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: '#1a1b2c',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#3a3a4e',
    position: 'relative',
    transitionDuration: '0.2s',
  },
  hoverLightEffect: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: 12,
    zIndex: 1,
  },
  gameImageContainer: {
    position: 'relative',
    height: 180,
    zIndex: 2,
  },
  gameImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a4e',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 3,
  },
  favoriteIcon: {
    color: 'white',
    fontSize: 18,
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: 10,
    zIndex: 3,
    borderTopLeftRadius: 12,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameInfo: {
    padding: 16,
    zIndex: 2,
  },
  gameTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameDeveloper: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  gameDescription: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 60,
  },
  gameTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  tagText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  starIcon: {
    color: '#fbbf24',
    fontSize: 16,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    paddingTop: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadCount: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 10,
  },
  price: {
    color: '#8b5cf6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 2.2,
    backgroundColor: '#8b5cf6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    transitionDuration: '0.1s',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 13,
    lineHeight: 14,
    fontWeight: 'bold',
    marginVertical: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  detailsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap:0, 
  },
  detailsButtonIcon: {
    color: 'white',
    fontSize: 13, 
    marginRight: 3,
  },
  buyButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#4a4a5e',
    transitionDuration: '0.1s',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 0,
  },
});

export default GameCard;