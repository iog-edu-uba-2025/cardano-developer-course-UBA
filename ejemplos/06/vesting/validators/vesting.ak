use aiken/collection/list
use aiken/crypto.{Blake2b_224, Hash, VerificationKey}
use aiken/interval.{Finite}
use cardano/transaction.{Transaction, ValidityRange}

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

pub type VestingParameters {
  VestingParameters { beneficiary: VerificationKeyHash, deadline: Int }
}

/// Create a parameterized vesting validator
/// This validator should only work for spending transactions
validator vesting(p: VestingParameters) {
  spend(_datum, _r, _utxo, tx: Transaction) {
    and {
      must_be_signed_by(tx.extra_signatories, p.beneficiary)?,
      must_be_after_deadline(tx.validity_range, p.deadline)?,
    }
    // The transaction must be signed by the beneficiary
    //must_be_signed_by(tx.extra_signatories, p.beneficiary)?,
    // The transaction must be after the deadline
    //must_be_after_deadline(tx.validity_range, p.deadline)?,
  }

  else(_) {
    fail
  }
}

fn must_be_signed_by(signatories, beneficiary) -> Bool {
  // Check if the beneficiary is in the list of signatories
  list.has(signatories, beneficiary)
}

fn must_be_after_deadline(range: ValidityRange, deadline: Int) -> Bool {
  // Pattern match for the type of the lower bound
  when range.lower_bound.bound_type is {
    // If the lower bound is finite, check if it's after the deadline
    Finite(tx_earliest_time) -> deadline <= tx_earliest_time
    // Else, the lower bound is infinite, so we fail
    _ -> False
  }
}
