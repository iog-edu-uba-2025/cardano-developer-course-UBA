use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction}

validator spend {
  spend(datum: Option<VerificationKeyHash>, _r, _utxo, tx: Transaction) {
    expect Some(vk) = datum
    list.has(signatories, beneficiary)
  }

  else(_) {
    fail
  }
}
