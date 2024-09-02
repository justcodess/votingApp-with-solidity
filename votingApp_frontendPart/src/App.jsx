import React, { useState, useEffect } from "react";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useDisconnect,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { ethers } from "ethers";

// 1. Get projectId
const projectId = "30559d369281cf445a0391696e611468";

// 2. Set chains
const testnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://rpc.sepolia.org",
};

// 3. Create a metadata object
const metadata = {
  name: "Voting dApp",
  description: "A decentralized voting application",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 11155111, // SEPOLIA
});

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [testnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

function App() {
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useWeb3ModalAccount();

  const [places, setPlaces] = useState([]);
  const [winner, setWinner] = useState(null);
  const [votingActive, setVotingActive] = useState(true);
  const [contract, setContract] = useState(null);
  const [users, setUsers] = useState([]);

  const contractAddress = "0x77a3CC4D362B4fA1EFC4D419441Dac5e7d4eD1aD"; // Deploy edilen sözleşmenin adresi
  const contractABI = [
    {
      inputs: [],
      name: "finishVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "startVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string[]",
          name: "_places",
          type: "string[]",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "voteIndex",
          type: "uint256",
        },
      ],
      name: "vote",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "_userAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "placeIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "money",
          type: "uint256",
        },
      ],
      name: "Voted",
      type: "event",
    },
    {
      stateMutability: "payable",
      type: "fallback",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
    {
      inputs: [],
      name: "getAllPlaces",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "voteNumber",
              type: "uint256",
            },
          ],
          internalType: "struct VotePlaces.Place[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllUsers",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
            {
              internalType: "bool",
              name: "hasVoted",
              type: "bool",
            },
            {
              components: [
                {
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
                {
                  internalType: "uint256",
                  name: "voteNumber",
                  type: "uint256",
                },
              ],
              internalType: "struct VotePlaces.Place",
              name: "votedPlace",
              type: "tuple",
            },
          ],
          internalType: "struct VotePlaces.User[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getWinnerPlace",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "voteNumber",
              type: "uint256",
            },
          ],
          internalType: "struct VotePlaces.Place",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "hasVoted",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "isVoteActive",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "moneyAddress",
      outputs: [
        {
          internalType: "address payable",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "places",
      outputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "voteNumber",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "users",
      outputs: [
        {
          internalType: "address",
          name: "userAddress",
          type: "address",
        },
        {
          internalType: "bool",
          name: "hasVoted",
          type: "bool",
        },
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "voteNumber",
              type: "uint256",
            },
          ],
          internalType: "struct VotePlaces.Place",
          name: "votedPlace",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  useEffect(() => {
    connectContract();
  }, [isConnected]);

  const connectContract = async () => {
    // Cüzdan bağlı olduğunda sözleşmeyi yükle
    if (isConnected) {
      const provider = new ethers.BrowserProvider(window.ethereum); //sağlayıcı metamask
      const signer = await provider.getSigner(); // signer wallet
      // iletişime geçeceğim contract
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      console.log("contract: ", contract);
      setContract(contract); // contractımızı değişkene'e atıyoruz

      // Cüzdana bağlanır bağlanmaz mekanları yükle
      loadPlaces(contract);
      loadUsers(contract);
      checkVotingStatus(contract);
    }
  };

  // Mekanları yükleme fonksiyonu
  const loadPlaces = async (contract) => {
    const places = await contract.getAllPlaces();
    console.log("places:", places);
    setPlaces(places);
  };

  // Kullanıcıları yükleme fonksiyonu
  const loadUsers = async (contract) => {
    const users = await contract.getAllUsers();
    console.log("users: ", users);
    setUsers(users);
  };

  // Oylamanın aktif olup olmadığını kontrol et
  const checkVotingStatus = async (contract) => {
    const isActive = await contract.isVoteActive();
    console.log("isActive: ", isActive);
    setVotingActive(isActive);
  };

  // Oy verme fonksiyonu
  const vote = async (voteIndex) => {
    try {
      const transaction = await contract.vote(voteIndex, {
        value: ethers.parseEther("0.001"),
      });
      await transaction.wait();

      loadPlaces(contract);
      loadUsers(contract);
    } catch (error) {
      alert(error.reason);
    }
  };

  // Oylamayı bitirme fonksiyonu
  const finishVote = async () => {
    const transaction = await contract.finishVote();
    await transaction.wait();

    checkVotingStatus(contract);
  };
  const startVote = async () => {
    const transaction = await contract.startVote();
    await transaction.wait();

    checkVotingStatus(contract);
  };

  // Kazananı alma fonksiyonu
  const getWinnerPlace = async () => {
    const winner = await contract.getWinnerPlace();
    setWinner(winner);
  };

  return (
    <div className="p-2 flex flex-col items-center">
      <h1 className="text-center font-bold text-2xl mb-4">Voting dApp</h1>
      {!isConnected && (
        <button
          onClick={open}
          className="bg-blue-500 text-white px-3 py-2 rounded-md mt-4"
        >
          Cüzdanı Bağla
        </button>
      )}
      {isConnected && (
        <>
          <button
            onClick={disconnect}
            className="text-white bg-red-500 px-2 py-2 rounded-md"
          >
            Bağlantıyı Kes
          </button>
          <h3 className="mt-2 mb-4 text-lg font-medium">
            Hoş geldin, {address}
          </h3>

          {votingActive ? <p>Oylama devam ediyor.</p> : <p>Oylama Bitti</p>}

          {votingActive ? (
            <button
              onClick={finishVote}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Oylamayı Bitir (Sadece Owner)
            </button>
          ) : (
            <button
              onClick={startVote}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md"
            >
              Oylamayı başlat (Sadece Owner)
            </button>
          )}

          <div className="places w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Mekanlar</h2>
            {places?.length > 0 ? (
              places?.map((place, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-md p-4 mb-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{place.name}</h3>
                      <p className="text-sm text-gray-600">
                        Oy Sayısı: {parseInt(place.voteNumber)}
                      </p>
                    </div>

                    <button
                      onClick={() => vote(index)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md"
                    >
                      Oy Ver
                    </button>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-sm font-semibold">Oy Verenler:</h4>

                    {users.map((user, userIndex) => (
                      <p key={userIndex} className="text-xs text-gray-500">
                        {user.votedPlace.name === place.name
                          ? user.userAddress
                          : ""}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>Mekanlar yükleniyor...</p>
            )}
          </div>

          {!votingActive && (
            <>
              <button
                onClick={getWinnerPlace}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
              >
                Kazananı Gör
              </button>
              {winner && (
                <div className="winner mt-4 p-4 bg-white shadow-md rounded-md">
                  <h2 className="text-xl font-semibold text-green-600">
                    Kazanan: {winner.name}
                  </h2>
                  <p className="text-md">
                    Oy Sayısı: {parseInt(winner.voteNumber, 16)}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="users w-full max-w-md mt-6">
            <h2 className="text-xl font-semibold mb-4">Kullanıcılar</h2>
            {users?.length > 0 ? (
              users?.map((user, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-md p-4 mb-4"
                >
                  <p className="text-sm">
                    {user.userAddress} - Oy Kullanmış:{" "}
                    {user.hasVoted ? "Evet" : "Hayır"}
                  </p>
                </div>
              ))
            ) : (
              <p>Kullanıcılar yükleniyor...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
