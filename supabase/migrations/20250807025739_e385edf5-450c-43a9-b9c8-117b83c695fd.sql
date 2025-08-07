-- Create function to send invitation emails
CREATE OR REPLACE FUNCTION public.handle_vault_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- The edge function will be called from the frontend after creating the invitation
  -- This trigger just ensures proper data handling
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;