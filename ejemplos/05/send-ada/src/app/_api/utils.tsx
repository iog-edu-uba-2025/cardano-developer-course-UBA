import { BlockfrostProvider, Data, MeshTxBuilder } from "@meshsdk/core";

export const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export function formatTxHash(txHash: string) {
    const matchResult = txHash.match(/.{1,32}/g);
    if (matchResult) {
        return matchResult.join("\n");
    }
    return "";
}

export function initializeBlockchainProvider(): BlockfrostProvider {
    const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
    if (!apiKey) {
        throw new Error("Blockfrost API key is missing");
    }
    return new BlockfrostProvider(apiKey);
}

export const blockchainProvider = initializeBlockchainProvider();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseData(input: any): Data {
    if (
        input !== null &&
        typeof input === "object" &&
        "bytes" in input &&
        Object.keys(input).length === 1
    ) {
        return (input as { bytes: string }).bytes;
    }

    if (
        input !== null &&
        typeof input === "object" &&
        "number" in input &&
        Object.keys(input).length === 1
    ) {
        return BigInt((input as { number: number }).number);
    }

    if (
        typeof input === "string" ||
        typeof input === "number" ||
        typeof input === "bigint"
    ) {
        return input;
    }

    if (Array.isArray(input)) {
        return input.map(parseData);
    }

    if (
        input !== null &&
        typeof input === "object" &&
        "alternative" in input &&
        Array.isArray(input.fields)
    ) {
        return {
            alternative: input.alternative,
            fields: input.fields.map(parseData),
        };
    }

    throw new Error(`This type is not supported: ${JSON.stringify(input)}`);
}

export const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
});

export const fetchAdaPrice = async (): Promise<number | string> => {
    const baseUrl = "https://api.polygon.io/v2/aggs/ticker/X:ADAUSD/prev";
    const params = new URLSearchParams({
        adjusted: "true",
        apiKey: process.env.NEXT_PUBLIC_POLYGON as string,
    });

    try {
        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const price = data.results[0].c;
        return price;
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        } else {
            return "An unknown error occurred";
        }
    }
};
