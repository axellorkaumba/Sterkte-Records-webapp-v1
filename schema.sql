-- ============================================================
-- STERKTE RECORDS — SCHEMA SUPABASE
-- Coller dans : Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. PROFILES (extension de auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  artist_name TEXT,
  genre TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  role TEXT DEFAULT 'artist' CHECK (role IN ('artist', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, artist_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'artist_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ARTISTS (roster public du label)
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  streams TEXT DEFAULT '0',
  tracks_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TRACKS (morceaux distribués)
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT,
  release_date DATE,
  contributors TEXT,
  audio_url TEXT,
  cover_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'rejected')),
  streams INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  platforms_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. STUDIO BOOKINGS
CREATE TABLE public.studio_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  studio_type TEXT CHECK (studio_type IN ('sur-place', 'mobile')),
  duration_hours INT,
  booking_date DATE,
  address TEXT,
  message TEXT,
  estimated_price INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BOOKING REQUESTS (artistes/lieux)
CREATE TABLE public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  request_type TEXT CHECK (request_type IN ('artiste', 'lieu')),
  artist_name TEXT,
  event_type TEXT,
  event_date DATE,
  budget TEXT,
  location TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FEATURING REQUESTS
CREATE TABLE public.featuring_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  artist_name TEXT,
  project_name TEXT,
  deadline DATE,
  project_link TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featuring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ARTISTS: anyone can read (public roster)
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT TO anon, authenticated USING (true);

-- TRACKS: users see their own, can insert their own
CREATE POLICY "Users can view own tracks" ON public.tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracks" ON public.tracks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FORM TABLES: anyone can insert (public forms), only authenticated can view their own
CREATE POLICY "Anyone can submit studio booking" ON public.studio_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view own studio bookings" ON public.studio_bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit booking request" ON public.booking_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can submit featuring request" ON public.featuring_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- TESTIMONIALS: anyone can read featured
CREATE POLICY "Anyone can view featured testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (featured = true);

-- ============================================================
-- SEED DATA (artistes + témoignages initiaux)
-- ============================================================

INSERT INTO public.artists (name, tags, image_url, streams, tracks_count, featured) VALUES
  ('Eliel Luwala', '{"Afrobeat","Gospel"}', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=face', '245K', 12, true),
  ('Sarah Mbeki', '{"R&B"}', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop&crop=face', '189K', 8, true),
  ('DJ Katanga', '{"Amapiano","DJ"}', 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=600&fit=crop&crop=face', '520K', 24, true),
  ('Malu Beats', '{"Rap"}', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=600&fit=crop&crop=face', '312K', 16, true),
  ('Grace Tshala', '{"Rumba"}', 'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=600&h=600&fit=crop&crop=face', '156K', 6, true),
  ('Kenzo Flow', '{"Rap"}', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&crop=face', '410K', 19, true),
  ('Naya Kiese', '{"R&B","Afrobeat"}', 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=600&h=600&fit=crop&crop=face', '178K', 9, false),
  ('Tumba MC', '{"Rap"}', 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=600&h=600&fit=crop&crop=face', '267K', 14, false),
  ('Mukalay', '{"Gospel"}', 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&h=600&fit=crop&crop=face', '132K', 7, false),
  ('Shango Bass', '{"Amapiano","DJ"}', 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600&h=600&fit=crop&crop=face', '345K', 21, false),
  ('Liya Moon', '{"Afrobeat","R&B"}', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop&crop=face', '289K', 11, false),
  ('Papa Wemba Jr', '{"Rumba"}', 'https://images.unsplash.com/photo-1501386761578-0a55b6ea6e42?w=600&h=600&fit=crop&crop=face', '198K', 10, false);

INSERT INTO public.testimonials (name, role, text, featured) VALUES
  ('Eliel Luwala', 'Artiste Afrobeat', 'Sterkte Records a changé ma carrière. En 3 mois, mes streams ont été multipliés par 5 et ma musique est maintenant disponible partout dans le monde.', true),
  ('DJ Katanga', 'DJ / Producteur', 'Le studio est incroyable et l''équipe comprend vraiment la vision de l''artiste. Le suivi est transparent, les royalties arrivent chaque mois.', true),
  ('Grace Tshala', 'Artiste Rumba', 'Plus qu''un label, c''est une famille. Ils m''ont accompagnée du premier single jusqu''à mon premier concert sold-out à Lubumbashi.', true);

-- ============================================================
-- STORAGE BUCKETS (à créer manuellement dans Storage > New Bucket)
-- Noms : audio, covers, avatars
-- Tous publics en lecture, authentifiés en écriture
-- ============================================================
