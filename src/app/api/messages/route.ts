
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Add a message to a conversation
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversation_id, role, content } = await req.json();
  if (!conversation_id || !role || !content) {
    return NextResponse.json({ error: 'conversation_id, role, and content are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id, role, content }])
    .select('id, conversation_id, role, content, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: data });
}
