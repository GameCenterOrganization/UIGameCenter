import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const GameCard = ({ game, onDetailsPress, onBuyPress }) => {
  return (
    <View style={styles.gameCard}>
      {/* Game Image */}
      <View style={styles.gameImageContainer}>
        <Image
          source={{ uri: game.image }}
          style={styles.gameImage} 
          resizeMode="cover"
        />
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          game.status === 'Lanzado' ? styles.launchedBadge : styles.featuredBadge
        ]}>
          <Text style={styles.statusText}>{game.status}</Text>
        </View>
        
        {/* Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>♡</Text>
        </TouchableOpacity>
      </View>
      
      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={1}>{game.title}</Text>
        <Text style={styles.gameDeveloper} numberOfLines={1}>{game.developer}</Text>
        <Text style={styles.gameDescription} numberOfLines={2}>
          {game.description}
        </Text>
        
        {/* Tags */}
        <View style={styles.gameTags}>
          {game.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
            </View>
          ))}
          {game.tags.length > 2 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{game.tags.length - 2}</Text>
            </View>
          )}
        </View>
        
        {/* Stats */}
        <View style={styles.gameStats}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.rating}>{game.rating}</Text>
            <Text style={styles.downloadIcon}>↓</Text>
            <Text style={styles.downloads}>{game.downloads}</Text>
          </View>
          <Text style={styles.price}>${game.price}</Text>
        </View>
        
        {/* Actions */}
        <View style={styles.gameActions}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => onDetailsPress && onDetailsPress(game)}
          >
            <Text style={styles.detailsButtonText}>👁 Detalles</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() => onBuyPress && onBuyPress(game)}
          >
            <Text style={styles.buyButtonText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameImageContainer: {
    position: 'relative',
    height: 120,
  },
  gameImage: {  
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a4e',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadge: {
    backgroundColor: '#8b5cf6',
  },
  launchedBadge: {
    backgroundColor: '#10b981',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    color: 'white',
    fontSize: 14,
  },
  gameInfo: {
    padding: 12,
  },
  gameTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameDeveloper: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  gameDescription: {
    color: '#ccc',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
    height: 32,
  },
  gameTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#3a3a4e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    color: '#ccc',
    fontSize: 10,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: '#fbbf24',
    fontSize: 14,
  },
  rating: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  downloadIcon: {
    color: '#888',
    fontSize: 12,
  },
  downloads: {
    color: '#888',
    fontSize: 12,
  },
  price: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#3a3a4e',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GameCard;
