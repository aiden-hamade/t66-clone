import { useState } from 'react'
import wip from './assets/wip.webp'
import './App.css'

function App() {

  const links = [
    { title: 'Documentation', url: 'https://example.com/docs' },
    { title: 'GitHub Repo', url: 'https://github.com/aiden-hamade/t66-clone' },
    { title: 'Live Demo', url: 'https://example.com/demo' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 text-white/70 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <img src={wip} alt="Work in Progress" className="w-12 h-10" />
          Work in Progress</div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">T66-Chat</h1>
          <p className="text-white">
            Welcome to T66-Chat, an LLM chat interface to be entered into the T3 Chat Cloneathon.<br></br>
            The name inspired by Palpatine's Order 66, where the clones were programmed to kill the Jedi.<br></br>
            Below are quick links to documentation, source code, and a live demo.
          </p>
        </div>

        {/* Link boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-1/2 justify-center mx-auto mb-16">
          {links.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-200 p-6 text-center mx-auto"
            >
              <h2 className="text-2xl font-semibold text-indigo-600 mb-2">{link.title}</h2>
              <p className="text-gray-500">Visit {link.title.toLowerCase()}</p>
            </a>
          ))}
        </div>
        <div className="mb-16">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 w-2/3 mx-auto text-center">
            <h2 className="text-3xl font-semibold text-white mb-4">Stay Tuned!</h2>
            <p className="text-white/70">
              This project is currently a work in progress. Check back soon for updates!
            </p>
          </div>
        </div>
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Features</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 w-2/3 mx-auto text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-white mb-2">Feature 1</h3>
                <p className="text-white/70">Description of feature 1 goes here.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-white mb-2">Feature 2</h3>
                <p className="text-white/70">Description of feature 2 goes here.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-white mb-2">Feature 3</h3>
                <p className="text-white/70">Description of feature 3 goes here.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-white mb-2">Feature 4</h3>
                <p className="text-white/70">Description of feature 4 goes here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App
