import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Menu, Plus, MessageSquare, Trash2, Copy, Check, Loader2, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const API_URL = 'https://ai-chatbot-58g6.onrender.com'

// Component for code blocks with copy button
const CodeBlock = ({ language, value }) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group my-4 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                <span className="text-xs text-gray-400">{language || 'code'}</span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter
                language={language || 'text'}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: '#1e1e1e',
                    fontSize: '14px',
                    lineHeight: '1.5',
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    )
}

// TYPING INDICATOR
const TypingIndicator = () => (
    <div className="bg-[#444654] border-b border-[#4d4d4f]/30">
        <div className="max-w-3xl mx-auto flex gap-4 p-6">
            <div className="w-8 h-8 rounded bg-[#10a37f] flex items-center justify-center shrink-0">
                <Bot size={18} />
            </div>
            <div className="flex items-center gap-1 h-8">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
        </div>
    </div>
)

// STREAMING MESSAGE
const StreamingMessage = ({ content, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        if (!content) return

        let index = 0
        const chunkSize = 3
        const speed = 8

        const timer = setInterval(() => {
            if (index < content.length) {
                const nextChunk = Math.min(index + chunkSize, content.length)
                setDisplayedText(content.slice(0, nextChunk))
                index = nextChunk
            } else {
                clearInterval(timer)
                onComplete?.()
            }
        }, speed)

        return () => clearInterval(timer)
    }, [content, onComplete])

    return (
        <div className="bg-[#444654] border-b border-[#4d4d4f]/30">
            <div className="max-w-3xl mx-auto flex gap-4 p-6">
                <div className="w-8 h-8 rounded bg-[#10a37f] flex items-center justify-center shrink-0">
                    <Bot size={18} />
                </div>
                <div className="flex-1 min-w-0 prose prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                                ) : (
                                    <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm font-mono text-[#e6e6e6]" {...props}>{children}</code>
                                )
                            },
                            p({ children }) { return <p className="mb-4 leading-7 text-[#ececf1]">{children}</p> },
                            ul({ children }) { return <ul className="mb-4 list-disc pl-6 space-y-2 text-[#ececf1]">{children}</ul> },
                            ol({ children }) { return <ol className="mb-4 list-decimal pl-6 space-y-2 text-[#ececf1]">{children}</ol> },
                            li({ children }) { return <li className="leading-7">{children}</li> },
                            h1({ children }) { return <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1> },
                            h2({ children }) { return <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2> },
                            h3({ children }) { return <h3 className="text-lg font-bold mb-2 mt-4 text-white">{children}</h3> },
                            strong({ children }) { return <strong className="font-semibold text-white">{children}</strong> },
                            blockquote({ children }) { return <blockquote className="border-l-4 border-[#10a37f] pl-4 my-4 italic text-gray-300">{children}</blockquote> },
                        }}
                    >
                        {displayedText}
                    </ReactMarkdown>
                    {displayedText.length < content.length && (
                        <span className="inline-block w-2 h-5 bg-[#10a37f] ml-1 animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    )
}

// REGULAR MESSAGE with file support
const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user'

    return (
        <div className={`${isUser ? 'bg-[#343541]' : 'bg-[#444654]'} border-b border-[#4d4d4f]/30`}>
            <div className="max-w-3xl mx-auto flex gap-4 p-6">
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isUser ? 'bg-purple-600' : 'bg-[#10a37f]'}`}>
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                    {/* Show attached files if any */}
                    {message.files && message.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {message.files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-[#40414f] px-3 py-2 rounded-lg text-sm">
                                    {file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                        <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                                    ) : (
                                        <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm font-mono text-[#e6e6e6]" {...props}>{children}</code>
                                    )
                                },
                                p({ children }) { return <p className="mb-4 leading-7 text-[#ececf1]">{children}</p> },
                                ul({ children }) { return <ul className="mb-4 list-disc pl-6 space-y-2 text-[#ececf1]">{children}</ul> },
                                ol({ children }) { return <ol className="mb-4 list-decimal pl-6 space-y-2 text-[#ececf1]">{children}</ol> },
                                li({ children }) { return <li className="leading-7">{children}</li> },
                                h1({ children }) { return <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1> },
                                h2({ children }) { return <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2> },
                                h3({ children }) { return <h3 className="text-lg font-bold mb-2 mt-4 text-white">{children}</h3> },
                                strong({ children }) { return <strong className="font-semibold text-white">{children}</strong> },
                                blockquote({ children }) { return <blockquote className="border-l-4 border-[#10a37f] pl-4 my-4 italic text-gray-300">{children}</blockquote> },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    )
}

function App() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [conversations, setConversations] = useState([])
    const [currentConvId, setCurrentConvId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [attachedFiles, setAttachedFiles] = useState([]) 

    const [userId] = useState(() => {
        const saved = localStorage.getItem('ai_saas_user_id')
        if (saved) return saved
        const newId = 'user_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('ai_saas_user_id', newId)
        return newId
    })

    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [input])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading, isStreaming, streamingContent])

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        try {
            const res = await fetch(`${API_URL}/conversations/${userId}`)
            const data = await res.json()
            setConversations(data.conversations || [])
        } catch (err) {
            console.error('Failed to load conversations:', err)
        }
    }

    //  Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter(file => {
            const isValid = file.size <= 5 * 1024 * 1024 
            if (!isValid) alert(`${file.name} is too large. Max 5MB.`)
            return isValid
        })
        setAttachedFiles(prev => [...prev, ...validFiles])
    }

    //  Remove attached file
    const removeFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const sendMessage = async () => {
        if ((!input.trim() && attachedFiles.length === 0) || isLoading || isStreaming) return

        const userMsg = input.trim()
        setInput('')

        // Add user message with files
        const newMessage = {
            role: 'user',
            content: userMsg,
            files: attachedFiles.map(f => ({ name: f.name, type: f.type })),
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, newMessage])
        setAttachedFiles([]) 
        setIsLoading(true)

        try {
            // TODO: Upload files to backend if needed
            // For now, just send text
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    user_id: userId,
                    conversation_id: currentConvId,
                    use_memory: true
                })
            })

            const data = await res.json()

            if (!currentConvId) {
                setCurrentConvId(data.conversation_id)
                loadConversations()
            }

            setIsLoading(false)
            setIsStreaming(true)
            setStreamingContent(data.reply)

        } catch (err) {
            console.error('Chat error:', err)
            setIsLoading(false)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Error: Could not connect to AI backend.',
                isError: true
            }])
        }
    }

    const handleStreamComplete = () => {
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: streamingContent,
            timestamp: new Date().toISOString()
        }])
        setIsStreaming(false)
        setStreamingContent('')
    }

    const startNewChat = () => {
        setCurrentConvId(null)
        setMessages([])
        setIsLoading(false)
        setIsStreaming(false)
        setStreamingContent('')
        setAttachedFiles([])
        setSidebarOpen(false)
    }

    const loadConversation = async (convId) => {
        try {
            setIsLoading(true)
            const res = await fetch(`${API_URL}/history/${convId}?user_id=${userId}`)
            const data = await res.json()

            const formatted = data.messages.flatMap(msg => [
                { role: 'user', content: msg.user_message, timestamp: msg.timestamp },
                { role: 'assistant', content: msg.bot_reply, timestamp: msg.timestamp }
            ])

            setMessages(formatted)
            setCurrentConvId(convId)
            setSidebarOpen(false)
        } catch (err) {
            console.error('Failed to load history:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const deleteConversation = async (e, convId) => {
        e.stopPropagation()
        if (!window.confirm('Delete this conversation?')) return

        try {
            await fetch(`${API_URL}/conversations/${convId}?user_id=${userId}`, { method: 'DELETE' })
            if (currentConvId === convId) startNewChat()
            loadConversations()
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    return (
        <div className="h-screen flex bg-[#343541] text-[#ececf1]">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#202123] border-r border-[#4d4d4f] transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col`}>
                <div className="p-3 border-b border-[#4d4d4f]">
                    <button onClick={startNewChat} className="w-full flex items-center gap-2 px-3 py-2 border border-[#4d4d4f] rounded hover:bg-white/5 transition-colors text-sm">
                        <Plus size={16} /> New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div key={conv.id} className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${currentConvId === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => loadConversation(conv.id)}>
                                    <MessageSquare size={14} className="shrink-0 text-gray-400" />
                                    <span className="truncate text-sm">{conv.title}</span>
                                </div>
                                <button onClick={(e) => deleteConversation(e, conv.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-[#4d4d4f]">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">{userId.charAt(0).toUpperCase()}</div>
                        <span className="truncate">{userId}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-[#4d4d4f] flex items-center px-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 mr-2 hover:bg-white/5 rounded"><Menu size={20} /></button>
                    <h1 className="font-semibold flex items-center gap-2"><Bot className="text-[#10a37f]" size={24} /> AI SaaS Chat</h1>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 && !isLoading && !isStreaming ? (
                        <div className="text-center mt-32">
                            <Bot size={64} className="mx-auto text-[#10a37f] mb-4" />
                            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                            <p className="text-gray-400">Start a conversation or upload files</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => <ChatMessage key={idx} message={msg} />)}
                            {isLoading && <TypingIndicator />}
                            {isStreaming && <StreamingMessage content={streamingContent} onComplete={handleStreamComplete} />}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input with File Upload */}
                <div className="border-t border-[#4d4d4f] p-4 bg-[#343541]">
                    <div className="max-w-3xl mx-auto">
                        {/* Attached Files Preview */}
                        {attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {attachedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-[#40414f] px-3 py-1.5 rounded-lg text-sm">
                                        {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-400"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            {/* File Upload Button */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>

                            {/* Textarea with Shift+Enter support */}
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                placeholder={isLoading ? "AI is thinking..." : "Type your message... (Shift+Enter for new line)"}
                                disabled={isLoading || isStreaming}
                                rows={1}
                                className="flex-1 bg-[#40414f] border border-[#4d4d4f] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#10a37f] disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[48px] max-h-[200px]"
                            />

                            <button
                                onClick={sendMessage}
                                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || isStreaming}
                                className="bg-[#10a37f] hover:bg-[#0d8c6d] text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Enter to send • Shift+Enter for new line • Max file size 5MB
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App