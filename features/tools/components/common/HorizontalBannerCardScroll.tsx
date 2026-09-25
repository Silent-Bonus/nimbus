// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Image,
// } from "react-native";
// import React, { useContext } from "react";
// import ThemeContext from "@/context/ThemeContext";
// import { ThemeKey } from "@/components/ui/Themed";

// interface PropType {
//   backgroundColor: string;
//   title: string;
//   description: string;
//   itemList: Array<TrackType | any>;
// }

// const HorizontalBannerCardScroll: React.FC<PropType> = (props) => {
//   const { backgroundColor, title, description, itemList } = props;

//   const styles = styling(theme);
//   return (
//     <View style={[styles.card, { backgroundColor: backgroundColor }]}>
//       <View style={styles.headerRow}>
//         <Text style={styles.cardTitle}>{title}</Text>
//         <TouchableOpacity>
//           <Text style={styles.allButton}>All {">"}</Text>
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.cardDescription}>{description}</Text>
//       <FlatList
//         data={itemList}
//         keyExtractor={(item) => item.id.toString()}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         renderItem={({ item }) => (
//           <View style={styles.itemRow}>
//             <Image source={item.image} style={styles.itemImage} />
//             <View>
//               <Text style={styles.itemTitle}>{item.title}</Text>
//               <Text style={styles.itemDuration}>{item.duration}</Text>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default HorizontalBannerCardScroll;

// const styling = (theme: ThemeKey) =>
//   StyleSheet.create({
//     card: {
//       margin: 10,
//       borderRadius: 15,
//       padding: 15,
//       borderWidth: 1,
//       borderColor: "#ddd",
//     },
//     headerRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//     },
//     cardTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//     },
//     cardDescription: {
//       fontSize: 14,
//       color: "#444",
//       marginBottom: 10,
//     },
//     allButton: {
//       fontSize: 14,
//       color: "#007AFF",
//     },
//     rowContainer: {
//       flexDirection: "column",
//       justifyContent: "space-between",
//       paddingVertical: 8,
//       paddingHorizontal: 10,
//       backgroundColor: "#f5f5f5",
//       borderRadius: 10,
//       marginRight: 15,
//     },
//     itemRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       width: "100%",
//       paddingVertical: 8,
//       paddingHorizontal: 10,
//       borderBottomWidth: 1,
//       borderBottomColor: "#ddd",
//     },
//     startButton: {
//       alignSelf: "center",
//       marginVertical: 30,
//       width: 200,
//       height: 200,
//       borderRadius: 100,
//       backgroundColor: "#7A4DF3",
//       justifyContent: "center",
//       alignItems: "center",
//       elevation: 5,
//     },
//     startButtonText: {
//       color: "white",
//       fontSize: 24,
//       fontWeight: "bold",
//     },
//     startButtonSubText: {
//       color: "white",
//       fontSize: 14,
//       marginTop: 5,
//     },
//     itemImage: {
//       width: 50,
//       height: 50,
//       borderRadius: 25,
//       marginRight: 10,
//     },
//     itemTitle: {
//       fontSize: 16,
//     },
//     itemDuration: {
//       fontSize: 12,
//       color: "#666",
//     },
//   });
