import { getSupabase, isDemoMode } from '../supabase/client';

export type EvidenceLayer = 'public' | 'participant' | 'restricted';
export type EvidenceContext = 'network' | 'work' | 'roll';

export interface UploadResult {
  path: string;
  signedUrl: string;
  expiresAt: string;
}

export interface EvidenceFile {
  id: string;
  layer: EvidenceLayer;
  title: string;
  description: string | null;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

const BUCKETS: Record<EvidenceContext, string> = {
  network: 'network-evidence',
  work: 'work-evidence',
  roll: 'roll-evidence',
};

export async function uploadEvidence(
  context: EvidenceContext,
  layer: EvidenceLayer,
  file: File,
  metadata: { title: string; description?: string },
  userId: string
): Promise<UploadResult> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const bucket = BUCKETS[context];
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${layer}/${userId}/${timestamp}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Create signed URL (1 hour expiry)
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (urlError) throw new Error(`Signed URL failed: ${urlError.message}`);

  // Record in database (table depends on context)
  const table = context === 'network' ? 'evidence' : context === 'work' ? 'evidence' : 'evidence_files';
  const { error: dbError } = await supabase.from(table).insert({
    layer,
    title: metadata.title,
    description: metadata.description || null,
    storage_path: path,
    mime_type: file.type,
    file_size: file.size,
    uploaded_by: userId,
    uploaded_at: new Date().toISOString(),
    // Context-specific fields would be added here
  });

  if (dbError) {
    // Clean up uploaded file on DB error
    await supabase.storage.from(bucket).remove([path]);
    throw new Error(`Database record failed: ${dbError.message}`);
  }

  return {
    path,
    signedUrl: signedUrlData!.signedUrl,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}

export async function getEvidenceSignedUrl(
  context: EvidenceContext,
  path: string,
  expirySeconds = 3600
): Promise<string> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const bucket = BUCKETS[context];

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expirySeconds);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data!.signedUrl;
}

export async function getEvidencePublicUrl(
  context: EvidenceContext,
  path: string
): Promise<string> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const bucket = BUCKETS[context];

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteEvidence(
  context: EvidenceContext,
  path: string
): Promise<void> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const bucket = BUCKETS[context];

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function listEvidenceFiles(
  context: EvidenceContext,
  layer: EvidenceLayer,
  userId: string
): Promise<EvidenceFile[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const bucket = BUCKETS[context];
  const prefix = `${layer}/${userId}/`;

  const { data, error } = await supabase.storage.from(bucket).list(prefix);
  if (error) throw new Error(`List failed: ${error.message}`);

  return (data || []).map((file: { name: string; metadata?: { mimetype?: string; size?: number }; updated_at?: string }) => ({
    id: file.name,
    layer,
    title: file.name,
    description: null,
    storage_path: `${prefix}${file.name}`,
    mime_type: file.metadata?.mimetype || null,
    file_size: file.metadata?.size || null,
    uploaded_by: userId,
    uploaded_at: file.updated_at ? new Date(file.updated_at).toISOString() : new Date().toISOString(),
  }));
}
