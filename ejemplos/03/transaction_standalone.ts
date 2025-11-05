import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from "@meshsdk/core";
import dotenv from "dotenv";
dotenv.config();

const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");
const seed = JSON.parse(process.env.SEED as string)

const wallet = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
        type: "mnemonic",
        words: seed,
    },
});

async function transfer() {
    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();
    console.log("change address: ", changeAddress, "\n");

    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        verbose: false
    });

    const unsignedTx = await txBuilder
        .txOut(
            'addr_test1qqrkrxapspxfh60kxpj0n3xhavu0msl8pxtf2fr868d9gakcg2rsqtl9rzhpfgfsl8tnk98qdzjxqzz6ffdztl9ftj4qe3j2td',
            [{ unit: "lovelace", quantity: '1000000' }]
        )
        .txOut(
            'addr_test1qqrkrxapspxfh60kxpj0n3xhavu0msl8pxtf2fr868d9gakcg2rsqtl9rzhpfgfsl8tnk98qdzjxqzz6ffdztl9ftj4qe3j2td',
            [{ unit: "lovelace", quantity: '3000000' }]
        )
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();

    const signedTx = await wallet.signTx(unsignedTx);

    const txHash = await wallet.submitTx(signedTx);
    console.log("txHash: ", txHash);
}

transfer()
