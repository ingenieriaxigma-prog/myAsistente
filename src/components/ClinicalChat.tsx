import { useState, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, Download, Mic, Image, Send, Menu, Plus, MessageCircle, Sparkles, Search, Trash2, Edit3, ListTree, X, FileText, Pause, Play, Copy, Volume2, ThumbsUp, ThumbsDown, RefreshCw, Share, Globe, Check, Loader2 } from 'lucide-react';
import type { Specialty, Message, Attachment, ChatHistory } from '../types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useSpecialtyTheme } from '../hooks/useSpecialtyTheme';
import { ScreenContainer } from './common/ScreenContainer';
import { BackButton } from './common/BackButton';
import { getRandomSuggestions } from '../constants/prompts';
import { chatApi } from '../services/api';
import { FormattedMessage } from './FormattedMessage';

interface ClinicalChatProps {
  specialty: Specialty;
  onBack: () => void;
}

export function ClinicalChat({ specialty, onBack }: ClinicalChatProps) {
  const theme = useSpecialtyTheme(specialty);
  
  // Helper function to copy text with fallback
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern Clipboard API only in secure contexts
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard');
      } else {
        // Use fallback method
        copyTextFallback(text);
      }
    } catch (err) {
      // If Clipboard API fails, try fallback
      console.log('Clipboard API failed, using fallback method');
      copyTextFallback(text);
    }
  };

  const copyTextFallback = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) {
        console.log('Text copied to clipboard using fallback');
      } else {
        console.error('Fallback copy failed');
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  // Mensaje de bienvenida según especialidad
  const welcomeMessage = useMemo(() => {
    if (specialty === 'MyPelvic') {
      return 'Hola, soy tu asistente especializado en salud pélvica. ¿En qué puedo ayudarte hoy?';
    } else if (specialty === 'MyColop') {
      return 'Hola, soy tu asistente especializado en coloproctología. ¿En qué puedo ayudarte hoy?';
    }
    return 'Hola, soy tu asistente clínico. ¿En qué puedo ayudarte hoy?';
  }, [specialty]);
  
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  
  // Actualizar el mensaje de bienvenida cuando cambie la especialidad
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
    // Reset current chat when specialty changes
    setCurrentChatId(null);
  }, [welcomeMessage]);
  
  // Create new chat on component mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const { chat } = await chatApi.createChat(
          specialty || 'MyPelvic',
          `Chat ${new Date().toLocaleDateString('es-ES')}`
        );
        setCurrentChatId(chat.id);
        console.log('New chat created:', chat.id);
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    };
    
    if (specialty && !currentChatId) {
      initChat();
    }
  }, [specialty, currentChatId]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const [showSourcesForMessage, setShowSourcesForMessage] = useState<string | null>(null);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [deleteToastMessage, setDeleteToastMessage] = useState<string | null>(null);

  // Load chat history when sheet opens
  useEffect(() => {
    const loadHistory = async () => {
      if (showHistory) {
        setIsLoadingHistory(true);
        try {
          const { chats } = await chatApi.getChatHistory();
          const formattedHistory: ChatHistory[] = chats.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            date: new Date(chat.lastUpdate),
          }));
          setChatHistory(formattedHistory);
        } catch (error) {
          console.error('Error loading chat history:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };
    loadHistory();
  }, [showHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChatId) return;

    const userMessageContent = inputMessage;
    setInputMessage('');

    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setPendingAttachments([]);
    setIsTyping(true);

    try {
      // Log attachments before sending to backend
      console.log('📎 Sending attachments to backend:', pendingAttachments.map(a => ({
        type: a.type,
        name: a.name,
        hasBase64: !!a.base64,
        base64Prefix: a.base64 ? a.base64.substring(0, 50) : 'none'
      })));
      
      // Send message to backend and get AI response
      const { userMessage, aiMessage, chat, rag } = await chatApi.sendMessage(
        currentChatId,
        userMessageContent,
        pendingAttachments.length > 0 ? pendingAttachments : undefined
      );

      console.log('Message sent with attachments:', pendingAttachments);
      console.log('Chat updated from backend:', chat);
      
      // Log RAG info if available
      if (rag?.enabled) {
        console.log('📚 RAG enabled - found', rag.chunks_found, 'relevant chunks');
      }

      // Update messages with backend response
      setMessages(prev => {
        // Remove temp user message and add both messages from backend
        const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id);
        return [
          ...withoutTemp,
          {
            ...userMessage,
            timestamp: new Date(userMessage.timestamp),
          },
          {
            ...aiMessage,
            timestamp: new Date(aiMessage.timestamp),
            // Add RAG metadata to the message if available
            metadata: aiMessage.metadata || (rag?.enabled ? { rag } : undefined),
          },
        ];
      });

      // If the chat title was updated (auto-generated), update the history
      if (chat && chat.title) {
        console.log('Updating chat title in history:', chat.title);
        setChatHistory(prev => prev.map(c => 
          c.id === currentChatId 
            ? { ...c, title: chat.title, date: new Date(chat.lastUpdate) }
            : c
        ));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona una imagen válida (PNG, JPEG, GIF, o WebP)');
        // Reset input
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
        return;
      }
      
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Log for debugging
        console.log('Image uploaded:', {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Preview: base64String.substring(0, 100) + '...'
        });
        
        const newAttachment: Attachment = {
          type: 'image',
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          base64: base64String, // Full data URL format: data:image/jpeg;base64,...
        };
        setPendingAttachments([...pendingAttachments, newAttachment]);
        setShowAttachMenu(false);
        
        // Reset input so the same file can be selected again
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error al leer la imagen. Por favor intenta de nuevo.');
        // Reset input
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(file.type) || 
                          ['pdf', 'doc', 'docx', 'txt'].includes(fileExtension || '');
      
      if (!isValidType) {
        alert('Por favor selecciona un archivo válido (PDF, Word, o TXT)');
        return;
      }
      
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Show loading state
      const loadingAttachment: Attachment = {
        type: 'file',
        name: `Procesando ${file.name}...`,
        url: '',
        size: file.size,
      };
      setPendingAttachments([...pendingAttachments, loadingAttachment]);
      setShowAttachMenu(false);
      
      try {
        let base64String = '';
        let extractedText = '';
        
        // Convert file to base64
        const fileReader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = reject;
          fileReader.readAsDataURL(file);
        });
        
        base64String = await base64Promise;
        
        // Extract text from PDF if applicable
        if (file.type === 'application/pdf') {
          try {
            console.log('📄 Extracting text from PDF...');
            const pdfjsLib = await import('pdfjs-dist');
            
            // Configure worker matching the library version (5.4.449)
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs`;
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            
            // Extract text from all pages
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n\n';
            }
            
            extractedText = fullText.trim();
            console.log(`✅ Extracted ${extractedText.length} characters from PDF (${pdf.numPages} pages)`);
          } catch (pdfError) {
            console.error('Error extracting PDF text:', pdfError);
            extractedText = '[No se pudo extraer el texto del PDF]';
          }
        } else if (file.type === 'text/plain') {
          // For text files, read directly
          const textReader = new FileReader();
          extractedText = await new Promise<string>((resolve, reject) => {
            textReader.onload = () => resolve(textReader.result as string);
            textReader.onerror = reject;
            textReader.readAsText(file);
          });
        } else {
          // For Word docs, we can't extract text easily in browser
          extractedText = '[Documento Word - el contenido será procesado por el asistente]';
        }
        
        // Create the attachment with extracted text
        const newAttachment: Attachment = {
          type: 'file',
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          base64: base64String,
          extractedText: extractedText,
        };
        
        // Replace loading attachment with actual one
        setPendingAttachments(prev => 
          prev.filter(att => att.name !== loadingAttachment.name).concat(newAttachment)
        );
        
        console.log('File uploaded successfully:', {
          name: file.name,
          hasBase64: !!base64String,
          hasExtractedText: !!extractedText,
          textLength: extractedText.length
        });
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error al procesar el archivo. Por favor intenta de nuevo.');
        
        // Remove loading attachment
        setPendingAttachments(prev => 
          prev.filter(att => att.name !== loadingAttachment.name)
        );
      } finally {
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(pendingAttachments.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    setMicrophoneError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAttachment: Attachment = {
          type: 'audio',
          name: `Audio ${new Date().toLocaleTimeString('es-ES')}.webm`,
          url: audioUrl,
          size: audioBlob.size,
        };
        setPendingAttachments([...pendingAttachments, newAttachment]);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicrophoneError('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowAudioRecorder(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceInput = () => {
    setShowAudioRecorder(true);
    setShowAttachMenu(false);
  };

  const handleChatSelect = async (chatId: string) => {
    try {
      const { chat } = await chatApi.getChat(chatId);
      setCurrentChatId(chat.id);
      
      // Convert chat messages to Message format
      const formattedMessages: Message[] = chat.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        attachments: msg.attachments,
      }));
      
      setMessages(formattedMessages);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId);
    
    // Optimistic update: remove from UI immediately
    const chatToDelete = chatHistory.find(c => c.id === chatId);
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    
    try {
      await chatApi.deleteChat(chatId);
      
      // Show success message
      setDeleteToastMessage(`Chat "${chatToDelete?.title}" eliminado`);
      setTimeout(() => setDeleteToastMessage(null), 3000);
      
      // If deleted chat was current, create new one
      if (chatId === currentChatId) {
        const { chat } = await chatApi.createChat(
          specialty || 'MyPelvic',
          `Chat ${new Date().toLocaleDateString('es-ES')}`
        );
        setCurrentChatId(chat.id);
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      
      // Revert optimistic update on error
      if (chatToDelete) {
        setChatHistory(prev => [...prev, chatToDelete].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
      
      setDeleteToastMessage('Error al eliminar el chat');
      setTimeout(() => setDeleteToastMessage(null), 3000);
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleNewChat = async () => {
    try {
      const { chat } = await chatApi.createChat(
        specialty || 'MyPelvic',
        `Chat ${new Date().toLocaleDateString('es-ES')}`
      );
      setCurrentChatId(chat.id);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
      setShowHistory(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speakText = (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(messageId);
  };

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [editToastMessage, setEditToastMessage] = useState<string | null>(null);

  // Handler functions for message actions
  const handleCopyMessage = async (messageId: string, content: string) => {
    await copyToClipboard(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleLikeMessage = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        // Remove dislike if present
        setDislikedMessages(prevDislikes => {
          const newDislikes = new Set(prevDislikes);
          newDislikes.delete(messageId);
          return newDislikes;
        });
      }
      return newSet;
    });
  };

  const handleDislikeMessage = (messageId: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        // Remove like if present
        setLikedMessages(prevLikes => {
          const newLikes = new Set(prevLikes);
          newLikes.delete(messageId);
          return newLikes;
        });
      }
      return newSet;
    });
  };

  const handleShareMessage = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Respuesta del Chat Médico',
          text: content,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard(content);
      alert('Respuesta copiada al portapapeles');
    }
  };

  const handleRegenerateResponse = async (messageId: string) => {
    // Find the user message that triggered this AI response
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (previousUserMessage.role !== 'user') return;

    setRegeneratingMessageId(messageId);

    try {
      // Remove the old AI response
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setIsTyping(true);

      // Send the same user message again
      const { userMessage, aiMessage, chat } = await chatApi.sendMessage(
        currentChatId!,
        previousUserMessage.content,
        previousUserMessage.attachments
      );

      // Add new AI response
      setMessages(prev => [
        ...prev,
        {
          ...aiMessage,
          timestamp: new Date(aiMessage.timestamp),
        },
      ]);

    } catch (error) {
      console.error('Error regenerating response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al regenerar la respuesta. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setRegeneratingMessageId(null);
    }
  };

  const toggleSources = (messageId: string) => {
    if (showSourcesForMessage === messageId) {
      setShowSourcesForMessage(null);
    } else {
      setShowSourcesForMessage(messageId);
    }
  };

  const handleEditChatTitle = async () => {
    if (!editingChatId || !editingTitle.trim() || isSavingTitle) return;

    setIsSavingTitle(true);
    
    // Save original title for rollback on error
    const originalChat = chatHistory.find(c => c.id === editingChatId);
    const originalTitle = originalChat?.title || '';
    
    // Optimistic update: change title in UI immediately
    setChatHistory(prev => prev.map(c => 
      c.id === editingChatId 
        ? { ...c, title: editingTitle }
        : c
    ));
    
    // Exit edit mode immediately for better UX
    const savedChatId = editingChatId;
    const savedTitle = editingTitle;
    setEditingChatId(null);
    setEditingTitle('');

    try {
      await chatApi.updateChatTitle(savedChatId, savedTitle);
      
      // Show success message
      setEditToastMessage('Título actualizado correctamente');
      setTimeout(() => setEditToastMessage(null), 3000);
      
      // Refresh history to ensure sync with backend
      const { chats } = await chatApi.getChatHistory();
      const formattedHistory: ChatHistory[] = chats.map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        date: new Date(chat.lastUpdate),
      }));
      setChatHistory(formattedHistory);
      
    } catch (error) {
      console.error('Error updating chat title:', error);
      
      // Revert optimistic update on error
      setChatHistory(prev => prev.map(c => 
        c.id === savedChatId 
          ? { ...c, title: originalTitle }
          : c
      ));
      
      setEditToastMessage('Error al actualizar el título');
      setTimeout(() => setEditToastMessage(null), 3000);
    } finally {
      setIsSavingTitle(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header - Sticky para mantenerlo visible */}
      <div className={`sticky top-0 z-10 bg-gradient-to-br ${theme.gradient} p-4 flex items-center gap-3 text-white flex-shrink-0`}>
        <BackButton onClick={onBack} variant="white" />
        <div className="flex-1 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold">Chat Clínico</h1>
            <p className="text-xs text-white/80">Asistente especializado</p>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-2xl p-4 ${
                  message.role === 'user'
                    ? `bg-gradient-to-br ${theme.gradient} text-white`
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {message.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg overflow-hidden ${
                          message.role === 'user' ? 'bg-white/10' : 'bg-white'
                        }`}
                      >
                        {attachment.type === 'image' ? (
                          <div className="relative">
                            <img 
                              src={attachment.url || attachment.base64 || (attachment as any).data_url} 
                              alt={attachment.name}
                              className="w-full max-w-xs rounded-lg"
                            />
                            <div className={`mt-1 px-2 py-1 text-xs ${
                              message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              <Image className="w-3 h-3 inline mr-1" />
                              {attachment.name}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2">
                            {attachment.type === 'file' && <FileText className="w-4 h-4" />}
                            {attachment.type === 'audio' && <Volume2 className="w-4 h-4" />}
                            <span className="text-sm flex-1 truncate">{attachment.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <FormattedMessage content={message.content} isUser={message.role === 'user'} />
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {/* Show AI model badge for assistant messages */}
                {message.role === 'assistant' && message.model && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-200/30">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        xigma
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message actions for assistant messages */}
              {message.role === 'assistant' && (
                <div className="flex gap-1 mt-2 ml-2">
                  <button
                    onClick={() => speakText(message.content, message.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={speakingMessageId === message.id ? 'Detener' : 'Escuchar'}
                  >
                    {speakingMessageId === message.id ? (
                      <Pause className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyMessage(message.id, message.content)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copiar"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleLikeMessage(message.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Me gusta"
                  >
                    <ThumbsUp className={`w-4 h-4 ${
                      likedMessages.has(message.id) ? 'text-blue-600 fill-blue-600' : 'text-gray-600'
                    }`} />
                  </button>
                  <button
                    onClick={() => handleDislikeMessage(message.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="No me gusta"
                  >
                    <ThumbsDown className={`w-4 h-4 ${
                      dislikedMessages.has(message.id) ? 'text-red-600 fill-red-600' : 'text-gray-600'
                    }`} />
                  </button>
                  <button
                    onClick={() => handleShareMessage(message.content)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Compartir"
                  >
                    <Share className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleRegenerateResponse(message.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Regenerar respuesta"
                    disabled={regeneratingMessageId === message.id}
                  >
                    {regeneratingMessageId === message.id ? (
                      <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {/* ALWAYS show "Ver fuentes" button for ALL assistant messages */}
                  <button
                    onClick={() => toggleSources(message.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver fuentes"
                  >
                    <Globe className={`w-4 h-4 ${
                      showSourcesForMessage === message.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </button>
                </div>
              )}
              
              {/* Sources panel - ALWAYS show when clicked */}
              {message.role === 'assistant' && showSourcesForMessage === message.id && (() => {
                // Get RAG sources from message metadata
                const ragSources = message.metadata?.sources || message.metadata?.rag?.chunks || [];
                const actuallyUsedSources = message.metadata?.actually_used_sources === true;
                const hasRagSources = ragSources.length > 0 && actuallyUsedSources;
                const modelUsed = message.model || 'gpt-4o-mini';
                // 🔥 VISUAL: Mostrar "xigma" en lugar del modelo técnico real
                const modelDisplayName = 'xigma';
                
                return (
                  <div className="mt-3 ml-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">
                        Referencias Bibliográficas
                      </h4>
                    </div>
                    
                    {hasRagSources ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm text-green-900">
                            <strong>Fuente:</strong> Base de Conocimiento Médica de <strong>{specialty}</strong>
                          </p>
                        </div>
                        
                        <p className="text-sm text-blue-800">
                          Se encontraron <strong>{ragSources.length} referencias relevantes</strong> en nuestra base de datos especializada.
                        </p>
                        
                        <div className="space-y-2">
                          {ragSources.map((source: any, idx: number) => {
                            const similarity = source.similarity || 0;
                            const percentage = Math.round(similarity * 100);
                            
                            let badgeColor = 'bg-gray-100 text-gray-700';
                            let barColor = 'bg-gray-400';
                            if (percentage >= 85) {
                              badgeColor = 'bg-green-100 text-green-700';
                              barColor = 'bg-green-500';
                            } else if (percentage >= 70) {
                              badgeColor = 'bg-blue-100 text-blue-700';
                              barColor = 'bg-blue-500';
                            } else if (percentage >= 50) {
                              badgeColor = 'bg-yellow-100 text-yellow-700';
                              barColor = 'bg-yellow-500';
                            }
                            
                            return (
                              <div key={idx} className="p-3 bg-white border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-blue-900">
                                    Fuente {source.index || idx + 1}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                                    Relevancia: {percentage}%
                                  </span>
                                </div>
                                
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                                  <div 
                                    className={`h-full ${barColor} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                
                                {source.preview && (
                                  <p className="text-xs text-gray-700 mt-2 italic line-clamp-3">
                                    "{source.preview}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <strong>📚 Información:</strong> Estas fuentes provienen de nuestra base de conocimiento médica especializada, actualizada regularmente con literatura científica y guías clínicas.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Modelo: <strong>{modelDisplayName}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full"></div>
                          <p className="text-sm text-purple-900">
                            <strong>Fuente:</strong> Conocimiento Médico General <strong>{modelDisplayName}</strong>
                          </p>
                        </div>
                        
                        <p className="text-sm text-blue-800">
                          Esta respuesta se basa en el conocimiento médico general entrenado en el modelo de IA, que incluye información de fuentes médicas confiables hasta su última actualización.
                        </p>
                        
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-blue-900">El modelo se entrenó con información de:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2 text-xs text-blue-800">
                            <li>Guías clínicas internacionales</li>
                            <li>Literatura médica revisada por pares</li>
                            <li>Protocolos de práctica clínica</li>
                            <li>Bases de datos médicas especializadas</li>
                          </ul>
                        </div>
                        
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800">
                            <strong>💡 Nota:</strong> Esta información es educativa y de referencia general. Para información específica de {specialty}, recomendamos consultar con un profesional de la salud.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Modelo: <strong>{modelDisplayName}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions - only show when there are no messages */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {(getRandomSuggestions(specialty) || []).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // Set the message and send it automatically
                  setInputMessage(suggestion);
                  // Use setTimeout to ensure state is updated before sending
                  setTimeout(() => {
                    // Simulate clicking send by calling handleSendMessage with the suggestion
                    const sendSuggestion = async () => {
                      if (!currentChatId) return;
                      
                      setInputMessage('');
                      
                      // Reset textarea height
                      const textarea = document.querySelector('textarea');
                      if (textarea) {
                        textarea.style.height = 'auto';
                      }
                      
                      // Add user message to UI immediately
                      const tempUserMessage: Message = {
                        id: Date.now().toString(),
                        role: 'user',
                        content: suggestion,
                        timestamp: new Date(),
                      };
                      
                      setMessages(prev => [...prev, tempUserMessage]);
                      setIsTyping(true);
                      
                      try {
                        // Send message to backend and get AI response
                        const { userMessage, aiMessage, chat } = await chatApi.sendMessage(
                          currentChatId,
                          suggestion
                        );
                        
                        // Update messages with backend response
                        setMessages(prev => {
                          // Remove temp user message and add both messages from backend
                          const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id);
                          return [
                            ...withoutTemp,
                            {
                              ...userMessage,
                              timestamp: new Date(userMessage.timestamp),
                            },
                            {
                              ...aiMessage,
                              timestamp: new Date(aiMessage.timestamp),
                            },
                          ];
                        });

                        // If the chat title was updated (auto-generated), update the history
                        if (chat && chat.title) {
                          console.log('Updating chat title in history from suggestion:', chat.title);
                          setChatHistory(prev => prev.map(c => 
                            c.id === currentChatId 
                              ? { ...c, title: chat.title, date: new Date(chat.lastUpdate) }
                              : c
                          ));
                        }
                      } catch (error) {
                        console.error('Error sending message:', error);
                        
                        // Add error message
                        const errorMessage: Message = {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
                          timestamp: new Date(),
                        };
                        
                        setMessages(prev => [...prev, errorMessage]);
                      } finally {
                        setIsTyping(false);
                      }
                    };
                    
                    sendSuggestion();
                  }, 0);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full border-2 ${
                  specialty === 'MyPelvic'
                    ? 'border-teal-500 text-teal-700 hover:bg-teal-50'
                    : 'border-blue-500 text-blue-700 hover:bg-blue-50'
                } transition-colors text-sm whitespace-nowrap`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pending attachments */}
      {pendingAttachments.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto">
            {pendingAttachments.map((attachment, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 relative"
              >
                {attachment.type === 'image' ? (
                  <div className="relative">
                    <img 
                      src={attachment.url} 
                      alt={attachment.name}
                      className="h-20 w-20 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button 
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    {attachment.type === 'file' && <FileText className="w-4 h-4" />}
                    {attachment.type === 'audio' && <Volume2 className="w-4 h-4" />}
                    <span className="text-sm max-w-[120px] truncate">{attachment.name}</span>
                    <button onClick={() => removeAttachment(idx)}>
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <div className="px-4 pb-2">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium">
                {isRecording ? `Grabando ${formatRecordingTime(recordingTime)}` : 'Preparando...'}
              </span>
            </div>
            <div className="flex gap-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Detener
                </button>
              )}
              <button
                onClick={() => {
                  stopRecording();
                  setShowAudioRecorder(false);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {microphoneError && (
            <p className="text-red-600 text-sm mt-2">{microphoneError}</p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-auto"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              rows={1}
            />
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="absolute right-2 bottom-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`p-3 rounded-xl transition-colors ${
              inputMessage.trim() && !isTyping
                ? `bg-gradient-to-br ${theme.gradient} text-white hover:opacity-90`
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Attach menu */}
        {showAttachMenu && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Image className="w-4 h-4" />
              <span className="text-sm">Imagen</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">Archivo</span>
            </button>
            <button
              onClick={handleVoiceInput}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm">Audio</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Chat History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-4 border-b flex-shrink-0">
            <SheetTitle>Historial de Chats</SheetTitle>
            <SheetDescription>
              Tus conversaciones anteriores
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 flex-shrink-0 border-b">
            <button
              onClick={handleNewChat}
              className={`w-full py-3 px-4 bg-gradient-to-br ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
            >
              <Plus className="w-5 h-5" />
              Nuevo Chat
            </button>
          </div>

          <div className="p-4 flex-shrink-0 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar chats..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingHistory ? (
              <div className="space-y-2">
                {/* Skeleton loaders */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 rounded-xl border-2 border-gray-200 animate-pulse">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay chats guardados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-gray-300 group ${
                      chat.id === currentChatId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => editingChatId !== chat.id && handleChatSelect(chat.id)}
                  >
                    {editingChatId === chat.id ? (
                      // Edit mode
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditChatTitle();
                            } else if (e.key === 'Escape') {
                              setEditingChatId(null);
                              setEditingTitle('');
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={handleEditChatTitle}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          title="Guardar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingChatId(null);
                            setEditingTitle('');
                          }}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{chat.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {chat.date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setEditingTitle(chat.title);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar título"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar chat"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Toast Notification */}
      {deleteToastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-sm">{deleteToastMessage}</p>
          </div>
        </div>
      )}

      {/* Edit Toast Notification */}
      {editToastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-sm">{editToastMessage}</p>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
}