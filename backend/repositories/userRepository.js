const supabase = require('../lib/supabaseClient');

/**
 * Upsert a user into the Supabase users table.
 * Called when Clerk fires user.created or user.updated.
 */
const upsertUser = async (clerkUser) => {
  // Handle both webhook format (snake_case) and API format (camelCase)
  let primaryEmail = null;
  
  if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
    // API format: emailAddresses[].emailAddress
    const primaryEmailObj = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    );
    primaryEmail = primaryEmailObj?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;
  } else if (clerkUser.email_addresses && clerkUser.email_addresses.length > 0) {
    // Webhook format: email_addresses[].email_address
    const primaryEmailObj = clerkUser.email_addresses.find(
      (e) => e.id === clerkUser.primary_email_address_id
    );
    primaryEmail = primaryEmailObj?.email_address || clerkUser.email_addresses[0]?.email_address;
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id:   clerkUser.id,
        email:      primaryEmail,
        first_name: clerkUser.first_name || clerkUser.firstName || null,
        last_name:  clerkUser.last_name || clerkUser.lastName || null,
        username:   clerkUser.username || null,
        avatar_url: clerkUser.image_url || clerkUser.imageUrl || null,
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

const getUserByClerkId = async (clerkId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // ignore not found
  return data;
};

module.exports = { upsertUser, deleteUser, getUserByClerkId };
