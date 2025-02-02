import {
  EcdsaSepc256k1Signature2019,
  Ed25519Signature2018,
  Sr25519Signature2020,
} from '@docknetwork/sdk/utils/vc/custom_crypto';

import { verifyPresentation as verifyPresentationDock } from '@docknetwork/sdk/utils/vc/presentations';
import { issueCredential } from '@docknetwork/sdk/utils/vc/credentials';
import VerifiablePresentation from '@docknetwork/sdk/verifiable-presentation';

import defaultDocumentLoader from '@docknetwork/sdk/utils/vc/document-loader';
import {Ed25519VerificationKey2018} from '@digitalbazaar/ed25519-verification-key-2018';

import axios from 'axios';
import assert from 'assert';
import { didcache } from './didcache';

import jsonldSignatures from 'jsonld-signatures';
import jsonld from 'jsonld';
import { Ed25519KeyPair } from 'crypto-ld';
import { v4 as uuidv4 } from 'uuid';

export async function verifyPresentation(presentation) {
  const v = await verifyPresentationDock(presentation, {
    challenge: undefined,
    domain: undefined,
    documentLoader,
    compactProof: true,
    forceRevocationCheck: false,
    unsignedPresentation: true,
  });
  if (!v.verified) {
    throw v;
  }
}

const documentLoaderDefault = defaultDocumentLoader(null);
export async function documentLoader(url) {
  let document;
  if (url.startsWith('did:demo:')) {
    document = demoDid(url);
  } else {
    document = (await documentLoaderDefault(url)).document;
  }
  return {
    documentUrl: url,
    document,
  };
}

function demoDid(did) {
  if (didcache[did] === undefined) {
    throw new Error(`${did} does not exist`);
  }
  return didcache[did];
}

export async function createCred(issuer, credentialSubject, ed25519privateKeyBase58, issuerPk58) {
  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: generateUUID(),
    type: ['VerifiableCredential'],
    issuer,
    credentialSubject,
    issuanceDate: new Date().toISOString(),
  };

  const suite = await ed25519suite54(issuer, ed25519privateKeyBase58, issuerPk58);
  const documentLoader = null;
  const vc = await issueCredential(suite, credential, true, documentLoader);
  return vc;
}

async function ed25519suite54(did, privateKeyBase58, publicKeyBase58) {
  const verificationMethod = `${did}#keys-1`;
  const keypair = await Ed25519VerificationKey2018.from({
    controller: did,
    id: verificationMethod,
    type: 'Ed25519VerificationKey2018',
    privateKeyBase58,
    publicKeyBase58,
  });
  const suite = new Ed25519Signature2018({
    verificationMethod,
    keypair: {
      sign: async function(data) {
        const signed = await keypair.signer().sign({ data });
        return signed;
      }
    },
    signer: keypair.signer(),
  });
  suite.verificationMethod = verificationMethod;
  return suite;
}

function generateUUID() {
  return `uuid:${uuidv4()}`;
}

export async function createPres(credentials) {
  const vp = new VerifiablePresentation(generateUUID());
  credentials.forEach(cred => vp.addCredential(cred));
  vp.setHolder(generateUUID());
  return vp.toJSON();
}

export async function expand(ld) {
  return await jsonld.expand(ld, { documentLoader });
}

// example way to get a blob
// let blob = await fetch("https://example.com/image.png").then(r => r.blob());
export async function blobToDataUrl(blob) {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function unwrapSingle(array, otherwise = 'expected single element') {
  assert(
    array.length !== undefined,
    'tried to unwrap single element from an array, but the array was not an array',
  );
  if (array.length !== 1) throw new Error(otherwise);
  return array[0];
}
