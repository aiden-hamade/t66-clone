import { create } from 'zustand';
import type { Chat, Message, ChatSettings, User, ChatFolder } from '../types';
import { 
  createChat,
  getUserChats,
  getChat,
  updateChat,
  deleteChat as deleteFirestoreChat,
  addMessageToChat,
  updateMessageInChat,
  createFolder,
  getUserFolders,
  updateFolder,
  deleteFolder,
  moveChatToFolder
} from '../lib/firestore';
import { 
  createChatCompletion,
  createStreamingChatCompletion,
  estimateTokenCount,
  isThinkingModel,
  type ChatMessage as OpenRouterMessage
} from '../lib/openrouter';
import { transcribeAudio, synthesizeSpeech, playAudioBlob } from '../lib/openai';
import { AudioRecorder } from '../lib/audioRecording';

export type InputMode = 'text' | 'voice';

interface ChatState {
  chats: Chat[];
  folders: ChatFolder[];
  activeChat: string | null;
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  isSearching: boolean;
  isThinking: boolean;
  thinkingSummary: string;
  error: string | null;
  showContinuePrompt: boolean;
  continueMessageId: string | null;
  user: User | null;
  abortController: AbortController | null;
  
  // Voice mode state
  inputMode: InputMode;
  isRecording: boolean;
  isTranscribing: boolean;
  isSynthesizing: boolean;
  isPlayingAudio: boolean;
  audioRecorder: AudioRecorder | null;
  autoPlayResponses: boolean;
  selectedVoice: string;
}

interface ChatActions {
  setChats: (chats: Chat[]) => void;
  setFolders: (folders: ChatFolder[]) => void;
  setActiveChat: (chatId: string | null) => void;
  setCurrentMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setSearching: (searching: boolean) => void;
  setThinking: (thinking: boolean) => void;
  setThinkingSummary: (summary: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setShowContinuePrompt: (show: boolean) => void;
  setContinueMessageId: (messageId: string | null) => void;
  setUser: (user: User | null) => void;
  stopStreaming: () => void;
  
  // Chat management
  loadUserChats: (userId: string) => Promise<void>;
  loadUserFolders: (userId: string) => Promise<void>;
  createNewChat: (userId: string, title: string, settings: ChatSettings, folderId?: string) => Promise<string>;
  splitChat: (userId: string, chatId: string) => Promise<string>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  updateChatSettings: (chatId: string, settings: ChatSettings) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  generateChatTitle: (userMessage: string, assistantMessage: string) => Promise<string>;
  
  // Folder management
  createNewFolder: (userId: string, name: string, color?: string) => Promise<string>;
  updateFolderName: (folderId: string, name: string) => Promise<void>;
  deleteChatFolder: (folderId: string) => Promise<void>;
  toggleFolderExpanded: (folderId: string) => Promise<void>;
  moveChatToFolderAction: (chatId: string, folderId: string | null) => Promise<void>;
  
  // Message management
  sendMessage: (userId: string, content: string, useStreaming?: boolean, attachments?: any[], webSearch?: boolean, currentModel?: string, systemMessage?: string) => Promise<void>;
  continueMessage: () => Promise<void>;
  addUserMessage: (chatId: string, content: string, attachments?: any[]) => Promise<void>;
  updateLastMessage: (chatId: string, content: string) => void;
  editMessage: (messageId: string, newContent: string, newModel?: string) => Promise<void>;
  regenerateFromMessage: (messageId: string, newContent: string, newModel?: string) => Promise<void>;
  
  // Helper functions
  getChatById: (chatId: string) => Chat | undefined;
  getOriginalChatTitle: (chatId: string) => string | undefined;
  
  // Voice mode actions
  setInputMode: (mode: InputMode) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsTranscribing: (isTranscribing: boolean) => void;
  setIsSynthesizing: (isSynthesizing: boolean) => void;
  setIsPlayingAudio: (isPlayingAudio: boolean) => void;
  setAutoPlayResponses: (autoPlay: boolean) => void;
  setSelectedVoice: (voice: string) => void;
  initializeAudioRecorder: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecordingAndTranscribe: () => Promise<void>;
  synthesizeAndPlayResponse: (text: string) => Promise<void>;
  cleanupAudioRecorder: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  // State
  chats: [],
  folders: [],
  activeChat: null,
  currentMessage: '',
  isLoading: false,
  isStreaming: false,
  isSearching: false,
  isThinking: false,
  thinkingSummary: '',
  error: null,
  showContinuePrompt: false,
  continueMessageId: null,
  user: null,
  abortController: null,
  
  // Voice mode state
  inputMode: 'text',
  isRecording: false,
  isTranscribing: false,
  isSynthesizing: false,
  isPlayingAudio: false,
  audioRecorder: null,
  autoPlayResponses: false,
  selectedVoice: 'coral',

  // Basic setters
  setChats: (chats) => set({ chats }),
  setFolders: (folders) => set({ folders }),
  setActiveChat: (activeChat) => set({ activeChat }),
  setCurrentMessage: (currentMessage) => set({ currentMessage }),
  setLoading: (isLoading) => set({ isLoading }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setSearching: (isSearching) => set({ isSearching }),
  setThinking: (isThinking) => set({ isThinking }),
  setThinkingSummary: (thinkingSummary) => set({ thinkingSummary }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setShowContinuePrompt: (showContinuePrompt) => set({ showContinuePrompt }),
  setContinueMessageId: (continueMessageId) => set({ continueMessageId }),
  setUser: (user) => set({ user }),
  stopStreaming: () => {
    const { abortController, isStreaming } = get();
    if (isStreaming && abortController) {
      abortController.abort();
      set({ 
        abortController: null,
        isStreaming: false,
        isThinking: false,
        thinkingSummary: '',
        isSearching: false 
      });
    }
  },

  // Voice mode setters
  setInputMode: (inputMode) => set({ inputMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
  setIsSynthesizing: (isSynthesizing) => set({ isSynthesizing }),
  setIsPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),
  setAutoPlayResponses: (autoPlayResponses) => set({ autoPlayResponses }),
  setSelectedVoice: (selectedVoice) => set({ selectedVoice }),

  // Load user chats from Firestore
  loadUserChats: async (userId) => {
    const { setLoading, setError, setChats } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      const chats = await getUserChats(userId);
      setChats(chats);
      
      // Set active chat to first chat if none selected
      const { activeChat } = get();
      if (!activeChat && chats.length > 0) {
        set({ activeChat: chats[0].id });
      }
    } catch (error) {
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  },

  // Load user folders from Firestore
  loadUserFolders: async (userId) => {
    const { setError, setFolders } = get();
    
    try {
      setError(null);
      
      const folders = await getUserFolders(userId);
      setFolders(folders);
    } catch (error) {
      // Don't show error to user for folders - just set empty array
      setFolders([]);
    }
  },

  // Create new chat
  createNewChat: async (userId, title, settings, folderId) => {
    const { setLoading, setError, setChats, setActiveChat } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      const newChat = await createChat(userId, title, settings, folderId);
      
      const { chats } = get();
      setChats([newChat, ...chats]);
      setActiveChat(newChat.id);
      
      return newChat.id;
    } catch (error) {
      setError('Failed to create chat');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Split chat (duplicate with all messages)
  splitChat: async (userId, chatId) => {
    const { setLoading, setError, setChats, setActiveChat, chats } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // Find the original chat
      const originalChat = chats.find(chat => chat.id === chatId);
      if (!originalChat) {
        throw new Error('Original chat not found');
      }
      
      // Create new chat with same title but marked as split
      const newChat = await createChat(userId, originalChat.title, originalChat.settings, originalChat.folderId || undefined);
      
      // Copy all messages to the new chat
      for (const message of originalChat.messages) {
        const messageToAdd: Omit<Message, 'id'> = {
          content: message.content,
          role: message.role,
          timestamp: new Date(), // Use current timestamp for the split
          metadata: message.metadata
        };
        
        await addMessageToChat(newChat.id, messageToAdd);
      }
      
      // Mark the new chat as split and update in Firestore
      await updateChat(newChat.id, { isSplit: true, splitFromChatId: chatId });
      
      // Reload the new chat with messages
      const updatedNewChat = await getChat(newChat.id);
      if (!updatedNewChat) {
        throw new Error('Failed to reload split chat');
      }
      
      const { chats: currentChats } = get();
      setChats([updatedNewChat, ...currentChats]);
      setActiveChat(updatedNewChat.id);
      
      return updatedNewChat.id;
    } catch (error) {
      setError('Failed to split chat');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Update chat title
  updateChatTitle: async (chatId, title) => {
    const { setError, setChats } = get();
    
    try {
      setError(null);
      
      await updateChat(chatId, { title });
      
      const { chats } = get();
      const updatedChats = chats.map(chat =>
        chat.id === chatId ? { ...chat, title } : chat
      );
      setChats(updatedChats);
    } catch (error) {
      setError('Failed to update chat title');
    }
  },

  // Update chat settings
  updateChatSettings: async (chatId, settings) => {
    const { setError, setChats } = get();
    
    try {
      setError(null);
      
      await updateChat(chatId, { settings });
      
      const { chats } = get();
      const updatedChats = chats.map(chat =>
        chat.id === chatId ? { ...chat, settings } : chat
      );
      setChats(updatedChats);
    } catch (error) {
      setError('Failed to update chat settings');
    }
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const { setError, setChats, setActiveChat, activeChat } = get();
    
    try {
      setError(null);
      
      await deleteFirestoreChat(chatId);
      
      const { chats } = get();
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      // If deleted chat was active, switch to another chat or clear active chat
      if (activeChat === chatId) {
        const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
        setActiveChat(newActiveChat);
      }
    } catch (error) {
      setError('Failed to delete chat');
    }
  },

  // Add user message to chat
  addUserMessage: async (chatId, content, attachments = []) => {
    const { setError, setChats, chats } = get();
    
    try {
      setError(null);
      
      // Get current chat to access settings
      const currentChat = chats.find(chat => chat.id === chatId);
      
      const message: Omit<Message, 'id'> = {
        content,
        role: 'user',
        timestamp: new Date(),
        metadata: {
          model: currentChat?.settings.model || 'user-input'
        }
      };

      // Only add attachments field if there are attachments
      if (attachments.length > 0) {
        message.attachments = attachments.map(att => ({
          id: att.id,
          filename: att.filename,
          size: att.size,
          type: att.type,
          url: att.url,
          createdAt: att.createdAt
        }));
      }
      
      const newMessage = await addMessageToChat(chatId, message);
      
      const { chats: updatedChatsState } = get();
      const updatedChats = updatedChatsState.map(chat =>
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      );
      setChats(updatedChats);
    } catch (error) {
      setError('Failed to send message');
      throw error;
    }
  },

  // Update last message content (for streaming)
  updateLastMessage: (chatId, content) => {
    const { chats, setChats } = get();
    
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId && chat.messages.length > 0) {
        const messages = [...chat.messages];
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage.role === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMessage,
            content
          };
        }
        
        return { ...chat, messages };
      }
      return chat;
    });
    
    setChats(updatedChats);
  },

  // Generate chat title using AI
  generateChatTitle: async (userMessage: string, assistantMessage: string) => {
    try {
      
      const titleMessages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise chat titles. Create a title that summarizes the conversation topic in 3-8 words. Be specific and descriptive. Return only the title, no quotes or extra text.'
        },
        {
          role: 'user',
          content: `User: ${userMessage}\n\nAssistant: ${assistantMessage}\n\nPlease create a short title (3-8 words) that summarizes this conversation:`
        }
      ];

      
      // Get user data to access API key
      const { user } = get();
      if (!user?.openRouterApiKey) {
        return 'New Chat';
      }

      const response = await createChatCompletion(titleMessages, {
        model: 'openai/gpt-4.1-nano',
        temperature: 0.3,
        max_tokens: 50,
        apiKey: user.openRouterApiKey
      });

      
      const rawTitle = response.choices[0]?.message?.content;
      
      const title = rawTitle?.trim() || 'New Chat';
      const cleanTitle = title.replace(/^["']|["']$/g, ''); // Remove quotes if present
      
      return cleanTitle;
    } catch (error) {
      return 'New Chat';
    }
  },

  // Continue message when token limit is reached
  continueMessage: async () => {
    const { 
      activeChat, 
      chats, 
      continueMessageId,
      setStreaming,
      setError,
      setShowContinuePrompt,
      setContinueMessageId,
      updateLastMessage
    } = get();
    
    if (!activeChat || !continueMessageId) {
      setError('No message to continue');
      return;
    }

    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat) {
      setError('Chat not found');
      return;
    }

    try {
      const controller = new AbortController();
      set({ abortController: controller });
      setError(null);
      setShowContinuePrompt(false);
      setContinueMessageId(null);
      setStreaming(true);

      // Prepare messages for continuation
      const openRouterMessages: OpenRouterMessage[] = [
        ...(currentChat.settings.systemMessage ? [{
          role: 'system' as const,
          content: currentChat.settings.systemMessage
        }] : []),
        ...currentChat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: 'Please continue your previous response.'
        }
      ];

      let accumulatedContent = '';
      const currentMessage = currentChat.messages.find(msg => msg.id === continueMessageId);
      if (currentMessage) {
        accumulatedContent = currentMessage.content;
      }

             // Get user data to access API key
       const { user } = get();
       if (!user?.openRouterApiKey) {
         setError('OpenRouter API key not configured. Visit openrouter.ai/keys to get your API key. Please add your API key in Settings.');
         setStreaming(false);
         return;
       }

       await createStreamingChatCompletion(
         openRouterMessages,
         {
           model: currentChat.settings.model,
           temperature: currentChat.settings.temperature,
           max_tokens: 10000,
           apiKey: user.openRouterApiKey
         },
         (chunk) => {
           accumulatedContent += chunk;
           updateLastMessage(activeChat, accumulatedContent);
         },
         () => {},
         async () => {
           setStreaming(false);
           
           // Update the message in Firestore with final content
           try {
             await updateMessageInChat(activeChat, continueMessageId, {
               content: accumulatedContent,
               metadata: {
                 model: currentChat.settings.model,
                 tokens: estimateTokenCount(accumulatedContent),
                 processingTime: 0
               }
             });
           } catch (error) {
           }
         },
         (error: Error) => {
           if ((error as any).name === 'AbortError') {
           } else {
             setStreaming(false);
             setError(`Failed to continue message: ${error.message}`);
           }
         },
         undefined, // No thinking callback for continue
         controller.signal
       );
    } catch (error) {
      setError(`Failed to continue message: ${(error as Error).message}`);
      setStreaming(false);
    }
  },

  // Send message with AI response
  sendMessage: async (userId, content, useStreaming = true, attachments = [], webSearch = false, currentModel = 'openai/gpt-4o', systemMessage = '') => {
    const { 
      activeChat, 
      chats, 
      addUserMessage,
      setCurrentMessage,
      setStreaming,
      setSearching,
      setError,
      setChats,
      updateLastMessage,
      updateChatTitle,
      generateChatTitle,
      updateChatSettings
    } = get();
    
    // Create new chat if none exists
    if (!activeChat) {
      const { createNewChat } = get();
      const defaultSettings: ChatSettings = {
        model: currentModel,
        temperature: 0.7,
        maxTokens: 10000,
        provider: 'openrouter',
        systemMessage: systemMessage
      };
      
      await createNewChat(userId, 'New Chat', defaultSettings);
      // Update activeChat after creating new chat
      const { activeChat: updatedActiveChat } = get();
      if (!updatedActiveChat) {
        setError('Failed to create chat');
        return;
      }
    }

    const currentActiveChat = get().activeChat;
    if (!currentActiveChat) {
      setError('No active chat available');
      return;
    }

    try {
      setError(null);
      setCurrentMessage('');
      
      // Get current chat and its settings
      let currentChat = chats.find(chat => chat.id === currentActiveChat);
      if (!currentChat) {
        throw new Error('Chat not found');
      }

      // Update chat settings if model has changed
      if (currentChat.settings.model !== currentModel) {
        await updateChatSettings(currentActiveChat, {
          ...currentChat.settings,
          model: currentModel,
          systemMessage: systemMessage
        });
        
        // Refresh chat data after update
        currentChat = { ...currentChat, settings: { ...currentChat.settings, model: currentModel, systemMessage: systemMessage } };
        
        // Update local state
        const { chats: currentChats } = get();
        const updatedChats = currentChats.map(chat =>
          chat.id === currentActiveChat 
            ? currentChat!
            : chat
        );
        setChats(updatedChats);
      }
      
      // Show web search indicator if web search is enabled
      if (webSearch) {
        setSearching(true);
      }
      
      // Add user message
      await addUserMessage(currentActiveChat, content, attachments);

      // Check if this is the first message pair (user + assistant)
      // We need to check before adding the user message, so subtract 1
      const isFirstMessage = currentChat.messages.length <= 1; // 0 or 1 message (just the user message we added)

      // Prepare messages for OpenRouter API
      const openRouterMessages: OpenRouterMessage[] = [
        ...(currentChat.settings.systemMessage ? [{
          role: 'system' as const,
          content: currentChat.settings.systemMessage
        }] : []),
        ...currentChat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: attachments.length > 0 ? [
            { type: 'text' as const, text: content },
            ...attachments.map(attachment => {
              if (attachment.type.startsWith('image/')) {
                return {
                  type: 'image_url' as const,
                  image_url: { url: attachment.url }
                }
              } else if (attachment.type === 'application/pdf') {
                return {
                  type: 'file' as const,
                  file: {
                    filename: attachment.filename,
                    file_data: attachment.url
                  }
                }
              }
              return null
            }).filter((item): item is NonNullable<typeof item> => item !== null)
          ] : content
        }
      ];

      if (useStreaming) {
        const controller = new AbortController();
        set({ abortController: controller, isStreaming: true });
        
        // Check if this is a reasoning model and immediately show thinking indicator
        if (isThinkingModel(currentModel)) {
          set({ isThinking: true, thinkingSummary: 'Preparing to analyze your request...' });
        }
        
        // Create placeholder assistant message
        const assistantMessage: Omit<Message, 'id'> = {
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            model: currentModel,
            webSearchUsed: webSearch
          }
        };
        
        const newMessage = await addMessageToChat(currentActiveChat, assistantMessage);
        
        // Update local state
        const { chats: currentChats } = get();
        const updatedChats = currentChats.map(chat =>
          chat.id === currentActiveChat 
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        );
        setChats(updatedChats);

        let accumulatedContent = '';
        let finishReason = '';
        let isFirstChunk = true;
        
        // Get user data to access API key
        const { user } = get();
        if (!user?.openRouterApiKey) {
          setError('OpenRouter API key not configured. Visit openrouter.ai/keys to get your API key. Please add your API key in Settings.');
          setStreaming(false);
          setSearching(false);
          return;
        }

        
        await createStreamingChatCompletion(
          openRouterMessages,
          {
            model: currentModel,
            temperature: currentChat.settings.temperature,
            max_tokens: 10000,
            apiKey: user.openRouterApiKey,
            webSearch: webSearch
          },
          (chunk) => {
            
            // Hide web search indicator when first content chunk arrives
            if (isFirstChunk) {
              setSearching(false);
              isFirstChunk = false;
            }
            
            accumulatedContent += chunk;
            
            updateLastMessage(currentActiveChat, accumulatedContent);
            
            // Save content immediately on first chunk to ensure we don't lose it
            if (accumulatedContent.length === chunk.length) {
              updateMessageInChat(currentActiveChat, newMessage.id, {
                content: accumulatedContent,
                metadata: {
                  model: currentModel,
                  webSearchUsed: webSearch
                }
              }).catch(_error => {
              });
            }
            
            // Save content to Firestore periodically during streaming (every 500 characters)
            if (accumulatedContent.length % 500 === 0 && accumulatedContent.length > 0) {
              updateMessageInChat(currentActiveChat, newMessage.id, {
                content: accumulatedContent,
                metadata: {
                  model: currentModel,
                  webSearchUsed: webSearch
                }
              }).catch(_error => {
              });
            }
          },
          (reason) => {
            finishReason = reason;
          },
          async (webSearchResults) => {
            setStreaming(false);
            set({ isThinking: false, thinkingSummary: '' });
            
            // Update the message in Firestore with final content
            try {
              
              if (!accumulatedContent.trim()) {
              }
              
              // Clean metadata to remove undefined values
              const metadata: any = {
                model: currentModel,
                tokens: estimateTokenCount(accumulatedContent),
                processingTime: 0, // TODO: Implement proper timing
                webSearchUsed: webSearch
              };
              
              // Only add webSearchResults if they exist
              if (webSearchResults && webSearchResults.length > 0) {
                metadata.webSearchResults = webSearchResults;
              }
              
              await updateMessageInChat(currentActiveChat, newMessage.id, {
                content: accumulatedContent,
                metadata: metadata
              });

              // Check if we hit token limit and show continue prompt
              if (finishReason === 'length') {
                const { setShowContinuePrompt, setContinueMessageId } = get();
                setShowContinuePrompt(true);
                setContinueMessageId(newMessage.id);
              }

              // Generate title for first message
              if (isFirstMessage && accumulatedContent.trim()) {
                try {
                  const generatedTitle = await generateChatTitle(content, accumulatedContent);
                  if (generatedTitle && generatedTitle !== 'New Chat') {
                    await updateChatTitle(currentActiveChat, generatedTitle);
                  } else {
                  }
                } catch (_titleError) {
                }
              } else {
              }
            } catch (_error) {
            }
          },
          (error) => {
            if ((error as any).name === 'AbortError') {
              // State is already reset by stopStreaming
            } else {
              setStreaming(false);
              setSearching(false);
              set({ isThinking: false, thinkingSummary: '' });
              
              // Save any accumulated content before showing error
              if (accumulatedContent.trim()) {
                updateMessageInChat(currentActiveChat, newMessage.id, {
                  content: accumulatedContent,
                  metadata: {
                    model: currentModel,
                    tokens: estimateTokenCount(accumulatedContent),
                    error: error.message,
                    webSearchUsed: webSearch
                  }
                });
              }
              
              setError(`AI response failed: ${error.message}`);
            }
          },
          // Thinking callback
          (isThinking, summary) => {
            set({ isThinking });
            if (summary) {
              set({ thinkingSummary: summary });
            }
          },
          controller.signal
        );
      } else {
        if (webSearch) {
          setSearching(true);
        }
        
        setStreaming(true);
        
        // Get user data to access API key
        const { user } = get();
        if (!user?.openRouterApiKey) {
          setError('OpenRouter API key not configured. Visit openrouter.ai/keys to get your API key. Please add your API key in Settings.');
          setStreaming(false);
          setSearching(false);
          return;
        }
        
        const response = await createChatCompletion(openRouterMessages, {
          model: currentModel,
          temperature: currentChat.settings.temperature,
          max_tokens: 10000,
          apiKey: user.openRouterApiKey,
          webSearch: webSearch
        });

        const assistantContent = response.choices[0]?.message?.content || 'No response received';
        
        // Extract web search results from annotations
        const webSearchResults: Array<{url: string, title: string, content?: string}> = [];
        const annotations = response.choices[0]?.message?.annotations;
        if (annotations) {
          for (const annotation of annotations) {
            if (annotation.type === 'url_citation' && annotation.url_citation) {
              const result = {
                url: annotation.url_citation.url,
                title: annotation.url_citation.title || '',
                content: annotation.url_citation.content
              };
              webSearchResults.push(result);
            }
          }
        }
        
        const assistantMessage: Omit<Message, 'id'> = {
          content: assistantContent,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            model: response.model || currentModel,
            tokens: response.usage?.total_tokens,
            processingTime: Date.now() - Date.now(), // This would need to be calculated properly
            webSearchUsed: webSearch,
            webSearchResults: webSearchResults.length > 0 ? webSearchResults : undefined
          }
        };
        
        const savedMessage = await addMessageToChat(currentActiveChat, assistantMessage);
        
        // Update local state
        const { chats: currentChats } = get();
        const updatedChats = currentChats.map(chat =>
          chat.id === currentActiveChat 
            ? { ...chat, messages: [...chat.messages, savedMessage] }
            : chat
        );
        setChats(updatedChats);
        
        // Generate title for first message
        if (isFirstMessage && assistantContent.trim()) {
          try {
            const generatedTitle = await generateChatTitle(content, assistantContent);
            if (generatedTitle && generatedTitle !== 'New Chat') {
              await updateChatTitle(currentActiveChat, generatedTitle);
            }
          } catch (titleError) {
          }
        }
        
        setStreaming(false);
        setSearching(false);
      }
    } catch (error) {
      setError(`Failed to send message: ${(error as Error).message}`);
      setStreaming(false);
      setSearching(false);
    }
  },

  // Create new folder
  createNewFolder: async (userId, name, color) => {
    const { setLoading, setError, setFolders } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      const newFolder = await createFolder(userId, name, color);
      
      const { folders } = get();
      setFolders([newFolder, ...folders]);
      
      return newFolder.id;
    } catch (error) {
      setError('Failed to create folder');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Update folder name
  updateFolderName: async (folderId, name) => {
    const { setError, setFolders } = get();
    
    try {
      setError(null);
      
      await updateFolder(folderId, { name });
      
      const { folders } = get();
      const updatedFolders = folders.map(folder =>
        folder.id === folderId ? { ...folder, name } : folder
      );
      setFolders(updatedFolders);
    } catch (error) {
      setError('Failed to update folder name');
    }
  },

  // Delete chat folder
  deleteChatFolder: async (folderId) => {
    const { setError, setChats, setFolders } = get();
    
    try {
      setError(null);
      
      await deleteFolder(folderId);
      
      const { chats, folders } = get();
      const updatedChats = chats.filter(chat => chat.folderId !== folderId);
      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      setChats(updatedChats);
      setFolders(updatedFolders);
    } catch (error) {
      setError('Failed to delete chat folder');
    }
  },

  // Toggle folder expanded
  toggleFolderExpanded: async (folderId) => {
    const { setFolders } = get();
    
    const { folders } = get();
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, isExpanded: !folder.isExpanded } : folder
    );
    setFolders(updatedFolders);
  },

  // Move chat to folder
  moveChatToFolderAction: async (chatId, folderId) => {
    const { setError, setChats, setFolders } = get();
    
    try {
      setError(null);
      
      await moveChatToFolder(chatId, folderId);
      
      const { chats, folders } = get();
      const updatedChats = chats.map(chat =>
        chat.id === chatId ? { ...chat, folderId: folderId || undefined } : chat
      );
      const updatedFolders = folders.map(folder =>
        folder.id === folderId ? { ...folder, isExpanded: true } : folder
      );
      setChats(updatedChats);
      setFolders(updatedFolders);
    } catch (error) {
      setError('Failed to move chat to folder');
    }
  },

  // Get chat by ID
  getChatById: (chatId) => {
    const { chats } = get();
    return chats.find(chat => chat.id === chatId);
  },

  // Get original chat title
  getOriginalChatTitle: (chatId) => {
    const { chats } = get();
    const originalChat = chats.find(chat => chat.id === chatId && chat.isSplit);
    return originalChat?.title;
  },

  // Voice mode implementation functions
  initializeAudioRecorder: async () => {
    const { setError } = get();
    
    try {
      const recorder = new AudioRecorder({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        silenceThreshold: 0.02, // Backup silence threshold (very low, mainly for safety)
        silenceDuration: 30000  // 30 seconds fallback (user should use "End Message" button)
      });
      
      await recorder.initialize();
      set({ audioRecorder: recorder });
    } catch (error) {
      setError('Failed to access microphone. Please check permissions.');
    }
  },

  startRecording: async () => {
    const { audioRecorder, setIsRecording, setError, initializeAudioRecorder, stopRecordingAndTranscribe } = get();
    
    try {
      setError(null);
      
      // Initialize recorder if not already done
      if (!audioRecorder) {
        await initializeAudioRecorder();
        const { audioRecorder: newRecorder } = get();
        if (!newRecorder) {
          throw new Error('Failed to initialize audio recorder');
        }
      }
      
      const recorder = get().audioRecorder;
      if (!recorder) {
        throw new Error('Audio recorder not available');
      }
      
      
      // Start recording with silence detection callback
      await recorder.startRecording(() => {
        stopRecordingAndTranscribe();
      });
      
      setIsRecording(true);
    } catch (error) {
      setError(`Failed to start recording: ${(error as Error).message}`);
    }
  },

  stopRecordingAndTranscribe: async () => {
    const { 
      audioRecorder, 
      user, 
      setIsRecording, 
      setIsTranscribing, 
      setCurrentMessage, 
      setError 
    } = get();
    
    if (!audioRecorder) {
      setError('Audio recorder not initialized');
      return;
    }
    
    if (!user?.openaiApiKey) {
      setError('OpenAI API key not configured. Please add your key in Settings.');
      return;
    }
    
    try {
      setError(null);
      setIsRecording(false);
      setIsTranscribing(true);
      const audioBlob = await audioRecorder.stopRecording();
      
      // Convert blob to supported format
      const audioFile = await audioRecorder.convertToSupportedFormat(audioBlob);
      
      // Transcribe the audio
      const transcription = await transcribeAudio(audioFile, user.openaiApiKey, {
        model: 'gpt-4o-mini-transcribe',
        responseFormat: 'text'
      });
      
      // Set the transcribed text as current message
      setCurrentMessage(transcription.text);
      setIsTranscribing(false);
      
      // Auto-send the transcribed message and get voice response
      if (transcription.text.trim() && user?.id) {
        
        // Get current selected model and system prompt from state
        const { sendMessage, synthesizeAndPlayResponse } = get();
        
        // Send the message (this will create a new chat if needed)
        await sendMessage(
          user.id, 
          transcription.text.trim(), 
          true, // useStreaming
          [], // no attachments
          false, // no web search for voice mode
          undefined, // use current model
          undefined // use current system message
        );
        
        // Wait a bit for the response to be generated, then get the latest assistant message
        setTimeout(async () => {
          const { chats, activeChat, inputMode } = get();
          const currentChat = chats.find(chat => chat.id === activeChat);
          
          if (currentChat && currentChat.messages.length > 0 && inputMode === 'voice') {
            const lastMessage = currentChat.messages[currentChat.messages.length - 1];
            
            // If the last message is from assistant and has content, synthesize it
            if (lastMessage.role === 'assistant' && lastMessage.content) {
              await synthesizeAndPlayResponse(lastMessage.content);
            }
          }
        }, 1000); // Reduced wait time to 1 second
      }
      
    } catch (error) {
      setError(`Transcription failed: ${(error as Error).message}`);
      setIsTranscribing(false);
    }
  },

  synthesizeAndPlayResponse: async (text: string) => {
    const { 
      user, 
      selectedVoice, 
      setIsSynthesizing, 
      setIsPlayingAudio, 
      setError 
    } = get();
    
    if (!user?.openaiApiKey) {
      setError('OpenAI API key not configured. Please add your key in Settings.');
      return;
    }
    
    if (!text.trim()) {
      return;
    }
    
    try {
      setError(null);
      setIsSynthesizing(true);
      
      
      // Synthesize speech
      const audioBlob = await synthesizeSpeech(text, user.openaiApiKey, {
        model: 'gpt-4o-mini-tts',
        voice: selectedVoice as any,
        responseFormat: 'mp3'
      });
      
      setIsSynthesizing(false);
      setIsPlayingAudio(true);
      
      // Play the audio
      await playAudioBlob(audioBlob);
      
      setIsPlayingAudio(false);
      
      // Auto-start recording again for the next user input (if still in voice mode)
      const { inputMode, startRecording } = get();
      if (inputMode === 'voice') {
        setTimeout(() => {
          startRecording();
        }, 500); // Small delay to ensure audio cleanup
      }
      
    } catch (error) {
      setError(`Speech synthesis failed: ${(error as Error).message}`);
      setIsSynthesizing(false);
      setIsPlayingAudio(false);
    }
  },

  cleanupAudioRecorder: () => {
    const { audioRecorder } = get();
    
    if (audioRecorder) {
      audioRecorder.cleanup();
      set({ 
        audioRecorder: null, 
        isRecording: false,
        isTranscribing: false,
        isSynthesizing: false,
        isPlayingAudio: false
      });
    }
  },

  // Edit message content
  editMessage: async (messageId: string, newContent: string, newModel?: string) => {
    const { chats, activeChat, setChats, setError } = get();
    
    if (!activeChat) {
      setError('No active chat');
      return;
    }
    
    try {
      setError(null);
      
      // Find the chat and message
      const chatIndex = chats.findIndex(chat => chat.id === activeChat);
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }
      
      const chat = chats[chatIndex];
      const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) {
        throw new Error('Message not found');
      }
      
      // Update the message
      const updatedMessage = {
        ...chat.messages[messageIndex],
        content: newContent,
        metadata: {
          ...chat.messages[messageIndex].metadata,
          model: newModel || chat.messages[messageIndex].metadata?.model
        }
      };
      
      const updatedMessages = [...chat.messages];
      updatedMessages[messageIndex] = updatedMessage;
      
      const updatedChat = {
        ...chat,
        messages: updatedMessages,
        updatedAt: new Date()
      };
      
      // Update local state
      const updatedChats = [...chats];
      updatedChats[chatIndex] = updatedChat;
      setChats(updatedChats);
      
      // Update in Firestore
      await updateMessageInChat(activeChat, messageId, updatedMessage);
      
    } catch (error) {
      setError('Failed to edit message');
    }
  },

  // Regenerate response from a message
  regenerateFromMessage: async (messageId: string, newContent: string, newModel?: string) => {
    const { chats, activeChat, user, setChats, setError, setThinking } = get();
    
    if (!activeChat || !user) {
      setError('No active chat or user');
      return;
    }
    
    try {
      setError(null);
      
      // Find the chat and message
      const chatIndex = chats.findIndex(chat => chat.id === activeChat);
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }
      
      const chat = chats[chatIndex];
      const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) {
        throw new Error('Message not found');
      }
      
      // Update the user message
      const updatedMessage = {
        ...chat.messages[messageIndex],
        content: newContent,
        metadata: {
          ...chat.messages[messageIndex].metadata,
          model: newModel || chat.messages[messageIndex].metadata?.model
        }
      };
      
      // Remove all messages after this one (including the old AI response)
      const messagesUpToEdit = chat.messages.slice(0, messageIndex + 1);
      messagesUpToEdit[messageIndex] = updatedMessage;
      
      const updatedChat = {
        ...chat,
        messages: messagesUpToEdit,
        updatedAt: new Date(),
        settings: {
          ...chat.settings,
          model: newModel || chat.settings.model
        }
      };
      
      // Update local state
      const updatedChats = [...chats];
      updatedChats[chatIndex] = updatedChat;
      setChats(updatedChats);
      
      // Update the message in Firestore
      await updateMessageInChat(activeChat, messageId, updatedMessage);
      
      // Generate new response
      const messages: OpenRouterMessage[] = messagesUpToEdit.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add system message if exists
      if (chat.settings.systemMessage) {
        messages.unshift({
          role: 'system',
          content: chat.settings.systemMessage
        });
      }
      
      const abortController = new AbortController();
      set({ abortController, isStreaming: true });
      
      let assistantResponse = '';
      let webSearchResults: Array<{url: string, title: string, content?: string}> | undefined;
      
      await createStreamingChatCompletion(
        messages,
        {
          model: newModel || chat.settings.model,
          temperature: chat.settings.temperature,
                     apiKey: user.openRouterApiKey,
           webSearch: false
        },
        (chunk: string) => {
          assistantResponse += chunk;
          
          // Update the last message in real-time
          const { chats: currentChats } = get();
          const currentChatIndex = currentChats.findIndex(c => c.id === activeChat);
          if (currentChatIndex !== -1) {
            const currentChat = currentChats[currentChatIndex];
            const lastMessage = currentChat.messages[currentChat.messages.length - 1];
            
            if (lastMessage?.role === 'assistant') {
              // Update existing assistant message
              const updatedMessages = [...currentChat.messages];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: assistantResponse
              };
              
              const updatedChat = {
                ...currentChat,
                messages: updatedMessages
              };
              
              const updatedChats = [...currentChats];
              updatedChats[currentChatIndex] = updatedChat;
              setChats(updatedChats);
            } else {
              // Create new assistant message
              const newAssistantMessage: Message = {
                id: Date.now().toString(),
                content: assistantResponse,
                role: 'assistant',
                timestamp: new Date(),
                metadata: {
                  model: newModel || chat.settings.model,
                  tokens: estimateTokenCount(assistantResponse)
                }
              };
              
              const updatedMessages = [...currentChat.messages, newAssistantMessage];
              const updatedChat = {
                ...currentChat,
                messages: updatedMessages
              };
              
              const updatedChats = [...currentChats];
              updatedChats[currentChatIndex] = updatedChat;
              setChats(updatedChats);
            }
          }
        },
        (_reason: string) => {
        },
        async (searchResults) => {
          webSearchResults = searchResults;
          
          // Create final assistant message
          const finalAssistantMessage: Message = {
            id: Date.now().toString(),
            content: assistantResponse,
            role: 'assistant',
            timestamp: new Date(),
            metadata: {
              model: newModel || chat.settings.model,
              tokens: estimateTokenCount(assistantResponse),
              webSearchUsed: !!webSearchResults,
              webSearchResults: webSearchResults
            }
          };
          
          // Add to Firestore
          await addMessageToChat(activeChat, finalAssistantMessage);
          
          set({ 
            isStreaming: false, 
            isThinking: false, 
            isSearching: false,
            abortController: null 
          });
        },
        (error: Error) => {
          setError(`Failed to generate response: ${error.message}`);
          set({ 
            isStreaming: false, 
            isThinking: false, 
            isSearching: false,
            abortController: null 
          });
        },
        (isThinking: boolean, summary?: string) => {
          setThinking(isThinking);
          if (summary) {
            set({ thinkingSummary: summary });
          }
        },
        abortController.signal
      );
      
    } catch (error) {
      setError('Failed to regenerate response');
      set({ 
        isStreaming: false, 
        isThinking: false, 
        isSearching: false,
        abortController: null 
      });
    }
  }
})); 
