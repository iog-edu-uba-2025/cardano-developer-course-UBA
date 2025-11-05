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


const seed2 = JSON.parse(process.env.SEED2 as string)
const blockfrost_api_key = process.env.BLOCKFROST_API_KEY || "";
const blockchainProvider = new BlockfrostProvider(blockfrost_api_key);

function toWallet(mn: string[]) {
    return new MeshWallet({
        networkId: 0,
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        accountIndex: 0,
        key: {
            type: "mnemonic",
            words: mn,
        },
    });
}

// wallet1 representa el que envia la tx
const wallet2 = toWallet(seed2);

async function getScriptUtxo(address: string, txHash: string, ix: number) {
    const utxos = await blockchainProvider.fetchAddressUTxOs(address);
    return utxos.filter((utxo) => utxo.input.txHash === txHash)[ix];
}

async function withdrawAssets({ txHash }: { txHash: string }) {
    const wallet2Address = await wallet2.getChangeAddress();
    console.log("wallet2 address: ", wallet2Address);

    const { pubKeyHash } = deserializeAddress(wallet2Address);
    const script: NativeScript = {
        type: "sig",
        keyHash: pubKeyHash,
    };
    console.log("script: ", script);

    const { address: scriptAddr, scriptCbor } = serializeNativeScript(script);
    if (!scriptCbor) {
        throw "No se pudo serializar el script";
    }
    console.log("script address: ", scriptAddr);

    const utxo = await getScriptUtxo(scriptAddr, txHash, 0);
    console.log("Script UTxO: ", utxo);
    const walletUtxo = (await wallet2.getUtxos())[0]

    console.log("walletUtxo", walletUtxo);
    if (utxo == undefined || walletUtxo == undefined) {
        console.log("missing required utxos");
        return;
    }

    const tx = new MeshTxBuilder({ fetcher: blockchainProvider });
    const unsigned = await tx
        .changeAddress(wallet2Address)
        .txIn(
            utxo.input.txHash,
            utxo.input.outputIndex,
            utxo.output.amount,
            utxo.output.address,
        )
        .txIn(
            walletUtxo.input.txHash,
            walletUtxo.input.outputIndex,
            walletUtxo.output.amount,
            walletUtxo.output.address,
        )
        .requiredSignerHash(pubKeyHash)
        .txInScript(scriptCbor!)
        .complete();

    const signed = await wallet2.signTx(unsigned);
    const _txHash = await wallet2.submitTx(signed);
    console.log("txHash", _txHash);
}

withdrawAssets({
    txHash: "locking transaction hash",
});

