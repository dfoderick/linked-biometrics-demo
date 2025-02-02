import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import dynamic from 'next/dynamic';
import {useDropzone} from 'react-dropzone';

import Hand from '../../public/images/hand.svg';
import Logo from '../../public/images/dock-logo-white.svg';

const Panel = dynamic(() => import('../components/panel'));
const IssuePanel = dynamic(() => import('../components/issue'));

const Header = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const StyledLogo = styled(Logo)`
  position: fixed;
  left: 25px;
  top: 15px;
`;

// position: relative;

const SellerStyled = styled.div`
  position: fixed;
  left: 195px;
  top: 15px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  gap:1em;
  padding: 1em;
`;

const StyledCarStashLogo = styled.img`
  position: fixed;
  left: 25px;
  top: 15px;
  height:15%;
  width:10%;
`;

const InputColumnWrapper = styled.div`
  margin:1em;
`;

const VendingMachineWrapper = styled.div`
  position: fixed;
  left: 60px;
  top: 0;
  height: 100%;
`;

const VendingMachineStyled = styled.img`
  height: 100%;
  position: relative;
  left: 0;
  top: 0;
`;

const CarStyled = styled.img`
  height: 60%;
  width: 50%;
  position: relative;
  left: 0;
  top: 0;
`;

const CarKey = styled.img`
  height: 30%;
  width: 30%
  position: absolute;
  left: 10px;
  top: 10px;
  bottom: 0;
  z-index: 1;
  animation: canReveal 2s;
  animation-iteration-count: 1;

  @keyframes canReveal {
    0% { transform: translate(0, -8px) rotate(0deg); opacity: 0; }
    10% { transform: translate(0, -8px) rotate(-1deg); }
    20% { transform: translate(0, -8px) rotate(1deg); }
    30% { transform: translate(0, -7px) rotate(0deg); }
    40% { transform: translate(0, -6px) rotate(1deg); opacity: 1.0; }
    50% { transform: translate(0, -5px) rotate(-1deg); }
    60% { transform: translate(0, -4px) rotate(0deg); }
    70% { transform: translate(0, -3px) rotate(-1deg); }
    80% { transform: translate(0, -2px) rotate(1deg); }
    90% { transform: translate(0, -1px) rotate(0deg); }
    100% { transform: translate(0, 0px) rotate(0deg); }
  }
`;

const VendingMachineCan = styled.img`
  height: 100%;
  position: absolute;
  left: 10px;
  bottom: 0;
  z-index: 1;
  animation: canReveal 1s;
  animation-iteration-count: 1;

  @keyframes canReveal {
    0% { transform: translate(0, -8px) rotate(0deg); opacity: 0; }
    10% { transform: translate(0, -8px) rotate(-1deg); }
    20% { transform: translate(0, -8px) rotate(1deg); }
    30% { transform: translate(0, -7px) rotate(0deg); }
    40% { transform: translate(0, -6px) rotate(1deg); opacity: 1.0; }
    50% { transform: translate(0, -5px) rotate(-1deg); }
    60% { transform: translate(0, -4px) rotate(0deg); }
    70% { transform: translate(0, -3px) rotate(-1deg); }
    80% { transform: translate(0, -2px) rotate(1deg); }
    90% { transform: translate(0, -1px) rotate(0deg); }
    100% { transform: translate(0, 0px) rotate(0deg); }
  }
`;

const HandWrapper = styled(Hand)`
  position: fixed;
  left: 40px;
  bottom: 0;
  cursor: pointer;
  transform: translate(0, 20px);
  transition: all 0.2s ease-in-out;
  filter: drop-shadow(6px 8px 8px rgba(0,0,0,0.25));
  z-index: 2;

  &:hover {
    transform: translate(0, 0);
  }
`;

const RightContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: 40px;
  width: 100%;
  max-width: 40%;
  position: relative;
  z-index: 10;
  margin-top: 40px;
  margin-bottom: 40px;

  @media screen and (max-width: 800px) {
    max-width: 100%;
    margin-right: 20px;
    margin-left: 20px;
    margin-bottom: 320px;
  }
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-sizing: border-box;
  box-shadow: 14px 14px 60px -20px rgba(0, 0, 0, 0.25);
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }

  h1 {
    font-family: Montserrat, sans-serif;
    padding-bottom: 0px;
    font-size: 32px;
    line-height: 36px;
    font-weight: 700;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 18px;
    line-height: 24px;
    font-weight: 400;
    margin: 0 0 10px 0;
  }
`;

const Dropzone = styled.div`
  margin-top: 20px;
  width: 100%;
  height: 80px;
  border-radius: 6px;
  border: 1px dashed #cccccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: #848484;
  text-align: center;
`;

const WebcamButton = styled.a`
  margin: 20px auto 0 auto;
  background-color: #3898EC;
  color: #ffffff;
  text-align: center;
  padding: 8px 12px;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #338ad6;
  }
`;

const AttributionLink = styled.a`
  font-size: 12px;
  color: #949494;
`;

export default function IndexPage() {
  const [showMessage, setShowMessage] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [showCan, setShowCan] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  function handleOpenPanel() {
    setShowMessage(true);
    setShowCan(false);
    setIsMatch(false);
  }

  function handleClosePanel() {
    setShowMessage(false);
  }

  function handleShowIssue() {
    setShowIssue(true);
  }

  function handleCloseIssue() {
    setShowIssue(false);
    setUploadedImage(null);
  }

  function handleMatch() {
    setIsMatch(true);
    setTimeout(() => {
      setShowCan(true);
    }, 1000);
  }

  const onDrop = useCallback(acceptedFiles => {
    setUploadedImage(acceptedFiles[0]);
    setShowIssue(true);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: 'image/*',
    onDrop
  });

  return (
    <>
      <Header>
        <StyledCarStashLogo src={`/images/carstash.png`} />
        <SellerStyled>
            <InputColumnWrapper>Require</InputColumnWrapper>
            <InputColumnWrapper><input type="checkbox"></input>&nbsp;Over 18</InputColumnWrapper>
            <InputColumnWrapper><input type="checkbox"></input>&nbsp;Facial Recognition</InputColumnWrapper>
            <InputColumnWrapper>
            </InputColumnWrapper>
        </SellerStyled>
        <VendingMachineWrapper className={isMatch && `anim-shake`}>
          <CarStyled src={`/images/car.svg`} />
          {showCan && (
            <div style={{marginLeft:"340px"}}>
            <CarKey src={`/images/carkey.svg`} />
            </div>
          )}
        </VendingMachineWrapper>

        <HandWrapper onClick={handleOpenPanel} />

        <RightContentWrapper>
          <RightContent>
            <h1>Stash Vehicle Access Demo</h1>
            <p>
              An example of Zero-Knowledge Credentials.
            </p>
            <p>
              Image that you are selling your car. Select your selling requirements above the car. 
              You can select age restriction or facial recognition.
            </p>
            <p>
              Next, imagine that you are now the buyer. You need to acquire the proofs
              the seller requires.
            </p>
            <p>
              To try for yourself, issue your own proof credentials below and download it. 
              Next, click the “Buy” button in the bottom left corner and upload your proofs to present them to the seller. 
              If your face matches the picture in your proof credential, you get the key to the car!
            </p>
            <p>
              You can read more about the technical details of this demo in the <a href="https://github.com/docknetwork/linked-biometrics-demo">GitHub repository</a>.
            </p>
          </RightContent>

          <RightContent>
            <h1>Get your Credential Proofs</h1>
            <p>
              This demo will accept credentials issued by you. Normally you would have to get these from
              a trusted identity issuer.
              Upload or take a clear picture of yourself to download your own credential for verification.
              Once downloaded, click the “Buy” button to test the demo. No PII is stored on the blockchain for this demo.
            </p>
            <Dropzone {...getRootProps()}>
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <>Drop the file here...</> :
                  <>Drop your picture here<br />or click to upload</>
              }
            </Dropzone>
            <WebcamButton onClick={handleShowIssue}>
              Issue using webcam
            </WebcamButton>
          </RightContent>
        </RightContentWrapper>
      </Header>

      <CSSTransition
        in={showMessage}
        timeout={300}
        classNames="fancy-transition"
        unmountOnExit
      >
        <Panel onClose={handleClosePanel} onMatch={handleMatch} />
      </CSSTransition>

      <CSSTransition
        in={showIssue}
        timeout={300}
        classNames="fancy-transition"
        unmountOnExit
      >
        <IssuePanel onClose={handleCloseIssue} uploadedImage={uploadedImage} />
      </CSSTransition>
    </>
  )
}
