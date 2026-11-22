import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, MessageSquare, Settings, X } from 'lucide-react';
import { HuggingFaceAIService } from '../services/huggingFaceService';
import { Conversation, Message } from '../services/simpleDatabaseService';
import { createDatabaseService, DatabaseService } from '../services/DatabaseServiceFactory';

interface AIChatContainerProps {
  hfApiKey: string;
  model?: string;
  onSaveApiKey?: (apiKey: string) => void;
}

const AIChatContainer: React.FC<AIChatContainerProps> = ({ hfApiKey, model = 'microsoft/DialoGPT-large', onSaveApiKey }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [tempApiKey, setTempApiKey] = useState(hfApiKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hfService = new HuggingFaceAIService(tempApiKey);
  const dbService: DatabaseService = createDatabaseService(); // Use localStorage by default

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = () => {
    const convs = dbService.getAllConversations();
    setConversations(convs);
    if (convs.length > 0 && !currentConversation) {
      selectConversation(convs[0]);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    const msgs = dbService.getMessagesByConversationId(conversation.id);
    setMessages(msgs);
  };

  const createNewConversation = () => {
    const title = `Chat ${new Date().toLocaleString()}`;
    const newConv = dbService.createConversation(title);
    setConversations([...dbService.getAllConversations()]);
    selectConversation(newConv);
  };

  const deleteConversation = (id: string) => {
    dbService.deleteConversation(id);
    const updatedConvs = dbService.getAllConversations();
    setConversations(updatedConvs);

    if (currentConversation?.id === id) {
      if (updatedConvs.length > 0) {
        selectConversation(updatedConvs[0]);
      } else {
        setCurrentConversation(null);
        setMessages([]);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Create a new conversation if none exists
    let conv = currentConversation;
    if (!conv) {
      conv = dbService.createConversation(`Chat ${new Date().toLocaleString()}`);
      setConversations([...dbService.getAllConversations()]);
      setCurrentConversation(conv);
    }

    if (!conv) return;

    // Add user message to UI and DB
    const userMessage = dbService.createMessage(conv.id, 'user', inputMessage);
    setMessages(prev => [...prev, userMessage]);

    setInputMessage('');
    setIsLoading(true);

    try {
      // Get previous messages for context
      const contextMessages = dbService.getMessagesByConversationId(conv.id)
        .slice(-6) // Use last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);

      // Get AI response
      const aiResponse = await hfService.chat(inputMessage, model, contextMessages);

      // Add AI message to UI and DB
      const aiMessage = dbService.createMessage(conv.id, 'assistant', aiResponse.response);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = dbService.createMessage(
        conv.id,
        'assistant',
        'Sorry, I encountered an error processing your request.'
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl overflow-hidden flex-col md:flex-row">
      {/* Sidebar for conversations - Collapsible on mobile */}
      <div className={`bg-[var(--bg-tertiary)] border-r border-[var(--border)] flex-col flex-shrink-0 md:w-64 transition-all duration-300 ${showConversations ? 'flex' : 'hidden'
        } md:flex`}>
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <h3 className="font-semibold">Chats</h3>
          <button
            className="md:hidden text-[var(--text-secondary)]"
            onClick={() => setShowConversations(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MessageSquare size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-2 py-3">Recent Chats</h3>
            {conversations.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] px-2 py-4">No chats yet</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv: Conversation) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentConversation && currentConversation.id === conv.id
                        ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30'
                        : 'hover:bg-[var(--bg-tertiary)]'
                      }`}
                    onClick={() => {
                      selectConversation(conv);
                      setShowConversations(false); // Close sidebar on mobile after selection
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-primary)] rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header with toggle button */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center justify-between md:hidden">
          <button
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]"
            onClick={() => setShowConversations(true)}
          >
            <MessageSquare size={20} />
          </button>
          <h2 className="text-lg font-semibold truncate flex-1 text-center">
            {currentConversation ? currentConversation.title : 'AI Assistant'}
          </h2>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]"
          >
            <Settings size={20} />
          </button>
        </div>

        {currentConversation ? (
          <>
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-tertiary)] hidden md:flex items-center justify-between">
              <h2 className="text-lg font-semibold truncate">{currentConversation.title}</h2>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]"
              >
                <Settings size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <Bot size={48} className="mb-4 opacity-50" />
                  <p className="text-center">Send a message to start chatting with the AI</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                        <Bot size={18} className="text-[var(--accent-primary)]" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                          ? 'bg-[var(--accent-primary)]/20 rounded-tr-none'
                          : 'bg-[var(--bg-tertiary)] rounded-tl-none'
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-blue-400" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-[var(--accent-primary)]" />
                  </div>
                  <div className="bg-[var(--bg-tertiary)] rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-8">
            <Bot size={64} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-center max-w-md mb-6">
              Start a new chat to interact with the AI assistant powered by Hugging Face models
            </p>
            <button
              onClick={createNewConversation}
              className="flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-6 py-3 rounded-xl transition-colors"
            >
              <MessageSquare size={20} />
              Start New Chat
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 resize-none"
              rows={2}
              disabled={isLoading || !hfApiKey}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || !hfApiKey}
              className="self-end bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] disabled:bg-[var(--accent-primary)]/30 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          {!hfApiKey && (
            <p className="text-xs text-amber-500 mt-2">
              Please provide a Hugging Face API key to enable AI chat
            </p>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">API Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Hugging Face API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your Hugging Face API key"
                  className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Get your API key from{' '}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-primary)] hover:underline"
                  >
                    Hugging Face Settings
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    if (onSaveApiKey) {
                      onSaveApiKey(tempApiKey);
                    }
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatContainer;