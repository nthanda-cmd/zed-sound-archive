export type Genre = 'kalindula' | 'traditional' | 'pop_pre_2000' | 'pop_modern';
export type UserRole = 'admin' | 'manager' | 'curator' | 'user';

export interface Song {
  id: string;
  title: string;
  artistId: string;
  genre: Genre;
  chordsGuitar?: string;
  chordsPiano?: string;
  lyricsOriginal?: string;
  lyricsTranslation?: string;
  sheetMusicUrl?: string;
  mediaUrl: string;
  mediaType: 'audio' | 'video';
  createdAt: any;
  createdBy: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  photoUrl?: string;
  genres: string[];
}

export interface CurationApp {
  id: string;
  userId: string;
  email: string;
  statement: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  category: 'theory' | 'history' | 'instruments';
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
}
