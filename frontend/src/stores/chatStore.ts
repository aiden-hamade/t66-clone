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
  type ChatMessage as OpenRouterMessage
} from '../lib/openrouter';

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
  continueMessage: (userId: string) => Promise<void>;
  addUserMessage: (chatId: string, content: string, attachments?: any[]) => Promise<void>;
  updateLastMessage: (chatId: string, content: string) => void;
  
  // Helper functions
  getChatById: (chatId: string) => Chat | undefined;
  getOriginalChatTitle: (chatId: string) => string | undefined;
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
      console.log('Chat Store: Aborting stream');
      abortController.abort();
      set({ 
        abortController: null,
        isStreaming: false,
        isThinking: false,
        isSearching: false 
      });
    }
  },

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
      console.error('Error loading chats:', error);
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
      console.error('Error loading folders:', error);
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
      console.error('Error creating chat:', error);
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
      console.error('Error splitting chat:', error);
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
      console.error('Error updating chat title:', error);
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
      console.error('Error updating chat settings:', error);
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
      console.error('Error deleting chat:', error);
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
          createdAt: att.createdAt.toISOString() // Convert Date to string
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
      console.error('Error adding user message:', error);
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
      console.log('generateChatTitle: Starting title generation');
      console.log('generateChatTitle: User message length:', userMessage.length);
      console.log('generateChatTitle: Assistant message length:', assistantMessage.length);
      
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

      console.log('generateChatTitle: Sending request to OpenRouter with model openai/gpt-4.1-nano');
      
      // Get user data to access API key
      const { user } = get();
      if (!user?.openRouterApiKey) {
        console.error('generateChatTitle: No API key available');
        return 'New Chat';
      }

      const response = await createChatCompletion(titleMessages, {
        model: 'openai/gpt-4.1-nano',
        temperature: 0.3,
        max_tokens: 50,
        apiKey: user.openRouterApiKey
      });

      console.log('generateChatTitle: Received response:', response);
      console.log('generateChatTitle: Response choices:', response.choices);
      
      const rawTitle = response.choices[0]?.message?.content;
      console.log('generateChatTitle: Raw title from API:', rawTitle);
      
      const title = rawTitle?.trim() || 'New Chat';
      const cleanTitle = title.replace(/^["']|["']$/g, ''); // Remove quotes if present
      
      console.log('generateChatTitle: Final cleaned title:', cleanTitle);
      return cleanTitle;
    } catch (error) {
      console.error('generateChatTitle: Error generating title:', error);
      return 'New Chat';
    }
  },

  // Continue message when token limit is reached
  continueMessage: async (userId) => {
    const { 
      activeChat, 
      chats, 
      continueMessageId,
      setStreaming,
      setError,
      setShowContinuePrompt,
      setContinueMessageId,
      updateLastMessage,
      updateChatTitle,
      generateChatTitle
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
         setError('OpenRouter API key not configured. Please add your API key in Settings.');
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
         (reason) => {
           // Handle finish reason for continuation
           console.log('Continue streaming finish reason:', reason);
         },
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
             console.error('Error saving continued message to Firestore:', error);
           }
         },
         (error) => {
           if ((error as any).name === 'AbortError') {
             console.log('Continue stream was aborted by user.');
           } else {
             setStreaming(false);
             setError(`Failed to continue message: ${error.message}`);
           }
         },
         undefined, // No thinking callback for continue
         controller.signal
       );
    } catch (error) {
      console.error('Error continuing message:', error);
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
      
      const newChatId = await createNewChat(userId, 'New Chat', defaultSettings);
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
        console.log(`Updating chat model from ${currentChat.settings.model} to ${currentModel}`);
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
      console.log('sendMessage: Current chat messages count:', currentChat.messages.length);
      console.log('sendMessage: isFirstMessage:', isFirstMessage);

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
        console.log('Chat Store: Created new assistant message with ID:', newMessage.id);
        console.log('Chat Store: New message content:', newMessage.content);
        
        // Update local state
        const { chats: currentChats } = get();
        const updatedChats = currentChats.map(chat =>
          chat.id === currentActiveChat 
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        );
        setChats(updatedChats);
        console.log('Chat Store: Updated local state with new message');

        let accumulatedContent = '';
        let finishReason = '';
        let isFirstChunk = true;
        
        // Get user data to access API key
        const { user } = get();
        if (!user?.openRouterApiKey) {
          setError('OpenRouter API key not configured. Please add your API key in Settings.');
          setStreaming(false);
          setSearching(false);
          return;
        }

        console.log('Chat Store: Starting streaming with model:', currentModel);
        console.log('Chat Store: Web search enabled:', webSearch);
        console.log('Chat Store: Message count:', openRouterMessages.length);
        
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
            console.log('Chat Store: Streaming chunk received:', chunk);
            console.log('Chat Store: Chunk length:', chunk.length);
            
            // Hide web search indicator when first content chunk arrives
            if (isFirstChunk) {
              console.log('Chat Store: First chunk received, hiding search indicator');
              setSearching(false);
              isFirstChunk = false;
            }
            
            accumulatedContent += chunk;
            console.log('Chat Store: Accumulated content length:', accumulatedContent.length);
            console.log('Chat Store: Accumulated content preview:', accumulatedContent.substring(0, 100) + '...');
            
            updateLastMessage(currentActiveChat, accumulatedContent);
            
            // Save content immediately on first chunk to ensure we don't lose it
            if (accumulatedContent.length === chunk.length) {
              console.log('Chat Store: Saving first chunk to Firestore immediately');
              updateMessageInChat(currentActiveChat, newMessage.id, {
                content: accumulatedContent,
                metadata: {
                  model: currentModel,
                  webSearchUsed: webSearch
                }
              }).catch(error => {
                console.error('Error saving first chunk to Firestore:', error);
              });
            }
            
            // Save content to Firestore periodically during streaming (every 500 characters)
            if (accumulatedContent.length % 500 === 0 && accumulatedContent.length > 0) {
              console.log('Chat Store: Saving periodic content to Firestore (length:', accumulatedContent.length, ')');
              updateMessageInChat(currentActiveChat, newMessage.id, {
                content: accumulatedContent,
                metadata: {
                  model: currentModel,
                  webSearchUsed: webSearch
                }
              }).catch(error => {
                console.error('Error saving streaming content to Firestore:', error);
              });
            }
          },
          (reason) => {
            finishReason = reason;
          },
          async (webSearchResults) => {
            console.log('Streaming completed. Final content length:', accumulatedContent.length);
            console.log('Final content preview:', accumulatedContent.substring(0, 200) + '...');
            console.log('Finish reason:', finishReason);
            console.log('Web search results:', webSearchResults);
            setStreaming(false);
            
            // Update the message in Firestore with final content
            try {
              console.log('Saving final message to Firestore...');
              console.log('Final accumulated content length:', accumulatedContent.length);
              console.log('Final accumulated content preview:', accumulatedContent.substring(0, 200));
              
              if (!accumulatedContent.trim()) {
                console.error('WARNING: Final accumulated content is empty!');
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
              console.log('Final message saved to Firestore successfully');

              // Check if we hit token limit and show continue prompt
              if (finishReason === 'length') {
                console.log('Token limit reached, showing continue prompt');
                const { setShowContinuePrompt, setContinueMessageId } = get();
                setShowContinuePrompt(true);
                setContinueMessageId(newMessage.id);
              }

              // Generate title for first message
              if (isFirstMessage && accumulatedContent.trim()) {
                console.log('Generating title for first message...');
                console.log('User message:', content);
                console.log('Assistant message preview:', accumulatedContent.substring(0, 100));
                try {
                  const generatedTitle = await generateChatTitle(content, accumulatedContent);
                  console.log('Generated title:', generatedTitle);
                  if (generatedTitle && generatedTitle !== 'New Chat') {
                    console.log('Updating chat title to:', generatedTitle);
                    await updateChatTitle(currentActiveChat, generatedTitle);
                    console.log('Chat title updated successfully');
                  } else {
                    console.log('Generated title was empty or "New Chat", not updating');
                  }
                } catch (titleError) {
                  console.error('Error generating title:', titleError);
                }
              } else {
                console.log('Not generating title - isFirstMessage:', isFirstMessage, 'content length:', accumulatedContent.trim().length);
              }
            } catch (error) {
              console.error('Error saving final message to Firestore:', error);
            }
          },
          (error) => {
            console.error('Streaming error occurred:', error);
            if ((error as any).name === 'AbortError') {
              console.log('Stream was aborted by user.');
              // State is already reset by stopStreaming
            } else {
              setStreaming(false);
              setSearching(false);
              set({ isThinking: false });
              
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
                }).catch(saveError => {
                  console.error('Error saving content after streaming error:', saveError);
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
          setError('OpenRouter API key not configured. Please add your API key in Settings.');
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
        console.log('Non-streaming response annotations:', annotations);
        if (annotations) {
          for (const annotation of annotations) {
            if (annotation.type === 'url_citation' && annotation.url_citation) {
              const result = {
                url: annotation.url_citation.url,
                title: annotation.url_citation.title || '',
                content: annotation.url_citation.content
              };
              webSearchResults.push(result);
              console.log('Added non-streaming web search result:', result);
            }
          }
        }
        console.log('Final web search results for non-streaming:', webSearchResults);
        
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
            console.error('Error generating title:', titleError);
          }
        }
        
        setStreaming(false);
        setSearching(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
      console.error('Error creating folder:', error);
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
      console.error('Error updating folder name:', error);
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
      console.error('Error deleting chat folder:', error);
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
      console.error('Error moving chat to folder:', error);
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
  }
})); 