import { View, Text } from "react-native";
import React from "react";
import globalStyles from "../../styles/globalStyles";
import LoadingSpinner from "../../components/LoadingSpinner";
import { publishKind0 } from "../../utils/nostrV2";
import { useEffect } from "react";
import { getPublicKey } from "nostr-tools";
import { createWallet, loginToWallet } from "../../utils/wallet";
import { saveValue } from "../../utils/secureStore";
import { logIn } from "../../features/authSlice";
import { useDispatch } from "react-redux";
import { followMultipleUsers, followUser } from "../../utils/users";
import {
    getKind3Followers,
    updateFollowedUsers,
} from "../../utils/nostrV2/getUserData";
import { initRC } from "../../features/premium";

const LoadingProfileScreen = ({ route }) => {
    const {
        image,
        svg,
        svgId,
        privKey,
        address,
        bio,
        publishProfile,
        mem,
        isImport,
    } = route.params;
    const dispatch = useDispatch();

    useEffect(() => {
        createProfileHandler();
    });

    const uploadImage = async (pubKey, bearer) => {
        const id = pubKey.slice(0, 16);
        let localUri = image.uri;
        let filename = localUri.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        let formData = new FormData();
        formData.append("asset", { uri: localUri, name: filename, type });
        formData.append("name", `${id}/profile/avatar.${match[1]}`);
        formData.append("type", "image");
        const response = await fetch(`${process.env.BASEURL}/upload`, {
            method: "POST",
            body: formData,
            headers: {
                "content-type": "multipart/form-data",
                Authorization: `Bearer ${bearer}`,
            },
        });
        const data = await response.json();
        console.log(data.data);
        return data.data;
    };

    const uploadSvg = async (id, bearer) => {
        try {
            const response = await fetch(
                `${process.env.BASEURL}/avatar?name=${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${bearer}`,
                    },
                }
            );
            const data = await response.json();
            if (data.error === true) {
                console.log(data);
                throw new Error(`Error getting svg-image url: ${data}`);
            }
            return data.data;
        } catch (err) {
            console.log(err);
        }
    };
    const createProfileHandler = async () => {
        let imageUrl;
        try {
            const pubKey = await getPublicKey(privKey);
            await createWallet(privKey, address);
            if (mem) {
                await saveValue("mem", mem);
            }
            await saveValue("privKey", privKey);
            await saveValue("address", address);
            const result = await loginToWallet(privKey);
            const { access_token, username } = result.data;
            await followUser(pubKey);
            try {
                if (publishProfile) {
                    if (image) {
                        imageUrl = await uploadImage(pubKey, access_token);
                    }
                    if (svg) {
                        imageUrl = await uploadSvg(svgId, access_token);
                    }
                    await publishKind0(address, bio, imageUrl, address);
                }
                await updateFollowedUsers();
            } catch (error) {
                console.log(error);
            } finally {
                await initRC(pubKey);
                dispatch(logIn({ bearer: access_token, username, pubKey }));
            }
        } catch (error) {
            console.log(`Failed to create profile: ${error}`);
        }
    };
    return (
        <View
            style={[
                globalStyles.screenContainer,
                { justifyContent: "space-around" },
            ]}
        >
            {isImport ? (
                <Text style={globalStyles.textBody}>
                    Setting up your profile...
                </Text>
            ) : (
                <Text style={globalStyles.textBody}>
                    Deriving your nostr-keys...
                </Text>
            )}
            <LoadingSpinner size={100} />
        </View>
    );
};

export default LoadingProfileScreen;
