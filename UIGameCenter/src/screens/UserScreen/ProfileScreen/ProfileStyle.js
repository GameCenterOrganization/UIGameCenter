// src/screens/UserScreen/ProfileScreen/ProfileStyle.js
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    minHeight: "100%",
  },
  inner: {
    width: "100%",
    maxWidth: 980,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#9aa0a6", marginTop: 6, marginBottom: 20, textAlign: "center" },

  card: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  cardNarrow: { marginHorizontal: 0 },
  cardWide: { marginHorizontal: 0 },
  cardHeader: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },

  row: { flexDirection: "row", alignItems: "center" },
  avatarColumn: { width: 110, alignItems: "center", justifyContent: "center" },
  infoColumn: { flex: 1, paddingLeft: 14 },
  avatarWrap: { position: "relative" },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: "rgba(255,255,255,0.04)" },
  avatarPlaceholder: { backgroundColor: "rgba(255,255,255,0.02)", alignItems: "center", justifyContent: "center" },
  cameraBtn: {
    position: "absolute",
    right: -8,
    bottom: -8,
    backgroundColor: "#4a2dbb",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0b0d12",
  },
  nameText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  usernameText: { color: "#9aa0a6", marginTop: 4 },
  changeBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  changeBtnText: { color: "#fff", fontWeight: "700" },

  rowTwo: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  field: { flex: 1, marginBottom: 12 },
  label: { color: "#c7cbd0", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.02)",
  },
  inputDisabled: { opacity: 0.6 },
  textarea: { minHeight: 84, textAlignVertical: "top" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: { color: "#fff", marginRight: 8 },
  tagRemove: { padding: 4, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 12 },

  addTagRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  addTagBtn: {
    backgroundColor: "#7c54f6",
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  examples: { color: "#7a7f86", marginTop: 8 },

  saveButton: { marginTop: 10, width: 180, borderRadius: 12, overflow: "hidden" },
  saveGradient: { paddingVertical: 12, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "800" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});