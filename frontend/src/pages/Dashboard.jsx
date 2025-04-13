import React, { useEffect, useState } from "react";
import { LogOut, X } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading_animation.json";
import musicLogo from '../assets/Music_logo.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const musicEndpoint = "https://548gthscc2.execute-api.us-east-1.amazonaws.com/default/Lambda_Music";
const subscriptionEndpoint = "https://wqvg0mm0h6.execute-api.us-east-1.amazonaws.com/default/subscriptions";

export default function Dashboard() {
  const [musicList, setMusicList] = useState([]);
  const [searchFields, setSearchFields] = useState({ title: "", artist: "", album: "", year: "" });
  const [loading, setLoading] = useState(false);
  const [subscribedSongs, setSubscribedSongs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const username = localStorage.getItem("userName") || "Guest";
  const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      // Clear everything and redirect
      localStorage.clear();
      window.location.href = "/";
    } else {
      setIsAuthenticated(true);
      fetchSubscriptions();
      fetchAllMusic();
    }
  
    // Prevent browser from using cached version after logout
    window.onpageshow = function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    };
  }, []);
  
  
  const fetchAllMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch(musicEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query_music" })
      });
      const data = await response.json();
      const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      const subsResponse = await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_subscriptions", user_email: userEmail })
      });
      const subsData = await subsResponse.json();
      const subscriptions = subsData?.body?.subscriptions || [];

      const subscribedKeys = subscriptions.map(item => `${item.song_title}#${item.artist}`);
      if (parsed.status === "success" && Array.isArray(parsed.items)) {
        const filtered = parsed.items.filter(
          m => !subscribedKeys.includes(`${m.title}#${m.artist}`)
        );
        setMusicList(filtered);
      }
    } catch (error) {
      console.error("Error fetching music or subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_subscriptions", user_email: userEmail })
      });
      const data = await response.json();
      const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      if (parsed.status === "success") {
        setSubscribedSongs(parsed.subscriptions);
      }
    } catch (err) {
      console.error("❌ Error fetching subscriptions:", err);
    }
  };

  const handleSubscribe = async (music) => {
    const songKey = `${music.title}#${music.artist}`;
    const alreadySubscribed = subscribedSongs.some(
      item => `${item.song_title}#${item.artist}` === songKey
    );
    if (alreadySubscribed) {
      toast.info("Already subscribed!");
      return;
    }

    const updatedSubscriptions = [...subscribedSongs, {
      song_title: music.title,
      artist: music.artist,
      album: music.album,
      year: music.year,
      image_url: music.image_url,
    }];
    const updatedMusicList = musicList.filter(
      item => `${item.title}#${item.artist}` !== songKey
    );

    setSubscribedSongs(updatedSubscriptions);
    setMusicList(updatedMusicList);
    toast.success("Subscribed!");

    try {
      await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          user_email: userEmail,
          song_title: music.title,
          artist: music.artist,
          year: music.year,
          album: music.album || "",
          image_url: music.image_url || "",
        })
      });
    } catch (error) {
      console.error("❌ Backend subscription error:", error);
    }
  };

  const handleUnsubscribe = async (music) => {
    const songKey = `${music.song_title}#${music.artist}`;
    const updatedSubscriptions = subscribedSongs.filter(
      item => `${item.song_title}#${item.artist}` !== songKey
    );
    const updatedMusicList = [...musicList, {
      title: music.song_title,
      artist: music.artist,
      year: music.year,
      album: music.album || "",
      image_url: music.image_url || "",
    }];

    setSubscribedSongs(updatedSubscriptions);
    setMusicList(updatedMusicList);
    toast.success("Unsubscribed!");

    try {
      await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unsubscribe",
          user_email: userEmail,
          song_title: music.song_title,
          artist: music.artist,
          year: music.year,
        })
      });
    } catch (error) {
      console.error("❌ Backend unsubscribe error:", error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const query = {
      action: "query_music",
      ...Object.fromEntries(Object.entries(searchFields).filter(([_, v]) => v))
    };
    try {
      const response = await fetch(musicEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query)
      });
      const data = await response.json();
      const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      if (parsed.status === "success" && Array.isArray(parsed.items)) {
        const subscribedKeys = subscribedSongs.map(item => `${item.song_title}#${item.artist}`);
        const filtered = parsed.items.filter(
          m => !subscribedKeys.includes(`${m.title}#${m.artist}`)
        );
        setMusicList(filtered);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();              // Clear all session data
    sessionStorage.clear();           // Just in case you used sessionStorage
    window.location.href = "/";       // Redirect
  };
  

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100 w-full px-[75px]">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="bg-black shadow p-4 mb-4 mt-6 rounded-2xl flex justify-between items-center">
        <img src={musicLogo} alt="Music Logo" className="w-[100px] h-auto object-contain" />
        <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-xl shadow-md">
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-bold text-black">{username}</span>
            <span className="text-sm text-gray-500">{userEmail}</span>
          </div>
          <button onClick={handleLogout} className="ml-auto text-red-500 hover:text-red-700 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
        {/* Subscribed List */}
        <div className="bg-white p-7 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black mb-1">Subscribed Musics</h2>
          <p className="text-sm text-gray-500 mb-4">Your wish list</p>
          <div className="space-y-3 h-[370px] overflow-y-scroll pr-2">
            {subscribedSongs.map((music, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-xl p-2 justify-between">
                <div className="flex items-center space-x-3">
                  <img src={music.image_url || "https://via.placeholder.com/40"} alt={music.title} className="w-16 h-16 rounded-md object-cover" />
                  <div>
                    <p className="font-semibold text-black leading-none mb-[5px]">{music.song_title} | {music.year}</p>
                    <p className="text-sm text-gray-500 leading-none truncate max-w-[200px]">{music.artist} | {music.album} </p>
                  </div>
                </div>
                <button onClick={() => handleUnsubscribe(music)} className="bg-black text-white p-2 rounded-full hover:bg-red-700 transition">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Search Section */}
        <div className="md:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 bg-white p-7 rounded-2xl shadow">
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-black mb-1">Search Musics</h2>
              <p className="text-sm text-gray-500 mb-4">We have gotten many collections</p>
              <form onSubmit={handleSearch} className="space-y-4">
                {['title', 'artist', 'album', 'year'].map((field) => (
                  <div className="relative w-[90%]" key={field}>
                    <input
                      name={field}
                      value={searchFields[field]}
                      onChange={handleSearchChange}
                      type="text"
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="w-full h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black pr-10"
                    />
                    {searchFields[field] && (
                      <button
                        type="button"
                        onClick={() => setSearchFields(prev => ({ ...prev, [field]: "" }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="submit" className="w-[90%] h-14 bg-black text-white rounded-lg">Search</button>
              </form>
            </div>

            {/* Results Section */}
            <div className="md:w-1/2">
              <h2 className="text-sm text-gray-500 mb-4">Found {musicList.length} results</h2>
              <div className="space-y-3 h-[400px] overflow-y-scroll pr-2">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Lottie animationData={loadingAnimation} loop={true} style={{ height: 150, width: 150 }} />
                  </div>
                ) : musicList.length > 0 ? (
                  musicList.map((music, index) => {
                    const isSubscribed = subscribedSongs.some(
                      item => `${item.song_title}#${item.artist}` === `${music.title}#${music.artist}`
                    );
                    return (
                      <div
                        key={index}
                        className={`flex items-center rounded-xl p-2 justify-between ${
                          isSubscribed ? "bg-gray-200 opacity-60 cursor-not-allowed" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={music.image_url || "https://via.placeholder.com/40"}
                            alt={music.title}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div>
                            <p className="font-semibold text-black leading-none mb-[5px]">{music.title} | {music.year}</p>
                            <p className="text-sm text-gray-500 leading-none truncate max-w-[250px]">{music.artist} | {music.album} </p>
                          </div>
                        </div>
                        <button
                          onClick={() => !isSubscribed && handleSubscribe(music)}
                          className={`text-white p-2 rounded-full transition ${
                            isSubscribed ? "bg-gray-400" : "bg-black hover:bg-green-600"
                          }`}
                          disabled={isSubscribed}
                        >
                          {isSubscribed ? "✔️" : "➕"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400">No music found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
