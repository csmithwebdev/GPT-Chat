'use client'
import { useState, useEffect} from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid' // Import the icon from Heroicons
import ReactMarkdown from 'react-markdown'


export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [displayedResult, setDisplayedResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
      // Start from the beginning
  let i = 0;
  
  const timer = setInterval(() => {
    if (i < result.length) {
      setDisplayedResult((prev) => prev + result.charAt(i));
      i++;
    } else {
      clearInterval(timer);
      setIsTyping(false);
    }
  }, 35); // Speed of typing effect

  // Cleanup on unmount
  return () => {
    clearInterval(timer);
  };
}, [result]);


  async function createIndexAndEmbeddings() {
    try {
      const result = await fetch('/api/setup', {
        method: "POST"
      })
      const json = await result.json()
      console.log('result: ', json)
    } catch (err) {
      console.log('err:', err)
    }
  }

  async function sendQuery() {
    if (!query) return
    setResult('')
    setDisplayedResult('')
    setLoading(false)
    setIsTyping(true) // Start the typing animation
    try {
      const result = await fetch('/api/read', {
        method: "POST",
        body: JSON.stringify(query)
      })
      const json = await result.json()
      setResult(json.data)
      setLoading(false)
    } catch (err) {
      console.log('err:', err)
      setLoading(false)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendQuery();
    }
  }

  const chatBotImageSrc = "https://ws.cuanswers.com/wp-content/uploads/userphoto/12.jpg";

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className='heading'>CU*Answers Chat</h1>
      <div className="relative w-3/5">
        <input 
          placeholder='Ask your question here...' 
          className='text-black px-2 py-1 searchInput pl-10 pr-12' 
          onChange={e => setQuery(e.target.value)} 
          onKeyPress={handleKeyPress} 
        />
        <button 
          onClick={sendQuery} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black p-2 rounded-full"
        >
          <PaperAirplaneIcon className="h-5 w-5 text-white" />
        </button>
      </div>
      {
        loading && <p className='loader'>Asking AI ...</p>
      }

      {isTyping && <p>AI is typing...</p>}

      
<div className="chat-output w-3/5">
        {
          displayedResult && 
            <div className="flex items-start">
                <img src={chatBotImageSrc} alt="chatbot" className="w-10 h-10 rounded-full chatImg" />
                <ReactMarkdown className="result-text ml-4" children={displayedResult} />
            </div>
        }
      </div>

      { /* consider removing this button from the UI once the embeddings are created ... */}
      <button className='embeddings' onClick={createIndexAndEmbeddings}>Create index and embeddings</button>
    </main>
  )
}
