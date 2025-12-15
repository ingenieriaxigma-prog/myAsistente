// Setup Supabase Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req) => {
  try {
    /* --------------------------------------------------
     * 1. Validar método
     * -------------------------------------------------- */
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 })
    }

    /* --------------------------------------------------
     * 2. Leer token del header
     * -------------------------------------------------- */
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return new Response("Missing Authorization header", { status: 401 })
    }

    const jwt = authHeader.replace("Bearer ", "")

    /* --------------------------------------------------
     * 3. Crear cliente Supabase (con JWT del usuario)
     * -------------------------------------------------- */
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    )

    /* --------------------------------------------------
     * 4. Obtener usuario autenticado
     * -------------------------------------------------- */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    /* --------------------------------------------------
     * 5. Verificar rol (SOLO superadmin)
     * -------------------------------------------------- */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return new Response("Profile not found", { status: 403 })
    }

    if (profile.role !== "superadmin") {
      return new Response("Forbidden: superadmin only", { status: 403 })
    }

    /* --------------------------------------------------
     * 6. Leer payload
     * -------------------------------------------------- */
    const body = await req.json()

    const {
      title,
      content,
      specialty,
      source_type = "internal", // internal | openai
    } = body

    if (!title || !content || !specialty) {
      return new Response(
        "Missing required fields: title, content, specialty",
        { status: 400 }
      )
    }

    /* --------------------------------------------------
     * 7. Insertar documento
     * -------------------------------------------------- */
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        title,
        content,
        specialty,
        source_type,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error(insertError)
      return new Response("Failed to insert document", { status: 500 })
    }

    /* --------------------------------------------------
     * 8. Respuesta exitosa
     * -------------------------------------------------- */
    return new Response(
      JSON.stringify({
        message: "Document ingested successfully ✅",
        document_id: document.id,
        uploaded_by: profile.email,
        specialty,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (err) {
    console.error(err)
    return new Response("Internal Server Error", { status: 500 })
  }
})
