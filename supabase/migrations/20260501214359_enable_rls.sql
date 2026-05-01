-- Enable RLS on all public tables and allow public read access.
-- Writes go through Prisma (direct connection) which bypasses RLS.

ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.chambers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.races FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.pollsters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.sources FOR SELECT USING (true);
