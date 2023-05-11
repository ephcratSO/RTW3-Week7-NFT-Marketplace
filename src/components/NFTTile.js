import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile(data) {
  const newTo = {
    pathname: "/nftPage/" + data.data.tokenId,
  };

  const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

  return (
    <Link to={newTo}>
      <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-64 md:w-96 shadow-2xl overflow-hidden">
        <div style={{ height: "400px", width: "100%" }}>
          <img src={IPFSUrl} alt="" className="w-full h-full object-fill" />
        </div>
        <div className="text-white w-full p-2 bg-black bg-opacity-60 rounded-lg pt-5 -mt-20">
          <strong className="text-xl">{data.data?.name}</strong>
        </div>
      </div>
    </Link>
  );
}

export default NFTTile;
