
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "bookmarks": {
                  Row: {
                    "created_at": string,"id": number,"story_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"story_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"story_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "bookmarks_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookmarks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"comments": {
                  Row: {
                    "body": string,"created_at": string,"id": number,"post_id": number | null,"status": string,"story_id": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"id"?: number,"post_id"?: number | null,"status"?: string,"story_id": number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: number,"post_id"?: number | null,"status"?: string,"story_id"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "comments_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comments_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"genre_id_map": {
                  Row: {
                    "new_id": number,"old_slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "new_id": number,"old_slug": string
                  }
                  Update: {
                    "new_id"?: number,"old_slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"genres": {
                  Row: {
                    "created_at": string,"id": number,"is_active": boolean,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"is_active"?: boolean,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"is_active"?: boolean,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"genres_old": {
                  Row: {
                    "name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"notifications": {
                  Row: {
                    "actor_user_id": string | null,"comment_id": number | null,"created_at": string,"id": number,"is_read": boolean,"message": string | null,"post_id": number | null,"story_id": number | null,"type": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_user_id"?: string | null,"comment_id"?: number | null,"created_at"?: string,"id"?: number,"is_read"?: boolean,"message"?: string | null,"post_id"?: number | null,"story_id"?: number | null,"type": string,"user_id": string
                  }
                  Update: {
                    "actor_user_id"?: string | null,"comment_id"?: number | null,"created_at"?: string,"id"?: number,"is_read"?: boolean,"message"?: string | null,"post_id"?: number | null,"story_id"?: number | null,"type"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_actor_user_id_fkey"
      columns: ["actor_user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_comment_id_fkey"
      columns: ["comment_id"]
isOneToOne: false
      referencedRelation: "comments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"post_id_map": {
                  Row: {
                    "new_id": number,"old_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "new_id": number,"old_id": string
                  }
                  Update: {
                    "new_id"?: number,"old_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"posts": {
                  Row: {
                    "ai_prompt": string | null,"body": string,"created_at": string,"id": number,"image_url": string | null,"is_ai_assisted": boolean,"sequence_no": number,"status": string,"story_id": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ai_prompt"?: string | null,"body": string,"created_at"?: string,"id"?: number,"image_url"?: string | null,"is_ai_assisted"?: boolean,"sequence_no": number,"status"?: string,"story_id": number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "ai_prompt"?: string | null,"body"?: string,"created_at"?: string,"id"?: number,"image_url"?: string | null,"is_ai_assisted"?: boolean,"sequence_no"?: number,"status"?: string,"story_id"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"posts_old": {
                  Row: {
                    "author_id": string,"body": string,"created_at": string,"id": string,"position": number,"story_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"body": string,"created_at"?: string,"id"?: string,"position": number,"story_id": string
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"created_at"?: string,"id"?: string,"position"?: number,"story_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles_old"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_old_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories_old"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles_old": {
                  Row: {
                    "created_at": string,"display_name": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"id": string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reports": {
                  Row: {
                    "created_at": string,"detail": string | null,"handled_at": string | null,"handled_by": string | null,"id": number,"reason": string,"reporter_user_id": string,"status": string,"target_id": number,"target_type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"detail"?: string | null,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: number,"reason": string,"reporter_user_id": string,"status"?: string,"target_id": number,"target_type": string
                  }
                  Update: {
                    "created_at"?: string,"detail"?: string | null,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: number,"reason"?: string,"reporter_user_id"?: string,"status"?: string,"target_id"?: number,"target_type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reporter_user_id_fkey"
      columns: ["reporter_user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"stories": {
                  Row: {
                    "bookmarks_count": number,"cover_image_url": string | null,"created_at": string,"id": number,"last_posted_at": string | null,"latest_post_id": number | null,"likes_count": number,"posts_count": number,"status": string,"summary": string | null,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bookmarks_count"?: number,"cover_image_url"?: string | null,"created_at"?: string,"id"?: number,"last_posted_at"?: string | null,"latest_post_id"?: number | null,"likes_count"?: number,"posts_count"?: number,"status"?: string,"summary"?: string | null,"title": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "bookmarks_count"?: number,"cover_image_url"?: string | null,"created_at"?: string,"id"?: number,"last_posted_at"?: string | null,"latest_post_id"?: number | null,"likes_count"?: number,"posts_count"?: number,"status"?: string,"summary"?: string | null,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "stories_latest_post_id_fkey"
      columns: ["latest_post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stories_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"stories_old": {
                  Row: {
                    "author_id": string,"created_at": string,"genre_slug": string,"id": string,"synopsis": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"created_at"?: string,"genre_slug": string,"id"?: string,"synopsis"?: string | null,"title": string
                  }
                  Update: {
                    "author_id"?: string,"created_at"?: string,"genre_slug"?: string,"id"?: string,"synopsis"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "stories_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles_old"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stories_genre_slug_fkey"
      columns: ["genre_slug"]
isOneToOne: false
      referencedRelation: "genres_old"
      referencedColumns: ["slug"]
    }
                  ]
                },"story_genres": {
                  Row: {
                    "created_at": string,"genre_id": number,"id": number,"story_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"genre_id": number,"id"?: number,"story_id": number
                  }
                  Update: {
                    "created_at"?: string,"genre_id"?: number,"id"?: number,"story_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_genres_genre_id_fkey"
      columns: ["genre_id"]
isOneToOne: false
      referencedRelation: "genres"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "story_genres_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    }
                  ]
                },"story_id_map": {
                  Row: {
                    "new_id": number,"old_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "new_id": number,"old_id": string
                  }
                  Update: {
                    "new_id"?: number,"old_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"story_likes": {
                  Row: {
                    "created_at": string,"id": number,"story_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"story_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"story_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_likes_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "story_likes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"story_summaries": {
                  Row: {
                    "created_at": string,"id": string,"story_id": number,"summarized_until_position": number,"summary": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"story_id": number,"summarized_until_position": number,"summary": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"story_id"?: number,"summarized_until_position"?: number,"summary"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_summaries_story_id_fkey1"
      columns: ["story_id"]
isOneToOne: true
      referencedRelation: "stories"
      referencedColumns: ["id"]
    }
                  ]
                },"story_summaries_old": {
                  Row: {
                    "created_at": string,"id": string,"story_id": string,"summarized_until_position": number,"summary": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"story_id": string,"summarized_until_position": number,"summary": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"story_id"?: string,"summarized_until_position"?: number,"summary"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_summaries_story_id_fkey"
      columns: ["story_id"]
isOneToOne: true
      referencedRelation: "stories_old"
      referencedColumns: ["id"]
    }
                  ]
                },"story_writing_locks": {
                  Row: {
                    "created_at": string,"expires_at": string,"story_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at": string,"story_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string,"story_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_writing_locks_story_id_fkey1"
      columns: ["story_id"]
isOneToOne: true
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "story_writing_locks_user_id_fkey1"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"story_writing_locks_old": {
                  Row: {
                    "created_at": string,"expires_at": string,"story_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at": string,"story_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string,"story_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_writing_locks_story_id_fkey"
      columns: ["story_id"]
isOneToOne: true
      referencedRelation: "stories_old"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "story_writing_locks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles_old"
      referencedColumns: ["id"]
    }
                  ]
                },"users": {
                  Row: {
                    "bio": string | null,"created_at": string,"email": string,"icon_url": string | null,"id": string,"name": string,"role": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"created_at"?: string,"email": string,"icon_url"?: string | null,"id": string,"name": string,"role"?: string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "bio"?: string | null,"created_at"?: string,"email"?: string,"icon_url"?: string | null,"id"?: string,"name"?: string,"role"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "acquire_story_writing_lock":
{ Args: { "p_story_id": number }; Returns: boolean
                           },
"can_delete_post":
{ Args: { "p_post_id": number }; Returns: boolean
                           },
"can_edit_post":
{ Args: { "p_post_id": number }; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
