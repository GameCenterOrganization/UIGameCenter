import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import CreatePostModal from './CreatePostModal';
import COLORS from '../constants/Colors';
import Header from '../components/Header';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');
const FILTER_OPTIONS = ['Todos', 'Más Recientes', 'Más Populares', 'Más Comentados', 'Sólo Tendencias'];
const API_URL = "http://localhost:8080/api/post";

const CommunityScreen = React.memo(({ navigation }) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Foros');
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = getAuth().currentUser;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleDeletePost = async (postId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No se encontró usuario autenticado.");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/delete/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error del servidor:", data);
        Alert.alert("Error", data.message || "Error al eliminar el post");
        return;
      }

      Alert.alert("Éxito", "Post eliminado correctamente");
      setPosts((prevPosts) => prevPosts.filter((post) => post.ID_POST !== postId));
    } catch (error) {
      console.error("Error al intentar eliminar el post:", error);
      Alert.alert("Error", "Ocurrió un error al eliminar el post.");
    }
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
  };

  const filteredPosts = posts.filter(post => {
    const gameName = post.GAME_TITLE_DSC || "";
    const matchesSearch = gameName.toLowerCase().includes(searchQuery.toLowerCase());
    let isFiltered = true;
    if (selectedFilter === 'Sólo Tendencias' && !post.isTrending) isFiltered = false;
    return matchesSearch && isFiltered;
  });

  const navigateToDetail = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        activeTab="Comunidad"
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      <View style={styles.subHeaderContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.leftGroup}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.newPostButton}>
            <Ionicons name="add" size={18} color={COLORS.white} />
            <Text style={styles.newPostButtonText}>Nuevo Post</Text>
          </TouchableOpacity>

          <View style={styles.subTabsContainer}>
            <TouchableOpacity onPress={() => setActiveTab('Foros')} style={[styles.subTab, activeTab === 'Foros' && styles.activeSubTab]}>
              <Text style={[styles.subTabText, activeTab === 'Foros' && styles.activeSubTabText]}>Foros</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Clubes')} style={[styles.subTab, activeTab === 'Clubes' && styles.activeSubTab]}>
              <Text style={[styles.subTabText, activeTab === 'Clubes' && styles.activeSubTabText]}>Clubes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={18} color={COLORS.white} />
          <Text style={styles.filterButtonText}>{selectedFilter}</Text>
          <Ionicons name="caret-down-outline" size={14} color={COLORS.white} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Modal de filtros */}
      <Modal transparent visible={filterVisible} animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterVisible(false)}>
          <View style={styles.filterMenu}>
            <Text style={styles.filterTitle}>Ordenar Por</Text>
            {FILTER_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => handleFilterSelect(option)}
                style={[styles.filterItem, selectedFilter === option && styles.selectedFilterItem]}>
                <Text style={styles.filterItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => handleFilterSelect('Todos')} style={[styles.filterItem, styles.clearFilterButton]}>
              <Text style={styles.clearFilterText}>Limpiar Filtros</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.sectionTitle}>
            {activeTab === 'Foros'
              ? searchQuery
                ? `Resultados para "${searchQuery}"`
                : `Posts ${selectedFilter === 'Todos' ? '' : `- ${selectedFilter}`}`
              : 'Clubes Populares'}
          </Text>

          {filteredPosts.length === 0 ? (
            <Text style={styles.noResultsText}>No se encontraron posts que coincidan.</Text>
          ) : (
            filteredPosts.map(post => (
              <PostCard
                key={post.ID_POST}
                post={post}
                onPress={() => navigateToDetail(post.ID_POST)}
                currentUser={currentUser}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Modal para crear post */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <CreatePostModal onClose={() => setModalVisible(false)} onPostCreated={fetchPosts} />
        </View>
      </Modal>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBackground },

  subHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.darkerBackground,
  },

  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  newPostButtonText: { color: COLORS.white, fontWeight: '700', marginLeft: 6, fontSize: 14 },

  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    padding: 3,
  },
  subTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  subTabText: { color: COLORS.grayText, fontWeight: '700', fontSize: 13 },
  activeSubTab: { backgroundColor: COLORS.purple },
  activeSubTabText: { color: COLORS.white },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: { color: COLORS.white, marginLeft: 6, fontWeight: '600', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  filterMenu: {
    width: 200,
    backgroundColor: COLORS.darkerBackground,
    marginTop: 70,
    marginRight: 16,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 10,
  },
  filterTitle: { color: COLORS.white, fontWeight: '700', paddingHorizontal: 14, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: COLORS.inputBackground },
  filterItem: { paddingVertical: 8, paddingHorizontal: 14 },
  filterItemText: { color: COLORS.white, fontSize: 13 },
  selectedFilterItem: { backgroundColor: COLORS.inputBackground },
  clearFilterButton: { borderTopWidth: 1, borderTopColor: COLORS.inputBackground, marginTop: 6 },
  clearFilterText: { color: COLORS.purple, fontWeight: '700', paddingHorizontal: 14, paddingVertical: 10, textAlign: 'center' },

  scrollContent: { paddingHorizontal: 14, paddingVertical: 10, paddingBottom: 100 },
  sectionTitle: { color: COLORS.grayText, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  noResultsText: { color: COLORS.grayText, fontSize: 15, textAlign: 'center', marginTop: 40 },

  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default CommunityScreen;
