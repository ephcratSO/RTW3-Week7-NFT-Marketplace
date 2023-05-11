import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { useQuery } from "@tanstack/react-query";

export default function NFTPage(props) {
  const params = useParams();
  const tokenId = params.tokenId;
  const [message, updateMessage] = useState("");

  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // <- this promps user to connect metamask
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    //create an NFT Token
    var tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };
    console.log(item);
    console.log("address", addr);
    return { item, addr };
  }

  const { data, isLoading } = useQuery(["nftData", tokenId], () =>
    getNFTData(tokenId)
  );

  async function buyNFT(tokenId) {
    try {
      if (!data) return;
      const ethers = require("ethers");
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // <- this promps user to connect metamask
      const signer = provider.getSigner();
      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      const salePrice = ethers.utils.parseUnits(data.item.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      //run the executeSale function
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  if (isLoading) return <div style={{ "min-height": "100vh" }}>Loading...</div>;
  if (typeof data.item.image == "string")
    data.item.image = GetIpfsUrlFromPinata(data.item.image);

  return (
    <div style={{ "min-height": "100vh" }}>
      <Navbar></Navbar>
      <div className="flex ml-20 mt-20">
        <img src={data.item.image} alt="" className="w-2/5" />
        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.item.name}</div>
          <div>Description: {data.item.description}</div>
          <div>
            Price: <span className="">{data.item.price + " ETH"}</span>
          </div>
          <div>
            Owner: <span className="text-sm">{data.item.owner}</span>
          </div>
          <div>
            Seller: <span className="text-sm">{data.item.seller}</span>
          </div>
          <div>
            {data.item.addr != data.item.owner &&
            data.item.addr != data.item.seller ? (
              <button
                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => buyNFT(tokenId)}
              >
                Buy this NFT
              </button>
            ) : (
              <div className="text-emerald-700">
                You are the owner of this NFT
              </div>
            )}

            <div className="text-green text-center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
