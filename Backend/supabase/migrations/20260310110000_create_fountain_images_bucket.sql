-- Create a public storage bucket for fountain images
insert into storage.buckets (id, name, public)
values ('fountain-images', 'fountain-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload fountain images
-- Path convention: fountain-images/<user_id>/<filename>
create policy "Authenticated users can upload fountain images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fountain-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own fountain images
create policy "Users can update their own fountain images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'fountain-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to read fountain images (they are public)
create policy "Fountain images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'fountain-images');

-- Allow users to delete their own fountain images
create policy "Users can delete their own fountain images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fountain-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
