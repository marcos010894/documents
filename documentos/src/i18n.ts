import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


const lng = localStorage.getItem('lng') ? localStorage.getItem('lng') : 'pt'
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    // Login/Welcome
                    name_enterprise: 'to Globatty',
                    welcome: `Welcome <br /> to Salexpress`,
                    welcome_description_one: `Solutions for the Healthcare Market, perfect <br /> integration
                        between consultancy, advisory and technology <br /> for your
                        enterprise.`,
                    login_title: 'Access the system',
                    login_subtitle: "Don't have an account?",
                    register_text: 'Register',
                    password: 'password',
                    forgot_password: 'Forgot password',
                    capatcha_text: `  Protection by reCAPTCHA following the
                        <a className="text-red-600Active" href="#">
                        Privacy Terms
                        </a>
                        and
                        <a className="text-red-600Active" href="#">
                        GDPR
                        </a>
                        by Salexpress.`,

                    // Header
                    header: {
                        change_photo: 'Change photo',
                        logout: 'Logout',
                        language: 'Language',
                        profile: 'Profile'
                    },

                    // Menu lateral
                    menu: {
                        documents: 'Documents',
                        trash: 'Trash',
                        users: 'Users',
                        metrics: 'Metrics',
                        edit_info: 'Edit Info',
                        change_photo: 'Change Photo',
                        my_subscription: 'My Subscription'
                    },

                    // Dashboard / Page titles
                    dashboard: {
                        documents: 'Documents',
                        trash: 'Trash',
                        users: 'Users',
                        company_users: 'Company Users',
                        metrics: 'Metrics',
                        metrics_dashboard: 'Metrics Dashboard',
                        edit_info: 'Edit Info',
                        edit_page: 'Edit Page',
                        change_photo: 'Change Photo'
                    },

                    // Documents page
                    documents: {
                        title: 'Documents',
                        search_placeholder: 'Search files and folders...',
                        create_folder: 'Create Folder',
                        new_document: 'New Document',
                        folder: 'Folder',
                        document: 'Document',
                        loading: 'Loading...',
                        loading_files: 'Loading files...',
                        empty_folder: 'This folder is empty',
                        no_results: 'No results found',
                        try_adjust_filters: 'Try adjusting filters or search for other terms',
                        start_creating: 'Start by creating a new folder or document',
                        clear_filters: 'Clear filters',
                        items: 'items',
                        item: 'item',
                        items_in_folder: 'There are {{count}} items in this folder, but none match the current filters.',
                        found_in_all: 'found in all documents',
                        search_results: 'Search results',
                        grid_view: 'Grid',
                        list_view: 'List',
                        filters: 'Filters',
                        all: 'All',
                        shared_with_me: 'Shared with me',
                        shared_folder_notice: 'This folder contains files shared with you by other users'
                    },

                    // Trash page
                    trash: {
                        title: 'Trash',
                        refresh: 'Refresh',
                        empty_trash: 'Empty Trash',
                        search_placeholder: 'Search in trash...',
                        empty_message: '🎉 Trash is empty',
                        total_items: '📊 Total: {{count}} item(s) in trash',
                        loading: 'Loading...',
                        no_results: 'No items found with "{{search}}"',
                        name: 'Name',
                        type: 'Type',
                        size: 'Size',
                        deleted_at: 'Deleted at',
                        content: 'Content',
                        actions: 'Actions',
                        folder: 'Folder',
                        file: 'File',
                        items_count: '{{count}} item(s)',
                        restore: 'Restore',
                        delete_permanently: 'Delete',
                        confirm_restore: 'Do you want to restore "{{name}}"?',
                        confirm_delete: '⚠️ WARNING: Do you want to permanently delete "{{name}}"?\n\nThis action CANNOT be undone!',
                        confirm_delete_folder: 'This folder contains {{count}} item(s) that will also be deleted.',
                        confirm_final: '🚨 FINAL CONFIRMATION:\n\nAre you ABSOLUTELY SURE you want to permanently delete "{{name}}"?',
                        confirm_empty: '⚠️ WARNING: Do you want to permanently delete ALL items from the trash?\n\nThis action CANNOT be undone!',
                        confirm_empty_final: '🚨 FINAL CONFIRMATION:\n\nAre you ABSOLUTELY SURE you want to permanently delete ALL {{count}} item(s)?',
                        error_load: 'Error loading trash',
                        error_restore: 'Error restoring item',
                        error_delete: 'Error permanently deleting',
                        error_empty: 'Error emptying trash'
                    },

                    // File actions
                    actions: {
                        edit: 'Edit',
                        share: 'Share',
                        move: 'Move',
                        delete: 'Delete',
                        download: 'Download',
                        view: 'View',
                        follow: 'Follow document',
                        unfollow: 'Unfollow',
                        configure_alerts: 'Configure Alerts',
                        view_file: 'View File'
                    },

                    // File info
                    file_info: {
                        name: 'Name',
                        type: 'Type',
                        size: 'Size',
                        status: 'Status',
                        validity: 'Validity',
                        created_at: 'Created at',
                        comments: 'Comments',
                        followers: 'Followers',
                        shares: 'Shares',
                        information: 'Information',
                        file_info: 'File Information',
                        folder_info: 'Folder Information'
                    },

                    // Status
                    status: {
                        valid: 'Valid',
                        expired: 'Expired',
                        pending: 'Pending',
                        in_analysis: 'In Analysis',
                        approved: 'Approved',
                        rejected: 'Rejected',
                        archived: 'Archived'
                    },

                    // Users page
                    users: {
                        title: 'Company Users',
                        linked_freelancers: 'Freelancers Linked to Company',
                        collaborators: 'Collaborators with Specific Permissions',
                        collaborators_tip: '💡 Tip: Collaborators have their own login and customized permissions. Use this feature to give access to employees without sharing the main account.',
                        add_freelancer: 'Add Freelancer',
                        add_collaborator: 'Add Collaborator',
                        link_first_user: 'Link First User',
                        start_adding: 'Start by adding collaborators to your company',
                        email: 'Email',
                        name: 'Name',
                        type: 'Type',
                        status: 'Status',
                        linked_at: 'Linked at',
                        created_at: 'Created at',
                        permissions: 'Permissions',
                        actions: 'Actions',
                        active: 'Active',
                        inactive: 'Inactive',
                        manage_files: 'Manage Files',
                        view_metrics: 'View Metrics',
                        manage_collaborators: 'Manage Collaborators',
                        view_only: 'View Only',
                        pf: 'Individual',
                        pj: 'Company',
                        freelancer: 'Freelancer',
                        loading: 'Loading...',
                        no_users: 'No linked users',
                        no_users_desc: 'Add a freelancer to work with your company',
                        no_collaborators: 'No collaborators',
                        no_collaborators_desc: 'Create internal collaborators for your company',
                        error_load_users: 'Error loading users',
                        error_load_collaborators: 'Error loading collaborators',
                        confirm_remove: 'Do you want to remove the link with "{{name}}"?',
                        confirm_delete_collaborator: 'Do you want to delete collaborator "{{name}}"?\n\nThis action cannot be undone!',
                        user_linked_success: '✅ User {{email}} linked successfully!',
                        error_link_user: 'Error linking user',
                        error_remove_user: 'Error removing user',
                        error_delete_collaborator: 'Error deleting collaborator',
                        edit: 'Edit',
                        delete: 'Delete',
                        remove: 'Remove'
                    },

                    // Metrics page
                    metrics: {
                        title: 'Metrics Dashboard',
                        dashboard_title: '📊 Metrics Dashboard',
                        company_view: 'Company Overview',
                        user_view: 'Your Documents',
                        loading: 'Loading metrics...',
                        error_loading: 'Error Loading',
                        try_again: 'Try Again',
                        refresh: 'Refresh',
                        auto_refresh_on: 'Auto-refresh ON',
                        auto_refresh_off: 'Auto-refresh OFF',
                        total_files: 'Total Files',
                        total_folders: 'Total Folders',
                        storage_used: 'Storage Used',
                        storage_limit: 'Storage Limit',
                        storage_warning: 'Storage almost full!',
                        recent_activity: 'Recent Activity',
                        documents_by_status: 'Documents by Status',
                        expiring_soon: 'Expiring Soon',
                        no_data: 'No data available',
                        documents: 'documents',
                        folders: 'folders',
                        // Storage section
                        storage: 'Storage',
                        storage_usage: 'Storage usage',
                        critical_space: 'Critical space! Consider upgrading your plan.',
                        near_limit: 'Near storage limit.',
                        files: 'Files',
                        total_documents: 'Total documents',
                        operational_system: 'System operational',
                        total_folders_label: 'Folders',
                        organization_structure: 'Organization structure',
                        total_items: 'Total: {{count}} items',
                        items: 'items',
                        // Status distribution
                        status_distribution: 'Status Distribution',
                        quantity_by_status: 'Quantity by Status',
                        detail_by_status: 'Detail by Status',
                        no_documents_status: 'No documents with status',
                        no_documents_display: 'No documents to display',
                        status_detail: 'Status Detail',
                        status: 'Status',
                        color: 'Color',
                        quantity: 'Quantity',
                        percentage: 'Percentage',
                        last_update: 'Last update',
                        auto_refresh_active: 'Auto refresh active',
                        valid: 'Valid',
                        expired: 'Expired',
                        pending: 'Pending',
                        in_analysis: 'In Analysis'
                    },

                    // Modals
                    modals: {
                        // Create folder
                        create_folder: {
                            title: 'New Folder',
                            subtitle: 'Create a new folder in the directory',
                            location: 'Location',
                            name_label: 'Folder Name',
                            name_placeholder: 'Enter folder name...',
                            create_button: 'Create Folder',
                            creating: 'Creating...',
                            cancel: 'Cancel',
                            error_required: 'Folder name is required',
                            error_min_chars: 'Folder name must have at least 2 characters',
                            error_invalid_chars: 'Folder name contains invalid characters'
                        },
                        // Create document
                        create_document: {
                            title: 'New Document',
                            subtitle: 'Create a new document in the system',
                            title_label: 'Document Title',
                            title_placeholder: 'Enter the document title...',
                            name_label: 'Document Name',
                            name_placeholder: 'Enter document name',
                            file_label: 'Document File',
                            file_placeholder: 'Click to select a file',
                            file_types: 'PDF, DOC, DOCX, JPG, PNG (max. 10MB)',
                            file_selected: 'File selected: {{size}} MB',
                            status_label: 'Status',
                            validity_label: 'Validity Date',
                            comments_label: 'Comments',
                            comments_placeholder: 'Add comments about the document...',
                            create_button: 'Create Document',
                            creating: 'Creating...',
                            cancel: 'Cancel',
                            no_file_selected: 'No file selected',
                            error_title_required: 'Title is required',
                            error_validity_required: 'Validity date is required',
                            error_validity_past: 'Validity date cannot be in the past',
                            error_file_required: 'Select a file',
                            error_file_size: 'File must be at most 10MB',
                            error_file_type: 'File type not allowed. Accepted: PDF, Word, Excel, PowerPoint, CSV, XML, images, videos, audios, ZIP and RAR'
                        },
                        // File info
                        file_info: {
                            title: 'File Information',
                            folder_title: 'Folder Information',
                            subtitle: 'Details and available actions',
                            tab_info: 'Information',
                            tab_shares: 'Shares',
                            tab_followers: 'Followers',
                            tab_history: 'Movement History',
                            history: 'History',
                            name: 'Name',
                            type: 'Type',
                            size: 'Size',
                            status: 'Status',
                            validity: 'Validity',
                            created_at: 'Created at',
                            comments: 'Comments',
                            no_comments: 'No comments',
                            shared_with: 'Shared with',
                            no_shares: 'Not shared with anyone',
                            followers_list: 'Followers',
                            no_followers: 'No followers',
                            close: 'Close',
                            download: 'Download',
                            edit: 'Edit',
                            share: 'Share',
                            delete: 'Delete',
                            folder: 'Folder',
                            file: 'File'
                        },
                        // Configure alerts
                        configure_alerts: {
                            title: 'Configure Alerts',
                            description: 'Set up alerts for this document',
                            email_notifications: 'Email Notifications',
                            before_expiration: 'Before Expiration',
                            days_before: 'days before',
                            on_change: 'On Change',
                            notify_changes: 'Notify when document changes',
                            save: 'Save',
                            cancel: 'Cancel'
                        },
                        // Follow config modal
                        follow_config: {
                            title_configure: 'Configure Alerts',
                            title_follow: 'Follow Document',
                            subtitle_configure: 'Update notification settings',
                            subtitle_follow: 'Set when to receive alerts',
                            document: 'Document',
                            expires_at: 'Expires on',
                            days_before_label: 'How many days before expiration to alert?',
                            days: 'days',
                            days_help: 'Enter a value between 0 and 90 days. Use 0 for no advance alerts.',
                            quick_suggestions: 'Quick suggestions',
                            alert_on_expiration: 'Also alert on the expiration day',
                            alert_on_expiration_help: 'You will receive an alert on the day the document expires',
                            how_alerts_work: 'How do alerts work?',
                            alert_info_1: 'You will receive email notifications',
                            alert_info_2: 'Alerts are sent automatically',
                            alert_info_3: 'You can change these settings at any time',
                            update_config: 'Update Settings',
                            start_following: 'Start Following',
                            error_days_range: 'Days must be between 0 and 90'
                        },
                        // Collaborator
                        collaborator: {
                            new_title: 'New Collaborator',
                            edit_title: 'Edit Collaborator',
                            new_subtitle: 'Add a new member to your team',
                            edit_subtitle: 'Update collaborator information',
                            personal_data: 'Personal Data',
                            name_label: 'Full Name',
                            name_placeholder: 'Ex: John Smith',
                            email_label: 'Email',
                            email_placeholder: 'collaborator@company.com',
                            email_cannot_change: 'Email cannot be changed',
                            password_label: 'Password',
                            password_placeholder: 'Minimum 6 characters',
                            password_new_placeholder: 'Leave blank to keep current',
                            permissions_label: 'Permissions',
                            permission_manage_files: 'Manage Files',
                            permission_manage_files_desc: 'Upload, edit, delete and share files',
                            permission_view_metrics: 'View Company Metrics',
                            permission_view_metrics_desc: 'Access dashboard with company metrics',
                            permission_view_only: 'View Only',
                            permission_view_only_desc: 'Only view and download files (no editing)',
                            permission_manage_collaborators: 'Manage Collaborators',
                            permission_manage_collaborators_desc: 'Add and manage other collaborators',
                            permission_view_shared: 'View Shared Only',
                            permission_view_shared_desc: 'View only files shared specifically',
                            save: 'Save Changes',
                            create: 'Create Collaborator',
                            cancel: 'Cancel',
                            saving: 'Saving...',
                            creating: 'Creating...',
                            error_name_required: 'Name is required',
                            error_email_required: 'Email is required',
                            error_password_required: 'Password is required',
                            error_permission_required: 'Select at least one permission',
                            error_save: 'Error saving collaborator'
                        },
                        // Delete confirmation
                        delete_confirm: {
                            title: 'Confirm Deletion',
                            message: 'Are you sure you want to delete "{{name}}"?',
                            message_folder: 'Are you sure you want to delete folder "{{name}}" and all its contents?',
                            warning: 'This action cannot be undone!',
                            confirm: 'Delete',
                            cancel: 'Cancel',
                            deleting: 'Deleting...'
                        },
                        // Share modal
                        share: {
                            title: 'Share Document',
                            share_with: 'Share with',
                            email_placeholder: 'Enter email to share',
                            permission: 'Permission',
                            view_only: 'View Only',
                            can_edit: 'Can Edit',
                            share_button: 'Share',
                            sharing: 'Sharing...',
                            cancel: 'Cancel',
                            shared_with: 'Already shared with',
                            remove_share: 'Remove',
                            no_shares: 'Not shared with anyone yet'
                        }
                    },

                    // Common
                    common: {
                        loading: 'Loading...',
                        error: 'Error',
                        success: 'Success',
                        warning: 'Warning',
                        info: 'Information',
                        yes: 'Yes',
                        no: 'No',
                        ok: 'OK',
                        back: 'Back',
                        next: 'Next',
                        save: 'Save',
                        cancel: 'Cancel',
                        delete: 'Delete',
                        edit: 'Edit',
                        create: 'Create',
                        search: 'Search',
                        filter: 'Filter',
                        sort: 'Sort',
                        actions: 'Actions',
                        more: 'More',
                        less: 'Less',
                        all: 'All',
                        none: 'None',
                        select: 'Select',
                        selected: 'Selected',
                        total: 'Total',
                        status: 'Status'
                    }
                }
            },
            pt: {
                translation: {
                    // Login/Welcome
                    name_enterprise: 'a Globatty',
                    welcome: " Bem vindo(a) <br /> à Salexpress",
                    welcome_description_one: `Soluções para o Mercado de Saúde, a integração <br /> perfeita
                        entre consultoria, assessoria e tecnologia <br /> para sua
                        empresa.`,
                    login_title: 'Acessar o sistema',
                    login_subtitle: 'Não possui conta ?',
                    register_text: 'Cadastrar',
                    password: 'senha',
                    forgot_password: 'Esqueci a senha',
                    capatcha_text: `  Proteção por reCAPTCHA seguindo os
                        <a className="text-red-600Active" href="#">
                        Termos de Privacidade
                        </a>
                        e
                        <a className="text-red-600Active" href="#">
                        LGPD
                        </a>
                        da Salexpress.`,

                    // Header
                    header: {
                        change_photo: 'Trocar foto',
                        logout: 'Sair',
                        language: 'Idioma',
                        profile: 'Perfil'
                    },

                    // Menu lateral
                    menu: {
                        documents: 'Documentos',
                        trash: 'Lixeira',
                        users: 'Usuários',
                        metrics: 'Métricas',
                        edit_info: 'Editar Infos',
                        change_photo: 'Trocar Foto',
                        my_subscription: 'Minha Assinatura'
                    },

                    // Dashboard / Page titles
                    dashboard: {
                        documents: 'Documentos',
                        trash: 'Lixeira',
                        users: 'Usuários',
                        company_users: 'Usuários da Empresa',
                        metrics: 'Métricas',
                        metrics_dashboard: 'Dashboard de Métricas',
                        edit_info: 'Editar Infos',
                        edit_page: 'Editar Página',
                        change_photo: 'Trocar Foto'
                    },

                    // Documents page
                    documents: {
                        title: 'Documentos',
                        search_placeholder: 'Buscar arquivos e pastas...',
                        create_folder: 'Criar Pasta',
                        new_document: 'Novo Documento',
                        folder: 'Pasta',
                        document: 'Documento',
                        loading: 'Carregando...',
                        loading_files: 'Carregando arquivos...',
                        empty_folder: 'Esta pasta está vazia',
                        no_results: 'Nenhum resultado encontrado',
                        try_adjust_filters: 'Tente ajustar os filtros ou buscar por outros termos',
                        start_creating: 'Comece criando uma nova pasta ou documento',
                        clear_filters: 'Limpar filtros',
                        items: 'itens',
                        item: 'item',
                        items_in_folder: 'Existem {{count}} itens nesta pasta, mas nenhum corresponde aos filtros atuais.',
                        found_in_all: 'encontrados em todos os documentos',
                        search_results: 'Resultados da busca',
                        grid_view: 'Grade',
                        list_view: 'Lista',
                        filters: 'Filtros',
                        all: 'Todos',
                        shared_with_me: 'Compartilhados Comigo',
                        shared_folder_notice: 'Esta pasta contém arquivos compartilhados com você por outros usuários'
                    },

                    // Trash page
                    trash: {
                        title: 'Lixeira',
                        refresh: 'Atualizar',
                        empty_trash: 'Esvaziar Lixeira',
                        search_placeholder: 'Buscar na lixeira...',
                        empty_message: '🎉 A lixeira está vazia',
                        total_items: '📊 Total: {{count}} item(ns) na lixeira',
                        loading: 'Carregando...',
                        no_results: 'Nenhum item encontrado com "{{search}}"',
                        name: 'Nome',
                        type: 'Tipo',
                        size: 'Tamanho',
                        deleted_at: 'Deletado em',
                        content: 'Conteúdo',
                        actions: 'Ações',
                        folder: 'Pasta',
                        file: 'Arquivo',
                        items_count: '{{count}} item(ns)',
                        restore: 'Restaurar',
                        delete_permanently: 'Deletar',
                        confirm_restore: 'Deseja restaurar "{{name}}"?',
                        confirm_delete: '⚠️ ATENÇÃO: Deseja deletar permanentemente "{{name}}"?\n\nEsta ação NÃO PODE ser desfeita!',
                        confirm_delete_folder: 'Esta pasta contém {{count}} item(ns) que também serão deletados.',
                        confirm_final: '🚨 ÚLTIMA CONFIRMAÇÃO:\n\nTem ABSOLUTA CERTEZA que deseja deletar "{{name}}" permanentemente?',
                        confirm_empty: '⚠️ ATENÇÃO: Deseja deletar permanentemente TODOS os itens da lixeira?\n\nEsta ação NÃO PODE ser desfeita!',
                        confirm_empty_final: '🚨 ÚLTIMA CONFIRMAÇÃO:\n\nTem ABSOLUTA CERTEZA que deseja deletar permanentemente TODOS os {{count}} item(ns)?',
                        error_load: 'Erro ao carregar lixeira',
                        error_restore: 'Erro ao restaurar item',
                        error_delete: 'Erro ao deletar permanentemente',
                        error_empty: 'Erro ao esvaziar lixeira'
                    },

                    // File actions
                    actions: {
                        edit: 'Editar',
                        share: 'Compartilhar',
                        move: 'Mover',
                        delete: 'Deletar',
                        download: 'Baixar',
                        view: 'Visualizar',
                        follow: 'Seguir documento',
                        unfollow: 'Deixar de seguir',
                        configure_alerts: 'Configurar Alertas',
                        view_file: 'Ver Arquivo'
                    },

                    // File info
                    file_info: {
                        name: 'Nome',
                        type: 'Tipo',
                        size: 'Tamanho',
                        status: 'Status',
                        validity: 'Validade',
                        created_at: 'Criado em',
                        comments: 'Comentários',
                        followers: 'Seguidores',
                        shares: 'Compartilhamentos',
                        information: 'Informações',
                        file_info: 'Informações do Arquivo',
                        folder_info: 'Informações da Pasta'
                    },

                    // Status
                    status: {
                        valid: 'Válido',
                        expired: 'Expirado',
                        pending: 'Pendente',
                        in_analysis: 'Em Análise',
                        approved: 'Aprovado',
                        rejected: 'Rejeitado',
                        archived: 'Arquivado'
                    },

                    // Modals
                    modals: {
                        // Create folder
                        create_folder: {
                            title: 'Nova Pasta',
                            subtitle: 'Criar uma nova pasta no diretório',
                            location: 'Localização',
                            name_label: 'Nome da Pasta',
                            name_placeholder: 'Digite o nome da pasta...',
                            create_button: 'Criar Pasta',
                            creating: 'Criando...',
                            cancel: 'Cancelar',
                            error_required: 'Nome da pasta é obrigatório',
                            error_min_chars: 'Nome da pasta deve ter pelo menos 2 caracteres',
                            error_invalid_chars: 'Nome da pasta contém caracteres inválidos'
                        },
                        // Create document
                        create_document: {
                            title: 'Novo Documento',
                            subtitle: 'Criar um novo documento no sistema',
                            title_label: 'Título do Documento',
                            title_placeholder: 'Digite o título do documento...',
                            name_label: 'Nome do Documento',
                            name_placeholder: 'Digite o nome do documento',
                            file_label: 'Arquivo do Documento',
                            file_placeholder: 'Clique para selecionar um arquivo',
                            file_types: 'PDF, DOC, DOCX, JPG, PNG (máx. 10MB)',
                            file_selected: 'Arquivo selecionado: {{size}} MB',
                            status_label: 'Status',
                            validity_label: 'Data de Validade',
                            comments_label: 'Comentários',
                            comments_placeholder: 'Adicione comentários sobre o documento...',
                            create_button: 'Criar Documento',
                            creating: 'Criando...',
                            cancel: 'Cancelar',
                            no_file_selected: 'Nenhum arquivo selecionado',
                            error_title_required: 'Título é obrigatório',
                            error_validity_required: 'Data de validade é obrigatória',
                            error_validity_past: 'Data de validade não pode ser no passado',
                            error_file_required: 'Selecione um arquivo',
                            error_file_size: 'Arquivo deve ter no máximo 10MB',
                            error_file_type: 'Tipo de arquivo não permitido. Aceitos: PDF, Word, Excel, PowerPoint, CSV, XML, imagens, vídeos, áudios, ZIP e RAR'
                        },
                        // File info
                        file_info: {
                            title: 'Informações do Arquivo',
                            folder_title: 'Informações da Pasta',
                            subtitle: 'Detalhes e ações disponíveis',
                            tab_info: 'Informações',
                            tab_shares: 'Compartilhamentos',
                            tab_followers: 'Seguidores',
                            tab_history: 'Histórico de Movimentações',
                            history: 'Histórico',
                            name: 'Nome',
                            type: 'Tipo',
                            size: 'Tamanho',
                            status: 'Status',
                            validity: 'Validade',
                            created_at: 'Criado em',
                            comments: 'Comentários',
                            no_comments: 'Sem comentários',
                            shared_with: 'Compartilhado com',
                            no_shares: 'Não compartilhado com ninguém',
                            followers_list: 'Seguidores',
                            no_followers: 'Sem seguidores',
                            close: 'Fechar',
                            download: 'Baixar',
                            edit: 'Editar',
                            share: 'Compartilhar',
                            delete: 'Excluir',
                            folder: 'Pasta',
                            file: 'Arquivo'
                        },
                        // Configure alerts
                        configure_alerts: {
                            title: 'Configurar Alertas',
                            description: 'Configure alertas para este documento',
                            email_notifications: 'Notificações por Email',
                            before_expiration: 'Antes do Vencimento',
                            days_before: 'dias antes',
                            on_change: 'Ao Alterar',
                            notify_changes: 'Notificar quando o documento mudar',
                            save: 'Salvar',
                            cancel: 'Cancelar'
                        },
                        // Follow config modal
                        follow_config: {
                            title_configure: 'Configurar Alertas',
                            title_follow: 'Seguir Documento',
                            subtitle_configure: 'Atualizar configurações de notificação',
                            subtitle_follow: 'Configure quando receber alertas',
                            document: 'Documento',
                            expires_at: 'Vence em',
                            days_before_label: 'Alertar quantos dias antes do vencimento?',
                            days: 'dias',
                            days_help: 'Digite um valor entre 0 e 90 dias. Use 0 para não receber alertas antecipados.',
                            quick_suggestions: 'Sugestões rápidas',
                            alert_on_expiration: 'Alertar também no dia do vencimento',
                            alert_on_expiration_help: 'Você receberá um alerta no dia em que o documento vencer',
                            how_alerts_work: 'Como funcionam os alertas?',
                            alert_info_1: 'Você receberá notificações por email',
                            alert_info_2: 'Alertas são enviados automaticamente',
                            alert_info_3: 'Você pode alterar essas configurações a qualquer momento',
                            update_config: 'Atualizar Configurações',
                            start_following: 'Começar a Seguir',
                            error_days_range: 'Dias deve estar entre 0 e 90'
                        },
                        // Collaborator
                        collaborator: {
                            new_title: 'Novo Colaborador',
                            edit_title: 'Editar Colaborador',
                            new_subtitle: 'Adicione um novo membro à sua equipe',
                            edit_subtitle: 'Atualize as informações do colaborador',
                            personal_data: 'Dados Pessoais',
                            name_label: 'Nome Completo',
                            name_placeholder: 'Ex: João Silva',
                            email_label: 'Email',
                            email_placeholder: 'colaborador@empresa.com',
                            email_cannot_change: 'O email não pode ser alterado',
                            password_label: 'Senha',
                            password_placeholder: 'Mínimo 6 caracteres',
                            password_new_placeholder: 'Deixe em branco para manter a atual',
                            permissions_label: 'Permissões',
                            permission_manage_files: 'Gerenciar Arquivos',
                            permission_manage_files_desc: 'Upload, editar, deletar e compartilhar arquivos',
                            permission_view_metrics: 'Ver Métricas da Empresa',
                            permission_view_metrics_desc: 'Acessar dashboard com métricas da empresa',
                            permission_view_only: 'Apenas Visualização',
                            permission_view_only_desc: 'Apenas visualizar e baixar arquivos (sem editar)',
                            permission_manage_collaborators: 'Gerenciar Colaboradores',
                            permission_manage_collaborators_desc: 'Adicionar e gerenciar outros colaboradores',
                            permission_view_shared: 'Ver Apenas Compartilhados',
                            permission_view_shared_desc: 'Ver apenas arquivos compartilhados especificamente',
                            save: 'Salvar Alterações',
                            create: 'Criar Colaborador',
                            cancel: 'Cancelar',
                            saving: 'Salvando...',
                            creating: 'Criando...',
                            error_name_required: 'Nome é obrigatório',
                            error_email_required: 'Email é obrigatório',
                            error_password_required: 'Senha é obrigatória',
                            error_permission_required: 'Selecione ao menos uma permissão',
                            error_save: 'Erro ao salvar colaborador'
                        },
                        // Delete confirmation
                        delete_confirm: {
                            title: 'Confirmar Exclusão',
                            message: 'Tem certeza que deseja excluir "{{name}}"?',
                            message_folder: 'Tem certeza que deseja excluir a pasta "{{name}}" e todo seu conteúdo?',
                            warning: 'Esta ação não pode ser desfeita!',
                            confirm: 'Excluir',
                            cancel: 'Cancelar',
                            deleting: 'Excluindo...'
                        },
                        // Share modal
                        share: {
                            title: 'Compartilhar Documento',
                            share_with: 'Compartilhar com',
                            email_placeholder: 'Digite o email para compartilhar',
                            permission: 'Permissão',
                            view_only: 'Apenas Visualizar',
                            can_edit: 'Pode Editar',
                            share_button: 'Compartilhar',
                            sharing: 'Compartilhando...',
                            cancel: 'Cancelar',
                            shared_with: 'Já compartilhado com',
                            remove_share: 'Remover',
                            no_shares: 'Ainda não compartilhado com ninguém'
                        }
                    },

                    // Users page
                    users: {
                        title: 'Usuários da Empresa',
                        linked_freelancers: 'Freelancers vinculados à Empresa',
                        collaborators: 'Colaboradores com Permissões Específicas',
                        collaborators_tip: '💡 Dica: Colaboradores possuem login próprio e permissões personalizadas. Use esta funcionalidade para dar acesso a funcionários sem compartilhar a conta principal.',
                        add_freelancer: 'Adicionar Freelancer',
                        add_collaborator: 'Adicionar Colaborador',
                        link_first_user: 'Vincular Primeiro Usuário',
                        start_adding: 'Comece adicionando colaboradores à sua empresa',
                        email: 'Email',
                        name: 'Nome',
                        type: 'Tipo',
                        status: 'Status',
                        linked_at: 'Vinculado em',
                        created_at: 'Criado em',
                        permissions: 'Permissões',
                        actions: 'Ações',
                        active: 'Ativo',
                        inactive: 'Inativo',
                        manage_files: 'Gerenciar Arquivos',
                        view_metrics: 'Ver Métricas',
                        manage_collaborators: 'Gerenciar Colaboradores',
                        view_only: 'Apenas Visualizar',
                        pf: 'Pessoa Física',
                        pj: 'Pessoa Jurídica',
                        freelancer: 'Freelancer',
                        loading: 'Carregando...',
                        no_users: 'Nenhum usuário vinculado',
                        no_users_desc: 'Adicione um freelancer para trabalhar com sua empresa',
                        no_collaborators: 'Nenhum colaborador',
                        no_collaborators_desc: 'Crie colaboradores internos para sua empresa',
                        error_load_users: 'Erro ao carregar usuários',
                        error_load_collaborators: 'Erro ao carregar colaboradores',
                        confirm_remove: 'Deseja remover o vínculo com "{{name}}"?',
                        confirm_delete_collaborator: 'Deseja excluir o colaborador "{{name}}"?\n\nEsta ação não pode ser desfeita!',
                        user_linked_success: '✅ Usuário {{email}} vinculado com sucesso!',
                        error_link_user: 'Erro ao vincular usuário',
                        error_remove_user: 'Erro ao remover usuário',
                        error_delete_collaborator: 'Erro ao excluir colaborador',
                        edit: 'Editar',
                        delete: 'Excluir',
                        remove: 'Remover'
                    },

                    // Metrics page
                    metrics: {
                        title: 'Dashboard de Métricas',
                        dashboard_title: '📊 Dashboard de Métricas',
                        company_view: 'Visão Geral da Empresa',
                        user_view: 'Seus Documentos',
                        loading: 'Carregando métricas...',
                        error_loading: 'Erro ao Carregar',
                        try_again: 'Tentar Novamente',
                        refresh: 'Atualizar',
                        auto_refresh_on: 'Auto-refresh ON',
                        auto_refresh_off: 'Auto-refresh OFF',
                        total_files: 'Total de Arquivos',
                        total_folders: 'Total de Pastas',
                        storage_used: 'Armazenamento Usado',
                        storage_limit: 'Limite de Armazenamento',
                        storage_warning: 'Armazenamento quase cheio!',
                        recent_activity: 'Atividade Recente',
                        documents_by_status: 'Documentos por Status',
                        expiring_soon: 'Vencendo em Breve',
                        no_data: 'Nenhum dado disponível',
                        documents: 'documentos',
                        folders: 'pastas',
                        // Storage section
                        storage: 'Armazenamento',
                        storage_usage: 'Uso de armazenamento',
                        critical_space: 'Espaço crítico! Considere aumentar seu plano.',
                        near_limit: 'Próximo do limite de armazenamento.',
                        files: 'Arquivos',
                        total_documents: 'Total de documentos',
                        operational_system: 'Sistema operacional',
                        total_folders_label: 'Pastas',
                        organization_structure: 'Estrutura de organização',
                        total_items: 'Total: {{count}} itens',
                        items: 'itens',
                        // Status distribution
                        status_distribution: 'Distribuição por Status',
                        quantity_by_status: 'Quantidade por Status',
                        detail_by_status: 'Detalhamento por Status',
                        no_documents_status: 'Nenhum documento com status',
                        no_documents_display: 'Nenhum documento para exibir',
                        status_detail: 'Detalhamento por Status',
                        status: 'Status',
                        color: 'Cor',
                        quantity: 'Quantidade',
                        percentage: 'Percentual',
                        last_update: 'Última atualização',
                        auto_refresh_active: 'Atualização automática ativa',
                        valid: 'Válido',
                        expired: 'Expirado',
                        pending: 'Pendente',
                        in_analysis: 'Em Análise'
                    },

                    // Common
                    common: {
                        loading: 'Carregando...',
                        error: 'Erro',
                        success: 'Sucesso',
                        warning: 'Atenção',
                        info: 'Informação',
                        yes: 'Sim',
                        no: 'Não',
                        ok: 'OK',
                        back: 'Voltar',
                        next: 'Próximo',
                        save: 'Salvar',
                        cancel: 'Cancelar',
                        delete: 'Excluir',
                        edit: 'Editar',
                        create: 'Criar',
                        search: 'Buscar',
                        filter: 'Filtrar',
                        sort: 'Ordenar',
                        actions: 'Ações',
                        more: 'Mais',
                        less: 'Menos',
                        all: 'Todos',
                        none: 'Nenhum',
                        select: 'Selecionar',
                        selected: 'Selecionado',
                        total: 'Total',
                        status: 'Status'
                    }
                }
            },
        },
        lng: lng ? lng : 'pt', // idioma padrão
        fallbackLng: "en", // idioma de fallback
        interpolation: {
            escapeValue: false, // React já faz a segurança contra XSS
        },
    });

export default i18n;
