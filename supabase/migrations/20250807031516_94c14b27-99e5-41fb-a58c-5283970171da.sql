-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.handle_vault_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- The edge function will be called from the frontend after creating the invitation
  -- This trigger just ensures proper data handling
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update other functions to fix search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_vaults(p_user_id uuid)
RETURNS TABLE(id uuid, name text, type text, created_at timestamp with time zone, owner_id uuid)
AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.name, v.type, v.created_at, v.owner_id
  FROM public.vaults v
  LEFT JOIN public.vault_members m ON v.id = m.vault_id
  WHERE v.owner_id = p_user_id OR m.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to increment share link view count
CREATE OR REPLACE FUNCTION public.increment_share_link_views(link_token text)
RETURNS void AS $$
BEGIN
  UPDATE public.shared_links 
  SET views_used = COALESCE(views_used, 0) + 1
  WHERE token = link_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for timestamp updates on vault_share_links (shared_links)
CREATE TRIGGER update_shared_links_timestamp
  BEFORE UPDATE ON public.shared_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Create trigger for timestamp updates on vault_invitations
CREATE TRIGGER update_vault_invitations_timestamp
  BEFORE UPDATE ON public.vault_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();