/**
 * MESSAGES SERVICE
 * Gestiona mensajes del chat
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// TODO: centralize Supabase client when server config can share the common instance.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

/**
 * Add a new message to a chat
 */
export async function addMessage(message: {
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  attachments?: any[];
  metadata?: any;
}): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: message.chat_id,
      role: message.role,
      content: message.content,
      model: message.model || null,
      attachments: message.attachments || [],
      metadata: message.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    return null;
  }

  return data;
}

/**
 * Get a specific message
 */
export async function getMessage(messageId: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error) {
    console.error('Error fetching message:', error);
    return null;
  }

  return data;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return false;
  }

  return true;
}

/**
 * Update message content
 */
export async function updateMessage(
  messageId: string,
  updates: Partial<Pick<Message, 'content' | 'metadata'>>
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating message:', error);
    return null;
  }

  return data;
}

/**
 * Get message count for a chat
 */
export async function getMessageCount(chatId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error counting messages:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get user message count (first user message check for title generation)
 */
export async function getUserMessageCount(chatId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('role', 'user');

  if (error) {
    console.error('Error counting user messages:', error);
    return 0;
  }

  return count || 0;
}
