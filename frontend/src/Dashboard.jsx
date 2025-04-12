import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "./assets/loading_animation.json";
import musicLogo from './assets/Music_logo.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const musicEndpoint = "https://548gthscc2.execute-api.us-east-1.amazonaws.com/default/Lambda_Music";
const subscriptionEndpoint = "https://wqvg0mm0h6.execute-api.us-east-1.amazonaws.com/default/subscriptions";

export default function Dashboard() {
  const [musicList, setMusicList] = useState([]);
  const [searchFields, setSearchFields] = useState({ title: "", artist: "", album: "", year: "" });
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem("userName") || "Guest";
  const [subscribedSongs, setSubscribedSongs] = useState([]);
  const userEmail = localStorage.getItem("userEmail") || "guest@example.com";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  
  const fetchAllMusic = async () => {
    setLoading(true);
    const userEmail = localStorage.getItem("userEmail");
  
    try {
      // 1. Fetch all music
      const response = await fetch(musicEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query_music" })
      });
      const data = await response.json();
      const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
  
      // 2. Fetch subscriptions
      const subsResponse = await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_subscriptions", user_email: userEmail })
      });
      const subsData = await subsResponse.json();
      const subscriptions = subsData?.body?.subscriptions || [];
  
      const subscribedKeys = subscriptions.map(item => `${item.song_title}#${item.artist}`);
  
      // 3. Filter out already subscribed music
      if (parsed.status === "success" && Array.isArray(parsed.items)) {
        const filtered = parsed.items.filter(
          m => !subscribedKeys.includes(`${m.title}#${m.artist}`)
        );
        setMusicList(filtered);
      } else {
        console.log("No music items found.", parsed);
      }
  
    } catch (error) {
      console.error("Error fetching music list or subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_subscriptions",
          user_email: userEmail
        })
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

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail || userEmail === "guest@example.com") {
      window.location.href = "/";
      return;
    }
  
    setIsAuthenticated(true);
    fetchAllMusic();
    fetchSubscriptions();
  }, []);
  
  if (!isAuthenticated) return null;
  const handleSubscribe = async (music) => {
    const songKey = `${music.title}#${music.artist}`;
    const alreadySubscribed = subscribedSongs.some(
      (item) => `${item.song_title}#${item.artist}` === songKey
    );
  
    if (alreadySubscribed) {
      toast.info("Already subscribed!");
      return;
    }
  
    // 1. Update UI first (optimistic)
    const updatedSubscriptions = [...subscribedSongs, {
      song_title: music.title,
      artist: music.artist,
      album: music.album,
      image_url: music.image_url,
    }];
    const updatedMusicList = musicList.filter(
      (item) => `${item.title}#${item.artist}` !== songKey
    );
  
    setSubscribedSongs(updatedSubscriptions);
    setMusicList(updatedMusicList);
    toast.success("Subscribed!");
  
    // 2. Send request in background
    try {
      await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          user_email: userEmail,
          song_title: music.title,
          artist: music.artist,
          album: music.album || "",
          image_url: music.image_url || "",
        }),
      });
    } catch (error) {
      console.error("❌ Backend subscription error:", error);
    }
  };
  
  const handleUnsubscribe = async (music) => {
    const songKey = `${music.song_title}#${music.artist}`;
  
    // 1. Update UI instantly
    const updatedSubscriptions = subscribedSongs.filter(
      (item) => `${item.song_title}#${item.artist}` !== songKey
    );
    const updatedMusicList = [
      ...musicList,
      {
        title: music.song_title,
        artist: music.artist,
        album: music.album || "",
        image_url: music.image_url || "",
      },
    ];
  
    setSubscribedSongs(updatedSubscriptions);
    setMusicList(updatedMusicList);
    toast.success("Unsubscribed!");
  
    // 2. Send request in background
    try {
      await fetch(subscriptionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unsubscribe",
          user_email: userEmail,
          song_title: music.song_title,
          artist: music.artist,
        }),
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
    localStorage.clear();
    window.location.href = "/";
  };


  return (
    <div className="min-h-screen bg-gray-100 w-full px-[75px]">
      <div className="bg-black shadow p-4 mb-4 mt-6 rounded-2xl flex justify-between items-center">
        <img src={musicLogo} alt="Music Logo" className="w-[100px] h-auto object-contain" />
        <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-xl shadow-md cursor-pointer" onClick={handleLogout}>
          <span>{username}</span>
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
        <div className="bg-white p-7 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black mb-1">Subscribed Musics</h2>
          <p className="text-sm text-gray-500 mb-4">Your wish list</p>
          <div className="space-y-3 h-[370px] overflow-y-scroll pr-2">
          {subscribedSongs.map((music, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-xl p-2 justify-between">
              <div className="flex items-center space-x-3">
                <img src={music.image_url || "https://via.placeholder.com/40"} alt={music.title} className="w-16 h-16 rounded-md object-cover" />
                <div>
                  <p className="font-semibold text-black leading-none mb-[5px]">{music.song_title}</p>
                  <p className="text-sm text-gray-500 leading-none">{music.artist}</p>
                </div>
              </div>
              <button onClick={() => handleUnsubscribe(music)} className="bg-black text-white p-2 rounded-full hover:bg-red-700 transition">🗑️</button>
            </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 bg-white p-7 rounded-2xl shadow">
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-black mb-1">Search Musics</h2>
              <p className="text-sm text-gray-500 mb-4">We have gotten many collections</p>
              <form onSubmit={handleSearch} className="space-y-4">
                <input name="title" value={searchFields.title} onChange={handleSearchChange} type="text" placeholder="Title" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <input name="artist" value={searchFields.artist} onChange={handleSearchChange} type="text" placeholder="Artist" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <input name="album" value={searchFields.album} onChange={handleSearchChange} type="text" placeholder="Album" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <input name="year" value={searchFields.year} onChange={handleSearchChange} type="text" placeholder="Year" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <button type="submit" className="w-[90%] h-14 bg-black text-white rounded-lg">Search</button>
              </form>
            </div>

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
                      (item) => `${item.song_title}#${item.artist}` === `${music.title}#${music.artist}`
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
                            <p className="font-semibold text-black leading-none mb-[5px]">{music.title}</p>
                            <p className="text-sm text-gray-500 leading-none">{music.artist}</p>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}