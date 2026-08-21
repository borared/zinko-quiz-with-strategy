export function getOptimizedImageUrl(url, width = 640) {
  if (!url) return url;
  
  // If it's a Supabase storage url, convert `/object/public/` to `/render/image/public/`
  // and append width and quality parameters
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return url.replace('/object/public/', '/render/image/public/') + `?width=${width}&quality=80`;
  }
  return url;
}
