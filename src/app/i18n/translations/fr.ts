export const fr = {
  nav: {
    playground: 'Playground',
    agentkit: 'AgentKit',
    mcp: 'MCP',
    apiDocs: 'Documentation API'
  },
  hero: {
    badge: 'Disponible sur Base 🔵',
    titleLine1: 'L\'A&R automatisé pour la',
    titleHighlight: 'nouvelle économie musicale.',
    subtitle: 'Des réseaux de neurones qui écoutent, analysent et catégorisent vos morceaux en 20 secondes. Paiement à l\'usage via le',
    subtitleHighlight: 'protocole x402',
    testButton: 'Tester l\'Analyseur',
    devButton: 'Pour les Développeurs'
  },
  story: {
    quote: '"Le processus d\'A&R est dépassé. Nous l\'avons repensé."',
    content: 'En tant qu\'artiste, j\'ai envoyé d\'innombrables maquettes restées sans réponse. En tant que cofondateur de label, j\'en ai compris la cause : le goulot d\'étranglement de l\'écoute. Tag-per-Track n\'est pas qu\'un outil ; c\'est une solution technique conçue par un musicien pour débloquer l\'industrie.'
  },
  playground: {
    title: 'Tag-per-Track',
    subtitle: 'Analyse Audio Musicale Conçue pour les Agents IA',
    sectionTitle: 'Essayez par vous-même',
    sectionDescription: 'Glissez un fichier audio ci-dessous. Connectez votre portefeuille sur',
    sectionDescriptionHighlight: 'Base',
    sectionDescriptionEnd: 'pour régler le micro-paiement x402 (0.05 USDC). Chaque signature et analyse est exécutée en temps réel on-chain.',
    connectWallet: 'Connecter Wallet',
    disconnect: 'Déconnecter',
    dropTitle: 'Déposez votre morceau',
    dropSubtitle: 'ou cliquez pour parcourir vos fichiers',
    or: 'OU',
    urlPlaceholder: 'Collez l\'URL d\'un fichier audio distant...',
    targetUrl: 'URL Cible',
    clearUrl: 'Effacer l\'URL',
    readyForTagging: 'Prêt pour le tagging neuronal',
    removeTrack: 'Supprimer le morceau',
    extractLyrics: 'Extraire les Paroles',
    lyricsPrice: '(0.10 USDC)',
    btnAnalyze: 'Analyser le morceau',
    btnSignAndAnalyze: 'Signer & Analyser',
    btnWorking: 'Traitement en cours...',
    analyzeAnother: 'Analyser un autre morceau',
    paymentValidated: 'Paiement Validé',
    viewOnBasescan: 'VOIR SUR BASESCAN',
    taggingInProgress: 'Tagging en cours...',
    taggingDescription: 'Le traitement neuronal prend environ 20 secondes. Extraction du BPM, de la clé et des genres.',
    invoice: {
      title: 'Paiement Requis',
      subtitle: 'Micro-paiement via Coinbase CDP (USDC)',
      amount: 'Montant',
      network: 'Réseau',
      destination: 'Destination',
      signButton: 'Signer & Régler avec x402'
    },
    steps: {
      fetching: '📡 Récupération de la piste audio...',
      paymentVerified: '🧠 Paiement vérifié ! Écoute neuronale et analyse en cours...',
      awaitingSignature: '✍️ En attente de votre signature Web3 (Sans frais de gaz)...'
    },
    errors: {
      invalidFile: 'Veuillez sélectionner un fichier audio valide (mp3, wav, ogg, etc.).',
      invalidUrl: 'Veuillez saisir une URL valide (incluant http:// ou https://).',
      unsupportedDomain: 'L\'analyse directe de {domain} n\'est pas prise en charge. Veuillez fournir un lien direct vers un fichier audio brut.',
      webpageNotAudio: 'Le lien semble pointer vers une page web et non un fichier audio.',
      selectFileOrUrl: 'Veuillez sélectionner un fichier ou saisir une URL audio.',
      couldNotConnect: 'Impossible de connecter le portefeuille.',
      paymentFailed: 'Le paiement a échoué ou a été annulé.',
      genericAnalysisError: 'L\'analyse a échoué. Veuillez vérifier l\'URL et réessayer.'
    }
  },
  result: {
    title: 'Intelligence Audio',
    tabVibe: 'Ambiance & Style',
    tabLyrics: 'Paroles',
    tempo: 'Tempo (BPM)',
    key: 'Tonalité Musicale',
    genres: 'Genres Détectés',
    dominantMood: 'Humeur Dominante',
    lowConfidence: 'Faible Confiance',
    highConfidence: 'Forte Confiance',
    instrumentation: 'Instrumentation',
    copyLyrics: 'Copier les Paroles',
    unknown: 'Inconnu'
  },
  dev: {
    title: 'Intégrez Tag-per-Track',
    subtitle: 'Choisissez la meilleure façon d\'équiper vos agents IA d\'une intelligence musicale de pointe.',
    sdk: {
      badge: 'Pour les Développeurs JS',
      title: 'Donnez des oreilles à votre Agent IA.',
      description: 'Le SDK tag-per-track-agentkit s\'intègre nativement à LangChain et gère le flux de paiement x402 de manière transparente. Permettez à vos agents d\'évaluer la musique on-chain sans friction.',
      features: [
        'Résolution automatique du challenge x402',
        'Génération de preuve de paiement EIP-712',
        'Extraction fluide des métadonnées musicales'
      ],
      terminalTitle: 'Installation du SDK',
      comment: '# Logique de paiement gérée en interne via Coinbase CDP'
    },
    mcp: {
      badge: 'Pour les Utilisateurs de LLM',
      title: 'Pay-to-Listen Autonome',
      description: 'Permettez à vos LLMs locaux (Claude Desktop, etc.) d\'analyser la musique en toute autonomie. Le serveur MCP Tag-per-Track gère le protocole de paiement x402 on-chain sans intervention humaine.',
      toolAnalyzeTitle: 'analyze_audio',
      toolAnalyzeDesc: 'Outil pour extraire le BPM, la clé, l\'humeur et le genre depuis n\'importe quelle URL.',
      toolX402Title: 'x402 Intégré',
      toolX402Desc: 'Signature EIP-3009 automatisée pour l\'USDC sur Base.',
      badgeVersion: 'MCP V1.0',
      badgeNpm: 'Disponible sur NPM',
      copyConfig: 'Copier la Config',
      copied: 'Copié !'
    }
  },
  footer: {
    builtOn: 'Bâti sur Base. Conçu pour la Musique.'
  },
  scales: {
    minor: 'mineur',
    major: 'majeur'
  }
};
