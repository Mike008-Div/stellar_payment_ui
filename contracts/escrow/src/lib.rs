#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env};

const DAY_IN_LEDGERS: u32 = 17280;
const MAX_ESCROW_TTL: u32 = DAY_IN_LEDGERS * 30;
const MAX_ESCROW_DURATION_SECONDS: u64 = 60 * 60 * 24 * 30;

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Escrow {
    pub payer: Address,
    pub payee: Address,
    pub asset: Address,
    pub amount: i128,
    pub release_after: u64,
    pub status: EscrowStatus,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum EscrowStatus {
    Created,
    Funded,
    Released,
    Refunded,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    NextId,
    Escrow(u32),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    InvalidAmount = 1,
    InvalidDeadline = 2,
    EscrowNotFound = 3,
    InvalidStatus = 4,
    DeadlineNotReached = 5,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Creates an escrow record. The payer must authorize this call.
    pub fn create(
        env: Env,
        payer: Address,
        payee: Address,
        asset: Address,
        amount: i128,
        release_after: u64,
    ) -> Result<u32, Error> {
        payer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let now = env.ledger().timestamp();
        if release_after <= now || release_after > now.saturating_add(MAX_ESCROW_DURATION_SECONDS) {
            return Err(Error::InvalidDeadline);
        }

        let id = env
            .storage()
            .persistent()
            .get::<_, u32>(&DataKey::NextId)
            .unwrap_or(0);
        let next_id = id.checked_add(1).ok_or(Error::InvalidAmount)?;

        let escrow = Escrow {
            payer,
            payee,
            asset,
            amount,
            release_after,
            status: EscrowStatus::Created ,
        };

        
        let storage = env.storage().persistent();
        storage.set(&DataKey::Escrow(id), &escrow);
        storage.set(&DataKey::NextId, &next_id);
        storage.extend_ttl(&DataKey::Escrow(id), MAX_ESCROW_TTL, MAX_ESCROW_TTL);
        storage.extend_ttl(&DataKey::NextId, MAX_ESCROW_TTL, MAX_ESCROW_TTL);

        Ok(id)
    }

    /// Moves the payer's funds into the contract and marks the escrow funded.
    pub fn fund(env: Env, escrow_id: u32) -> Result<(), Error> {
        let mut escrow = Self::load(&env, escrow_id)?;
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Created {
            return Err(Error::InvalidStatus);
        }

        token::Client::new(&env, &escrow.asset).transfer(
            &escrow.payer,
            &env.current_contract_address(),
            &escrow.amount,
        );
        escrow.status = EscrowStatus::Funded;
        Self::save(&env, escrow_id, &escrow);
        Ok(())
    }

    /// Releases funded escrow to the payee. Only the payer can release it.
    pub fn release(env: Env, escrow_id: u32) -> Result<(), Error> {
        let mut escrow = Self::load(&env, escrow_id)?;
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Funded {
            return Err(Error::InvalidStatus);
        }

        token::Client::new(&env, &escrow.asset).transfer(
            &env.current_contract_address(),
            &escrow.payee,
            &escrow.amount,
        );
        escrow.status = EscrowStatus::Released;
        Self::save(&env, escrow_id, &escrow);
        Ok(())
    }

    /// Returns funded escrow to the payer after its release deadline.
    pub fn refund(env: Env, escrow_id: u32) -> Result<(), Error> {
        let mut escrow = Self::load(&env, escrow_id)?;
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Funded {
            return Err(Error::InvalidStatus);
        }
        if env.ledger().timestamp() < escrow.release_after {
            return Err(Error::DeadlineNotReached);
        }

        token::Client::new(&env, &escrow.asset).transfer(
            &env.current_contract_address(),
            &escrow.payer,
            &escrow.amount,
        );
        escrow.status = EscrowStatus::Refunded;
        Self::save(&env, escrow_id, &escrow);
        Ok(())
    }

    pub fn get(env: Env, escrow_id: u32) -> Result<Escrow, Error> {
        Self::load(&env, escrow_id)
    }

    fn load(env: &Env, escrow_id: u32) -> Result<Escrow, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)
    }

    fn save(env: &Env, escrow_id: u32, escrow: &Escrow) {
        let storage = env.storage().persistent();
        storage.set(&DataKey::Escrow(escrow_id), escrow);
        storage.extend_ttl(&DataKey::Escrow(escrow_id), MAX_ESCROW_TTL, MAX_ESCROW_TTL);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn create_rejects_invalid_amount_and_deadline() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);
        let payer = Address::generate(&env);
        let payee = Address::generate(&env);
        let asset = Address::generate(&env);

        assert_eq!(
            client.try_create(&payer, &payee, &asset, &0, &1),
            Err(Ok(Error::InvalidAmount))
        );
        assert_eq!(
            client.try_create(&payer, &payee, &asset, &1, &0),
            Err(Ok(Error::InvalidDeadline))
        );
        assert_eq!(
            client.try_create(&payer, &payee, &asset, &1, &MAX_ESCROW_DURATION_SECONDS + 1),
            Err(Ok(Error::InvalidDeadline))
        );
    }
}
