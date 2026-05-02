-- Drop old RLS migration's policies (tables are gone) and add new for mayor schema.
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.cities   FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.races    FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.pollsters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.polls    FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.sources  FOR SELECT USING (true);
