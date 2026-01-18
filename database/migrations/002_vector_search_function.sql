-- Create RPC function for vector similarity search
-- This function is used by the RAG service to search for similar document chunks

CREATE OR REPLACE FUNCTION search_document_chunks(
    query_embedding vector(1536),
    match_limit int DEFAULT 10
)
RETURNS TABLE (
    chunk_text text,
    chunk_metadata jsonb,
    filename varchar,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.chunk_text,
        dc.chunk_metadata,
        d.filename,
        1 - (dc.embedding <=> query_embedding) as similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE d.processed = true
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_document_chunks(vector, int) TO authenticated;
GRANT EXECUTE ON FUNCTION search_document_chunks(vector, int) TO service_role;


