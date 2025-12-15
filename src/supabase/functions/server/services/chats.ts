/**
 * CHATS SERVICE
 * Gestiona chats y conversaciones
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Chat {
  id: string;
  user_id: string;
  specialty: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  attachments: any[];
  metadata: any;
  created_at: string;
}

/**
 * Get all chats for a user
 */
export async function getUserChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw new Error(`Failed to fetch chats: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific chat with its messages
 */
export async function getChat(chatId: string, userId: string): Promise<ChatWithMessages | null> {
  // Get chat
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .eq('user_id', userId)
    .single();

  if (chatError || !chat) {
    console.error('Error fetching chat:', chatError);
    return null;
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    return {
      ...chat,
      messages: []
    };
  }

  return {
    ...chat,
    messages: messages || []
  };
}

/**
 * Create a new chat
 */
export async function createChat(
  userId: string,
  specialty: string,
  title: string = 'Nueva conversación'
): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      specialty,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    return null;
  }

  return data;
}

/**
 * Update chat title
 */
export async function updateChatTitle(
  chatId: string,
  userId: string,
  title: string
): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat title:', error);
    return null;
  }

  return data;
}

/**
 * Update chat's updated_at timestamp
 */
export async function touchChat(chatId: string): Promise<void> {
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);
}

/**
 * Delete a chat (cascade deletes messages)
 */
export async function deleteChat(chatId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting chat:', error);
    return false;
  }

  return true;
}

/**
 * Archive a chat
 */
export async function archiveChat(chatId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chats')
    .update({ is_archived: true })
    .eq('id', chatId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error archiving chat:', error);
    return false;
  }

  return true;
}
