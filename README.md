# Convert to use Bitcoin ZKP
Tasks
- [ ] Store dids on blockchain
- [ ] DID resolver for bitcoin
- [ ] convert proof to ZKP inside credential
- [ ] integrate scrypt for verification

These are the likely modification points.  

src/helpers/common.js
* issueCredential(suite, credential, true, documentLoader)
* verifyPresentation(presentation)
* defaultDocumentLoader(url) (DID resolver)

src/helpers/create-presentation.js
* proveCompositeClaims(presentation, [toProve], rules)

src/helpers/verify.js
* acceptCompositeClaims(presentation, rules)

src/helpers/didcache.js  
private keys for dids
* ageRoot
* delegate1, 2, 3
* 'did:demo:age_root'

Objects that may need custom libraries for handling...  
* credential  
* presentation  
* rules

# Development
Run using node version 16.
```
nvm use 16
yarn install
yarn start
```



# Linked Biometrics Claim Deduction demo

A simple demonstration using linked biometrics with Claim Deduction and Verifiable Credentials for age verification. The demo is a simulated vending machine that performs age verification before dispensing items. Try it yourself [here](https://biometrics-demo.dock.io).

**Uses:**

- [Dock SDK](https://github.com/docknetwork/sdk)
- [RIFY](https://github.com/docknetwork/rify)
- [Face Api](https://github.com/justadudewhohacks/face-api.js/)
- [VCDM](https://www.w3.org/TR/vc-data-model)

This age verification method can be partially privacy preserving because biometric data is embedded in a signed credential rather than being stored in some central database. The person getting their age verified doesn't *need* to reveal much personally identifiable information to the verifier other than their face and the fact that they are older than a certain threshold. The credential can leave out data points like name and gender.

This demo implements and uses a local [DID method](https://www.w3.org/TR/did-core/#dfn-did-methods) called "did:demo". The vending machine trusts age claims made by `did:demo:age_root`. The "secret" key for that DID is in `./src/helpers/didcache.js`. Feel free to experiment with issuing your own credentials.

Credentials in this demo are irrevocable but could in practice [link](https://www.w3.org/TR/vc-data-model/#status) to a revocation registry. 

The vending machine accepts credential presentations and verifies them against the face it sees in its camera before dispensing an item.

# Delegation Chains

In real large-scale use, it may not be efficient for a single entity to issue every age credential. As a proposed solution, and as an excuse to show off [Dock's Claim Deduction engine](https://docknetwork.github.io/sdk/tutorials/concepts_claim_deduction.html), this demo allows for delegation of authority by issuers.

Dock credentials are modeled as RDF which gives them meaning in the context of the semantic web. It's possible for a computer perform deductive reasoning over RDF graphs. Using Claim Deduction, the vending machine can perform limited generic deductive reasoning given a set of allowed logical axioms. Check out `src/helpers/rules.js` to see the axioms accepted by the vending machine.

`did:demo:age_root` does not issue age credentials directly. Rather, `did:demo:age_root` signs a separate credential delegating authority to another issuer. The age credentials issued by this demo are wrapped in [VCDM presentations](https://www.w3.org/TR/vc-data-model/#presentations) and bundled with the other credentials that comprise a delegation chain. A deductive proof is attached to the presentation. The proof is machine generated, and derives an implication relationship from truths made self-evident by the credentials to the fact in question: "Is the person in the image old enough?".

The proofs generated by this demo tend to take the form:

```
// age_root bequeaths delegation authority to delegate1
[did:demo:age_root type AgeDelegate] and
[did:demo:age_root claims [did:demo:delegate1 type AgeDelegate]]
therefore [did:demo:delegate1 type AgeDelegate]

// who in turn bequeaths delegation authority to delegate2
[did:demo:delegate1 type AgeDelegate] and
[did:demo:delegate1 claims [did:demo:delegate2 type AgeDelegate]]
therefore [did:demo:delegate2 type AgeDelegate]

// delegate2 claims the image pictures a single individual who is old enough
[did:demo:delegate2 type AgeDelegate] and
[did:demo:delegate3 claims [<image> type OfAge]]
therefore [<image> type OfAge]
```

The vending machine in this demo lays the burden of proof on the presenter, but it's possible to perform inference *without* requiring an embedded proof. As intuition would indicate, inference is computationally harder than proof verification.

# Presentation Example

The following is an example of a VCDM presentation emitted and accepted by this demo. Base 64 embedded images are hidden for readability.

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiablePresentation"],
  "verifiableCredential": [
    {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "uuid:67d8a4f9-61b7-4f98-a830-e7fef6fd274f",
      "type": ["VerifiableCredential"],
      "issuer": "did:demo:age_root",
      "credentialSubject": {
        "@id": "did:demo:delegate1",
        "@type": "https://example.com/AgeDelegate"
      },
      "issuanceDate": "2020-10-12T23:59:06.320Z",
      "proof": {
        "type": "Ed25519Signature2018",
        "created": "2020-10-12T23:59:06Z",
        "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..GjaPOrG-ca50NfE7zmx0Ff5jd2TaaNabCkh47gVj3lbYTxe5EkyIVP49BuAu9JNM1K5xB1V6XaH0lPBCkARfBw",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:demo:age_root#keys-1"
      }
    },
    {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "uuid:0f1da9fc-54d8-483c-ab32-8031ba380bd2",
      "type": ["VerifiableCredential"],
      "issuer": "did:demo:delegate1",
      "credentialSubject": {
        "@id": "did:demo:delegate2",
        "@type": "https://example.com/AgeDelegate"
      },
      "issuanceDate": "2020-10-12T23:59:06.321Z",
      "proof": {
        "type": "Ed25519Signature2018",
        "created": "2020-10-12T23:59:06Z",
        "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..sHGEIviELWLemtuc4n0rIXS9z90j3h8_N3Css3357y-bFZtzcPyagt7T8UHnVtminj4GZdxZTKp_GRnfMBHrAA",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:demo:delegate1#keys-1"
      }
    },
    {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "uuid:d8b2328b-ccf4-4bc9-b5e3-62c8ae58f13d",
      "type": ["VerifiableCredential"],
      "issuer": "did:demo:delegate2",
      "credentialSubject": {
        "@id": "data:image/png;base64,iVBORw0KG...etc...",
        "@type": "https://example.com/OfAge"
      },
      "issuanceDate": "2020-10-12T23:59:06.322Z",
      "proof": {
        "type": "Ed25519Signature2018",
        "created": "2020-10-12T23:59:06Z",
        "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..B8UjkhNXO5U-YWNxHZi-iJRoOIvEhfbESwzlGeDrd1ysuKwtb6eIptdrVJ675LdFkT4WNeCSsHzuTiKGMsnBDw",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:demo:delegate2#keys-1"
      }
    }
  ],
  "id": "uuid:71d67df1-419d-4382-af5e-5f240c9effec",
  "holder": "uuid:e5dac0a1-06ec-4721-94ce-8dd0f3b3d821",
  "https://www.dock.io/rdf2020#logicV1": {
    "@type": "@json",
    "@value": [
      {
        "rule_index": 0,
        "instantiations": []
      },
      {
        "rule_index": 1,
        "instantiations": [
          {"Iri": "did:demo:age_root"},
          {"Blank": "_:b0"},
          {"Iri": "did:demo:delegate1"}
        ]
      },
      {
        "rule_index": 1,
        "instantiations": [
          {"Iri": "did:demo:delegate1"},
          {"Blank": "_:b5"},
          {"Iri": "did:demo:delegate2"}
        ]
      },
      {
        "rule_index": 2,
        "instantiations": [
          {"Iri": "did:demo:delegate2"},
          {"Blank": "_:b10"},
          {"Iri": "data:image/png;base64,iVBORw0KG...etc..."}
        ]
      }
    ]
  }
}
```

# Considerations

A standard camera as a facial recognition device can be tricked by holding a printed image of a face in front of your own. Use of specialized biometric scanning hardware may mitigate the problem. Suggestions are much appreciated; feel free to open a github issue.
