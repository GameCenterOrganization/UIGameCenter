import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const LoginStyles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollWide: {
    flexDirection: "row",
    paddingHorizontal: 32,
  },
  scrollNarrow: {
    flexDirection: "column",
    paddingHorizontal: 8,
  },
  leftPane: {
    flex: 1,
    marginRight: 24,
    maxWidth: 640,
    paddingVertical: 16,
  },
  logoRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 8 
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#ff6fe0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  brandText: { 
    fontSize: 28, 
    color: "#d9b0ff", 
    fontWeight: "700" 
  },
  headline: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 12,
    maxWidth: 520,
  },
  subText: {
    color: "#9aa0a6",
    lineHeight: 20,
    maxWidth: 520,
    marginBottom: 18,
  },
  previewImageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    width: 520,
    height: 220,
    marginBottom: 22,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  statsRow: { 
    flexDirection: "row", 
    marginTop: 8 
  },
  stat: { 
    marginRight: 28 
  },
  statNumber: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "800" 
  },
  statLabel: { 
    color: "#9aa0a6", 
    fontSize: 12 
  },
  cardWrapper: {
    width: 420,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 14,
    padding: 18,
    backgroundColor: "rgba(20,22,28,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 14,
  },
  brandSmall: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(255,95,185,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: { 
    fontSize: 20, 
    color: "#fff", 
    fontWeight: "700" 
  },
  cardSubtitle: { 
    color: "#8d98a0", 
    fontSize: 12, 
    marginTop: 6 
  },
  form: { 
    marginTop: 4 
  },
  inputLabel: { 
    color: "#9aa0a6", 
    fontSize: 13, 
    marginBottom: 6 
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  input: {
    flex: 1,
    color: "#dbe6ee",
    fontSize: 14,
  },
  inputError: {
    borderColor: "rgba(255,80,90,0.18)",
  },
  errorText: {
    color: "#ff7a7a",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 6,
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  loginGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loginContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    marginRight: 8,
  },
  dividerRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  dividerText: {
    color: "#73808a",
    fontSize: 12,
    marginHorizontal: 10,
  },
  socialRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.02)",
  },
  socialText: { 
    marginLeft: 8, 
    color: "#eef2f6", 
    opacity: 0.9 
  },
  linksRow: {
    marginTop: 16,
    alignItems: "center",
  },
  linkPrimary: {
    color: "#bcb3ff",
    fontSize: 13,
    marginBottom: 8,
  },
  linkSecondary: {
    color: "#b6a1e8",
    fontSize: 13,
    marginTop: 6,
    textDecorationLine: "underline",
  },
}); 