const supabase = require('../lib/supabaseClient');

/**
 * Upsert a user into the Supabase users table.
 * Called when Clerk fires user.created or user.updated.
 */
const upsertUser = async (clerkUser) => {
  const primaryEmail = clerkUser.email_addresses?.find(
    (e) => e.id === clerkUser.primary_email_address_id
  )?.email_address ?? null;

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id:   clerkUser.id,
        email:      primaryEmail,
        first_name: clerkUser.first_name ?? null,
        last_name:  clerkUser.last_name ?? null,
        username:   clerkUser.username ?? null,
        avatar_url: clerkUser.image_url ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a user from the Supabase users table by their Clerk ID.
 */
const deleteUser = async (clerkId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', clerkId);

  if (error) throw error;
};

module.exports = { upsertUser, deleteUser };
