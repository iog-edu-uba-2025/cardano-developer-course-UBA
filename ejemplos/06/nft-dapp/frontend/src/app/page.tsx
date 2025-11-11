"use client";
import { useState } from "react";
import "@meshsdk/react/styles.css";

import { useWallet } from "@meshsdk/react";
import { mintNFTTransaction } from "./transactions/tx";
import { Card } from "./_components/Card";
import { CardHeader } from "./_components/CardHeader";
import { CardBody } from "./_components/CardBody";
import { Button } from "./_components/Button";
import { Input } from "./_components/Input";
import { Navbar } from "./_components/Navbar";
import { useToasts } from "./_components/Toast";

export type NFT = {
  assetName: string;
};

export default function NFTApplication() {
  const { push, Toasts } = useToasts();

  const [busy, setBusy] = useState(false);
  const { connected, wallet } = useWallet();

  async function mintNFT(payload: Partial<NFT>) {
    setBusy(true);
    if (!connected) {
      push("Debes conectar tu wallet primero", "");
      setBusy(false);
      return;
    }

    const txHash = await mintNFTTransaction(
      wallet,
      payload.assetName || "TOKEN",
    );
    push("NFT minado", `${txHash}`);
    setBusy(false);
  }

  const [mintForm, setMintForm] = useState({
    assetName: "TOKEN",
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top bar */}
      <Navbar />

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-6">
        {/* Content */}
        <div className="my-6 grid gap-6">
          <Card>
            <CardHeader title="Minar NFT" />
            <CardBody>
              <form
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await mintNFT(mintForm);
                }}
              >
                <Input
                  label="Asset Name"
                  required
                  value={mintForm.assetName}
                  onChange={(e) =>
                    setMintForm({
                      ...mintForm,
                      assetName: e.target.value.toUpperCase(),
                    })
                  }
                />

                <div className="md:col-span-2 flex justify-end gap-3">
                  <Button type="submit" kind="primary" disabled={busy}>
                    Minar NFT
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      <Toasts />
    </div>
  );
}
