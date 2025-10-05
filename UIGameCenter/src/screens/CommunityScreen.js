import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Modal, 
    Platform, 
    Dimensions,
    SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard'; 
import CreatePostModal from './CreatePostModal'; 
import COLORS from '../constants/Colors';
import Header from '../components/Header'; // ¡Importamos el Header global!

const { width } = Dimensions.get('window');

// --- Data Mockup ---
const MOCK_POSTS = [
    { id: '1', gameName: 'Valorant', gameLogo: 'V', title: '¿Cuál es el mejor agente para principiantes en 2025?', description: 'Acabo de empezar a jugar Valorant y me gustaría saber qué agente recomiendan para empezar a entender las dinámicas.', imageUrl: 'https://picsum.photos/400/200?random=1', author: 'GamerPro23', time: 'hace 2 horas', likes: 234, comments: 89, isTrending: true },
    { id: '2', gameName: 'League of Legends', gameLogo: 'L', title: 'Guía completa para subir de rango en Season 2025', description: 'Después de alcanzar Diamante, quiero compartir mis mejores consejos para escalar en solo queue. Aplica a cualquier rol.', imageUrl: 'https://picsum.photos/400/200?random=2', author: 'DiamondPlayer', time: 'hace 5 horas', likes: 567, comments: 143, isTrending: true },
    { id: '3', gameName: 'Dota 2', gameLogo: 'D', title: 'Mejor build actual para Phantom Assassin?', description: 'Desde el último parche, no estoy seguro de cuál es el mejor árbol de talentos y los items clave. Ayuda!', imageUrl: 'https://picsum.photos/400/200?random=3', author: 'MidLaneGod', time: 'hace 1 día', likes: 45, comments: 12, isTrending: false },
];

const FILTER_OPTIONS = ['Todos', 'Más Recientes', 'Más Populares', 'Más Comentados', 'Sólo Tendencias'];

const CommunityScreen = React.memo(({ navigation }) => {
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState(''); 
    const [activeTab, setActiveTab] = useState('Foros'); // Foros | Clubes
    const [modalVisible, setModalVisible] = useState(false);

    // Requisito Funcional: Filtrado por nombre de juego
    const filteredPosts = MOCK_POSTS.filter(post => {
        const matchesSearch = post.gameName.toLowerCase().includes(searchQuery.toLowerCase());
        
        let isFiltered = true;
        if (selectedFilter === 'Sólo Tendencias' && !post.isTrending) {
             isFiltered = false;
        }

        return matchesSearch && isFiltered;
    });

    const handleFilterSelect = (filter) => {
        setSelectedFilter(filter);
        setFilterVisible(false);
    };
    
    // Funciones para que el Header global controle la búsqueda en esta pantalla
    const handleSearchChange = useCallback((text) => {
        setSearchQuery(text);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const navigateToDetail = useCallback((post) => {
        navigation.navigate('PostDetail', { post });
    }, [navigation]);

    // B. Sub-Header (Controles locales: Tabs Foros/Clubes, Botón Nuevo Post y Filtros)
    const SubHeader = () => (
        <View style={styles.subHeaderContainer}>
            <View style={styles.tabsAndPostContainer}>
                {/* 1. Botón Nuevo Post */}
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.newPostButton}>
                    <Ionicons name="add" size={20} color={COLORS.white} />
                    <Text style={styles.newPostButtonText}>Nuevo Post</Text>
                </TouchableOpacity>

                {/* 2. Sub-Pestañas Foros/Clubes */}
                <View style={styles.subTabsContainer}>
                    <TouchableOpacity onPress={() => setActiveTab('Foros')}>
                        <Text style={[styles.subTabText, activeTab === 'Foros' && styles.activeSubTab]}>Foros</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('Clubes')}>
                        <Text style={[styles.subTabText, activeTab === 'Clubes' && styles.inactiveSubTab]}>Clubes</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* 3. Botón de Filtros */}
            <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterButton}>
                <Ionicons name="filter" size={20} color={COLORS.white} />
                <Text style={styles.filterButtonText}>{selectedFilter}</Text>
                <Ionicons name="caret-down-outline" size={14} color={COLORS.white} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
        </View>
    );
    
    // Filtro Desplegable (Modal)
    const FilterDropdown = () => (
        <Modal
            transparent={true}
            visible={filterVisible}
            onRequestClose={() => setFilterVisible(false)}
        >
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setFilterVisible(false)}>
                <View style={styles.filterMenu}>
                    <Text style={styles.filterTitle}>Ordenar Por</Text>
                    {FILTER_OPTIONS.map(option => (
                        <TouchableOpacity 
                            key={option} 
                            onPress={() => handleFilterSelect(option)}
                            style={[styles.filterItem, selectedFilter === option && styles.selectedFilterItem]}
                        >
                            <Text style={styles.filterItemText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                        onPress={() => handleFilterSelect('Todos')}
                        style={[styles.filterItem, styles.clearFilterButton]}
                    >
                         <Text style={styles.clearFilterText}>Limpiar Filtros</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* COMPONENTE HEADER GLOBAL */}
            <Header 
                activeTab="Comunidad" 
                searchText={searchQuery} 
                onSearchChange={handleSearchChange} 
                onClearSearch={handleClearSearch} 
            />
            
            {/* SUB-HEADER CON CONTROLES LOCALES */}
            <SubHeader />

            <FilterDropdown /> 

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* C. Sección de Posts */}
                <Text style={styles.sectionTitle}>
                    {activeTab === 'Foros' ? 
                        (searchQuery ? `Resultados para "${searchQuery}"` : `Posts en ${selectedFilter === 'Todos' ? 'Tendencia' : selectedFilter}`) 
                        : "Clubes Populares"
                    }
                </Text>
                
                {activeTab === 'Foros' && (
                    filteredPosts.length > 0 ? (
                        filteredPosts.map(post => 
                            <PostCard key={post.id} post={post} onPress={navigateToDetail} />
                        )
                    ) : (
                        <Text style={styles.noResultsText}>No se encontraron posts que coincidan con la búsqueda o filtros.</Text>
                    )
                )}
                
                {activeTab === 'Clubes' && (
                    <Text style={styles.noResultsText}>La sección de Clubes estará disponible pronto.</Text>
                )}
            </ScrollView>
            
            {/* Modal de Creación de Nuevo Post */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <CreatePostModal onClose={() => setModalVisible(false)} />
                </View>
            </Modal>
        </SafeAreaView>
    );
});

// Nota: Asegúrate de que tu archivo Header.js exporte el componente por defecto.

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darkBackground,
    },
    // Ajuste del paddingHorizontal al ScrollView para que se centre bien
    scrollContent: {
        paddingHorizontal: width < 768 ? 20 : 50,
        paddingVertical: 10,
        ...Platform.select({
            web: { maxWidth: 1000, alignSelf: 'center', width: '100%' }, 
        }),
    },
    
    // --- B. Sub-Header (Controles Locales) ---
    subHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width < 768 ? 20 : 50,
        paddingVertical: 10,
        backgroundColor: COLORS.darkerBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
        ...Platform.select({ web: { maxWidth: 1000, alignSelf: 'center', width: '100%' } })
    },
    tabsAndPostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    // Botón Nuevo Post
    newPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.purple,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 20,
    },
    newPostButtonText: {
        color: COLORS.white,
        marginLeft: 5,
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Sub-Pestañas Foros/Clubes
    subTabsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 20,
        padding: 2,
    },
    subTabText: {
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        fontWeight: 'bold',
    },
    activeSubTab: {
        color: COLORS.white,
        backgroundColor: COLORS.purple,
    },
    inactiveSubTab: {
        color: COLORS.grayText,
    },

    // Botón de Filtro
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
    },
    filterButtonText: {
        color: COLORS.white,
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    
    // C. Sección de Posts
    sectionTitle: {
        color: COLORS.grayText,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        // Los estilos de padding y web deben ir en el ScrollView para que no se dupliquen
        paddingHorizontal: width < 768 ? 20 : 50, 
        ...Platform.select({ web: { maxWidth: 1000, alignSelf: 'center', width: '100%', paddingHorizontal: 0 } }) // Aquí no aplica
    },
    noResultsText: {
        color: COLORS.grayText,
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    
    // --- Filtro Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'flex-end',
    },
    filterMenu: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 8,
        width: 200,
        marginTop: 10, // Ajustado para ser dinámico si es necesario, pero manteniendo 10px desde el botón
        marginRight: width < 768 ? 20 : 50,
        paddingVertical: 10,
        // Ajuste en web para alinearse con el borde derecho del contenedor
        ...Platform.select({ web: { marginRight: (Dimensions.get('window').width - Math.min(width, 1000)) / 2 } }),
    },
    filterTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
        marginBottom: 5,
    },
    filterItem: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    selectedFilterItem: {
        backgroundColor: COLORS.inputBackground, 
    },
    filterItemText: {
        color: COLORS.white,
        fontSize: 14,
    },
    clearFilterButton: {
        borderTopWidth: 1, 
        borderTopColor: COLORS.inputBackground, 
        marginTop: 5, 
        paddingTop: 10,
    },
    clearFilterText: {
        color: COLORS.purple, 
        fontWeight: 'bold',
    },
    
    // Modal de Creación
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CommunityScreen;
