import { createAdminClient } from '@/lib/supabase/server'

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'yec-private-submissions'

/**
 * Ensures the private submission bucket exists in Supabase Storage.
 * Creates it if it doesn't already exist.
 */
export async function ensureSubmissionsBucket() {
  try {
    const supabase = createAdminClient()
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error || !buckets) {
      console.warn('Could not list storage buckets:', error)
      return
    }

    const bucketExists = buckets.some((b) => b.name === BUCKET_NAME)

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
      })

      if (createError) {
        console.warn('Notice creating storage bucket:', createError.message)
      } else {
        console.log(`Created private bucket "${BUCKET_NAME}" successfully`)
      }
    }
  } catch (err) {
    console.warn('Bucket check exception:', err)
  }
}

/**
 * Uploads a submission file to Supabase Storage.
 */
export async function uploadSubmissionFile({
  teamId,
  stage,
  file,
}: {
  teamId: string
  stage: 'BMC' | 'PITCHING'
  file: File
}): Promise<{ path: string; error?: string }> {
  try {
    await ensureSubmissionsBucket()

    const supabase = createAdminClient()
    const fileExt = file.name.split('.').pop() || 'file'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const storagePath = `submissions/${teamId}/${stage.toLowerCase()}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      return { path: '', error: error.message }
    }

    return { path: data.path }
  } catch (err: any) {
    console.error('Upload exception:', err)
    return { path: '', error: err.message || 'Gagal mengunggah file ke storage' }
  }
}

