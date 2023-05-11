import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query";

async function fetchNFTs() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let contract = new ethers.Contract(
    MarketplaceJSON.address,
    MarketplaceJSON.abi,
    signer
  );

  let transaction = await contract.getAllNFTs();

  const items = await Promise.all(
    transaction.map(async (i) => {
      var tokenURI = await contract.tokenURI(i.tokenId);
      tokenURI = GetIpfsUrlFromPinata(tokenURI);
      let meta = await axios.get(tokenURI);
      meta = meta.data;

      let price = ethers.utils.formatUnits(i.price.toString(), "ether");
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };
      return item;
    })
  );

  return items;
}

export default function Marketplace() {
  const { data, isLoading, error } = useQuery(["fetchNfts"], fetchNFTs);

  return (
    <div>
      <Navbar></Navbar>
      <div className="flex flex-col place-items-center mt-20">
        <div className="md:text-xl font-bold text-white">Top NFTs</div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {isLoading ? (
            <span>Loading...</span> // Loading state
          ) : error ? (
            <span>Error: {error.message}</span> // Error state
          ) : data.length === 0 ? (
            <span>No NFTs available</span> // No data state
          ) : (
            data.map((value, index) => {
              return <NFTTile data={value} key={index}></NFTTile>;
            })
          )}
        </div>
      </div>
    </div>
  );
}
