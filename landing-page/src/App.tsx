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
        <div className="grid grid-cols-1 md:grid-cols-3 w-1/2 justify-center mx-auto">
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
      </div>
    </div>
  );
}
export default App
