import React, { Suspense, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useEthers } from '@usedapp/core';
import { Canvas } from 'react-three-fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { FullscreenImg } from '../components/fullscreenImg';
import { Fullscreen3d } from '../components/fullscreen3d';
import { Loader } from '../components/loader';
import { NFT_ABI } from '../contract/NFT';
import '../assets/css/sales.scss';

import HAIRPLAY1 from '../assets/img/gallery/HAIRPLAY1.png';
import HAIRPLAY2 from '../assets/img/gallery/HAIRPLAY2.png';
import HAIRPLAY3 from '../assets/img/gallery/HAIRPLAY3.png';
import HAIRPLAY4 from '../assets/img/gallery/HAIRPLAY4.png';
import HAIRPLAY5 from '../assets/img/gallery/HAIRPLAY5.png';
import MONKEYKISS1 from '../assets/img/gallery/MONKEYKISS1.png';
import MONKEYKISS2 from '../assets/img/gallery/MONKEYKISS2.png';
import MONKEYKISS3 from '../assets/img/gallery/MONKEYKISS3.png';
import MONKEYKISS4 from '../assets/img/gallery/MONKEYKISS4.png';
import MONKEYKISS5 from '../assets/img/gallery/MONKEYKISS5.png';
import THOSEEYES1 from '../assets/img/gallery/THOSEEYES1.png';
import THOSEEYES2 from '../assets/img/gallery/THOSEEYES2.png';
import THOSEEYES3 from '../assets/img/gallery/THOSEEYES3.png';
import THOSEEYES4 from '../assets/img/gallery/THOSEEYES4.png';
import THOSEEYES5 from '../assets/img/gallery/THOSEEYES5.png';

const NFT_CONTRACT_ADDRESS = '0xdFB95Fc9D00153e348c32A2cF4B120222ED3Aeb9';

const HAIR_IMAGES = [HAIRPLAY1, HAIRPLAY2, HAIRPLAY3, HAIRPLAY4, HAIRPLAY5];
const KISS_IMAGES = [MONKEYKISS1, MONKEYKISS2, MONKEYKISS3, MONKEYKISS4, MONKEYKISS5];
const EYES_IMAGES = [THOSEEYES1, THOSEEYES2, THOSEEYES3, THOSEEYES4, THOSEEYES5];

const PRESALE_BENEFITS = [
  'Only 66 available for pre-sale.',
  'Available exclusively on our website until March 4, 2022.',
  'Every Memory Mint entitles its holder to their own Memory Vault (coming soon).',
];

const GENERAL_SALE_BENEFITS = [
  '266 available for general sale across all platforms.',
  '34 to be held in reserve.',
  'Every Memory Mint entitles its holder to their own Memory Vault (coming soon).',
];

function ModelViewer({ modelPath, ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    Object.keys(actions).forEach((key) => actions[key]?.play());
  }, [actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

function ModelScene({ type }) {
  const modelPath = type === 'hair' ? '/hair.glb' : type === 'kiss' ? '/kiss.glb' : '/eye.glb';
  const ModelComponent = () => <ModelViewer modelPath={modelPath} />;

  return (
    <Canvas camera={{ position: [0, 0, 50], fov: 50 }}>
      <ambientLight intensity={1} />
      <Suspense fallback={null}>
        <ModelComponent />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

const NFTSeriesCard = React.memo(
  ({
    title,
    mintType,
    amount,
    setAmount,
    images,
    modelType,
    canMint,
    account,
    onMint,
    onSelectImg,
    onShow3dModel,
  }) => (
    <div className="service" id={`service${modelType === 'hair' ? 'Playing' : modelType === 'kiss' ? 'Kiss' : 'Eyes'}`}>
      <div className="pricing-table">
        <div className="left-table">
          <div className="header">
            <p className="title">{title}</p>
            <p className="paragraph">Pre-sale Now Available</p>
          </div>
          <div className="content-top">
            <span>ETH</span>
            <span>.07</span>
            <span>/66</span>
          </div>
          <div className="content-bottom">
            <ul>
              {PRESALE_BENEFITS.map((benefit, i) => (
                <li key={i}><span>{benefit}</span></li>
              ))}
            </ul>
          </div>
          <div className="content-amount">
            <input
              type="number"
              className="nft-amount"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              disabled={!canMint}
            />
          </div>
          <div className="content-btn">
            <a
              href="#"
              className="btn btn-custom"
              onClick={(e) => {
                e.preventDefault();
                onMint(mintType);
              }}>
              {account ? 'MINT' : 'CONNECT WALLET'}
            </a>
          </div>
        </div>
        <div className="right-table">
          <div className="header">
            <p className="title">{title}</p>
            <p className="paragraph">General Sale Begin TBD</p>
          </div>
          <div className="content-top">
            <span>ETH</span>
            <span>.08</span>
            <span>/266</span>
          </div>
          <div className="content-bottom">
            <ul>
              {GENERAL_SALE_BENEFITS.map((benefit, i) => (
                <li key={i}><span>{benefit}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="pricing-view">
        {images.map((img, i) => (
          <img key={i} alt="" src={img} onClick={() => onSelectImg(img)} />
        ))}
        <div className="click-view" onClick={() => onShow3dModel(modelType)}>
          Launch Model
        </div>
      </div>
    </div>
  )
);

NFTSeriesCard.displayName = 'NFTSeriesCard';

export const Sales = () => {
  const [isShowFullscreenImg, setShowFullscreenImg] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isShowFullscreen3d, setShowFullscreen3d] = useState(false);
  const [selected3d, setSelected3d] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hairAmount, setHairAmount] = useState(0);
  const [kissAmount, setKissAmount] = useState(0);
  const [eyesAmount, setEyesAmount] = useState(0);
  const [canMint, setCanMint] = useState(false);

  const { activateBrowserWallet, account, library } = useEthers();

  const handleContractStatus = useCallback(async () => {
    if (!library) return;
    try {
      const web3 = new Web3(library.provider);
      const contract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);
      const [presaleActive, publicSaleActive] = await Promise.all([
        contract.methods.presaleActive().call(),
        contract.methods.publicSaleActive().call(),
      ]);
      setCanMint(Boolean(presaleActive || publicSaleActive));
    } catch {
      setCanMint(false);
    }
  }, [library]);

  useEffect(() => {
    handleContractStatus();
  }, [handleContractStatus, account]);

  const handleMint = useCallback(
    async (type) => {
      if (!account) {
        activateBrowserWallet();
        return;
      }
      const amounts = { 1: hairAmount, 2: kissAmount, 3: eyesAmount };
      const currentAmount = amounts[type] ?? 0;
      if (currentAmount <= 0) {
        toast('Please input amount of NFT which you need to mint!', { type: 'warning' });
        return;
      }
      setIsMinting(true);
      try {
        const web3 = new Web3(library.provider);
        const contract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);
        const price = await contract.methods.currentPrice().call();
        const value = (BigInt(price) * BigInt(currentAmount)).toString();
        await contract.methods.mint(type, currentAmount).send({
          from: account,
          value,
        });
        toast('NFT minted successfully!', { type: 'success' });
      } catch {
        toast('There is problem on minting, Please try again later!', { type: 'error' });
      } finally {
        setIsMinting(false);
      }
    },
    [account, activateBrowserWallet, hairAmount, kissAmount, eyesAmount, library]
  );

  const handleSelectImg = useCallback((img) => {
    setSelectedImg(img);
    setShowFullscreenImg(true);
  }, []);

  const handleShowFullscreen3dModel = useCallback((type) => {
    setSelected3d(<ModelScene type={type} />);
    setShowFullscreen3d(true);
  }, []);

  const seriesConfig = useMemo(
    () => [
      { title: '"PLAYING WITH MY HAIR"', mintType: 1, amount: hairAmount, setAmount: setHairAmount, images: HAIR_IMAGES, modelType: 'hair' },
      { title: '"MONKEY KISS"', mintType: 2, amount: kissAmount, setAmount: setKissAmount, images: KISS_IMAGES, modelType: 'kiss' },
      { title: '"THOSE EYES"', mintType: 3, amount: eyesAmount, setAmount: setEyesAmount, images: EYES_IMAGES, modelType: 'eyes' },
    ],
    [hairAmount, kissAmount, eyesAmount]
  );

  return (
    <div id="sales" className="scroller" style={{ marginTop: '120px' }}>
      <div className="contain">
        <div className="content1">
          <div className="title">THE MEMORY MINT</div>
          <div className="paragraph">THE SOMMER SHIELS COLLECTION</div>
        </div>
        <div className="content2">
          <div className="title">ABOUT THE COLLECTION</div>
          <div className="paragraph">
            Sommer Shiels is a journalist, beauty industry expert and travel blogger. These memories
            were created in 2019 while on-location shooting the documentary, "Origins of Beauty".
          </div>
        </div>
        <div className="content3">
          <div className="title">SERIES A:</div>
          <div className="paragraph1">LIMIT 1098</div>
          <div className="paragraph2">
            "On January 23, 2019, I se sail from lquitos, Peru for the headwaters of the upper
            Ucayali River to meet with a Shipibo-Conibo ayahuasca medicine worker. Once there, I
            made friends with this precious monkey! This little guy clung to me like I was its
            mother, while it played with my hair and made kissing sounds at me. Looking into those
            deep brown eyes immediately takes me back to that most amazing time in my life. I was at
            this village for a little over six hours on this trip, so I'm limiting each of these to
            only 366 immersive NFTs, one for every minute I spent with my monkey friend."
          </div>
        </div>
        <div className="content4">
          {seriesConfig.map((config) => (
            <NFTSeriesCard
              key={config.modelType}
              {...config}
              canMint={canMint}
              account={account}
              onMint={handleMint}
              onSelectImg={handleSelectImg}
              onShow3dModel={handleShowFullscreen3dModel}
            />
          ))}
        </div>
        <div className="content5">
          <div className="series">
            <span>SERIES REWARD:</span>
            <span>Complete an entire series and receive the following:</span>
            <ul>
              <li>Special SERIES NFT awarded only to holders of complete series.</li>
              <li>Access to Sommer's Personal Memory Vault</li>
              <li>Invitation to regular meet and greets with Sommer in her Memory Vault</li>
            </ul>
          </div>
          <div className="collection">
            <span>COLLECTION REWARD:</span>
            <span>Complete an entire colection and receive all of the above PLUS:</span>
            <ul>
              <li>Special COLLECTION NFT awarded only to holders of the complete collection.</li>
              <li>One-on-one chat sessions with Sommer</li>
            </ul>
          </div>
          <div className="roadmap">
            <span>ROADMAP FOR FUTURE RELEASE:</span>
            <ul>
              <li>SERIES B, featuring memories from Sommer's visit to Machu Picchu drops MARCH 11, 2022.</li>
              <li>Special, ultra-rare, one-of-one NFT "Becoming the Brand" announcement on MARCH 11, 2022.</li>
              <li>SERIES C, featuring memories from Sommer's 2019 trip to Tokyo drops MARCH 18, 2022.</li>
              <li>Future series TBA, featuring memories from Sommer's home in Bondi Beach, Australia.</li>
              <li>Special, limited edition drop of Sommer's work-out routine, featuring special guests and celebrity trainers, launching in Q2, 2022.</li>
            </ul>
          </div>
        </div>
        <div className="avatar" />
      </div>
      {isShowFullscreenImg && (
        <FullscreenImg img={selectedImg} closeFullScreen={() => setShowFullscreenImg(false)} />
      )}
      {isShowFullscreen3d && (
        <Fullscreen3d component={selected3d} closeFullScreen={() => setShowFullscreen3d(false)} />
      )}
      {isMinting && <Loader content="Mint in progress..." />}
    </div>
  );
};
