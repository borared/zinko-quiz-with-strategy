const supabase = require('../lib/supabaseClient');

const createNotification = async (userId, type, message, metadata = null) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type: type,
      message: message,
      metadata: metadata,
      is_read: false,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getNotificationsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};

const markAsRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
};

const markAllAsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

const clearAllNotifications = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  clearAllNotifications
};
