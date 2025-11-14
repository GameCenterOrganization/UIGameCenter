import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  FlatList,
  Alert, 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Plan Gratuito',
    price: 0,
    currency: 'USD',
    billing_cycle: 'monthly',
    description: 'Perfecto para comenzar',
    badge: 'GRATIS',
    icon: 'rocket',
    color: '#6b7a84',
    recommended: false,
    
    benefits: [
      { icon: 'magnify', text: 'Búsqueda básica de juegos (10/mes)' },
      { icon: 'scale-balance', text: 'Comparación limitada de precios (3/mes)' },
      { icon: 'users', text: 'Acceso a 1 grupo comunitario' },
      { icon: 'star', text: 'Ver reviews públicas' },
      { icon: 'bookmark', text: 'Wishlist limitada (5 juegos)' },
      { icon: 'bell', text: 'Sin alertas de descuentos' },
      { icon: 'ban', text: 'Sin acceso a grupos premium' },
    ],
    
    notIncluded: [
      { text: 'Grupos de streamers' },
      { text: 'Historial de precios' },
      { text: 'Predicción IA' },
      { text: 'Estadísticas avanzadas' },
      { text: 'Soporte prioritario' },
    ]
  },

  BASIC: {
    id: 'basic',
    name: 'Plan Básico',
    price: 4.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    description: 'Para gamers activos',
    badge: 'POPULAR',
    icon: 'gamepad-variant',
    color: '#875ff5',
    recommended: true,
    
    benefits: [
      { icon: 'magnify', text: 'Búsqueda ilimitada de juegos' },
      { icon: 'scale-balance', text: 'Comparación ilimitada de precios' },
      { icon: 'history', text: 'Historial de precios (30 días)' },
      { icon: 'users', text: 'Acceso a 5 grupos de streamers' },
      { icon: 'star', text: 'Reviews ilimitadas' },
      { icon: 'bookmark', text: 'Wishlist ilimitada' },
      { icon: 'bell-outline', text: 'Alertas de descuentos personalizadas' },
      { icon: 'close-circle', text: 'Sin anuncios' },
    ],
    
    notIncluded: [
      { text: 'Acceso ilimitado a grupos' },
      { text: 'Transmisiones exclusivas' },
      { text: 'Predicción IA' },
      { text: 'Estadísticas avanzadas' },
      { text: 'Soporte prioritario' },
    ]
  },

  PREMIUM: {
    id: 'premium',
    name: 'Plan Premium',
    price: 9.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    description: 'Para gaming professionals',
    badge: 'PREMIUM',
    icon: 'crown',
    color: '#a85dfd',
    recommended: false,
    
    benefits: [
      { icon: 'magnify', text: 'Búsqueda avanzada con filtros' },
      { icon: 'scale-balance', text: 'Comparación multi-región' },
      { icon: 'history', text: 'Historial de precios (90 días)' },
      { icon: 'brain', text: 'Predicción IA de precios' },
      { icon: 'users', text: 'Acceso ilimitado a grupos de streamers' },
      { icon: 'play', text: 'Transmisiones exclusivas de streamers' },
      { icon: 'chart-line', text: 'Estadísticas de gaming avanzadas' },
      { icon: 'percent', text: 'Descuento 5% en bundles exclusivos' },
      { icon: 'trophy', text: 'Acceso a torneos privados' },
      { icon: 'close-circle', text: 'Sin anuncios' },
      { icon: 'headset', text: 'Soporte VIP 24/7' },
    ],
    
    notIncluded: []
  }
};

const SubscriptionPlansScreen = ({ userCurrentPlan = 'free' }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(userCurrentPlan);

  const isNarrow = width < 550;
  const isTablet = width >= 550 && width < 1024;
  const isDesktop = width >= 1024;

  const numColumns = useMemo(() => {
    if (isDesktop) return 3;
    if (isTablet) return 1;
    return 1;
  }, [isDesktop, isTablet]);

  const handleSelectPlan = useCallback(async (planId) => {
    if (planId === 'free') {
      setSelectedPlan(planId);
      return;
    }

    setLoading(true);
    try {
      // Simulación de pago
      setTimeout(() => {
        Alert.alert('Éxito', `Has seleccionado el plan ${planId.toUpperCase()}`, [
          { text: 'OK', onPress: () => setLoading(false) }
        ]);
      }, 1500);
    } catch (error) {
      console.error('Error selecting plan:', error);
      setLoading(false);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const plans = [
    SUBSCRIPTION_PLANS.FREE,
    SUBSCRIPTION_PLANS.BASIC,
    SUBSCRIPTION_PLANS.PREMIUM,
  ];

  const renderPlanCard = useCallback(({ item: plan }) => (
    <View style={[
      styles.planCardContainer,
      isDesktop && { flex: 1, marginHorizontal: 8 }
    ]}>
      <LinearGradient
        colors={plan.recommended 
          ? ['rgba(135, 95, 245, 0.15)', 'rgba(168, 93, 253, 0.1)']
          : ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.01)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.planCard,
          plan.recommended && styles.planCardRecommended,
        ]}
      >
        {/* Badge */}
        {plan.badge && (
          <View style={[
            styles.badgeContainer,
            { backgroundColor: plan.color }
          ]}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.planHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${plan.color}20` }]}>
            <MaterialCommunityIcons 
              name={plan.icon} 
              size={32} 
              color={plan.color} 
            />
          </View>
          
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: plan.color }]}>
              ${plan.price}
            </Text>
            <Text style={styles.billingCycle}>/mes</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Incluye:</Text>
          <View style={styles.benefitsList}>
            {plan.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name={benefit.icon}
                  size={16}
                  color={plan.color}
                  style={styles.benefitIcon}
                />
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Not Included */}
        {plan.notIncluded.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.notIncludedContainer}>
              <Text style={styles.notIncludedTitle}>No incluye:</Text>
              <View style={styles.notIncludedList}>
                {plan.notIncluded.map((item, index) => (
                  <View key={index} style={styles.notIncludedItem}>
                    <MaterialCommunityIcons
                      name="close"
                      size={14}
                      color="#6b7a84"
                      style={styles.notIncludedIcon}
                    />
                    <Text style={styles.notIncludedText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              selectedPlan === plan.id && styles.ctaButtonActive,
              plan.recommended && styles.ctaButtonRecommended,
            ]}
            onPress={() => handleSelectPlan(plan.id)}
            disabled={loading && selectedPlan === plan.id}
            activeOpacity={0.85}
          >
            {loading && selectedPlan === plan.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={[
                  styles.ctaButtonText,
                  selectedPlan === plan.id && styles.ctaButtonTextActive
                ]}>
                  {selectedPlan === plan.id ? 'PLAN ACTUAL' : 'ADQUIRIR PLAN'}
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color={selectedPlan === plan.id || plan.recommended ? '#fff' : plan.color}
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  ), [selectedPlan, loading, handleSelectPlan]);

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#0f1220', '#12131e']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Planes de Suscripción</Text>
            <Text style={styles.headerSubtext}>
              Elige el plan que mejor se adapte a ti
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['#8b5cf6', '#a78bfa', 'rgba(107, 70, 193, 0.5)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBar}
      />

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Encuentra el plan perfecto</Text>
          <Text style={styles.introText}>
            Acceso a todas las funciones que necesitas para mejorar tu experiencia gaming
          </Text>
        </View>

        {/* Plans Grid */}
        <View style={[
          styles.plansGrid,
          isDesktop && styles.plansGridDesktop,
        ]}>
          <FlatList
            data={plans}
            renderItem={renderPlanCard}
            keyExtractor={(item) => item.id}
            key={numColumns} // ← ¡AÑADE ESTO!
            numColumns={numColumns}
            scrollEnabled={false}
            columnWrapperStyle={isDesktop ? styles.columnWrapper : undefined}
            contentContainerStyle={isDesktop ? { flexGrow: 1 } : undefined}
          />
        </View>

        {/* Features Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Comparación de Características</Text>
          
          <View style={styles.comparisonTable}>
            <ComparisonRow
              feature="Búsqueda de juegos"
              free="10/mes"
              basic="Ilimitado"
              premium="Avanzado"
            />
            <ComparisonRow
              feature="Comparación de precios"
              free="3/mes"
              basic="Ilimitado"
              premium="Multi-región"
            />
            <ComparisonRow
              feature="Grupos de streamers"
              free="No"
              basic="5 grupos"
              premium="Ilimitado"
            />
            <ComparisonRow
              feature="Historial de precios"
              free="No"
              basic="30 días"
              premium="90 días"
            />
            <ComparisonRow
              feature="Predicción IA"
              free="No"
              basic="No"
              premium="Sí"
            />
            <ComparisonRow
              feature="Estadísticas avanzadas"
              free="No"
              basic="No"
              premium="Sí"
            />
            <ComparisonRow
              feature="Anuncios"
              free="Sí"
              basic="No"
              premium="No"
            />
            <ComparisonRow
              feature="Soporte"
              free="Email (72h)"
              basic="Email (24h)"
              premium="Email/Chat (2h)"
            />
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
          
          <FAQItem
            question="¿Puedo cambiar de plan en cualquier momento?"
            answer="Sí, puedes cambiar o cancelar tu suscripción en cualquier momento. Los cambios se aplicarán en el próximo ciclo de facturación."
          />
          <FAQItem
            question="¿Hay período de prueba?"
            answer="Los planes Basic y Premium incluyen 7 días de prueba gratuita. Sin necesidad de tarjeta de crédito."
          />
          <FAQItem
            question="¿Qué métodos de pago aceptan?"
            answer="Aceptamos todas las tarjetas de crédito principales, PayPal, Google Pay y Apple Pay."
          />
          <FAQItem
            question="¿Qué pasa si cancelo mi suscripción?"
            answer="Tu cuenta se convertirá automáticamente al Plan Gratuito. No perderás tus datos, solo el acceso a las características premium."
          />
        </View>

        {/* CTA Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            ¿Tienes dudas? Contacta a nuestro equipo de soporte
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Enviar mensaje de soporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Componente reutilizable para filas de comparación
const ComparisonRow = ({ feature, free, basic, premium }) => (
  <View style={styles.comparisonRow}>
    <Text style={styles.comparisonFeature}>{feature}</Text>
    <View style={styles.comparisonCell}>
      <Text style={styles.comparisonValue}>{free}</Text>
    </View>
    <View style={styles.comparisonCell}>
      <Text style={styles.comparisonValue}>{basic}</Text>
    </View>
    <View style={styles.comparisonCell}>
      <Text style={[styles.comparisonValue, { color: '#a85dfd' }]}>{premium}</Text>
    </View>
  </View>
);

// Componente reutilizable para FAQ
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false); // ← CORREGIDO

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#875ff5"
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1220',
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f3f',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(135, 95, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#875ff5',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtext: {
    fontSize: 12,
    color: '#9aa0a6',
    marginTop: 4,
  },
  gradientBar: {
    height: 4,
    width: '100%',
  },
  scrollContent: {
    padding: 20,
  },
  introSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#9aa0a6',
    textAlign: 'center',
    lineHeight: 20,
  },
  plansGrid: {
    marginBottom: 40,
  },
  plansGridDesktop: {
    flexDirection: 'row',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
  },
  planCardContainer: {
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2f3f',
    overflow: 'hidden',
  },
  planCardRecommended: {
    borderColor: '#875ff5',
    borderWidth: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  planHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    color: '#9aa0a6',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  billingCycle: {
    fontSize: 12,
    color: '#9aa0a6',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2f3f',
    marginVertical: 16,
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: '#c1c5cc',
    lineHeight: 18,
  },
  notIncludedContainer: {
    marginBottom: 12,
  },
  notIncludedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7a84',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notIncludedList: {
    gap: 10,
  },
  notIncludedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notIncludedIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  notIncludedText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7a84',
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2f3f',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  ctaButtonActive: {
    opacity: 0.6,
  },
  ctaButtonRecommended: {
    borderColor: '#875ff5',
    backgroundColor: '#875ff5',
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9aa0a6',
    letterSpacing: 0.5,
  },
  ctaButtonTextActive: {
    color: '#9aa0a6',
  },
  comparisonSection: {
    marginBottom: 40,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  comparisonTable: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2f3f',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f3f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  comparisonFeature: {
    flex: 1.5,
    fontSize: 13,
    color: '#c1c5cc',
    fontWeight: '500',
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonValue: {
    fontSize: 12,
    color: '#875ff5',
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: 40,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(135, 95, 245, 0.05)',
    borderWidth: 1,
    borderColor: '#2a2f3f',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  faqAnswer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2f3f',
    backgroundColor: 'rgba(135, 95, 245, 0.02)',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#9aa0a6',
    lineHeight: 18,
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#2a2f3f',
  },
  footerText: {
    fontSize: 14,
    color: '#9aa0a6',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#875ff5',
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SubscriptionPlansScreen;