use aiken/collection/dict.{to_pairs}
use aiken/collection/list
use cardano/assets.{PolicyId, tokens}
use cardano/transaction.{OutputReference, Transaction}

// NFT policy
validator nft(utxo_ref: OutputReference, token_name: ByteArray) {
  mint(_r, policy_id: PolicyId, tx: Transaction) {
    // Pattern-match to get the transaction inputs and minted values
    let Transaction { inputs, mint, .. } = tx
    // Pattern-match to get the minted tokens and Fail if it's not a single asset minted
    expect [Pair(asset_name, 1)] = mint |> tokens(policy_id) |> to_pairs()
    // Check if the transaction consumes the utxo_ref passed as parameter
    let is_ouput_consumed =
      list.any(inputs, fn(input) { input.output_reference == utxo_ref })
    // Final checks
    is_ouput_consumed? && (asset_name == token_name)?
  }

  else(_) {
    fail
  }
}
