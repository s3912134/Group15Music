import React from "react";
import { LogOut } from "lucide-react";
import musicLogo from '../assets/Music_logo.svg';

export default function HomePage() {
  const dummyMusic = [
    { title: "Blank Space", artist: "Taylor Swift" },
    { title: "Hello!", artist: "Adele" },
    { title: "Baby", artist: "Justin Bieber" },
    { title: "Love Story", artist: "Taylor Swift" },
    { title: "Someone Like You", artist: "Adele" },
    { title: "Sorry", artist: "Justin Bieber" },
    { title: "Shake It Off", artist: "Taylor Swift" },
    { title: "Rolling in the Deep", artist: "Adele" },
    { title: "What Do You Mean?", artist: "Justin Bieber" },
    { title: "You Belong With Me", artist: "Taylor Swift" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 w-full px-[75px]">
      {/* Header */}
      <div className="bg-black shadow p-4 mb-4 mt-6 rounded-2xl flex justify-between items-center">
        {/* Left Logo */}
        <img src={musicLogo} alt="Music Logo" className="w-[100px] h-auto object-contain" />

        {/* Right User Info */}
        <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-xl shadow-md">
          <span>David Billa</span>
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
        {/* Subscribed Musics */}
        <div className="bg-white p-7 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black mb-1">Subscribed Musics</h2>
          <p className="text-sm text-gray-500 mb-4">Your wish list</p>
          <div className="space-y-3">
            {dummyMusic.slice(0, 3).map((music, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 rounded-xl p-2 justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-15 h-15 bg-gray-300 rounded-md"></div>
                  <div>
                    <p className="font-semibold text-black leading-none mb-[5px]">
                      {music.title}
                    </p>
                    <p className="text-sm text-gray-500 leading-none">
                      {music.artist}
                    </p>
                  </div>
                </div>
                <button className="bg-black text-white p-2 rounded-full">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Results Combined in Unified Container */}
        <div className="md:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 bg-white p-7 rounded-2xl shadow">
            {/* Search Form */}
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-black mb-1">Search Musics</h2>
              <p className="text-sm text-gray-500 mb-4">We have gotten many collections</p>
              <form className="space-y-4">
                <input type="text" placeholder="Title" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <input type="text" placeholder="Artist" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <input type="text" placeholder="Album" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <input type="text" placeholder="Year" className="w-[90%] h-14 p-2 border border-gray-300 rounded-lg placeholder-gray-400 text-black" />
                <button type="submit" className="w-[90%] h-14 bg-black text-white rounded-lg">
                  Search
                </button>
              </form>
            </div>

            {/* Search Results */}
            <div className="md:w-1/2">
              <h2 className="text-sm text-gray-500 mb-4">Found 320 results</h2>
              <div className="space-y-3 h-[400px] overflow-y-scroll pr-2">
                {dummyMusic.map((music, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-xl p-2 justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-15 h-15 bg-gray-300 rounded-md"></div>
                      <div>
                        <p className="font-semibold text-black leading-none mb-[5px]">
                          {music.title}
                        </p>
                        <p className="text-sm text-gray-500 leading-none">
                          {music.artist}
                        </p>
                      </div>
                    </div>
                    <button className="bg-black text-white p-2 rounded-full">➕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}