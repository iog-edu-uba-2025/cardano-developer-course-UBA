import {
    BlockfrostProvider,
    deserializeAddress,
    MeshTxBuilder,
    MeshWallet,
    NativeScript,
    serializeNativeScript,
} from "@meshsdk/core";
import dotenv from "dotenv";
dotenv.config();


const seed1 = JSON.parse(process.env.SEED1 as string)
const seed2 = JSON.parse(process.env.SEED2 as string)
const blockfrost_api_key = process.env.BLOCKFROST_API_KEY || "";
const blockchainProvider = new BlockfrostProvider(blockfrost_api_key);


function toWallet(mn: string[]) {
    return new MeshWallet({
        networkId: 0,
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        key: {
            type: "mnemonic",
            words: mn,
        },
    });
}



async function depositAssets() {
    const wallet1 = toWallet(seed1);
    const wallet2 = toWallet(seed2);
    const wallet1Address = await wallet1.getChangeAddress();
    console.log("wallet1 address: ", wallet1Address);
    const wallet2Address = await wallet2.getChangeAddress();

    const { pubKeyHash } = deserializeAddress(wallet2Address);
    const script: NativeScript = {
        type: "sig",
        keyHash: pubKeyHash,
    };
    console.log("script: ", script);

    const { address, scriptCbor } = serializeNativeScript(script);
    if (!scriptCbor) {
        throw "No se pudo serializar el script";
    }

    console.log("script address: ", address);

    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        verbose: false,
    });

    const unsignedTx = await txBuilder
        .txOut(address, [{ unit: "lovelace", quantity: "2000000" }])
        .changeAddress(wallet1Address)
        .selectUtxosFrom(await wallet1.getUtxos())
        .complete();

    const signedTx = await wallet1.signTx(unsignedTx);
    const txHash = await wallet1.submitTx(signedTx);
    console.log("txHash", txHash);
}

depositAssets();
