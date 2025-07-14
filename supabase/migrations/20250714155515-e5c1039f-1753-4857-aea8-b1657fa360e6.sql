
-- Drop unnecessary tables that aren't needed for Kroc-BI
DROP TABLE IF EXISTS public.patents CASCADE;

-- Drop the profiles table since we're not using it for additional user info
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop the handle_new_user function since we removed the profiles table
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Remove the patents storage bucket since it's not needed
DELETE FROM storage.buckets WHERE id = 'patents';

-- Clean up any storage policies for the patents bucket
DROP POLICY IF EXISTS "Users can upload their own patent files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own patent files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own patent files" ON storage.objects;
