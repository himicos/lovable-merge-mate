import { supabase } from '../src/integrations/supabase/client.js';

async function testSecrets() {
    // First try to insert the secrets
    const { error: insertError } = await supabase
        .from('secrets')
        .insert({
            google_client_id: '562799503198-htoarels9474s1ifa2tagc0htt804vm8.apps.googleusercontent.com',
            google_client_secret: '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',
            google_redirect_uri: 'https://lovable-merge-mate.onrender.com/auth/gmail/callback'
        });

    if (insertError) {
        console.error('Error inserting secrets:', insertError);
        return;
    }

    // Now try to fetch them
    const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching secrets:', error);
        return;
    }

    console.log('Secrets found:', data);
}

testSecrets();
