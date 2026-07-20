export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      area_services: {
        Row: {
          area_id: string;
          service_id: string;
        };
        Insert: {
          area_id: string;
          service_id: string;
        };
        Update: {
          area_id?: string;
          service_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "area_services_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "area_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      areas: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          created_at: string;
          entity_id: string | null;
          entity_table: string;
          id: number;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_table: string;
          id?: never;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_table?: string;
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      capabilities: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          created_at: string;
          id: string;
          industry_id: string | null;
          is_published: boolean;
          logo_path: string | null;
          name: string;
          slug: string;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          industry_id?: string | null;
          is_published?: boolean;
          logo_path?: string | null;
          name: string;
          slug: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          industry_id?: string | null;
          is_published?: boolean;
          logo_path?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_industry_id_fkey";
            columns: ["industry_id"];
            isOneToOne: false;
            referencedRelation: "industries";
            referencedColumns: ["id"];
          }
        ];
      };
      form_fields: {
        Row: {
          field_key: string;
          field_type: string;
          form_id: string;
          id: string;
          is_required: boolean;
          label: string;
          options: Json | null;
          sort_order: number;
        };
        Insert: {
          field_key: string;
          field_type: string;
          form_id: string;
          id?: string;
          is_required?: boolean;
          label: string;
          options?: Json | null;
          sort_order?: number;
        };
        Update: {
          field_key?: string;
          field_type?: string;
          form_id?: string;
          id?: string;
          is_required?: boolean;
          label?: string;
          options?: Json | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey";
            columns: ["form_id"];
            isOneToOne: false;
            referencedRelation: "forms";
            referencedColumns: ["id"];
          }
        ];
      };
      form_submissions: {
        Row: {
          form_id: string;
          id: string;
          payload: Json;
          source_path: string | null;
          submitted_at: string;
        };
        Insert: {
          form_id: string;
          id?: string;
          payload: Json;
          source_path?: string | null;
          submitted_at?: string;
        };
        Update: {
          form_id?: string;
          id?: string;
          payload?: Json;
          source_path?: string | null;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey";
            columns: ["form_id"];
            isOneToOne: false;
            referencedRelation: "forms";
            referencedColumns: ["id"];
          }
        ];
      };
      forms: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          success_message: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          success_message?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          success_message?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      industries: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      lead_events: {
        Row: {
          actor_id: string | null;
          created_at: string;
          event_type: string;
          from_status: Database["public"]["Enums"]["lead_status"] | null;
          id: string;
          lead_id: string;
          metadata: Json;
          to_status: Database["public"]["Enums"]["lead_status"] | null;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          event_type: string;
          from_status?: Database["public"]["Enums"]["lead_status"] | null;
          id?: string;
          lead_id: string;
          metadata?: Json;
          to_status?: Database["public"]["Enums"]["lead_status"] | null;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          event_type?: string;
          from_status?: Database["public"]["Enums"]["lead_status"] | null;
          id?: string;
          lead_id?: string;
          metadata?: Json;
          to_status?: Database["public"]["Enums"]["lead_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "lead_events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_events_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };
      leads: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string | null;
          notes: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          submission_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          notes?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          submission_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          notes?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          submission_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: true;
            referencedRelation: "form_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      media_assets: {
        Row: {
          alt_text: string | null;
          bucket_id: string;
          created_at: string;
          id: string;
          is_published: boolean;
          mime_type: string;
          object_path: string;
          size_bytes: number;
        };
        Insert: {
          alt_text?: string | null;
          bucket_id: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          mime_type: string;
          object_path: string;
          size_bytes: number;
        };
        Update: {
          alt_text?: string | null;
          bucket_id?: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          mime_type?: string;
          object_path?: string;
          size_bytes?: number;
        };
        Relationships: [];
      };
      navigation_items: {
        Row: {
          href: string;
          id: string;
          is_published: boolean;
          label: string;
          menu_id: string;
          parent_id: string | null;
          sort_order: number;
        };
        Insert: {
          href: string;
          id?: string;
          is_published?: boolean;
          label: string;
          menu_id: string;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: {
          href?: string;
          id?: string;
          is_published?: boolean;
          label?: string;
          menu_id?: string;
          parent_id?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "navigation_menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "navigation_items";
            referencedColumns: ["id"];
          }
        ];
      };
      navigation_menus: {
        Row: {
          created_at: string;
          id: string;
          is_published: boolean;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      page_sections: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          page_id: string;
          section_type: string;
          sort_order: number;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          id?: string;
          page_id: string;
          section_type: string;
          sort_order?: number;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          page_id?: string;
          section_type?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      pages: {
        Row: {
          created_at: string;
          id: string;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description: string;
          id?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_areas: {
        Row: {
          area_id: string;
          project_id: string;
          relation_kind: Database["public"]["Enums"]["area_relation_kind"];
        };
        Insert: {
          area_id: string;
          project_id: string;
          relation_kind?: Database["public"]["Enums"]["area_relation_kind"];
        };
        Update: {
          area_id?: string;
          project_id?: string;
          relation_kind?: Database["public"]["Enums"]["area_relation_kind"];
        };
        Relationships: [
          {
            foreignKeyName: "project_areas_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_areas_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_capabilities: {
        Row: {
          capability_id: string;
          project_id: string;
        };
        Insert: {
          capability_id: string;
          project_id: string;
        };
        Update: {
          capability_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_capabilities_capability_id_fkey";
            columns: ["capability_id"];
            isOneToOne: false;
            referencedRelation: "capabilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_capabilities_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_links: {
        Row: {
          id: string;
          label: string;
          project_id: string;
          sort_order: number;
          url: string;
        };
        Insert: {
          id?: string;
          label: string;
          project_id: string;
          sort_order?: number;
          url: string;
        };
        Update: {
          id?: string;
          label?: string;
          project_id?: string;
          sort_order?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_media: {
        Row: {
          id: string;
          media_asset_id: string;
          project_id: string;
          role: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          media_asset_id: string;
          project_id: string;
          role?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          media_asset_id?: string;
          project_id?: string;
          role?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_media_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_media_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_services: {
        Row: {
          project_id: string;
          service_id: string;
        };
        Insert: {
          project_id: string;
          service_id: string;
        };
        Update: {
          project_id?: string;
          service_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_services_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      project_team: {
        Row: {
          credit_role: string | null;
          project_id: string;
          sort_order: number;
          team_member_id: string;
        };
        Insert: {
          credit_role?: string | null;
          project_id: string;
          sort_order?: number;
          team_member_id: string;
        };
        Update: {
          credit_role?: string | null;
          project_id?: string;
          sort_order?: number;
          team_member_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_team_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_team_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          body: Json;
          client_id: string | null;
          created_at: string;
          id: string;
          primary_area_id: string;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: Json;
          client_id?: string | null;
          created_at?: string;
          id?: string;
          primary_area_id: string;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: Json;
          client_id?: string | null;
          created_at?: string;
          id?: string;
          primary_area_id?: string;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_primary_area_id_fkey";
            columns: ["primary_area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          }
        ];
      };
      prototype_features: {
        Row: {
          description: string | null;
          id: string;
          prototype_id: string;
          sort_order: number;
          title: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          prototype_id: string;
          sort_order?: number;
          title: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          prototype_id?: string;
          sort_order?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prototype_features_prototype_id_fkey";
            columns: ["prototype_id"];
            isOneToOne: false;
            referencedRelation: "prototypes";
            referencedColumns: ["id"];
          }
        ];
      };
      prototype_media: {
        Row: {
          id: string;
          media_asset_id: string;
          prototype_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          media_asset_id: string;
          prototype_id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          media_asset_id?: string;
          prototype_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "prototype_media_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prototype_media_prototype_id_fkey";
            columns: ["prototype_id"];
            isOneToOne: false;
            referencedRelation: "prototypes";
            referencedColumns: ["id"];
          }
        ];
      };
      prototypes: {
        Row: {
          created_at: string;
          description: string | null;
          external_url: string | null;
          id: string;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      redirects: {
        Row: {
          created_at: string;
          destination_path: string;
          id: string;
          is_active: boolean;
          source_path: string;
          status_code: number;
        };
        Insert: {
          created_at?: string;
          destination_path: string;
          id?: string;
          is_active?: boolean;
          source_path: string;
          status_code?: number;
        };
        Update: {
          created_at?: string;
          destination_path?: string;
          id?: string;
          is_active?: boolean;
          source_path?: string;
          status_code?: number;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      seo_metadata: {
        Row: {
          canonical_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_path: string | null;
          page_id: string;
          robots: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          canonical_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          page_id: string;
          robots?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          canonical_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          page_id?: string;
          robots?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seo_metadata_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: true;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      services: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          is_public: boolean;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          id?: string;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          id?: string;
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          bio: string | null;
          created_at: string;
          id: string;
          is_published: boolean;
          name: string;
          portrait_path: string | null;
          role_title: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name: string;
          portrait_path?: string | null;
          role_title?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name?: string;
          portrait_path?: string | null;
          role_title?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          author_name: string;
          author_role: string | null;
          client_id: string | null;
          created_at: string;
          id: string;
          quote: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          author_name: string;
          author_role?: string | null;
          client_id?: string | null;
          created_at?: string;
          id?: string;
          quote: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          author_name?: string;
          author_role?: string | null;
          client_id?: string | null;
          created_at?: string;
          id?: string;
          quote?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      user_area_permissions: {
        Row: {
          area_id: string;
          can_edit: boolean;
          can_publish: boolean;
          user_id: string;
        };
        Insert: {
          area_id: string;
          can_edit?: boolean;
          can_publish?: boolean;
          user_id: string;
        };
        Update: {
          area_id?: string;
          can_edit?: boolean;
          can_publish?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_area_permissions_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_area_permissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          role_id: string;
          user_id: string;
        };
        Insert: {
          role_id: string;
          user_id: string;
        };
        Update: {
          role_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      area_relation_kind: "principal" | "complementaria";
      content_status: "borrador" | "revision" | "publicado" | "archivado";
      lead_status: "nuevo" | "contactado" | "calificado" | "descartado" | "convertido";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {}
  },
  public: {
    Enums: {
      area_relation_kind: ["principal", "complementaria"],
      content_status: ["borrador", "revision", "publicado", "archivado"],
      lead_status: ["nuevo", "contactado", "calificado", "descartado", "convertido"]
    }
  }
} as const;
