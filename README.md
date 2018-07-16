# Sample Multichain Performance

The goal of this repo is to provide a working example of asset creation using multichain and to assist debugging any potential mistakes made in configuration that could lead to performance degradation

To generate 5000 assets run the following command:
```bash
docker-compose up generator
```
To increase or decrease this number modify the ASSETS_TO_CREATE value in docker-compose.yml

## Results

 - The initial transactions take less than 10ms but quickly go above this and reach the 100ms range by the end of the generator test. (10 TPS)

- The utxocount number increases as the number of assets grows. 
- Once the generator is finished the utxocount decreases over time but slows at the 1000 mark as it struggles to autocombine (often 100 inputs, 90+ outputs). 
- It tries to autocombine 100 txs at a time due to the default config.
- It stopped (100 inputs, 100 outputs) autocombining at 505 utxocount

```json
{
    "walletversion" : 60000,
    "balance" : 0.00000000,
    "walletdbversion" : 2,
    "txcount" : 5163,
    "utxocount" : 505,
    "keypoololdest" : 1531736638,
    "keypoolsize" : 2
}
```

- The issuance of subsequent assets after the utxocount decreased to 505 took around 30ms. 33 TPS
- Test was conducted using docker for mac with 4 CPU, 2 GB memory, 1 GB swap
- Increasing to 4 GB memory and 2 GP Swap improved early tx speeds but by 5000th it was roughly the same (90ms)

Extending this test with more assets results in avg asset creation time of:
- 170ms at 12,000 asset mark (and 7000 utxocount) - 5.88 TPS
- 200ms at 16,000 asset mark (and 8600 utxocount) - 5.00 TPS
- 230ms at 20,000 asset mark (and 9400 utxocount) - 4.35 TPS

utxocount eventually dropped to 3228 and stopped decreasing (16% of txcount)
Generating 100 assets after this point took on avg 110ms each

Manually trying to combine transactions: 
```bash
combineunspent <address> 1 100 2 100 60
```
fails with the following error:
```bash
genesis_1    | Committing wallet optimization tx. Inputs: 100, Outputs: 15
genesis_1    | CommitTransaction: 856e31d69c6710329cbd9aa23697b5bd9373cd97a1f2ec16f3295275aa218e07, vin: 100, vout: 15
genesis_1    | ERROR: CScriptCheck(): 856e31d69c6710329cbd9aa23697b5bd9373cd97a1f2ec16f3295275aa218e07:5 VerifySignature failed: Script is too big
genesis_1    | ERROR: CScriptCheck(): 856e31d69c6710329cbd9aa23697b5bd9373cd97a1f2ec16f3295275aa218e07:5 VerifySignature failed: Script is too big
genesis_1    | ERROR: AcceptToMemoryPool: : ConnectInputs failed 856e31d69c6710329cbd9aa23697b5bd9373cd97a1f2ec16f3295275aa218e07
genesis_1    | CommitTransaction() : Error: Transaction not valid: 16: ConnectInputs failed: mandatory-script-verify-flag-failed (Script is too big)
genesis_1    | mcapi: API request successful: combineunspent
```

Increasing the autocombinemaxinputs to 500 helped performance and keep the number of utxocount down initially but it started to experience the same script is too big error as above

Chain logs can be tailed:
```bash
docker-compose logs -f genesis
```

Or output to a file:
```bash
docker-compose logs --no-color genesis >& logs.txt
```

Or get a shell to the container:
```bash
docker-compose exec genesis /bin/bash
```

Or interact directly with the chain:
```bash
docker-compose exec genesis multichain-cli sample -rpcuser=user -rpcpassword=local-password -rpcport=8571
```
