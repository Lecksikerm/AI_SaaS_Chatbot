import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Bot, User, Menu, Plus, MessageSquare, Trash2, Copy, Check, Loader2, Paperclip, X, FileText, Image as ImageIcon, ChevronDown, LogOut, Crown, Zap, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom'

// Code block component
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
                <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
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
                    lineHeight: '1.5'
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    )
}

// Fast typing indicator
const TypingIndicator = () => (
    <div className="bg-[#444654] border-b border-[#4d4d4f]/30">
        <div className="max-w-3xl mx-auto flex gap-4 p-6">
            <div className="w-8 h-8 rounded bg-[#10a37f] flex items-center justify-center shrink-0">
                <Bot size={18} />
            </div>
            <div className="flex items-center gap-1 h-8">
                <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-bounce" style={{ animationDuration: '0.4s', animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-bounce" style={{ animationDuration: '0.4s', animationDelay: '0.2s' }} />
            </div>
        </div>
    </div>
)

// Fast streaming message with line-by-line rendering and auto-scroll
const StreamingMessage = ({ content, onComplete }) => {
    const [displayedLines, setDisplayedLines] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const messageRef = useRef(null)
    const containerRef = useRef(null)

    // Split content into lines/segments for streaming
    const lines = useCallback(() => {
        if (!content) return []
        // Split by newlines but keep them, or by sentences for smoother flow
        return content.split(/(\n|\. |\? |\! )/).filter(Boolean)
    }, [content])

    useEffect(() => {
        const contentLines = lines()
        if (contentLines.length === 0) return

        // Reset when content changes significantly (new response)
        if (currentIndex > contentLines.length) {
            setCurrentIndex(0)
            setDisplayedLines([])
        }

        // Fast streaming: add multiple characters/words at once
        const streamInterval = setInterval(() => {
            setCurrentIndex(prev => {
                const next = prev + 1
                if (next >= contentLines.length) {
                    clearInterval(streamInterval)
                    setTimeout(() => onComplete?.(), 100)
                    return prev
                }

                // Update displayed lines
                setDisplayedLines(contentLines.slice(0, next))

                // Auto-scroll to bottom
                if (messageRef.current) {
                    messageRef.current.scrollIntoView({ behavior: 'auto', block: 'end' })
                }
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight
                }

                return next
            })
        }, 15) // Very fast: 15ms per chunk

        return () => clearInterval(streamInterval)
    }, [content, lines, onComplete, currentIndex])

    // Display full content when done
    const displayContent = displayedLines.join('')

    return (
        <div ref={messageRef} className="bg-[#444654] border-b border-[#4d4d4f]/30">
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
                                    <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm font-mono text-[#e6e6e6]" {...props}>
                                        {children}
                                    </code>
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
                        {displayContent}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-5 bg-[#10a37f] ml-1 animate-pulse" />
                </div>
            </div>
        </div>
    )
}

// Regular chat message
const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user'
    return (
        <div className={`${isUser ? 'bg-[#343541]' : 'bg-[#444654]'} border-b border-[#4d4d4f]/30`}>
            <div className="max-w-3xl mx-auto flex gap-4 p-6">
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isUser ? 'bg-purple-600' : 'bg-[#10a37f]'}`}>
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="flex-1 min-w-0">
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
                                        <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm font-mono text-[#e6e6e6]" {...props}>
                                            {children}
                                        </code>
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

// Scroll button
const ScrollToBottomButton = ({ onClick, visible }) => {
    if (!visible) return null
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-8 z-40 bg-[#40414f] hover:bg-[#4d4d4f] text-white p-2 rounded-full shadow-lg border border-[#4d4d4f] transition-all animate-bounce"
            title="Scroll to bottom"
        >
            <ChevronDown size={20} />
        </button>
    )
}

// Upgrade card
const UpgradeCard = ({ user }) => {
    const navigate = useNavigate()
    if (!user || user.role !== 'free') return null

    const percentage = (user.message_count / user.message_limit) * 100
    const isNearLimit = percentage >= 80

    return (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-purple-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <Sparkles size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-0.5">Upgrade to Pro</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Get unlimited messages and priority access
                    </p>
                </div>
            </div>

            <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Usage</span>
                    <span className={isNearLimit ? 'text-orange-400 font-medium' : 'text-gray-400'}>
                        {user.message_count}/{user.message_limit}
                    </span>
                </div>
                <div className="w-full bg-[#343541] rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-[#10a37f] to-[#0d8c6d]'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
                {isNearLimit && (
                    <p className="text-xs text-orange-400 mt-1.5 flex items-center gap-1">
                        <Zap size={12} /> Almost at limit
                    </p>
                )}
            </div>

            <button
                onClick={() => navigate('/payment')}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-white hover:bg-gray-100 text-gray-900 py-2 rounded-md transition-all duration-200"
            >
                <Crown size={14} className="text-yellow-600" />
                Upgrade Now
            </button>
        </div>
    )
}

// Pro badge
const ProBadge = ({ user }) => {
    if (!user || user.role !== 'pro') return null

    return (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shrink-0">
                    <Crown size={16} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Pro Plan</h3>
                    <p className="text-xs text-gray-400">Unlimited access</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
        </div>
    )
}

// Usage bar
const UsageBar = ({ user }) => {
    if (!user || user.role === 'free') return null

    const percentage = (user.message_count / user.message_limit) * 100
    const isNearLimit = percentage >= 80

    return (
        <div className="px-3 py-2 border-t border-[#4d4d4f]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Usage</span>
                <span className={isNearLimit ? 'text-orange-400' : ''}>
                    {user.message_count}/{user.message_limit}
                </span>
            </div>
            <div className="w-full bg-[#343541] rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full transition-all ${isNearLimit ? 'bg-orange-500' : 'bg-[#10a37f]'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    )
}

// Helper to summarize conversation title
const summarizeTitle = (title) => {
    if (!title) return 'New Chat';

    // Remove quotes and extra spaces
    let clean = title.replace(/["']/g, '').trim();

    // If it's a question, take first part before question mark
    if (clean.includes('?')) {
        clean = clean.split('?')[0] + '?';
    }

    // Limit to 25 characters
    if (clean.length > 25) {
        clean = clean.substring(0, 25) + '...';
    }

    return clean || 'New Chat';
};

// Main Chat component
function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [conversations, setConversations] = useState([])
    const [currentConvId, setCurrentConvId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [attachedFiles, setAttachedFiles] = useState([])
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(true)
    const [error, setError] = useState(null)

    const { user, logout, api } = useAuth()
    const navigate = useNavigate()

    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const streamingMessageRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [input])

    // Aggressive auto-scroll effect
    useEffect(() => {
        if ((isAtBottom || isStreaming || isLoading) && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isLoading, isStreaming, streamingContent, isAtBottom])

    // Track scroll position
    useEffect(() => {
        const container = messagesContainerRef.current
        if (!container) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container
            const atBottom = scrollHeight - scrollTop - clientHeight < 100
            setIsAtBottom(atBottom)
            setShowScrollButton(!atBottom)
        }

        container.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => container.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToBottom = () => {
        setIsAtBottom(true)
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }

    useEffect(() => {
        if (user) loadConversations()
    }, [user])

    const loadConversations = async () => {
        try {
            const res = await api.get('/conversations')
            setConversations(res.data.conversations || [])
        } catch (err) {
            console.error('Failed to load conversations:', err)
        }
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024)
        setAttachedFiles(prev => [...prev, ...validFiles])
    }

    const removeFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index))
    }

    // Simulate streaming for demo (replace with actual SSE when backend supports it)
    const sendMessage = async () => {
        if ((!input.trim() && attachedFiles.length === 0) || isLoading || isStreaming) return

        const userMsg = input.trim()
        setInput('')
        setError(null)
        setIsAtBottom(true)

        const newMessage = {
            role: 'user',
            content: userMsg,
            files: attachedFiles.map(f => ({ name: f.name, type: f.type })),
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, newMessage])
        setAttachedFiles([])
        setIsLoading(true)

        // Immediate scroll
        setTimeout(() => scrollToBottom(), 10);

        try {
            const formData = new FormData()
            formData.append("message", userMsg)
            formData.append("use_memory", "true")

            if (currentConvId) {
                formData.append("conversation_id", currentConvId)
            }

            attachedFiles.forEach(file => {
                formData.append("files", file)
            })

            const res = await api.post('/chat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (res.data.error) throw new Error(res.data.error)

            if (!currentConvId) {
                setCurrentConvId(res.data.conversation_id)
                loadConversations()
            }

            setIsLoading(false)
            setIsStreaming(true)

            // Start streaming the response character by character
            const fullResponse = res.data.reply;
            let currentText = '';
            const chars = fullResponse.split('');
            let index = 0;

            const streamInterval = setInterval(() => {
                if (index < chars.length) {
                    // Add 2-3 characters at a time for speed
                    const chunkSize = Math.min(3, chars.length - index);
                    currentText += chars.slice(index, index + chunkSize).join('');
                    setStreamingContent(currentText);
                    index += chunkSize;

                    // Auto-scroll on each update
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                } else {
                    clearInterval(streamInterval);
                    // Complete the stream
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: fullResponse,
                        timestamp: new Date().toISOString()
                    }]);
                    setIsStreaming(false);
                    setStreamingContent('');
                    setIsAtBottom(true);
                }
            }, 10); // Very fast: 10ms per chunk

        } catch (err) {
            setIsLoading(false)
            let errorMsg = 'Could not connect to AI backend'
            const detail = err.response?.data?.detail

            if (detail) {
                if (typeof detail === 'string') errorMsg = detail
                else if (Array.isArray(detail)) errorMsg = detail.map(e => e.msg || String(e)).join(', ')
                else if (typeof detail === 'object') errorMsg = JSON.stringify(detail)
            } else if (err.message) {
                errorMsg = err.message
            }

            setError(errorMsg)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Error: ${errorMsg}`,
                isError: true
            }])
        }
    }

    const handleStreamComplete = () => {
        // This is now handled in the sendMessage function
    }

    const startNewChat = () => {
        setCurrentConvId(null)
        setMessages([])
        setIsLoading(false)
        setIsStreaming(false)
        setStreamingContent('')
        setAttachedFiles([])
        setSidebarOpen(false)
        setIsAtBottom(true)
        setError(null)
    }

    const loadConversation = async (convId) => {
        try {
            setIsLoading(true)
            const res = await api.get(`/history/${convId}`)
            const data = res.data

            const formatted = data.messages.flatMap(msg => [
                { role: 'user', content: msg.user_message, timestamp: msg.timestamp },
                { role: 'assistant', content: msg.bot_reply, timestamp: msg.timestamp }
            ])

            setMessages(formatted)
            setCurrentConvId(convId)
            setSidebarOpen(false)
            setIsAtBottom(true)
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
            await api.delete(`/conversations/${convId}`)
            if (currentConvId === convId) startNewChat()
            loadConversations()
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="h-screen flex bg-[#343541] text-[#ececf1]">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#202123] border-r border-[#4d4d4f] transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col`}>
                <div className="p-3 border-b border-[#4d4d4f]">
                    <button onClick={startNewChat} className="w-full flex items-center gap-2 px-3 py-2 border border-[#4d4d4f] rounded hover:bg-white/5 text-sm">
                        <Plus size={16} /> New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${currentConvId === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                onClick={() => loadConversation(conv.id)}
                            >
                                <MessageSquare size={14} className="shrink-0 text-gray-500" />
                                <span className="truncate text-sm flex-1 min-w-0" title={conv.title}>
                                    {summarizeTitle(conv.title)}
                                </span>
                                <button
                                    onClick={(e) => deleteConversation(e, conv.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    title="Delete conversation"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {user?.role === 'free' ? <UpgradeCard user={user} /> : <ProBadge user={user} />}
                <UsageBar user={user} />

                <div className="p-3 border-t border-[#4d4d4f]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white"
                    >
                        <LogOut size={16} /> Log out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-[#4d4d4f] flex items-center px-4 justify-between">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 mr-2">
                            <Menu size={20} />
                        </button>
                        <h1 className="font-semibold flex items-center gap-2">
                            <Bot className="text-[#10a37f]" size={24} /> AI SaaS Chat
                        </h1>
                    </div>
                    {user?.role === 'pro' && (
                        <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-1 rounded-full">
                            <Crown size={12} /> Pro
                        </span>
                    )}
                </header>

                {error && (
                    <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-4 py-2 text-sm text-center">
                        {error}
                    </div>
                )}

                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto scroll-smooth"
                    style={{ scrollBehavior: 'auto' }}
                >
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
                            {isStreaming && (
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
                                                            <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm font-mono text-[#e6e6e6]" {...props}>
                                                                {children}
                                                            </code>
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
                                                {streamingContent}
                                            </ReactMarkdown>
                                            <span className="inline-block w-2 h-5 bg-[#10a37f] ml-1 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <ScrollToBottomButton onClick={scrollToBottom} visible={showScrollButton} />

                <div className="border-t border-[#4d4d4f] p-4">
                    <div className="max-w-3xl mx-auto">
                        {attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {attachedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-[#40414f] px-3 py-1.5 rounded-lg text-sm">
                                        {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                                        <span className="truncate">{file.name}</span>
                                        <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-400"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                className="hidden"
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white">
                                <Paperclip size={20} />
                            </button>

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
                                placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                                disabled={isLoading || isStreaming}
                                rows={1}
                                className="flex-1 bg-[#40414f] border border-[#4d4d4f] rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#10a37f] transition-colors"
                            />

                            <button
                                onClick={sendMessage}
                                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || isStreaming}
                                className="bg-[#10a37f] hover:bg-[#0d8c6d] disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat