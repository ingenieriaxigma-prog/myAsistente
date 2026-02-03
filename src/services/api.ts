import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabaseClient';
import type { Attachment, Message } from '../types';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-baa51d6b`;

type ApiCallOptions = RequestInit & {
  accessTokenOverride?: string;
};

// Helper to get auth header - allows override to skip session fetch when ya se tiene el token
async function getAuthHeader(accessTokenOverride?: string): Promise<string> {
  if (accessTokenOverride) {
    return `Bearer ${accessTokenOverride}`;
  }

  try {
    // Try to get the session with a simple approach
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      console.log('[getAuthHeader] Using session token');
      return `Bearer ${session.access_token}`;
    } else {
      console.log('[getAuthHeader] No session, using anon key');
      return `Bearer ${publicAnonKey}`;
    }
  } catch (error) {
    console.error('[getAuthHeader] Error, using anon key fallback:', error);
    return `Bearer ${publicAnonKey}`;
  }
}

// Helper for API calls
async function apiCall(endpoint: string, options: ApiCallOptions = {}) {
  try {
    console.log(`[apiCall] Starting API call to: ${endpoint}`);
    
    console.log(`[apiCall] Getting auth header...`);
    const authHeader = await getAuthHeader(options.accessTokenOverride);
    console.log(`[apiCall] Auth header obtained:`, authHeader.substring(0, 20) + '...');
    
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[apiCall] Full URL: ${fullUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    console.log(`[apiCall] Making fetch request...`);
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[apiCall] Response status: ${response.status}`);
    const data = await response.json();
    console.log(`[apiCall] Response data:`, data);

    if (!response.ok) {
      console.error(`[apiCall] API Error (${endpoint}):`, data);
      
      // Check for JWT/auth errors - auto-logout and clear session
      if (
        data.error?.includes('JWT') || 
        data.error?.includes('does not exist') ||
        data.error?.includes('Unauthorized') ||
        response.status === 401
      ) {
        console.warn('🔴 Invalid session detected - clearing auth and reloading...');
        
        // Clear Supabase session
        await supabase.auth.signOut();
        
        // Clear localStorage completely
        localStorage.clear();
        
        // Reload page to reset state
        window.location.href = '/';
        
        // Throw error to stop execution
        throw new Error('Sesión inválida. Por favor inicia sesión nuevamente.');
      }
      
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error(`[apiCall] Exception caught:`, error);
    
    if (error.name === 'AbortError') {
      console.error('[apiCall] Request timeout - server did not respond in 30 seconds');
      throw new Error('Request timeout. Please check your internet connection or try again later.');
    }
    
    console.error(`[apiCall] API call failed:`, error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  // Sign up with email/password
  async signup(email: string, password: string, name: string, specialty?: string) {
    console.log('API: Sending signup request to backend...');
    try {
      // For signup, we always use the public anon key (no session needed)
      const fullUrl = `${API_BASE_URL}/auth/signup`;
      console.log('[signup] Direct call to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, specialty }),
      });

      console.log('[signup] Response status:', response.status);
      const result = await response.json();
      console.log('[signup] Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      console.log('API: Signup successful:', result);
      return result;
    } catch (error) {
      console.error('API: Signup failed:', error);
      throw error;
    }
  },

  // Sign in with email/password
  async signIn(email: string, password: string) {
    console.log('[signIn] Starting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[signIn] Supabase auth error:', error);
      
      // Check for specific error types
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email o contraseña incorrectos');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Email no confirmado. Por favor contacta al soporte.');
      } else {
        throw new Error(error.message);
      }
    }

    if (!data.session) {
      console.error('[signIn] No session returned after sign in');
      throw new Error('No se pudo crear la sesión. Por favor intenta de nuevo.');
    }

    console.log('[signIn] Sign in successful:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      accessToken: data.session?.access_token ? 'exists' : 'missing',
      userEmail: data.user?.email,
    });

    return data;
  },

  // Sign in with OAuth (Google, Apple, etc.)
  async signInWithOAuth(provider: 'google' | 'apple' | 'github' | 'facebook') {
    // NOTE: To enable OAuth providers, you must configure them in your Supabase project
    // Follow instructions at: https://supabase.com/docs/guides/auth/social-login
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(`OAuth ${provider} sign in error:`, error);
      throw new Error(error.message);
    }

    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return data.session;
  },

  // Get user profile
  async getProfile(accessTokenOverride?: string) {
    return apiCall('/auth/profile', {
      method: 'GET',
      accessTokenOverride,
    });
  },

  // Update user profile
  async updateProfile(updates: any) {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ============================================
// CHAT API
// ============================================

export const chatApi = {
  // Create new chat
  async createChat(specialty: string, title?: string) {
    return apiCall('/chats', {
      method: 'POST',
      body: JSON.stringify({ specialty, title }),
    });
  },

  // Get chat history
  async getChatHistory() {
    return apiCall('/chats', {
      method: 'GET',
    });
  },

  // Get specific chat
  async getChat(chatId: string) {
    return apiCall(`/chat/${chatId}`, {
      method: 'GET',
    });
  },

  // Send message and get AI response
  async sendMessage(chatId: string, message: string, attachments?: Attachment[], useRAG: boolean = true): Promise<{ userMessage: Message; aiMessage: Message; chat: any; rag?: any }> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token || publicAnonKey;
    console.log('📤 Sending message to chat:', { chatId, hasAttachments: !!attachments, attachmentsCount: attachments?.length, useRAG });
    
    // Map attachments to backend format
    const formattedAttachments = (attachments || []).map(att => {
      const formatted = {
        type: att.type,
        name: att.name,
        url: att.url,
        size: att.size,
        data_url: att.base64, // Backend expects data_url instead of base64
        extractedText: att.extractedText,
        mimeType: att.mimeType,
        storagePath: att.storagePath,
      };
      
      if (att.type === 'image' && att.base64) {
        console.log(`📷 Preparing image for backend: ${att.name} (${Math.round(att.base64.length / 1024)}KB)`);
      }
      
      return formatted;
    });
    
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        message, 
        attachments: formattedAttachments,
        useRAG  // Enable RAG by default
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error sending message:', errorData);
      throw new Error(errorData.message || errorData.error || 'Failed to send message');
    }

    const data = await response.json();
    console.log('✅ Message sent successfully');
    
    // Log RAG information if enabled
    if (data.rag?.enabled) {
      console.log(`🔍 RAG: Found ${data.rag.chunks_found} relevant chunks from knowledge base`);
      console.log('📚 RAG Sources:', data.rag.chunks);
    }
    
    // Log model information prominently
    if (data.modelUsed) {
      console.log(`🤖 AI Model Used: ${data.modelUsed}`);
      console.log(`📊 Model metadata:`, data.aiMessage?.metadata);
    }
    
    return data;
  },

  // Delete chat
  async deleteChat(chatId: string) {
    return apiCall(`/chat/${chatId}`, {
      method: 'DELETE',
    });
  },

  // Update chat title
  async updateChatTitle(chatId: string, title: string) {
    return apiCall(`/chat/${chatId}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },
};

// ============================================
// DIAGNOSIS API
// ============================================

export const diagnosisApi = {
  // Save diagnosis
  async saveDiagnosis(diagnosisData: any) {
    return apiCall('/diagnosis/save', {
      method: 'POST',
      body: JSON.stringify(diagnosisData),
    });
  },

  // Get diagnosis history
  async getDiagnosisHistory() {
    return apiCall('/diagnosis/history', {
      method: 'GET',
    });
  },

  // Get specific diagnosis
  async getDiagnosis(diagnosisId: string) {
    return apiCall(`/diagnosis/${diagnosisId}`, {
      method: 'GET',
    });
  },
};

// ============================================
// TREATMENT API
// ============================================

export const treatmentApi = {
  // Create treatment plan
  async createTreatment(treatmentData: any) {
    return apiCall('/treatment/create', {
      method: 'POST',
      body: JSON.stringify(treatmentData),
    });
  },

  // Get treatment plans
  async getTreatments() {
    return apiCall('/treatment/list', {
      method: 'GET',
    });
  },

  // Update treatment progress
  async updateProgress(treatmentId: string, exerciseId: string, completed: boolean, date: string, notes?: string) {
    return apiCall(`/treatment/${treatmentId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ exerciseId, completed, date, notes }),
    });
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  // Get user statistics
  async getStats() {
    return apiCall('/admin/stats', {
      method: 'GET',
    });
  },
};

// Export Supabase client for direct use if needed
export { supabase };
