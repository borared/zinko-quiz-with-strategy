const supabase = require('../lib/supabaseClient');

const AvatarRepository = {
  // Fetch all avatars
  getAllAvatars: async () => {
    const { data, error } = await supabase
      .from('avatars')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  }
};

module.exports = AvatarRepository;
