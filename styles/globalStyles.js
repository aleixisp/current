import { StyleSheet, useWindowDimensions } from "react-native";
import colors from "./colors";

export default globalStyles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        paddingTop: 32,
        paddingHorizontal: 16,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
    },
    textBody: {
        fontFamily: 'Montserrat-Regular',
        color: 'white',
        fontSize: 16,
        textAlign:'center'
    },
    textH1: {
        fontFamily: 'Montserrat-Bold',
        color: 'white',
        fontSize: 32,
        marginBottom:32
    }
})