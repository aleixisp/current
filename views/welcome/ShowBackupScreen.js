import { View, Text, FlatList, Button } from "react-native";
import React from "react";
import globalStyles from "../../styles/globalStyles";
import { mnemonicToSeed } from "../../utils/keys";
import * as nostr from "nostr-tools";
import { usePostNewWalletMutation } from "../../services/walletApi";
import { saveValue } from "../../utils/secureStore";
import { useDispatch } from "react-redux";
import { logIn } from "../../features/authSlice";
import CustomButton from "../../components/CustomButton";
import { createWallet, loginToWallet } from "../../utils/wallet";
import { postEvent } from "../../utils/nostr";
import { setNip05 } from "../../utils/nostr/nip05";

const Word = ({ word, index }) => {
    return (
        <View
            style={[
                {
                    padding: 12,
                    backgroundColor: "#222222",
                    borderRadius: 5,
                    width: "45%",
                    margin: 6,
                    textAlign: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                },
            ]}
        >
            <Text style={globalStyles.textBody}>{index + 1}</Text>
            <Text style={globalStyles.textBody}>{word}</Text>
        </View>
    );
};

const ShowBackupScreen = ({ route }) => {
    const dispatch = useDispatch();
    const {mem, username} = route.params;
    const [postWallet, results] = usePostNewWalletMutation();

    const saveHandler = async () => {
        const privKey = await mnemonicToSeed(mem);
        const pubKey = nostr.getPublicKey(privKey);
        await createWallet(privKey, username);
        const { access_token } = await loginToWallet(privKey, username)
        await saveValue("privKey", privKey);
        await saveValue("username", username);
        await saveValue('mem', JSON.stringify(mem))
        await setNip05(username, 'starbackr.me');
        dispatch(logIn({bearer: access_token, username}));
    };
    return (
        <View style={globalStyles.screenContainer}>
            <View style={{flex: 2}}>
                <Text style={globalStyles.textH1}>
                    This is your Backup... Write it down!
                </Text>
                <FlatList
                    data={mem}
                    renderItem={({ item, index }) => (
                        <Word word={item} index={index} />
                    )}
                    style={{ width: "100%", flexGrow: 0 }}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    numColumns={2}
                />
            </View>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <CustomButton
                    text="I have written it down"
                    buttonConfig={{ onPress: saveHandler }}
                />
            </View>
        </View>
    );
};

export default ShowBackupScreen;
