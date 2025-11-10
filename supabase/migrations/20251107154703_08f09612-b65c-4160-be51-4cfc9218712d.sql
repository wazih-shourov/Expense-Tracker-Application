-- 1) Make profiles publicly readable for name/avatar display in feed and comments
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- 2) Enforce one vote per poll and block poll creator from voting
DROP POLICY IF EXISTS "Users can create their own votes" ON public.social_poll_votes;

CREATE POLICY "Users can create one vote per poll"
ON public.social_poll_votes
FOR INSERT
WITH CHECK (
  -- user owns their vote
  auth.uid() = user_id
  -- block poll creator from voting
  AND auth.uid() <> (
    SELECT sp.user_id
    FROM public.social_posts sp
    JOIN public.social_poll_options o3 ON o3.post_id = sp.id
    WHERE o3.id = social_poll_votes.poll_option_id
    LIMIT 1
  )
  -- enforce one vote per poll (not per option)
  AND NOT EXISTS (
    SELECT 1
    FROM public.social_poll_votes v
    JOIN public.social_poll_options o ON o.id = v.poll_option_id
    WHERE v.user_id = auth.uid()
      AND o.post_id = (
        SELECT o2.post_id
        FROM public.social_poll_options o2
        WHERE o2.id = social_poll_votes.poll_option_id
        LIMIT 1
      )
  )
);
