import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
  Modal, 
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; 

const { width, height } = Dimensions.get('window');

const HeaderBar = ({ navigation, gameName, gameData }) => (
    <View style={styles.headerBar}>
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
        >
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTitleSection}>
            <Text style={styles.headerGameTitle} numberOfLines={1}>{gameName}</Text>
            <Text style={styles.headerCategory}>
                {((gameData.genres || gameData.tags) || [])[0]?.name || ((gameData.genres || gameData.tags) || [])[0] || 'Game'}
            </Text>
        </View>

        <View style={styles.headerActionButtons}>
            <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={20} color="white" />
            </TouchableOpacity>
        </View>
    </View>
);

const ImageViewerModal = ({ visible, imageUrl, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose} 
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    
                    <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={30} color="#ccc" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: imageUrl }}
                        style={modalStyles.modalImage}
                        resizeMode="contain" 
                    />
                </View>
            </View>
        </Modal>
    );
};

const ScreenshotItem = ({ shot, onPress }) => {
    const [isHovered, setIsHovered] = useState(false);

    const containerStyle = Platform.OS === 'web' 
        ? [
            styles.screenshotContainer,
            { 
                transform: [{ translateY: isHovered ? -5 : 0 }],
                boxShadow: isHovered 
                    ? '0 0 10px rgba(139, 92, 246, 0.7), 0 5px 15px rgba(0, 0, 0, 0.5)'
                    : '0 0 0 rgba(0, 0, 0, 0)',
                transitionDuration: '0.2s',
            }
        ]
        : styles.screenshotContainer; 

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={() => onPress(shot.image)}
            onMouseEnter={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
            onMouseLeave={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: shot.image }}
                style={styles.screenshotImage}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
};

const GameDetailsScreen = ({ route, navigation }) => {
  const initialGameData = route.params.gameData; 
  const [fullGameData, setFullGameData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('Information'); 
  
  const [selectedImage, setSelectedImage] = useState(null); 

  useEffect(() => {
    const fetchFullDetails = async () => {
      const gameId = initialGameData.id; 
      const gameName = initialGameData.title || initialGameData.name; 

      if (!gameId || !gameName) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${BASE_URL}/api/games/details/${gameId}`, {
          params: { name: gameName }
        });
        setFullGameData(response.data.data);
      } catch (error) {
        console.error('Error fetching game details from backend (404 Not Found is common):', error.message);
        setFullGameData(initialGameData); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullDetails();
  }, [initialGameData]);

  const gameData = fullGameData || initialGameData; 

  const openImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const sortedDeals = gameData.prices
    ? [...gameData.prices].sort((a, b) => a.price - b.price)
    : [];

  const openStoreLink = async (url) => {
    if (url) {
      Linking.openURL(url); 
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading full details...</Text>
      </View>
    );
  }

  const gameName = gameData.name || gameData.title || 'Unknown Game';
  const gameImage = gameData.background_image || gameData.image;

  const renderLanguageList = (languages) => {
    const finalLanguages = Array.isArray(languages) ? languages : [];

    if (finalLanguages.length === 0) {
        return <Text style={styles.languageItemText}>Not specified</Text>;
    }

    const displayLanguages = finalLanguages.slice(0, 12); 

    return displayLanguages.map((lang, index) => {
        const languageName = typeof lang === 'string' ? lang : lang?.name;
        const isFullAudio = typeof lang === 'object' && lang.full_audio;
        
        const iconName = isFullAudio ? 'volume-high-outline' : 'text-outline';
        const iconColor = isFullAudio ? '#4ade80' : '#8b5cf6'; 
        
        if (!languageName) return null;

        return (
            <View key={index} style={styles.languageItem}>
                <Ionicons name={iconName} size={14} color={iconColor} style={{ marginRight: 5 }} />
                <Text style={styles.languageItemText}>
                    {languageName}
                </Text>
            </View>
        );
    }).filter(Boolean);
  };

  const PurchaseOptionsPanel = () => (
    <View style={styles.rightColumnBlock}>
      <Text style={styles.sectionTitle}>Purchase Options</Text>
      {sortedDeals.length > 0 ? (
        sortedDeals.map((deal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dealItem}
            onPress={() => openStoreLink(deal.dealUrl)}
          >
            <Text style={styles.dealPrice}>${(deal.price || 0).toFixed(2)}</Text>
            <Text style={styles.dealStore}>{deal.store || 'Unknown Store'}</Text> 
            <Ionicons
              name="open-outline"
              size={20}
              color="#8b5cf6"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noDealsText}>
          No store offers were found at this time.
        </Text>
      )}
    </View>
  );

  const GameDetailsPanel = () => {
    
    const platformList = gameData.platforms
        ? gameData.platforms
            .map(p => p.platform?.name)
            .filter(name => name)
            .join(', ')
        : 'N/A';

    return (
        <View style={[styles.rightColumnBlock, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Game Information</Text>
            
            <View style={styles.detailsGrid}> 
                <View style={styles.detailItemRight}>
                    <Text style={styles.detailLabel}>Release</Text>
                    <Text style={styles.detailValue}>{gameData.released || 'N/A'}</Text>
                </View>
                <View style={styles.detailItemRight}>
                    <Text style={styles.detailLabel}>Rating</Text>
                    <Text style={styles.detailValue}>
                        {gameData.esrb_rating?.name || 'N/A'}
                    </Text>
                </View>
                <View style={styles.detailItemRight}>
                    <Text style={styles.detailLabel}>Developer</Text>
                    <Text style={styles.detailValue}>
                        {gameData.developers?.[0]?.name || gameData.developer || 'Unknown'}
                    </Text>
                </View>
                <View style={styles.detailItemRight}>
                    <Text style={styles.detailLabel}>Publisher</Text>
                    <Text style={styles.detailValue}>
                        {gameData.publishers?.[0]?.name || 'Unknown'}
                    </Text>
                </View>
            </View>
            
            <View style={styles.platformBlock}>
                <Text style={[styles.detailLabel, { marginBottom: 5 }]}>Platforms</Text>
                <Text style={styles.platformValue}>{platformList}</Text>
            </View>

            <View style={styles.languageBlock}>
                <Text style={[styles.detailLabel, { marginBottom: 10 }]}>Languages</Text>
                <View style={styles.languageListContainer}>
                    {renderLanguageList(gameData.languages)}
                </View>
                {(gameData.languages?.length > 12) && (
                    <Text style={styles.moreLanguagesText}>+ {gameData.languages.length - 12} more...</Text>
                )}
            </View>
            
            <View style={{ flexGrow: 1 }} />
        </View>
    );
  };

  const InformationContent = () => (
    <ScrollView 
        style={styles.tabContentScroll} 
        contentContainerStyle={styles.tabContentScrollContainer}
    >
        <Text style={styles.descriptionText}>
          {(gameData.description || gameData.rawData?.description || 'No detailed description available.').replace(/<[^>]+>/g, '').trim()}
        </Text>
  
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>Tags/Genres</Text>
          <Text style={styles.detailValue}>
              {((gameData.genres || gameData.tags) || []).map((g) => {
                  return typeof g === 'string' ? g : g.name; 
              }).join(', ') || 'N/A'}
          </Text>
        </View>
    </ScrollView>
  );

  const RequirementsContent = () => {
  const requirements = gameData.system_requirements;

  if (!requirements || Object.keys(requirements).length === 0) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.noRequirementsContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#6b7280" />
          <Text style={styles.noRequirementsText}>
            No system requirements available
          </Text>
        </View>
      </View>
    );
  }

  const platforms = Object.keys(requirements);
  
  const platformIcons = {
    pc: 'desktop-outline',
    mac: 'logo-apple',
    linux: 'logo-tux'
  };

  return (
    <ScrollView 
      style={styles.tabContentScroll} 
      contentContainerStyle={styles.tabContentScrollContainer}
    >
      {platforms.map(platform => {
        const reqs = requirements[platform];
        const iconName = platformIcons[platform] || 'desktop-outline';

        const hasMinimum = reqs.minimum && Object.keys(reqs.minimum).some(key => reqs.minimum[key]);
        const hasRecommended = reqs.recommended && Object.keys(reqs.recommended).some(key => reqs.recommended[key]);
        
        if (!hasMinimum && !hasRecommended) {
          return null;
        }
        
        return (
          <View key={platform} style={styles.platformRequirementsSection}>
            {/* Platform Title */}
            <View style={styles.platformTitleContainer}>
              <Ionicons name={iconName} size={24} color="#8b5cf6" />
              <Text style={styles.platformTitle}>{platform.toUpperCase()}</Text>
            </View>
            
            <View style={styles.requirementsCardsContainer}>
              {/* MINIMUM REQUIREMENTS CARD */}
              {hasMinimum && (
                <View style={styles.requirementCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="laptop-outline" size={24} color="#e2e8f0" />
                    <Text style={styles.cardTitle}>Minimum Requirements</Text>
                  </View>
                  
                  <View style={styles.requirementsList}>
                    {reqs.minimum.os && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>OS:</Text>
                        <Text style={styles.requirementValue}>{reqs.minimum.os}</Text>
                      </View>
                    )}
                    
                    {reqs.minimum.processor && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Processor:</Text>
                        <Text style={styles.requirementValue}>{reqs.minimum.processor}</Text>
                      </View>
                    )}
                    
                    {reqs.minimum.memory && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Memory:</Text>
                        <Text style={styles.requirementValue}>{reqs.minimum.memory}</Text>
                      </View>
                    )}
                    
                    {reqs.minimum.graphics && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Graphics:</Text>
                        <Text style={styles.requirementValue}>{reqs.minimum.graphics}</Text>
                      </View>
                    )}
                    
                    {reqs.minimum.storage && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Storage:</Text>
                        <Text style={styles.requirementValue}>{reqs.minimum.storage}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {/* RECOMMENDED REQUIREMENTS CARD */}
              {hasRecommended && (
                <View style={styles.requirementCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="game-controller-outline" size={24} color="#e2e8f0" />
                    <Text style={styles.cardTitle}>Recommended Requirements</Text>
                  </View>
                  
                  <View style={styles.requirementsList}>
                    {reqs.recommended.os && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>OS:</Text>
                        <Text style={styles.requirementValue}>{reqs.recommended.os}</Text>
                      </View>
                    )}
                    
                    {reqs.recommended.processor && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Processor:</Text>
                        <Text style={styles.requirementValue}>{reqs.recommended.processor}</Text>
                      </View>
                    )}
                    
                    {reqs.recommended.memory && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Memory:</Text>
                        <Text style={styles.requirementValue}>{reqs.recommended.memory}</Text>
                      </View>
                    )}
                    
                    {reqs.recommended.graphics && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Graphics:</Text>
                        <Text style={styles.requirementValue}>{reqs.recommended.graphics}</Text>
                      </View>
                    )}
                    
                    {reqs.recommended.storage && (
                      <View style={styles.requirementRow}>
                        <Text style={styles.requirementLabel}>Storage:</Text>
                        <Text style={styles.requirementValue}>{reqs.recommended.storage}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};


  const TabContentWrapper = () => {
    if (activeTab === 'Information') {
        return <InformationContent />;
    }
    if (activeTab === 'Requirements') {
        return <RequirementsContent />;
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <HeaderBar navigation={navigation} gameName={gameName} gameData={gameData} />
      
      <View style={styles.webContainer}>
        
        {/*LEFT COLUMN (Main: Image, Gallery, Tabs)*/}
        <View style={styles.leftColumn}>
          
          <View style={styles.mainImageBlock}>
            {gameImage && (
              <Image
                source={{ uri: gameImage }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.imageOverlayInfo}>
                <FontAwesome name="star" style={styles.starIconOverlay} />
                <Text style={styles.ratingTextOverlay}>{(gameData.rating || 0).toFixed(1)}</Text>
                <FontAwesome name="calendar" style={styles.calendarIconOverlay} />
                <Text style={styles.yearTextOverlay}>{gameData.released ? gameData.released.substring(0, 4) : 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.galleryBlock}>
            <Text style={styles.sectionTitle}>Screenshots</Text>
            <View style={styles.galleryWrapper}>
              {(gameData.screenshots || []).slice(0, 6).map((shot, index) => (
                <ScreenshotItem
                  key={index}
                  shot={shot}
                  onPress={openImage} 
                />
              ))}
            </View>
          </View>
          
          <View style={styles.tabsBlock}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'Information' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('Information')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Information' && styles.activeTabText,
                  ]}
                >
                  Information
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'Requirements' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('Requirements')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Requirements' && styles.activeTabText,
                  ]}
                >
                  Requirements
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabContentWrapper}>
                <TabContentWrapper />
            </View>
          </View>

        </View>
        
        {/*RIGHT COLUMN (Side: Purchase Options and Details)*/}
        <View style={styles.rightColumn}>
          <PurchaseOptionsPanel />
          <GameDetailsPanel /> 
        </View>
        
      </View>
      
      {/*IMAGE VIEWER*/}
      <ImageViewerModal
        visible={!!selectedImage}
        imageUrl={selectedImage}
        onClose={closeImage}
      />
      
    </ScrollView>
  );
};

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)', 
    },
    modalView: {
        width: '90%',
        maxWidth: 1000, 
        height: '90%',
        maxHeight: 700,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? -15 : 20, 
        right: Platform.OS === 'web' ? -15 : 20,
        zIndex: 10,
        padding: 5,
        borderRadius: 50,
        backgroundColor: 'rgba(28, 28, 44, 0.7)', 
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
});
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111118',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    loadingText: {
        color: '#8b5cf6',
        marginTop: 10,
        fontSize: 16,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#111118',
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3E',
        paddingTop: Platform.OS === 'web' ? 15 : 40,
    },
    backButton: {
        padding: 5,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitleSection: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 15,
    },
    headerGameTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    headerCategory: {
        fontSize: 12,
        color: '#8b5cf6',
        fontWeight: '600',
        marginTop: 2,
    },
    headerActionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#1C1C2C',
        borderRadius: 50,
    },
    webContainer: Platform.select({
        web: {
            flexDirection: 'row',
            padding: 20,
            maxWidth: 1200,
            alignSelf: 'center',
            alignItems: 'flex-start',
        },
        default: {
            flexDirection: 'column',
            padding: 0,
        },
    }),
    leftColumn: Platform.select({
        web: {
            flex: 3,
            marginRight: 20,
        },
        default: {
            flex: 1,
        },
    }),
    rightColumn: Platform.select({
        web: {
            flex: 2,
        },
        default: {
            flex: 1,
            paddingHorizontal: 20,
            marginBottom: 20,
        },
    }),
    mainImageBlock: {
        backgroundColor: '#1C1C2C',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A3E',
        marginBottom: 20,
        overflow: 'hidden',
        marginHorizontal: Platform.OS === 'web' ? 0 : 20,
        position: 'relative',
    },
    galleryBlock: {
        backgroundColor: '#1C1C2C',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A3E',
        padding: 20,
        marginBottom: 20,
        marginHorizontal: Platform.OS === 'web' ? 0 : 20,
    },
    tabsBlock: {
        backgroundColor: '#1C1C2C',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A3E',
        marginHorizontal: Platform.OS === 'web' ? 0 : 20,
        overflow: 'hidden',
        minHeight: 250,
    },
    rightColumnBlock: {
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A3E',
        padding: 20,
    },
    mainImage: {
        width: '100%',
        height: Platform.OS === 'web' ? width * 0.35 : width * 0.6,
        minHeight: 250,
    },
    imageOverlayInfo: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    starIconOverlay: {
        color: '#fbbf24',
        fontSize: 16,
        ...Platform.select({
            web: {
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.7)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
            },
        }),
    },
    ratingTextOverlay: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        ...Platform.select({
            web: {
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.7)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
            },
        }),
    },
    calendarIconOverlay: {
        color: '#ccc',
        fontSize: 16,
        marginLeft: 10,
        ...Platform.select({
            web: {
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.7)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
            },
        }),
    },
    yearTextOverlay: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        ...Platform.select({
            web: {
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.7)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
            },
        }),
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#1C1C2C',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3E',
    },
    tabContentWrapper: {
        flex: 1,
    },
    tabContentScroll: {
        flex: 1,
        padding: 0,
    },
    tabContentScrollContainer: {
        padding: 20,
        paddingBottom: 30,
    },
    tabContent: {
        padding: 20,
        flexGrow: 1,
    },
    tabButton: {
        paddingVertical: 12,
        marginRight: 20,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#8b5cf6',
    },
    tabText: {
        color: '#aaa',
        fontSize: 16,
        fontWeight: '600',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
    },
    descriptionText: {
        color: '#ccc',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    tagsContainer: {
        backgroundColor: '#2A2A3E',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailItemRight: {
        width: '48%',
        marginBottom: 10,
        backgroundColor: '#1C1C2C',
        padding: 10,
        borderRadius: 8,
    },
    detailLabel: {
        color: '#aaa',
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    detailValue: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    platformBlock: {
        backgroundColor: '#1C1C2C',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
    },
    platformValue: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    languageBlock: {
        backgroundColor: '#1C1C2C',
        padding: 10,
        borderRadius: 8,
    },
    languageListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A3E',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    languageItemText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    moreLanguagesText: {
        color: '#8b5cf6',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    galleryWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    screenshotContainer: {
        width: Platform.select({
            web: '32%',
            default: '48%',
        }),
        aspectRatio: 16 / 9,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#3a3a4e',
        marginBottom: 10,
        zIndex: 1,
    },
    screenshotImage: {
        width: '100%',
        height: '100%',
    },
    dealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C2C',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
    },
    dealPrice: {
        color: '#8b5cf6',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 15,
        minWidth: 80,
    },
    dealStore: {
        color: 'white',
        fontSize: 16,
    },
    noDealsText: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 10,
    },
    requirementsSimpleContainer: {
        gap: 25,
    },
    requirementsSection: {
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#3A3A4E',
    },
    requirementsSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        textAlign: 'center',
    },
    requirementSimpleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingVertical: 8,
    },
    requirementSimpleText: {
        flex: 1,
        marginLeft: 12,
    },
    requirementSimpleLabel: {
        color: '#8b5cf6',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    requirementSimpleValue: {
        color: 'white',
        fontSize: 15,
        lineHeight: 20,
        flexShrink: 1,
    },
    noRequirementsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    noRequirementsText: {
        color: '#9ca3af',
        fontSize: 16,
        marginTop: 15,
        textAlign: 'center',
    },
    platformRequirementsSection: {
        marginBottom: 30,
    },
    platformTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#8b5cf6',
    },
    platformTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8b5cf6',
        marginLeft: 10,
    },
    requirementsCardsContainer: {
        width: '100%',
        flexDirection: 'row', 
        justifyContent: 'space-between',
        gap: 20, 
        flexWrap: 'nowrap',
    },
    requirementCard: {
        backgroundColor: '#2A2A3E', 
        borderRadius: 12,
        padding: 20,
        width: '49%', 
        borderWidth: 1,
        borderColor: '#3A3A4E', 
        shadowOpacity: 0,
        elevation: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15, 
        paddingBottom: 0,
        borderBottomWidth: 0, 
        borderBottomColor: 'transparent',
    },
    cardTitle: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10,
        flex: 1,
    },
    requirementsList: {
        gap: 0, 
    },
    requirementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12, 
        paddingHorizontal: 0, 
        borderRadius: 0,
        backgroundColor: 'transparent', 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255, 255, 255, 0.05)', 
    },
    requirementLabel: {
        fontSize: 15,
        color: '#9ca3af', 
        textTransform: 'none',
        fontWeight: 'normal',
        marginRight: 15,
        width: '30%', 
    },
    requirementValue: { 
        fontSize: 15,
        color: 'white', 
        lineHeight: 20,
        fontWeight: '600', 
        textAlign: 'right', 
        flex: 1, 
    },
    requirementLabelCard: {
        fontSize: 11,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    requirementValueCard: {
        fontSize: 14,
        color: '#e2e8f0',
        lineHeight: 20,
        fontWeight: '500',
        flex: 1,
    },
});

export default GameDetailsScreen;