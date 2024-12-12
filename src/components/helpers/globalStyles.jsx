import { StyleSheet, Dimensions } from "react-native";

export const appBackgroundColor = "#EFD5C2"; // Peach/Khaki & Green Theme
export const primaryColor = "#734E40";
export const secondaryColor = "#F1E2C3";
const SCREEN_WIDTH = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  landingContainer: {
    flex: 1,
    backgroundColor: appBackgroundColor,
  },
  landingContent: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    gap: 50,
  },
});
