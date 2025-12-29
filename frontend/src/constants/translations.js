export const translations = {
  en: {
    nav: {
      dashboard: "DASHBOARD",
      chat: "AI ASSISTANT",
      files: "EXPLORER",
      settings: "CONFIGURATION"
    },
    topbar: {
      root_access: "ROOT ACCESS",
      model_select: "SELECT MODEL",
      ollama_online: "Ollama Online",
      offline: "Offline",
      checking: "Checking..."
    },
    // --- TRADUCTIONS DASHBOARD ---
    dash: {
      title: "DASHBOARD",
      subtitle: "Horizon Forge Neural Interface",
      coreStatus: "Core Status",
      readyForCompute: "Ready for Compute",
      processor: "Processor",
      memory: "Memory",
      vram: "Neural VRAM",
      suggestedUnits: "Suggested Units",
      initialize: "Initialize", // <--- AJOUTÉ
      systemOps: "System Operations",
      searchPlaceholder: "SEARCH UNIT...",
      noModelsFound: "No models found matching",
      // Stats Short
      cpu: "Processor",
      ram: "Memory",
      vram: "VRAM",
      // Descriptions
      llama_desc: "Versatile AI",
      mistral_desc: "Balanced Performance",
      deepseek_desc: "Advanced Reasoning",
      phi_desc: "Lightweight",
      qwen_desc: "Coding Expert",
      code_desc: "Dev Assistant",
      noModelsFound: "No models found matching",
      download: "Download",
      downloading: "Downloading...",
    
    // --- AJOUTÉ : MODÈLE PERSONNALISÉ ---
    custom_title: "ADD CUSTOM MODEL",
    custom_desc: "Download any model from the Ollama Hub by name (e.g., deepseek-coder:6.7b).",
    custom_placeholder: "ex: llama3.2:3b",
    btn_add: "DOWNLOAD"
    },
    // --- TRADUCTIONS CHAT ---
    chat: {
      database: "Database",
      new_session: "Initialize session",
      input_placeholder: "ENTER A SYSTEM REQUEST...",
      execute: "Execute",
      active_flux: "Active Flux...",
      image_attached: "Image Attached",
      add_media: "Add Media"
    },
    settings: {
      title: "CORE",
      subtitle: "SYSTEM CONFIGURATION",
      interface_title: "INTERFACE & LANGUAGE",
      lang_label: "System Language",
      internet_label: "AI Internet Access",
      init_title: "INITIALIZATION",
      startup_label: "Run at Startup",
      startup_sub: "Start with Windows",
      update_label: "Auto Updates",
      update_sub: "Check AI Cores",
      identity_title: "OPERATOR IDENTITY",
      name_label: "System Display Name",
      save_btn: "SAVE SETTINGS",
      syncing: "SYNCING...",
      success: "System synchronized successfully.",
      error: "Error: Core unreachable.",
      storage_title: "STORAGE",
      storage_desc: "Define the location of model files (.gguf).",
      storage_placeholder: "Default (C:\\Users\\...)\\.ollama\\models",
      storage_browse: "BROWSE"
    }
  },
  fr: {
    nav: {
      dashboard: "TABLEAU DE BORD",
      chat: "ASSISTANT IA",
      files: "EXPLORATEUR",
      settings: "CONFIGURATION"
    },
    topbar: {
      root_access: "ACCÈS ROOT",
      model_select: "CHOISIR MODÈLE",
      ollama_online: "Ollama en ligne",
      offline: "Hors ligne",
      checking: "Vérification..."
    },
    // --- TRADUCTIONS DASHBOARD ---
    dash: {
      title: "TABLEAU DE BORD",
      subtitle: "Interface Neurale Horizon Forge",
      coreStatus: "Statut du Noyau",
      readyForCompute: "Prêt pour Calcul",
      processor: "Processeur",
      memory: "Mémoire",
      vram: "VRAM Neurale",
      suggestedUnits: "Unités Suggérées",
      initialize: "Initialiser", // <--- AJOUTÉ
      systemOps: "Opérations Système",
      searchPlaceholder: "CHERCHER UNE UNITÉ...",
      noModelsFound: "Aucun modèle trouvé correspondant à",
      // Stats Short
      cpu: "Processeur",
      ram: "Mémoire",
      vram: "VRAM",
      // Descriptions
      llama_desc: "IA Polyvalente",
      mistral_desc: "Performance Équilibrée",
      deepseek_desc: "Raisonnement Avancé",
      phi_desc: "Léger et Rapide",
      qwen_desc: "Expert en Code",
      code_desc: "Assistant Développeur",
      noModelsFound: "Aucun modèle trouvé correspondant à",
      download: "Télécharger",
      downloading: "Téléchargement..."
    },
    // --- TRADUCTIONS CHAT ---
    chat: {
      database: "Base de données",
      new_session: "Initialiser session",
      input_placeholder: "ENTRER UNE REQUÊTE SYSTÈME...",
      execute: "Exécuter",
      active_flux: "Flux actif...",
      image_attached: "Image Attachée",
      add_media: "Ajouter média"
    },
    settings: {
      title: "CORE",
      subtitle: "CONFIGURATION SYSTÈME",
      interface_title: "INTERFACE & LANGUE",
      lang_label: "Langue du système",
      internet_label: "Accès Internet IA",
      init_title: "INITIALISATION",
      startup_label: "Lancement au démarrage",
      startup_sub: "Démarrer avec Windows",
      update_label: "Mises à jour Auto",
      update_sub: "Vérifier les Noyaux IA",
      identity_title: "IDENTITÉ DE L'OPÉRATEUR",
      name_label: "Nom d'affichage système",
      save_btn: "ENREGISTRER LES MODIFICATIONS",
      syncing: "SYNCHRONISATION...",
      success: "Configuration synchronisée avec succès.",
      error: "Erreur : Le noyau est injoignable.",
      storage_title: "STOCKAGE",
      storage_desc: "Définissez l'emplacement des fichiers de modèles (.gguf).",
      storage_placeholder: "Par défaut (C:\\Users\\...)\\.ollama\\models",
      storage_browse: "PARCOURIR"
    }
  }
};