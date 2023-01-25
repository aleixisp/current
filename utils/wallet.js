import { getValue } from "./secureStore"
import {sha256} from '@noble/hashes/sha256'
import * as secp256k1 from '@noble/secp256k1'
import { getPublicKey } from "nostr-tools"
import { store } from "../store/store"
import { walletApi } from "../services/walletApi"


const utf8Encoder = new TextEncoder()


export const createWallet = async (privKey, address) => {
    try {
        if (!privKey) {
            throw new Error('Expected to get a valid private key')
        }
        const pubKey = await getPublicKey(privKey)
        const password = secp256k1.utils.bytesToHex(sha256(utf8Encoder.encode(privKey)))
        const result = await store.dispatch(walletApi.endpoints.postNewWallet.initiate({login: pubKey, password, username: address})).unwrap();
        console.log(result)
    } catch(err) {
        console.log(err)
    }
}

export const loginToWallet = async (privKey) => {
    try {
        if (!privKey) {
            throw new Error('Expected to get a valid private key')
        }
        const pubKey = await getPublicKey(privKey)
        const password = secp256k1.utils.bytesToHex(sha256(utf8Encoder.encode(privKey)))
        const result = await store.dispatch(walletApi.endpoints.postLogin.initiate({login: pubKey, password: password})).unwrap()
        console.log(result)
        if (result?.error === true) {
            throw new Error(`Auth failed: ${result?.message}`)
        }
        return result
    } catch (err) {
        console.log(err)
    }

}